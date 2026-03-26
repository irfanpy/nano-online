from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth import require_admin
from db import get_db
from models import Location, User
from schemas import LocationCreateRequest, LocationResponse, LocationUpdateRequest
from utils import get_location_or_404, normalize_name, to_location_response

router = APIRouter(prefix="/locations", tags=["locations"])


@router.get("", response_model=list[LocationResponse])
def list_locations(db: Session = Depends(get_db), _user: User = Depends(require_admin)):
    return [to_location_response(loc) for loc in db.query(Location).order_by(Location.area_name).all()]


@router.post("", response_model=LocationResponse, status_code=201)
def create_location(
    body: LocationCreateRequest,
    db: Session = Depends(get_db),
    _user: User = Depends(require_admin),
):
    area_name = normalize_name(body.area_name, "Area name")
    zone = normalize_name(body.zone, "Zone")
    city = normalize_name(body.city, "City")
    if db.query(Location).filter(Location.area_name == area_name).first():
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Location with this area name already exists")
    location = Location(area_name=area_name, zone=zone, city=city, latitude=body.latitude, longitude=body.longitude)
    db.add(location)
    db.commit()
    db.refresh(location)
    return to_location_response(location)


@router.get("/{location_id}", response_model=LocationResponse)
def get_location(
    location_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(require_admin),
):
    return to_location_response(get_location_or_404(db, location_id))


@router.put("/{location_id}", response_model=LocationResponse)
def update_location(
    location_id: int,
    body: LocationUpdateRequest,
    db: Session = Depends(get_db),
    _user: User = Depends(require_admin),
):
    from fastapi import HTTPException
    location = get_location_or_404(db, location_id)
    area_name = normalize_name(body.area_name, "Area name")
    zone = normalize_name(body.zone, "Zone")
    city = normalize_name(body.city, "City")
    conflict = db.query(Location).filter(Location.area_name == area_name, Location.id != location_id).first()
    if conflict:
        raise HTTPException(status_code=400, detail="Another location with this area name already exists")
    location.area_name = area_name
    location.zone = zone
    location.city = city
    location.latitude = body.latitude
    location.longitude = body.longitude
    db.commit()
    db.refresh(location)
    return to_location_response(location)


@router.delete("/{location_id}", status_code=204)
def delete_location(
    location_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(require_admin),
):
    location = get_location_or_404(db, location_id)
    db.delete(location)
    db.commit()
