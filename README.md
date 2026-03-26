# Nano Online

Admin-only starter for managing home helpers (nanny, baby sitter, etc.) in UAE. Includes a React multi-page app and a FastAPI backend with JWT auth.

Backend uses SQLAlchemy ORM with SQLite (`backend/nano_online.db`) to store users and the operational data model for helpers, employers, job requests, assignments, schedules, locations, skills, experience, and documents.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

The app expects the API at `http://localhost:8000`. You can override with `VITE_API_BASE`.

## Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

## Demo Admin Account

- Username: `admin`
- Password: `admin`

The account is created automatically on backend startup if it does not already exist.

## Helper Role APIs (Admin JWT Required)

- `POST /helper-roles`
- `GET /helper-roles`
- `GET /helper-roles/{role_id}`
- `PUT /helper-roles/{role_id}`
- `DELETE /helper-roles/{role_id}`

Example body:

```json
{
	"name": "nanny",
	"description": "Child care specialist"
}
```

## Helper APIs (Admin JWT Required)

- `POST /helpers`
- `GET /helpers`
- `GET /helpers/{helper_id}`
- `PUT /helpers/{helper_id}`
- `DELETE /helpers/{helper_id}`

Example body:

```json
{
	"full_name": "Aisha Khan",
	"phone": "0300-1234567",
	"address": "Street, area, city",
	"role_id": 1,
	"notes": "Available mornings",
	"is_active": true
}
```

## Additional Admin APIs

- `POST|GET|PUT|DELETE /locations`
- `POST|GET|PUT|DELETE /employers`
  Employers list supports pagination with `page`, `page_size`, and `search`
- `POST|GET|PUT|DELETE /job-requests`
  Job requests list supports `status`, `location_id`, `job_type`, and `search`
- `POST|GET|PUT|PATCH|DELETE /helper-assignments`
  Assignments list supports `helper_id` and `employer_id`
- `POST|GET|PUT|DELETE /helper-availability`
- `GET /helpers/{helper_id}/availability`
- `POST|GET|PUT|DELETE /skills`
- `POST|DELETE /helpers/{helper_id}/skills/{skill_id}`
- `GET /helpers/{helper_id}/skills`
- `POST|GET|PUT|DELETE /helper-experience`
- `GET /helpers/{helper_id}/experience`
- `POST|GET|PUT|DELETE /helper-documents`
- `GET /helpers/{helper_id}/documents`

Implemented validation highlights:

- Required field validation across all new modules
- Employer pagination for list view
- Job request filtering and search
- No duplicate active helper assignments
- No overlapping availability schedules per helper
- Document expiry must be after issue date
- Skills managed via many-to-many helper/skill mapping

Set environment variables to change them:

- `NANO_ONLINE_ADMIN_USER`
- `NANO_ONLINE_ADMIN_PASSWORD`
- `NANO_ONLINE_SECRET`
- `NANO_ONLINE_DB_URL`
