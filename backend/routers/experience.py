from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth import require_admin
from db import get_db
from models import ExperienceRecord, User
from schemas import ExperienceCreateRequest, ExperienceResponse, ExperienceUpdateRequest
from utils import get_experience_or_404, get_helper_or_404, to_experience_response

router = APIRouter(prefix="/experience", tags=["experience"])


@router.get("", response_model=list[ExperienceResponse])
def list_experience(db: Session = Depends(get_db), _user: User = Depends(require_admin)):
    return [
        to_experience_response(r)
        for r in db.query(ExperienceRecord).order_by(ExperienceRecord.helper_id, ExperienceRecord.start_date.desc()).all()
    ]


@router.post("", response_model=ExperienceResponse, status_code=201)
def create_experience(
    body: ExperienceCreateRequest,
    db: Session = Depends(get_db),
    _user: User = Depends(require_admin),
):
    get_helper_or_404(db, body.helper_id)
    record = ExperienceRecord(
        helper_id=body.helper_id,
        employer_name=body.employer_name.strip(),
        role_title=body.role_title.strip(),
        start_date=body.start_date,
        end_date=body.end_date,
        responsibilities=body.responsibilities,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return to_experience_response(record)


@router.get("/{experience_id}", response_model=ExperienceResponse)
def get_experience(
    experience_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(require_admin),
):
    return to_experience_response(get_experience_or_404(db, experience_id))


@router.put("/{experience_id}", response_model=ExperienceResponse)
def update_experience(
    experience_id: int,
    body: ExperienceUpdateRequest,
    db: Session = Depends(get_db),
    _user: User = Depends(require_admin),
):
    record = get_experience_or_404(db, experience_id)
    get_helper_or_404(db, body.helper_id)
    record.helper_id = body.helper_id
    record.employer_name = body.employer_name.strip()
    record.role_title = body.role_title.strip()
    record.start_date = body.start_date
    record.end_date = body.end_date
    record.responsibilities = body.responsibilities
    db.commit()
    db.refresh(record)
    return to_experience_response(record)


@router.delete("/{experience_id}", status_code=204)
def delete_experience(
    experience_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(require_admin),
):
    record = get_experience_or_404(db, experience_id)
    db.delete(record)
    db.commit()
