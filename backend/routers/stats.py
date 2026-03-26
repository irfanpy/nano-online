from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from auth import require_admin
from db import get_db
from models import (
    AvailabilitySchedule,
    Employer,
    Helper,
    HelperAssignment,
    HelperDocument,
    HelperRole,
    HelperSkill,
    JobRequest,
    Location,
    ExperienceRecord,
    User,
)

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("")
def get_stats(db: Session = Depends(get_db), _user: User = Depends(require_admin)):
    helpers_total = db.query(func.count(Helper.id)).scalar()
    helpers_active = db.query(func.count(Helper.id)).filter(Helper.is_active == True).scalar()
    roles = db.query(func.count(HelperRole.id)).scalar()
    locations = db.query(func.count(Location.id)).scalar()
    employers = db.query(func.count(Employer.id)).scalar()
    job_requests_open = (
        db.query(func.count(JobRequest.id)).filter(JobRequest.status == "open").scalar()
    )
    job_requests_total = db.query(func.count(JobRequest.id)).scalar()
    assignments_active = (
        db.query(func.count(HelperAssignment.id))
        .filter(HelperAssignment.status == "active")
        .scalar()
    )
    assignments_total = db.query(func.count(HelperAssignment.id)).scalar()
    availability_records = db.query(func.count(AvailabilitySchedule.id)).scalar()
    skills = db.query(func.count(HelperSkill.id)).scalar()
    experience_records = db.query(func.count(ExperienceRecord.id)).scalar()
    documents_active = (
        db.query(func.count(HelperDocument.id))
        .filter(HelperDocument.document_status == "active")
        .scalar()
    )
    documents_total = db.query(func.count(HelperDocument.id)).scalar()

    return {
        "helpers_total": helpers_total,
        "helpers_active": helpers_active,
        "roles": roles,
        "locations": locations,
        "employers": employers,
        "job_requests_open": job_requests_open,
        "job_requests_total": job_requests_total,
        "assignments_active": assignments_active,
        "assignments_total": assignments_total,
        "availability_records": availability_records,
        "skills": skills,
        "experience_records": experience_records,
        "documents_active": documents_active,
        "documents_total": documents_total,
    }
