import pytest
from fastapi.testclient import TestClient

@pytest.fixture
def admin_user(client: TestClient):
    """Helper to create a user and return their ID."""
    res = client.post(
        "/api/v1/users/",
        json={"name": "Admin", "email": "admin@example.com", "age": 20, "location": "City", "interests": []}
    )
    return res.json()["id"]

@pytest.fixture
def other_user(client: TestClient):
    """Helper to create a second user."""
    res = client.post(
        "/api/v1/users/",
        json={"name": "Bob", "email": "bob@example.com", "age": 22, "location": "City", "interests": []}
    )
    return res.json()["id"]

def test_create_group(client: TestClient, admin_user):
    response = client.post(
        "/api/v1/groups/",
        headers={"X-User-ID": admin_user},
        json={
            "name": "Badminton Group",
            "description": "Fun",
            "activity": "Badminton",
            "location": "Court A",
            "max_members": 2
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Badminton Group"
    assert data["admin_id"] == admin_user
    assert admin_user in data["members"]

def test_join_group(client: TestClient, admin_user, other_user):
    # Create group
    g_res = client.post(
        "/api/v1/groups/",
        headers={"X-User-ID": admin_user},
        json={"name": "Group 1", "description": "D", "activity": "A", "location": "L", "max_members": 2}
    )
    group_id = g_res.json()["id"]
    
    # Join group
    join_res = client.post(
        f"/api/v1/groups/{group_id}/join",
        headers={"X-User-ID": other_user}
    )
    assert join_res.status_code == 200
    assert other_user in join_res.json()["members"]

def test_join_full_group(client: TestClient, admin_user, other_user):
    # Create group with max 1 Member (the admin)
    g_res = client.post(
        "/api/v1/groups/",
        headers={"X-User-ID": admin_user},
        json={"name": "Full Group", "description": "D", "activity": "A", "location": "L", "max_members": 1}
    )
    group_id = g_res.json()["id"]
    
    # Try to join
    join_res = client.post(
        f"/api/v1/groups/{group_id}/join",
        headers={"X-User-ID": other_user}
    )
    assert join_res.status_code == 400
    assert "Group is full" in join_res.json()["detail"]

def test_leave_group(client: TestClient, admin_user, other_user):
    # Create group
    g_res = client.post(
        "/api/v1/groups/",
        headers={"X-User-ID": admin_user},
        json={"name": "Group 1", "description": "D", "activity": "A", "location": "L", "max_members": 3}
    )
    group_id = g_res.json()["id"]
    
    # Bob joins
    client.post(f"/api/v1/groups/{group_id}/join", headers={"X-User-ID": other_user})
    
    # Bob leaves
    leave_res = client.post(
        f"/api/v1/groups/{group_id}/leave",
        headers={"X-User-ID": other_user}
    )
    assert leave_res.status_code == 200
    assert other_user not in leave_res.json()["members"]

def test_admin_cannot_leave(client: TestClient, admin_user):
    # Create group
    g_res = client.post(
        "/api/v1/groups/",
        headers={"X-User-ID": admin_user},
        json={"name": "Group 1", "description": "D", "activity": "A", "location": "L", "max_members": 3}
    )
    group_id = g_res.json()["id"]
    
    # Admin tries to leave
    leave_res = client.post(
        f"/api/v1/groups/{group_id}/leave",
        headers={"X-User-ID": admin_user}
    )
    assert leave_res.status_code == 400
    assert "Admin cannot leave" in leave_res.json()["detail"]

def test_get_groups_looking_for_members(client: TestClient, admin_user):
    # Group 1: Full (1/1)
    client.post(
        "/api/v1/groups/",
        headers={"X-User-ID": admin_user},
        json={"name": "Full", "description": "D", "activity": "A", "location": "L", "max_members": 1}
    )
    
    # Group 2: Open (1/2)
    client.post(
        "/api/v1/groups/",
        headers={"X-User-ID": admin_user},
        json={"name": "Open", "description": "D", "activity": "A", "location": "L", "max_members": 2}
    )
    
    response = client.get("/api/v1/groups/groups_lf", headers={"X-User-ID": admin_user})
    assert response.status_code == 200
    data = response.json()
    
    # Only "Open" group should be returned
    assert len(data) == 1
    assert data[0]["name"] == "Open"
