'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthLayout from '@/components/layouts/AuthLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { patientRegisterSchema, type PatientRegisterFormData } from '@/types/forms/auth.schemas';
import { accountsService } from '@/lib/api/services/accounts.service';
import { authService } from '@/lib/api/services/auth.service';
import { setTokens, setStoredUser } from '@/lib/utils/storage';
import toast from 'react-hot-toast';

type UserType = 'patient' | 'hospital';

export default function Register() {
  const router = useRouter();
  const [userType] = useState<UserType>('patient');
  const [registerError, setRegisterError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PatientRegisterFormData>({
    resolver: zodResolver(patientRegisterSchema),
    defaultValues: {
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      phone_number: '',
      password: '',
      password_confirm: '',
      consent: false,
    },
  });

  // ...existing code...

  // Handle user type toggle - UPDATE THIS FUNCTION
  const handleUserTypeChange = (type: UserType) => {
    if (type === 'hospital') {
      router.push('/register-hospital');  // Changed from '/hospital/register'
    }
  };

// ...existing code...

  const onSubmit = async (data: PatientRegisterFormData) => {
    setRegisterError(null);
    try {
      await accountsService.registerPatient({
        username: data.username,
        email: data.email,
        password: data.password,
        password_confirm: data.password_confirm,
        first_name: data.first_name,
        last_name: data.last_name,
        phone_number: data.phone_number,
        consent: data.consent,
      });

      toast.success('Registration successful! Logging you in...');

      // Auto-login after successful registration
      const loginResponse = await authService.login({
        username: data.username,
        password: data.password,
      });

      // Store tokens
      setTokens(loginResponse.access, loginResponse.refresh);

      // Fetch and store user data
      const userData = await accountsService.getMe();
      setStoredUser(userData);

      toast.success(`Welcome, ${userData.first_name || userData.username}!`);

      // Redirect to patient dashboard
      window.location.href = '/patient/dashboard';
    } catch (error: unknown) {
      let errorMessage = 'Registration failed. Please try again.';

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: Record<string, unknown> } };
        const errorData = axiosError.response?.data;

        if (errorData) {
          if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          } else if (typeof errorData.message === 'string') {
            errorMessage = errorData.message;
          } else if (Array.isArray(errorData.username) && errorData.username[0]) {
            errorMessage = `Username: ${errorData.username[0]}`;
          } else if (Array.isArray(errorData.email) && errorData.email[0]) {
            errorMessage = `Email: ${errorData.email[0]}`;
          } else if (Array.isArray(errorData.phone_number) && errorData.phone_number[0]) {
            errorMessage = `Phone: ${errorData.phone_number[0]}`;
          } else if (Array.isArray(errorData.password) && errorData.password[0]) {
            errorMessage = `Password: ${errorData.password[0]}`;
          } else if (Array.isArray(errorData.consent) && errorData.consent[0]) {
            errorMessage = `Consent: ${errorData.consent[0]}`;
          } else if (
            typeof errorData.non_field_errors === 'object' &&
            Array.isArray(errorData.non_field_errors)
          ) {
            errorMessage = errorData.non_field_errors[0] as string;
          }
        }
      }

      setRegisterError(errorMessage);
      console.error('Registration error:', error);
    }
  };

  return (
    <AuthLayout>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-semibold text-[#2c3e50] mb-2">Create Your Account</h1>
        <p className="text-sm text-[#5a6c7d]">
          Join CareHub to access personalized healthcare services
        </p>
      </div>

      {/* User Type Toggle */}
      <div className="mb-6">
        <div className="flex items-center justify-center bg-[#f0f4f7] rounded-lg p-1">
          <button
            type="button"
            onClick={() => handleUserTypeChange('patient')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
              userType === 'patient'
                ? 'bg-white text-[#1abc9c] shadow-sm'
                : 'text-[#5a6c7d] hover:text-[#2c3e50]'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
            Patient
          </button>
          <button
            type="button"
            onClick={() => handleUserTypeChange('hospital')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
              userType === 'hospital'
                ? 'bg-white text-[#1abc9c] shadow-sm'
                : 'text-[#5a6c7d] hover:text-[#2c3e50]'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1h-3v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2H5a1 1 0 01-1-1V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
                clipRule="evenodd"
              />
            </svg>
            Hospital
          </button>
        </div>
        <p className="text-xs text-center text-[#a8b7c7] mt-2">
          Select your account type to continue
        </p>
      </div>

      {registerError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 font-medium">{registerError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <Input
          label="Username"
          placeholder="Enter your username"
          {...register('username')}
          error={errors.username?.message}
          disabled={isSubmitting}
        />
        <Input
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          {...register('email')}
          error={errors.email?.message}
          disabled={isSubmitting}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First Name"
            placeholder="First name"
            {...register('first_name')}
            error={errors.first_name?.message}
            disabled={isSubmitting}
          />
          <Input
            label="Last Name"
            placeholder="Last name"
            {...register('last_name')}
            error={errors.last_name?.message}
            disabled={isSubmitting}
          />
        </div>
        <Input
          label="Phone Number"
          type="tel"
          placeholder="+923001234567"
          {...register('phone_number')}
          error={errors.phone_number?.message}
          disabled={isSubmitting}
        />
        <Input
          label="Password"
          type="password"
          placeholder="Create a strong password"
          {...register('password')}
          error={errors.password?.message}
          disabled={isSubmitting}
        />
        <Input
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          {...register('password_confirm')}
          error={errors.password_confirm?.message}
          disabled={isSubmitting}
        />

        <div className="flex items-start gap-2 pt-2">
          <input
            type="checkbox"
            id="consent"
            {...register('consent')}
            disabled={isSubmitting}
            className="mt-1 accent-[#1abc9c]"
          />
          <label htmlFor="consent" className="text-sm text-[#5a6c7d]">
            I agree to the terms and conditions and consent to data processing
          </label>
        </div>
        {errors.consent && <p className="text-xs text-red-500">{errors.consent.message}</p>}

        <Button type="submit" className="mt-4 w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Creating Account...' : 'Register as Patient'}
        </Button>
      </form>

      <div className="text-center mt-4">
        <p className="text-sm text-[#a8b7c7]">Already have an account?</p>
        <Link href="/login">
          <Button variant="secondary" className="mt-2 w-full">
            Login
          </Button>
        </Link>
      </div>
    </AuthLayout>
  );
}