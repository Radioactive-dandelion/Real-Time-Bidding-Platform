from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.db.models.auction import Auction
from app.db.models.bid import Bid
from app.schemas.bid import BidCreate

router = APIRouter(prefix="/auctions", tags=["Bids"])


@router.post("/{auction_id}/bids")
async def place_bid(
    auction_id: str,
    payload: BidCreate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Auction).where(Auction.id == auction_id)
    )

    auction = result.scalar_one_or_none()

    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")

    if payload.amount <= auction.current_price:
        raise HTTPException(
            status_code=400,
            detail="Bid must be higher than current price",
        )

    bid = Bid(
        auction_id=auction.id,
        bidder_id="TEMP_USER_ID",
        amount=payload.amount,
    )

    auction.current_price = payload.amount

    db.add(bid)

    await db.commit()
    await db.refresh(bid)

    return bid