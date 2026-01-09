'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';
import Button from '@/components/ui/Button';
import { accountsService } from '@/lib/api/services/accounts.service';
import { recordsService } from '@/lib/api/services/records.service';
import toast from 'react-hot-toast';

export default function PatientDashboard() {
  const { data: user, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ['user'],
    queryFn: accountsService.getMe,
  });

  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: ['patient-reports'],
    queryFn: recordsService.getMyReports,
  });

  const { data: prescriptions, isLoading: prescriptionsLoading } = useQuery({
    queryKey: ['patient-prescriptions'],
    queryFn: () => recordsService.getPrescriptions(),
  });

  // OTP state
  const [otp, setOtp] = useState<string | null>(null);
  const [otpExpires, setOtpExpires] = useState<string | null>(null);
  const otpMutation = useMutation({
    mutationFn: () => accountsService.generateOTP({ patient_phone: user?.phone_number }),
    onSuccess: (data) => {
      setOtp(data.otp);
      setOtpExpires(data.expires_at);
      toast.success('OTP generated! Share this with your doctor.');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to generate OTP');
    },
  });

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (userError) {
    return <ErrorMessage message="Failed to load dashboard data" />;
  }

  const reportsCount = Array.isArray(reports) ? reports.length : 0;
  const prescriptionsCount = Array.isArray(prescriptions) ? prescriptions.length : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#2c3e50]">
          Welcome back, {user?.first_name || user?.username}!
        </h1>
      </div>

      {/* OTP Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
        <h2 className="text-xl font-semibold text-[#2c3e50] mb-2">Share Access with Doctor</h2>
        <p className="text-[#5a6c7d] mb-4">
          Generate a one-time code and share it with your doctor so they can access your records.
        </p>
        <Button
          onClick={() => otpMutation.mutate()}
          disabled={otpMutation.isPending}
          className="mb-3"
        >
          {otpMutation.isPending ? 'Generating OTP...' : 'Generate OTP'}
        </Button>
        {otp && (
          <div className="mt-2 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-lg font-bold text-green-700">Your OTP: <span className="font-mono">{otp}</span></div>
            <div className="text-sm text-green-700">
              Expires at: {new Date(otpExpires!).toLocaleTimeString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Share this code with your doctor. Do not share it with anyone else.
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          title="Uploaded Reports"
          value={reportsLoading ? '...' : reportsCount.toString()}
        />
        <Card
          title="Prescriptions"
          value={prescriptionsLoading ? '...' : prescriptionsCount.toString()}
        />
        <Card
          title="Health Records"
          value={(reportsCount + prescriptionsCount).toString()}
        />
      </div>

      {/* Recent Reports */}
      {reports && reports.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-[#2c3e50] mb-4">Recent Reports</h2>
          <div className="space-y-3">
            {reports.slice(0, 5).map((report) => (
              <div key={report.id} className="flex justify-between items-center py-3 border-b border-[#e8ecef] last:border-0">
                <div>
                  <span className="text-[#2c3e50] font-medium">{report.report_type}</span>
                  {report.notes && <p className="text-sm text-[#5a6c7d] mt-1">{report.notes}</p>}
                </div>
                <span className="text-sm text-[#a8b7c7]">
                  {new Date(report.uploaded_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}