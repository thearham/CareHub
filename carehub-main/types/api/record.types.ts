// File type choices - matches PatientReport.FILE_TYPE_CHOICES
export const FILE_TYPE_VALUES = ['LAB', 'PRESCRIPTION', 'XRAY', 'MRI', 'CT', 'ULTRASOUND', 'OTHER'] as const;
export type FileType = (typeof FILE_TYPE_VALUES)[number];

export const FILE_TYPE_LABELS: Record<FileType, string> = {
  LAB: 'Lab Report',
  PRESCRIPTION: 'Prescription',
  XRAY: 'X-Ray',
  MRI: 'MRI Scan',
  CT: 'CT Scan',
  ULTRASOUND: 'Ultrasound',
  OTHER: 'Other',
};

// Medicine structure for prescriptions
export interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration?: string;
  instructions?: string;
}

// Prescription - matches PrescriptionSerializer
export interface Prescription {
  id: number;
  appointment: number | null;
  appointment_id: number | null;
  doctor: number;
  doctor_name: string;
  doctor_specialization: string;
  hospital_name: string;
  patient: number;
  patient_name: string;
  diagnosis: string;
  investigations: string;
  treatment_plan: string;
  medicines: Medicine[];
  follow_up_date: string | null;
  referral_notes: string;
  doctor_notes: string;
  version: number;
  previous_version: number | null;
  created_at: string;
  updated_at: string;
}

// Prescription with attachments
export interface PrescriptionWithAttachments extends Prescription {
  attachments: PrescriptionAttachment[];
}

// Create prescription request
export interface PrescriptionCreateRequest {
  appointment?: number;
  patient: number;
  diagnosis: string;
  investigations?: string;
  treatment_plan?: string;
  medicines: Medicine[];
  follow_up_date?: string;
  referral_notes?: string;
  doctor_notes?: string;
  hospital_id?: number;
}

export interface PrescriptionCreateResponse {
  message: string;
  prescription: Prescription;
}

// Prescription attachment
export interface PrescriptionAttachment {
  id: number;
  prescription: number;
  file: string;
  file_url: string;
  file_name: string;
  file_size: number;
  description: string;
  uploaded_at: string;
}

// Medical report - matches PatientReportSerializer exactly
export interface MedicalReport {
  id: number;
  patient: number;
  patient_name: string;
  hospital: number | null;
  hospital_name: string | null;
  uploaded_by: number | null;
  uploaded_by_name: string | null;
  file: string;
  file_url: string | null;
  file_type: FileType;
  file_size: number;
  file_extension: string;
  title: string;
  description: string;
  report_date: string | null;
  uploaded_at: string;
  updated_at: string;
}

// Upload report response
export interface UploadReportResponse {
  message: string;
  report: MedicalReport;
}

// Patient medical summary
export interface PatientMedicalSummary {
  patient_id: number;
  patient_name: string;
  total_prescriptions: number;
  total_reports: number;
  recent_prescriptions: Prescription[];
  recent_reports: MedicalReport[];
}

// Paginated response (if backend uses pagination)
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}