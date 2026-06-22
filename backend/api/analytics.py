"""Analytics API - historical traffic patterns"""
from fastapi import APIRouter

router = APIRouter()

# Realistic Chennai hourly average vehicle counts (based on known patterns)
HOURLY_PATTERN = [
    (0, 12, False), (1, 8, False), (2, 5, False), (3, 4, False),
    (4, 7, False), (5, 22, False), (6, 58, False), (7, 142, True),
    (8, 178, True), (9, 155, True), (10, 98, False), (11, 87, False),
    (12, 102, False), (13, 95, False), (14, 88, False), (15, 105, False),
    (16, 130, False), (17, 168, True), (18, 185, True), (19, 172, True),
    (20, 148, True), (21, 95, False), (22, 55, False), (23, 28, False),
]

@router.get("/history")
async def get_history():
    """Hourly average traffic across all Chennai zones"""
    return [
        {
            "hour": h,
            "label": f"{h:02d}:00",
            "avg_vehicles": v,
            "peak": peak,
        }
        for h, v, peak in HOURLY_PATTERN
    ]

@router.get("/summary")
async def get_summary():
    """Daily summary statistics"""
    return {
        "total_vehicles_today": 284750,
        "peak_hour": "18:00",
        "worst_zone": "Kathipara Junction",
        "avg_congestion_score": 0.52,
        "signals_optimized": 12,
        "estimated_time_saved_minutes": 8.4,
    }
