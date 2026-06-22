# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Backend (run from `backend/`)
```bash
# Dev server with hot reload
uvicorn main:app --reload --port 8000

# Production (as deployed on Render)
gunicorn main:app --workers 1 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT

# Tests
pytest tests/ -v
pytest tests/test_api.py::test_root -v   # single test
```

### Frontend (run from `frontend/`)
```bash
npm install
npm run dev       # Vite dev server on :5173
npm run build
npm run lint
```

### Docker (full stack)
```bash
cp .env.example .env
docker-compose up --build   # backend :8000, frontend :3000, redis :6379, postgres :5432
```

### AI Engine (run from `ai-engine/`)
```bash
pip install -r requirements.txt
python detection/detector.py --source traffic.mp4 --zone_id kathipara
python detection/detector.py --source 0          # webcam
python detection/detector.py --source rtsp://...  --no-show
```

## Architecture

### Data Flow
```
TrafficSimulator (asyncio loop, 3s tick)
  → generates TrafficReading per zone
  → ConnectionManager.broadcast()
    → all WebSocket clients (/ws/traffic)
      → useTrafficSocket hook
        → React state → Dashboard components
```

The simulator is the sole source of truth in Phase 1. It is stored on `app.state.simulator` so all API route handlers can read `simulator.latest` (a `Dict[zone_id → TrafficReading]`).

### Backend (`backend/`)
- **`main.py`** — app factory; registers routers, CORS, security headers, global exception handler, and the simulator lifespan
- **`config.py`** — all config via env vars; `settings.IS_PRODUCTION` gates docs UI and reload
- **`services/simulator.py`** — `TrafficSimulator` runs an asyncio task that calls `generate_zone_reading()` for each zone and broadcasts; `compute_congestion()` and `compute_green_time()` are the core business logic functions
- **`websocket/manager.py`** — singleton `connection_manager`; the simulator imports and calls it directly; the WebSocket endpoint just keeps connections alive (data is pushed, not pulled)
- **`models/traffic.py`** — Pydantic models: `TrafficReading`, `VehicleCount`, `CongestionLevel`, `AlertType`, `TrafficAlert`
- **`models/zones.py`** — `CHENNAI_ZONES` list and `ZONES_BY_ID` dict; zone `priority` (`low/medium/high`) controls base traffic volume in the simulator

### Frontend (`frontend/src/`)
- **`hooks/useTrafficSocket.js`** — the key data hook; does an initial REST fetch (`/api/traffic/live`) so the UI isn't blank, then opens a WebSocket with exponential-backoff reconnect (1s → 2s → 4s ... capped at 30s)
- **`pages/Dashboard.jsx`** — single page; consumes `useTrafficSocket` and distributes data to child components
- **`components/TrafficMap.jsx`** — Leaflet map with color-coded markers per zone; uses real GPS coordinates from `CHENNAI_ZONES`

### AI Engine (`ai-engine/`) — Phase 2, not yet active
- `detector.py` has the YOLOv8 integration stubbed out with commented `ultralytics` calls; activate by uncommenting and installing `ai-engine/requirements.txt`
- When active, it POSTs vehicle counts to `POST /api/traffic/ingest` every 30 frames; this endpoint does not yet exist (needs to be added in Phase 2)
- Auto-rickshaws are not in the COCO dataset — will need custom YOLOv8 fine-tuning

## Environment Variables

| Variable | Default | Purpose |
|---|---|---|
| `ENV` | `development` | `production` disables `/docs` and `/redoc` |
| `ALLOWED_ORIGINS` | `localhost:3000,localhost:5173` | Comma-separated CORS origins |
| `SIMULATOR_INTERVAL` | `3.0` | Seconds between traffic updates |
| `VITE_API_URL` | `http://localhost:8000` | REST base URL for frontend |
| `VITE_WS_URL` | `ws://localhost:8000/ws/traffic` | WebSocket URL (use `wss://` in production) |

Database (`DATABASE_URL`) and Redis (`REDIS_URL`) are wired in `config.py` and `docker-compose.yml` but not yet used in application code — reserved for Phase 2.

## Phase Status

- **Phase 1 (complete):** React dashboard, FastAPI backend, WebSocket with simulated data
- **Phase 2 (in progress):** YOLOv8 integration, signal optimization engine, PostgreSQL/Redis usage
- **Phase 3 (planned):** LSTM prediction, ambulance priority, mobile app

## Deployment

- **Backend → Render** (free tier; `render.yaml` is pre-configured); health check at `/health`
- **Frontend → Vercel** (`frontend/vercel.json` present); set `VITE_API_URL` and `VITE_WS_URL` env vars
- Render free tier spins down after 15 min idle — 30–60s cold start is expected
- `ALLOWED_ORIGINS` on Render must exactly match the Vercel URL (including `https://`, no trailing slash)
