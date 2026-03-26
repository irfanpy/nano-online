from datetime import date, time

from fastapi import HTTPException
from sqlalchemy.orm import Session

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
)
from schemas import (
    AssignmentResponse,
    AvailabilityResponse,
    DocumentResponse,
    EmployerResponse,
    ExperienceResponse,
    HelperResponse,
    JobRequestResponse,
    LocationResponse,
)


# ── Normalization ──────────────────────────────────────

def normalize_name(value: str, field_name: str) -> str:
    normalized = " ".join(value.strip().split())
    if not normalized:
        raise HTTPException(status_code=400, detail=f"{field_name} is required")
    return normalized


def normalize_role_name(name: str) -> str:
    return normalize_name(name.lower(), "Role name")


def validate_required_text(value: str, field_name: str) -> str:
    normalized = value.strip()
    if not normalized:
        raise HTTPException(status_code=400, detail=f"{field_name} is required")
    return normalized


def normalize_choice(value: str, allowed: set[str], field_name: str) -> str:
    normalized = value.strip().lower()
    if normalized not in allowed:
        allowed_values = ", ".join(sorted(allowed))
        raise HTTPException(
            status_code=400,
            detail=f"Invalid {field_name}. Allowed values: {allowed_values}",
        )
    return normalized


def validate_budget(minimum: int, maximum: int) -> None:
    if minimum < 0 or maximum < 0 or minimum > maximum:
        raise HTTPException(status_code=400, detail="Invalid budget range")


def validate_salary(minimum: int, maximum: int) -> None:
    if minimum < 0 or maximum < 0 or minimum > maximum:
        raise HTTPException(status_code=400, detail="Invalid salary range")


def validate_document_dates(issue_date: date | None, expiry_date: date | None) -> None:
    if issue_date and expiry_date and expiry_date <= issue_date:
        raise HTTPException(status_code=400, detail="Expiry date must be after issue date")


# ── Get-or-404 helpers ─────────────────────────────────

def get_location_or_404(db: Session, location_id: int) -> Location:
    location = db.query(Location).filter(Location.id == location_id).first()
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    return location


def get_role_or_404(db: Session, role_id: int) -> HelperRole:
    role = db.query(HelperRole).filter(HelperRole.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Helper role not found")
    return role


def get_helper_or_404(db: Session, helper_id: int) -> Helper:
    helper = db.query(Helper).filter(Helper.id == helper_id).first()
    if not helper:
        raise HTTPException(status_code=404, detail="Helper not found")
    return helper


def get_employer_or_404(db: Session, employer_id: int) -> Employer:
    employer = db.query(Employer).filter(Employer.id == employer_id).first()
    if not employer:
        raise HTTPException(status_code=404, detail="Employer not found")
    return employer


def get_job_request_or_404(db: Session, job_request_id: int) -> JobRequest:
    job_request = db.query(JobRequest).filter(JobRequest.id == job_request_id).first()
    if not job_request:
        raise HTTPException(status_code=404, detail="Job request not found")
    return job_request


def get_assignment_or_404(db: Session, assignment_id: int) -> HelperAssignment:
    assignment = (
        db.query(HelperAssignment).filter(HelperAssignment.id == assignment_id).first()
    )
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return assignment


def get_skill_or_404(db: Session, skill_id: int) -> HelperSkill:
    skill = db.query(HelperSkill).filter(HelperSkill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    return skill


def get_experience_or_404(db: Session, experience_id: int) -> ExperienceRecord:
    record = (
        db.query(ExperienceRecord).filter(ExperienceRecord.id == experience_id).first()
    )
    if not record:
        raise HTTPException(status_code=404, detail="Experience record not found")
    return record


def get_document_or_404(db: Session, document_id: int) -> HelperDocument:
    document = db.query(HelperDocument).filter(HelperDocument.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return document


def get_availability_or_404(db: Session, schedule_id: int) -> AvailabilitySchedule:
    schedule = (
        db.query(AvailabilitySchedule)
        .filter(AvailabilitySchedule.id == schedule_id)
        .first()
    )
    if not schedule:
        raise HTTPException(status_code=404, detail="Availability schedule not found")
    return schedule


# ── Business validations ───────────────────────────────

def validate_active_assignment(
    db: Session,
    helper_id: int,
    job_request_id: int,
    status_value: str,
    current_id: int | None = None,
) -> None:
    if status_value != "active":
        return
    query = db.query(HelperAssignment).filter(
        HelperAssignment.helper_id == helper_id,
        HelperAssignment.status == "active",
    )
    if current_id is not None:
        query = query.filter(HelperAssignment.id != current_id)
    if query.first():
        raise HTTPException(
            status_code=400, detail="Duplicate active assignment is not allowed"
        )


def validate_availability_overlap(
    db: Session,
    helper_id: int,
    day_of_week: str,
    start_time: time,
    end_time: time,
    current_id: int | None = None,
) -> None:
    if start_time >= end_time:
        raise HTTPException(status_code=400, detail="End time must be after start time")

    query = db.query(AvailabilitySchedule).filter(
        AvailabilitySchedule.helper_id == helper_id,
        AvailabilitySchedule.day_of_week == day_of_week,
    )
    if current_id is not None:
        query = query.filter(AvailabilitySchedule.id != current_id)

    for schedule in query.all():
        if start_time < schedule.end_time and end_time > schedule.start_time:
            raise HTTPException(
                status_code=400,
                detail="Overlapping schedule exists for this helper",
            )


# ── Response converters ────────────────────────────────

def to_location_response(location: Location) -> LocationResponse:
    return LocationResponse.model_validate(location)


def to_helper_response(helper: Helper) -> HelperResponse:
    return HelperResponse(
        id=helper.id,
        full_name=helper.full_name,
        phone=helper.phone,
        address=helper.address,
        role_id=helper.role_id,
        role_name=helper.role.name,
        notes=helper.notes,
        is_active=helper.is_active,
        location_id=helper.location_id,
        location_name=helper.location.area_name if helper.location else None,
    )


def to_employer_response(employer: Employer) -> EmployerResponse:
    assignment_count = sum(len(jr.assignments) for jr in employer.job_requests)
    return EmployerResponse(
        id=employer.id,
        family_name=employer.family_name,
        contact_name=employer.contact_name,
        phone=employer.phone,
        email=employer.email,
        address=employer.address,
        location_id=employer.location_id,
        location_name=employer.location.area_name,
        number_of_adults=employer.number_of_adults,
        number_of_children=employer.number_of_children,
        children_ages=employer.children_ages,
        preferred_helper_type=employer.preferred_helper_type,
        language_preference=employer.language_preference,
        working_hours=employer.working_hours,
        budget_min=employer.budget_min,
        budget_max=employer.budget_max,
        total_job_requests=len(employer.job_requests),
        total_assignments=assignment_count,
    )


def to_job_request_response(job_request: JobRequest) -> JobRequestResponse:
    return JobRequestResponse(
        id=job_request.id,
        employer_id=job_request.employer_id,
        employer_family_name=job_request.employer.family_name,
        location_id=job_request.location_id,
        location_name=job_request.location.area_name,
        job_category=job_request.job_category,
        description=job_request.description,
        required_skills=job_request.required_skills,
        salary_min=job_request.salary_min,
        salary_max=job_request.salary_max,
        working_hours=job_request.working_hours,
        live_in=job_request.live_in,
        start_date=job_request.start_date,
        status=job_request.status,
    )


def to_assignment_response(assignment: HelperAssignment) -> AssignmentResponse:
    return AssignmentResponse(
        id=assignment.id,
        helper_id=assignment.helper_id,
        helper_name=assignment.helper.full_name,
        job_request_id=assignment.job_request_id,
        employer_id=assignment.job_request.employer_id,
        employer_family_name=assignment.job_request.employer.family_name,
        start_date=assignment.start_date,
        end_date=assignment.end_date,
        status=assignment.status,
        notes=assignment.notes,
    )


def to_experience_response(record: ExperienceRecord) -> ExperienceResponse:
    return ExperienceResponse(
        id=record.id,
        helper_id=record.helper_id,
        helper_name=record.helper.full_name,
        employer_name=record.employer_name,
        role_title=record.role_title,
        start_date=record.start_date,
        end_date=record.end_date,
        responsibilities=record.responsibilities,
    )


def to_document_response(document: HelperDocument) -> DocumentResponse:
    return DocumentResponse(
        id=document.id,
        helper_id=document.helper_id,
        helper_name=document.helper.full_name,
        document_type=document.document_type,
        document_number=document.document_number,
        issue_date=document.issue_date,
        expiry_date=document.expiry_date,
        document_status=document.document_status,
        notes=document.notes,
    )
