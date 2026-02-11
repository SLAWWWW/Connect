import json
import os
from typing import Dict, Any, List

DB_PATH = os.path.join(os.path.dirname(__file__), "db.json")

def load_db() -> Dict[str, List[Any]]:
    """Loads the database from the JSON file."""
    if not os.path.exists(DB_PATH):
        # Initialize if not exists
        initial_data = {"users": [], "groups": []}
        save_db(initial_data)
        return initial_data
    
    with open(DB_PATH, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return {"users": [], "groups": []}

def save_db(data: Dict[str, List[Any]]) -> None:
    """Saves the database to the JSON file."""
    with open(DB_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

def get_all(collection: str) -> List[Any]:
    """Retrieve all items from a collection (users or groups)."""
    db = load_db()
    return db.get(collection, [])

def add_item(collection: str, item: Dict[str, Any]) -> None:
    """Add an item to a collection."""
    db = load_db()
    if collection not in db:
        db[collection] = []
    
    db[collection].append(item)
    save_db(db)

def get_item_by_id(collection: str, item_id: str) -> Dict[str, Any] | None:
    """Retrieve an item by its ID."""
    items = get_all(collection)
    for item in items:
        if item.get("id") == item_id:
            return item
    return None

def update_item(collection: str, item_id: str, updates: Dict[str, Any]) -> bool:
    """Update an item in a collection. Returns True if found."""
    db = load_db()
    items = db.get(collection, [])
    
    for i, item in enumerate(items):
        if item.get("id") == item_id:
            items[i].update(updates)
            db[collection] = items
            save_db(db)
            return True
            
    return False

def delete_item(collection: str, item_id: str) -> bool:
    """Delete an item from a collection. Returns True if found."""
    db = load_db()
    items = db.get(collection, [])
    
    for i, item in enumerate(items):
        if item.get("id") == item_id:
            del items[i]
            db[collection] = items
            save_db(db)
            return True
            
    return False
