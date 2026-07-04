from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class Priority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


# ─── Request / Input Models ───────────────────────────────────────────────────

class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    priority: Priority = Priority.medium
    due_date: Optional[datetime] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    priority: Optional[Priority] = None
    due_date: Optional[datetime] = None
    completed: Optional[bool] = None


# ─── Response Models ──────────────────────────────────────────────────────────

class TaskResponse(BaseModel):
    """Task object returned to the client."""
    id: str
    user_id: str
    title: str
    description: Optional[str] = None
    priority: Priority
    due_date: Optional[datetime] = None
    completed: bool
    created_at: datetime
    updated_at: datetime
