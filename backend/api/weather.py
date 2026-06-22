"""Live Chennai weather from wttr.in — no API key required"""

from fastapi import APIRouter
import httpx

router = APIRouter()


@router.get("")
async def get_weather():
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://wttr.in/Chennai?format=j1",
                timeout=5.0,
                headers={"User-Agent": "smart-chennai-traffic/1.0"},
            )
            resp.raise_for_status()
            data = resp.json()
            cc = data["current_condition"][0]
            desc = cc["weatherDesc"][0]["value"]
            is_raining = any(
                w in desc.lower()
                for w in ["rain", "drizzle", "shower", "thunderstorm", "sleet"]
            )
            return {
                "temp_c": int(cc["temp_C"]),
                "feels_like_c": int(cc["FeelsLikeC"]),
                "description": desc,
                "humidity": int(cc["humidity"]),
                "wind_kmph": int(cc["windspeedKmph"]),
                "is_raining": is_raining,
            }
    except Exception:
        return {"temp_c": None, "description": "Unavailable", "is_raining": False, "error": True}
