# Medical Records API Documentation

## Base URL
```
http://localhost:8000/api/records
```

---

## 1. Create Prescription (Doctor Only)

**Endpoint:** `POST /prescriptions/create/`  
**Authentication:** Required (Doctor only)  
**Description:** Create a prescription for a patient

### Request Body
```json
{
  "appointment": 1,
  "patient": 5,
  "diagnosis": "Hypertension and mild chest discomfort",
  "investigations": "ECG, Blood Pressure monitoring, Lipid profile",
  "treatment_plan": "Medication therapy and lifestyle modifications",
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
  "follow_up_date": "2025-11-30",
  "referral_notes": "",
  "doctor_notes": "Patient advised to reduce salt intake and exercise regularly"
}
```

### Success Response (201 Created)
```json
{
  "appointment": 1,
  "patient": 5,
  "diagnosis": "Hypertension and mild chest discomfort",
  "investigations": "ECG, Blood Pressure monitoring, Lipid profile",
  "treatment_plan": "Medication therapy and lifestyle modifications",
  "medicines": [
    {
      "name": "Amlodipine",
      "dosage": "5mg",
      "frequency": "Once daily",
      "duration": "30 days",
      "instructions": "Take in the morning with food"
    }
  ],
  "follow_up_date": "2025-11-30",
  "referral_notes": "",
  "doctor_notes": "Patient advised to reduce salt intake and exercise regularly"
}
```

### Error Responses

**400 Bad Request - Validation Errors**
```json
{
  "patient": ["Patient must match the appointment's patient."],
  "medicines": ["Medicines must be a list."],
  "medicines": ["Medicine entry missing required field: dosage"]
}
```

**403 Forbidden**
```json
{
  "detail": "You do not have permission to perform this action."
}
```

### Validation Rules
- `appointment`: Optional, integer
- `patient`: Required, must match appointment's patient if appointment provided
- `diagnosis`: Required, text
- `investigations`: Optional, text
- `treatment_plan`: Optional, text
- `medicines`: Required, array of medicine objects
  - Each medicine must have: `name`, `dosage`, `frequency`
  - Optional fields: `duration`, `instructions`
- `follow_up_date`: Optional, date (YYYY-MM-DD)
- `referral_notes`: Optional, text
- `doctor_notes`: Optional, text
- Doctor is automatically set from authenticated user

---

## 2. List Prescriptions

**Endpoint:** `GET /prescriptions/`  
**Authentication:** Required  
**Description:** List prescriptions based on user type

### Query Parameters
- `page`: Page number (default: 1)

### Success Response (200 OK)
```json
{
  "count": 25,
  "next": "http://localhost:8000/api/records/prescriptions/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "appointment": 1,
      "appointment_id": 1,
      "doctor": 10,
      "doctor_name": "Dr. Ali Mehmood",
      "doctor_specialization": "Cardiologist",
      "hospital_name": "City General Hospital",
      "patient": 5,
      "patient_name": "John Doe",
      "diagnosis": "Hypertension and mild chest discomfort",
      "investigations": "ECG, Blood Pressure monitoring, Lipid profile",
      "treatment_plan": "Medication therapy and lifestyle modifications",
      "medicines": [
        {
          "name": "Amlodipine",
          "dosage": "5mg",
          "frequency": "Once daily",
          "duration": "30 days",
          "instructions": "Take in the morning with food"
        }
      ],
      "follow_up_date": "2025-11-30",
      "referral_notes": "",
      "doctor_notes": "Patient advised to reduce salt intake and exercise regularly",
      "version": 1,
      "previous_version": null,
      "created_at": "2025-10-30T00:00:00Z",
      "updated_at": "2025-10-30T00:00:00Z"
    }
  ]
}
```

### Access Control
- **Patient:** Own prescriptions only
- **Doctor:** Prescriptions they created
- **Hospital:** All prescriptions from their hospital
- **Admin:** All prescriptions

---

## 3. Get Prescription Details

**Endpoint:** `GET /prescriptions/{id}/`  
**Authentication:** Required  
**Description:** Get specific prescription with attachments

### Success Response (200 OK)
```json
{
  "id": 1,
  "appointment": 1,
  "appointment_id": 1,
  "doctor": 10,
  "doctor_name": "Dr. Ali Mehmood",
  "doctor_specialization": "Cardiologist",
  "hospital_name": "City General Hospital",
  "patient": 5,
  "patient_name": "John Doe",
  "diagnosis": "Hypertension and mild chest discomfort",
  "investigations": "ECG, Blood Pressure monitoring, Lipid profile",
  "treatment_plan": "Medication therapy and lifestyle modifications",
  "medicines": [
    {
      "name": "Amlodipine",
      "dosage": "5mg",
      "frequency": "Once daily",
      "duration": "30 days",
      "instructions": "Take in the morning with food"
    }
  ],
  "follow_up_date": "2025-11-30",
  "referral_notes": "",
  "doctor_notes": "Patient advised to reduce salt intake and exercise regularly",
  "version": 1,
  "previous_version": null,
  "created_at": "2025-10-30T00:00:00Z",
  "updated_at": "2025-10-30T00:00:00Z",
  "attachments": [
    {
      "id": 1,
      "prescription": 1,
      "file": "prescriptions/attachments/ecg_report.pdf",
      "file_url": "http://localhost:8000/media/prescriptions/attachments/ecg_report.pdf",
      "file_name": "ecg_report.pdf",
      "file_size": 245678,
      "description": "ECG test results",
      "uploaded_at": "2025-10-30T00:05:00Z"
    }
  ]
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

## 4. Add Prescription Attachment (Doctor Only)

**Endpoint:** `POST /prescriptions/{prescription_id}/attachments/`  
**Authentication:** Required (Doctor only)  
**Content-Type:** `multipart/form-data`  
**Description:** Add file attachment to prescription

### Request Body (Form Data)
```
prescription: 1
file: [binary file data]
description: "ECG test results"
```

### Success Response (201 Created)
```json
{
  "message": "Attachment added successfully",
  "attachment": {
    "id": 1,
    "prescription": 1,
    "file": "prescriptions/attachments/ecg_report.pdf",
    "file_url": "http://localhost:8000/media/prescriptions/attachments/ecg_report.pdf",
    "file_name": "ecg_report.pdf",
    "file_size": 245678,
    "description": "ECG test results",
    "uploaded_at": "2025-10-30T00:05:00Z"
  }
}
```

### Error Responses

**400 Bad Request - File Too Large**
```json
{
  "file": ["File size exceeds maximum allowed size of 10MB."]
}
```

**400 Bad Request - Invalid Extension**
```json
{
  "file": ["File extension 'exe' is not allowed. Allowed extensions: pdf, jpg, jpeg, png, doc, docx"]
}
```

**403 Forbidden**
```json
{
  "detail": "You do not have permission to perform this action."
}
```

### Validation Rules
- `prescription`: Required, valid prescription ID
- `file`: Required, max 10MB (configurable)
- `description`: Optional, text
- Allowed extensions: pdf, jpg, jpeg, png, doc, docx (configurable)
- Only the doctor who created the prescription can add attachments

---

## 5. Get Patient Prescription History (with OTP)

**Endpoint:** `GET /patients/{patient_id}/prescriptions/`  
**Authentication:** Required  
**Description:** Get prescription history for a patient (requires OTP verification for doctors)

### Query Parameters
- `page`: Page number (default: 1)

### Success Response (200 OK)
```json
{
  "count": 15,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "appointment": 1,
      "appointment_id": 1,
      "doctor": 10,
      "doctor_name": "Dr. Ali Mehmood",
      "doctor_specialization": "Cardiologist",
      "hospital_name": "City General Hospital",
      "patient": 5,
      "patient_name": "John Doe",
      "diagnosis": "Hypertension and mild chest discomfort",
      "investigations": "ECG, Blood Pressure monitoring, Lipid profile",
      "treatment_plan": "Medication therapy and lifestyle modifications",
      "medicines": [
        {
          "name": "Amlodipine",
          "dosage": "5mg",
          "frequency": "Once daily"
        }
      ],
      "follow_up_date": "2025-11-30",
      "referral_notes": "",
      "doctor_notes": "Patient advised to reduce salt intake and exercise regularly",
      "version": 1,
      "previous_version": null,
      "created_at": "2025-10-30T00:00:00Z",
      "updated_at": "2025-10-30T00:00:00Z"
    }
  ]
}
```

### Error Responses

**404 Not Found**
```json
{
  "error": "Patient not found"
}
```

**403 Forbidden - OTP Required**
```json
{
  "error": "OTP verification required to access patient records"
}
```

### Access Control
- **Patient:** Can access own prescriptions without OTP
- **Doctor:** Requires OTP verification (see OTP endpoints in Accounts API)
- **Admin:** Full access without OTP

---

## 6. Upload Patient Report

**Endpoint:** `POST /patients/{patient_id}/reports/upload/`  
**Authentication:** Required  
**Content-Type:** `multipart/form-data`  
**Description:** Upload medical report for a patient

### Request Body (Form Data)
```
file: [binary file data]
file_type: "LAB"
title: "Complete Blood Count Test"
description: "Routine blood work"
report_date: "2025-10-29"
hospital: 1
```

### File Types
- `LAB`: Lab Report
- `PRESCRIPTION`: Prescription
- `XRAY`: X-Ray
- `MRI`: MRI Scan
- `CT`: CT Scan
- `ULTRASOUND`: Ultrasound
- `OTHER`: Other

### Success Response (201 Created)
```json
{
  "file": "reports/patient_5/cbc_test.pdf",
  "file_type": "LAB",
  "title": "Complete Blood Count Test",
  "description": "Routine blood work",
  "report_date": "2025-10-29",
  "hospital": 1
}
```

### Error Responses

**400 Bad Request - File Validation**
```json
{
  "file": ["File size exceeds maximum allowed size of 10MB."],
  "file": ["File extension 'exe' is not allowed. Allowed extensions: pdf, jpg, jpeg, png, doc, docx"]
}
```

**403 Forbidden**
```json
{
  "error": "You do not have permission to upload reports for this patient"
}
```

### Validation Rules
- `file`: Required, max 10MB
- `file_type`: Required, one of the file types listed above
- `title`: Required, max 255 characters
- `description`: Optional, text
- `report_date`: Optional, date (YYYY-MM-DD)
- `hospital`: Optional, hospital ID
- Allowed extensions: pdf, jpg, jpeg, png, doc, docx
- Patient can upload own reports
- Doctors can upload for their patients (with OTP verification)

---

## 7. List Patient Reports (with OTP)

**Endpoint:** `GET /patients/{patient_id}/reports/`  
**Authentication:** Required  
**Description:** List medical reports for a patient

### Query Parameters
- `page`: Page number (default: 1)

### Success Response (200 OK)
```json
{
  "count": 10,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "patient": 5,
      "patient_name": "John Doe",
      "hospital": 1,
      "hospital_name": "City General Hospital",
      "uploaded_by": 10,
      "uploaded_by_name": "Dr. Ali Mehmood",
      "file": "reports/patient_5/cbc_test.pdf",
      "file_url": "http://localhost:8000/media/reports/patient_5/cbc_test.pdf",
      "file_type": "LAB",
      "file_size": 156789,
      "file_extension": "pdf",
      "title": "Complete Blood Count Test",
      "description": "Routine blood work",
      "report_date": "2025-10-29",
      "uploaded_at": "2025-10-30T00:00:00Z",
      "updated_at": "2025-10-30T00:00:00Z"
    }
  ]
}
```

### Error Responses

**403 Forbidden - OTP Required**
```json
{
  "error": "OTP verification required to access patient records"
}
```

### Access Control
- **Patient:** Can access own reports without OTP
- **Doctor:** Requires OTP verification
- **Admin:** Full access without OTP

---

## 8. Get Report Details

**Endpoint:** `GET /reports/{id}/`  
**Authentication:** Required  
**Description:** Get specific report details

### Success Response (200 OK)
```json
{
  "id": 1,
  "patient": 5,
  "patient_name": "John Doe",
  "hospital": 1,
  "hospital_name": "City General Hospital",
  "uploaded_by": 10,
  "uploaded_by_name": "Dr. Ali Mehmood",
  "file": "reports/patient_5/cbc_test.pdf",
  "file_url": "http://localhost:8000/media/reports/patient_5/cbc_test.pdf",
  "file_type": "LAB",
  "file_size": 156789,
  "file_extension": "pdf",
  "title": "Complete Blood Count Test",
  "description": "Routine blood work",
  "report_date": "2025-10-29",
  "uploaded_at": "2025-10-30T00:00:00Z",
  "updated_at": "2025-10-30T00:00:00Z"
}
```

---

## 9. Delete Report

**Endpoint:** `DELETE /reports/{id}/`  
**Authentication:** Required  
**Description:** Delete a medical report

### Success Response (204 No Content)
No response body

### Error Responses

**403 Forbidden**
```json
{
  "detail": "You do not have permission to perform this action."
}
```

### Access Control
- Patient can delete own reports
- Uploader can delete reports they uploaded
- Admin can delete any report

---

## 10. List My Reports (Patient Only)

**Endpoint:** `GET /my-reports/`  
**Authentication:** Required (Patient only)  
**Description:** List authenticated patient's reports

### Query Parameters
- `page`: Page number (default: 1)

### Success Response (200 OK)
```json
{
  "count": 10,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "patient": 5,
      "patient_name": "John Doe",
      "hospital": 1,
      "hospital_name": "City General Hospital",
      "uploaded_by": 5,
      "uploaded_by_name": "John Doe",
      "file": "reports/patient_5/xray_chest.jpg",
      "file_url": "http://localhost:8000/media/reports/patient_5/xray_chest.jpg",
      "file_type": "XRAY",
      "file_size": 456789,
      "file_extension": "jpg",
      "title": "Chest X-Ray",
      "description": "Routine chest examination",
      "report_date": "2025-10-28",
      "uploaded_at": "2025-10-29T00:00:00Z",
      "updated_at": "2025-10-29T00:00:00Z"
    }
  ]
}
```

---

## 11. Get Patient Medical Summary

**Endpoint:** `GET /patients/{patient_id}/summary/`  
**Authentication:** Required  
**Description:** Get comprehensive medical summary (prescriptions + reports count)

### Success Response (200 OK)
```json
{
  "patient_id": 5,
  "patient_name": "John Doe",
  "total_prescriptions": 15,
  "total_reports": 10,
  "recent_prescriptions": [
    {
      "id": 1,
      "appointment": 1,
      "appointment_id": 1,
      "doctor": 10,
      "doctor_name": "Dr. Ali Mehmood",
      "doctor_specialization": "Cardiologist",
      "hospital_name": "City General Hospital",
      "patient": 5,
      "patient_name": "John Doe",
      "diagnosis": "Hypertension",
      "medicines": [],
      "follow_up_date": "2025-11-30",
      "created_at": "2025-10-30T00:00:00Z",
      "updated_at": "2025-10-30T00:00:00Z"
    }
  ],
  "recent_reports": [
    {
      "id": 1,
      "patient": 5,
      "patient_name": "John Doe",
      "hospital": 1,
      "hospital_name": "City General Hospital",
      "file_type": "LAB",
      "title": "Complete Blood Count Test",
      "report_date": "2025-10-29",
      "uploaded_at": "2025-10-30T00:00:00Z"
    }
  ]
}
```

### Error Responses

**403 Forbidden**
```json
{
  "error": "You can only view your own medical summary"
}
```

**404 Not Found**
```json
{
  "error": "Patient not found"
}
```

### Access Control
- **Patient:** Can view own summary
- **Doctor:** Can view with OTP verification
- **Admin:** Full access

### Notes
- Returns last 5 prescriptions and reports
- Includes total counts for all records

---

## Notes for Frontend Integration

1. **File Upload:**
   - Use `FormData` for file uploads
   - Show file size before upload
   - Validate file type on client side
   - Display upload progress
   - Preview images before upload

2. **Medicine Array:**
   - Provide UI to add/remove medicines dynamically
   - Validate required fields (name, dosage, frequency)
   - Consider autocomplete for medicine names

3. **File Display:**
   - Show file type icons (PDF, Image, etc.)
   - Implement file preview/download
   - Display file size in human-readable format (KB, MB)
   - Handle different file types appropriately

4. **OTP Flow for Doctors:**
   ```
   1. Doctor requests patient records
   2. Backend checks if OTP verified
   3. If not, return 403 with OTP required message
   4. Doctor generates OTP (see Accounts API)
   5. Patient receives OTP via SMS
   6. Doctor verifies OTP
   7. Access granted for 30 minutes
   8. Doctor can now view patient records
   ```

5. **Date Handling:**
   - Use date picker for report_date and follow_up_date
   - Format dates consistently (YYYY-MM-DD for API)
   - Display in user-friendly format

6. **Prescription Versioning:**
   - Show version number
   - Link to previous versions if available
   - Highlight changes between versions

7. **Security:**
   - Never expose patient data without proper authorization
   - Implement OTP countdown timer
   - Clear OTP session after timeout
   - Warn before OTP expiry

8. **File Size Limits:**
   - Default: 10MB (configurable in settings.MAX_UPLOAD_SIZE)
   - Show remaining upload quota if implemented
   - Compress images on client side if needed

9. **Allowed File Extensions:**
   - Default: pdf, jpg, jpeg, png, doc, docx
   - Configurable in settings.ALLOWED_UPLOAD_EXTENSIONS
   - Show allowed types in UI
