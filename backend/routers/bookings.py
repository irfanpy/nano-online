from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth import get_current_user
from db import get_db
from models import Booking, Helper, Review, User
from schemas import BookingCreateRequest, BookingRescheduleRequest, BookingResponse, ReviewCreateRequest, ReviewResponse
from utils import get_helper_or_404, to_booking_response, validate_booking_conflict

router = APIRouter(prefix="/api/bookings", tags=["bookings"])


def ensure_within_schedule(helper: Helper, date_value, start_time, end_time) -> None:
    day_name = date_value.strftime("%A").lower()
    schedules = [
        s
        for s in helper.availability_schedules
        if s.day_of_week.lower() == day_name and s.availability_status == "available"
    ]
    if not schedules:
        raise HTTPException(status_code=400, detail="No availability for selected date")

    for schedule in schedules:
        if start_time >= schedule.start_time and end_time <= schedule.end_time:
            return

    raise HTTPException(status_code=400, detail="Requested time is outside availability")


def ensure_status_allowed(status_value: str) -> None:
    allowed = {"pending", "confirmed", "completed", "cancelled"}
    if status_value not in allowed:
        raise HTTPException(status_code=400, detail="Invalid booking status")


@router.post("", response_model=BookingResponse, status_code=201)
def create_booking(
    body: BookingCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    helper = get_helper_or_404(db, body.helper_id)
    if not helper.is_active:
        raise HTTPException(status_code=400, detail="Helper is not active")

    ensure_status_allowed(body.status)
    validate_booking_conflict(db, body.helper_id, body.date, body.start_time, body.end_time)
    ensure_within_schedule(helper, body.date, body.start_time, body.end_time)

    booking = Booking(
        user_id=current_user.id,
        helper_id=body.helper_id,
        date=body.date,
        start_time=body.start_time,
        end_time=body.end_time,
        status=body.status,
        total_price=body.total_price,
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return to_booking_response(booking)


@router.get("/user", response_model=list[BookingResponse])
def list_user_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    bookings = (
        db.query(Booking)
        .filter(Booking.user_id == current_user.id)
        .order_by(Booking.date.desc(), Booking.start_time.desc())
        .all()
    )
    return [to_booking_response(booking) for booking in bookings]


@router.put("/{booking_id}/cancel", response_model=BookingResponse)
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed to cancel this booking")

    booking.status = "cancelled"
    db.commit()
    db.refresh(booking)
    return to_booking_response(booking)


@router.put("/{booking_id}/reschedule", response_model=BookingResponse)
def reschedule_booking(
    booking_id: int,
    body: BookingRescheduleRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed to reschedule this booking")
    if booking.status == "cancelled":
        raise HTTPException(status_code=400, detail="Cancelled booking cannot be rescheduled")

    helper = get_helper_or_404(db, booking.helper_id)
    validate_booking_conflict(db, booking.helper_id, body.date, body.start_time, body.end_time, booking.id)
    ensure_within_schedule(helper, body.date, body.start_time, body.end_time)

    booking.date = body.date
    booking.start_time = body.start_time
    booking.end_time = body.end_time
    db.commit()
    db.refresh(booking)
    return to_booking_response(booking)


@router.put("/{booking_id}/complete", response_model=BookingResponse)
def complete_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed to complete this booking")
    if booking.status == "cancelled":
        raise HTTPException(status_code=400, detail="Cancelled booking cannot be completed")

    booking.status = "completed"
    db.commit()
    db.refresh(booking)
    return to_booking_response(booking)


@router.post("/{booking_id}/review", response_model=ReviewResponse, status_code=201)
def create_review(
    booking_id: int,
    body: ReviewCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed to review this booking")
    if booking.status != "completed":
        raise HTTPException(status_code=400, detail="Booking must be completed to leave feedback")
    if booking.review:
        raise HTTPException(status_code=400, detail="Feedback already submitted")
    if body.rating is not None and (body.rating < 1 or body.rating > 5):
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    review = Review(
        booking_id=booking.id,
        user_id=current_user.id,
        helper_id=booking.helper_id,
        rating=body.rating,
        comment=body.comment.strip(),
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return ReviewResponse(
        id=review.id,
        booking_id=review.booking_id,
        user_id=review.user_id,
        helper_id=review.helper_id,
        rating=review.rating,
        comment=review.comment,
        created_at=review.created_at,
    )
