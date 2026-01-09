'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';
import { recordsService } from '@/lib/api/services/records.service';

const prescriptionSchema = z.object({
  patient: z.string().min(1, 'Patient ID is required'),
  medicines: z.string().min(1, 'Medicines are required'),
  dosage: z.string().min(1, 'Dosage is required'),
  duration: z.string().min(1, 'Duration is required'),
  notes: z.string().optional(),
});

type PrescriptionFormData = z.infer<typeof prescriptionSchema>;

export default function PrescriptionPage() {
  const queryClient = useQueryClient();
  const [uploadMode, setUploadMode] = useState<'file' | 'text'>('text');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: prescriptions, isLoading, error } = useQuery({
    queryKey: ['doctor-prescriptions'],
    queryFn: () => recordsService.getPrescriptions(),
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<PrescriptionFormData>({
    resolver: zodResolver(prescriptionSchema),
  });

  const createPrescriptionMutation = useMutation({
    mutationFn: (data: PrescriptionFormData) =>
      recordsService.createPrescription({
        patient: parseInt(data.patient),
        medicines: data.medicines,
        dosage: data.dosage,
        duration: data.duration,
        notes: data.notes,
      }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['doctor-prescriptions'] });
      toast.success('Prescription created successfully');
      reset();

      // If file mode and file selected, upload the file
      if (uploadMode === 'file' && selectedFile && response.id) {
        uploadFileMutation.mutate({ prescriptionId: response.id, file: selectedFile });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create prescription');
    },
  });

  const uploadFileMutation = useMutation({
    mutationFn: ({ prescriptionId, file }: { prescriptionId: number; file: File }) =>
      recordsService.addPrescriptionAttachment(prescriptionId, file),
    onSuccess: () => {
      toast.success('Prescription file uploaded successfully');
      setSelectedFile(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload prescription file');
    },
  });

  const onSubmit = (data: PrescriptionFormData) => {
    createPrescriptionMutation.mutate(data);
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
    <div className="space-y-6 max-w-4xl">
        <h1 className="text-3xl font-bold text-[#2c3e50]">Create Prescription</h1>

        {/* Upload Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2">Patient ID</label>
                <Input
                  {...register('patient')}
                  placeholder="Enter patient ID (OTP verified)"
                  error={errors.patient?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2">Medicines</label>
                <Input
                  {...register('medicines')}
                  placeholder="e.g., Paracetamol 500mg, Amoxicillin 250mg"
                  error={errors.medicines?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2">Dosage</label>
                <Input
                  {...register('dosage')}
                  placeholder="e.g., 1 tablet twice daily"
                  error={errors.dosage?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2">Duration</label>
                <Input
                  {...register('duration')}
                  placeholder="e.g., 7 days"
                  error={errors.duration?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2">Notes (Optional)</label>
                <textarea
                  {...register('notes')}
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-[#e8ecef] rounded text-[#5a6c7d] focus:outline-none focus:border-[#1abc9c]"
                  placeholder="Additional instructions or notes..."
                />
              </div>

              {/* Toggle Upload Mode */}
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setUploadMode('text')}
                  className={`flex-1 py-2 rounded transition-colors ${
                    uploadMode === 'text'
                      ? 'bg-[#1abc9c] text-white'
                      : 'bg-white text-[#5a6c7d] border border-[#e8ecef]'
                  }`}
                >
                  Text Only
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('file')}
                  className={`flex-1 py-2 rounded transition-colors ${
                    uploadMode === 'file'
                      ? 'bg-[#1abc9c] text-white'
                      : 'bg-white text-[#5a6c7d] border border-[#e8ecef]'
                  }`}
                >
                  With File Attachment
                </button>
              </div>

              {uploadMode === 'file' && (
                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-2">Prescription File (Optional)</label>
                  <input
                    type="file"
                    className="w-full px-4 py-3 bg-white border border-[#e8ecef] rounded text-[#5a6c7d]"
                    accept=".pdf,.jpg,.png"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                  {selectedFile && (
                    <p className="mt-1 text-sm text-[#5a6c7d]">Selected: {selectedFile.name}</p>
                  )}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={createPrescriptionMutation.isPending}>
                {createPrescriptionMutation.isPending ? 'Creating...' : 'Create Prescription'}
              </Button>
            </div>
          </div>
        </form>

        {/* Previous Prescriptions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-[#2c3e50] mb-4">Previous Prescriptions</h2>
          {prescriptions && prescriptions.length > 0 ? (
            <div className="space-y-3">
              {prescriptions.slice(0, 10).map((prescription) => (
                <div key={prescription.id} className="p-4 bg-[#f0f4f7] rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#2c3e50]">Patient ID: {prescription.patient}</h3>
                      <p className="text-sm text-[#5a6c7d] mt-1">
                        <span className="font-medium">Medicines:</span> {prescription.medicines}
                      </p>
                      <p className="text-sm text-[#5a6c7d] mt-1">
                        <span className="font-medium">Dosage:</span> {prescription.dosage}
                      </p>
                      <p className="text-sm text-[#5a6c7d] mt-1">
                        <span className="font-medium">Duration:</span> {prescription.duration}
                      </p>
                      <p className="text-xs text-[#a8b7c7] mt-2">
                        Created: {new Date(prescription.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[#5a6c7d]">
              No prescriptions created yet
            </div>
          )}
        </div>
    </div>
  );
}
