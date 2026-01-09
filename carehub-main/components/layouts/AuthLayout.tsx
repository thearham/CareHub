import Logo from '@/components/ui/Logo';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 animate-fade-in">
      <div className="w-full max-w-md">
        <Logo className="mb-8" />
        <div className="bg-white rounded-lg shadow-sm p-8 animate-slide-up">
          {children}
        </div>
        <p className="text-center text-sm text-[#a8b7c7] mt-6">
          © 2025 CareHub. All rights reserved.
        </p>
      </div>
    </div>
  );
}
