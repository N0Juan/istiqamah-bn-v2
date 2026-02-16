"""
Unit tests for API endpoints
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


class TestHealthEndpoint:
    """Test health check endpoint"""

    def test_health_check(self):
        """Test health check returns 200"""
        response = client.get("/api/health")
        assert response.status_code == 200

        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data
        assert "service" in data


class TestRootEndpoint:
    """Test root endpoint"""

    def test_root(self):
        """Test root endpoint returns service info"""
        response = client.get("/")
        assert response.status_code == 200

        data = response.json()
        assert "service" in data
        assert "version" in data
        assert "status" in data


# Note: Full API tests require database setup
# Additional tests to be written for prayer times endpoints
