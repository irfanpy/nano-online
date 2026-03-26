from datetime import timedelta

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from auth import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    create_access_token,
    get_current_user,
    seed_demo_admin,
    verify_password,
)
from db import SessionLocal, engine, get_db
from models import Base, User
from schemas import LoginRequest, ProfileResponse, TokenResponse
from routers import (
    assignments,
    availability,
    documents,
    employers,
    experience,
    helper_roles,
    helpers,
    job_requests,
    locations,
    skills,
    stats,
)

app = FastAPI(title="Nano.Online API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_demo_admin(db)
    finally:
        db.close()


# ── Auth endpoints ─────────────────────────────────────

@app.post("/auth/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == body.username).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    token = create_access_token(
        subject=user.username,
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return TokenResponse(access_token=token, token_type="bearer")


@app.get("/auth/me", response_model=ProfileResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return ProfileResponse(username=current_user.username)


# ── Routers ────────────────────────────────────────────

app.include_router(locations.router)
app.include_router(helper_roles.router)
app.include_router(helpers.router)
app.include_router(employers.router)
app.include_router(job_requests.router)
app.include_router(assignments.router)
app.include_router(availability.router)
app.include_router(skills.router)
app.include_router(experience.router)
app.include_router(documents.router)
app.include_router(stats.router)
