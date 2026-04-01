from pydantic  import BaseModel, EmailStr, Field
from typing    import Optional
from datetime  import datetime


# ── creation ──────────────────────────────────────────────────────────
class UserCreate(BaseModel):
    email:     EmailStr
    username:  str  = Field(..., min_length=3, max_length=50)
    password:  str  = Field(..., min_length=8)
    full_name: Optional[str] = None


# ── response (password / refresh_token không leak) ───────────────────
class UserResponse(BaseModel):
    id:         int
    email:      str
    username:   str
    full_name:  Optional[str]
    is_active:  bool
    created_at: datetime

    class Config:
        from_attributes = True


# ── auth ──────────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email:    EmailStr
    password: str


class LoginResponse(BaseModel):
    """access_token trong body.  refresh_token đi theo Set-Cookie."""
    access_token: str
    token_type:   str = "bearer"
    user:         UserResponse


class RefreshResponse(BaseModel):
    access_token: str
    token_type:   str = "bearer"