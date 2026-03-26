from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth import require_admin
from db import get_db
from models import HelperAssignment, User
from schemas import (
    AssignmentCreateRequest,
    AssignmentResponse,
    AssignmentStatusUpdateRequest,
    AssignmentUpdateRequest,
)
from utils import (
    get_assignment_or_404,
    get_helper_or_404,
    get_job_request_or_404,
    normalize_choice,
    to_assignment_response,
    validate_active_assignment,
)

ALLOWED_STATUSES = {"pending", "active", "completed", "cancelled"}

router = APIRouter(prefix="/assignments", tags=["assignments"])


@router.get("", response_model=list[AssignmentResponse])
def list_assignments(db: Session = Depends(get_db), _user: User = Depends(require_admin)):
    return [
        to_assignment_response(a)
        for a in db.query(HelperAssignment).order_by(HelperAssignment.id.desc()).all()
    ]


@router.post("", response_model=AssignmentResponse, status_code=201)
def create_assignment(
    body: AssignmentCreateRequest,
    db: Session = Depends(get_db),
    _user: User = Depends(require_admin),
):
    get_helper_or_404(db, body.helper_id)
    get_job_request_or_404(db, body.job_request_id)
    status_val = normalize_choice(body.status, ALLOWED_STATUSES, "status")
    validate_active_assignment(db, body.helper_id, body.job_request_id, status_val)
    assignment = HelperAssignment(
        helper_id=body.helper_id,
        job_request_id=body.job_request_id,
        start_date=body.start_date,
        end_date=body.end_date,
        status=status_val,
        notes=body.notes,
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return to_assignment_response(assignment)


@router.get("/{assignment_id}", response_model=AssignmentResponse)
def get_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(require_admin),
):
    return to_assignment_response(get_assignment_or_404(db, assignment_id))


@router.put("/{assignment_id}", response_model=AssignmentResponse)
def update_assignment(
    assignment_id: int,
    body: AssignmentUpdateRequest,
    db: Session = Depends(get_db),
    _user: User = Depends(require_admin),
):
    assignment = get_assignment_or_404(db, assignment_id)
    status_val = normalize_choice(body.status, ALLOWED_STATUSES, "status")
    validate_active_assignment(
        db, assignment.helper_id, assignment.job_request_id, status_val, current_id=assignment_id
    )
    assignment.start_date = body.start_date
    assignment.end_date = body.end_date
    assignment.status = status_val
    assignment.notes = body.notes
    db.commit()
    db.refresh(assignment)
    return to_assignment_response(assignment)


@router.patch("/{assignment_id}/status", response_model=AssignmentResponse)
def update_assignment_status(
    assignment_id: int,
    body: AssignmentStatusUpdateRequest,
    db: Session = Depends(get_db),
    _user: User = Depends(require_admin),
):
    assignment = get_assignment_or_404(db, assignment_id)
    status_val = normalize_choice(body.status, ALLOWED_STATUSES, "status")
    validate_active_assignment(
        db, assignment.helper_id, assignment.job_request_id, status_val, current_id=assignment_id
    )
    assignment.status = status_val
    if body.notes is not None:
        assignment.notes = body.notes
    if body.end_date is not None:
        assignment.end_date = body.end_date
    db.commit()
    db.refresh(assignment)
    return to_assignment_response(assignment)


@router.delete("/{assignment_id}", status_code=204)
def delete_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(require_admin),
):
    assignment = get_assignment_or_404(db, assignment_id)
    db.delete(assignment)
    db.commit()
