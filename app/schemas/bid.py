from decimal import Decimal
from uuid import UUID
from datetime import datetime

from pydantic import BaseModel


class BidCreate(BaseModel):
    amount: Decimal


class BidResponse(BaseModel):
    id: UUID

    auction_id: UUID
    bidder_id: UUID | None = None

    amount: Decimal

    created_at: datetime

    class Config:
        from_attributes = True