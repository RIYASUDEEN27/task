from fastapi import APIRouter, HTTPException, status, Depends
import bcrypt
from datetime import datetime

from database import get_db
from models.user import UserRegister, UserLogin, UserResponse
from middleware.auth import create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])

def hash_password(plain: str) -> str:
    # bcrypt.hashpw returns bytes; decode to store as str
    return bcrypt.hashpw(plain.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))
    except Exception:
        return False


# ─── POST /api/auth/register ──────────────────────────────────────────────────

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(body: UserRegister, db=Depends(get_db)):
    """
    Register a new user.
    - Validates that email and username are unique.
    - Hashes the password with bcrypt before storing.
    - Returns a JWT access token so the user is logged in immediately.
    """
    # Check uniqueness
    if await db.users.find_one({"email": body.email}):
        raise HTTPException(status_code=409, detail="Email already registered")
    if await db.users.find_one({"username": body.username}):
        raise HTTPException(status_code=409, detail="Username already taken")

    # Build user document
    user_doc = {
        "username": body.username,
        "email": body.email,
        "hashed_password": hash_password(body.password),
        "created_at": datetime.utcnow(),
    }

    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)

    token = create_access_token(user_id, body.username, body.email)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "username": body.username,
            "email": body.email,
        },
    }


# ─── POST /api/auth/login ─────────────────────────────────────────────────────

@router.post("/login")
async def login(body: UserLogin, db=Depends(get_db)):
    """
    Authenticate a user with email + password.
    Returns a JWT access token on success.
    """
    user = await db.users.find_one({"email": body.email})

    # Use a generic error message to avoid leaking which field is wrong
    if not user or not verify_password(body.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    user_id = str(user["_id"])
    token = create_access_token(user_id, user["username"], user["email"])

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "username": user["username"],
            "email": user["email"],
        },
    }


# ─── POST /api/auth/logout ────────────────────────────────────────────────────

@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """
    Logout endpoint. With stateless JWTs the server doesn't hold session state;
    the client is responsible for deleting the token.
    This endpoint confirms the token is valid before responding.
    """
    return {"message": "Logged out successfully"}


# ─── GET /api/auth/me ─────────────────────────────────────────────────────────

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Return the currently authenticated user's profile."""
    return {
        "id": str(current_user["_id"]),
        "username": current_user["username"],
        "email": current_user["email"],
        "created_at": current_user["created_at"],
    }
