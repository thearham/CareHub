'use client';

import { useState } from 'react';
import Link from 'next/link';
import AuthLayout from '@/components/layouts/AuthLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { authService } from '@/lib/api/services/auth.service';
import { accountsService } from '@/lib/api/services/accounts.service';
import { setTokens, setStoredUser } from '@/lib/utils/storage';
import toast from 'react-hot-toast';

type UserType = 'patient' | 'doctor' | 'hospital';

export default function Login() {
  const [userType, setUserType] = useState<UserType>('patient');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUserTypeChange = (type: UserType) => {
    setUserType(type);
    setLoginError(null);
    setUsername('');
    setPassword('');
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
      setStoredUser(userData);

      // Verify user type matches selection
      const actualUserType = userData.user_type.toLowerCase();

      if (userType === 'doctor' && actualUserType !== 'doctor') {
        setLoginError('This account is not a doctor account. Please select the correct login type.');
        setIsSubmitting(false);
        return;
      }

      if (userType === 'patient' && actualUserType !== 'patient') {
        setLoginError('This account is not a patient account. Please select the correct login type.');
        setIsSubmitting(false);
        return;
      }

      if (userType === 'hospital' && actualUserType !== 'hospital') {
        setLoginError('This account is not a hospital account. Please select the correct login type.');
        setIsSubmitting(false);
        return;
      }

      // Show success message
      toast.success(`Welcome back, ${userData.first_name || userData.username}!`);

      // Redirect based on user type
      const dashboardRoutes: Record<string, string> = {
        patient: '/patient/dashboard',
        doctor: '/doctor/dashboard',
        hospital: '/hospital/dashboard',
        admin: '/admin/dashboard',
      };

      const redirectPath = dashboardRoutes[actualUserType] || '/';

      // Force full page reload to reinitialize AuthContext
      window.location.href = redirectPath;
    } catch (error: unknown) {
      let errorMessage = 'Login failed. Please check your credentials.';

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: Record<string, unknown> } };
        const errorData = axiosError.response?.data;

        if (errorData) {
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

  // Get placeholder text based on user type
  const getPlaceholders = () => {
    switch (userType) {
      case 'doctor':
        return {
          username: 'Enter hospital-provided username',
          password: 'Enter hospital-provided password',
        };
      case 'hospital':
        return {
          username: 'Enter hospital username',
          password: 'Enter hospital password',
        };
      default:
        return {
          username: 'Enter your username',
          password: 'Enter your password',
        };
    }
  };

  // Get login button text based on user type
  const getButtonText = () => {
    if (isSubmitting) return 'Logging in...';
    switch (userType) {
      case 'doctor':
        return 'Login as Doctor';
      case 'hospital':
        return 'Login as Hospital';
      default:
        return 'Login as Patient';
    }
  };

  const placeholders = getPlaceholders();

  return (
    <AuthLayout>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-semibold text-[#2c3e50] mb-2">
          Welcome to CareHub
        </h1>
        <p className="text-sm text-[#5a6c7d]">
          Login to access your personalized healthcare portal
        </p>
      </div>

      {/* User Type Toggle - 3 Options */}
      <div className="mb-6">
        <div className="flex items-center justify-center bg-[#f0f4f7] rounded-lg p-1">
          {/* Patient Button */}
          <button
            type="button"
            onClick={() => handleUserTypeChange('patient')}
            className={`flex-1 py-3 px-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1 ${userType === 'patient'
                ? 'bg-white text-[#1abc9c] shadow-sm'
                : 'text-[#5a6c7d] hover:text-[#2c3e50]'
              }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
            <span className="hidden sm:inline">Patient</span>
          </button>

          {/* Doctor Button */}
          <button
            type="button"
            onClick={() => handleUserTypeChange('doctor')}
            className={`flex-1 py-3 px-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1 ${userType === 'doctor'
                ? 'bg-white text-[#1abc9c] shadow-sm'
                : 'text-[#5a6c7d] hover:text-[#2c3e50]'
              }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.727 1.17 1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
            <span className="hidden sm:inline">Doctor</span>
          </button>

          {/* Hospital Button */}
          <button
            type="button"
            onClick={() => handleUserTypeChange('hospital')}
            className={`flex-1 py-3 px-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1 ${userType === 'hospital'
                ? 'bg-white text-[#1abc9c] shadow-sm'
                : 'text-[#5a6c7d] hover:text-[#2c3e50]'
              }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1h-3v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2H5a1 1 0 01-1-1V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
                clipRule="evenodd"
              />
            </svg>
            <span className="hidden sm:inline">Hospital</span>
          </button>
        </div>
      </div>

      {/* Info Banners based on user type */}
      {userType === 'doctor' && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div>
              <p className="text-sm text-blue-700 font-medium">Doctor Login</p>
              <p className="text-xs text-blue-600 mt-1">
                Use the username and password provided by your hospital administrator.
              </p>
            </div>
          </div>
        </div>
      )}

      {userType === 'hospital' && (
        <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div>
              <p className="text-sm text-purple-700 font-medium">Hospital Login</p>
              <p className="text-xs text-purple-600 mt-1">
                Login with your hospital administrator credentials. Your account must be approved by admin.
              </p>
            </div>
          </div>
        </div>
      )}

      {loginError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 font-medium">{loginError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Username"
          type="text"
          placeholder={placeholders.username}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isSubmitting}
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder={placeholders.password}
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
            getButtonText()
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

        {/* Patient Registration */}
        {userType === 'patient' && (
          <div className="border-t border-[#e8ecef] pt-4">
            <p className="text-sm text-[#a8b7c7] mb-2">Don&apos;t have an account?</p>
            <Link href="/register">
              <Button variant="secondary" className="w-full">
                Create Patient Account
              </Button>
            </Link>
          </div>
        )}

        {/* Doctor Help Text */}
        {userType === 'doctor' && (
          <div className="border-t border-[#e8ecef] pt-4">
            <p className="text-sm text-[#a8b7c7]">
              Don&apos;t have credentials?
            </p>
            <p className="text-xs text-[#5a6c7d] mt-1">
              Contact your hospital administrator to get your login credentials.
            </p>
          </div>
        )}

        {/* Hospital Registration */}
        {userType === 'hospital' && (
          <div className="border-t border-[#e8ecef] pt-4">
            <p className="text-sm text-[#a8b7c7] mb-2">New hospital?</p>
            <Link href="/register-hospital">
              <Button variant="secondary" className="w-full">
                Register Your Hospital
              </Button>
            </Link>
            <p className="text-xs text-[#5a6c7d] mt-2">
              Registration requires admin approval before you can login.
            </p>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}