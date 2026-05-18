from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.db.models.auction import Auction
from app.schemas.auction import AuctionCreate

router = APIRouter(prefix="/auctions", tags=["Auctions"])


@router.post("")
async def create_auction(
    payload: AuctionCreate,
    db: AsyncSession = Depends(get_db),
):
    auction = Auction(
        seller_id="TEMP_USER_ID",
        title=payload.title,
        description=payload.description,
        starting_price=payload.starting_price,
        reserve_price=payload.reserve_price,
        current_price=payload.starting_price,
        start_time=payload.start_time,
        end_time=payload.end_time,
    )

    db.add(auction)
    await db.commit()
    await db.refresh(auction)

    return auction


@router.get("")
async def get_auctions(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Auction))
    return result.scalars().all()


@router.get("/{auction_id}")
async def get_auction(
    auction_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Auction).where(Auction.id == auction_id)
    )

    auction = result.scalar_one_or_none()

    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")

    return auction