from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.db.base import Base
from app.db.session import engine

from app.db.models import *

from app.routers import auctions
from app.routers import bids
from app.routers import leaderboard


@asynccontextmanager
async def lifespan(app: FastAPI):

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield


app = FastAPI(
    title="Real-Time Bidding Platform",
    lifespan=lifespan,
)

app.include_router(auctions.router)
app.include_router(bids.router)
app.include_router(leaderboard.router)


@app.get("/")
async def root():
    return {"message": "Auction API running"}