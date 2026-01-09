'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';
import { recordsService } from '@/lib/api/services/records.service';

export default function PatientPrescriptions() {
  const [selectedPrescription, setSelectedPrescription] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  const { data: prescriptions, isLoading, error } = useQuery({
    queryKey: ['patient-prescriptions'],
    queryFn: () => recordsService.getPrescriptions(),
  });

  const { data: prescriptionDetails } = useQuery({
    queryKey: ['prescription-detail', selectedPrescription],
    queryFn: () => recordsService.getPrescriptionById(selectedPrescription!),
    enabled: !!selectedPrescription,
  });

  const handleViewDetails = (id: number) => {
    setSelectedPrescription(id);
    setShowModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message="Failed to load prescriptions" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#2c3e50]">My Prescriptions</h1>
        <p className="text-[#5a6c7d] mt-1">View all your prescriptions from doctors</p>
      </div>

      {/* Prescriptions List */}
      {prescriptions && prescriptions.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {prescriptions.map((prescription) => (
            <div key={prescription.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-[#2c3e50]">
                      Prescription #{prescription.id}
                    </h3>
                  </div>
                  <p className="text-sm text-[#5a6c7d] mb-3">
                    Created on: {new Date(prescription.created_at).toLocaleDateString()}
                  </p>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-[#2c3e50]">Medicines: </span>
                      <span className="text-sm text-[#5a6c7d]">{prescription.medicines}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-[#2c3e50]">Dosage: </span>
                      <span className="text-sm text-[#5a6c7d]">{prescription.dosage}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-[#2c3e50]">Duration: </span>
                      <span className="text-sm text-[#5a6c7d]">{prescription.duration}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleViewDetails(prescription.id)}
                  className="px-4 py-2 bg-[#1abc9c] text-white rounded-lg hover:bg-[#16a085] transition-colors text-sm"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center text-[#5a6c7d]">
          No prescriptions found
        </div>
      )}

      {/* Details Modal */}
      {showModal && prescriptionDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 animate-scale-in">
            <h2 className="text-2xl font-semibold text-[#2c3e50] mb-6">Prescription Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-[#5a6c7d]">Prescription ID</p>
                <p className="font-semibold text-[#2c3e50]">#{prescriptionDetails.id}</p>
              </div>
              <div>
                <p className="text-sm text-[#5a6c7d]">Date</p>
                <p className="font-semibold text-[#2c3e50]">
                  {new Date(prescriptionDetails.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#5a6c7d]">Medicines</p>
                <p className="font-semibold text-[#2c3e50]">{prescriptionDetails.medicines}</p>
              </div>
              <div>
                <p className="text-sm text-[#5a6c7d]">Dosage Instructions</p>
                <p className="font-semibold text-[#2c3e50]">{prescriptionDetails.dosage}</p>
              </div>
              <div>
                <p className="text-sm text-[#5a6c7d]">Duration</p>
                <p className="font-semibold text-[#2c3e50]">{prescriptionDetails.duration}</p>
              </div>
              {prescriptionDetails.notes && (
                <div>
                  <p className="text-sm text-[#5a6c7d]">Notes</p>
                  <p className="font-semibold text-[#2c3e50]">{prescriptionDetails.notes}</p>
                </div>
              )}
              {prescriptionDetails.attachments && prescriptionDetails.attachments.length > 0 && (
                <div>
                  <p className="text-sm text-[#5a6c7d] mb-2">Attachments</p>
                  <div className="space-y-2">
                    {prescriptionDetails.attachments.map((attachment) => (
                      <a
                        key={attachment.id}
                        href={attachment.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-[#1abc9c] hover:text-[#16a085]"
                      >
                        View Attachment
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => {
                setShowModal(false);
                setSelectedPrescription(null);
              }}
              className="mt-6 w-full px-4 py-3 bg-[#1abc9c] text-white rounded-lg hover:bg-[#16a085] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
