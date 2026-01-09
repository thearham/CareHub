// Base API URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

// Auth endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: '/api/token/',
  REFRESH: '/api/token/refresh/',
};

// Accounts endpoints
export const ACCOUNTS_ENDPOINTS = {
  REGISTER_PATIENT: '/api/accounts/patients/register/',
  ME: '/api/accounts/me/',
  CHANGE_PASSWORD: '/api/accounts/change-password/',
  OTP_GENERATE: '/api/accounts/otp/generate/',
  OTP_VERIFY: '/api/accounts/otp/verify/',
  USERS: '/api/accounts/users/',
  DASHBOARD_STATS: '/api/accounts/dashboard-stats/',
} as const;

// Hospitals endpoints
export const HOSPITALS_ENDPOINTS = {
  REGISTER: '/api/hospitals/register/',
  LIST: '/api/hospitals/',
  DETAIL: (id: number) => `/api/hospitals/${id}/`,
  APPROVE: (id: number) => `/api/hospitals/${id}/approve/`,
  NEARBY: '/api/hospitals/nearby/',
  DEPARTMENTS: '/api/hospitals/departments/',
  DEPARTMENT_DETAIL: (id: number) => `/api/hospitals/departments/${id}/`,
  HOSPITAL_DEPARTMENTS: (hospitalId: number) => `/api/hospitals/${hospitalId}/departments/`,
  HOSPITAL_DOCTORS: (hospitalId: number) => `/api/hospitals/${hospitalId}/doctors/`,
  DOCTORS_CREATE: '/api/hospitals/doctors/create/',
  DOCTORS: '/api/hospitals/doctors/',
  DOCTOR_DETAIL: (id: number) => `/api/hospitals/doctors/${id}/`,
} as const;

// Records endpoints
export const RECORDS_ENDPOINTS = {
  PRESCRIPTIONS: '/api/records/prescriptions/',
  PRESCRIPTION_CREATE: '/api/records/prescriptions/create/',
  PRESCRIPTION_DETAIL: (id: number) => `/api/records/prescriptions/${id}/`,
  PRESCRIPTION_ATTACHMENTS: (id: number) => `/api/records/prescriptions/${id}/attachments/`,
  MY_REPORTS: '/api/records/my-reports/',
  REPORT_DETAIL: (id: number) => `/api/records/reports/${id}/`,
  PATIENT_PRESCRIPTIONS: (patientId: number) => `/api/records/patients/${patientId}/prescriptions/`,
  PATIENT_REPORTS: (patientId: number) => `/api/records/patients/${patientId}/reports/`,
  UPLOAD_REPORT: (patientId: number) => `/api/records/patients/${patientId}/reports/upload/`,
  PATIENT_SUMMARY: (patientId: number) => `/api/records/patients/${patientId}/summary/`,
} as const;

// Appointments endpoints
export const APPOINTMENTS_ENDPOINTS = {
  CREATE: '/api/appointments/',
  MY_APPOINTMENTS: '/api/appointments/my-appointments/',
  HOSPITAL_APPOINTMENTS: '/api/appointments/hospital-appointments/',
  DOCTOR_APPOINTMENTS: '/api/appointments/doctor-appointments/',
  DETAIL: (id: number) => `/api/appointments/${id}/`,
  ASSIGN_DOCTOR: (id: number) => `/api/appointments/${id}/assign-doctor/`,
  UPDATE_STATUS: (id: number) => `/api/appointments/${id}/status/`,
  CANCEL: (id: number) => `/api/appointments/${id}/cancel/`,
} as const;