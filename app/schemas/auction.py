from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel


class AuctionCreate(BaseModel):
    title: str
    description: str | None = None

    starting_price: Decimal
    reserve_price: Decimal
    current_price: Decimal

    start_time: datetime
    end_time: datetime


class AuctionResponse(BaseModel):
    id: UUID

    seller_id: UUID | None = None
    winner_id: UUID | None = None

    title: str
    description: str | None = None

    starting_price: Decimal
    reserve_price: Decimal
    current_price: Decimal

    status: str

    start_time: datetime
    end_time: datetime

    created_at: datetime

    class Config:
        from_attributes = True

class AuctionUpdate(BaseModel):

    title: str | None = None

    description: str | None = None

    reserve_price: Decimal | None = None

    end_time: datetime | None = None