import asyncio
import json
from datetime import datetime, timezone

from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.db.models.auction import Auction
from app.db.models.bid import Bid
from app.core.enums import AuctionStatus
from app.core.redis import redis_client


async def close_expired_auctions():
    """Фоновая задача — каждые 30 секунд обновляет статусы аукционов."""

    while True:

        try:

            async with AsyncSessionLocal() as db:

                now = datetime.now(timezone.utc)

                # Активируем scheduled аукционы у которых start_time наступил
                result = await db.execute(
                    select(Auction).where(
                        Auction.start_time <= now,
                        Auction.status == AuctionStatus.SCHEDULED,
                    )
                )

                to_activate = result.scalars().all()

                for auction in to_activate:
                    auction.status = AuctionStatus.ACTIVE
                    print(f"Auction activated: {auction.title}")

                # Закрываем active аукционы у которых end_time прошёл
                result = await db.execute(
                    select(Auction).where(
                        Auction.end_time <= now,
                        Auction.status == AuctionStatus.ACTIVE,
                    )
                )

                to_close = result.scalars().all()

                for auction in to_close:

                    auction.status = AuctionStatus.CLOSED

                    # Определяем победителя — последняя максимальная ставка
                    bid_result = await db.execute(
                        select(Bid)
                        .where(Bid.auction_id == auction.id)
                        .order_by(Bid.amount.desc())
                        .limit(1)
                    )

                    winning_bid = bid_result.scalar_one_or_none()

                    if winning_bid and winning_bid.amount >= auction.reserve_price:
                        # Резервная цена достигнута — есть победитель
                        auction.winner_id = winning_bid.bidder_id
                        print(f"Auction closed: {auction.title} — winner found, amount: {winning_bid.amount}")

                        event = {
                            "event": "AUCTION_CLOSED",
                            "auction_id": str(auction.id),
                            "winner_id": str(auction.winner_id),
                            "final_price": float(auction.current_price),
                            "reserve_met": True,
                        }

                    else:
                        # Резервная цена не достигнута — аукцион провален
                        print(f"Auction closed: {auction.title} — reserve price not met")

                        event = {
                            "event": "AUCTION_CLOSED",
                            "auction_id": str(auction.id),
                            "winner_id": None,
                            "final_price": float(auction.current_price),
                            "reserve_met": False,
                        }

                    await redis_client.publish(
                        f"auction:{auction.id}",
                        json.dumps(event),
                    )

                if to_activate or to_close:
                    await db.commit()

        except Exception as e:
            print(f"Auction closer error: {e}")

        await asyncio.sleep(30)