from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.auction import Auction
from app.db.session import get_db
from app.db.models.user import User
from app.schemas.auction import AuctionCreate, AuctionResponse
from app.core.dependencies import get_current_user
from app.core.enums import AuctionStatus

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
    current_user: User = Depends(get_current_user),
):

    new_auction = Auction(
        seller_id=current_user.id,
        title=auction_data.title,
        description=auction_data.description,
        starting_price=auction_data.starting_price,
        reserve_price=auction_data.reserve_price,
        current_price=auction_data.starting_price,
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

    result = await db.execute(
        select(Auction).where(
            Auction.status != AuctionStatus.ARCHIVED
        )
    )

    auctions = result.scalars().all()

    return auctions

@router.get("/archived", response_model=list[AuctionResponse])
async def get_archived_auctions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    result = await db.execute(
        select(Auction).where(
            Auction.status == AuctionStatus.ARCHIVED,
            Auction.seller_id == current_user.id,
        )
    )

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
    current_user: User = Depends(get_current_user),
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

    if auction.seller_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Only the seller can edit this auction",
        )

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

@router.post(
    "/{auction_id}/archive",
    response_model=AuctionResponse,
)
async def archive_auction(
    auction_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
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

    if auction.seller_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Only the seller can archive this auction",
        )

    if auction.status not in ("closed", "cancelled"):
        raise HTTPException(
            status_code=400,
            detail="Only closed or cancelled auctions can be archived",
        )

    auction.status = AuctionStatus.ARCHIVED

    await db.commit()
    await db.refresh(auction)

    return auction

@router.post(
    "/{auction_id}/cancel",
    response_model=AuctionResponse,
)
async def cancel_auction(
    auction_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
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

    if auction.seller_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Only the seller can cancel this auction",
        )

    if auction.status not in (AuctionStatus.SCHEDULED, AuctionStatus.ACTIVE):
        raise HTTPException(
            status_code=400,
            detail="Only scheduled or active auctions can be cancelled",
        )

    auction.status = AuctionStatus.CANCELLED

    await db.commit()
    await db.refresh(auction)

    return auction