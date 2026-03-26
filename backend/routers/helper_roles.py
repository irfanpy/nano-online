from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth import require_admin
from db import get_db
from models import HelperRole, User
from schemas import HelperRoleCreateRequest, HelperRoleResponse, HelperRoleUpdateRequest
from utils import get_role_or_404, normalize_name

router = APIRouter(prefix="/helper-roles", tags=["helper-roles"])


@router.get("", response_model=list[HelperRoleResponse])
def list_roles(db: Session = Depends(get_db), _user: User = Depends(require_admin)):
    return db.query(HelperRole).order_by(HelperRole.name).all()


@router.post("", response_model=HelperRoleResponse, status_code=201)
def create_role(
    body: HelperRoleCreateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(require_admin),
):
    name = normalize_name(body.name, "Role name").lower()
    if db.query(HelperRole).filter(HelperRole.name == name).first():
        raise HTTPException(status_code=400, detail="Role already exists")
    role = HelperRole(name=name, description=body.description, created_by_id=user.id)
    db.add(role)
    db.commit()
    db.refresh(role)
    return role


@router.get("/{role_id}", response_model=HelperRoleResponse)
def get_role(role_id: int, db: Session = Depends(get_db), _user: User = Depends(require_admin)):
    return get_role_or_404(db, role_id)


@router.put("/{role_id}", response_model=HelperRoleResponse)
def update_role(
    role_id: int,
    body: HelperRoleUpdateRequest,
    db: Session = Depends(get_db),
    _user: User = Depends(require_admin),
):
    role = get_role_or_404(db, role_id)
    name = normalize_name(body.name, "Role name").lower()
    conflict = db.query(HelperRole).filter(HelperRole.name == name, HelperRole.id != role_id).first()
    if conflict:
        raise HTTPException(status_code=400, detail="Another role with this name already exists")
    role.name = name
    role.description = body.description
    db.commit()
    db.refresh(role)
    return role


@router.delete("/{role_id}", status_code=204)
def delete_role(
    role_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(require_admin),
):
    role = get_role_or_404(db, role_id)
    db.delete(role)
    db.commit()
