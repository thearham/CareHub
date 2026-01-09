'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import { appointmentsService, Appointment } from '@/lib/api/services/appointments.service';
import { hospitalsService, Doctor } from '@/lib/api/services/hospitals.service';

type StatusFilter = 'ALL' | 'REQUESTED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

interface ApiError extends Error {
  response?: {
    data?: {
      error?: string;
      detail?: string;
    };
  };
}

export default function HospitalAppointmentsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
  const [confirmedTime, setConfirmedTime] = useState('');
  const [notes, setNotes] = useState('');

  // Fetch hospital appointments
  const {
    data: appointments,
    isLoading,
    error,
  } = useQuery<Appointment[]>({
    queryKey: ['hospital-appointments', statusFilter],
    queryFn: async () => {
      const result = await appointmentsService.getHospitalAppointments(statusFilter === 'ALL' ? undefined : statusFilter);
      return result || [];
    },
  });

  // Fetch doctors for assignment
  const { data: doctors } = useQuery<Doctor[]>({
    queryKey: ['hospital-doctors'],
    queryFn: async () => {
      const result = await hospitalsService.getDoctors();
      return result || [];
    },
  });

  // Assign doctor mutation
  const assignDoctorMutation = useMutation({
    mutationFn: ({ appointmentId, data }: { appointmentId: number; data: { doctor_id: number; confirmed_time?: string; notes?: string } }) =>
      appointmentsService.assignDoctor(appointmentId, data),
    onSuccess: () => {
      toast.success('Doctor assigned successfully!');
      queryClient.invalidateQueries({ queryKey: ['hospital-appointments'] });
      closeAssignModal();
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.error || error.response?.data?.detail || 'Failed to assign doctor');
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ appointmentId, status, notes }: { appointmentId: number; status: string; notes?: string }) =>
      appointmentsService.updateStatus(appointmentId, { status, notes }),
    onSuccess: () => {
      toast.success('Appointment status updated!');
      queryClient.invalidateQueries({ queryKey: ['hospital-appointments'] });
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.error || error.response?.data?.detail || 'Failed to update status');
    },
  });

  // Cancel appointment mutation
  const cancelMutation = useMutation({
    mutationFn: (appointmentId: number) => appointmentsService.cancelAppointment(appointmentId),
    onSuccess: () => {
      toast.success('Appointment cancelled!');
      queryClient.invalidateQueries({ queryKey: ['hospital-appointments'] });
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.error || error.response?.data?.detail || 'Failed to cancel appointment');
    },
  });

  const openAssignModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowAssignModal(true);
  };

  const closeAssignModal = () => {
    setSelectedAppointment(null);
    setShowAssignModal(false);
    setSelectedDoctorId(null);
    setConfirmedTime('');
    setNotes('');
  };

  const handleAssignDoctor = () => {
    if (!selectedAppointment || !selectedDoctorId) {
      toast.error('Please select a doctor');
      return;
    }

    assignDoctorMutation.mutate({
      appointmentId: selectedAppointment.id,
      data: {
        doctor_id: selectedDoctorId,
        confirmed_time: confirmedTime ? new Date(confirmedTime).toISOString() : undefined,
        notes: notes || undefined,
      },
    }, {
      onSuccess: () => {
        // Also update status to CONFIRMED if backend does not do it automatically
        updateStatusMutation.mutate({ appointmentId: selectedAppointment.id, status: 'CONFIRMED' });
      }
    });
  };

  const handleMarkComplete = (appointmentId: number) => {
    if (window.confirm('Mark this appointment as completed?')) {
      updateStatusMutation.mutate({ appointmentId, status: 'COMPLETED' });
    }
  };

  const handleCancel = (appointmentId: number) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      cancelMutation.mutate(appointmentId);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      REQUESTED: 'bg-yellow-100 text-yellow-700',
      CONFIRMED: 'bg-blue-100 text-blue-700',
      COMPLETED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-red-100 text-red-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-PK', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  // Stats - safely handle undefined appointments
  const appointmentsList = appointments || [];
  const stats = {
    total: appointmentsList.length,
    requested: appointmentsList.filter(a => a.status === 'REQUESTED').length,
    confirmed: appointmentsList.filter(a => a.status === 'CONFIRMED').length,
    completed: appointmentsList.filter(a => a.status === 'COMPLETED').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#2c3e50]">Appointments Management</h1>
        <p className="text-[#5a6c7d] mt-1">View and manage patient appointments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-[#1abc9c]">
          <p className="text-[#5a6c7d] text-sm">Total Appointments</p>
          <p className="text-2xl font-bold text-[#2c3e50] mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-yellow-500">
          <p className="text-[#5a6c7d] text-sm">Pending Review</p>
          <p className="text-2xl font-bold text-[#2c3e50] mt-1">{stats.requested}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-blue-500">
          <p className="text-[#5a6c7d] text-sm">Confirmed</p>
          <p className="text-2xl font-bold text-[#2c3e50] mt-1">{stats.confirmed}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-green-500">
          <p className="text-[#5a6c7d] text-sm">Completed</p>
          <p className="text-2xl font-bold text-[#2c3e50] mt-1">{stats.completed}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-[#e8ecef]">
          <div className="flex overflow-x-auto">
            {(['ALL', 'REQUESTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as StatusFilter[]).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-6 py-4 font-medium whitespace-nowrap transition-all ${
                  statusFilter === status
                    ? 'text-[#1abc9c] border-b-2 border-[#1abc9c]'
                    : 'text-[#5a6c7d] hover:text-[#2c3e50]'
                }`}
              >
                {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
                {status === 'REQUESTED' && stats.requested > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                    {stats.requested}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1abc9c] mb-4"></div>
            <p className="text-[#5a6c7d]">Loading appointments...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              <p className="font-medium">Failed to load appointments. Please try again.</p>
              <p className="text-sm mt-1 text-red-600">
                {(error as ApiError)?.response?.data?.detail || 
                 (error as ApiError)?.response?.data?.error || 
                 (error as Error)?.message || 
                 'Unknown error occurred'}
              </p>
            </div>
          </div>
        )}

        {/* Appointments Table */}
        {!isLoading && !error && (
          <div className="overflow-x-auto">
            {appointmentsList.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">📅</div>
                <p className="text-[#2c3e50] font-medium">No appointments found</p>
                <p className="text-sm text-[#5a6c7d] mt-1">
                  {statusFilter === 'ALL'
                    ? 'No appointments have been made yet.'
                    : `No ${statusFilter.toLowerCase()} appointments.`}
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-[#f0f4f7]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#2c3e50]">Patient</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#2c3e50]">Department</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#2c3e50]">Requested Time</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#2c3e50]">Doctor</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#2c3e50]">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#2c3e50]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointmentsList.map((appointment) => (
                    <tr key={appointment.id} className="border-t border-[#e8ecef] hover:bg-[#f8f9fa]">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-[#2c3e50]">{appointment.patient_name}</p>
                          <p className="text-sm text-[#5a6c7d]">{appointment.patient_phone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#5a6c7d]">{appointment.department_name}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-[#2c3e50]">{formatDateTime(appointment.requested_time)}</p>
                          {appointment.confirmed_time && (
                            <p className="text-sm text-[#1abc9c]">
                              Confirmed: {formatDateTime(appointment.confirmed_time)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {appointment.doctor_name ? (
                          <span className="text-[#2c3e50]">{appointment.doctor_name}</span>
                        ) : (
                          <span className="text-[#a8b7c7] italic">Not assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {appointment.status === 'REQUESTED' && (
                            <>
                              <button
                                onClick={() => openAssignModal(appointment)}
                                className="text-[#1abc9c] hover:text-[#16a085] font-medium text-sm"
                              >
                                Assign Doctor
                              </button>
                              <button
                                onClick={() => handleCancel(appointment.id)}
                                className="text-red-500 hover:text-red-600 font-medium text-sm"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {appointment.status === 'CONFIRMED' && (
                            <>
                              <button
                                onClick={() => handleMarkComplete(appointment.id)}
                                className="text-green-600 hover:text-green-700 font-medium text-sm"
                              >
                                Complete
                              </button>
                              <button
                                onClick={() => handleCancel(appointment.id)}
                                className="text-red-500 hover:text-red-600 font-medium text-sm"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {(appointment.status === 'COMPLETED' || appointment.status === 'CANCELLED') && (
                            <span className="text-[#a8b7c7] text-sm">No actions</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Assign Doctor Modal */}
      {showAssignModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#2c3e50]">Assign Doctor</h2>
              <button onClick={closeAssignModal} className="text-[#5a6c7d] hover:text-[#2c3e50]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Patient Info */}
              <div className="p-3 bg-[#f0f4f7] rounded-lg">
                <p className="text-sm text-[#5a6c7d]">Patient</p>
                <p className="font-medium text-[#2c3e50]">{selectedAppointment.patient_name}</p>
                <p className="text-sm text-[#5a6c7d] mt-1">
                  Department: {selectedAppointment.department_name}
                </p>
                <p className="text-sm text-[#5a6c7d]">
                  Requested: {formatDateTime(selectedAppointment.requested_time)}
                </p>
              </div>

              {/* Doctor Selection */}
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-1">
                  Select Doctor <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedDoctorId || ''}
                  onChange={(e) => setSelectedDoctorId(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-white border border-[#e8ecef] rounded focus:outline-none focus:border-[#1abc9c]"
                >
                  <option value="">Choose a doctor</option>
                  {doctors?.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.user.first_name} {doctor.user.last_name}
                      {doctor.user.username ? ` (${doctor.user.username})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Confirmed Time */}
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-1">
                  Confirmed Time (optional)
                </label>
                <input
                  type="datetime-local"
                  value={confirmedTime}
                  onChange={(e) => setConfirmedTime(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-[#e8ecef] rounded focus:outline-none focus:border-[#1abc9c]"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-1">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Any additional notes..."
                  className="w-full px-4 py-3 bg-white border border-[#e8ecef] rounded focus:outline-none focus:border-[#1abc9c] resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button variant="secondary" onClick={closeAssignModal} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handleAssignDoctor}
                  disabled={assignDoctorMutation.isPending}
                  className="flex-1"
                >
                  {assignDoctorMutation.isPending ? 'Assigning...' : 'Assign & Confirm'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}