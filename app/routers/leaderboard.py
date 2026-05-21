from uuid import UUID

from fastapi import APIRouter

from app.core.redis import redis_client


router = APIRouter(
    prefix="/leaderboard",
    tags=["Leaderboard"],
)


@router.get("/{auction_id}")
async def get_leaderboard(auction_id: UUID):

    leaderboard = await redis_client.zrevrange(
        f"leaderboard:auction:{auction_id}",
        0,
        9,
        withscores=True,
    )

    return {
        "auction_id": auction_id,
        "leaderboard": leaderboard,
    }