from pydantic import BaseModel, Field
from typing import List
from uuid import uuid4

class GroupBase(BaseModel):
    name: str
    description: str
    activity: List[str]
    location: str
    max_members: int
    age_group: str = "All Ages"

class GroupCreate(GroupBase):
    pass

class Group(GroupBase):
    id: str = Field(default_factory=lambda: str(uuid4()))
    members: List[str] = []  # List of User IDs
    admin_id: str

class GroupRecommendation(Group):
    relevance_score: int
    score_breakdown: dict = {}
