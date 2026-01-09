'use client';

import { useQuery } from '@tanstack/react-query';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';
import { appointmentsService } from '@/lib/api/services/appointments.service';
import { recordsService } from '@/lib/api/services/records.service';

export default function DoctorDashboard() {
  const { data: appointments, isLoading: appointmentsLoading, error: appointmentsError } = useQuery({
    queryKey: ['doctor-appointments'],
    queryFn: () => appointmentsService.getDoctorAppointments(),
  });

  const { data: prescriptions, isLoading: prescriptionsLoading } = useQuery({
    queryKey: ['doctor-prescriptions'],
    queryFn: () => recordsService.getPrescriptions(),
  });

  const isLoading = appointmentsLoading || prescriptionsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (appointmentsError) {
    return <ErrorMessage message="Failed to load dashboard data" />;
  }

  const pendingAppointments = Array.isArray(appointments)
    ? appointments.filter(apt => apt.status === 'REQUESTED' || apt.status === 'CONFIRMED')
    : [];
  const totalAppointments = Array.isArray(appointments) ? appointments.length : 0;
  const prescriptionsCount = Array.isArray(prescriptions) ? prescriptions.length : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[#2c3e50]">Doctor Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Pending Appointments" value={pendingAppointments.length.toString()} icon="📅" />
        <Card title="Total Appointments" value={totalAppointments.toString()} icon="✅" />
        <Card title="Prescriptions Issued" value={prescriptionsCount.toString()} icon="📝" />
      </div>

      {/* Recent Appointments */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e8ecef]">
          <h2 className="text-xl font-semibold text-[#2c3e50]">Recent Appointments</h2>
        </div>
        {appointments && appointments.length > 0 ? (
          <table className="w-full">
            <thead className="bg-[#f0f4f7]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#2c3e50]">Patient Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#2c3e50]">Department</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#2c3e50]">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#2c3e50]">Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.slice(0, 5).map((appointment) => (
                <tr key={appointment.id} className="border-t border-[#e8ecef] hover:bg-[#f0f4f7] transition-colors">
                  <td className="px-6 py-4 text-[#5a6c7d]">{appointment.patient_name}</td>
                  <td className="px-6 py-4 text-[#5a6c7d]">{appointment.department_name}</td>
                  <td className="px-6 py-4 text-[#5a6c7d]">
                    {new Date(appointment.preferred_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      appointment.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                      appointment.status === 'REQUESTED' ? 'bg-yellow-100 text-yellow-700' :
                      appointment.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {appointment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-[#5a6c7d]">
            No appointments found
          </div>
        )}
      </div>
    </div>
  );
}
