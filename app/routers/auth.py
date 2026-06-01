import io
import base64
import uuid

import pyotp
import qrcode

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.db.models.user import User
from app.core.dependencies import get_current_user

from app.schemas.auth import (
    UserRegister,
    Token,
)

from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_temp_token,
    decode_temp_token,
)

from app.schemas.two_factor import (
    TwoFactorSetupResponse,
    TwoFactorVerifyRequest,
    TwoFactorLoginRequest,
    LoginWithTwoFactorResponse,
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


# ──────────────────────────────────────────────
# REGISTER
# ──────────────────────────────────────────────

@router.post(
    "/register",
    response_model=Token,
)
async def register(
    user_data: UserRegister,
    db: AsyncSession = Depends(get_db),
):

    result = await db.execute(
        select(User).where(
            User.email == user_data.email
        )
    )

    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    new_user = User(
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        username=user_data.email,
        alias=user_data.email,
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    access_token = create_access_token(
        data={"sub": str(new_user.id)}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


# ──────────────────────────────────────────────
# LOGIN  (2FA-aware)
# ──────────────────────────────────────────────

@router.post(
    "/login",
    response_model=LoginWithTwoFactorResponse,
)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):

    result = await db.execute(
        select(User).where(
            User.email == form_data.username
        )
    )

    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials",
        )

    if not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials",
        )

    # If 2FA turned on and verifyed - demand second step
    if user.two_factor_enabled and user.two_factor_verified:
        temp_token = create_temp_token(str(user.id))

        return {
            "requires_2fa": True,
            "temp_token": temp_token,
        }

    # 2FA not turned on - immidiately issue a ful token
    access_token = create_access_token(
        data={"sub": str(user.id)}
    )

    return {
        "requires_2fa": False,
        "access_token": access_token,
    }


# ──────────────────────────────────────────────
# 2FA — SETUP (secret generation and QR-code)
# ──────────────────────────────────────────────

@router.post(
    "/2fa/setup",
    response_model=TwoFactorSetupResponse,
)
async def setup_2fa(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    secret = pyotp.random_base32()

    current_user.two_factor_secret = secret
    current_user.two_factor_enabled = False
    current_user.two_factor_verified = False

    await db.commit()

    otp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
        name=current_user.email,
        issuer_name="Real-Time Bidding Platform",
    )

    qr = qrcode.make(otp_uri)
    buffer = io.BytesIO()
    qr.save(buffer, format="PNG")
    qr_base64 = base64.b64encode(buffer.getvalue()).decode()

    return {
        "qr_code": qr_base64,
        "secret": secret,
    }


# ──────────────────────────────────────────────
# 2FA — VERIFY SETUP (confirmation that the application is working)
# ──────────────────────────────────────────────

@router.post("/2fa/verify-setup")
async def verify_2fa_setup(
    payload: TwoFactorVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.two_factor_secret:
        raise HTTPException(
            status_code=400,
            detail="2FA setup not started. Call /auth/2fa/setup first.",
        )

    totp = pyotp.TOTP(current_user.two_factor_secret)

    if not totp.verify(payload.code, valid_window=1):
        raise HTTPException(
            status_code=400,
            detail="Invalid code. Make sure your authenticator app is synced.",
        )

    current_user.two_factor_enabled = True
    current_user.two_factor_verified = True

    await db.commit()

    return {"message": "2FA enabled successfully"}


# ──────────────────────────────────────────────
# 2FA — VALIDATE (second step for login)
# ──────────────────────────────────────────────

@router.post(
    "/2fa/validate",
    response_model=Token,
)
async def validate_2fa(
    payload: TwoFactorLoginRequest,
    db: AsyncSession = Depends(get_db),
):
    user_id = decode_temp_token(payload.temp_token)

    result = await db.execute(
        select(User).where(
            User.id == uuid.UUID(user_id)
        )
    )
    user = result.scalar_one_or_none()

    if not user or not user.two_factor_secret:
        raise HTTPException(
            status_code=401,
            detail="Invalid session",
        )

    totp = pyotp.TOTP(user.two_factor_secret)

    if not totp.verify(payload.code, valid_window=1):
        raise HTTPException(
            status_code=401,
            detail="Invalid 2FA code",
        )

    access_token = create_access_token(
        data={"sub": str(user.id)}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


# ──────────────────────────────────────────────
# 2FA — DISABLE
# ──────────────────────────────────────────────

@router.post("/2fa/disable")
async def disable_2fa(
    payload: TwoFactorVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.two_factor_enabled:
        raise HTTPException(
            status_code=400,
            detail="2FA is not enabled on this account",
        )

    totp = pyotp.TOTP(current_user.two_factor_secret)

    if not totp.verify(payload.code, valid_window=1):
        raise HTTPException(
            status_code=400,
            detail="Invalid code. Provide a valid authenticator code to disable 2FA.",
        )

    current_user.two_factor_enabled = False
    current_user.two_factor_verified = False
    current_user.two_factor_secret = None

    await db.commit()

    return {"message": "2FA disabled successfully"}