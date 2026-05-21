from fastapi import APIRouter
from fastapi import WebSocket
from fastapi import WebSocketDisconnect

from app.websocket.manager import manager


router = APIRouter()


@router.websocket("/ws/auctions/{auction_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    auction_id: str,
):

    await manager.connect(
        auction_id,
        websocket,
    )

    try:

        while True:

            await websocket.receive_text()

    except WebSocketDisconnect:

        manager.disconnect(
            auction_id,
            websocket,
        )