'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { accountsService } from '@/lib/api/services/accounts.service';

export default function PatientRecords() {
  const [patientPhone, setPatientPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const requestOTPMutation = useMutation({
    mutationFn: (phone: string) => accountsService.generateOTP({ patient_phone: phone }),
    onSuccess: () => {
      toast.success('OTP request sent to patient. Please wait for patient to share the OTP code.');
      setOtpSent(true);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send OTP request');
    },
  });

  const handleRequestOTP = () => {
    if (!patientPhone.trim()) {
      toast.error('Please enter patient phone number');
      return;
    }
    requestOTPMutation.mutate(patientPhone);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#2c3e50]">Patient Records</h1>
        <p className="text-[#5a6c7d] mt-1">Request access to patient medical records using OTP verification</p>
      </div>

      {/* OTP Request */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-xl font-semibold text-[#2c3e50] mb-6">Request Patient Access</h2>
        <div className="max-w-md space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#2c3e50] mb-2">
              Patient Phone Number
            </label>
            <Input
              placeholder="Enter patient phone (e.g., +923001234567)"
              value={patientPhone}
              onChange={(e) => setPatientPhone(e.target.value)}
              disabled={otpSent}
            />
          </div>
          <Button
            onClick={handleRequestOTP}
            disabled={requestOTPMutation.isPending || otpSent}
          >
            {requestOTPMutation.isPending ? 'Sending...' : otpSent ? 'OTP Sent' : 'Request OTP'}
          </Button>
          {otpSent && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                OTP request sent successfully. The patient will receive the OTP code.
                Once they share it with you, you can verify it in the OTP verification section.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-xl font-semibold text-[#2c3e50] mb-4">How to Access Patient Records</h2>
        <ol className="list-decimal list-inside space-y-2 text-[#5a6c7d]">
          <li>Enter the patient&apos;s phone number and request an OTP</li>
          <li>The patient will receive an OTP code via SMS</li>
          <li>Ask the patient to share the OTP code with you</li>
          <li>Use the OTP verification page to verify the code and gain access to patient records</li>
          <li>Once verified, you can view the patient&apos;s medical reports and prescriptions</li>
        </ol>
      </div>
    </div>
  );
}
