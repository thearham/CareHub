'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import { appointmentsService, Appointment } from '@/lib/api/services/appointments.service';
import { hospitalsService, Department } from '@/lib/api/services/hospitals.service';

const STATUS_COLORS: Record<string, string> = {
  REQUESTED: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
};

const STATUS_ICONS: Record<string, string> = {
  REQUESTED: '',
  CONFIRMED: '',
  CANCELLED: '',
  COMPLETED: '',
};

export default function PatientAppointmentsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelNotes, setCancelNotes] = useState('');

  // Fetch appointments
  const {
    data: appointments,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['my-appointments'],
    queryFn: () => appointmentsService.getMyAppointments(),
  });

  // Get unique hospital IDs from appointments
  const uniqueHospitalIds = appointments
    ? [...new Set(appointments.map((apt) => apt.hospital))].filter(Boolean)
    : [];

  // Fetch departments for all hospitals the patient has appointments with
  const {
    data: departmentsData,
    isLoading: isDepartmentsLoading,
  } = useQuery({
    queryKey: ['hospital-departments', uniqueHospitalIds],
    queryFn: async () => {
      if (uniqueHospitalIds.length === 0) return [];

      // Fetch departments for each hospital in parallel
      const departmentPromises = uniqueHospitalIds.map((hospitalId) =>
        hospitalsService.getHospitalDepartments(hospitalId)
      );

      const departmentArrays = await Promise.all(departmentPromises);

      // Flatten and deduplicate departments by name
      const allDepartments = departmentArrays.flat();
      const uniqueDepartments = allDepartments.reduce((acc: Department[], dept) => {
        if (!acc.find((d) => d.name === dept.name)) {
          acc.push(dept);
        }
        return acc;
      }, []);

      return uniqueDepartments;
    },
    enabled: uniqueHospitalIds.length > 0,
  });

  // Get unique department names from fetched departments
  const uniqueDepartments = departmentsData
    ? departmentsData.map((dept) => dept.name).filter(Boolean)
    : [];

  // Get unique hospitals from appointments
  const uniqueHospitals = appointments
    ? [...new Set(appointments.map((apt) => apt.hospital_name))].filter(Boolean)
    : [];

  // Cancel appointment mutation
  const cancelMutation = useMutation({
    mutationFn: ({ id, notes }: { id: number; notes?: string }) =>
      appointmentsService.cancelAppointment(id, notes),
    onSuccess: () => {
      toast.success('Appointment cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['my-appointments'] });
      setShowCancelModal(false);
      setSelectedAppointment(null);
      setCancelNotes('');
    },
    onError: () => {
      toast.error('Failed to cancel appointment');
    },
  });

  const handleCancelClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    if (selectedAppointment) {
      cancelMutation.mutate({ id: selectedAppointment.id, notes: cancelNotes });
    }
  };

  // Filter appointments by status and department
  const filteredAppointments = appointments?.filter((apt) => {
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || apt.department_name === departmentFilter;
    return matchesStatus && matchesDepartment;
  });

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#2c3e50]">My Appointments</h1>
        <p className="text-[#5a6c7d] mt-1">View and manage your appointment requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#5a6c7d]">Requested</p>
              <p className="text-2xl font-bold text-[#2c3e50]">
                {appointments?.filter((a) => a.status === 'REQUESTED').length || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#5a6c7d]">Confirmed</p>
              <p className="text-2xl font-bold text-[#2c3e50]">
                {appointments?.filter((a) => a.status === 'CONFIRMED').length || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#5a6c7d]">Completed</p>
              <p className="text-2xl font-bold text-[#2c3e50]">
                {appointments?.filter((a) => a.status === 'COMPLETED').length || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#5a6c7d]">Cancelled</p>
              <p className="text-2xl font-bold text-[#2c3e50]">
                {appointments?.filter((a) => a.status === 'CANCELLED').length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-[#2c3e50] mb-2">Filter by Status</label>
          <div className="flex flex-wrap gap-2">
            {['all', 'REQUESTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === status
                    ? 'bg-[#1abc9c] text-white'
                    : 'bg-[#f0f4f7] text-[#5a6c7d] hover:bg-[#e8ecef]'
                  }`}
              >
                {status === 'all' ? 'All Status' : status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Department Filter */}
        {(uniqueDepartments.length > 0 || isDepartmentsLoading) && (
          <div>
            <label className="block text-sm font-medium text-[#2c3e50] mb-2">Filter by Department</label>
            {isDepartmentsLoading ? (
              <div className="flex items-center gap-2 text-[#5a6c7d] text-sm">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#3498db]"></div>
                Loading departments...
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setDepartmentFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${departmentFilter === 'all'
                      ? 'bg-[#3498db] text-white'
                      : 'bg-[#f0f4f7] text-[#5a6c7d] hover:bg-[#e8ecef]'
                    }`}
                >
                  All Departments
                </button>
                {uniqueDepartments.map((dept) => (
                  <button
                    key={dept}
                    onClick={() => setDepartmentFilter(dept || 'all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${departmentFilter === dept
                        ? 'bg-[#3498db] text-white'
                        : 'bg-[#f0f4f7] text-[#5a6c7d] hover:bg-[#e8ecef]'
                      }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick Info */}
        <div className="flex flex-wrap gap-4 text-sm text-[#5a6c7d] pt-2 border-t border-[#e8ecef]">
          <span>
            <strong>{uniqueHospitals.length}</strong> Hospital{uniqueHospitals.length !== 1 ? 's' : ''}
          </span>
          <span>•</span>
          <span>
            <strong>{uniqueDepartments.length}</strong> Department{uniqueDepartments.length !== 1 ? 's' : ''}
          </span>
          <span>•</span>
          <span>
            <strong>{filteredAppointments?.length || 0}</strong> Appointment{(filteredAppointments?.length || 0) !== 1 ? 's' : ''} shown
          </span>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-lg shadow-sm">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1abc9c] mb-4"></div>
            <p className="text-[#5a6c7d]">Loading your appointments...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <p className="text-red-600 font-medium">Failed to load appointments</p>
            <p className="text-sm text-[#5a6c7d] mt-1">Please try again later.</p>
          </div>
        ) : filteredAppointments?.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-[#2c3e50] font-medium">No appointments found</p>
            <p className="text-sm text-[#5a6c7d] mt-1">
              {statusFilter === 'all' && departmentFilter === 'all'
                ? "You haven't booked any appointments yet."
                : 'No appointments match your filters.'}
            </p>
            {(statusFilter !== 'all' || departmentFilter !== 'all') && (
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setDepartmentFilter('all');
                }}
                className="mt-4 text-[#1abc9c] hover:underline font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#e8ecef]">
            {filteredAppointments?.map((appointment) => (
              <div key={appointment.id} className="p-6 hover:bg-[#f8f9fa] transition-colors">
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                  {/* Left Side - Main Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      {/* Date Badge */}
                      <div className="hidden sm:flex flex-col items-center justify-center bg-gradient-to-br from-[#1abc9c] to-[#16a085] text-white rounded-lg p-3 min-w-[80px]">
                        <span className="text-xs uppercase">{formatDate(appointment.requested_time).split(' ')[0]}</span>
                        <span className="text-2xl font-bold">{new Date(appointment.requested_time).getDate()}</span>
                        <span className="text-xs">{formatTime(appointment.requested_time)}</span>
                      </div>

                      {/* Appointment Details */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-lg font-semibold text-[#2c3e50]">
                            {appointment.hospital_name}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${STATUS_COLORS[appointment.status]
                              }`}
                          >
                            <span>{STATUS_ICONS[appointment.status]}</span>
                            {appointment.status}
                          </span>
                        </div>

                        {/* Department Badge */}
                        <div className="mb-3">
                          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#e8f4fc] text-[#3498db] rounded-lg text-sm font-medium">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            {appointment.department_name}
                          </span>
                        </div>

                        {/* Time Info for Mobile */}
                        <div className="sm:hidden mb-3 text-sm text-[#5a6c7d]">
                          <p className="font-medium">
                            {formatDateTime(appointment.requested_time)}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-[#5a6c7d]">
                          {appointment.confirmed_time && (
                            <p className="flex items-center gap-2 text-green-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="font-medium">Confirmed:</span>{' '}
                              {formatDateTime(appointment.confirmed_time)}
                            </p>
                          )}
                          {appointment.doctor_name && (
                            <p className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span className="font-medium">Doctor:</span> Dr. {appointment.doctor_name}
                            </p>
                          )}
                        </div>

                        {appointment.reason && (
                          <div className="mt-3 p-3 bg-[#f8f9fa] rounded-lg">
                            <p className="text-sm text-[#5a6c7d]">
                              <span className="font-medium text-[#2c3e50]">Reason:</span> {appointment.reason}
                            </p>
                          </div>
                        )}

                        {appointment.notes && (
                          <div className="mt-2 p-3 bg-[#e8f8f5] rounded-lg border-l-4 border-[#1abc9c]">
                            <p className="text-sm text-[#2c3e50]">
                              <span className="font-medium">Hospital Notes:</span> {appointment.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Actions */}
                  <div className="flex lg:flex-col gap-2 lg:items-end">
                    {(appointment.status === 'REQUESTED' || appointment.status === 'CONFIRMED') && (
                      <button
                        onClick={() => handleCancelClick(appointment)}
                        className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel
                      </button>
                    )}
                    {appointment.status === 'CONFIRMED' && (
                      <div className="px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Visit Scheduled
                      </div>
                    )}
                    {appointment.status === 'COMPLETED' && (
                      <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Visit Complete
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {showCancelModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-[#2c3e50]">Cancel Appointment</h2>
            </div>

            <div className="mb-4 p-4 bg-[#f8f9fa] rounded-lg">
              <p className="font-medium text-[#2c3e50]">{selectedAppointment.hospital_name}</p>
              <p className="text-sm text-[#5a6c7d] mt-1">
                <span className="inline-flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {selectedAppointment.department_name}
                </span>
              </p>
              <p className="text-sm text-[#5a6c7d] mt-1">
                {formatDateTime(selectedAppointment.requested_time)}
              </p>
            </div>

            <p className="text-[#5a6c7d] mb-4">
              Are you sure you want to cancel this appointment?
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[#2c3e50] mb-1">
                Reason for cancellation (optional)
              </label>
              <textarea
                value={cancelNotes}
                onChange={(e) => setCancelNotes(e.target.value)}
                placeholder="Let the hospital know why you're cancelling..."
                rows={3}
                className="w-full px-4 py-3 bg-white border border-[#e8ecef] rounded-lg text-[#2c3e50] placeholder-[#a8b7c7] focus:outline-none focus:border-[#1abc9c] resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedAppointment(null);
                  setCancelNotes('');
                }}
                className="flex-1 px-4 py-3 bg-[#f0f4f7] text-[#5a6c7d] rounded-lg font-medium hover:bg-[#e8ecef] transition-colors"
              >
                Keep Appointment
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={cancelMutation.isPending}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {cancelMutation.isPending ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Cancelling...
                  </>
                ) : (
                  'Yes, Cancel'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}