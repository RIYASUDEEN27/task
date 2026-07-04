from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


# ─── Request / Input Models ───────────────────────────────────────────────────

class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=30)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


# ─── Response Models ──────────────────────────────────────────────────────────

class UserResponse(BaseModel):
    """Safe user object to return to the client (no password)."""
    id: str
    username: str
    email: str
    created_at: datetime


# ─── Internal DB Model helper ─────────────────────────────────────────────────

class UserInDB(BaseModel):
    """Full user document as stored in MongoDB."""
    username: str
    email: str
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
