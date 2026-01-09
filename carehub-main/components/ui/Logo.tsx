import Image from 'next/image';

export default function Logo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Image
        src="/UI/logo.jpg"
        alt="CareHub Logo"
        width={64}
        height={64}
        className="animate-scale-in"
        priority
      />
    </div>
  );
}
