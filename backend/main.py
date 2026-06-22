"""
Smart Chennai Traffic Management System
FastAPI Backend - Main Entry Point (Production Configuration)
"""

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import uvicorn
import time

from config import settings
from logging_config import logger
from api.traffic import router as traffic_router
from api.signals import router as signals_router
from api.analytics import router as analytics_router
from api.weather import router as weather_router
from websocket.manager import router as ws_router
from services.simulator import TrafficSimulator


# ── Lifecycle ────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting Smart Chennai Traffic System [env={settings.ENV}]")
    simulator = TrafficSimulator()
    app.state.simulator = simulator
    app.state.start_time = time.time()
    try:
        await simulator.start()
        logger.info("Traffic simulator started successfully")
    except Exception:
        logger.exception("Failed to start traffic simulator")
        raise
    yield
    logger.info("Shutting down...")
    await simulator.stop()
    logger.info("Shutdown complete")


app = FastAPI(
    title="Smart Chennai Traffic API",
    description="AI-powered traffic monitoring and optimization for Chennai",
    version="1.0.0",
    lifespan=lifespan,
    # Hide interactive docs in production for security
    docs_url="/docs" if not settings.IS_PRODUCTION else None,
    redoc_url="/redoc" if not settings.IS_PRODUCTION else None,
)

# ── CORS ─────────────────────────────────────────────────────
# In production, ALLOWED_ORIGINS comes from env var — must be your real
# Vercel domain. Never use "*" once the app is public.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Security headers ─────────────────────────────────────────
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response


# ── Global error handler ────────────────────────────────────
# Without this, an unhandled exception returns a raw stack trace to the
# browser in production, which leaks internal details. We log the full
# error server-side and return a clean message to the client.
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled error on {request.method} {request.url.path}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": "Internal server error", "path": str(request.url.path)},
    )


# ── Routes ───────────────────────────────────────────────────
app.include_router(traffic_router,   prefix="/api/traffic",   tags=["Traffic"])
app.include_router(signals_router,   prefix="/api/signals",   tags=["Signals"])
app.include_router(analytics_router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(weather_router,   prefix="/api/weather",   tags=["Weather"])
app.include_router(ws_router, tags=["WebSocket"])


@app.get("/")
async def root():
    return {
        "system": "Smart Chennai Traffic Management System",
        "version": "1.0.0",
        "status": "operational",
        "env": settings.ENV,
    }


@app.get("/health")
async def health_check(request: Request):
    """
    Render and other hosts ping this endpoint to verify the service is alive.
    Returns 200 only if the simulator is actually running.
    """
    simulator = getattr(request.app.state, "simulator", None)
    uptime = time.time() - getattr(request.app.state, "start_time", time.time())

    healthy = simulator is not None and simulator.running
    return JSONResponse(
        status_code=200 if healthy else 503,
        content={
            "status": "healthy" if healthy else "unhealthy",
            "uptime_seconds": round(uptime, 1),
            "zones_tracked": len(simulator.latest) if simulator else 0,
        },
    )


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=not settings.IS_PRODUCTION,
    )
