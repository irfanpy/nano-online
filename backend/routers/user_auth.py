from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth import ACCESS_TOKEN_EXPIRE_MINUTES, create_access_token, get_current_user, hash_password, verify_password
from db import get_db
from models import User
from schemas import TokenResponse, UserLoginRequest, UserProfileResponse, UserRegisterRequest
from utils import normalize_name, validate_required_text

router = APIRouter(prefix="/api/auth", tags=["user-auth"])


def validate_email(email: str) -> str:
    normalized = email.strip().lower()
    if "@" not in normalized:
        raise HTTPException(status_code=400, detail="Invalid email address")
    return normalized


@router.post("/register", response_model=UserProfileResponse, status_code=201)
def register_user(body: UserRegisterRequest, db: Session = Depends(get_db)):
    name = normalize_name(body.name, "Name")
    email = validate_email(body.email)
    phone = validate_required_text(body.phone, "Phone")
    address = validate_required_text(body.address, "Address")
    password = validate_required_text(body.password, "Password")

    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    if db.query(User).filter(User.username == email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        username=email,
        name=name,
        email=email,
        phone=phone,
        address=address,
        password_hash=hash_password(password),
        is_admin=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return UserProfileResponse(
        id=user.id,
        name=user.name or "",
        email=user.email or email,
        phone=user.phone or phone,
        address=user.address or address,
        created_at=user.created_at,
    )


@router.post("/login", response_model=TokenResponse)
def login_user(body: UserLoginRequest, db: Session = Depends(get_db)):
    email = validate_email(body.email)
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    token = create_access_token(
        subject=user.username,
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return TokenResponse(access_token=token, token_type="bearer")


@router.get("/me", response_model=UserProfileResponse)
def get_me(current_user: User = Depends(get_current_user)):
    if not current_user.email:
        raise HTTPException(status_code=403, detail="User profile is unavailable")
    return UserProfileResponse(
        id=current_user.id,
        name=current_user.name or "",
        email=current_user.email or "",
        phone=current_user.phone or "",
        address=current_user.address or "",
        created_at=current_user.created_at,
    )
