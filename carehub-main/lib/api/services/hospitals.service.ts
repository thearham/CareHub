import { apiClient } from '../client';
import { HOSPITALS_ENDPOINTS } from '../endpoints';

// ============ HOSPITAL TYPES ============

export interface Hospital {
  id: number;
  user: number;
  user_username: string;
  user_email: string;
  name: string;
  license_number: string;
  email: string;
  phone: string;
  address: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  is_approved: boolean;
  approved_by: number | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  distance_km?: number;
}

export interface HospitalRegisterRequest {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  hospital_name: string;
  license_number: string;
  hospital_email: string;
  hospital_phone: string;
  address: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface HospitalRegisterResponse {
  message: string;
  hospital: Hospital;
}

export interface HospitalListResponse {
  results?: Hospital[];
  count?: number;
}

export interface NearbyHospitalsResponse {
  count: number;
  radius_km: number;
  user_location: {
    latitude: number;
    longitude: number;
  };
  hospitals: Hospital[];
}

// ============ DEPARTMENT TYPES ============

export interface Department {
  id: number;
  name: string;
  hospital: number;
  hospital_name?: string;
}

export interface DepartmentCreateRequest {
  name: string;
}

// ============ DOCTOR TYPES ============

export interface DoctorUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
}

export interface Doctor {
  id: number;
  user: DoctorUser;
  specialization: string;
  license_number?: string;
  hospital: number;
  hospital_name?: string;
  department?: number;
  department_name?: string;
  is_active?: boolean;
  created_at?: string;
}

export interface DoctorCreateRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  specialization: string;
  license_number?: string;
  department?: number;
}

export interface DoctorCreateResponse {
  message: string;
  doctor_id: number;
  username: string;
  password: string;
  email: string;
  specialization: string;
}

// ============ HOSPITALS SERVICE ============

export const hospitalsService = {
  /**
   * Register a new hospital
   */
  register: async (data: HospitalRegisterRequest): Promise<HospitalRegisterResponse> => {
    const response = await apiClient.post<HospitalRegisterResponse>(
      HOSPITALS_ENDPOINTS.REGISTER,
      data
    );
    return response.data;
  },

  /**
   * Get list of hospitals
   */
  getList: async (params?: { is_approved?: boolean }): Promise<Hospital[]> => {
    const response = await apiClient.get<Hospital[] | HospitalListResponse>(
      HOSPITALS_ENDPOINTS.LIST,
      { params }
    );
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.results || [];
  },

  /**
   * Get hospital details
   */
  getDetail: async (id: number): Promise<Hospital> => {
    const response = await apiClient.get<Hospital>(HOSPITALS_ENDPOINTS.DETAIL(id));
    return response.data;
  },

  /**
   * Get nearby hospitals with full response data
   */
  getNearby: async (
    lat: number,
    lng: number,
    radiusKm: number = 10
  ): Promise<NearbyHospitalsResponse> => {
    const response = await apiClient.get<NearbyHospitalsResponse>(
      HOSPITALS_ENDPOINTS.NEARBY,
      { params: { lat, lng, radius_km: radiusKm } }
    );
    return response.data;
  },

  /**
   * Get nearby hospitals (returns only hospitals array)
   */
  getNearbyHospitals: async (
    lat: number,
    lng: number,
    radiusKm: number = 10
  ): Promise<Hospital[]> => {
    const response = await apiClient.get<NearbyHospitalsResponse>(
      HOSPITALS_ENDPOINTS.NEARBY,
      { params: { lat, lng, radius_km: radiusKm } }
    );
    return response.data.hospitals;
  },

  /**
   * Get all departments (for hospital admin - their own hospital's departments)
   */
  getDepartments: async (): Promise<Department[]> => {
    const response = await apiClient.get<Department[] | { results: Department[] }>(
      HOSPITALS_ENDPOINTS.DEPARTMENTS
    );
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.results || [];
  },

  /**
   * Get a single department by ID
   * API: /api/hospitals/departments/{departmentId}/
   */
  getDepartmentById: async (departmentId: number): Promise<Department> => {
    const response = await apiClient.get<Department>(
      `/api/hospitals/departments/${departmentId}/`
    );
    return response.data;
  },

  /**
   * Get departments for a specific hospital (for patients booking)
   * API: /api/hospitals/departments/?hospital_id={hospitalId}
   * Note: This endpoint returns departments filtered by hospital ID
   */
  getHospitalDepartments: async (hospitalId: number): Promise<Department[]> => {
    const response = await apiClient.get<Department[] | { results: Department[] }>(
      `/api/hospitals/departments/`,
      { params: { hospital_id: hospitalId } }
    );
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.results || [];
  },

  /**
   * Get doctors for a specific hospital
   * API: /api/hospitals/doctors/{hospitalId}/
   */
  getHospitalDoctors: async (hospitalId: number): Promise<Doctor[]> => {
    const response = await apiClient.get<Doctor[] | { results: Doctor[] }>(
      `/api/hospitals/doctors/${hospitalId}/`
    );
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.results || [];
  },

  /**
   * Create a new department
   */
  createDepartment: async (data: DepartmentCreateRequest): Promise<Department> => {
    const response = await apiClient.post<Department>(
      HOSPITALS_ENDPOINTS.DEPARTMENTS,
      data
    );
    return response.data;
  },

  /**
   * Update a department
   */
  updateDepartment: async (id: number, data: Partial<DepartmentCreateRequest>): Promise<Department> => {
    const response = await apiClient.patch<Department>(
      HOSPITALS_ENDPOINTS.DEPARTMENT_DETAIL(id),
      data
    );
    return response.data;
  },

  /**
   * Delete a department
   */
  deleteDepartment: async (id: number): Promise<void> => {
    await apiClient.delete(HOSPITALS_ENDPOINTS.DEPARTMENT_DETAIL(id));
  },

  /**
   * Get all doctors (for hospital admin - their own hospital's doctors)
   */
  getDoctors: async (): Promise<Doctor[]> => {
    const response = await apiClient.get<Doctor[] | { results: Doctor[] }>(
      HOSPITALS_ENDPOINTS.DOCTORS
    );
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.results || [];
  },

  /**
   * Create a new doctor
   */
  createDoctor: async (data: DoctorCreateRequest): Promise<DoctorCreateResponse> => {
    const response = await apiClient.post<DoctorCreateResponse>(
      HOSPITALS_ENDPOINTS.DOCTORS_CREATE,
      data
    );
    return response.data;
  },

  /**
   * Get doctor details
   */
  getDoctorDetail: async (id: number): Promise<Doctor> => {
    const response = await apiClient.get<Doctor>(HOSPITALS_ENDPOINTS.DOCTOR_DETAIL(id));
    return response.data;
  },

  /**
   * Update a doctor
   */
  updateDoctor: async (id: number, data: Partial<DoctorCreateRequest>): Promise<Doctor> => {
    const response = await apiClient.patch<Doctor>(
      HOSPITALS_ENDPOINTS.DOCTOR_DETAIL(id),
      data
    );
    return response.data;
  },

  /**
   * Delete a doctor
   */
  deleteDoctor: async (id: number): Promise<void> => {
    await apiClient.delete(HOSPITALS_ENDPOINTS.DOCTOR_DETAIL(id));
  },
};