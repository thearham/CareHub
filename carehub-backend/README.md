# CareHub - Multi-Tenant Healthcare Dashboard

A production-quality Django REST Framework application for managing multi-tenant healthcare operations with four user types: Admin, Hospital, Doctor, and Patient.

## Features

### Core Functionality
- **Multi-tenant architecture** with role-based access control
- **Hospital management** with admin approval workflow
- **Doctor accounts** created by hospitals with auto-generated credentials
- **Patient self-registration** and medical record management
- **Appointment booking** with hospital-triggered doctor assignment
- **OTP-based access** to patient repositories (10-minute expiry)
- **Prescription management** with versioning and attachments
- **Medicine recommendations** using GROQ LLM with medical database queries
- **Geolocation-based** hospital search
- **File upload** support for medical reports (PDF, images, documents)

### User Types & Capabilities

#### Admin (CareHub)
- Approve/reject hospital registrations
- CRUD operations on hospitals and patients
- View system-wide statistics and audit logs
- Manage all resources

#### Hospital
- Register and await admin approval
- Create departments (Cardiology, Neurology, etc.)
- Create doctor accounts (username/password auto-generated and returned)
- Manage hospital-specific doctors and patients
- Assign doctors to appointment requests
- View hospital-specific appointments and records

#### Doctor
- Login with username + password
- Work across multiple hospitals (separate accounts per hospital)
- View assigned appointments
- Create prescriptions with medicines, investigations, and follow-ups
- Request OTP access to patient medical repositories
- Add attachments to prescriptions

#### Patient
- Self-register with consent
- Upload medical reports (lab results, X-rays, prescriptions)
- Book appointments at approved hospitals
- View own prescriptions and medical history
- Receive OTP for repository access verification

### Technical Features
- **JWT authentication** with access/refresh tokens
- **PostgreSQL** database with optimized indexes
- **Custom user model** (non-unique emails, unique usernames)
- **Username generation** for doctors: `doctorname_hospitalname` with collision handling
- **Strong password generation** (12 chars, mixed case, digits, special chars)
- **Audit logging** for critical actions
- **Rate limiting** on OTP generation and medicine recommendations
- **Caching** for medicine recommendations
- **CORS** configured for Next.js frontend
- **OpenAPI/Swagger** documentation
- **Celery** integration for async tasks (SMS, emails)
- **File validation** (size limits, allowed extensions)

---

## Prerequisites

- Python 3.11+
- PostgreSQL 12+
- Redis (for Celery and caching)
- pip and virtualenv

---

## Local Setup (No Docker)

### 1. Clone the Repository

```bash
cd d:/carehub-backend
```

### 2. Create Virtual Environment

```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# Linux/Mac
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Setup PostgreSQL Database

#### Create Database and User

```sql
-- Open PostgreSQL shell (psql)
psql -U postgres

-- Create database
CREATE DATABASE carehub_db;

-- Create user
CREATE USER carehub_user WITH PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE carehub_db TO carehub_user;

-- Exit
\q
```

#### Alternative: Using pgAdmin
1. Open pgAdmin
2. Create new database: `carehub_db`
3. Create new user: `carehub_user` with password
4. Grant all privileges to user on database

### 5. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Django Settings
SECRET_KEY=your-secret-key-here-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database Configuration
POSTGRES_DB=carehub_db
POSTGRES_USER=carehub_user
POSTGRES_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=5432

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# JWT Settings
JWT_ACCESS_TOKEN_LIFETIME_MINUTES=60
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7

# GROQ API Configuration (optional for development)
GROQ_API_KEY=your-groq-api-key-here

# SMS Provider Configuration (optional)
SMS_PROVIDER_API_KEY=your-sms-provider-api-key
SMS_PROVIDER_URL=https://api.sms-provider.com/send

# File Upload Settings
MAX_UPLOAD_SIZE_MB=10
ALLOWED_UPLOAD_EXTENSIONS=pdf,jpg,jpeg,png,doc,docx

# Celery Configuration
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# OTP Settings
OTP_EXPIRY_MINUTES=10
OTP_LENGTH=6
```

### 6. Run Migrations

```bash
python manage.py migrate
```

### 7. Create Superuser (Admin)

```bash
python manage.py createsuperuser
```

Follow the prompts to create an admin account.

### 8. Create Demo Data (Optional)

```bash
python manage.py create_demo_data
```

This creates:
- Admin user: `admin` / `admin123`
- Approved hospital: `jinnah_hospital` / `jinnah123`
- Unapproved hospital: `demo_hospital` / `hospital123`
- Doctor with generated credentials
- Patient: `demo_patient` / `patient123`
- Sample departments and appointment

### 9. Run Development Server

```bash
python manage.py runserver 0.0.0.0:8000
```

The API will be available at: `http://localhost:8000`

### 10. Access Admin Panel

Visit: `http://localhost:8000/admin`

Login with your superuser credentials.

### 11. Access API Documentation

- **Swagger UI**: `http://localhost:8000/api/docs/`
- **OpenAPI Schema**: `http://localhost:8000/api/schema/`

---

## Running Celery (Optional)

For async tasks (SMS, emails, background jobs):

### Start Redis

```bash
# Windows (using WSL or Redis for Windows)
redis-server

# Linux/Mac
redis-server
```

### Start Celery Worker

```bash
celery -A carehub worker -l info
```

### Start Celery Beat (for scheduled tasks)

```bash
celery -A carehub beat -l info
```

---

## Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=. --cov-report=html

# Run specific test file
pytest tests/test_core_flows.py

# Run specific test
pytest tests/test_core_flows.py::TestDoctorCreation::test_hospital_creates_doctor
```

---

## Project Structure

```
carehub-backend/
├── carehub/                    # Main project settings
│   ├── settings.py            # Django settings
│   ├── urls.py                # Root URL configuration
│   ├── celery.py              # Celery configuration
│   └── wsgi.py                # WSGI configuration
├── accounts/                   # User management & authentication
│   ├── models.py              # User, OTP, AuditLog models
│   ├── serializers.py         # User serializers
│   ├── views.py               # Auth views
│   ├── utils.py               # Username generation, password utils
│   └── management/
│       └── commands/
│           └── create_demo_data.py
├── hospitals/                  # Hospital management
│   ├── models.py              # Hospital, Department, HospitalDoctorProfile
│   ├── serializers.py         # Hospital serializers
│   ├── views.py               # Hospital CRUD, doctor creation
│   ├── permissions.py         # Custom permissions
│   └── urls.py
├── appointments/               # Appointment booking & management
│   ├── models.py              # Appointment model
│   ├── serializers.py         # Appointment serializers
│   ├── views.py               # Booking, assignment, status updates
│   └── urls.py
├── records/                    # Medical records
│   ├── models.py              # Prescription, PatientReport, Attachments
│   ├── serializers.py         # Record serializers
│   ├── views.py               # Prescription creation, file uploads
│   └── urls.py
├── recommendations/            # Medicine recommendations (GROQ)
│   ├── models.py              # MedicineRecommendation model
│   ├── service.py             # GROQ integration logic
│   ├── system_prompt.txt      # LLM system prompt template
│   ├── serializers.py
│   ├── views.py
│   └── urls.py
├── tests/                      # Test suite
│   ├── conftest.py            # Pytest fixtures
│   └── test_core_flows.py     # Core flow tests
├── media/                      # Uploaded files (created at runtime)
├── staticfiles/                # Static files (created at runtime)
├── logs/                       # Application logs (created at runtime)
├── requirements.txt            # Python dependencies
├── .env.example                # Environment variables template
├── .gitignore
├── manage.py                   # Django management script
├── pytest.ini                  # Pytest configuration
├── README.md                   # This file
└── API_EXAMPLES.md             # API usage examples
```

---

## API Endpoints Overview

### Authentication
- `POST /api/token/` - Obtain JWT token (login)
- `POST /api/token/refresh/` - Refresh access token

### Accounts
- `POST /api/accounts/patients/register/` - Patient registration
- `GET /api/accounts/me/` - Get current user
- `POST /api/accounts/change-password/` - Change password
- `POST /api/accounts/otp/generate/` - Generate OTP
- `POST /api/accounts/otp/verify/` - Verify OTP
- `GET /api/accounts/dashboard-stats/` - Admin dashboard stats

### Hospitals
- `POST /api/hospitals/register/` - Hospital registration
- `GET /api/hospitals/` - List hospitals
- `GET /api/hospitals/{id}/` - Hospital details
- `PATCH /api/hospitals/{id}/approve/` - Approve hospital (admin)
- `GET /api/hospitals/nearby/` - Find nearby hospitals
- `POST /api/hospitals/doctors/create/` - Create doctor account
- `GET /api/hospitals/doctors/` - List doctors
- `GET /api/hospitals/departments/` - List departments
- `POST /api/hospitals/departments/` - Create department

### Appointments
- `POST /api/appointments/` - Book appointment (patient)
- `GET /api/appointments/my-appointments/` - Patient appointments
- `GET /api/appointments/hospital-appointments/` - Hospital appointments
- `GET /api/appointments/doctor-appointments/` - Doctor appointments
- `POST /api/appointments/{id}/assign-doctor/` - Assign doctor (hospital)
- `PATCH /api/appointments/{id}/status/` - Update status
- `POST /api/appointments/{id}/cancel/` - Cancel appointment

### Records
- `POST /api/records/prescriptions/create/` - Create prescription (doctor)
- `GET /api/records/prescriptions/` - List prescriptions
- `GET /api/records/prescriptions/{id}/` - Prescription details
- `POST /api/records/patients/{id}/reports/upload/` - Upload report
- `GET /api/records/patients/{id}/reports/` - List patient reports
- `GET /api/records/my-reports/` - Current user's reports
- `GET /api/records/patients/{id}/summary/` - Patient medical summary

### Recommendations
- `POST /api/recommendations/` - Get medicine recommendations
- `GET /api/recommendations/history/` - Recommendation history
- `GET /api/recommendations/stats/` - Statistics (admin)

See `API_EXAMPLES.md` for detailed curl examples.

---

## Key Workflows

### 1. Hospital Registration & Approval
1. Hospital registers via `/api/hospitals/register/`
2. Hospital account is created but `is_approved=False`, `is_active=False`
3. Admin logs in and approves via `/api/hospitals/{id}/approve/`
4. Hospital account becomes active and can login

### 2. Doctor Creation (Hospital-triggered)
1. Hospital logs in
2. Hospital calls `/api/hospitals/doctors/create/` with doctor details
3. System generates unique username: `doctorname_hospitalname`
4. System generates strong random password
5. API returns both username and password in response
6. Hospital shares credentials with doctor
7. Action is logged in audit trail

### 3. Doctor Login
1. Doctor uses username + password at `/api/token/`
2. Receives JWT access and refresh tokens
3. Uses access token for authenticated requests

### 4. OTP Flow for Patient Repository Access
1. Doctor requests OTP via `/api/accounts/otp/generate/` with patient phone
2. OTP is generated (6 digits), hashed, and stored with 10-minute expiry
3. SMS sent to patient phone (pluggable service)
4. Doctor receives confirmation (no OTP exposed)
5. Patient shares OTP with doctor
6. Doctor verifies via `/api/accounts/otp/verify/`
7. On success, doctor can access patient reports for 30 minutes

### 5. Appointment Booking & Assignment
1. Patient books appointment at hospital/department
2. Appointment status: `REQUESTED`
3. Hospital views pending appointments
4. Hospital assigns available doctor from that department
5. Appointment status: `CONFIRMED`
6. Doctor sees appointment in their list
7. Doctor creates prescription after consultation
8. Appointment status: `COMPLETED`

---

## Security Features

- **JWT Authentication** with token rotation
- **Password hashing** using Django's PBKDF2
- **OTP hashing** (SHA-256) for secure storage
- **Rate limiting** on sensitive endpoints
- **CORS** protection with whitelist
- **File upload validation** (size, extension, content type)
- **Audit logging** for critical actions
- **Permission classes** for role-based access
- **SQL injection protection** via Django ORM
- **XSS protection** via Django templates
- **CSRF protection** for web forms

---

## Production Deployment

### Using Gunicorn + Nginx

1. **Install Gunicorn**:
```bash
pip install gunicorn
```

2. **Create Gunicorn service** (`/etc/systemd/system/carehub.service`):
```ini
[Unit]
Description=CareHub Django Application
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/carehub-backend
Environment="PATH=/var/www/carehub-backend/.venv/bin"
ExecStart=/var/www/carehub-backend/.venv/bin/gunicorn \
    --workers 3 \
    --bind unix:/var/www/carehub-backend/carehub.sock \
    carehub.wsgi:application

[Install]
WantedBy=multi-user.target
```

3. **Configure Nginx** (`/etc/nginx/sites-available/carehub`):
```nginx
server {
    listen 80;
    server_name api.carehub.com;

    location /static/ {
        alias /var/www/carehub-backend/staticfiles/;
    }

    location /media/ {
        alias /var/www/carehub-backend/media/;
    }

    location / {
        proxy_pass http://unix:/var/www/carehub-backend/carehub.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

4. **Collect static files**:
```bash
python manage.py collectstatic --noinput
```

5. **Start services**:
```bash
sudo systemctl start carehub
sudo systemctl enable carehub
sudo systemctl restart nginx
```

### Environment Variables for Production

Update `.env` for production:
```env
DEBUG=False
SECRET_KEY=<generate-strong-secret-key>
ALLOWED_HOSTS=api.carehub.com,yourdomain.com
CORS_ALLOWED_ORIGINS=https://carehub.com,https://www.carehub.com
```

---

## GROQ Integration

The medicine recommendation feature uses GROQ for:
1. Querying medical database/dataset
2. LLM-based recommendation generation

### Setup GROQ

1. Get API key from [GROQ](https://groq.com)
2. Add to `.env`:
```env
GROQ_API_KEY=your_groq_api_key_here
```

3. Install GROQ client:
```bash
pip install groq
```

### Mock Mode

Without GROQ_API_KEY, the system returns mock recommendations for development.

---

## Troubleshooting

### Database Connection Error
```
django.db.utils.OperationalError: could not connect to server
```
**Solution**: Ensure PostgreSQL is running and credentials in `.env` are correct.

### Migration Error
```
django.db.migrations.exceptions.InconsistentMigrationHistory
```
**Solution**: Drop database and recreate, then run migrations again.

### Import Error
```
ModuleNotFoundError: No module named 'rest_framework'
```
**Solution**: Activate virtual environment and run `pip install -r requirements.txt`.

### CORS Error in Frontend
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution**: Add frontend URL to `CORS_ALLOWED_ORIGINS` in `.env`.

---

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## License

This project is proprietary software. All rights reserved.

---

## Support

For issues and questions:
- Create an issue in the repository
- Email: support@carehub.com

---

## Changelog

### Version 1.0.0 (2024-10-29)
- Initial release
- Multi-tenant architecture
- Hospital, Doctor, Patient, Admin user types
- Appointment booking and management
- OTP-based patient repository access
- Medicine recommendations with GROQ
- File upload support
- JWT authentication
- Comprehensive API documentation
