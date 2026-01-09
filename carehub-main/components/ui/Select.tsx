import { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options?: { value: string; label: string }[];
  error?: string;
}

export default function Select({ label, options = [], error, className = '', ...props }: SelectProps) {
  return (
    <div className="w-full">
      <select
        className={`w-full px-4 py-3 bg-white border ${
          error ? 'border-red-500' : 'border-[#e8ecef]'
        } rounded text-[#5a6c7d] focus:outline-none ${
          error ? 'focus:border-red-500' : 'focus:border-[#1abc9c]'
        } transition-colors ${className}`}
        {...props}
      >
        {label && <option value="">{label}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
