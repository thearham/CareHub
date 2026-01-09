'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PatientRegisterData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  gender: string;
  password: string;
  password_confirm: string;
  consent: boolean;
}

export const useRegister = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const registerPatient = async (data: PatientRegisterData) => {
    setIsLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/accounts/patients/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(JSON.stringify(err));
      }

      router.push('/login');
    } catch (err) {
      console.error('Patient registration error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { registerPatient, isLoading };
};
