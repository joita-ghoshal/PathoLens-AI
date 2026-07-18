# PathoLens AI

> **Seeing Beyond Pathogens with Artificial Intelligence**

AI-Powered Bacterial Intelligence & Clinical Decision Support Platform.

## Tech Stack

- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Backend**: Python 3.12+ / FastAPI / SQLAlchemy / PostgreSQL
- **AI Engine**: NumPy / SciPy (multi-factor weighted scoring with Platt calibration)
- **Auth**: JWT + OAuth2 Password Bearer
- **Database**: PostgreSQL (Neon) with Alembic migrations
- **Deployment**: Vercel (frontend) + Render (backend)

## Features

- AI-powered bacterial pathogen identification from symptoms + lab data
- 28+ bacterial species database with clinical metadata
- Risk assessment with confidence scores and differential diagnosis
- Recommended diagnostic tests with priority levels
- Dashboard with analytics charts
- Species catalog with full detail views
- User authentication and role-based access
- Admin panel for user management

## Quick Start

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
python seed.py
uvicorn main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

## Demo Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@patholens.ai | password123 | super_admin |
| researcher@patholens.ai | password123 | researcher |
| student@patholens.ai | password123 | student |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Current user |
| GET | /api/species | List species (paginated, searchable) |
| GET | /api/species/:id | Species detail with all relations |
| POST | /api/analysis/analyze | AI pathogen analysis |
| GET | /api/analysis/history | User's analysis history |
| GET | /api/dashboard/overview | Dashboard statistics |
| GET | /api/diseases | Disease catalog |
| GET | /api/symptoms | Symptoms catalog |
| GET | /api/admin/users | Admin: list users |
| PUT | /api/admin/users/:id/role | Admin: update user role |

## License

Research & educational use only. Not a medical device.
