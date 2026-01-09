# Accounts API Documentation

## Base URL
```
http://localhost:8000/api/accounts
```

---

## 1. Patient Registration

**Endpoint:** `POST /patients/register/`  
**Authentication:** None (Public)  
**Description:** Self-registration for patients

### Request Body
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "password_confirm": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "+1234567890",
  "consent": true
}
```

### Success Response (201 Created)
```json
{
  "message": "Patient registered successfully",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "full_name": "John Doe",
    "phone_number": "+1234567890",
    "user_type": "PATIENT",
    "is_active": true,
    "date_joined": "2025-10-30T00:00:00Z"
  }
}
```

### Error Responses

**400 Bad Request - Validation Errors**
```json
{
  "username": ["A user with that username already exists."],
  "email": ["Enter a valid email address."],
  "password": ["This password is too short. It must contain at least 8 characters."],
  "password_confirm": ["Password fields didn't match."],
  "phone_number": ["Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."],
  "consent": ["You must provide consent to register."]
}
```

### Validation Rules
- `username`: Required, unique, max 150 characters
- `email`: Required, valid email format
- `password`: Required, min 8 characters, must pass Django password validation
- `password_confirm`: Required, must match password
- `first_name`: Required, max 150 characters
- `last_name`: Required, max 150 characters
- `phone_number`: Required, format: `+999999999` (9-15 digits)
- `consent`: Required, must be `true`

---

## 2. Get Current User

**Endpoint:** `GET /me/`  
**Authentication:** Required  
**Description:** Get authenticated user details

### Success Response (200 OK)
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "full_name": "John Doe",
  "phone_number": "+1234567890",
  "user_type": "PATIENT",
  "is_active": true,
  "date_joined": "2025-10-30T00:00:00Z"
}
```

### Error Responses

**401 Unauthorized**
```json
{
  "detail": "Authentication credentials were not provided."
}
```

---

## 3. Update Current User

**Endpoint:** `PUT /me/` or `PATCH /me/`  
**Authentication:** Required  
**Description:** Update authenticated user profile

### Request Body (PUT - all fields required)
```json
{
  "username": "john_doe_updated",
  "email": "john.new@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "+1234567890",
  "is_active": true
}
```

### Request Body (PATCH - partial update)
```json
{
  "first_name": "Jonathan",
  "phone_number": "+9876543210"
}
```

### Success Response (200 OK)
```json
{
  "id": 1,
  "username": "john_doe_updated",
  "email": "john.new@example.com",
  "first_name": "Jonathan",
  "last_name": "Doe",
  "full_name": "Jonathan Doe",
  "phone_number": "+9876543210",
  "user_type": "PATIENT",
  "is_active": true,
  "date_joined": "2025-10-30T00:00:00Z"
}
```

### Error Responses

**400 Bad Request**
```json
{
  "username": ["A user with that username already exists."],
  "email": ["Enter a valid email address."]
}
```

### Validation Rules
- `username`: Max 150 characters, unique
- `email`: Valid email format
- `first_name`: Max 150 characters
- `last_name`: Max 150 characters
- `phone_number`: Format: `+999999999` (9-15 digits)
- `is_active`: Boolean
- **Note:** `user_type` cannot be changed

---

## 4. Change Password

**Endpoint:** `POST /change-password/`  
**Authentication:** Required  
**Description:** Change user password

### Request Body
```json
{
  "old_password": "OldPassword123!",
  "new_password": "NewSecurePass456!",
  "new_password_confirm": "NewSecurePass456!"
}
```

### Success Response (200 OK)
```json
{
  "message": "Password changed successfully"
}
```

### Error Responses

**400 Bad Request - Wrong Old Password**
```json
{
  "error": "Old password is incorrect"
}
```

**400 Bad Request - Validation Errors**
```json
{
  "new_password": ["This password is too short. It must contain at least 8 characters."],
  "new_password_confirm": ["Password fields didn't match."]
}
```

### Validation Rules
- `old_password`: Required, must match current password
- `new_password`: Required, min 8 characters, Django password validation
- `new_password_confirm`: Required, must match new_password

---

## 5. List Users (Admin Only)

**Endpoint:** `GET /users/`  
**Authentication:** Required (Admin only)  
**Description:** List all users with pagination

### Query Parameters
- `page`: Page number (default: 1)
- `user_type`: Filter by user type (ADMIN, HOSPITAL, DOCTOR, PATIENT)

### Success Response (200 OK)
```json
{
  "count": 100,
  "next": "http://localhost:8000/api/accounts/users/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "full_name": "John Doe",
      "phone_number": "+1234567890",
      "user_type": "PATIENT",
      "is_active": true,
      "date_joined": "2025-10-30T00:00:00Z"
    }
  ]
}
```

### Error Responses

**403 Forbidden**
```json
{
  "detail": "You do not have permission to perform this action."
}
```

---

## 6. Dashboard Statistics (Admin Only)

**Endpoint:** `GET /dashboard-stats/`  
**Authentication:** Required (Admin only)  
**Description:** Get system-wide statistics

### Success Response (200 OK)
```json
{
  "total_users": 150,
  "total_patients": 100,
  "total_doctors": 30,
  "total_hospitals": 15,
  "approved_hospitals": 12,
  "pending_hospitals": 3,
  "total_appointments": 500,
  "pending_appointments": 45
}
```

### Error Responses

**403 Forbidden**
```json
{
  "error": "Only admins can access dashboard statistics"
}
```

---

## 7. Generate OTP

**Endpoint:** `POST /otp/generate/`  
**Authentication:** Required (Doctor)  
**Rate Limit:** 3 requests per 15 minutes per IP  
**Description:** Generate OTP for patient repository access

### Request Body
```json
{
  "patient_phone": "+1234567890",
  "patient_id": 5
}
```

### Success Response (200 OK)
```json
{
  "message": "OTP sent successfully to patient phone",
  "expires_at": "2025-10-30T00:10:00Z",
  "phone_number": "7890"
}
```

### Error Responses

**404 Not Found**
```json
{
  "error": "Patient not found with provided details"
}
```

**400 Bad Request**
```json
{
  "error": "Phone number does not match patient record"
}
```

**429 Too Many Requests**
```json
{
  "detail": "Request was throttled. Expected available in 900 seconds."
}
```

### Validation Rules
- `patient_phone`: Required, format: `+999999999` (9-15 digits)
- `patient_id`: Optional, integer
- OTP expires in 10 minutes (configurable)
- OTP is 6 digits (configurable)

---

## 8. Verify OTP

**Endpoint:** `POST /otp/verify/`  
**Authentication:** Required (Doctor)  
**Description:** Verify OTP and grant access to patient repository

### Request Body
```json
{
  "patient_phone": "+1234567890",
  "otp": "123456"
}
```

### Success Response (200 OK)
```json
{
  "message": "OTP verified successfully",
  "patient_id": 5,
  "verified": true,
  "access_granted_until": "2025-10-30T00:30:00Z"
}
```

### Error Responses

**400 Bad Request - Invalid OTP**
```json
{
  "error": "Invalid OTP code"
}
```

**400 Bad Request - Expired OTP**
```json
{
  "error": "No valid OTP found or OTP has expired"
}
```

**400 Bad Request - Validation**
```json
{
  "otp": ["OTP must contain only digits."]
}
```

### Validation Rules
- `patient_phone`: Required, valid phone format
- `otp`: Required, numeric only, max 10 characters
- OTP is single-use
- Access granted for 30 minutes after verification

---

## User Types
- `ADMIN`: System administrator
- `HOSPITAL`: Hospital account
- `DOCTOR`: Doctor account
- `PATIENT`: Patient account

## Notes for Frontend Integration
1. Store user type to show/hide features based on permissions
2. Implement OTP countdown timer (10 minutes)
3. Handle rate limiting for OTP generation
4. Show last 4 digits of phone number for privacy
5. Validate phone numbers on client side before submission
6. Password must meet Django's default validation (min 8 chars, not too common, not numeric only)
