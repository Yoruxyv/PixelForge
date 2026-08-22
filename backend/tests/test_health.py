from fastapi.testclient import TestClient

from app.factory import create_app


def test_health_endpoint_reports_api_availability() -> None:
    response = TestClient(create_app()).get("/")

    assert response.status_code == 200
    assert response.json() == {
        "status": "online",
        "message": "PixelForge API is running",
        "docs": "/api/docs",
    }
