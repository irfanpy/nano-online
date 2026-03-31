from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from db import get_db
from models import AvailabilitySchedule, Helper, HelperRole, Location
from schemas import PaginatedResponse, PublicHelperDetailResponse, PublicHelperResponse
from utils import get_helper_or_404, to_public_helper_detail_response, to_public_helper_response

router = APIRouter(prefix="/api/helpers", tags=["public-helpers"])


@router.get("", response_model=PaginatedResponse)
def list_public_helpers(
    db: Session = Depends(get_db),
    category: str | None = None,
    location: str | None = None,
    date: str | None = None,
    search: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=50),
):
    query = db.query(Helper).join(HelperRole).outerjoin(Location).filter(Helper.is_active.is_(True))

    if category:
        query = query.filter(HelperRole.name.ilike(f"%{category.strip()}%"))

    if location:
        location_value = location.strip()
        query = query.filter(
            or_(
                Location.area_name.ilike(f"%{location_value}%"),
                Location.city.ilike(f"%{location_value}%"),
            )
        )

    if search:
        search_value = search.strip()
        query = query.filter(
            or_(
                Helper.full_name.ilike(f"%{search_value}%"),
                Helper.notes.ilike(f"%{search_value}%"),
                HelperRole.name.ilike(f"%{search_value}%"),
            )
        )

    if date:
        try:
            parsed_date = datetime.strptime(date, "%Y-%m-%d").date()
            day_name = parsed_date.strftime("%A")
            query = query.join(AvailabilitySchedule).filter(
                AvailabilitySchedule.day_of_week.ilike(day_name),
                AvailabilitySchedule.availability_status == "available",
            )
        except ValueError:
            pass

    total = query.count()
    helpers = (
        query.order_by(Helper.full_name)
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    items = [to_public_helper_response(helper).model_dump() for helper in helpers]
    return PaginatedResponse(items=items, total=total, page=page, page_size=page_size)


@router.get("/{helper_id}", response_model=PublicHelperDetailResponse)
def get_public_helper(helper_id: int, db: Session = Depends(get_db)):
    helper = get_helper_or_404(db, helper_id)
    return to_public_helper_detail_response(helper)
