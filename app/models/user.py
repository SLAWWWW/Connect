from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import uuid4

class UserBase(BaseModel):
    name: str
    email: str
    age: int
    interests: List[str] = []
    location: str

class UserCreate(UserBase):
    id: Optional[str] = None

class User(UserBase):
    id: str = Field(default_factory=lambda: str(uuid4()))
    liked_by: List[str] = [] # List of user_ids who liked this user
