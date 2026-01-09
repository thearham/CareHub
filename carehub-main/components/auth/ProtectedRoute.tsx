'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/api/common.types';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

// Authentication is now enabled
const ENABLE_AUTH = true;

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Skip auth checks in development mode
    if (!ENABLE_AUTH) return;

    if (!isLoading) {
      if (!isAuthenticated) {
        // Not authenticated, redirect to login
        router.push('/login');
      } else if (user && !allowedRoles.includes(user.user_type.toLowerCase() as UserRole)) {
        // Authenticated but wrong role, redirect to their dashboard or unauthorized page
        const dashboardRoutes: Record<string, string> = {
          patient: '/patient/dashboard',
          doctor: '/doctor/dashboard',
          hospital: '/hospital/dashboard',
          admin: '/admin/dashboard',
        };
        const userType = user.user_type.toLowerCase();
        const redirectPath = dashboardRoutes[userType] || '/';
        router.push(redirectPath);
      }
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, router]);

  // DEVELOPMENT MODE: Bypass authentication
  if (!ENABLE_AUTH) {
    return <>{children}</>;
  }

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Not authenticated or wrong role
  if (!isAuthenticated || (user && !allowedRoles.includes(user.user_type.toLowerCase() as UserRole))) {
    return null;
  }

  // Authenticated and has correct role
  return <>{children}</>;
}
