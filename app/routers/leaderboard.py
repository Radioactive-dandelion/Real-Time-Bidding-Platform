from fastapi import APIRouter

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])


@router.get("")
async def get_leaderboard():
    return {
        "message": "Redis leaderboard implementation coming next"
    }