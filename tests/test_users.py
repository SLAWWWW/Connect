import pytest
from fastapi.testclient import TestClient

def test_create_user(client: TestClient):
    response = client.post(
        "/api/v1/users/",
        json={
            "name": "Test User",
            "email": "test@example.com",
            "age": 30,
            "interests": ["Coding"],
            "location": "Test City"
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test User"
    assert "id" in data

def test_create_duplicate_user(client: TestClient):
    user_data = {
        "name": "Test User",
        "email": "test@example.com",
        "age": 30,
        "interests": ["Coding"],
        "location": "Test City"
    }
    client.post("/api/v1/users/", json=user_data)
    
    # Try creating again
    response = client.post("/api/v1/users/", json=user_data)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]

def test_get_user(client: TestClient):
    # Create user first
    create_res = client.post(
        "/api/v1/users/",
        json={
            "name": "Alice",
            "email": "alice@example.com",
            "age": 25,
            "interests": ["Badminton"],
            "location": "Jakarta"
        },
    )
    user_id = create_res.json()["id"]
    
    # Get user
    response = client.get(f"/api/v1/users/{user_id}")
    assert response.status_code == 200
    assert response.json()["name"] == "Alice"

def test_get_nonexistent_user(client: TestClient):
    response = client.get("/api/v1/users/non-existent-id")
    assert response.status_code == 404
