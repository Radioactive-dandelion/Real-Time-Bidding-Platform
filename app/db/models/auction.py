from sqlalchemy import Column, String, DateTime, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from sqlalchemy import Enum
from app.core.enums import AuctionStatus

from app.db.base import Base


class Auction(Base):
    __tablename__ = "auctions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    seller_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    winner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    title = Column(String, nullable=False)
    description = Column(String)

    starting_price = Column(Numeric, nullable=False)
    reserve_price = Column(Numeric, nullable=False)
    current_price = Column(Numeric, nullable=False)

    status = Column(
    Enum(AuctionStatus),
    default=AuctionStatus.SCHEDULED,
    nullable=False,
)

    start_time = Column(DateTime(timezone=True))
    end_time = Column(DateTime(timezone=True))

    created_at = Column(DateTime(timezone=True), server_default=func.now())

