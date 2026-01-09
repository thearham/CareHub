export type AppointmentStatus = 'REQUESTED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface Appointment {
  id: number;
  patient: number;
  hospital: number;
  department: number;
  doctor?: number;
  status: AppointmentStatus;
  preferred_date: string;
  preferred_time: string;
  confirmed_time?: string;
  reason: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AppointmentCreateRequest {
  hospital: number;
  department: number;
  preferred_date: string;
  preferred_time: string;
  reason: string;
}

export interface AppointmentCreateResponse {
  id: number;
  patient: number;
  hospital: number;
  department: number;
  status: AppointmentStatus;
  preferred_date: string;
  message: string;
}

export interface AppointmentListItem {
  id: number;
  hospital_name: string;
  department_name: string;
  doctor_name?: string;
  patient_name?: string;
  status: AppointmentStatus;
  preferred_date: string;
  preferred_time: string;
  confirmed_time?: string;
  reason: string;
}

export interface AssignDoctorRequest {
  doctor_id: number;
  confirmed_time: string;
  notes?: string;
}

export interface UpdateStatusRequest {
  status: AppointmentStatus;
  notes?: string;
}

export interface CancelAppointmentRequest {
  notes?: string;
}
