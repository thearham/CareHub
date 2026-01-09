interface ErrorMessageProps {
  message: string;
  className?: string;
}

export default function ErrorMessage({ message, className = '' }: ErrorMessageProps) {
  return (
    <div
      className={`bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg ${className}`}
      role="alert"
    >
      <div className="flex items-center">
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
}
