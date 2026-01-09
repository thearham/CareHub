import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layouts/DashboardLayout';

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['doctor']}>
      <DashboardLayout userRole="doctor">{children}</DashboardLayout>
    </ProtectedRoute>
  );
}
