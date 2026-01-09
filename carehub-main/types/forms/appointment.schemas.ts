import { z } from 'zod';

export const appointmentCreateSchema = z.object({
  hospital: z.number().min(1, 'Please select a hospital'),
  department: z.number().min(1, 'Please select a department'),
  preferred_date: z.string().min(1, 'Please select a date'),
  preferred_time: z.string().min(1, 'Please select a time'),
  reason: z.string().min(10, 'Please provide a reason (at least 10 characters)'),
});

export type AppointmentCreateFormData = z.infer<typeof appointmentCreateSchema>;

export const assignDoctorSchema = z.object({
  doctor_id: z.number().min(1, 'Please select a doctor'),
  confirmed_time: z.string().min(1, 'Please set a confirmed time'),
  notes: z.string().optional(),
});

export type AssignDoctorFormData = z.infer<typeof assignDoctorSchema>;
