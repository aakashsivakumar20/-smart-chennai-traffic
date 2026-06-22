"""
Traffic Simulator
Generates realistic Chennai traffic patterns for the demo.
When real YOLO cameras are connected, this gets replaced by live data.
"""

import asyncio
import random
import math
from datetime import datetime
from typing import Dict

import httpx

from config import settings
from models.traffic import (
    TrafficReading, VehicleCount, CongestionLevel,
    TrafficAlert, AlertType
)
from models.zones import CHENNAI_ZONES
from websocket.manager import connection_manager

TOMTOM_REFRESH_INTERVAL = 600  # 10 minutes — keeps usage under free tier limit

# Chennai peak hours (morning rush + evening rush)
PEAK_HOURS = {7, 8, 9, 17, 18, 19, 20}
MODERATE_HOURS = {10, 11, 12, 13, 14, 15, 16}

def get_time_multiplier() -> float:
    """Returns traffic density multiplier based on time of day"""
    hour = datetime.now().hour
    if hour in PEAK_HOURS:
        return random.uniform(0.85, 1.0)
    elif hour in MODERATE_HOURS:
        return random.uniform(0.45, 0.70)
    elif 0 <= hour <= 5:
        return random.uniform(0.05, 0.15)  # Late night
    else:
        return random.uniform(0.20, 0.45)

def compute_congestion(total_vehicles: int, avg_speed: float, queue: float) -> tuple:
    """
    Congestion Score Formula:
    score = (vehicle_count × 0.5) + (waiting_time × 0.3) + (lane_occupancy × 0.2)
    Normalized to 0.0–1.0
    """
    v_norm = min(total_vehicles / 200.0, 1.0)
    s_norm = max(0, 1.0 - (avg_speed / 60.0))
    q_norm = min(queue / 500.0, 1.0)

    score = (v_norm * 0.5) + (s_norm * 0.3) + (q_norm * 0.2)
    score = round(min(score, 1.0), 3)

    if score < 0.25:
        level = CongestionLevel.LOW
    elif score < 0.50:
        level = CongestionLevel.MEDIUM
    elif score < 0.75:
        level = CongestionLevel.HIGH
    else:
        level = CongestionLevel.SEVERE

    return score, level

def compute_green_time(total_vehicles: int) -> int:
    """Smart signal timing based on vehicle count"""
    if total_vehicles > 120:
        return 90
    elif total_vehicles > 80:
        return 75
    elif total_vehicles > 50:
        return 60
    elif total_vehicles > 20:
        return 45
    else:
        return 30

def generate_zone_reading(zone) -> TrafficReading:
    """Generate one realistic traffic reading for a zone"""
    multiplier = get_time_multiplier()

    # Base volumes vary by zone priority
    base = {"high": 160, "medium": 100, "low": 50}[zone.priority]

    # Add some wave-like variation using sine
    wave = math.sin(datetime.now().timestamp() / 60) * 0.15
    effective = max(0.0, multiplier + wave)

    cars  = int(base * effective * random.uniform(0.7, 1.0))
    bikes = int(base * effective * random.uniform(0.8, 1.2))
    buses = int(base * effective * 0.08 * random.uniform(0.8, 1.2))
    trucks = int(base * effective * 0.05 * random.uniform(0.5, 1.0))
    autos = int(base * effective * 0.25 * random.uniform(0.7, 1.1))

    counts = VehicleCount(cars=cars, bikes=bikes, buses=buses, trucks=trucks, autos=autos)
    total = cars + bikes + buses + trucks + autos

    # Speed inversely proportional to density
    avg_speed = max(5.0, 60.0 * (1.0 - effective) + random.uniform(-5, 5))
    queue = total * 2.5 * random.uniform(0.8, 1.2)

    score, level = compute_congestion(total, avg_speed, queue)
    green_time = compute_green_time(total)

    return TrafficReading(
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
        camera_online=random.random() > 0.05,  # 95% uptime
    )


class TrafficSimulator:
    """
    Broadcasts live traffic data every 3 seconds via WebSocket.
    If TOMTOM_API_KEY is set, real speed/congestion data is fetched every 10 minutes
    and blended in. Otherwise falls back to simulation for all zones.
    """

    def __init__(self):
        self.running = False
        self._task = None
        self._tomtom_task = None
        self.latest: Dict[str, TrafficReading] = {}

    async def start(self):
        self.running = True
        self._task = asyncio.create_task(self._loop())
        if settings.TOMTOM_API_KEY:
            self._tomtom_task = asyncio.create_task(self._tomtom_loop())
            print("✅ Traffic simulator started with TomTom live data")
        else:
            print("✅ Traffic simulator started (simulated — set TOMTOM_API_KEY for real data)")

    async def stop(self):
        self.running = False
        if self._task:
            self._task.cancel()
        if self._tomtom_task:
            self._tomtom_task.cancel()

    async def _tomtom_loop(self):
        from services.tomtom import fetch_zone_flow, flow_to_reading
        async with httpx.AsyncClient() as client:
            while self.running:
                for zone in CHENNAI_ZONES:
                    flow = await fetch_zone_flow(zone, client)
                    if flow:
                        self.latest[zone.id] = flow_to_reading(zone, flow)
                print(f"TomTom refresh complete — {len(self.latest)} zones updated")
                await asyncio.sleep(TOMTOM_REFRESH_INTERVAL)

    async def _loop(self):
        while self.running:
            readings = []
            for zone in CHENNAI_ZONES:
                # Use TomTom reading if available, otherwise simulate
                if zone.id not in self.latest:
                    self.latest[zone.id] = generate_zone_reading(zone)
                elif not settings.TOMTOM_API_KEY:
                    self.latest[zone.id] = generate_zone_reading(zone)
                readings.append(self.latest[zone.id].model_dump(mode="json"))

            alert = self._maybe_generate_alert()

            payload = {
                "type": "traffic_update",
                "data": readings,
                "alert": alert,
                "timestamp": datetime.now().isoformat(),
            }

            await connection_manager.broadcast(payload)
            await asyncio.sleep(3)

    def _maybe_generate_alert(self):
        if random.random() > 0.92:  # ~8% chance per tick
            severe = [z for z in CHENNAI_ZONES
                      if z.id in self.latest
                      and self.latest[z.id].congestion_level in
                      (CongestionLevel.HIGH, CongestionLevel.SEVERE)]
            if severe:
                zone = random.choice(severe)
                alert_type = random.choice(list(AlertType))
                messages = {
                    AlertType.JAM: f"Heavy traffic jam detected at {zone.name}",
                    AlertType.ACCIDENT: f"Possible incident reported near {zone.name}",
                    AlertType.SIGNAL: f"Signal malfunction at {zone.name} — manual override active",
                    AlertType.CROWD: f"Abnormal vehicle crowding at {zone.name}",
                }
                return {
                    "id": f"alert_{datetime.now().timestamp()}",
                    "zone_id": zone.id,
                    "zone_name": zone.name,
                    "alert_type": alert_type,
                    "message": messages[alert_type],
                    "severity": "critical" if alert_type == AlertType.ACCIDENT else "warning",
                    "timestamp": datetime.now().isoformat(),
                }
        return None
