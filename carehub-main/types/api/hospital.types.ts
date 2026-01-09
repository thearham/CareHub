export interface Hospital {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  address: string;
  latitude?: number;
  longitude?: number;
  license_number: string;
  is_approved: boolean;
  created_at: string;
}

export interface HospitalListItem {
  id: number;
  name: string;
  address: string;
  phone_number: string;
  is_approved: boolean;
  latitude?: number;
  longitude?: number;
  distance_km?: number;
}

export interface Department {
  id: number;
  name: string;
  hospital: number;
  hospital_name?: string;
}

export interface DepartmentCreateRequest {
  name: string;
}

export interface Doctor {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
  };
  specialization: string;
  license_number?: string;
  hospital: number;
  hospital_name?: string;
  department?: number;
  department_name?: string;
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
  password: string;  // Plain password returned only on creation
  email: string;
  specialization: string;
}

export interface ApproveHospitalRequest {
  is_approved: boolean;
}