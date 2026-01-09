'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/layouts/AuthLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { authService } from '@/lib/api/services/auth.service';
import { accountsService } from '@/lib/api/services/accounts.service';
import { setTokens, setStoredUser } from '@/lib/utils/storage';
import toast from 'react-hot-toast';

type UserType = 'patient' | 'hospital';

export default function HospitalLogin() {
  const router = useRouter();
  const [userType] = useState<UserType>('hospital');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUserTypeChange = (type: UserType) => {
    if (type === 'patient') {
      router.push('/login');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError(null);

    try {
      // Call login API
      const loginResponse = await authService.login({
        username,
        password,
      });

      // Store tokens
      setTokens(loginResponse.access, loginResponse.refresh);

      // Fetch user data
      const userData = await accountsService.getMe();

      // Check if user is a hospital
      if (userData.user_type.toLowerCase() !== 'hospital') {
        setLoginError('This login is for hospital accounts only. Please use patient login.');
        return;
      }

      // Check if hospital is approved (optional - backend should handle this)
      setStoredUser(userData);

      // Show success message
      toast.success(`Welcome back, ${userData.first_name || userData.username}!`);

      // Redirect to hospital dashboard
      window.location.href = '/hospital/dashboard';
    } catch (error: unknown) {
      let errorMessage = 'Login failed. Please check your credentials.';

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: Record<string, unknown>; status?: number } };
        const errorData = axiosError.response?.data;
        const status = axiosError.response?.status;

        if (status === 403) {
          errorMessage = 'Your hospital account is pending approval. Please wait for admin verification.';
        } else if (errorData) {
          if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          } else if (typeof errorData.error === 'string') {
            errorMessage = errorData.error;
          } else if (typeof errorData.message === 'string') {
            errorMessage = errorData.message;
          }
        }
      }

      setLoginError(errorMessage);
      console.error('Login Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-semibold text-[#2c3e50] mb-2">Hospital Login</h1>
        <p className="text-sm text-[#5a6c7d]">
          Access your hospital management dashboard
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
              d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1h-3v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2H5a1 1 0 01-1-1V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="text-sm text-blue-800 font-medium">Hospital Portal</p>
            <p className="text-xs text-blue-600 mt-1">
              Only approved hospital accounts can access this portal.
            </p>
          </div>
        </div>
      </div>

      {loginError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 font-medium">{loginError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Username"
          type="text"
          placeholder="Enter your hospital username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isSubmitting}
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isSubmitting}
          required
        />

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
              Logging in...
            </span>
          ) : (
            'Login to Hospital Portal'
          )}
        </Button>
      </form>

      <div className="text-center mt-6 space-y-3">
        <Link
          href="/forgot-password"
          className="text-sm text-[#1abc9c] hover:text-[#16a085] block"
        >
          Forgot Password?
        </Link>

        <div className="border-t border-[#e8ecef] pt-4">
          <p className="text-sm text-[#a8b7c7] mb-2">Don&apos;t have a hospital account?</p>
          <Link href="/register-hospital">
            <Button variant="secondary" className="w-full">
              Register Your Hospital
            </Button>
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}