from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth import require_admin
from db import get_db
from models import Employer, User
from schemas import EmployerCreateRequest, EmployerResponse, EmployerUpdateRequest
from utils import (
    get_employer_or_404,
    get_location_or_404,
    normalize_name,
    to_employer_response,
    validate_budget,
)

router = APIRouter(prefix="/employers", tags=["employers"])


@router.get("", response_model=list[EmployerResponse])
def list_employers(db: Session = Depends(get_db), _user: User = Depends(require_admin)):
    return [to_employer_response(e) for e in db.query(Employer).order_by(Employer.family_name).all()]


@router.post("", response_model=EmployerResponse, status_code=201)
def create_employer(
    body: EmployerCreateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(require_admin),
):
    get_location_or_404(db, body.location_id)
    validate_budget(body.budget_min, body.budget_max)
    employer = Employer(
        family_name=normalize_name(body.family_name, "Family name"),
        contact_name=normalize_name(body.contact_name, "Contact name"),
        phone=normalize_name(body.phone, "Phone"),
        email=body.email.strip(),
        address=normalize_name(body.address, "Address"),
        location_id=body.location_id,
        number_of_adults=body.number_of_adults,
        number_of_children=body.number_of_children,
        children_ages=body.children_ages,
        preferred_helper_type=body.preferred_helper_type.strip(),
        language_preference=body.language_preference.strip(),
        working_hours=body.working_hours.strip(),
        budget_min=body.budget_min,
        budget_max=body.budget_max,
        created_by_id=user.id,
    )
    db.add(employer)
    db.commit()
    db.refresh(employer)
    return to_employer_response(employer)


@router.get("/{employer_id}", response_model=EmployerResponse)
def get_employer(employer_id: int, db: Session = Depends(get_db), _user: User = Depends(require_admin)):
    return to_employer_response(get_employer_or_404(db, employer_id))


@router.put("/{employer_id}", response_model=EmployerResponse)
def update_employer(
    employer_id: int,
    body: EmployerUpdateRequest,
    db: Session = Depends(get_db),
    _user: User = Depends(require_admin),
):
    employer = get_employer_or_404(db, employer_id)
    get_location_or_404(db, body.location_id)
    validate_budget(body.budget_min, body.budget_max)
    employer.family_name = normalize_name(body.family_name, "Family name")
    employer.contact_name = normalize_name(body.contact_name, "Contact name")
    employer.phone = normalize_name(body.phone, "Phone")
    employer.email = body.email.strip()
    employer.address = normalize_name(body.address, "Address")
    employer.location_id = body.location_id
    employer.number_of_adults = body.number_of_adults
    employer.number_of_children = body.number_of_children
    employer.children_ages = body.children_ages
    employer.preferred_helper_type = body.preferred_helper_type.strip()
    employer.language_preference = body.language_preference.strip()
    employer.working_hours = body.working_hours.strip()
    employer.budget_min = body.budget_min
    employer.budget_max = body.budget_max
    db.commit()
    db.refresh(employer)
    return to_employer_response(employer)


@router.delete("/{employer_id}", status_code=204)
def delete_employer(
    employer_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(require_admin),
):
    employer = get_employer_or_404(db, employer_id)
    db.delete(employer)
    db.commit()
