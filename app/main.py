from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.db.base import Base
from app.db.session import engine

from app.db.models.user import User
from app.db.models.auction import Auction
from app.db.models.bid import Bid

from app.routers import auctions
from app.routers import bids
from app.routers import leaderboard

from app.websocket.routes import router as websocket_router

import asyncio

from app.services.pubsub import redis_subscriber

from fastapi.middleware.cors import CORSMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    asyncio.create_task(redis_subscriber())

    yield

app = FastAPI(
    title="Real-Time Bidding Platform",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auctions.router)
app.include_router(bids.router)
app.include_router(leaderboard.router)

app.include_router(websocket_router)


@app.get("/")
async def root():
    return {"message": "Auction API running"}