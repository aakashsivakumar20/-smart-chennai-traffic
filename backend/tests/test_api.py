"""
Basic test suite for the Smart Chennai Traffic API.
Run with: pytest backend/tests/ -v
"""

import pytest
from httpx import AsyncClient, ASGITransport
from main import app


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.mark.asyncio
async def test_root(client):
    resp = await client.get("/")
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "operational"


@pytest.mark.asyncio
async def test_health_check(client):
    resp = await client.get("/health")
    # 200 if simulator already warmed up, 503 if still starting — both valid
    assert resp.status_code in (200, 503)
    assert "status" in resp.json()


@pytest.mark.asyncio
async def test_zones_endpoint(client):
    resp = await client.get("/api/traffic/zones")
    assert resp.status_code == 200
    zones = resp.json()
    assert isinstance(zones, list)
    assert len(zones) > 0
    assert "id" in zones[0]
    assert "lat" in zones[0]


@pytest.mark.asyncio
async def test_zone_not_found(client):
    resp = await client.get("/api/traffic/zone/nonexistent_zone")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_analytics_history(client):
    resp = await client.get("/api/analytics/history")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 24  # one entry per hour


@pytest.mark.asyncio
async def test_analytics_summary(client):
    resp = await client.get("/api/analytics/summary")
    assert resp.status_code == 200
    assert "total_vehicles_today" in resp.json()
