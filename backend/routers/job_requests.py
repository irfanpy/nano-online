from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth import require_admin
from db import get_db
from models import JobRequest, User
from schemas import JobRequestCreateRequest, JobRequestResponse, JobRequestUpdateRequest
from utils import (
    get_employer_or_404,
    get_job_request_or_404,
    get_location_or_404,
    normalize_choice,
    to_job_request_response,
    validate_salary,
)

ALLOWED_STATUSES = {"draft", "open", "filled", "cancelled"}

router = APIRouter(prefix="/job-requests", tags=["job-requests"])


@router.get("", response_model=list[JobRequestResponse])
def list_job_requests(db: Session = Depends(get_db), _user: User = Depends(require_admin)):
    return [to_job_request_response(jr) for jr in db.query(JobRequest).order_by(JobRequest.id.desc()).all()]


@router.post("", response_model=JobRequestResponse, status_code=201)
def create_job_request(
    body: JobRequestCreateRequest,
    db: Session = Depends(get_db),
    _user: User = Depends(require_admin),
):
    get_employer_or_404(db, body.employer_id)
    get_location_or_404(db, body.location_id)
    validate_salary(body.salary_min, body.salary_max)
    status_val = normalize_choice(body.status, ALLOWED_STATUSES, "status")
    jr = JobRequest(
        employer_id=body.employer_id,
        location_id=body.location_id,
        job_category=body.job_category.strip(),
        description=body.description.strip(),
        required_skills=body.required_skills,
        salary_min=body.salary_min,
        salary_max=body.salary_max,
        working_hours=body.working_hours.strip(),
        live_in=body.live_in,
        start_date=body.start_date,
        status=status_val,
    )
    db.add(jr)
    db.commit()
    db.refresh(jr)
    return to_job_request_response(jr)


@router.get("/{job_request_id}", response_model=JobRequestResponse)
def get_job_request(
    job_request_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(require_admin),
):
    return to_job_request_response(get_job_request_or_404(db, job_request_id))


@router.put("/{job_request_id}", response_model=JobRequestResponse)
def update_job_request(
    job_request_id: int,
    body: JobRequestUpdateRequest,
    db: Session = Depends(get_db),
    _user: User = Depends(require_admin),
):
    jr = get_job_request_or_404(db, job_request_id)
    get_employer_or_404(db, body.employer_id)
    get_location_or_404(db, body.location_id)
    validate_salary(body.salary_min, body.salary_max)
    jr.employer_id = body.employer_id
    jr.location_id = body.location_id
    jr.job_category = body.job_category.strip()
    jr.description = body.description.strip()
    jr.required_skills = body.required_skills
    jr.salary_min = body.salary_min
    jr.salary_max = body.salary_max
    jr.working_hours = body.working_hours.strip()
    jr.live_in = body.live_in
    jr.start_date = body.start_date
    jr.status = normalize_choice(body.status, ALLOWED_STATUSES, "status")
    db.commit()
    db.refresh(jr)
    return to_job_request_response(jr)


@router.delete("/{job_request_id}", status_code=204)
def delete_job_request(
    job_request_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(require_admin),
):
    jr = get_job_request_or_404(db, job_request_id)
    db.delete(jr)
    db.commit()
