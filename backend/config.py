"""
Centralized application settings.
Reads from environment variables — never hardcode config in production.
"""

import os
from typing import List


def _split_csv(value: str) -> List[str]:
    return [v.strip() for v in value.split(",") if v.strip()]


class Settings:
    # Environment
    ENV: str = os.getenv("ENV", "development")
    IS_PRODUCTION: bool = ENV == "production"

    # Server
    PORT: int = int(os.getenv("PORT", "8000"))

    # CORS — comma-separated list of allowed frontend origins
    # In production this MUST be your real Vercel URL, never "*"
    ALLOWED_ORIGINS: List[str] = _split_csv(
        os.getenv(
            "ALLOWED_ORIGINS",
            "http://localhost:3000,http://localhost:5173",
        )
    )

    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "info")

    # Simulator tick rate (seconds between traffic updates)
    SIMULATOR_INTERVAL: float = float(os.getenv("SIMULATOR_INTERVAL", "3.0"))

    # TomTom Traffic API (optional — set to enable real traffic data)
    TOMTOM_API_KEY: str = os.getenv("TOMTOM_API_KEY", "")

    # Future: database / redis (Phase 2)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    REDIS_URL: str = os.getenv("REDIS_URL", "")


settings = Settings()
