from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth import require_admin
from db import get_db
from models import HelperDocument, User
from schemas import DocumentCreateRequest, DocumentResponse, DocumentUpdateRequest
from utils import (
    get_document_or_404,
    get_helper_or_404,
    to_document_response,
    validate_document_dates,
)

router = APIRouter(prefix="/documents", tags=["documents"])


@router.get("", response_model=list[DocumentResponse])
def list_documents(db: Session = Depends(get_db), _user: User = Depends(require_admin)):
    return [
        to_document_response(d)
        for d in db.query(HelperDocument).order_by(HelperDocument.helper_id, HelperDocument.document_type).all()
    ]


@router.post("", response_model=DocumentResponse, status_code=201)
def create_document(
    body: DocumentCreateRequest,
    db: Session = Depends(get_db),
    _user: User = Depends(require_admin),
):
    get_helper_or_404(db, body.helper_id)
    validate_document_dates(body.issue_date, body.expiry_date)
    document = HelperDocument(
        helper_id=body.helper_id,
        document_type=body.document_type.strip(),
        document_number=body.document_number.strip(),
        issue_date=body.issue_date,
        expiry_date=body.expiry_date,
        document_status=body.document_status,
        notes=body.notes,
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    return to_document_response(document)


@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(
    document_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(require_admin),
):
    return to_document_response(get_document_or_404(db, document_id))


@router.put("/{document_id}", response_model=DocumentResponse)
def update_document(
    document_id: int,
    body: DocumentUpdateRequest,
    db: Session = Depends(get_db),
    _user: User = Depends(require_admin),
):
    document = get_document_or_404(db, document_id)
    get_helper_or_404(db, body.helper_id)
    validate_document_dates(body.issue_date, body.expiry_date)
    document.helper_id = body.helper_id
    document.document_type = body.document_type.strip()
    document.document_number = body.document_number.strip()
    document.issue_date = body.issue_date
    document.expiry_date = body.expiry_date
    document.document_status = body.document_status
    document.notes = body.notes
    db.commit()
    db.refresh(document)
    return to_document_response(document)


@router.delete("/{document_id}", status_code=204)
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(require_admin),
):
    document = get_document_or_404(db, document_id)
    db.delete(document)
    db.commit()
