from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.auction import Auction
from app.db.session import get_db

from app.schemas.auction import AuctionCreate, AuctionResponse

from app.schemas.auction import (
    AuctionCreate,
    AuctionResponse,
    AuctionUpdate,
)


router = APIRouter(prefix="/auctions", tags=["Auctions"])


@router.post("/", response_model=AuctionResponse)
async def create_auction(
    auction_data: AuctionCreate,
    db: AsyncSession = Depends(get_db),
):

    new_auction = Auction(
        title=auction_data.title,
        description=auction_data.description,
        starting_price=auction_data.starting_price,
        reserve_price=auction_data.reserve_price,
        current_price=auction_data.current_price,
        start_time=auction_data.start_time,
        end_time=auction_data.end_time,
        status="scheduled",
    )

    db.add(new_auction)

    await db.commit()
    await db.refresh(new_auction)

    return new_auction


@router.get("/", response_model=list[AuctionResponse])
async def get_auctions(
    db: AsyncSession = Depends(get_db),
):

    result = await db.execute(select(Auction))

    auctions = result.scalars().all()

    return auctions


@router.get("/{auction_id}", response_model=AuctionResponse)
async def get_auction(
    auction_id: UUID,
    db: AsyncSession = Depends(get_db),
):

    result = await db.execute(
        select(Auction).where(Auction.id == auction_id)
    )

    auction = result.scalar_one_or_none()

    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")

    return auction

@router.patch(
    "/{auction_id}",
    response_model=AuctionResponse,
)
async def update_auction(
    auction_id: UUID,
    auction_data: AuctionUpdate,
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

    # allow editing only before auction starts
    if auction.status != "scheduled":
        raise HTTPException(
            status_code=400,
            detail="Only scheduled auctions can be updated",
        )

    update_data = auction_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(auction, field, value)

    await db.commit()

    await db.refresh(auction)

    return auction