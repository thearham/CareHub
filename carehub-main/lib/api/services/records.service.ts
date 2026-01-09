import { apiClient } from '../client';
import { RECORDS_ENDPOINTS } from '../endpoints';
import type {
  Prescription,
  PrescriptionCreateRequest,
  PrescriptionCreateResponse,
  PrescriptionAttachment,
  PrescriptionWithAttachments,
  MedicalReport,
  UploadReportResponse,
  PatientMedicalSummary,
  FileType,
} from '@/types/api/record.types';

export const recordsService = {
  /**
   * Create prescription (Doctor only)
   */
  createPrescription: async (data: PrescriptionCreateRequest): Promise<PrescriptionCreateResponse> => {
    const response = await apiClient.post<PrescriptionCreateResponse>(
      RECORDS_ENDPOINTS.PRESCRIPTION_CREATE,
      data
    );
    return response.data;
  },

  /**
   * Get prescriptions
   */
  getPrescriptions: async (filters?: { patient?: number }): Promise<Prescription[]> => {
    const response = await apiClient.get<Prescription[]>(RECORDS_ENDPOINTS.PRESCRIPTIONS, {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get prescription details
   */
  getPrescriptionById: async (id: number): Promise<PrescriptionWithAttachments> => {
    const response = await apiClient.get<PrescriptionWithAttachments>(
      RECORDS_ENDPOINTS.PRESCRIPTION_DETAIL(id)
    );
    return response.data;
  },

  /**
   * Add attachment to prescription
   */
  addPrescriptionAttachment: async (
    prescriptionId: number,
    file: File,
    description?: string
  ): Promise<{ message: string; attachment: PrescriptionAttachment }> => {
    const formData = new FormData();
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }

    const response = await apiClient.post<{ message: string; attachment: PrescriptionAttachment }>(
      RECORDS_ENDPOINTS.PRESCRIPTION_ATTACHMENTS(prescriptionId),
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },

  /**
   * Get patient's prescriptions
   */
  getPatientPrescriptions: async (
    patientId: number,
    otpVerified: boolean = false
  ): Promise<Prescription[]> => {
    const response = await apiClient.get<Prescription[]>(
      RECORDS_ENDPOINTS.PATIENT_PRESCRIPTIONS(patientId),
      {
        params: { otp_verified: otpVerified ? 'true' : undefined },
      }
    );
    return response.data;
  },

  /**
   * Get current patient's reports
   * GET /api/records/my-reports/
   */
  getMyReports: async (): Promise<MedicalReport[]> => {
    const response = await apiClient.get(RECORDS_ENDPOINTS.MY_REPORTS);
    
    console.log('Raw API response:', response.data);
    
    // Handle different response formats
    const data = response.data;
    
    // If it's already an array
    if (Array.isArray(data)) {
      return data;
    }
    
    // If it's a paginated response
    if (data && typeof data === 'object' && 'results' in data) {
      return data.results;
    }
    
    // If it's a single object, wrap in array
    if (data && typeof data === 'object' && 'id' in data) {
      return [data];
    }
    
    return [];
  },

  /**
   * Get report details
   */
  getReportById: async (id: number): Promise<MedicalReport> => {
    const response = await apiClient.get<MedicalReport>(RECORDS_ENDPOINTS.REPORT_DETAIL(id));
    return response.data;
  },

  /**
   * Delete report
   */
  deleteReport: async (id: number): Promise<void> => {
    await apiClient.delete(RECORDS_ENDPOINTS.REPORT_DETAIL(id));
  },

  /**
   * Get patient's reports
   */
  getPatientReports: async (
    patientId: number,
    otpVerified: boolean = false
  ): Promise<MedicalReport[]> => {
    const response = await apiClient.get<MedicalReport[]>(
      RECORDS_ENDPOINTS.PATIENT_REPORTS(patientId),
      {
        params: { otp_verified: otpVerified ? 'true' : undefined },
      }
    );
    return response.data;
  },

  /**
   * Upload medical report
   */
  uploadReport: async (
    patientId: number,
    file: File,
    fileType: FileType,
    title: string,
    description?: string,
    reportDate?: string,
    hospital?: number
  ): Promise<UploadReportResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_type', fileType);
    formData.append('title', title);
    
    if (description) {
      formData.append('description', description);
    }
    if (reportDate) {
      formData.append('report_date', reportDate);
    }
    if (hospital) {
      formData.append('hospital', hospital.toString());
    }

    const response = await apiClient.post<UploadReportResponse>(
      RECORDS_ENDPOINTS.UPLOAD_REPORT(patientId),
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },

  /**
   * Get patient's medical summary
   */
  getPatientSummary: async (patientId: number): Promise<PatientMedicalSummary> => {
    const response = await apiClient.get<PatientMedicalSummary>(
      RECORDS_ENDPOINTS.PATIENT_SUMMARY(patientId)
    );
    return response.data;
  },
};