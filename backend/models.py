from sqlalchemy import (
    Boolean,
    Column,
    Date,
    Float,
    ForeignKey,
    Integer,
    String,
    Table,
    Time,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from db import Base

helper_skills_table = Table(
    "helper_skills",
    Base.metadata,
    Column("helper_id", Integer, ForeignKey("helpers.id"), primary_key=True),
    Column("skill_id", Integer, ForeignKey("helper_skills_catalog.id"), primary_key=True),
    UniqueConstraint("helper_id", "skill_id", name="uq_helper_skill"),
)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(64), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)

    helper_roles = relationship("HelperRole", back_populates="created_by")
    helpers = relationship("Helper", back_populates="created_by")
    employers = relationship("Employer", back_populates="created_by")


class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    area_name = Column(String(120), nullable=False, unique=True, index=True)
    zone = Column(String(120), nullable=False)
    city = Column(String(120), nullable=False, default="Dubai")
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    helpers = relationship("Helper", back_populates="location")
    employers = relationship("Employer", back_populates="location")
    job_requests = relationship("JobRequest", back_populates="location")


class HelperRole(Base):
    __tablename__ = "helper_roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(String(255), nullable=True)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    created_by = relationship("User", back_populates="helper_roles")
    helpers = relationship("Helper", back_populates="role")


class Helper(Base):
    __tablename__ = "helpers"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(120), nullable=False, index=True)
    phone = Column(String(32), nullable=False)
    address = Column(String(255), nullable=False)
    notes = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    role_id = Column(Integer, ForeignKey("helper_roles.id"), nullable=False)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)

    role = relationship("HelperRole", back_populates="helpers")
    created_by = relationship("User", back_populates="helpers")
    location = relationship("Location", back_populates="helpers")
    assignments = relationship("HelperAssignment", back_populates="helper")
    availability_schedules = relationship(
        "AvailabilitySchedule", back_populates="helper", cascade="all, delete-orphan"
    )
    experience_records = relationship(
        "ExperienceRecord", back_populates="helper", cascade="all, delete-orphan"
    )
    documents = relationship(
        "HelperDocument", back_populates="helper", cascade="all, delete-orphan"
    )
    skills = relationship(
        "HelperSkill",
        secondary=helper_skills_table,
        back_populates="helpers",
    )


class Employer(Base):
    __tablename__ = "employers"

    id = Column(Integer, primary_key=True, index=True)
    family_name = Column(String(120), nullable=False, index=True)
    contact_name = Column(String(120), nullable=False)
    phone = Column(String(32), nullable=False)
    email = Column(String(255), nullable=False)
    address = Column(String(255), nullable=False)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    number_of_adults = Column(Integer, nullable=False, default=1)
    number_of_children = Column(Integer, nullable=False, default=0)
    children_ages = Column(String(255), nullable=True)
    preferred_helper_type = Column(String(120), nullable=False)
    language_preference = Column(String(120), nullable=False)
    working_hours = Column(String(120), nullable=False)
    budget_min = Column(Integer, nullable=False)
    budget_max = Column(Integer, nullable=False)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    location = relationship("Location", back_populates="employers")
    created_by = relationship("User", back_populates="employers")
    job_requests = relationship(
        "JobRequest", back_populates="employer", cascade="all, delete-orphan"
    )


class JobRequest(Base):
    __tablename__ = "job_requests"

    id = Column(Integer, primary_key=True, index=True)
    employer_id = Column(Integer, ForeignKey("employers.id"), nullable=False)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    job_category = Column(String(120), nullable=False, index=True)
    description = Column(String(500), nullable=False)
    required_skills = Column(String(500), nullable=True)
    salary_min = Column(Integer, nullable=False)
    salary_max = Column(Integer, nullable=False)
    working_hours = Column(String(120), nullable=False)
    live_in = Column(Boolean, default=False, nullable=False)
    start_date = Column(Date, nullable=False)
    status = Column(String(32), nullable=False, default="draft", index=True)

    employer = relationship("Employer", back_populates="job_requests")
    location = relationship("Location", back_populates="job_requests")
    assignments = relationship(
        "HelperAssignment", back_populates="job_request", cascade="all, delete-orphan"
    )


class HelperAssignment(Base):
    __tablename__ = "helper_assignments"

    id = Column(Integer, primary_key=True, index=True)
    helper_id = Column(Integer, ForeignKey("helpers.id"), nullable=False)
    job_request_id = Column(Integer, ForeignKey("job_requests.id"), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    status = Column(String(32), nullable=False, default="pending")
    notes = Column(String(500), nullable=True)

    helper = relationship("Helper", back_populates="assignments")
    job_request = relationship("JobRequest", back_populates="assignments")


class AvailabilitySchedule(Base):
    __tablename__ = "availability_schedules"

    id = Column(Integer, primary_key=True, index=True)
    helper_id = Column(Integer, ForeignKey("helpers.id"), nullable=False)
    day_of_week = Column(String(16), nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    availability_status = Column(String(32), nullable=False, default="available")

    helper = relationship("Helper", back_populates="availability_schedules")


class HelperSkill(Base):
    __tablename__ = "helper_skills_catalog"

    id = Column(Integer, primary_key=True, index=True)
    skill_name = Column(String(120), nullable=False, unique=True, index=True)
    category = Column(String(120), nullable=False)
    description = Column(String(255), nullable=True)

    helpers = relationship(
        "Helper",
        secondary=helper_skills_table,
        back_populates="skills",
    )


class ExperienceRecord(Base):
    __tablename__ = "experience_records"

    id = Column(Integer, primary_key=True, index=True)
    helper_id = Column(Integer, ForeignKey("helpers.id"), nullable=False)
    employer_name = Column(String(255), nullable=False)
    role_title = Column(String(120), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    responsibilities = Column(String(1000), nullable=True)

    helper = relationship("Helper", back_populates="experience_records")


class HelperDocument(Base):
    __tablename__ = "helper_documents"

    id = Column(Integer, primary_key=True, index=True)
    helper_id = Column(Integer, ForeignKey("helpers.id"), nullable=False)
    document_type = Column(String(120), nullable=False)
    document_number = Column(String(120), nullable=False)
    issue_date = Column(Date, nullable=True)
    expiry_date = Column(Date, nullable=True)
    document_status = Column(String(32), nullable=False, default="active")
    notes = Column(String(500), nullable=True)

    helper = relationship("Helper", back_populates="documents")
