import json
from uuid import UUID
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.auction import Auction
from app.db.models.bid import Bid
from app.db.session import get_db

from app.schemas.bid import BidCreate, BidResponse

from app.core.enums import AuctionStatus
from app.core.redis import redis_client


router = APIRouter(tags=["Bids"])


@router.post(
    "/auctions/{auction_id}/bids",
    response_model=BidResponse,
)
async def place_bid(
    auction_id: UUID,
    bid_data: BidCreate,
    db: AsyncSession = Depends(get_db),
):

    result = await db.execute(
        select(Auction).where(Auction.id == auction_id)
    )

    auction = result.scalar_one_or_none()

    if not auction:
        raise HTTPException(
            status_code=404,
            detail="Auction not found",
        )

    now = datetime.now(timezone.utc)

    # auction has not started yet
    if now < auction.start_time:
        raise HTTPException(
            status_code=400,
            detail="Auction has not started yet",
        )

    # auction already ended
    if now > auction.end_time:

        auction.status = AuctionStatus.CLOSED

        await db.commit()

        raise HTTPException(
            status_code=400,
            detail="Auction is closed",
        )

    # mark auction as active
    auction.status = AuctionStatus.ACTIVE

    # validate bid amount
    if bid_data.amount <= auction.current_price:
        raise HTTPException(
            status_code=400,
            detail="Bid must be higher than current price",
        )

    # create new bid
    new_bid = Bid(
        auction_id=auction.id,

        # bidder_id will be added in Phase 3 (JWT auth)
        bidder_id=None,

        amount=bid_data.amount,
    )

    # update auction current price
    auction.current_price = bid_data.amount


    # future winner logic
    # auction.winner_id = new_bid.bidder_id

    db.add(new_bid)

    await db.commit()

    await db.refresh(new_bid)

    await redis_client.zadd(
    f"leaderboard:auction:{auction.id}",
    {
        str(new_bid.id): float(bid_data.amount)
    }
)

    event_data = {
    "event": "NEW_BID",
    "auction_id": str(auction.id),
    "amount": float(new_bid.amount),
}

    await redis_client.publish(
    f"auction:{auction.id}",
    json.dumps(event_data),
)

    return new_bid