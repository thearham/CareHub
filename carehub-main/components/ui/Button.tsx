import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export default function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'w-full py-3 rounded font-medium transition-all duration-200';

  const variants = {
    primary: 'bg-[#1abc9c] text-white hover:bg-[#16a085] active:scale-[0.98]',
    secondary: 'bg-white text-[#5a6c7d] border border-[#e8ecef] hover:bg-[#f8fafb]'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
