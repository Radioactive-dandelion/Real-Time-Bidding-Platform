from collections import defaultdict

from fastapi import WebSocket


class ConnectionManager:

    def __init__(self):

        self.active_connections = defaultdict(list)

    async def connect(
        self,
        auction_id: str,
        websocket: WebSocket,
    ):

        await websocket.accept()

        self.active_connections[auction_id].append(websocket)

        print(f"CONNECTED: {auction_id}")
        print(
            f"TOTAL CONNECTIONS: "
            f"{len(self.active_connections[auction_id])}"
        )

    def disconnect(
        self,
        auction_id: str,
        websocket: WebSocket,
    ):

        if websocket in self.active_connections[auction_id]:

            self.active_connections[auction_id].remove(websocket)

        print(f"DISCONNECTED: {auction_id}")
        print(
            f"TOTAL CONNECTIONS: "
            f"{len(self.active_connections[auction_id])}"
        )

    async def broadcast(
        self,
        auction_id: str,
        message: dict,
    ):

        print(f"BROADCASTING TO {auction_id}")
        print(message)

        dead_connections = []

        for connection in self.active_connections[auction_id]:

            try:

                await connection.send_json(message)

            except Exception as e:

                print("SEND ERROR:", e)

                dead_connections.append(connection)

        for dead in dead_connections:

            self.active_connections[auction_id].remove(dead)


manager = ConnectionManager()