'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/layouts/AuthLayout';
import Button from '@/components/ui/Button';

export default function OTPVerification() {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  const handleChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = () => {
    const otpCode = otp.join('');
    console.log('Verifying OTP:', otpCode);
    // Redirect after successful verification
    router.push('/doctor/dashboard');
  };

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-[#2c3e50] mb-2">
          OTP Verification
        </h1>
        <p className="text-sm text-[#5a6c7d]">
          Enter the OTP sent to patient&apos;s registered email/phone
        </p>
      </div>

      <div className="space-y-6">
        {/* OTP Input */}
        <div className="flex gap-2 justify-center">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-12 text-center text-xl font-semibold bg-white border border-[#e8ecef] rounded text-[#2c3e50] focus:outline-none focus:border-[#1abc9c] transition-colors"
            />
          ))}
        </div>

        <Button onClick={handleVerify} className="w-full">
          Verify OTP
        </Button>

        <div className="text-center">
          <button className="text-sm text-[#1abc9c] hover:text-[#16a085]">
            Resend OTP
          </button>
        </div>
      </div>

      <div className="mt-6 p-4 bg-[#f0f4f7] rounded text-sm text-[#5a6c7d] text-center">
        <p>This OTP is valid for 10 minutes</p>
      </div>
    </AuthLayout>
  );
}
