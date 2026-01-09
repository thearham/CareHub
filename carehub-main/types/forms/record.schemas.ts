import { z } from 'zod';

// File type values - matches backend FILE_TYPE_CHOICES
const FILE_TYPE_VALUES = ['LAB', 'PRESCRIPTION', 'XRAY', 'MRI', 'CT', 'ULTRASOUND', 'OTHER'] as const;

// Medicine schema for prescriptions
const medicineSchema = z.object({
  name: z.string().min(1, 'Medicine name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  duration: z.string().optional(),
  instructions: z.string().optional(),
});

// Prescription create schema
export const prescriptionCreateSchema = z.object({
  patient: z.number().min(1, 'Please select a patient'),
  appointment: z.number().optional(),
  diagnosis: z.string().min(1, 'Diagnosis is required'),
  investigations: z.string().optional(),
  treatment_plan: z.string().optional(),
  medicines: z.array(medicineSchema).min(1, 'At least one medicine is required'),
  follow_up_date: z.string().optional(),
  referral_notes: z.string().optional(),
  doctor_notes: z.string().optional(),
  hospital_id: z.number().optional(),
});

export type PrescriptionCreateFormData = z.infer<typeof prescriptionCreateSchema>;

// Upload report schema - matches UploadPatientReportSerializer
export const uploadReportSchema = z.object({
  file: z
    .any()
    .refine((files) => files && files.length > 0, 'Please select a file')
    .refine(
      (files) => {
        if (!files || files.length === 0) return true;
        const file = files[0];
        const maxSize = 10 * 1024 * 1024; // 10MB
        return file.size <= maxSize;
      },
      'File size must be less than 10MB'
    )
    .refine(
      (files) => {
        if (!files || files.length === 0) return true;
        const file = files[0];
        const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];
        const extension = file.name.split('.').pop()?.toLowerCase();
        return extension ? allowedExtensions.includes(extension) : false;
      },
      'File type not allowed. Allowed: PDF, JPG, JPEG, PNG, DOC, DOCX'
    ),
  file_type: z
    .string()
    .min(1, 'Please select a report type')
    .refine(
      (val) => FILE_TYPE_VALUES.includes(val as (typeof FILE_TYPE_VALUES)[number]),
      'Invalid report type'
    ),
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  description: z.string().optional(),
  report_date: z.string().optional(),
  hospital: z.number().optional(),
});

export type UploadReportFormData = z.infer<typeof uploadReportSchema>;

// Simple medicine form
export const addMedicineSchema = z.object({
  name: z.string().min(1, 'Medicine name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  duration: z.string().optional(),
  instructions: z.string().optional(),
});

export type AddMedicineFormData = z.infer<typeof addMedicineSchema>;