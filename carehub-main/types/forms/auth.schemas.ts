import { z } from 'zod';

// Common password validation
const passwordValidation = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// Common phone validation
const phoneValidation = z
  .string()
  .min(1, 'Phone number is required')
  .regex(/^\+?1?\d{9,15}$/, 'Phone number must be in format: +999999999 (9-15 digits)');

// Patient Registration Schema (UNCHANGED - keep as is)
export const patientRegisterSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(150, 'Username must be less than 150 characters')
      .regex(/^[\w.@+-]+$/, 'Username can only contain letters, numbers, and @/./+/-/_'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    first_name: z
      .string()
      .min(1, 'First name is required')
      .max(150, 'First name must be less than 150 characters'),
    last_name: z
      .string()
      .min(1, 'Last name is required')
      .max(150, 'Last name must be less than 150 characters'),
    phone_number: phoneValidation,
    password: passwordValidation,
    password_confirm: z.string().min(1, 'Please confirm your password'),
    consent: z.boolean().refine((val) => val === true, {
      message: 'You must agree to the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "Passwords don't match",
    path: ['password_confirm'],
  });

export type PatientRegisterFormData = z.infer<typeof patientRegisterSchema>;

// Hospital Registration Schema - MATCHES BACKEND HospitalRegistrationSerializer
export const hospitalRegisterSchema = z
  .object({
    // User fields (for hospital account)
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(150, 'Username must be less than 150 characters')
      .regex(/^[\w.@+-]+$/, 'Username can only contain letters, numbers, and @/./+/-/_'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    first_name: z
      .string()
      .min(1, 'First name is required')
      .max(150, 'First name must be less than 150 characters'),
    last_name: z
      .string()
      .min(1, 'Last name is required')
      .max(150, 'Last name must be less than 150 characters'),
    phone_number: phoneValidation,
    password: passwordValidation,
    password_confirm: z.string().min(1, 'Please confirm your password'),

    // Hospital fields - MATCHES BACKEND
    hospital_name: z
      .string()
      .min(2, 'Hospital name must be at least 2 characters')
      .max(255, 'Hospital name must be less than 255 characters'),
    license_number: z
      .string()
      .min(3, 'License number must be at least 3 characters')
      .max(100, 'License number must be less than 100 characters'),
    hospital_email: z
      .string()
      .min(1, 'Hospital email is required')
      .email('Please enter a valid email address'),
    hospital_phone: phoneValidation,
    address: z
      .string()
      .min(5, 'Address must be at least 5 characters')
      .max(500, 'Address must be less than 500 characters'),
    location: z
      .string()
      .min(2, 'Location must be at least 2 characters')
      .max(255, 'Location must be less than 255 characters'),
    latitude: z.number().optional().nullable(),
    longitude: z.number().optional().nullable(),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "Passwords don't match",
    path: ['password_confirm'],
  });

export type HospitalRegisterFormData = z.infer<typeof hospitalRegisterSchema>;

// Login Schema (UNCHANGED)
export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;