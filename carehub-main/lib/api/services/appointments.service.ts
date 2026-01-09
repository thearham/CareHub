import { apiClient } from '../client';

// ============ APPOINTMENT TYPES ============

export interface Appointment {
  id: number;
  patient: number;
  patient_name: string;
  patient_phone: string;
  hospital: number;
  hospital_name: string;
  department: number;
  department_name: string;
  assigned_doctor: number | null;
  doctor_name: string | null;
  requested_time: string;
  confirmed_time: string | null;
  status: 'REQUESTED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  reason: string;
  notes: string;
  assigned_by: number | null;
  assigned_by_name: string | null;
  assigned_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAppointmentRequest {
  hospital: number;
  department: number;
  requested_time: string;
  reason?: string;
}

export interface AssignDoctorRequest {
  doctor_id: number;
  confirmed_time?: string;
  notes?: string;
}

export interface UpdateStatusRequest {
  status: string;
  notes?: string;
}

export interface AppointmentResponse {
  message: string;
  appointment: Appointment;
}

// ============ APPOINTMENTS SERVICE ============

export const appointmentsService = {
  /**
   * Create a new appointment (Patient)
   */
  createAppointment: async (data: CreateAppointmentRequest): Promise<AppointmentResponse> => {
    const response = await apiClient.post<AppointmentResponse>(
      '/api/appointments/',
      data
    );
    return response.data;
  },

  /**
   * Get patient's appointments
   */
  getMyAppointments: async (): Promise<Appointment[]> => {
    const response = await apiClient.get<Appointment[] | { results: Appointment[] }>(
      '/api/appointments/my-appointments/'
    );
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.results || [];
  },

  /**
   * Get hospital's appointments
   */
  getHospitalAppointments: async (status?: string): Promise<Appointment[]> => {
    const params = status ? { status } : {};
    const response = await apiClient.get<Appointment[] | { results: Appointment[] }>(
      '/api/appointments/hospital-appointments/',
      { params }
    );
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.results || [];
  },

  /**
   * Get doctor's appointments
   */
  getDoctorAppointments: async (status?: string): Promise<Appointment[]> => {
    const params = status ? { status } : {};
    const response = await apiClient.get<Appointment[] | { results: Appointment[] }>(
      '/api/appointments/doctor-appointments/',
      { params }
    );
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.results || [];
  },

  /**
   * Get appointment details
   */
  getAppointment: async (id: number): Promise<Appointment> => {
    const response = await apiClient.get<Appointment>(
      `/api/appointments/${id}/`
    );
    return response.data;
  },

  /**
   * Assign doctor to appointment (Hospital)
   */
  assignDoctor: async (appointmentId: number, data: AssignDoctorRequest): Promise<AppointmentResponse> => {
    const response = await apiClient.post<AppointmentResponse>(
      `/api/appointments/${appointmentId}/assign-doctor/`,
      data
    );
    return response.data;
  },

  /**
   * Update appointment status
   */
  updateStatus: async (appointmentId: number, data: UpdateStatusRequest): Promise<AppointmentResponse> => {
    const response = await apiClient.patch<AppointmentResponse>(
      `/api/appointments/${appointmentId}/status/`,
      data
    );
    return response.data;
  },

  /**
   * Cancel appointment
   */
  cancelAppointment: async (appointmentId: number, notes?: string): Promise<AppointmentResponse> => {
    const response = await apiClient.post<AppointmentResponse>(
      `/api/appointments/${appointmentId}/cancel/`,
      notes ? { notes } : {}
    );
    return response.data;
  },
};