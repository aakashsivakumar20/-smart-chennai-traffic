# Smart Chennai Traffic Management System

An AI-powered, real-time traffic monitoring and congestion optimization platform for Chennai. Monitors vehicle density across 12 junctions, classifies congestion, optimizes signal timing dynamically, and streams live updates to a React dashboard.

## Tech Stack

- **Frontend:** React 18 + Vite, Tailwind CSS, Leaflet.js, Recharts
- **Backend:** FastAPI, WebSockets, Redis, PostgreSQL
- **AI Engine:** YOLOv8, OpenCV, DeepSORT (Phase 2)
- **DevOps:** Docker Compose, GitHub Actions, Nginx

## Running Locally

**Docker (recommended)**
```bash
cp .env.example .env
docker-compose up --build
# Open http://localhost:3000
```

**Manual**
```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev

# AI Engine (Phase 2)
cd ai-engine
pip install -r requirements.txt
python detection/detector.py --source traffic.mp4 --zone_id kathipara
```

**Tests**
```bash
cd backend
pytest tests/ -v
```

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/traffic/live` | Live data for all zones |
| GET | `/api/traffic/zone/:id` | Single zone data |
| GET | `/api/analytics/history` | Historical data (24h) |
| GET | `/api/analytics/summary` | Daily summary stats |
| POST | `/api/signals/update` | Override signal timing |
| WS | `/ws/traffic` | Live update stream |

## Deployment

Backend is deployed on Render, frontend on Vercel. See `.env.example` for required environment variables. Set `ALLOWED_ORIGINS` on Render to your Vercel URL and `VITE_API_URL` / `VITE_WS_URL` on Vercel to your Render URL (use `wss://` for the WebSocket in production).

## License

MIT
