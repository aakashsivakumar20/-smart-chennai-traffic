"""
Traffic API Routes
GET  /api/traffic/live       - All zones current state
GET  /api/traffic/zone/:id   - Single zone
POST /api/traffic/ingest     - Receive detections from AI engine
"""

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from models.zones import CHENNAI_ZONES, ZONES_BY_ID
from models.traffic import TrafficReading, VehicleCount
from services.simulator import compute_congestion, compute_green_time
from websocket.manager import connection_manager

router = APIRouter()

@router.get("/live")
async def get_live_traffic(request: Request):
    """Returns the latest traffic reading for every Chennai zone"""
    simulator = request.app.state.simulator
    readings = list(simulator.latest.values())
    return {
        "zones": len(readings),
        "data": [r.model_dump(mode="json") for r in readings],
    }

@router.get("/zones")
async def get_zones():
    """Returns all monitored zone metadata (for map pins)"""
    return [
        {
            "id": z.id,
            "name": z.name,
            "area": z.area,
            "lat": z.lat,
            "lng": z.lng,
            "priority": z.priority,
        }
        for z in CHENNAI_ZONES
    ]

@router.get("/zone/{zone_id}")
async def get_zone(zone_id: str, request: Request):
    """Returns latest reading for a specific zone"""
    if zone_id not in ZONES_BY_ID:
        raise HTTPException(status_code=404, detail=f"Zone '{zone_id}' not found")
    simulator = request.app.state.simulator
    reading = simulator.latest.get(zone_id)
    if not reading:
        raise HTTPException(status_code=503, detail="No data yet — simulator still warming up")
    return reading.model_dump(mode="json")


class IngestPayload(BaseModel):
    zone_id: str
    vehicle_count: dict
    timestamp: Optional[str] = None


@router.post("/ingest")
async def ingest_traffic(payload: IngestPayload, request: Request):
    """Receive real vehicle detections from the AI engine (Colab / local detector)"""
    if payload.zone_id not in ZONES_BY_ID:
        raise HTTPException(status_code=404, detail=f"Zone '{payload.zone_id}' not found")

    zone = ZONES_BY_ID[payload.zone_id]
    vc = payload.vehicle_count

    counts = VehicleCount(
        cars=vc.get("car", 0),
        bikes=vc.get("motorcycle", 0),
        buses=vc.get("bus", 0),
        trucks=vc.get("truck", 0),
        autos=vc.get("auto", 0),
    )
    total = counts.total
    avg_speed = max(5.0, 50.0 * (1.0 - min(total / 150.0, 1.0)))
    queue = total * 2.5

    score, level = compute_congestion(total, avg_speed, queue)
    green_time = compute_green_time(total)

    reading = TrafficReading(
        zone_id=zone.id,
        zone_name=zone.name,
        lat=zone.lat,
        lng=zone.lng,
        vehicle_count=counts,
        total_vehicles=total,
        avg_speed_kmh=round(avg_speed, 1),
        congestion_level=level,
        congestion_score=score,
        green_time_seconds=green_time,
        queue_length_meters=round(queue, 1),
        timestamp=datetime.now(),
        camera_online=True,
    )

    simulator = request.app.state.simulator
    simulator.latest[payload.zone_id] = reading

    await connection_manager.broadcast({
        "type": "traffic_update",
        "data": [r.model_dump(mode="json") for r in simulator.latest.values()],
        "alert": None,
        "timestamp": datetime.now().isoformat(),
    })

    return {"status": "ok", "zone_id": payload.zone_id, "total_vehicles": total}
