from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth import require_admin
from db import get_db
from models import AvailabilitySchedule, User
from schemas import (
    AvailabilityCreateRequest,
    AvailabilityResponse,
    AvailabilityUpdateRequest,
)
from utils import (
    get_availability_or_404,
    get_helper_or_404,
    validate_availability_overlap,
)

router = APIRouter(prefix="/availability", tags=["availability"])


@router.get("", response_model=list[AvailabilityResponse])
def list_availability(db: Session = Depends(get_db), _user: User = Depends(require_admin)):
    return db.query(AvailabilitySchedule).order_by(AvailabilitySchedule.helper_id).all()


@router.post("", response_model=AvailabilityResponse, status_code=201)
def create_availability(
    body: AvailabilityCreateRequest,
    db: Session = Depends(get_db),
    _user: User = Depends(require_admin),
):
    get_helper_or_404(db, body.helper_id)
    validate_availability_overlap(
        db, body.helper_id, body.day_of_week, body.start_time, body.end_time
    )
    schedule = AvailabilitySchedule(
        helper_id=body.helper_id,
        day_of_week=body.day_of_week,
        start_time=body.start_time,
        end_time=body.end_time,
        availability_status=body.availability_status,
    )
    db.add(schedule)
    db.commit()
    db.refresh(schedule)
    return schedule


@router.get("/{schedule_id}", response_model=AvailabilityResponse)
def get_availability(
    schedule_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(require_admin),
):
    return get_availability_or_404(db, schedule_id)


@router.put("/{schedule_id}", response_model=AvailabilityResponse)
def update_availability(
    schedule_id: int,
    body: AvailabilityUpdateRequest,
    db: Session = Depends(get_db),
    _user: User = Depends(require_admin),
):
    schedule = get_availability_or_404(db, schedule_id)
    get_helper_or_404(db, body.helper_id)
    validate_availability_overlap(
        db,
        body.helper_id,
        body.day_of_week,
        body.start_time,
        body.end_time,
        current_id=schedule_id,
    )
    schedule.helper_id = body.helper_id
    schedule.day_of_week = body.day_of_week
    schedule.start_time = body.start_time
    schedule.end_time = body.end_time
    schedule.availability_status = body.availability_status
    db.commit()
    db.refresh(schedule)
    return schedule


@router.delete("/{schedule_id}", status_code=204)
def delete_availability(
    schedule_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(require_admin),
):
    schedule = get_availability_or_404(db, schedule_id)
    db.delete(schedule)
    db.commit()
