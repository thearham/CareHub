interface CardProps {
  title?: string;
  value?: string | number;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export default function Card({ title, value, icon, children, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 animate-scale-in ${className}`}>
      {icon && <div className="text-3xl mb-2">{icon}</div>}
      {title && <h3 className="text-sm text-[#5a6c7d] mb-1">{title}</h3>}
      {value && <p className="text-2xl font-semibold text-[#2c3e50]">{value}</p>}
      {children}
    </div>
  );
}
