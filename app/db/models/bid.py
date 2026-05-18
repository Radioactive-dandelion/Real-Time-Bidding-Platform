from sqlalchemy import Column, DateTime, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from app.db.base import Base


class Bid(Base):
    __tablename__ = "bids"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    auction_id = Column(UUID(as_uuid=True), ForeignKey("auctions.id"))
    bidder_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))

    amount = Column(Numeric, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())