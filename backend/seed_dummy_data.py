from datetime import date, time, timedelta

from auth import seed_demo_admin
from db import SessionLocal
from models import (
    AvailabilitySchedule,
    Employer,
    ExperienceRecord,
    Helper,
    HelperAssignment,
    HelperDocument,
    HelperRole,
    HelperSkill,
    JobRequest,
    Location,
    User,
)

TARGETS = {
    "locations": 12,
    "roles": 10,
    "skills": 14,
    "helpers": 14,
    "employers": 12,
    "job_requests": 14,
    "assignments": 12,
    "availability": 18,
    "helper_skills_per_helper": 2,
    "first_helper_experience": 10,
    "first_helper_documents": 10,
}

ROLE_NAMES = [
    "nanny",
    "housemaid",
    "cook",
    "caregiver",
    "driver",
    "housekeeper",
    "babysitter",
    "elderly care",
    "pet care",
    "tutor",
    "cleaning specialist",
    "laundry assistant",
]

SKILLS = [
    ("Infant Care", "Childcare"),
    ("Toddler Engagement", "Childcare"),
    ("Meal Preparation", "Cooking"),
    ("Arabic Cooking", "Cooking"),
    ("Deep Cleaning", "Housekeeping"),
    ("Laundry and Ironing", "Housekeeping"),
    ("Elderly Mobility Support", "Caregiving"),
    ("Medication Reminders", "Caregiving"),
    ("Pet Walking", "Pet Care"),
    ("Home Organization", "Housekeeping"),
    ("Basic First Aid", "Safety"),
    ("English Communication", "Language"),
    ("Driving in UAE", "Transport"),
    ("Homework Assistance", "Education"),
    ("Event Preparation", "Hospitality"),
    ("Guest Service", "Hospitality"),
]

AREAS = [
    ("Jumeirah 1", "Coastal", "Dubai"),
    ("Jumeirah 2", "Coastal", "Dubai"),
    ("Business Bay", "Central", "Dubai"),
    ("Dubai Marina", "Waterfront", "Dubai"),
    ("Al Barsha", "West", "Dubai"),
    ("Mirdif", "East", "Dubai"),
    ("Al Nahda", "North", "Dubai"),
    ("Deira", "Historic", "Dubai"),
    ("Al Safa", "Central", "Dubai"),
    ("Al Quoz", "Industrial", "Dubai"),
    ("Al Reem Island", "Coastal", "Abu Dhabi"),
    ("Khalidiya", "Downtown", "Abu Dhabi"),
    ("Al Majaz", "Lagoon", "Sharjah"),
    ("Al Taawun", "Urban", "Sharjah"),
]


def get_admin(db):
    admin = db.query(User).filter(User.is_admin == True).first()
    if not admin:
        seed_demo_admin(db)
        admin = db.query(User).filter(User.is_admin == True).first()
    return admin


def ensure_locations(db):
    existing = {loc.area_name for loc in db.query(Location).all()}
    needed = max(0, TARGETS["locations"] - len(existing))
    idx = 0
    while needed > 0 and idx < len(AREAS):
        area_name, zone, city = AREAS[idx]
        idx += 1
        if area_name in existing:
            continue
        db.add(Location(area_name=area_name, zone=zone, city=city))
        existing.add(area_name)
        needed -= 1


def ensure_roles(db, admin_id):
    existing = {role.name for role in db.query(HelperRole).all()}
    needed = max(0, TARGETS["roles"] - len(existing))
    idx = 0
    while needed > 0 and idx < len(ROLE_NAMES):
        name = ROLE_NAMES[idx]
        idx += 1
        if name in existing:
            continue
        db.add(
            HelperRole(
                name=name,
                description=f"{name.title()} role for household placements.",
                created_by_id=admin_id,
            )
        )
        existing.add(name)
        needed -= 1


def ensure_skills(db):
    existing = {s.skill_name for s in db.query(HelperSkill).all()}
    needed = max(0, TARGETS["skills"] - len(existing))
    idx = 0
    while needed > 0 and idx < len(SKILLS):
        skill_name, category = SKILLS[idx]
        idx += 1
        if skill_name in existing:
            continue
        db.add(
            HelperSkill(
                skill_name=skill_name,
                category=category,
                description=f"Verified {category.lower()} capability",
            )
        )
        existing.add(skill_name)
        needed -= 1


def ensure_helpers(db, admin_id):
    roles = db.query(HelperRole).order_by(HelperRole.id).all()
    locations = db.query(Location).order_by(Location.id).all()
    if not roles or not locations:
        return

    existing_count = db.query(Helper).count()
    needed = max(0, TARGETS["helpers"] - existing_count)
    base = existing_count + 1

    for i in range(needed):
        seq = base + i
        role = roles[i % len(roles)]
        location = locations[i % len(locations)]
        db.add(
            Helper(
                full_name=f"Demo Helper {seq:02d}",
                phone=f"050700{seq:04d}",
                address=f"Villa {seq}, {location.area_name}, {location.city}",
                notes="Experienced with UAE family routines",
                is_active=(seq % 5 != 0),
                role_id=role.id,
                location_id=location.id,
                created_by_id=admin_id,
            )
        )


def ensure_employers(db, admin_id):
    locations = db.query(Location).order_by(Location.id).all()
    if not locations:
        return

    existing_count = db.query(Employer).count()
    needed = max(0, TARGETS["employers"] - existing_count)
    base = existing_count + 1

    for i in range(needed):
        seq = base + i
        location = locations[i % len(locations)]
        children = i % 4
        ages = "4, 8" if children >= 2 else ("6" if children == 1 else None)
        db.add(
            Employer(
                family_name=f"Al Noor Family {seq:02d}",
                contact_name=f"Contact {seq:02d}",
                phone=f"055600{seq:04d}",
                email=f"family{seq:02d}@demo.local",
                address=f"Residence {seq}, {location.area_name}, {location.city}",
                location_id=location.id,
                number_of_adults=2 + (i % 2),
                number_of_children=children,
                children_ages=ages,
                preferred_helper_type="live-in" if i % 2 == 0 else "live-out",
                language_preference="English/Arabic",
                working_hours="8am-6pm",
                budget_min=2200 + (i * 100),
                budget_max=3200 + (i * 100),
                created_by_id=admin_id,
            )
        )


def ensure_job_requests(db):
    employers = db.query(Employer).order_by(Employer.id).all()
    if not employers:
        return

    categories = [
        "Nanny",
        "Housemaid",
        "Cook",
        "Caregiver",
        "Driver",
    ]
    statuses = ["open", "draft", "filled", "cancelled"]

    existing_count = db.query(JobRequest).count()
    needed = max(0, TARGETS["job_requests"] - existing_count)
    base = existing_count + 1

    for i in range(needed):
        seq = base + i
        employer = employers[i % len(employers)]
        category = categories[i % len(categories)]
        status = statuses[i % len(statuses)]
        db.add(
            JobRequest(
                employer_id=employer.id,
                location_id=employer.location_id,
                job_category=category,
                description=f"{category} needed for household support and child-safe routines ({seq}).",
                required_skills="Communication, reliability, hygiene",
                salary_min=2200 + (i * 80),
                salary_max=3200 + (i * 80),
                working_hours="8am-6pm",
                live_in=(i % 2 == 0),
                start_date=date.today() + timedelta(days=(i % 20) + 3),
                status=status,
            )
        )


def ensure_assignments(db):
    helpers = db.query(Helper).order_by(Helper.id).all()
    jobs = db.query(JobRequest).order_by(JobRequest.id).all()
    if not helpers or not jobs:
        return

    existing_count = db.query(HelperAssignment).count()
    needed = max(0, TARGETS["assignments"] - existing_count)
    base = existing_count + 1

    active_helper_ids = {
        a.helper_id for a in db.query(HelperAssignment).filter(HelperAssignment.status == "active").all()
    }

    for i in range(needed):
        seq = base + i
        helper = helpers[i % len(helpers)]
        job = jobs[i % len(jobs)]

        if helper.id in active_helper_ids:
            status = "pending" if i % 2 == 0 else "completed"
        else:
            status = "active" if i % 4 == 0 else ("pending" if i % 2 == 0 else "completed")

        if status == "active":
            active_helper_ids.add(helper.id)

        start = date.today() - timedelta(days=(i % 45) + 1)
        end = None if status in {"active", "pending"} else start + timedelta(days=30)

        db.add(
            HelperAssignment(
                helper_id=helper.id,
                job_request_id=job.id,
                start_date=start,
                end_date=end,
                status=status,
                notes=f"Placement cycle {seq}",
            )
        )


def ensure_availability(db):
    helpers = db.query(Helper).order_by(Helper.id).all()
    if not helpers:
        return

    existing_count = db.query(AvailabilitySchedule).count()
    needed = max(0, TARGETS["availability"] - existing_count)
    days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]

    for i in range(needed):
        helper = helpers[i % len(helpers)]
        day = days[i % len(days)]

        existing_slot = (
            db.query(AvailabilitySchedule)
            .filter(
                AvailabilitySchedule.helper_id == helper.id,
                AvailabilitySchedule.day_of_week == day,
                AvailabilitySchedule.start_time == time(8, 0),
                AvailabilitySchedule.end_time == time(17, 0),
            )
            .first()
        )
        if existing_slot:
            continue

        db.add(
            AvailabilitySchedule(
                helper_id=helper.id,
                day_of_week=day,
                start_time=time(8, 0),
                end_time=time(17, 0),
                availability_status="available" if i % 5 else "limited",
            )
        )


def ensure_helper_skills(db):
    helpers = db.query(Helper).order_by(Helper.id).all()
    skills = db.query(HelperSkill).order_by(HelperSkill.id).all()
    if not helpers or not skills:
        return

    for i, helper in enumerate(helpers):
        if len(helper.skills) >= TARGETS["helper_skills_per_helper"]:
            continue
        for offset in range(TARGETS["helper_skills_per_helper"]):
            skill = skills[(i + offset) % len(skills)]
            if skill not in helper.skills:
                helper.skills.append(skill)


def ensure_first_helper_experience(db):
    first_helper = db.query(Helper).order_by(Helper.full_name).first()
    if not first_helper:
        return

    existing = (
        db.query(ExperienceRecord)
        .filter(ExperienceRecord.helper_id == first_helper.id)
        .count()
    )
    needed = max(0, TARGETS["first_helper_experience"] - existing)
    base = existing + 1

    for i in range(needed):
        seq = base + i
        start = date.today() - timedelta(days=(seq * 120))
        end = start + timedelta(days=90)
        db.add(
            ExperienceRecord(
                helper_id=first_helper.id,
                employer_name=f"Prior Employer {seq}",
                role_title="Housemaid" if seq % 2 else "Nanny",
                start_date=start,
                end_date=end,
                responsibilities="Cleaning, meal prep, childcare support",
            )
        )


def ensure_first_helper_documents(db):
    first_helper = db.query(Helper).order_by(Helper.full_name).first()
    if not first_helper:
        return

    existing = (
        db.query(HelperDocument)
        .filter(HelperDocument.helper_id == first_helper.id)
        .count()
    )
    needed = max(0, TARGETS["first_helper_documents"] - existing)
    base = existing + 1

    doc_types = [
        "Passport",
        "Visa",
        "Emirates ID",
        "Medical",
        "Contract",
    ]

    for i in range(needed):
        seq = base + i
        issue = date.today() - timedelta(days=300 + (seq * 15))
        expiry = issue + timedelta(days=730)
        db.add(
            HelperDocument(
                helper_id=first_helper.id,
                document_type=doc_types[i % len(doc_types)],
                document_number=f"DOC-{first_helper.id:03d}-{seq:04d}",
                issue_date=issue,
                expiry_date=expiry,
                document_status="active" if i % 4 else "expiring_soon",
                notes="Auto-seeded demo document",
            )
        )


def seed_dummy_data():
    db = SessionLocal()
    try:
        admin = get_admin(db)
        if not admin:
            raise RuntimeError("Admin user not found or could not be created")

        ensure_locations(db)
        ensure_roles(db, admin.id)
        ensure_skills(db)
        db.commit()

        ensure_helpers(db, admin.id)
        ensure_employers(db, admin.id)
        db.commit()

        ensure_job_requests(db)
        db.commit()

        ensure_assignments(db)
        ensure_availability(db)
        ensure_helper_skills(db)
        ensure_first_helper_experience(db)
        ensure_first_helper_documents(db)
        db.commit()

        print("Dummy data seeded successfully.")
        print(f"locations: {db.query(Location).count()}")
        print(f"roles: {db.query(HelperRole).count()}")
        print(f"skills: {db.query(HelperSkill).count()}")
        print(f"helpers: {db.query(Helper).count()}")
        print(f"employers: {db.query(Employer).count()}")
        print(f"job_requests: {db.query(JobRequest).count()}")
        print(f"assignments: {db.query(HelperAssignment).count()}")
        print(f"availability: {db.query(AvailabilitySchedule).count()}")

        first_helper = db.query(Helper).order_by(Helper.full_name).first()
        if first_helper:
            exp_count = (
                db.query(ExperienceRecord)
                .filter(ExperienceRecord.helper_id == first_helper.id)
                .count()
            )
            doc_count = (
                db.query(HelperDocument)
                .filter(HelperDocument.helper_id == first_helper.id)
                .count()
            )
            print(f"first_helper: {first_helper.full_name} (id={first_helper.id})")
            print(f"first_helper_experience: {exp_count}")
            print(f"first_helper_documents: {doc_count}")

    finally:
        db.close()


if __name__ == "__main__":
    seed_dummy_data()
