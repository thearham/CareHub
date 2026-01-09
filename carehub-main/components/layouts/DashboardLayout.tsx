'use client';

import { useAuth } from '@/hooks/useAuth';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: 'patient' | 'doctor' | 'hospital';
}

export default function DashboardLayout({ children, userRole }: DashboardLayoutProps) {
  const { logout, user } = useAuth();

  return (
    <div className="flex min-h-screen">
      <Sidebar userRole={userRole} />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            {user && (
              <p className="text-sm text-[#5a6c7d]">
                Welcome, <span className="font-semibold text-[#2c3e50]">{user.first_name || user.username}</span>
              </p>
            )}
          </div>
          <button
            onClick={logout}
            className="text-[#1abc9c] hover:text-[#16a085] font-medium transition-colors"
          >
            Log out
          </button>
        </div>
        <div className="animate-slide-up">{children}</div>
      </main>
    </div>
  );
}
