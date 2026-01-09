# CareHub Quick Start Guide

Get CareHub running locally in 5 minutes!

## Prerequisites

- Python 3.11+
- PostgreSQL installed and running
- Git

---

## Quick Setup

### 1. Install Dependencies

```bash
# Create virtual environment
python -m venv .venv

# Activate (Windows)
.venv\Scripts\activate

# Activate (Linux/Mac)
source .venv/bin/activate

# Install packages
pip install -r requirements.txt
```

### 2. Setup Database

```sql
-- In PostgreSQL (psql -U postgres)
CREATE DATABASE carehub_db;
CREATE USER carehub_user WITH PASSWORD 'password123';
GRANT ALL PRIVILEGES ON DATABASE carehub_db TO carehub_user;
```

### 3. Configure Environment

```bash
# Copy example env file
copy .env.example .env  # Windows
cp .env.example .env    # Linux/Mac

# Edit .env and set:
# POSTGRES_PASSWORD=password123
# (Keep other defaults for local development)
```

### 4. Run Migrations

```bash
python manage.py migrate
```

### 5. Create Demo Data

```bash
python manage.py create_demo_data
```

This creates:
- **Admin**: `admin` / `admin123`
- **Hospital (Approved)**: `jinnah_hospital` / `jinnah123`
- **Hospital (Pending)**: `demo_hospital` / `hospital123`
- **Doctor**: Check console output for credentials
- **Patient**: `demo_patient` / `patient123`


Creating demo data...
✓ Created admin user: admin / admin123
✓ Created hospital user: demo_hospital / hospital123 (UNAPPROVED)
✓ Created hospital: Demo General Hospital
✓ Created approved hospital user: jinnah_hospital / jinnah123
✓ Created approved hospital: Jinnah Hospital
  ✓ Created department: Cardiology
  ✓ Created department: Neurology
  ✓ Created department: Orthopedics
  ✓ Created department: Pediatrics
INFO 2025-10-29 23:43:21,240 utils Generated username: alimehmood_jinnahhospital from name: Ali Mehmood, hospital: Jinnah Hospital
✓ Created doctor: alimehmood_jinnahhospital / Ky1UiJ@8^PvZ
  ✓ Created doctor profile for Dr. Ali Mehmood
✓ Created patient: demo_patient / patient123
  ✓ Created sample appointment

============================================================
Demo data created successfully!
============================================================

  Admin:    admin / admin123
  Hospital: jinnah_hospital / jinnah123 (APPROVED)
  Hospital: demo_hospital / hospital123 (UNAPPROVED)
  Doctor:   alimehmood_jinnahhospital / Ky1UiJ@8^PvZ
  Patient:  demo_patient / patient123

### 6. Start Server

```bash
python manage.py runserver
```

Visit: http://localhost:8000

---

## Test the API

### Get JWT Token

```bash
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

### Access API Docs

- Swagger UI: http://localhost:8000/api/docs/
- Admin Panel: http://localhost:8000/admin

---

## Key Workflows to Test

### 1. Hospital Approval Flow
1. Login as `admin` / `admin123`
2. Go to http://localhost:8000/admin
3. Navigate to Hospitals
4. Approve `demo_hospital`

### 2. Create Doctor
1. Login as `jinnah_hospital` / `jinnah123`
2. POST to `/api/hospitals/doctors/create/`
3. Receive username and password in response

### 3. Book Appointment
1. Login as `demo_patient` / `patient123`
2. POST to `/api/appointments/`
3. Select Jinnah Hospital and Cardiology department

### 4. OTP Flow
1. Login as doctor
2. POST to `/api/accounts/otp/generate/` with patient phone
3. Check console for OTP (in dev mode)
4. POST to `/api/accounts/otp/verify/` with OTP
5. Access patient reports

---

## Common Commands

```bash
# Create superuser
python manage.py createsuperuser

# Run tests
pytest

# Clear demo data and recreate
python manage.py create_demo_data --clear

# Access Django shell
python manage.py shell

# Check migrations
python manage.py showmigrations
```

---

## Project Structure

```
carehub-backend/
├── accounts/          # Users, Auth, OTP
├── hospitals/         # Hospitals, Doctors, Departments
├── appointments/      # Appointment booking
├── records/           # Prescriptions, Reports
├── recommendations/   # Medicine recommendations (GROQ)
├── tests/             # Test suite
├── manage.py          # Django CLI
└── README.md          # Full documentation
```

---

## API Endpoints Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/token/` | POST | Login (get JWT) |
| `/api/hospitals/register/` | POST | Hospital registration |
| `/api/hospitals/{id}/approve/` | PATCH | Approve hospital (admin) |
| `/api/hospitals/doctors/create/` | POST | Create doctor |
| `/api/accounts/patients/register/` | POST | Patient registration |
| `/api/appointments/` | POST | Book appointment |
| `/api/appointments/{id}/assign-doctor/` | POST | Assign doctor |
| `/api/accounts/otp/generate/` | POST | Generate OTP |
| `/api/accounts/otp/verify/` | POST | Verify OTP |
| `/api/records/prescriptions/create/` | POST | Create prescription |
| `/api/recommendations/` | POST | Get medicine alternatives |

See `API_EXAMPLES.md` for detailed curl examples.

---

## Troubleshooting

### "No module named 'rest_framework'"
```bash
pip install -r requirements.txt
```

### "could not connect to server"
- Ensure PostgreSQL is running
- Check credentials in `.env`

### "relation does not exist"
```bash
python manage.py migrate
```

### CORS errors
Add your frontend URL to `CORS_ALLOWED_ORIGINS` in `.env`

---

## Next Steps

1. ✅ Read `README.md` for full documentation
2. ✅ Check `API_EXAMPLES.md` for API usage
3. ✅ Review `DEPLOYMENT.md` for production setup
4. ✅ Explore the code in each app directory
5. ✅ Run tests: `pytest`
6. ✅ Build your frontend!

---

## Need Help?

- Full docs: `README.md`
- API examples: `API_EXAMPLES.md`
- Deployment: `DEPLOYMENT.md`
- Tests: `tests/test_core_flows.py`

Happy coding! 🚀
