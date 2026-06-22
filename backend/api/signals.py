"""Signal optimization API"""
from fastapi import APIRouter, Request
from models.traffic import SignalUpdate

router = APIRouter()

@router.get("/status")
async def get_signals(request: Request):
    simulator = request.app.state.simulator
    return [
        {
            "zone_id": zone_id,
            "zone_name": r.zone_name,
            "green_time": r.green_time_seconds,
            "red_time": max(120 - r.green_time_seconds, 30),
            "congestion_level": r.congestion_level,
        }
        for zone_id, r in simulator.latest.items()
    ]

@router.post("/update")
async def update_signal(update: SignalUpdate):
    # In production: send to physical signal controller
    return {"status": "updated", "zone_id": update.zone_id, "green_time": update.green_time}
