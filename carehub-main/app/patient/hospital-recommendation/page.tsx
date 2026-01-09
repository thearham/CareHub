'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import {
  hospitalsService,
  Hospital,
  Department,
  NearbyHospitalsResponse,
} from '@/lib/api/services/hospitals.service';
import { appointmentsService } from '@/lib/api/services/appointments.service';

interface BookingFormData {
  hospitalId: number;
  hospitalName: string;
  department: number | null;
  requestedTime: string;
  reason: string;
}

export default function HospitalRecommendation() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState(10);
  const [useNearby, setUseNearby] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);

  // Booking form state
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState<BookingFormData>({
    hospitalId: 0,
    hospitalName: '',
    department: null,
    requestedTime: '',
    reason: '',
  });

  // Fetch all hospitals (default view)
  const {
    data: allHospitals,
    isLoading: isLoadingAll,
    error: allError,
  } = useQuery({
    queryKey: ['hospitals'],
    queryFn: () => hospitalsService.getList({ is_approved: true }),
    enabled: !useNearby,
  });

  // Fetch nearby hospitals (when coordinates are available)
  const {
    data: nearbyData,
    isLoading: isLoadingNearby,
    error: nearbyError,
  } = useQuery<NearbyHospitalsResponse>({
    queryKey: ['nearby-hospitals', coordinates?.lat, coordinates?.lng, radiusKm],
    queryFn: () =>
      hospitalsService.getNearby(coordinates!.lat, coordinates!.lng, radiusKm),
    enabled: useNearby && !!coordinates,
  });

  // Fetch departments for selected hospital
  const { data: fetchedDepartments, isLoading: isLoadingDepartments } = useQuery<Department[]>({
    queryKey: ['hospital-departments', bookingData.hospitalId],
    queryFn: () => hospitalsService.getHospitalDepartments(bookingData.hospitalId),
    enabled: showBookingForm && bookingData.hospitalId > 0,
  });

  // Get departments from API only (no fallback to hardcoded)
  const departments = fetchedDepartments || [];

  // Book appointment mutation
  const bookAppointmentMutation = useMutation({
    mutationFn: (data: { hospital: number; department: number; requested_time: string; reason?: string }) =>
      appointmentsService.createAppointment(data),
    onSuccess: () => {
      toast.success('Appointment booked successfully! The hospital will confirm your appointment soon.');
      queryClient.invalidateQueries({ queryKey: ['my-appointments'] });
      closeBookingForm();
      setTimeout(() => {
        router.push('/patient/appointments');
      }, 1500);
    },
    onError: (error: Error & { response?: { data?: { detail?: string; error?: string } } }) => {
      const message = error.response?.data?.detail || error.response?.data?.error || 'Failed to book appointment';
      toast.error(message);
    },
  });

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsDetecting(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ lat: latitude, lng: longitude });
        setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        setUseNearby(true);
        setIsDetecting(false);
        toast.success('Location detected successfully!');
      },
      (error) => {
        setIsDetecting(false);
        let message = 'Failed to detect location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location permission denied. Please enable it in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out.';
            break;
        }
        toast.error(message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleManualSearch = () => {
    const parts = location.split(',').map((s) => parseFloat(s.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      setCoordinates({ lat: parts[0], lng: parts[1] });
      setUseNearby(true);
      toast.success('Searching nearby hospitals...');
    } else {
      setUseNearby(false);
      toast('Showing all registered hospitals');
    }
  };

  const showAllHospitals = () => {
    setUseNearby(false);
    setCoordinates(null);
    setLocation('');
  };

  const handleHospitalClick = (hospitalId: number) => {
    router.push(`/patient/hospitals/${hospitalId}`);
  };

  const openBookingForm = (hospital: Hospital) => {
    setBookingData({
      hospitalId: hospital.id,
      hospitalName: hospital.name,
      department: null,
      requestedTime: '',
      reason: '',
    });
    setShowBookingForm(true);
  };

  const closeBookingForm = () => {
    setShowBookingForm(false);
    setBookingData({
      hospitalId: 0,
      hospitalName: '',
      department: null,
      requestedTime: '',
      reason: '',
    });
  };

  const handleSubmitBooking = () => {
    if (!bookingData.department) {
      toast.error('Please select a department');
      return;
    }
    if (!bookingData.requestedTime) {
      toast.error('Please select a date and time');
      return;
    }

    bookAppointmentMutation.mutate({
      hospital: bookingData.hospitalId,
      department: bookingData.department,
      requested_time: new Date(bookingData.requestedTime).toISOString(),
      reason: bookingData.reason || undefined,
    });
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  };

  const hospitals: Hospital[] = useNearby
    ? nearbyData?.hospitals || []
    : allHospitals || [];
  const isLoading = useNearby ? isLoadingNearby : isLoadingAll;
  const error = useNearby ? nearbyError : allError;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#2c3e50]">Find Nearby Hospitals</h1>
        <p className="text-[#5a6c7d] mt-1">
          Discover hospitals near you and book appointments
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Search Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="text"
            placeholder="Enter coordinates (lat, lng) or detect location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
            className="flex-1 px-4 py-3 bg-white border border-[#e8ecef] rounded text-[#2c3e50] placeholder-[#a8b7c7] focus:outline-none focus:border-[#1abc9c] focus:ring-1 focus:ring-[#1abc9c]"
          />
          <Button onClick={detectLocation} disabled={isDetecting}>
            {isDetecting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Detecting...
              </span>
            ) : (
              'Detect Location'
            )}
          </Button>
          <Button onClick={handleManualSearch} variant="secondary">
            Search
          </Button>
        </div>

        {/* Radius Selector */}
        {useNearby && coordinates && (
          <div className="flex flex-wrap items-center gap-4 mb-4 p-3 bg-[#f0f4f7] rounded-lg">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-[#2c3e50]">Search Radius:</label>
              <select
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="px-3 py-2 border border-[#e8ecef] rounded bg-white focus:outline-none focus:border-[#1abc9c]"
              >
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={25}>25 km</option>
                <option value={50}>50 km</option>
                <option value={100}>100 km</option>
              </select>
            </div>
            <div className="text-sm text-[#5a6c7d]">
              Your location: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
            </div>
            <Button onClick={showAllHospitals} variant="secondary" className="ml-auto">
              Show All Hospitals
            </Button>
          </div>
        )}

        {/* Results Count */}
        {!isLoading && !error && (
          <p className="text-sm text-[#5a6c7d] mb-4">
            {useNearby
              ? `Found ${nearbyData?.count || 0} hospital${(nearbyData?.count || 0) !== 1 ? 's' : ''} within ${radiusKm} km`
              : `Showing ${hospitals.length} registered hospital${hospitals.length !== 1 ? 's' : ''}`}
          </p>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1abc9c] mb-4"></div>
            <p className="text-[#5a6c7d]">Loading hospitals...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <p className="font-medium">Failed to load hospitals</p>
            <p className="text-sm mt-1">Please try again later or check your connection.</p>
          </div>
        )}

        {/* Hospital List */}
        {!isLoading && !error && (
          <div className="space-y-4">
            {hospitals.length === 0 ? (
              <div className="text-center py-12 bg-[#f0f4f7] rounded-lg">

                <p className="text-[#2c3e50] font-medium">No hospitals found</p>
                <p className="text-sm text-[#5a6c7d] mt-1">
                  {useNearby
                    ? 'Try increasing the search radius or check a different location.'
                    : 'No hospitals have been registered yet.'}
                </p>
              </div>
            ) : (
              hospitals.map((hospital) => (
                <div
                  key={hospital.id}
                  className="p-5 bg-[#f8f9fa] border border-[#e8ecef] rounded-lg hover:shadow-md hover:border-[#1abc9c] transition-all"
                >
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => handleHospitalClick(hospital.id)}
                    >
                      <h3 className="text-lg font-semibold text-[#2c3e50] hover:text-[#1abc9c] transition-colors">
                        {hospital.name}
                      </h3>
                      <p className="text-sm text-[#5a6c7d] mt-1">{hospital.address}</p>

                      <div className="flex flex-wrap items-center gap-4 mt-3">
                        {hospital.distance_km !== undefined && (
                          <span className="inline-flex items-center gap-1 text-sm text-[#1abc9c] font-medium">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {hospital.distance_km} km away
                          </span>
                        )}
                        {hospital.phone && (
                          <span className="inline-flex items-center gap-1 text-sm text-[#5a6c7d]">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {hospital.phone}
                          </span>
                        )}
                        {hospital.location && (
                          <span className="inline-flex items-center gap-1 text-sm text-[#5a6c7d]">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            {hospital.location}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex sm:flex-col gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openBookingForm(hospital);
                        }}
                        className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1abc9c] to-[#16a085] text-white rounded-lg font-medium shadow-md hover:shadow-lg hover:from-[#16a085] hover:to-[#1abc9c] transform hover:-translate-y-0.5 transition-all duration-200"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Book Appointment</span>
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-white/30"></span>
                        </span>
                      </button>
                      {hospital.latitude && hospital.longitude && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${hospital.latitude},${hospital.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#3498db] text-white rounded-lg hover:bg-[#2980b9] transition-colors text-sm font-medium"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                          </svg>
                          View Map
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden animate-slide-up">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#1abc9c] to-[#16a085] p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Book Appointment</h2>
                  <p className="text-white/80 mt-1 text-sm">Fill in the details below</p>
                </div>
                <button
                  onClick={closeBookingForm}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="space-y-5">
                {/* Hospital Info Card */}
                <div className="p-4 bg-gradient-to-br from-[#f0f4f7] to-[#e8ecef] rounded-xl border border-[#e8ecef]">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white rounded-lg shadow-sm">
                      <svg className="w-6 h-6 text-[#1abc9c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-[#5a6c7d] uppercase tracking-wide">Hospital</p>
                      <p className="font-semibold text-[#2c3e50]">{bookingData.hospitalName}</p>
                    </div>
                  </div>
                </div>

                {/* Department Selection */}
                <div>
                  <label className="block text-sm font-semibold text-[#2c3e50] mb-2">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-[#1abc9c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Select Department
                      <span className="text-red-500">*</span>
                    </span>
                  </label>
                  {isLoadingDepartments ? (
                    <div className="flex items-center gap-2 p-4 bg-[#f0f4f7] rounded-lg">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#1abc9c]"></div>
                      <span className="text-sm text-[#5a6c7d]">Loading departments...</span>
                    </div>
                  ) : departments.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {departments.map((dept) => (
                        <button
                          key={dept.id}
                          type="button"
                          onClick={() => setBookingData({ ...bookingData, department: dept.id })}
                          className={`p-3 rounded-lg border-2 text-left transition-all ${bookingData.department === dept.id
                              ? 'border-[#1abc9c] bg-[#e8f8f5] text-[#1abc9c]'
                              : 'border-[#e8ecef] hover:border-[#1abc9c]/50 text-[#5a6c7d]'
                            }`}
                        >
                          <span className="font-medium text-sm">{dept.name}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
                      No departments available for this hospital.
                    </div>
                  )}
                </div>

                {/* Date & Time Selection */}
                <div>
                  <label className="block text-sm font-semibold text-[#2c3e50] mb-2">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-[#1abc9c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Preferred Date & Time
                      <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <input
                    type="datetime-local"
                    value={bookingData.requestedTime}
                    onChange={(e) => setBookingData({ ...bookingData, requestedTime: e.target.value })}
                    min={getMinDateTime()}
                    className="w-full px-4 py-3 bg-white border-2 border-[#e8ecef] rounded-lg text-[#2c3e50] focus:outline-none focus:border-[#1abc9c] transition-colors"
                  />
                  <p className="text-xs text-[#5a6c7d] mt-1">
                    Select a time at least 1 hour from now
                  </p>
                </div>

                {/* Reason for Visit */}
                <div>
                  <label className="block text-sm font-semibold text-[#2c3e50] mb-2">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-[#1abc9c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Reason for Visit
                      <span className="text-[#5a6c7d] font-normal">(Optional)</span>
                    </span>
                  </label>
                  <textarea
                    value={bookingData.reason}
                    onChange={(e) => setBookingData({ ...bookingData, reason: e.target.value })}
                    rows={3}
                    placeholder="Describe your symptoms or reason for visit..."
                    className="w-full px-4 py-3 bg-white border-2 border-[#e8ecef] rounded-lg text-[#2c3e50] placeholder-[#a8b7c7] focus:outline-none focus:border-[#1abc9c] resize-none transition-colors"
                  />
                </div>

                {/* Info Note */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex gap-3">
                    <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-blue-700">
                      Your appointment request will be sent to the hospital. They will confirm your appointment and may assign a doctor.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-[#f8f9fa] border-t border-[#e8ecef]">
              <div className="flex gap-3">
                <button
                  onClick={closeBookingForm}
                  className="flex-1 px-6 py-3 bg-white border-2 border-[#e8ecef] text-[#5a6c7d] rounded-lg font-medium hover:bg-[#f0f4f7] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitBooking}
                  disabled={bookAppointmentMutation.isPending || !bookingData.department || !bookingData.requestedTime}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#1abc9c] to-[#16a085] text-white rounded-lg font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {bookAppointmentMutation.isPending ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Booking...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Confirm Booking
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-[#2c3e50] mb-3">How to Book an Appointment</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-start gap-3 p-4 bg-[#f8f9fa] rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-[#1abc9c] text-white rounded-full flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <p className="font-medium text-[#2c3e50]">Find Hospital</p>
              <p className="text-sm text-[#5a6c7d]">Use location detection or browse all hospitals</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-[#f8f9fa] rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-[#1abc9c] text-white rounded-full flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <p className="font-medium text-[#2c3e50]">Book Appointment</p>
              <p className="text-sm text-[#5a6c7d]">Click the button and fill in details</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-[#f8f9fa] rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-[#1abc9c] text-white rounded-full flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <p className="font-medium text-[#2c3e50]">Wait for Confirmation</p>
              <p className="text-sm text-[#5a6c7d]">Hospital will review and confirm</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-[#f8f9fa] rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-[#1abc9c] text-white rounded-full flex items-center justify-center font-bold">
              4
            </div>
            <div>
              <p className="font-medium text-[#2c3e50]">Visit Hospital</p>
              <p className="text-sm text-[#5a6c7d]">Attend your appointment on time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}