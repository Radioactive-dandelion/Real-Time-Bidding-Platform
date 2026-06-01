from pydantic import BaseModel
from typing import Optional


class TwoFactorSetupResponse(BaseModel):

    qr_code: str

    secret: str


class TwoFactorVerifyRequest(BaseModel):

    code: str


class TwoFactorLoginRequest(BaseModel):
    """Отправляется после логина когда requires_2fa: true."""

    temp_token: str

    code: str


class LoginWithTwoFactorResponse(BaseModel):
    """Ответ /auth/login когда 2FA включена."""

    requires_2fa: bool

    temp_token: Optional[str] = None

    access_token: Optional[str] = None

    token_type: str = "bearer"