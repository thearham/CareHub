import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layouts/DashboardLayout';

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['patient']}>
      <DashboardLayout userRole="patient">{children}</DashboardLayout>
    </ProtectedRoute>
  );
}
