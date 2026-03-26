from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth import require_admin
from db import get_db
from models import Helper, HelperSkill, User, helper_skills_table
from schemas import HelperCreateRequest, HelperResponse, HelperUpdateRequest, SkillResponse
from utils import (
    get_helper_or_404,
    get_location_or_404,
    get_role_or_404,
    get_skill_or_404,
    normalize_name,
    to_helper_response,
)

router = APIRouter(prefix="/helpers", tags=["helpers"])


@router.get("", response_model=list[HelperResponse])
def list_helpers(db: Session = Depends(get_db), _user: User = Depends(require_admin)):
    return [to_helper_response(h) for h in db.query(Helper).order_by(Helper.full_name).all()]


@router.post("", response_model=HelperResponse, status_code=201)
def create_helper(
    body: HelperCreateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(require_admin),
):
    full_name = normalize_name(body.full_name, "Full name")
    phone = normalize_name(body.phone, "Phone")
    address = normalize_name(body.address, "Address")
    get_role_or_404(db, body.role_id)
    if body.location_id:
        get_location_or_404(db, body.location_id)
    helper = Helper(
        full_name=full_name,
        phone=phone,
        address=address,
        role_id=body.role_id,
        notes=body.notes,
        is_active=body.is_active,
        location_id=body.location_id,
        created_by_id=user.id,
    )
    db.add(helper)
    db.commit()
    db.refresh(helper)
    return to_helper_response(helper)


@router.get("/{helper_id}", response_model=HelperResponse)
def get_helper(helper_id: int, db: Session = Depends(get_db), _user: User = Depends(require_admin)):
    return to_helper_response(get_helper_or_404(db, helper_id))


@router.put("/{helper_id}", response_model=HelperResponse)
def update_helper(
    helper_id: int,
    body: HelperUpdateRequest,
    db: Session = Depends(get_db),
    _user: User = Depends(require_admin),
):
    helper = get_helper_or_404(db, helper_id)
    get_role_or_404(db, body.role_id)
    if body.location_id:
        get_location_or_404(db, body.location_id)
    helper.full_name = normalize_name(body.full_name, "Full name")
    helper.phone = normalize_name(body.phone, "Phone")
    helper.address = normalize_name(body.address, "Address")
    helper.role_id = body.role_id
    helper.notes = body.notes
    helper.is_active = body.is_active
    helper.location_id = body.location_id
    db.commit()
    db.refresh(helper)
    return to_helper_response(helper)


@router.delete("/{helper_id}", status_code=204)
def delete_helper(
    helper_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(require_admin),
):
    helper = get_helper_or_404(db, helper_id)
    db.delete(helper)
    db.commit()


# ── Skills (nested under helper) ──────────────────────

@router.get("/{helper_id}/skills", response_model=list[SkillResponse])
def list_helper_skills(
    helper_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(require_admin),
):
    helper = get_helper_or_404(db, helper_id)
    return helper.skills


@router.post("/{helper_id}/skills/{skill_id}", status_code=204)
def add_helper_skill(
    helper_id: int,
    skill_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(require_admin),
):
    helper = get_helper_or_404(db, helper_id)
    skill = get_skill_or_404(db, skill_id)
    if skill in helper.skills:
        raise HTTPException(status_code=400, detail="Skill already assigned")
    helper.skills.append(skill)
    db.commit()


@router.delete("/{helper_id}/skills/{skill_id}", status_code=204)
def remove_helper_skill(
    helper_id: int,
    skill_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(require_admin),
):
    helper = get_helper_or_404(db, helper_id)
    skill = get_skill_or_404(db, skill_id)
    if skill not in helper.skills:
        raise HTTPException(status_code=400, detail="Skill not assigned to this helper")
    helper.skills.remove(skill)
    db.commit()
