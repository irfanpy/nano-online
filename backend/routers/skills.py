from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth import require_admin
from db import get_db
from models import HelperSkill, User
from schemas import SkillCreateRequest, SkillResponse, SkillUpdateRequest
from utils import get_skill_or_404, normalize_name

router = APIRouter(prefix="/skills", tags=["skills"])


@router.get("", response_model=list[SkillResponse])
def list_skills(db: Session = Depends(get_db), _user: User = Depends(require_admin)):
    return db.query(HelperSkill).order_by(HelperSkill.skill_name).all()


@router.post("", response_model=SkillResponse, status_code=201)
def create_skill(
    body: SkillCreateRequest,
    db: Session = Depends(get_db),
    _user: User = Depends(require_admin),
):
    skill_name = normalize_name(body.skill_name, "Skill name")
    if db.query(HelperSkill).filter(HelperSkill.skill_name == skill_name).first():
        raise HTTPException(status_code=400, detail="Skill already exists")
    skill = HelperSkill(
        skill_name=skill_name,
        category=body.category.strip(),
        description=body.description,
    )
    db.add(skill)
    db.commit()
    db.refresh(skill)
    return skill


@router.get("/{skill_id}", response_model=SkillResponse)
def get_skill(skill_id: int, db: Session = Depends(get_db), _user: User = Depends(require_admin)):
    return get_skill_or_404(db, skill_id)


@router.put("/{skill_id}", response_model=SkillResponse)
def update_skill(
    skill_id: int,
    body: SkillUpdateRequest,
    db: Session = Depends(get_db),
    _user: User = Depends(require_admin),
):
    skill = get_skill_or_404(db, skill_id)
    skill_name = normalize_name(body.skill_name, "Skill name")
    conflict = (
        db.query(HelperSkill)
        .filter(HelperSkill.skill_name == skill_name, HelperSkill.id != skill_id)
        .first()
    )
    if conflict:
        raise HTTPException(status_code=400, detail="Another skill with this name already exists")
    skill.skill_name = skill_name
    skill.category = body.category.strip()
    skill.description = body.description
    db.commit()
    db.refresh(skill)
    return skill


@router.delete("/{skill_id}", status_code=204)
def delete_skill(
    skill_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(require_admin),
):
    skill = get_skill_or_404(db, skill_id)
    db.delete(skill)
    db.commit()
