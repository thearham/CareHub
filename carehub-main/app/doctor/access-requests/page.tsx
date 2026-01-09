'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { accountsService } from '@/lib/api/services/accounts.service';

export default function AccessRequests() {
  const [patientPhone, setPatientPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState<'request' | 'verify'>('request');

  const requestOTPMutation = useMutation({
    mutationFn: (phone: string) => accountsService.generateOTP({ patient_phone: phone }),
    onSuccess: () => {
      toast.success('Ask the patient for the OTP code from their dashboard.');
      setStep('verify');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send OTP request');
    },
  });

  const verifyOTPMutation = useMutation({
    mutationFn: (data: { patient_phone: string; otp: string }) =>
      accountsService.verifyOTP(data),
    onSuccess: () => {
      toast.success('OTP verified successfully! You can now access patient records.');
      // Reset form
      setPatientPhone('');
      setOtpCode('');
      setStep('request');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Invalid OTP code');
    },
  });

  const handleRequestOTP = () => {
    if (!patientPhone.trim()) {
      toast.error('Please enter patient phone number');
      return;
    }
    requestOTPMutation.mutate(patientPhone);
  };

  const handleVerifyOTP = () => {
    if (!otpCode.trim()) {
      toast.error('Please enter OTP code');
      return;
    }
    verifyOTPMutation.mutate({ patient_phone: patientPhone, otp: otpCode });
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-[#2c3e50]">Patient Access Verification</h1>
        <p className="text-[#5a6c7d] mt-1">Request and verify OTP to access patient records</p>
      </div>

      {/* Step Indicator */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center gap-4">
          <div className={`flex items-center gap-2 ${step === 'request' ? 'text-[#1abc9c]' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'request' ? 'bg-[#1abc9c] text-white' : 'bg-gray-200'
            }`}>
              1
            </div>
            <span className="font-medium">Request OTP</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-300"></div>
          <div className={`flex items-center gap-2 ${step === 'verify' ? 'text-[#1abc9c]' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'verify' ? 'bg-[#1abc9c] text-white' : 'bg-gray-200'
            }`}>
              2
            </div>
            <span className="font-medium">Verify OTP</span>
          </div>
        </div>
      </div>

      {/* Request OTP Form */}
      {step === 'request' && (
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold text-[#2c3e50] mb-6">Step 1: Request Patient Access</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                Patient Phone Number
              </label>
              <Input
                placeholder="Enter patient phone (e.g., +923001234567)"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
              />
            </div>
            <Button
              onClick={handleRequestOTP}
              className="w-full"
              disabled={requestOTPMutation.isPending}
            >
              {requestOTPMutation.isPending ? 'Sending Request...' : 'Request OTP'}
            </Button>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-blue-700">
                The patient will see the OTP code on their dashboard. Ask them to share it with you to proceed.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Verify OTP Form */}
      {step === 'verify' && (
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold text-[#2c3e50] mb-6">Step 2: Verify OTP Code</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                Patient Phone Number
              </label>
              <Input
                value={patientPhone}
                disabled
                className="bg-[#f0f4f7]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                OTP Code
              </label>
              <Input
                placeholder="Enter the 6-digit OTP code"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                maxLength={6}
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleVerifyOTP}
                className="flex-1"
                disabled={verifyOTPMutation.isPending}
              >
                {verifyOTPMutation.isPending ? 'Verifying...' : 'Verify OTP'}
              </Button>
              <Button
                onClick={() => {
                  setStep('request');
                  setOtpCode('');
                }}
                variant="secondary"
                className="flex-1"
              >
                Back
              </Button>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-green-700">
                Once verified, you&apos;ll have access to view the patient&apos;s medical records and prescriptions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-xl font-semibold text-[#2c3e50] mb-4">How It Works</h2>
        <ol className="list-decimal list-inside space-y-2 text-[#5a6c7d]">
          <li>Ask the patient to generate an OTP from their dashboard.</li>
          <li>The patient will see the OTP code on their dashboard (no SMS is sent).</li>
          <li>Ask the patient to share the OTP code with you.</li>
          <li>Enter the OTP code to verify and gain access.</li>
          <li>Once verified, you can view and download patient records from the Patient Records page.</li>
        </ol>
      </div>
    </div>
  );
}