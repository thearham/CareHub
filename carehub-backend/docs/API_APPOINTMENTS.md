# Appointments API Documentation

## Base URL
```
http://localhost:8000/api/appointments
```

---

## 1. Create Appointment (Patient Only)

**Endpoint:** `POST /`  
**Authentication:** Required (Patient only)  
**Description:** Create a new appointment request

### Request Body
```json
{
  "hospital": 1,
  "department": 3,
  "requested_time": "2025-10-31T10:00:00Z",
  "reason": "Regular checkup and consultation for chest pain"
}
```

### Success Response (201 Created)
```json
{
  "message": "Appointment request created successfully",
  "appointment": {
    "id": 1,
    "patient": 5,
    "patient_name": "John Doe",
    "patient_phone": "+1234567890",
    "hospital": 1,
    "hospital_name": "City General Hospital",
    "department": 3,
    "department_name": "Cardiology",
    "assigned_doctor": null,
    "doctor_name": null,
    "requested_time": "2025-10-31T10:00:00Z",
    "confirmed_time": null,
    "status": "REQUESTED",
    "reason": "Regular checkup and consultation for chest pain",
    "notes": "",
    "assigned_by": null,
    "assigned_by_name": null,
    "assigned_at": null,
    "created_at": "2025-10-30T00:00:00Z",
    "updated_at": "2025-10-30T00:00:00Z"
  }
}
```

### Error Responses

**400 Bad Request - Validation Errors**
```json
{
  "requested_time": ["Requested time must be in the future."],
  "department": ["Selected department does not belong to the selected hospital."],
  "hospital": ["Selected hospital is not approved yet."]
}
```

**403 Forbidden**
```json
{
  "detail": "You do not have permission to perform this action."
}
```

### Validation Rules
- `hospital`: Required, must be approved hospital
- `department`: Required, must belong to selected hospital
- `requested_time`: Required, must be in the future
- `reason`: Required, text description
- Patient is automatically set from authenticated user
- Initial status is always "REQUESTED"

---

## 2. List Patient's Appointments

**Endpoint:** `GET /my-appointments/`  
**Authentication:** Required (Patient only)  
**Description:** List all appointments for the authenticated patient

### Query Parameters
- `page`: Page number (default: 1)

### Success Response (200 OK)
```json
{
  "count": 10,
  "next": "http://localhost:8000/api/appointments/my-appointments/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "patient": 5,
      "patient_name": "John Doe",
      "patient_phone": "+1234567890",
      "hospital": 1,
      "hospital_name": "City General Hospital",
      "department": 3,
      "department_name": "Cardiology",
      "assigned_doctor": 10,
      "doctor_name": "Dr. Ali Mehmood",
      "requested_time": "2025-10-31T10:00:00Z",
      "confirmed_time": "2025-10-31T10:30:00Z",
      "status": "CONFIRMED",
      "reason": "Regular checkup and consultation for chest pain",
      "notes": "Please bring previous medical records",
      "assigned_by": 8,
      "assigned_by_name": "Hospital Admin",
      "assigned_at": "2025-10-30T01:00:00Z",
      "created_at": "2025-10-30T00:00:00Z",
      "updated_at": "2025-10-30T01:00:00Z"
    }
  ]
}
```

---

## 3. List Hospital's Appointments

**Endpoint:** `GET /hospital-appointments/`  
**Authentication:** Required (Hospital only)  
**Description:** List all appointments for the hospital

### Query Parameters
- `page`: Page number (default: 1)
- `status`: Filter by status (REQUESTED, CONFIRMED, CANCELLED, COMPLETED)

### Success Response (200 OK)
```json
{
  "count": 50,
  "next": "http://localhost:8000/api/appointments/hospital-appointments/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "patient": 5,
      "patient_name": "John Doe",
      "patient_phone": "+1234567890",
      "hospital": 1,
      "hospital_name": "City General Hospital",
      "department": 3,
      "department_name": "Cardiology",
      "assigned_doctor": 10,
      "doctor_name": "Dr. Ali Mehmood",
      "requested_time": "2025-10-31T10:00:00Z",
      "confirmed_time": "2025-10-31T10:30:00Z",
      "status": "CONFIRMED",
      "reason": "Regular checkup and consultation for chest pain",
      "notes": "Please bring previous medical records",
      "assigned_by": 8,
      "assigned_by_name": "Hospital Admin",
      "assigned_at": "2025-10-30T01:00:00Z",
      "created_at": "2025-10-30T00:00:00Z",
      "updated_at": "2025-10-30T01:00:00Z"
    }
  ]
}
```

---

## 4. List Doctor's Appointments

**Endpoint:** `GET /doctor-appointments/`  
**Authentication:** Required (Doctor only)  
**Description:** List appointments assigned to the authenticated doctor

### Query Parameters
- `page`: Page number (default: 1)
- `status`: Filter by status (REQUESTED, CONFIRMED, CANCELLED, COMPLETED)

### Success Response (200 OK)
```json
{
  "count": 20,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "patient": 5,
      "patient_name": "John Doe",
      "patient_phone": "+1234567890",
      "patient_email": "john@example.com",
      "hospital_name": "City General Hospital",
      "department_name": "Cardiology",
      "requested_time": "2025-10-31T10:00:00Z",
      "confirmed_time": "2025-10-31T10:30:00Z",
      "status": "CONFIRMED",
      "reason": "Regular checkup and consultation for chest pain",
      "notes": "Please bring previous medical records",
      "created_at": "2025-10-30T00:00:00Z"
    }
  ]
}
```

---

## 5. Get Appointment Details

**Endpoint:** `GET /{id}/`  
**Authentication:** Required  
**Description:** Get specific appointment details

### Success Response (200 OK)
```json
{
  "id": 1,
  "patient": 5,
  "patient_name": "John Doe",
  "patient_phone": "+1234567890",
  "hospital": 1,
  "hospital_name": "City General Hospital",
  "department": 3,
  "department_name": "Cardiology",
  "assigned_doctor": 10,
  "doctor_name": "Dr. Ali Mehmood",
  "requested_time": "2025-10-31T10:00:00Z",
  "confirmed_time": "2025-10-31T10:30:00Z",
  "status": "CONFIRMED",
  "reason": "Regular checkup and consultation for chest pain",
  "notes": "Please bring previous medical records",
  "assigned_by": 8,
  "assigned_by_name": "Hospital Admin",
  "assigned_at": "2025-10-30T01:00:00Z",
  "created_at": "2025-10-30T00:00:00Z",
  "updated_at": "2025-10-30T01:00:00Z"
}
```

### Error Responses

**404 Not Found**
```json
{
  "detail": "Not found."
}
```

**403 Forbidden**
```json
{
  "detail": "You do not have permission to perform this action."
}
```

### Access Control
- **Patient:** Can view own appointments only
- **Hospital:** Can view appointments at their hospital
- **Doctor:** Can view appointments assigned to them
- **Admin:** Can view all appointments

---

## 6. Assign Doctor to Appointment (Hospital Only)

**Endpoint:** `POST /{id}/assign-doctor/`  
**Authentication:** Required (Hospital only)  
**Description:** Assign a doctor to an appointment

### Request Body
```json
{
  "doctor_id": 10,
  "confirmed_time": "2025-10-31T10:30:00Z",
  "notes": "Please bring previous medical records and arrive 15 minutes early"
}
```

### Success Response (200 OK)
```json
{
  "message": "Doctor assigned successfully",
  "appointment": {
    "id": 1,
    "patient": 5,
    "patient_name": "John Doe",
    "patient_phone": "+1234567890",
    "hospital": 1,
    "hospital_name": "City General Hospital",
    "department": 3,
    "department_name": "Cardiology",
    "assigned_doctor": 10,
    "doctor_name": "Dr. Ali Mehmood",
    "requested_time": "2025-10-31T10:00:00Z",
    "confirmed_time": "2025-10-31T10:30:00Z",
    "status": "CONFIRMED",
    "reason": "Regular checkup and consultation for chest pain",
    "notes": "Please bring previous medical records and arrive 15 minutes early",
    "assigned_by": 8,
    "assigned_by_name": "Hospital Admin",
    "assigned_at": "2025-10-30T01:00:00Z",
    "created_at": "2025-10-30T00:00:00Z",
    "updated_at": "2025-10-30T01:00:00Z"
  }
}
```

### Error Responses

**400 Bad Request - Already Assigned**
```json
{
  "error": "Appointment cannot be assigned. It may already have a doctor or is not in REQUESTED status."
}
```

**400 Bad Request - Invalid Time**
```json
{
  "confirmed_time": ["Confirmed time must be in the future."]
}
```

**404 Not Found - Doctor Not Found**
```json
{
  "error": "Doctor not found in your hospital or is inactive"
}
```

**404 Not Found - Appointment Not Found**
```json
{
  "error": "Appointment not found"
}
```

### Validation Rules
- `doctor_id`: Required, must be active doctor in the hospital
- `confirmed_time`: Optional, must be in the future if provided
- `notes`: Optional, text
- Appointment must be in "REQUESTED" status
- Appointment must not already have a doctor assigned
- Status automatically changes to "CONFIRMED" if confirmed_time is provided

---

## 7. Update Appointment Status

**Endpoint:** `PATCH /{id}/status/`  
**Authentication:** Required (Hospital, Doctor, or Patient)  
**Description:** Update appointment status

### Request Body
```json
{
  "status": "COMPLETED",
  "notes": "Consultation completed successfully"
}
```

### Success Response (200 OK)
```json
{
  "message": "Appointment status updated to COMPLETED",
  "appointment": {
    "id": 1,
    "patient": 5,
    "patient_name": "John Doe",
    "patient_phone": "+1234567890",
    "hospital": 1,
    "hospital_name": "City General Hospital",
    "department": 3,
    "department_name": "Cardiology",
    "assigned_doctor": 10,
    "doctor_name": "Dr. Ali Mehmood",
    "requested_time": "2025-10-31T10:00:00Z",
    "confirmed_time": "2025-10-31T10:30:00Z",
    "status": "COMPLETED",
    "reason": "Regular checkup and consultation for chest pain",
    "notes": "Consultation completed successfully",
    "assigned_by": 8,
    "assigned_by_name": "Hospital Admin",
    "assigned_at": "2025-10-30T01:00:00Z",
    "created_at": "2025-10-30T00:00:00Z",
    "updated_at": "2025-10-31T11:00:00Z"
  }
}
```

### Error Responses

**403 Forbidden - Patient Restriction**
```json
{
  "error": "Patients can only cancel appointments"
}
```

**404 Not Found**
```json
{
  "error": "Appointment not found"
}
```

### Validation Rules
- `status`: Required, must be one of: CONFIRMED, CANCELLED, COMPLETED
- `notes`: Optional, text
- **Patient:** Can only set status to CANCELLED
- **Hospital/Doctor:** Can set any status

---

## 8. Cancel Appointment

**Endpoint:** `POST /{id}/cancel/`  
**Authentication:** Required (Patient or Hospital)  
**Description:** Cancel an appointment

### Request Body (Optional)
```json
{
  "notes": "Patient requested cancellation due to scheduling conflict"
}
```

### Success Response (200 OK)
```json
{
  "message": "Appointment cancelled successfully",
  "appointment": {
    "id": 1,
    "patient": 5,
    "patient_name": "John Doe",
    "patient_phone": "+1234567890",
    "hospital": 1,
    "hospital_name": "City General Hospital",
    "department": 3,
    "department_name": "Cardiology",
    "assigned_doctor": 10,
    "doctor_name": "Dr. Ali Mehmood",
    "requested_time": "2025-10-31T10:00:00Z",
    "confirmed_time": "2025-10-31T10:30:00Z",
    "status": "CANCELLED",
    "reason": "Regular checkup and consultation for chest pain",
    "notes": "Patient requested cancellation due to scheduling conflict",
    "assigned_by": 8,
    "assigned_by_name": "Hospital Admin",
    "assigned_at": "2025-10-30T01:00:00Z",
    "created_at": "2025-10-30T00:00:00Z",
    "updated_at": "2025-10-30T05:00:00Z"
  }
}
```

### Error Responses

**400 Bad Request - Already Completed**
```json
{
  "error": "Cannot cancel completed appointment"
}
```

**403 Forbidden**
```json
{
  "error": "Only patients and hospitals can cancel appointments"
}
```

**404 Not Found**
```json
{
  "error": "Appointment not found"
}
```

### Validation Rules
- Cannot cancel appointments with status "COMPLETED"
- Notes are optional but recommended
- Only Patient (own appointments) or Hospital (their appointments) can cancel

---

## Appointment Status Flow

```
REQUESTED → CONFIRMED → COMPLETED
    ↓           ↓
CANCELLED   CANCELLED
```

### Status Definitions
- **REQUESTED:** Initial state when patient creates appointment
- **CONFIRMED:** Hospital assigned doctor and confirmed time
- **CANCELLED:** Appointment cancelled by patient or hospital
- **COMPLETED:** Appointment finished (set by doctor or hospital)

---

## Notes for Frontend Integration

1. **Date/Time Handling:**
   - Use ISO 8601 format for all datetime fields
   - Convert to user's timezone for display
   - Validate that requested_time is in the future
   - Show countdown/time until appointment

2. **Status Badges:**
   - REQUESTED: Yellow/Warning
   - CONFIRMED: Blue/Info
   - COMPLETED: Green/Success
   - CANCELLED: Red/Danger

3. **Permission-Based UI:**
   - Show "Assign Doctor" button only for hospitals
   - Show "Cancel" button for patients and hospitals
   - Show "Mark Complete" button for doctors and hospitals
   - Hide patient contact info from other patients

4. **Real-time Updates:**
   - Consider implementing WebSocket for appointment status updates
   - Refresh appointment list after status changes
   - Show notifications for new appointments (hospital/doctor)

5. **Filters:**
   - Implement status filter dropdown
   - Add date range filter
   - Search by patient name (hospital/doctor view)

6. **Validation:**
   - Prevent selecting past dates/times
   - Validate department belongs to selected hospital
   - Check hospital approval status before allowing appointment

7. **User Experience:**
   - Show loading states during API calls
   - Confirm before cancellation
   - Display success/error messages
   - Auto-refresh after 30 seconds on list views
