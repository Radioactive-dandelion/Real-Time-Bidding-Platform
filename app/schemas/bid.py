from decimal import Decimal

from pydantic import BaseModel


class BidCreate(BaseModel):
    amount: Decimal