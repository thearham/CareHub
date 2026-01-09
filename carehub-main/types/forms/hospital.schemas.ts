import { z } from 'zod';

export const departmentCreateSchema = z.object({
  name: z.string().min(1, 'Department name is required'),
});

export type DepartmentCreateFormData = z.infer<typeof departmentCreateSchema>;

export const doctorCreateSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone_number: z.string().min(10, 'Valid phone number is required'),
  specialization: z.string().min(1, 'Specialization is required'),
  department: z.number().optional(),
});

export type DoctorCreateFormData = z.infer<typeof doctorCreateSchema>;
