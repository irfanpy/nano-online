import hashlib
import hmac
import os
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from db import SessionLocal, get_db
from models import User

SECRET_KEY = os.getenv("NANO_ONLINE_SECRET", "change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

ADMIN_USERNAME = os.getenv("NANO_ONLINE_ADMIN_USER", "admin")
ADMIN_PASSWORD = os.getenv("NANO_ONLINE_ADMIN_PASSWORD", "admin")

security = HTTPBearer()


def hash_password(password: str, salt: str | None = None) -> str:
    working_salt = salt or secrets.token_hex(16)
    hashed = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), working_salt.encode("utf-8"), 100_000
    ).hex()
    return f"{working_salt}${hashed}"


def verify_password(password: str, encoded: str) -> bool:
    try:
        salt, digest = encoded.split("$", 1)
    except ValueError:
        return False
    fresh_hash = hash_password(password, salt=salt).split("$", 1)[1]
    return hmac.compare_digest(digest, fresh_hash)


def create_access_token(subject: str, expires_delta: timedelta | None = None) -> str:
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=15))
    payload = {"sub": subject, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str | None = payload.get("sub")
        if not username:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        user = db.query(User).filter(User.username == username).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return user
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        ) from exc


def require_admin(user: User = Depends(get_current_user)) -> User:
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin permissions required"
        )
    return user


def seed_demo_admin(db: Session) -> None:
    existing = db.query(User).filter(User.username == ADMIN_USERNAME).first()
    if existing:
        existing.password_hash = hash_password(ADMIN_PASSWORD)
        existing.is_admin = True
    else:
        db.add(
            User(
                username=ADMIN_USERNAME,
                password_hash=hash_password(ADMIN_PASSWORD),
                is_admin=True,
            )
        )
    db.commit()
