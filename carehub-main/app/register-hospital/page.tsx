'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthLayout from '@/components/layouts/AuthLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { hospitalRegisterSchema, type HospitalRegisterFormData } from '@/types/forms/auth.schemas';
import { hospitalsService } from '@/lib/api/services/hospitals.service';
import toast from 'react-hot-toast';

type UserType = 'patient' | 'hospital';

export default function HospitalRegister() {
  const router = useRouter();
  const [userType] = useState<UserType>('hospital');
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<HospitalRegisterFormData>({
    resolver: zodResolver(hospitalRegisterSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      password_confirm: '',
      first_name: '',
      last_name: '',
      phone_number: '',
      hospital_name: '',
      license_number: '',
      hospital_email: '',
      hospital_phone: '',
      address: '',
      location: '',
    },
  });

  const handleUserTypeChange = (type: UserType) => {
    if (type === 'patient') {
      router.push('/register');
    }
  };

  const onSubmit = async (data: HospitalRegisterFormData) => {
    setRegisterError(null);
    try {
      await hospitalsService.register({
        username: data.username,
        email: data.email,
        password: data.password,
        password_confirm: data.password_confirm,
        first_name: data.first_name,
        last_name: data.last_name,
        phone_number: data.phone_number,
        hospital_name: data.hospital_name,
        license_number: data.license_number,
        hospital_email: data.hospital_email,
        hospital_phone: data.hospital_phone,
        address: data.address,
        location: data.location,
      });

      setIsSuccess(true);
      toast.success('Hospital registration submitted successfully!');
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
          } else if (Array.isArray(errorData.license_number) && errorData.license_number[0]) {
            errorMessage = `License: ${errorData.license_number[0]}`;
          } else if (Array.isArray(errorData.hospital_name) && errorData.hospital_name[0]) {
            errorMessage = `Hospital Name: ${errorData.hospital_name[0]}`;
          } else if (Array.isArray(errorData.password) && errorData.password[0]) {
            errorMessage = `Password: ${errorData.password[0]}`;
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

  // Success Screen
  if (isSuccess) {
    return (
      <AuthLayout>
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-green-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-[#2c3e50] mb-3">Registration Submitted!</h1>
          <p className="text-[#5a6c7d] mb-6 max-w-sm mx-auto">
            Your hospital registration has been submitted successfully. Our admin team will review
            your application and notify you once approved.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-500 mt-0.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="text-left">
                <p className="text-sm text-blue-800 font-medium">What happens next?</p>
                <ul className="text-xs text-blue-600 mt-2 space-y-1">
                  <li>• Admin will verify your hospital details</li>
                  <li>• License number will be validated</li>
                  <li>• You&apos;ll receive an email once approved</li>
                  <li>• After approval, you can login and manage your hospital</li>
                </ul>
              </div>
            </div>
          </div>
          <Link href="/login">
            <Button className="w-full">Go to Login</Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-semibold text-[#2c3e50] mb-2">Register Your Hospital</h1>
        <p className="text-sm text-[#5a6c7d]">
          Join CareHub to manage your hospital and connect with patients
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
      </div>

      {/* Info Banner */}
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="text-sm text-blue-800 font-medium">Admin Approval Required</p>
            <p className="text-xs text-blue-600 mt-1">
              Hospital accounts require verification before activation.
            </p>
          </div>
        </div>
      </div>

      {registerError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 font-medium">{registerError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Section: Hospital Information */}
        <div className="border-b border-[#e8ecef] pb-4 mb-4">
          <h2 className="text-sm font-semibold text-[#2c3e50] mb-3 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-[#1abc9c]"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1h-3v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2H5a1 1 0 01-1-1V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
                clipRule="evenodd"
              />
            </svg>
            Hospital Information
          </h2>

          <div className="space-y-3">
            <Input
              label="Hospital Name"
              placeholder="Enter hospital name"
              {...register('hospital_name')}
              error={errors.hospital_name?.message}
              disabled={isSubmitting}
            />

            <Input
              label="License Number"
              placeholder="Hospital license/registration number"
              {...register('license_number')}
              error={errors.license_number?.message}
              disabled={isSubmitting}
            />

            <Input
              label="Hospital Address"
              placeholder="Full address"
              {...register('address')}
              error={errors.address?.message}
              disabled={isSubmitting}
            />

            <Input
              label="Location / Area"
              placeholder="e.g., Gulberg III, Lahore"
              {...register('location')}
              error={errors.location?.message}
              disabled={isSubmitting}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Hospital Phone"
                type="tel"
                placeholder="+923001234567"
                {...register('hospital_phone')}
                error={errors.hospital_phone?.message}
                disabled={isSubmitting}
              />
              <Input
                label="Hospital Email"
                type="email"
                placeholder="info@hospital.com"
                {...register('hospital_email')}
                error={errors.hospital_email?.message}
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>

        {/* Section: Admin Account */}
        <div className="border-b border-[#e8ecef] pb-4 mb-4">
          <h2 className="text-sm font-semibold text-[#2c3e50] mb-3 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-[#1abc9c]"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
            Admin Account Details
          </h2>

          <div className="space-y-3">
            <Input
              label="Username"
              placeholder="Admin username for login"
              {...register('username')}
              error={errors.username?.message}
              disabled={isSubmitting}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="Admin email"
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
          </div>
        </div>

        {/* Section: Password */}
        <div>
          <h2 className="text-sm font-semibold text-[#2c3e50] mb-3 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-[#1abc9c]"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            Security
          </h2>

          <div className="space-y-3">
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
          </div>
        </div>

        <Button type="submit" className="mt-6 w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Submitting Registration...
            </span>
          ) : (
            'Register Hospital'
          )}
        </Button>
      </form>

      <div className="text-center mt-6">
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