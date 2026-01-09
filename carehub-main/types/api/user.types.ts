// Patient Registration - matches PatientRegistrationSerializer exactly
export interface PatientRegisterRequest {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  consent: boolean;
}

// Patient Registration Response - returns User data
export interface PatientRegisterResponse {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone_number: string;
  user_type: string;
  is_active: boolean;
  date_joined: string;
}

// Hospital Registration - matches HospitalRegistrationSerializer
export interface HospitalRegisterRequest {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  hospital_name: string;
}

export interface HospitalRegisterResponse {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone_number: string;
  user_type: string;
  is_active: boolean;
  date_joined: string;
}

// OTP Generate - matches OTPGenerateSerializer
export interface OTPGenerateRequest {
  patient_phone: string;
  patient_id?: number;
}

// OTP Generate Response - matches OTPGenerateResponseSerializer
export interface OTPGenerateResponse {
  message: string;
  expires_at: string;
  phone_number: string; // Last 4 digits
}

// OTP Verify - matches OTPVerifySerializer
export interface OTPVerifyRequest {
  patient_phone: string;
  otp: string;
}

// OTP Verify Response - matches OTPVerifyResponseSerializer
export interface OTPVerifyResponse {
  message: string;
  patient_id: number;
  verified: boolean;
  access_granted_until: string;
}

// Dashboard Stats - matches DashboardStatsSerializer
export interface DashboardStats {
  total_users: number;
  total_patients: number;
  total_doctors: number;
  total_hospitals: number;
  approved_hospitals: number;
  pending_hospitals: number;
  total_appointments: number;
  pending_appointments: number;
}