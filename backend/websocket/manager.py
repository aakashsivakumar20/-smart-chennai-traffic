"""
WebSocket Connection Manager
Manages all connected browser clients and broadcasts live traffic data
"""

import json
from typing import List
from fastapi import WebSocket, WebSocketDisconnect
from fastapi import APIRouter

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"🔌 Client connected. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        print(f"🔌 Client disconnected. Total: {len(self.active_connections)}")

    async def broadcast(self, data: dict):
        """Send data to all connected clients"""
        if not self.active_connections:
            return
        message = json.dumps(data, default=str)
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                disconnected.append(connection)
        for conn in disconnected:
            self.active_connections.remove(conn)

# Singleton instance shared across the app
connection_manager = ConnectionManager()

@router.websocket("/ws/traffic")
async def websocket_endpoint(websocket: WebSocket):
    await connection_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive; data is pushed from the simulator
            await websocket.receive_text()
    except WebSocketDisconnect:
        connection_manager.disconnect(websocket)
