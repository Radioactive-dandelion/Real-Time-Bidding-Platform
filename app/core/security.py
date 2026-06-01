from datetime import datetime, timedelta, timezone

from jose import jwt, JWTError
from passlib.context import CryptContext

from app.core.config import settings


ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60
TEMP_TOKEN_EXPIRE_MINUTES = 5


pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


def hash_password(password: str) -> str:

    return pwd_context.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:

    return pwd_context.verify(
        plain_password,
        hashed_password,
    )


def create_access_token(data: dict):

    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=ALGORITHM,
    )

    return encoded_jwt


def create_temp_token(user_id: str) -> str:
    """Короткий токен после проверки пароля, когда требуется 2FA."""

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=TEMP_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": user_id,
        "type": "2fa_temp",
        "exp": expire,
    }

    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)


def decode_temp_token(token: str) -> str:
    """Декодирует temp-токен и возвращает user_id."""

    from fastapi import HTTPException

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])

        if payload.get("type") != "2fa_temp":
            raise HTTPException(status_code=401, detail="Invalid token type")

        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")

        return user_id

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")