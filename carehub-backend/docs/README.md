# CareHub API Documentation

Complete API documentation for the CareHub multi-tenant healthcare dashboard backend.

## Table of Contents

1. [Authentication](./API_AUTHENTICATION.md)
2. [Accounts](./API_ACCOUNTS.md)
3. [Hospitals](./API_HOSPITALS.md)
4. [Appointments](./API_APPOINTMENTS.md)
5. [Medical Records](./API_RECORDS.md)
6. [Medicine Recommendations](./API_RECOMMENDATIONS.md)

---

## Quick Start

### Base URL
```
http://localhost:8000/api
```

### Authentication
All endpoints (except registration and login) require JWT authentication.

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Get Started
1. [Register as Patient](./API_ACCOUNTS.md#1-patient-registration) or [Register as Hospital](./API_HOSPITALS.md#1-hospital-registration)
2. [Login to get JWT tokens](./API_AUTHENTICATION.md#1-login-get-jwt-token)
3. Use access token in Authorization header for all requests
4. [Refresh token](./API_AUTHENTICATION.md#2-refresh-token) before expiry

---

## User Types & Permissions

### ADMIN
- Full system access
- Approve/reject hospitals
- View all users, appointments, records
- Access dashboard statistics
- Clear recommendation cache

### HOSPITAL
- Manage hospital profile
- Create departments
- Create doctor accounts
- View and manage appointments at their hospital
- Assign doctors to appointments
- Cannot access other hospitals' data

### DOCTOR
- View assigned appointments
- Create prescriptions
- Upload medical reports
- Request OTP for patient record access
- View patient records (with OTP verification)
- Get medicine recommendations

### PATIENT
- Self-registration
- Create appointments
- View own appointments
- Cancel appointments
- View own prescriptions and reports
- Upload own medical reports
- Provide OTP for doctor access

---

## Common Response Codes

### Success Codes
- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `204 No Content` - Successful deletion

### Client Error Codes
- `400 Bad Request` - Validation error or invalid data
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded

### Server Error Codes
- `500 Internal Server Error` - Server-side error

---

## Pagination

List endpoints return paginated results:

```json
{
  "count": 100,
  "next": "http://localhost:8000/api/endpoint/?page=2",
  "previous": null,
  "results": [...]
}
```

### Query Parameters
- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 20, max: 100)

---

## Error Response Format

```json
{
  "field_name": ["Error message for this field"],
  "another_field": ["Another error message"],
  "non_field_errors": ["General error message"]
}
```

Or for general errors:

```json
{
  "error": "Error message",
  "detail": "Detailed error description"
}
```

---

## Date & Time Format

All dates and times use ISO 8601 format:

- **DateTime:** `2025-10-30T12:30:00Z` (UTC)
- **Date:** `2025-10-30`
- **Time:** `12:30:00`

**Important:** Always send datetime in UTC. Backend will handle timezone conversions.

---

## File Uploads

### Supported Formats
- **Documents:** PDF, DOC, DOCX
- **Images:** JPG, JPEG, PNG

### Size Limits
- **Maximum file size:** 10MB (configurable)
- **Prescription attachments:** 10MB
- **Medical reports:** 10MB

### Upload Format
Use `multipart/form-data` content type:

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('title', 'Report Title');
formData.append('file_type', 'LAB');
```

---

## Rate Limiting

### OTP Generation
- **Limit:** 3 requests per 15 minutes per IP
- **Endpoint:** `POST /api/accounts/otp/generate/`

### Medicine Recommendations
- **Limit:** 10 requests per hour per user
- **Endpoint:** `POST /api/recommendations/`

### Rate Limit Response
```json
{
  "detail": "Request was throttled. Expected available in 900 seconds."
}
```

---

## Special Features

### OTP Verification Flow
For doctors accessing patient records:

1. Doctor requests patient records
2. System checks OTP verification
3. If not verified, returns 403 error
4. Doctor generates OTP via `/api/accounts/otp/generate/`
5. Patient receives OTP via SMS
6. Doctor verifies OTP via `/api/accounts/otp/verify/`
7. Access granted for 30 minutes
8. Doctor can now view patient records

### Medicine Recommendations
- Powered by GROQ LLM
- Provides alternatives, warnings, and suggestions
- Considers patient allergies and comorbidities
- Cached for performance
- Rate limited to prevent abuse

### Geolocation
- Find nearby hospitals using coordinates
- Specify radius in kilometers
- Results sorted by distance

---

## API Documentation Endpoints

### Swagger UI
```
http://localhost:8000/api/docs/
```
Interactive API documentation with "Try it out" feature

### ReDoc
```
http://localhost:8000/api/schema/redoc/
```
Clean, readable API documentation

### OpenAPI Schema
```
http://localhost:8000/api/schema/
```
Download OpenAPI 3.0 schema (YAML/JSON)

---

## Environment Variables

Required environment variables for the backend:

```env
# Django
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
POSTGRES_DB=carehub_db
POSTGRES_USER=carehub_user
POSTGRES_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432

# JWT
JWT_ACCESS_TOKEN_LIFETIME_MINUTES=60
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7

# GROQ API
GROQ_API_KEY=your-groq-api-key

# SMS Provider (Optional)
SMS_PROVIDER_API_KEY=your-sms-api-key
SMS_PROVIDER_URL=https://sms-provider.com/api

# File Upload
MAX_UPLOAD_SIZE_MB=10
ALLOWED_UPLOAD_EXTENSIONS=pdf,jpg,jpeg,png,doc,docx

# OTP
OTP_EXPIRY_MINUTES=10
OTP_LENGTH=6

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

---

## Next.js Integration Guide

### 1. Setup Axios Instance

```javascript
// lib/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/token/refresh/`,
          { refresh: refreshToken }
        );
        
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

### 2. Authentication Hook

```javascript
// hooks/useAuth.js
import { useState, useEffect } from 'react';
import api from '@/lib/api';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        const response = await api.get('/accounts/me/');
        setUser(response.data);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    const response = await api.post('/token/', { username, password });
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
    await checkAuth();
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  return { user, loading, login, logout, checkAuth };
}
```

### 3. API Service Examples

```javascript
// services/appointments.js
import api from '@/lib/api';

export const appointmentsService = {
  // Create appointment
  create: (data) => api.post('/appointments/', data),
  
  // Get patient's appointments
  getMyAppointments: (page = 1) => 
    api.get(`/appointments/my-appointments/?page=${page}`),
  
  // Get appointment details
  getById: (id) => api.get(`/appointments/${id}/`),
  
  // Cancel appointment
  cancel: (id, notes) => 
    api.post(`/appointments/${id}/cancel/`, { notes }),
};

// services/hospitals.js
export const hospitalsService = {
  // List hospitals
  list: (page = 1) => api.get(`/hospitals/?page=${page}`),
  
  // Get nearby hospitals
  getNearby: (lat, lng, radius = 10) =>
    api.get(`/hospitals/nearby/?lat=${lat}&lng=${lng}&radius_km=${radius}`),
  
  // Get departments
  getDepartments: (hospitalId) =>
    api.get(`/hospitals/departments/?hospital_id=${hospitalId}`),
};
```

### 4. Error Handling

```javascript
// utils/errorHandler.js
export function handleApiError(error) {
  if (error.response) {
    // Server responded with error
    const { status, data } = error.response;
    
    if (status === 400) {
      // Validation errors
      return {
        type: 'validation',
        errors: data,
      };
    } else if (status === 401) {
      return {
        type: 'auth',
        message: 'Please login again',
      };
    } else if (status === 403) {
      return {
        type: 'permission',
        message: data.error || data.detail || 'Permission denied',
      };
    } else if (status === 404) {
      return {
        type: 'notfound',
        message: 'Resource not found',
      };
    } else if (status === 429) {
      return {
        type: 'ratelimit',
        message: data.detail || 'Too many requests',
      };
    }
  }
  
  return {
    type: 'network',
    message: 'Network error. Please try again.',
  };
}
```

### 5. File Upload Component

```javascript
// components/FileUpload.jsx
import { useState } from 'react';
import api from '@/lib/api';

export function FileUpload({ patientId, onSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = async (file, fileType, title, description) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_type', fileType);
    formData.append('title', title);
    formData.append('description', description);

    setUploading(true);
    
    try {
      const response = await api.post(
        `/records/patients/${patientId}/reports/upload/`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          },
        }
      );
      
      onSuccess(response.data);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    // Your upload UI here
    <div>
      {uploading && <progress value={progress} max="100" />}
    </div>
  );
}
```

---

## Testing

### Using cURL

```bash
# Login
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"demo_patient","password":"patient123"}'

# Get current user
curl -X GET http://localhost:8000/api/accounts/me/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Create appointment
curl -X POST http://localhost:8000/api/appointments/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "hospital": 1,
    "department": 1,
    "requested_time": "2025-11-01T10:00:00Z",
    "reason": "Regular checkup"
  }'
```

### Using Postman

1. Import OpenAPI schema from `http://localhost:8000/api/schema/`
2. Set up environment variables:
   - `base_url`: `http://localhost:8000/api`
   - `access_token`: (set after login)
3. Use collection runner for automated testing

---

## Support

For issues or questions:
- Check the specific endpoint documentation
- Review error responses carefully
- Ensure proper authentication headers
- Validate request body format
- Check rate limits

---

## Changelog

### Version 1.0.0 (2025-10-30)
- Initial API release
- Authentication with JWT
- User management (Admin, Hospital, Doctor, Patient)
- Hospital registration and approval
- Department management
- Doctor account creation
- Appointment scheduling
- Prescription management
- Medical report uploads
- OTP verification for patient records
- Medicine recommendations with GROQ LLM
- Geolocation-based hospital search

---

## License

This API is part of the CareHub project. All rights reserved.
