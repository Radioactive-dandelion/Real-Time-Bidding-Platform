import json

from app.core.redis import redis_client
from app.websocket.manager import manager


async def redis_subscriber():

    pubsub = redis_client.pubsub()

    await pubsub.psubscribe("auction:*")

    print("Redis subscriber started")

    async for message in pubsub.listen():

        if message["type"] != "pmessage":
            continue

        print("REDIS MESSAGE:")
        print(message)

        data = json.loads(message["data"])

        auction_id = data["auction_id"]

        await manager.broadcast(
            auction_id,
            data,
        )