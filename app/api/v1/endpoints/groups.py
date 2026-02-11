from fastapi import APIRouter, HTTPException, status, Header
from typing import List, Optional
from app.models.group import Group, GroupCreate
from app.data import storage
from app.services import recommendation

router = APIRouter()

@router.post("/", response_model=Group, status_code=status.HTTP_201_CREATED)
def create_group(
    group_in: GroupCreate,
    x_user_id: str = Header(..., description="User ID of the admin creating the group")
):
    """
    Create a new group. Requires X-User-ID header to simulate auth.
    """
    # Verify user exists
    user = storage.get_item_by_id("users", x_user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Admin user not found")

    group = Group(
        **group_in.dict(),
        admin_id=x_user_id,
        members=[x_user_id] # Admin is automatically a member
    )
    storage.add_item("groups", group.dict())
    return group

@router.get("/", response_model=List[Group])
def read_groups(skip: int = 0, limit: int = 100):
    """
    Retrieve groups.
    """
    groups = storage.get_all("groups")
    return groups[skip : skip + limit]

from app.models.group import Group, GroupCreate, GroupRecommendation

@router.get("/recommended", response_model=List[GroupRecommendation])
def get_recommendations(
    limit: int = 10,
    x_user_id: str = Header(..., description="User to get recommendations for")
):
    """
    Get personalized group recommendations.
    """
    # 1. Get User
    user = storage.get_item_by_id("users", x_user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # 2. Get All Groups
    all_groups = storage.get_all("groups")
    
    # 3. Run Algorithm
    recommended = recommendation.get_recommended_groups(user, all_groups, limit)
    
    return recommended

@router.post("/{group_id}/join", response_model=Group)
def join_group(
    group_id: str,
    x_user_id: str = Header(..., description="User ID of the user joining")
):
    """
    Join a group.
    """
    group_data = storage.get_item_by_id("groups", group_id)
    if not group_data:
        raise HTTPException(status_code=404, detail="Group not found")
    
    user = storage.get_item_by_id("users", x_user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if already a member
    if x_user_id in group_data["members"]:
        raise HTTPException(status_code=400, detail="User already in group")
    
    # Check max members
    if len(group_data["members"]) >= group_data["max_members"]:
        raise HTTPException(status_code=400, detail="Group is full")
    
    group_data["members"].append(x_user_id)
    storage.update_item("groups", group_id, {"members": group_data["members"]})
    
    return group_data

@router.post("/{group_id}/leave", response_model=Group)
def leave_group(
    group_id: str,
    x_user_id: str = Header(..., description="User ID of the user leaving")
):
    """
    Leave a group.
    """
    group_data = storage.get_item_by_id("groups", group_id)
    if not group_data:
        raise HTTPException(status_code=404, detail="Group not found")
    
    user = storage.get_item_by_id("users", x_user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if already a member
    if x_user_id not in group_data["members"]:
        raise HTTPException(status_code=400, detail="User not in group")
    
    # Check if admin
    if group_data["admin_id"] == x_user_id:
        raise HTTPException(status_code=400, detail="Admin cannot leave group")
    
    group_data["members"].remove(x_user_id)
    storage.update_item("groups", group_id, {"members": group_data["members"]})
    
    return group_data

@router.delete("/{group_id}")
def delete_group(
    group_id: str,
    x_user_id: str = Header(..., description="User ID of the admin deleting the group")
):
    """
    Delete a group (admin only).
    """
    group_data = storage.get_item_by_id("groups", group_id)
    if not group_data:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Only admin can delete
    if group_data.get("admin_id") != x_user_id:
        raise HTTPException(status_code=403, detail="Only admin can delete the group")
    
    # Delete the group
    storage.delete_item("groups", group_id)
    
    return {"message": "Group deleted successfully", "group_id": group_id}

@router.get("/groups_not_full", response_model=List[Group])
def read_groups_not_full(
    skip: int = 0,
    limit: int = 100,
    x_user_id: str = Header(..., description="User ID of the user")
):
    """
    Get groups that are looking for members (not full).
    """
    groups = storage.get_all("groups")[skip : skip + limit]
    groups_lf = []
    for group in groups:
        if len(group["members"]) < group["max_members"]:
            groups_lf.append(group)

    return groups_lf