from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class AuctionCreate(BaseModel):
    title: str
    description: str
    starting_price: Decimal
    reserve_price: Decimal
    start_time: datetime
    end_time: datetime


class AuctionResponse(BaseModel):
    id: str
    title: str
    current_price: Decimal
    status: str

    class Config:
        from_attributes = True