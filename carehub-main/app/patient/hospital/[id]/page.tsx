'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import { hospitalsService, Hospital, Department } from '@/lib/api/services/hospitals.service';
import { appointmentsService } from '@/lib/api/services/appointments.service';

interface ApiError extends Error {
  response?: {
    data?: {
      detail?: string;
      error?: string;
      department?: string[];
      hospital?: string[];
      requested_time?: string[];
    };
  };
}

export default function HospitalDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const hospitalId = Number(params.id);

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);
  const [requestedTime, setRequestedTime] = useState('');
  const [reason, setReason] = useState('');

  // Fetch hospital details
  const {
    data: hospital,
    isLoading: isLoadingHospital,
    error: hospitalError,
  } = useQuery<Hospital>({
    queryKey: ['hospital', hospitalId],
    queryFn: () => hospitalsService.getDetail(hospitalId),
    enabled: !!hospitalId && !isNaN(hospitalId),
  });

  // Fetch hospital departments
  const {
    data: departments,
    isLoading: isLoadingDepartments,
  } = useQuery<Department[]>({
    queryKey: ['hospital-departments', hospitalId],
    queryFn: () => hospitalsService.getHospitalDepartments(hospitalId),
    enabled: !!hospitalId && !isNaN(hospitalId),
  });

  // Use departments directly (already filtered by hospital)
  const hospitalDepartments = departments || [];

  // Book appointment mutation
  const bookAppointmentMutation = useMutation({
    mutationFn: (data: { hospital: number; department: number; requested_time: string; reason?: string }) =>
      appointmentsService.createAppointment(data),
    onSuccess: () => {
      toast.success('Appointment request submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['my-appointments'] });
      setShowBookingModal(false);
      resetForm();
      router.push('/patient/appointments');
    },
    onError: (error: ApiError) => {
      const data = error.response?.data;
      let message = 'Failed to book appointment';
      
      if (data?.detail) {
        message = data.detail;
      } else if (data?.error) {
        message = data.error;
      } else if (data?.department) {
        message = data.department[0];
      } else if (data?.hospital) {
        message = data.hospital[0];
      } else if (data?.requested_time) {
        message = data.requested_time[0];
      }
      
      toast.error(message);
    },
  });

  const resetForm = () => {
    setSelectedDepartment(null);
    setRequestedTime('');
    setReason('');
  };

  const handleBookAppointment = () => {
    if (!selectedDepartment) {
      toast.error('Please select a department');
      return;
    }
    if (!requestedTime) {
      toast.error('Please select a date and time');
      return;
    }

    bookAppointmentMutation.mutate({
      hospital: hospitalId,
      department: selectedDepartment,
      requested_time: new Date(requestedTime).toISOString(),
      reason: reason || undefined,
    });
  };

  // Get minimum datetime (now + 1 hour)
  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  };

  if (isLoadingHospital) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1abc9c] mb-4"></div>
        <p className="text-[#5a6c7d]">Loading hospital details...</p>
      </div>
    );
  }

  if (hospitalError || !hospital) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-4xl mb-3">🏥</div>
        <p className="text-red-700 font-medium">Hospital not found</p>
        <p className="text-sm text-red-600 mt-1">The hospital you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-[#5a6c7d] hover:text-[#1abc9c] transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Hospitals
      </button>

      {/* Hospital Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-[#2c3e50]">{hospital.name}</h1>
            <p className="text-[#5a6c7d] mt-2">{hospital.address}</p>
            
            <div className="flex flex-wrap items-center gap-4 mt-4">
              {hospital.phone && (
                <a
                  href={`tel:${hospital.phone}`}
                  className="inline-flex items-center gap-2 text-[#5a6c7d] hover:text-[#1abc9c]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {hospital.phone}
                </a>
              )}
              {hospital.email && (
                <a
                  href={`mailto:${hospital.email}`}
                  className="inline-flex items-center gap-2 text-[#5a6c7d] hover:text-[#1abc9c]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {hospital.email}
                </a>
              )}
              {hospital.location && (
                <span className="inline-flex items-center gap-2 text-[#5a6c7d]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {hospital.location}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button onClick={() => setShowBookingModal(true)} className="whitespace-nowrap">
              📅 Book Appointment
            </Button>
            {hospital.latitude && hospital.longitude && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${hospital.latitude},${hospital.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#3498db] text-white rounded hover:bg-[#2980b9] transition-colors text-sm font-medium"
              >
                🗺️ View on Map
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Departments Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-[#2c3e50] mb-4">Available Departments</h2>
        
        {isLoadingDepartments ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1abc9c]"></div>
          </div>
        ) : hospitalDepartments.length === 0 ? (
          <div className="text-center py-8 bg-[#f0f4f7] rounded-lg">
            <p className="text-[#5a6c7d]">No departments available at this hospital.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hospitalDepartments.map((dept) => (
              <div
                key={dept.id}
                className="p-4 bg-[#f8f9fa] border border-[#e8ecef] rounded-lg hover:border-[#1abc9c] transition-all cursor-pointer"
                onClick={() => {
                  setSelectedDepartment(dept.id);
                  setShowBookingModal(true);
                }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-[#2c3e50]">{dept.name}</h3>
                  <svg className="w-5 h-5 text-[#1abc9c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <p className="text-sm text-[#5a6c7d] mt-1">Click to book appointment</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Map Section */}
      {hospital.latitude && hospital.longitude && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-[#2c3e50] mb-4">Location</h2>
          <div className="w-full h-64 bg-[#f0f4f7] rounded overflow-hidden">
            <iframe
              src={`https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d5000!2d${hospital.longitude}!3d${hospital.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2s!4v1234567890`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-[#2c3e50]">Book Appointment</h2>
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  resetForm();
                }}
                className="text-[#5a6c7d] hover:text-[#2c3e50]"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Hospital Name (readonly) */}
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-1">Hospital</label>
                <input
                  type="text"
                  value={hospital.name}
                  disabled
                  className="w-full px-4 py-3 bg-[#f0f4f7] border border-[#e8ecef] rounded text-[#5a6c7d]"
                />
              </div>

              {/* Department Selection */}
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-1">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedDepartment || ''}
                  onChange={(e) => setSelectedDepartment(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-white border border-[#e8ecef] rounded text-[#2c3e50] focus:outline-none focus:border-[#1abc9c]"
                >
                  <option value="">Select a department</option>
                  {hospitalDepartments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Time */}
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-1">
                  Preferred Date & Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={requestedTime}
                  onChange={(e) => setRequestedTime(e.target.value)}
                  min={getMinDateTime()}
                  className="w-full px-4 py-3 bg-white border border-[#e8ecef] rounded text-[#2c3e50] focus:outline-none focus:border-[#1abc9c]"
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-1">
                  Reason for Visit
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="Describe your symptoms or reason for visit..."
                  className="w-full px-4 py-3 bg-white border border-[#e8ecef] rounded text-[#2c3e50] placeholder-[#a8b7c7] focus:outline-none focus:border-[#1abc9c] resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowBookingModal(false);
                    resetForm();
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBookAppointment}
                  disabled={bookAppointmentMutation.isPending}
                  className="flex-1"
                >
                  {bookAppointmentMutation.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Booking...
                    </span>
                  ) : (
                    'Confirm Booking'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}