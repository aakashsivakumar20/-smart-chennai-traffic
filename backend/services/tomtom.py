"""
TomTom Traffic Flow integration.
Fetches real speed/congestion data for each Chennai zone.
Falls back silently if the API key is missing or a request fails.

Free tier: 2,500 requests/day — with 12 zones every 10 min = 1,728/day.
"""

import httpx
import random
from datetime import datetime

from config import settings
from models.traffic import TrafficReading, VehicleCount, CongestionLevel
from models.zones import TrafficZone
from services.simulator import compute_green_time

FLOW_API = "https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json"


async def fetch_zone_flow(zone: TrafficZone, client: httpx.AsyncClient) -> dict | None:
    try:
        resp = await client.get(
            FLOW_API,
            params={"point": f"{zone.lat},{zone.lng}", "key": settings.TOMTOM_API_KEY},
            timeout=5.0,
        )
        if resp.status_code == 200:
            return resp.json().get("flowSegmentData")
    except Exception:
        pass
    return None


def flow_to_reading(zone: TrafficZone, flow: dict) -> TrafficReading:
    current_speed = float(flow.get("currentSpeed", 30))
    free_flow = float(flow.get("freeFlowSpeed") or 60)

    congestion_score = round(max(0.0, min(1.0 - current_speed / free_flow, 1.0)), 3)

    if congestion_score < 0.25:
        level = CongestionLevel.LOW
    elif congestion_score < 0.50:
        level = CongestionLevel.MEDIUM
    elif congestion_score < 0.75:
        level = CongestionLevel.HIGH
    else:
        level = CongestionLevel.SEVERE

    base = {"high": 160, "medium": 100, "low": 50}[zone.priority]
    d = congestion_score

    counts = VehicleCount(
        cars=int(base * d * random.uniform(0.8, 1.0)),
        bikes=int(base * d * random.uniform(0.9, 1.1)),
        buses=int(base * d * 0.08),
        trucks=int(base * d * 0.05),
        autos=int(base * d * 0.25),
    )
    total = counts.total
    queue = round(total * 2.5, 1)

    return TrafficReading(
        zone_id=zone.id,
        zone_name=zone.name,
        lat=zone.lat,
        lng=zone.lng,
        vehicle_count=counts,
        total_vehicles=total,
        avg_speed_kmh=round(current_speed, 1),
        congestion_level=level,
        congestion_score=congestion_score,
        green_time_seconds=compute_green_time(total),
        queue_length_meters=queue,
        timestamp=datetime.now(),
        camera_online=True,
    )
