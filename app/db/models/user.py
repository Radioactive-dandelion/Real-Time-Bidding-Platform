from sqlalchemy import (
    Column,
    String,
    DateTime,
    Boolean,
)

from sqlalchemy.dialects.postgresql import UUID

from sqlalchemy.sql import func

import uuid

from app.db.base import Base


class User(Base):

    __tablename__ = "users"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    username = Column(
        String,
        unique=True,
        nullable=False,
    )

    email = Column(
        String,
        unique=True,
        nullable=False,
    )

    password_hash = Column(
        String,
        nullable=False,
    )

    alias = Column(
        String,
        nullable=False,
    )

    # 2FA fields
    two_factor_enabled = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    two_factor_verified = Column(      # ← НОВОЕ ПОЛЕ
        Boolean,
        default=False,
        nullable=False,
    )

    two_factor_secret = Column(
        String,
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )