# CareHub API Examples

This document provides example curl requests for the most important CareHub API endpoints.

## Base URL
```
http://localhost:8000/api
```

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```bash
Authorization: Bearer <access_token>
```

---

## 1. Hospital Registration

Register a new hospital (awaiting admin approval):

```bash
curl -X POST http://localhost:8000/api/hospitals/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jinnah_hospital",
    "email": "admin@jinnah.com",
    "password": "SecurePass123!",
    "password_confirm": "SecurePass123!",
    "first_name": "Jinnah",
    "last_name": "Hospital",
    "phone_number": "+923001234567",
    "hospital_name": "Jinnah Hospital",
    "license_number": "JH-LIC-2024",
    "hospital_email": "info@jinnah.com",
    "hospital_phone": "+923001234567",
    "address": "456 Hospital Road, Medical City",
    "location": "Central Medical District",
    "latitude": 31.5656,
    "longitude": 74.3242
  }'
```

---

## 2. Admin Approval of Hospital

Admin approves a hospital (requires admin authentication):

```bash
# First, login as admin to get token
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'

# Then approve hospital
curl -X PATCH http://localhost:8000/api/hospitals/1/approve/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_access_token>" \
  -d '{
    "is_approved": true
  }'
```

---

## 3. Hospital Creates Doctor Account

Hospital creates a doctor account and receives generated credentials:

```bash
# First, login as hospital
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jinnah_hospital",
    "password": "jinnah123"
  }'

# Create doctor
curl -X POST http://localhost:8000/api/hospitals/doctors/create/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <hospital_access_token>" \
  -d '{
    "first_name": "Ali",
    "last_name": "Mehmood",
    "email": "ali.mehmood@jinnah.com",
    "phone_number": "+923001112233",
    "cnic": "12345-6789012-3",
    "address": "789 Doctor Street",
    "license_number": "DOC-LIC-001",
    "specialization": "Cardiology",
    "available_timings": {
      "monday": ["09:00-13:00", "14:00-18:00"],
      "wednesday": ["09:00-13:00", "14:00-18:00"],
      "friday": ["09:00-13:00"]
    }
  }'

# Response includes:
# {
#   "message": "Doctor account created successfully",
#   "doctor": { ... },
#   "credentials": {
#     "username": "alimehmood_jinnah",
#     "password": "Xy7$mK9pL2qR",
#     "note": "Please share these credentials with the doctor..."
#   }
# }
```

---

## 4. Doctor Login

Doctor logs in with username and password:

```bash
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alimehmood_jinnah",
    "password": "Xy7$mK9pL2qR"
  }'

# Response:
# {
#   "access": "<jwt_access_token>",
#   "refresh": "<jwt_refresh_token>"
# }
```

---

## 5. Patient Registration

Patient self-registers:

```bash
curl -X POST http://localhost:8000/api/accounts/patients/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "password_confirm": "SecurePass123!",
    "first_name": "John",
    "last_name": "Doe",
    "phone_number": "+923005556677",
    "consent": true
  }'
```

---

## 6. OTP Generation (Doctor requests access to patient records)

Doctor generates OTP to access patient repository:

```bash
curl -X POST http://localhost:8000/api/accounts/otp/generate/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <doctor_access_token>" \
  -d '{
    "patient_phone": "+923005556677",
    "patient_id": 5
  }'

# Response:
# {
#   "message": "OTP sent successfully to patient phone",
#   "expires_at": "2024-10-29T15:30:00Z",
#   "phone_number": "6677"
# }
```

---

## 7. OTP Verification

Doctor verifies OTP to access patient records:

```bash
curl -X POST http://localhost:8000/api/accounts/otp/verify/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <doctor_access_token>" \
  -d '{
    "patient_phone": "+923005556677",
    "otp": "123456"
  }'

# Response:
# {
#   "message": "OTP verified successfully",
#   "patient_id": 5,
#   "verified": true,
#   "access_granted_until": "2024-10-29T16:00:00Z"
# }
```

---

## 8. Fetch Patient Reports (after OTP verification)

Doctor fetches patient reports after OTP verification:

```bash
curl -X GET "http://localhost:8000/api/records/patients/5/reports/?otp_verified=true" \
  -H "Authorization: Bearer <doctor_access_token>"
```

---

## 9. Patient Uploads Report

Patient uploads a medical report:

```bash
curl -X POST http://localhost:8000/api/records/patients/5/reports/upload/ \
  -H "Authorization: Bearer <patient_access_token>" \
  -F "file=@/path/to/blood_test.pdf" \
  -F "file_type=LAB" \
  -F "title=Blood Test Results" \
  -F "description=Routine blood work from annual checkup" \
  -F "report_date=2024-10-25"
```

---

## 10. Patient Books Appointment

Patient books an appointment at a hospital:

```bash
curl -X POST http://localhost:8000/api/appointments/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <patient_access_token>" \
  -d '{
    "hospital": 1,
    "department": 2,
    "requested_time": "2024-11-05T10:00:00Z",
    "reason": "Chest pain and shortness of breath"
  }'
```

---

## 11. Hospital Assigns Doctor to Appointment

Hospital assigns an available doctor to a patient appointment:

```bash
curl -X POST http://localhost:8000/api/appointments/3/assign-doctor/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <hospital_access_token>" \
  -d '{
    "doctor_id": 7,
    "confirmed_time": "2024-11-05T10:00:00Z",
    "notes": "Assigned to Dr. Ali Mehmood for cardiology consultation"
  }'
```

---

## 12. Doctor Views Assigned Appointments

Doctor views appointments assigned to them:

```bash
curl -X GET http://localhost:8000/api/appointments/doctor-appointments/ \
  -H "Authorization: Bearer <doctor_access_token>"

# Filter by status
curl -X GET "http://localhost:8000/api/appointments/doctor-appointments/?status=CONFIRMED" \
  -H "Authorization: Bearer <doctor_access_token>"
```

---

## 13. Doctor Creates Prescription

Doctor creates a prescription for a patient:

```bash
curl -X POST http://localhost:8000/api/records/prescriptions/create/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <doctor_access_token>" \
  -d '{
    "appointment": 3,
    "patient": 5,
    "diagnosis": "Hypertension and mild angina",
    "investigations": "ECG, Lipid profile, Blood pressure monitoring",
    "treatment_plan": "Lifestyle modifications, medication, follow-up in 4 weeks",
    "medicines": [
      {
        "name": "Amlodipine",
        "dosage": "5mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "instructions": "Take in the morning with food"
      },
      {
        "name": "Aspirin",
        "dosage": "75mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "instructions": "Take after dinner"
      }
    ],
    "follow_up_date": "2024-12-05",
    "doctor_notes": "Patient advised to reduce salt intake and exercise regularly"
  }'
```

---

## 14. Get Medicine Recommendations (GROQ)

Get medicine alternatives and warnings using GROQ LLM:

```bash
curl -X POST http://localhost:8000/api/recommendations/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "medicine_name": "Panadol",
    "patient_info": {
      "age": 45,
      "allergies": ["Penicillin"],
      "comorbidities": ["Diabetes", "Hypertension"],
      "current_medications": ["Metformin", "Amlodipine"]
    }
  }'

# Response:
# {
#   "medicine_name": "Panadol",
#   "alternatives": [
#     {
#       "name": "Ibuprofen",
#       "reason": "Similar analgesic effect",
#       "notes": "Active ingredient: Ibuprofen"
#     }
#   ],
#   "warnings": [
#     {
#       "condition": "Diabetes",
#       "message": "Monitor blood sugar levels",
#       "severity": "MODERATE"
#     }
#   ],
#   "suggestion": "Consult healthcare professional...",
#   "response_time_ms": 1250
# }
```

---

## 15. Nearby Hospitals Search

Find hospitals near a location:

```bash
curl -X GET "http://localhost:8000/api/hospitals/nearby/?lat=31.5204&lng=74.3587&radius_km=10" \
  -H "Authorization: Bearer <access_token>"
```

---

## 16. Admin Dashboard Statistics

Get system statistics (admin only):

```bash
curl -X GET http://localhost:8000/api/accounts/dashboard-stats/ \
  -H "Authorization: Bearer <admin_access_token>"

# Response:
# {
#   "total_users": 150,
#   "total_patients": 100,
#   "total_doctors": 30,
#   "total_hospitals": 10,
#   "approved_hospitals": 8,
#   "pending_hospitals": 2,
#   "total_appointments": 250,
#   "pending_appointments": 45
# }
```

---

## 17. Refresh JWT Token

Refresh an expired access token:

```bash
curl -X POST http://localhost:8000/api/token/refresh/ \
  -H "Content-Type: application/json" \
  -d '{
    "refresh": "<refresh_token>"
  }'
```

---

## Notes

1. **Replace placeholders**: Replace `<access_token>`, `<patient_access_token>`, etc. with actual JWT tokens
2. **IDs**: Replace numeric IDs (1, 2, 3, etc.) with actual resource IDs from your database
3. **Dates**: Use ISO 8601 format for datetime fields: `YYYY-MM-DDTHH:MM:SSZ`
4. **File uploads**: Use `-F` flag for multipart/form-data requests
5. **Rate limiting**: OTP generation is rate-limited to 3 requests per 15 minutes per IP
6. **Medicine recommendations**: Rate-limited to 10 requests per hour per user

---

## API Documentation

For interactive API documentation, visit:
- Swagger UI: http://localhost:8000/api/docs/
- OpenAPI Schema: http://localhost:8000/api/schema/
