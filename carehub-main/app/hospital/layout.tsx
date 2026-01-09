import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layouts/DashboardLayout';

export default function HospitalLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['hospital']}>
      <DashboardLayout userRole="hospital">{children}</DashboardLayout>
    </ProtectedRoute>
  );
}
