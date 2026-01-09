'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/components/ui/Logo';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

interface SidebarProps {
  userRole: 'patient' | 'doctor' | 'hospital';
}

const roleNavigation = {
  patient: [
    { href: '/patient/dashboard', label: 'Dashboard', icon: '' },
    { href: '/patient/appointments', label: 'My Appointments', icon: '' },
    { href: '/patient/reports', label: 'Upload Reports', icon: '' },
    { href: '/patient/medicine-recommendation', label: 'Medicine Recommendations', icon: '' },
    { href: '/patient/hospital-recommendation', label: 'Find Hospitals', icon: '' },
    { href: '/patient/prescriptions', label: 'Prescriptions', icon: '' },
    { href: '/patient/profile', label: 'Profile', icon: '' },
  ],
  doctor: [
    { href: '/doctor/dashboard', label: 'Dashboard', icon: '' },
    { href: '/doctor/access-requests', label: 'Access Requests', icon: '' },
    { href: '/doctor/patient-records', label: 'Patient Records', icon: '' },
    { href: '/doctor/prescription', label: 'Prescriptions', icon: '' },
    { href: '/doctor/profile', label: 'Profile', icon: '' },
  ],
  hospital: [
    { href: '/hospital/dashboard', label: 'Dashboard', icon: '' },
    { href: '/hospital/appointments', label: 'Appointments', icon: '' },
    { href: '/hospital/departments', label: 'Departments', icon: '' },
    { href: '/hospital/doctors', label: 'Manage Doctors', icon: '' },
    { href: '/hospital/patients', label: 'Patients', icon: '' },
    { href: '/hospital/audit-logs', label: 'Audit Logs', icon: '' },
    { href: '/hospital/profile', label: 'Profile', icon: '' },
  ],
};

const bottomItems: NavItem[] = [
  { href: '/about', label: 'About Us', icon: '' },
  { href: '/settings', label: 'Settings', icon: '' },
];

export default function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();
  const navItems = roleNavigation[userRole];

  return (
    <aside className="w-64 bg-[#d9e8e4] min-h-screen p-6 flex flex-col animate-fade-in">
      <Logo className="mb-12" />

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded transition-all ${pathname === item.href
                ? 'bg-[#b8d4ce] text-[#2c3e50] font-medium'
                : 'text-[#5a6c7d] hover:bg-[#c8ddd7]'
              }`}
          >
            <span>{item.icon}</span>
            <span className="text-sm">{item.label}</span>
          </Link>
        ))}
      </nav>

      <nav className="space-y-2 mt-8">
        {bottomItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded transition-all ${pathname === item.href
                ? 'bg-[#b8d4ce] text-[#2c3e50] font-medium'
                : 'text-[#5a6c7d] hover:bg-[#c8ddd7]'
              }`}
          >
            <span>{item.icon}</span>
            <span className="text-sm">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}