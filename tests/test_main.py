import pytest

@pytest.mark.asyncio
async def test_health_check(client):
    response = await client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy Status"}

@pytest.mark.asyncio
async def test_404_page(client):
    response = await client.get("/api/non-existent-endpoint")
    assert response.status_code == 404
