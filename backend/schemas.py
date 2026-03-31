from datetime import date, datetime, time

from pydantic import BaseModel, ConfigDict


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str


class ProfileResponse(BaseModel):
    username: str


class UserRegisterRequest(BaseModel):
    name: str
    email: str
    phone: str
    password: str
    address: str


class UserLoginRequest(BaseModel):
    email: str
    password: str


class UserProfileResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: str
    address: str
    created_at: datetime


class PaginatedResponse(BaseModel):
    items: list[dict]
    total: int
    page: int
    page_size: int


# ── Locations ──────────────────────────────────────────

class LocationCreateRequest(BaseModel):
    area_name: str
    zone: str
    city: str = "Dubai"
    latitude: float | None = None
    longitude: float | None = None


class LocationUpdateRequest(LocationCreateRequest):
    pass


class LocationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    area_name: str
    zone: str
    city: str
    latitude: float | None = None
    longitude: float | None = None


# ── Helper roles ───────────────────────────────────────

class HelperRoleCreateRequest(BaseModel):
    name: str
    description: str | None = None


class HelperRoleUpdateRequest(HelperRoleCreateRequest):
    pass


class HelperRoleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None = None


# ── Helpers ────────────────────────────────────────────

class HelperCreateRequest(BaseModel):
    full_name: str
    phone: str
    address: str
    role_id: int
    notes: str | None = None
    hourly_rate: float | None = None
    is_active: bool = True
    location_id: int | None = None


class HelperUpdateRequest(HelperCreateRequest):
    pass


class HelperResponse(BaseModel):
    id: int
    full_name: str
    phone: str
    address: str
    role_id: int
    role_name: str
    notes: str | None = None
    hourly_rate: float | None = None
    is_active: bool
    location_id: int | None = None
    location_name: str | None = None




# ── Employers ──────────────────────────────────────────

class EmployerCreateRequest(BaseModel):
    family_name: str
    contact_name: str
    phone: str
    email: str
    address: str
    location_id: int
    number_of_adults: int
    number_of_children: int
    children_ages: str | None = None
    preferred_helper_type: str
    language_preference: str
    working_hours: str
    budget_min: int
    budget_max: int


class EmployerUpdateRequest(EmployerCreateRequest):
    pass


class EmployerResponse(BaseModel):
    id: int
    family_name: str
    contact_name: str
    phone: str
    email: str
    address: str
    location_id: int
    location_name: str
    number_of_adults: int
    number_of_children: int
    children_ages: str | None = None
    preferred_helper_type: str
    language_preference: str
    working_hours: str
    budget_min: int
    budget_max: int
    total_job_requests: int
    total_assignments: int


# ── Job requests ───────────────────────────────────────

class JobRequestCreateRequest(BaseModel):
    employer_id: int
    location_id: int
    job_category: str
    description: str
    required_skills: str | None = None
    salary_min: int
    salary_max: int
    working_hours: str
    live_in: bool
    start_date: date
    status: str = "draft"


class JobRequestUpdateRequest(JobRequestCreateRequest):
    pass


class JobRequestResponse(BaseModel):
    id: int
    employer_id: int
    employer_family_name: str
    location_id: int
    location_name: str
    job_category: str
    description: str
    required_skills: str | None = None
    salary_min: int
    salary_max: int
    working_hours: str
    live_in: bool
    start_date: date
    status: str


# ── Assignments ────────────────────────────────────────

class AssignmentCreateRequest(BaseModel):
    helper_id: int
    job_request_id: int
    start_date: date
    end_date: date | None = None
    status: str = "pending"
    notes: str | None = None


class AssignmentUpdateRequest(BaseModel):
    start_date: date
    end_date: date | None = None
    status: str
    notes: str | None = None


class AssignmentStatusUpdateRequest(BaseModel):
    status: str
    notes: str | None = None
    end_date: date | None = None


class AssignmentResponse(BaseModel):
    id: int
    helper_id: int
    helper_name: str
    job_request_id: int
    employer_id: int
    employer_family_name: str
    start_date: date
    end_date: date | None = None
    status: str
    notes: str | None = None


# ── Availability ───────────────────────────────────────

class AvailabilityCreateRequest(BaseModel):
    helper_id: int
    day_of_week: str
    start_time: time
    end_time: time
    availability_status: str = "available"


class AvailabilityUpdateRequest(AvailabilityCreateRequest):
    pass


class AvailabilityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    helper_id: int
    day_of_week: str
    start_time: time
    end_time: time
    availability_status: str


# ── Skills ─────────────────────────────────────────────

class SkillCreateRequest(BaseModel):
    skill_name: str
    category: str
    description: str | None = None


class SkillUpdateRequest(SkillCreateRequest):
    pass


class SkillResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    skill_name: str
    category: str
    description: str | None = None


# ── Experience ─────────────────────────────────────────

class ExperienceCreateRequest(BaseModel):
    helper_id: int
    employer_name: str
    role_title: str
    start_date: date
    end_date: date | None = None
    responsibilities: str | None = None


class ExperienceUpdateRequest(ExperienceCreateRequest):
    pass


class ExperienceResponse(BaseModel):
    id: int
    helper_id: int
    helper_name: str
    employer_name: str
    role_title: str
    start_date: date
    end_date: date | None = None
    responsibilities: str | None = None


class PublicHelperResponse(BaseModel):
    id: int
    full_name: str
    role_name: str
    notes: str | None = None
    hourly_rate: float | None = None
    is_active: bool
    location_name: str | None = None
    availability: list[AvailabilityResponse] = []
    skills: list[SkillResponse] = []


class PublicHelperDetailResponse(PublicHelperResponse):
    experience: list[ExperienceResponse] = []


# ── Documents ──────────────────────────────────────────

class DocumentCreateRequest(BaseModel):
    helper_id: int
    document_type: str
    document_number: str
    issue_date: date | None = None
    expiry_date: date | None = None
    document_status: str = "active"
    notes: str | None = None


class DocumentUpdateRequest(DocumentCreateRequest):
    pass


class DocumentResponse(BaseModel):
    id: int
    helper_id: int
    helper_name: str
    document_type: str
    document_number: str
    issue_date: date | None = None
    expiry_date: date | None = None
    document_status: str
    notes: str | None = None


# ── Bookings ──────────────────────────────────────────

class BookingCreateRequest(BaseModel):
    helper_id: int
    date: date
    start_time: time
    end_time: time
    status: str = "pending"
    total_price: float | None = None


class BookingRescheduleRequest(BaseModel):
    date: date
    start_time: time
    end_time: time


class BookingResponse(BaseModel):
    id: int
    user_id: int
    helper_id: int
    helper_name: str
    date: date
    start_time: time
    end_time: time
    status: str
    total_price: float | None = None
    created_at: datetime
    has_review: bool = False


class ReviewCreateRequest(BaseModel):
    rating: int | None = None
    comment: str


class ReviewResponse(BaseModel):
    id: int
    booking_id: int
    user_id: int
    helper_id: int
    rating: int | None = None
    comment: str
    created_at: datetime
