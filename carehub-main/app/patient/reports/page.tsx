'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { recordsService } from '@/lib/api/services/records.service';
import { accountsService } from '@/lib/api/services/accounts.service';
import { uploadReportSchema, type UploadReportFormData } from '@/types/forms/record.schemas';
import { FILE_TYPE_LABELS, type FileType, type MedicalReport } from '@/types/api/record.types';

export default function PatientReports() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const queryClient = useQueryClient();

  // Get current user
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user'],
    queryFn: accountsService.getMe,
  });

  // Get patient's reports
  const {
    data: reports = [],
    isLoading: reportsLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['patient-reports'],
    queryFn: recordsService.getMyReports,
    enabled: !!user,
  });

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<UploadReportFormData>({
    resolver: zodResolver(uploadReportSchema),
    defaultValues: {
      title: '',
      description: '',
      report_date: '',
    },
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (data: UploadReportFormData) => {
      if (!user?.id) throw new Error('User not found');
      const file = data.file[0];
      return recordsService.uploadReport(
        user.id,
        file,
        data.file_type as FileType,
        data.title,
        data.description || undefined,
        data.report_date || undefined,
        data.hospital
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-reports'] });
      toast.success('Report uploaded successfully!');
      setShowUploadModal(false);
      reset();
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to upload report');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: recordsService.deleteReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-reports'] });
      toast.success('Report deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete report');
    },
  });

  const onSubmit = (data: UploadReportFormData) => {
    uploadMutation.mutate(data);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this report?')) {
      deleteMutation.mutate(id);
    }
  };

  const selectedFile = watch('file');

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Loading state
  if (userLoading || reportsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1abc9c]"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg text-center">
        <p className="text-red-600 mb-4">Failed to load reports</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2c3e50]">Medical Reports</h1>
          <p className="text-[#5a6c7d] mt-1">
            {reports.length} report{reports.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-6 py-3 bg-[#1abc9c] text-white rounded-lg hover:bg-[#16a085] transition-colors font-medium"
        >
          + Upload Report
        </button>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {reports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f0f4f7]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#2c3e50]">
                    Title
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#2c3e50]">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#2c3e50]">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#2c3e50]">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#2c3e50]">
                    Size
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#2c3e50]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report: MedicalReport) => (
                  <tr
                    key={report.id}
                    className="border-t border-[#e8ecef] hover:bg-[#f9fafb] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-[#2c3e50]">{report.title}</div>
                      <div className="text-sm text-[#5a6c7d]">
                        Uploaded {new Date(report.uploaded_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-3 py-1 bg-[#e8f8f5] text-[#1abc9c] rounded-full text-sm font-medium">
                        {FILE_TYPE_LABELS[report.file_type] || report.file_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#5a6c7d] max-w-[200px]">
                      <div className="truncate">{report.description || '-'}</div>
                    </td>
                    <td className="px-6 py-4 text-[#5a6c7d]">
                      {report.report_date
                        ? new Date(report.report_date).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="px-6 py-4 text-[#5a6c7d]">
                      {formatFileSize(report.file_size)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {report.file_url && (
                          <a
                            href={report.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#1abc9c] hover:text-[#16a085] font-medium text-sm"
                          >
                            Download
                          </a>
                        )}
                        <button
                          onClick={() => handleDelete(report.id)}
                          disabled={deleteMutation.isPending}
                          className="text-red-500 hover:text-red-600 font-medium text-sm disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <h3 className="text-xl font-semibold text-[#2c3e50] mb-2">No Reports Yet</h3>
            <p className="text-[#5a6c7d] mb-6">
              Upload your first medical report to keep track of your health records.
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-3 bg-[#1abc9c] text-white rounded-lg hover:bg-[#16a085] transition-colors font-medium"
            >
              Upload Your First Report
            </button>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#e8ecef]">
              <h2 className="text-xl font-semibold text-[#2c3e50]">Upload Medical Report</h2>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  reset();
                }}
                className="text-[#5a6c7d] hover:text-[#2c3e50] text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('title')}
                  placeholder="e.g., Blood Test Results - January 2026"
                  className="w-full px-4 py-3 border border-[#e8ecef] rounded-lg focus:outline-none focus:border-[#1abc9c] text-[#2c3e50]"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              {/* Report Type */}
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                  Report Type <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('file_type')}
                  className="w-full px-4 py-3 border border-[#e8ecef] rounded-lg focus:outline-none focus:border-[#1abc9c] text-[#5a6c7d]"
                >
                  <option value="">Select report type</option>
                  <option value="LAB">Lab Report</option>
                  <option value="PRESCRIPTION">Prescription</option>
                  <option value="XRAY">X-Ray</option>
                  <option value="MRI">MRI Scan</option>
                  <option value="CT">CT Scan</option>
                  <option value="ULTRASOUND">Ultrasound</option>
                  <option value="OTHER">Other</option>
                </select>
                {errors.file_type && (
                  <p className="mt-1 text-sm text-red-600">{errors.file_type.message}</p>
                )}
              </div>

              {/* File Input */}
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                  Select File <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  {...register('file')}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="w-full px-4 py-3 border border-[#e8ecef] rounded-lg text-[#5a6c7d] file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-[#1abc9c] file:text-white file:cursor-pointer hover:file:bg-[#16a085]"
                />
                {errors.file && (
                  <p className="mt-1 text-sm text-red-600">{String(errors.file.message)}</p>
                )}
                {selectedFile && selectedFile.length > 0 && (
                  <p className="mt-2 text-sm text-[#1abc9c]">
                    ✓ {selectedFile[0].name} ({formatFileSize(selectedFile[0].size)})
                  </p>
                )}
                <p className="mt-1 text-xs text-[#5a6c7d]">
                  Allowed: PDF, JPG, JPEG, PNG, DOC, DOCX (Max 10MB)
                </p>
              </div>

              {/* Report Date */}
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                  Report Date
                </label>
                <input
                  type="date"
                  {...register('report_date')}
                  className="w-full px-4 py-3 border border-[#e8ecef] rounded-lg focus:outline-none focus:border-[#1abc9c] text-[#5a6c7d]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                  Description (Optional)
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  placeholder="Add any notes about this report..."
                  className="w-full px-4 py-3 border border-[#e8ecef] rounded-lg focus:outline-none focus:border-[#1abc9c] text-[#5a6c7d] resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={uploadMutation.isPending}
                  className="flex-1 py-3 bg-[#1abc9c] text-white rounded-lg hover:bg-[#16a085] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadMutation.isPending ? 'Uploading...' : 'Upload Report'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    reset();
                  }}
                  disabled={uploadMutation.isPending}
                  className="flex-1 py-3 bg-[#f0f4f7] text-[#5a6c7d] rounded-lg hover:bg-[#e8ecef] transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}