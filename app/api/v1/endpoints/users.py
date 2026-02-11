from fastapi import APIRouter, HTTPException, status, Header
from typing import List, Optional
from app.models.user import User, UserCreate
from app.data import storage

router = APIRouter()

@router.post("/", response_model=User, status_code=status.HTTP_201_CREATED)
def create_user(user_in: UserCreate):
    """
    Create a new user.
    """
    # Check if email already exists (simple linear search for now)
    users = storage.get_all("users")
    for user in users:
        if user["email"] == user_in.email:
            raise HTTPException(
                status_code=400,
                detail="The user with this email already exists in the system.",
            )
    
    # Check if ID already exists (if provided)
    if user_in.id:
        existing_user = storage.get_item_by_id("users", user_in.id)
        if existing_user:
             # If user exists, return it (idempotency for demo)
            return User(**existing_user)

    user_data = user_in.dict()
    if user_data.get("id") is None:
        del user_data["id"]
        
    user = User(**user_data)
    storage.add_item("users", user.dict())
    return user

@router.get("/", response_model=List[User])
def read_users(skip: int = 0, limit: int = 100):
    """
    Retrieve users.
    """
    users = storage.get_all("users")
    return users[skip : skip + limit]

@router.get("/{user_id}", response_model=User)
def read_user_by_id(user_id: str):
    """
    Get a specific user by id.
    """
    user = storage.get_item_by_id("users", user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail=f"User '{user_id}' not found",
        )
    return user

@router.post("/{user_id}/like", response_model=User)
def like_user(
    user_id: str,
    x_user_id: str = Header(..., description="User ID of the user who is liking")
):
    """
    Like a user.
    """
    # Target user
    target_user = storage.get_item_by_id("users", user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail=f"User '{user_id}' not found")
        
    # Validation: Actor exists
    actor_user = storage.get_item_by_id("users", x_user_id)
    if not actor_user:
        raise HTTPException(status_code=404, detail="Actor user not found")
        
    # Validation: Self-like
    if user_id == x_user_id:
        raise HTTPException(status_code=400, detail="Cannot like yourself")
        
    # Logic: Add specific unique like
    if x_user_id not in target_user.get("liked_by", []):
         # Ensure liked_by exists (migration-safe-ish for json)
        if "liked_by" not in target_user:
            target_user["liked_by"] = []
            
        target_user["liked_by"].append(x_user_id)
        storage.update_item("users", user_id, {"liked_by": target_user["liked_by"]})
        
    return target_user

@router.get("/{user_id}/likes", response_model=int)
def get_user_likes(user_id: str):
    """
    Get the number of likes a user has.
    """
    user = storage.get_item_by_id("users", user_id)
    if not user:
        raise HTTPException(status_code=404, detail=f"User '{user_id}' not found")
    
    return len(user.get("liked_by", []))

@router.post("/{user_id}/unlike", response_model=User)
def unlike_user(
    user_id: str,
    x_user_id: str = Header(..., description="User ID of the user who is unliking")
):
    """
    Unlike a user.
    """
    # Target user
    target_user = storage.get_item_by_id("users", user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail=f"User '{user_id}' not found")
        
    # Validation: Actor exists
    actor_user = storage.get_item_by_id("users", x_user_id)
    if not actor_user:
        raise HTTPException(status_code=404, detail="Actor user not found")
        
    # Logic: Remove like if exists
    if "liked_by" in target_user and x_user_id in target_user["liked_by"]:
        target_user["liked_by"].remove(x_user_id)
        storage.update_item("users", user_id, {"liked_by": target_user["liked_by"]})
        
    return target_user
