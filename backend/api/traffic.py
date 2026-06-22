"""
Traffic API Routes
GET /api/traffic/live     - All zones current state
GET /api/traffic/zone/:id - Single zone
"""

from fastapi import APIRouter, HTTPException, Request
from typing import List
from models.zones import CHENNAI_ZONES, ZONES_BY_ID

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
