from contextlib import asynccontextmanager

import asyncio

from fastapi import FastAPI

from fastapi.middleware.cors import CORSMiddleware

from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.extension import _rate_limit_exceeded_handler

from app.db.base import Base
from app.db.session import engine

from app.db.models.user import User
from app.db.models.auction import Auction
from app.db.models.bid import Bid

from app.routers import auctions
from app.routers import bids
from app.routers import leaderboard
from app.routers import auth

from app.websocket.routes import router as websocket_router

from app.services.pubsub import redis_subscriber

from app.core.limiter import limiter

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

# slowapi config
app.state.limiter = limiter

app.add_exception_handler(
    RateLimitExceeded,
    _rate_limit_exceeded_handler,
)

app.add_middleware(SlowAPIMiddleware)

# cors
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# routers
app.include_router(auctions.router)
app.include_router(bids.router)
app.include_router(leaderboard.router)
app.include_router(auth.router)
app.include_router(websocket_router)


@app.get("/")
async def root():

    return {
        "message": "Auction API running"
    }