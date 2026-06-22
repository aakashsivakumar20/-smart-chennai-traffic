"""
Pydantic models — define the shape of API request/response data
"""

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum

class CongestionLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    SEVERE = "severe"

class VehicleCount(BaseModel):
    cars: int = 0
    bikes: int = 0
    buses: int = 0
    trucks: int = 0
    autos: int = 0

    @property
    def total(self) -> int:
        return self.cars + self.bikes + self.buses + self.trucks + self.autos

class TrafficReading(BaseModel):
    zone_id: str
    zone_name: str
    lat: float
    lng: float
    vehicle_count: VehicleCount
    total_vehicles: int
    avg_speed_kmh: float
    congestion_level: CongestionLevel
    congestion_score: float       # 0.0 - 1.0
    green_time_seconds: int
    queue_length_meters: float
    timestamp: datetime
    camera_online: bool = True

class SignalUpdate(BaseModel):
    zone_id: str
    green_time: int
    red_time: int
    reason: str

class AlertType(str, Enum):
    JAM = "traffic_jam"
    ACCIDENT = "accident"
    SIGNAL = "signal_malfunction"
    CROWD = "abnormal_crowding"

class TrafficAlert(BaseModel):
    id: str
    zone_id: str
    zone_name: str
    alert_type: AlertType
    message: str
    severity: str   # info, warning, critical
    timestamp: datetime

class HistoricalDataPoint(BaseModel):
    hour: int
    avg_vehicles: int
    avg_congestion_score: float
    peak: bool = False
