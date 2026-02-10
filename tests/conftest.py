import pytest
from typing import Generator
from fastapi.testclient import TestClient
from app.main import app
from app.data import storage

# --- Mock Storage ---
# We will replace the storage functions to use an in-memory dict
mock_db = {"users": [], "groups": []}

def mock_load_db():
    return mock_db

def mock_save_db(data):
    global mock_db
    mock_db = data

@pytest.fixture(autouse=True)
def reset_db():
    """Reset the mock database before each test."""
    global mock_db
    mock_db = {"users": [], "groups": []}
    
    # Patch the real storage functions
    original_load = storage.load_db
    original_save = storage.save_db
    
    storage.load_db = mock_load_db
    storage.save_db = mock_save_db
    
    yield
    
    # Restore (though pytest teardown usually handles process isolation, 
    # it's good practice for local runs)
    storage.load_db = original_load
    storage.save_db = original_save

@pytest.fixture(scope="module")
def client() -> Generator:
    with TestClient(app) as c:
        yield c
