import json

from app.core.redis import redis_client
from app.websocket.manager import manager


async def redis_subscriber():

    pubsub = redis_client.pubsub(
        ignore_subscribe_messages=True,
    )

    await pubsub.psubscribe("auction:*")

    print("Redis subscriber started")

    while True:

        try:

            message = await pubsub.get_message(
                ignore_subscribe_messages=True,
                timeout=1.0,
            )

            if message is None:
                continue

            if message["type"] != "pmessage":
                continue

            data = json.loads(message["data"])
            auction_id = data["auction_id"]

            await manager.broadcast(auction_id, data)

        except Exception as e:
            print(f"Pubsub error: {e}")
            continue