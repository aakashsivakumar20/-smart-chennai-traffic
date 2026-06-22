"""Analytics API — historical patterns and predictive congestion"""

from fastapi import APIRouter
from datetime import datetime, timezone, timedelta

router = APIRouter()

IST = timezone(timedelta(hours=5, minutes=30))

HOURLY_PATTERN = [
    (0, 12, False), (1, 8, False),  (2, 5, False),  (3, 4, False),
    (4, 7, False),  (5, 22, False), (6, 58, False),  (7, 142, True),
    (8, 178, True), (9, 155, True), (10, 98, False), (11, 87, False),
    (12, 102, False),(13, 95, False),(14, 88, False), (15, 105, False),
    (16, 130, False),(17, 168, True),(18, 185, True), (19, 172, True),
    (20, 148, True), (21, 95, False),(22, 55, False), (23, 28, False),
]


@router.get("/history")
async def get_history():
    return [
        {"hour": h, "label": f"{h:02d}:00", "avg_vehicles": v, "peak": peak}
        for h, v, peak in HOURLY_PATTERN
    ]


@router.get("/summary")
async def get_summary():
    return {
        "total_vehicles_today": 284750,
        "peak_hour": "18:00",
        "worst_zone": "Kathipara Junction",
        "avg_congestion_score": 0.52,
        "signals_optimized": 12,
        "estimated_time_saved_minutes": 8.4,
    }


@router.get("/predict")
async def predict_congestion():
    """Rule-based prediction for next 2 hours using historical Chennai patterns"""
    current_hour = datetime.now(IST).hour

    def level(avg):
        if avg > 150: return "severe"
        if avg > 110: return "high"
        if avg > 60:  return "medium"
        return "low"

    predictions = []
    for offset in [1, 2]:
        h = (current_hour + offset) % 24
        _, avg, peak = HOURLY_PATTERN[h]
        lv = level(avg)
        label = f"{h:02d}:00"
        predictions.append({
            "hour": h,
            "label": label,
            "offset_hours": offset,
            "predicted_level": lv,
            "avg_vehicles": avg,
            "is_peak": peak,
            "message": f"{'Peak hour — ' if peak else ''}Traffic expected to be {lv} at {label}",
        })

    if any(p["is_peak"] for p in predictions):
        recommendation = "Peak hour approaching — consider leaving now or after 21:00"
    elif predictions[0]["predicted_level"] in ["severe", "high"]:
        recommendation = "Traffic building up — plan your route carefully"
    else:
        recommendation = "Traffic looks favorable for the next 2 hours"

    return {
        "current_hour": current_hour,
        "predictions": predictions,
        "recommendation": recommendation,
    }
