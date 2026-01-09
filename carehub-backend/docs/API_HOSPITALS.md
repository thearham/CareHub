# Hospitals API Documentation

## Base URL
```
http://localhost:8000/api/hospitals
```

---

## 1. Hospital Registration

**Endpoint:** `POST /register/`  
**Authentication:** None (Public)  
**Description:** Register a new hospital (requires admin approval)

### Request Body
```json
{
  "username": "city_hospital",
  "email": "admin@cityhospital.com",
  "password": "SecurePass123!",
  "password_confirm": "SecurePass123!",
  "first_name": "Admin",
  "last_name": "User",
  "phone_number": "+1234567890",
  "hospital_name": "City General Hospital",
  "license_number": "LIC123456",
  "hospital_email": "info@cityhospital.com",
  "hospital_phone": "+1234567891",
  "address": "123 Main St, City, State 12345",
  "location": "Downtown Medical District",
  "latitude": "40.7128",
  "longitude": "-74.0060"
}
```

### Success Response (201 Created)
```json
{
  "message": "Hospital registered successfully. Awaiting admin approval.",
  "hospital": {
    "id": 1,
    "user": 10,
    "user_username": "city_hospital",
    "user_email": "admin@cityhospital.com",
    "name": "City General Hospital",
    "license_number": "LIC123456",
    "email": "info@cityhospital.com",
    "phone": "+1234567891",
    "address": "123 Main St, City, State 12345",
    "location": "Downtown Medical District",
    "latitude": "40.7128",
    "longitude": "-74.0060",
    "is_approved": false,
    "approved_by": null,
    "approved_at": null,
    "created_at": "2025-10-30T00:00:00Z",
    "updated_at": "2025-10-30T00:00:00Z"
  }
}
```

### Error Responses

**400 Bad Request - Validation Errors**
```json
{
  "username": ["A user with that username already exists."],
  "password": ["Password fields didn't match."],
  "license_number": ["Hospital with this license number already exists."],
  "hospital_email": ["Enter a valid email address."]
}
```

### Validation Rules
- `username`: Required, unique, max 150 characters
- `email`: Required, valid email
- `password`: Required, min 8 characters
- `password_confirm`: Required, must match password
- `first_name`: Required, max 150 characters
- `last_name`: Required, max 150 characters
- `phone_number`: Required, format: `+999999999`
- `hospital_name`: Required, max 255 characters
- `license_number`: Required, unique, max 100 characters
- `hospital_email`: Required, valid email
- `hospital_phone`: Required, max 17 characters
- `address`: Required
- `location`: Required
- `latitude`: Optional, decimal (9 digits, 6 decimal places)
- `longitude`: Optional, decimal (9 digits, 6 decimal places)

**Note:** Hospital user account is inactive until approved by admin

---

## 2. List Hospitals

**Endpoint:** `GET /`  
**Authentication:** Required  
**Description:** List hospitals (Admin sees all, others see only approved)

### Query Parameters
- `page`: Page number (default: 1)
- `is_approved`: Filter by approval status (true/false) - Admin only

### Success Response (200 OK)
```json
{
  "count": 15,
  "next": "http://localhost:8000/api/hospitals/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "user": 10,
      "user_username": "city_hospital",
      "user_email": "admin@cityhospital.com",
      "name": "City General Hospital",
      "license_number": "LIC123456",
      "email": "info@cityhospital.com",
      "phone": "+1234567891",
      "address": "123 Main St, City, State 12345",
      "location": "Downtown Medical District",
      "latitude": "40.7128",
      "longitude": "-74.0060",
      "is_approved": true,
      "approved_by": 1,
      "approved_at": "2025-10-29T12:00:00Z",
      "created_at": "2025-10-30T00:00:00Z",
      "updated_at": "2025-10-30T00:00:00Z"
    }
  ]
}
```

---

## 3. Get Hospital Details

**Endpoint:** `GET /{id}/`  
**Authentication:** Required  
**Description:** Get specific hospital details

### Success Response (200 OK)
```json
{
  "id": 1,
  "user": 10,
  "user_username": "city_hospital",
  "user_email": "admin@cityhospital.com",
  "name": "City General Hospital",
  "license_number": "LIC123456",
  "email": "info@cityhospital.com",
  "phone": "+1234567891",
  "address": "123 Main St, City, State 12345",
  "location": "Downtown Medical District",
  "latitude": "40.7128",
  "longitude": "-74.0060",
  "is_approved": true,
  "approved_by": 1,
  "approved_at": "2025-10-29T12:00:00Z",
  "created_at": "2025-10-30T00:00:00Z",
  "updated_at": "2025-10-30T00:00:00Z"
}
```

### Error Responses

**404 Not Found**
```json
{
  "detail": "Not found."
}
```

---

## 4. Update Hospital

**Endpoint:** `PUT /{id}/` or `PATCH /{id}/`  
**Authentication:** Required (Hospital owner or Admin)  
**Description:** Update hospital details

### Request Body (PATCH - partial update)
```json
{
  "name": "City General Hospital - Updated",
  "phone": "+1234567899",
  "address": "456 New St, City, State 12345"
}
```

### Success Response (200 OK)
```json
{
  "id": 1,
  "user": 10,
  "user_username": "city_hospital",
  "user_email": "admin@cityhospital.com",
  "name": "City General Hospital - Updated",
  "license_number": "LIC123456",
  "email": "info@cityhospital.com",
  "phone": "+1234567899",
  "address": "456 New St, City, State 12345",
  "location": "Downtown Medical District",
  "latitude": "40.7128",
  "longitude": "-74.0060",
  "is_approved": true,
  "approved_by": 1,
  "approved_at": "2025-10-29T12:00:00Z",
  "created_at": "2025-10-30T00:00:00Z",
  "updated_at": "2025-10-30T00:10:00Z"
}
```

### Error Responses

**403 Forbidden**
```json
{
  "detail": "You do not have permission to perform this action."
}
```

**Note:** Cannot update `is_approved`, `approved_by`, `approved_at` fields directly

---

## 5. Approve/Reject Hospital (Admin Only)

**Endpoint:** `PATCH /{id}/approve/`  
**Authentication:** Required (Admin only)  
**Description:** Approve or reject hospital registration

### Request Body
```json
{
  "is_approved": true
}
```

### Success Response (200 OK)
```json
{
  "message": "Hospital approved successfully",
  "hospital": {
    "id": 1,
    "user": 10,
    "user_username": "city_hospital",
    "user_email": "admin@cityhospital.com",
    "name": "City General Hospital",
    "license_number": "LIC123456",
    "email": "info@cityhospital.com",
    "phone": "+1234567891",
    "address": "123 Main St, City, State 12345",
    "location": "Downtown Medical District",
    "latitude": "40.7128",
    "longitude": "-74.0060",
    "is_approved": true,
    "approved_by": 1,
    "approved_at": "2025-10-30T00:15:00Z",
    "created_at": "2025-10-30T00:00:00Z",
    "updated_at": "2025-10-30T00:15:00Z"
  }
}
```

### Error Responses

**403 Forbidden**
```json
{
  "detail": "You do not have permission to perform this action."
}
```

**404 Not Found**
```json
{
  "error": "Hospital not found"
}
```

### Validation Rules
- `is_approved`: Required, boolean
- Approving activates the hospital user account
- Rejecting deactivates the hospital user account

---

## 6. List Departments

**Endpoint:** `GET /departments/`  
**Authentication:** Required  
**Description:** List departments with optional hospital filter

### Query Parameters
- `page`: Page number (default: 1)
- `hospital_id`: Filter by hospital ID

### Success Response (200 OK)
```json
{
  "count": 25,
  "next": "http://localhost:8000/api/hospitals/departments/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "hospital": 1,
      "hospital_name": "City General Hospital",
      "name": "Cardiology",
      "description": "Heart and cardiovascular care",
      "created_at": "2025-10-30T00:00:00Z",
      "updated_at": "2025-10-30T00:00:00Z"
    }
  ]
}
```

---

## 7. Create Department

**Endpoint:** `POST /departments/`  
**Authentication:** Required (Hospital or Admin)  
**Description:** Create a new department

### Request Body
```json
{
  "hospital": 1,
  "name": "Cardiology",
  "description": "Heart and cardiovascular care"
}
```

### Success Response (201 Created)
```json
{
  "id": 1,
  "hospital": 1,
  "hospital_name": "City General Hospital",
  "name": "Cardiology",
  "description": "Heart and cardiovascular care",
  "created_at": "2025-10-30T00:00:00Z",
  "updated_at": "2025-10-30T00:00:00Z"
}
```

### Error Responses

**400 Bad Request**
```json
{
  "name": ["Department with this name already exists in this hospital."]
}
```

### Validation Rules
- `hospital`: Required, valid hospital ID
- `name`: Required, unique per hospital
- `description`: Optional
- Hospital users can only create departments for their own hospital

---

## 8. Get Department Details

**Endpoint:** `GET /departments/{id}/`  
**Authentication:** Required  
**Description:** Get specific department details

### Success Response (200 OK)
```json
{
  "id": 1,
  "hospital": 1,
  "hospital_name": "City General Hospital",
  "name": "Cardiology",
  "description": "Heart and cardiovascular care",
  "created_at": "2025-10-30T00:00:00Z",
  "updated_at": "2025-10-30T00:00:00Z"
}
```

---

## 9. Update Department

**Endpoint:** `PUT /departments/{id}/` or `PATCH /departments/{id}/`  
**Authentication:** Required (Hospital owner or Admin)  
**Description:** Update department details

### Request Body (PATCH)
```json
{
  "description": "Advanced heart and cardiovascular care with latest technology"
}
```

### Success Response (200 OK)
```json
{
  "id": 1,
  "hospital": 1,
  "hospital_name": "City General Hospital",
  "name": "Cardiology",
  "description": "Advanced heart and cardiovascular care with latest technology",
  "created_at": "2025-10-30T00:00:00Z",
  "updated_at": "2025-10-30T00:20:00Z"
}
```

---

## 10. Delete Department

**Endpoint:** `DELETE /departments/{id}/`  
**Authentication:** Required (Hospital owner or Admin)  
**Description:** Delete a department

### Success Response (204 No Content)
No response body

### Error Responses

**403 Forbidden**
```json
{
  "detail": "You do not have permission to perform this action."
}
```

---

## 11. Create Doctor Account (Hospital Only)

**Endpoint:** `POST /doctors/create/`  
**Authentication:** Required (Hospital only)  
**Description:** Create a doctor account with auto-generated credentials

### Request Body
```json
{
  "first_name": "Ali",
  "last_name": "Mehmood",
  "email": "ali.mehmood@cityhospital.com",
  "phone_number": "+1234567890",
  "cnic": "12345-1234567-1",
  "address": "123 Doctor St, City",
  "license_number": "DOC123456",
  "specialization": "Cardiologist",
  "available_timings": {
    "monday": "9:00 AM - 5:00 PM",
    "tuesday": "9:00 AM - 5:00 PM",
    "wednesday": "9:00 AM - 5:00 PM",
    "thursday": "9:00 AM - 5:00 PM",
    "friday": "9:00 AM - 1:00 PM"
  }
}
```

### Success Response (201 Created)
```json
{
  "message": "Doctor account created successfully",
  "doctor": {
    "id": 1,
    "hospital": 1,
    "hospital_name": "City General Hospital",
    "user": 15,
    "doctor_name": "Ali Mehmood",
    "doctor_username": "alimehmood_citygeneralhospital",
    "doctor_email": "ali.mehmood@cityhospital.com",
    "cnic": "12345-1234567-1",
    "address": "123 Doctor St, City",
    "license_number": "DOC123456",
    "specialization": "Cardiologist",
    "phone_number": "+1234567890",
    "available_timings": {
      "monday": "9:00 AM - 5:00 PM",
      "tuesday": "9:00 AM - 5:00 PM",
      "wednesday": "9:00 AM - 5:00 PM",
      "thursday": "9:00 AM - 5:00 PM",
      "friday": "9:00 AM - 1:00 PM"
    },
    "is_active": true,
    "created_at": "2025-10-30T00:00:00Z",
    "updated_at": "2025-10-30T00:00:00Z"
  },
  "credentials": {
    "username": "alimehmood_citygeneralhospital",
    "password": "Ky1UiJ@8^PvZ",
    "note": "Please share these credentials with the doctor. Password will not be shown again."
  }
}
```

### Error Responses

**403 Forbidden - Hospital Not Approved**
```json
{
  "error": "Hospital must be approved before creating doctors"
}
```

**400 Bad Request**
```json
{
  "license_number": ["A doctor with this license number already exists in your hospital."]
}
```

### Validation Rules
- `first_name`: Required, max 150 characters
- `last_name`: Required, max 150 characters
- `email`: Required, valid email
- `phone_number`: Required, max 17 characters
- `cnic`: Optional, max 20 characters
- `address`: Optional
- `license_number`: Required, unique per hospital, max 100 characters
- `specialization`: Required, max 255 characters
- `available_timings`: Optional, JSON object
- Username is auto-generated: `{firstname}{lastname}_{hospitalname}`
- Password is auto-generated (12 characters, alphanumeric + symbols)

**Important:** Save the password immediately as it won't be shown again

---

## 12. List Doctors

**Endpoint:** `GET /doctors/`  
**Authentication:** Required  
**Description:** List doctors with optional hospital filter

### Query Parameters
- `page`: Page number (default: 1)
- `hospital_id`: Filter by hospital ID

### Success Response (200 OK)
```json
{
  "count": 30,
  "next": "http://localhost:8000/api/hospitals/doctors/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "hospital": 1,
      "hospital_name": "City General Hospital",
      "user": 15,
      "doctor_name": "Ali Mehmood",
      "doctor_username": "alimehmood_citygeneralhospital",
      "doctor_email": "ali.mehmood@cityhospital.com",
      "cnic": "12345-1234567-1",
      "address": "123 Doctor St, City",
      "license_number": "DOC123456",
      "specialization": "Cardiologist",
      "phone_number": "+1234567890",
      "available_timings": {
        "monday": "9:00 AM - 5:00 PM"
      },
      "is_active": true,
      "created_at": "2025-10-30T00:00:00Z",
      "updated_at": "2025-10-30T00:00:00Z"
    }
  ]
}
```

---

## 13. Get Doctor Details

**Endpoint:** `GET /doctors/{id}/`  
**Authentication:** Required  
**Description:** Get specific doctor profile

### Success Response (200 OK)
```json
{
  "id": 1,
  "hospital": 1,
  "hospital_name": "City General Hospital",
  "user": 15,
  "doctor_name": "Ali Mehmood",
  "doctor_username": "alimehmood_citygeneralhospital",
  "doctor_email": "ali.mehmood@cityhospital.com",
  "cnic": "12345-1234567-1",
  "address": "123 Doctor St, City",
  "license_number": "DOC123456",
  "specialization": "Cardiologist",
  "phone_number": "+1234567890",
  "available_timings": {
    "monday": "9:00 AM - 5:00 PM"
  },
  "is_active": true,
  "created_at": "2025-10-30T00:00:00Z",
  "updated_at": "2025-10-30T00:00:00Z"
}
```

---

## 14. Update Doctor Profile

**Endpoint:** `PUT /doctors/{id}/` or `PATCH /doctors/{id}/`  
**Authentication:** Required (Hospital owner, Doctor, or Admin)  
**Description:** Update doctor profile

### Request Body (PATCH)
```json
{
  "specialization": "Senior Cardiologist",
  "available_timings": {
    "monday": "10:00 AM - 6:00 PM",
    "tuesday": "10:00 AM - 6:00 PM"
  },
  "is_active": true
}
```

### Success Response (200 OK)
```json
{
  "id": 1,
  "hospital": 1,
  "hospital_name": "City General Hospital",
  "user": 15,
  "doctor_name": "Ali Mehmood",
  "doctor_username": "alimehmood_citygeneralhospital",
  "doctor_email": "ali.mehmood@cityhospital.com",
  "cnic": "12345-1234567-1",
  "address": "123 Doctor St, City",
  "license_number": "DOC123456",
  "specialization": "Senior Cardiologist",
  "phone_number": "+1234567890",
  "available_timings": {
    "monday": "10:00 AM - 6:00 PM",
    "tuesday": "10:00 AM - 6:00 PM"
  },
  "is_active": true,
  "created_at": "2025-10-30T00:00:00Z",
  "updated_at": "2025-10-30T00:25:00Z"
}
```

---

## 15. Find Nearby Hospitals

**Endpoint:** `GET /nearby/`  
**Authentication:** Required  
**Description:** Find hospitals within specified radius

### Query Parameters
- `lat`: Latitude (required)
- `lng`: Longitude (required)
- `radius_km`: Radius in kilometers (default: 10)

### Example Request
```
GET /nearby/?lat=40.7128&lng=-74.0060&radius_km=5
```

### Success Response (200 OK)
```json
{
  "count": 3,
  "radius_km": 5,
  "hospitals": [
    {
      "id": 1,
      "name": "City General Hospital",
      "email": "info@cityhospital.com",
      "phone": "+1234567891",
      "address": "123 Main St, City, State 12345",
      "location": "Downtown Medical District",
      "latitude": "40.7128",
      "longitude": "-74.0060",
      "distance_km": "0.50"
    },
    {
      "id": 2,
      "name": "Metro Hospital",
      "email": "info@metrohospital.com",
      "phone": "+1234567892",
      "address": "456 Second Ave, City, State 12345",
      "location": "Midtown",
      "latitude": "40.7200",
      "longitude": "-74.0100",
      "distance_km": "2.30"
    }
  ]
}
```

### Error Responses

**400 Bad Request**
```json
{
  "error": "Invalid coordinates. Provide lat, lng, and optional radius_km"
}
```

### Validation Rules
- `lat`: Required, float (-90 to 90)
- `lng`: Required, float (-180 to 180)
- `radius_km`: Optional, float (default: 10)
- Only returns approved hospitals with coordinates
- Results sorted by distance (nearest first)

---

## Notes for Frontend Integration

1. **Hospital Registration Flow:**
   - Register → Wait for admin approval → Login enabled after approval
   - Show "Pending Approval" status in UI

2. **Doctor Creation:**
   - Display generated credentials prominently
   - Provide copy-to-clipboard functionality
   - Warn that password won't be shown again
   - Consider sending credentials via email (implement separately)

3. **Geolocation:**
   - Use browser's Geolocation API for nearby hospitals
   - Handle permission denied gracefully
   - Show loading state while fetching location

4. **Department Management:**
   - Validate department name uniqueness per hospital on client side
   - Show department list when creating appointments

5. **Available Timings:**
   - Use JSON format for flexible scheduling
   - Validate time format on client side
   - Consider time zone handling
