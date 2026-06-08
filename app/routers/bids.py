import json
from uuid import UUID
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from fastapi import Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.auction import Auction
from app.db.models.bid import Bid
from app.db.models.user import User

from app.db.session import get_db

from app.schemas.bid import BidCreate, BidResponse

from app.core.enums import AuctionStatus
from app.core.redis import redis_client
from app.core.dependencies import get_current_user

from app.core.limiter import limiter


router = APIRouter(tags=["Bids"])


@router.post(
    "/auctions/{auction_id}/bids",
    response_model=BidResponse,
)

@limiter.limit("5/minute")
async def place_bid(
    request: Request,
    auction_id: UUID,
    bid_data: BidCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    result = await db.execute(
        select(Auction).where(
            Auction.id == auction_id
        ).with_for_update()
    )

    auction = result.scalar_one_or_none()

    if not auction:
        raise HTTPException(
            status_code=404,
            detail="Auction not found",
        )

    # prevent bidding on own auction
    if auction.seller_id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="You cannot bid on your own auction",
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
        bidder_id=current_user.id,
        amount=bid_data.amount,
    )

    # update auction current price
    auction.current_price = bid_data.amount

    db.add(new_bid)

    await db.commit()

    await db.refresh(new_bid)

    # update leaderboard
    await redis_client.zadd(
        f"leaderboard:auction:{auction.id}",
        {
            str(new_bid.id): float(bid_data.amount)
        }
    )

    # websocket event
    time_remaining = (auction.end_time - datetime.now(timezone.utc)).total_seconds()

    event_data = {
        "event": "NEW_BID",
        "auction_id": str(auction.id),
        "amount": float(new_bid.amount),
        "bidder_alias": current_user.alias,
        "time_remaining": max(0, int(time_remaining)),
    }

    await redis_client.publish(
        f"auction:{auction.id}",
        json.dumps(event_data),
    )

    return new_bid

@router.get(
    "/auctions/{auction_id}/bids",
    response_model=list[BidResponse],
)
async def get_auction_bids(
    auction_id: UUID,
    db: AsyncSession = Depends(get_db),
):

    result = await db.execute(
        select(Bid)
        .where(Bid.auction_id == auction_id)
        .order_by(Bid.amount.desc())
    )

    bids = result.scalars().all()

    return bids