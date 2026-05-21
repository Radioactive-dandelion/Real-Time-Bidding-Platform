from enum import Enum


class AuctionStatus(str, Enum):
    SCHEDULED = "scheduled"
    ACTIVE = "active"
    CLOSED = "closed"