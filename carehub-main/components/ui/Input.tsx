import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      <input
        className={`w-full px-4 py-3 bg-white border ${
          error ? 'border-red-500' : 'border-[#e8ecef]'
        } rounded text-[#5a6c7d] placeholder:text-[#a8b7c7] focus:outline-none ${
          error ? 'focus:border-red-500' : 'focus:border-[#1abc9c]'
        } transition-colors ${className}`}
        placeholder={label}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
