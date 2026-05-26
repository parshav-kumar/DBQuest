from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# ── User Schemas ──
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True

# ── Token Schemas ──
class Token(BaseModel):
    access_token: str
    token_type: str

# ── Progress Schemas ──
class ProgressCreate(BaseModel):
    topic: str
    level: int
    score: float
    passed: bool

class ProgressResponse(BaseModel):
    id: int
    topic: str
    level: int
    score: float
    passed: bool
    completed_at: datetime

    class Config:
        from_attributes = True

# ── Test Score Schemas ──
class TestScoreCreate(BaseModel):
    test_type: str
    score: float

class TestScoreResponse(BaseModel):
    id: int
    test_type: str
    score: float
    taken_at: datetime

    class Config:
        from_attributes = True

# ── Badge Schemas ──
class BadgeCreate(BaseModel):
    badge_name: str

class BadgeResponse(BaseModel):
    id: int
    badge_name: str
    earned_at: datetime

    class Config:
        from_attributes = True

# ── AI Schemas ──
class AIRequest(BaseModel):
    question: str
    topic: Optional[str] = None
    selected_answer: Optional[str] = None
    correct_answer: Optional[str] = None