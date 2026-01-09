'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

interface NavbarProps {
  isLoggedIn?: boolean;
  userRole?: 'patient' | 'doctor' | 'hospital';
}

export default function Navbar({ isLoggedIn = false, userRole }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/UI/logo.jpg"
              alt="CareHub Logo"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <span className="text-xl font-semibold text-[#2c3e50]">CareHub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-[#5a6c7d] hover:text-[#1abc9c] transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-[#5a6c7d] hover:text-[#1abc9c] transition-colors">
              About
            </Link>

            {isLoggedIn ? (
              <>
                <Link
                  href={`/${userRole}/dashboard`}
                  className="text-[#5a6c7d] hover:text-[#1abc9c] transition-colors"
                >
                  Dashboard
                </Link>
                <button className="px-4 py-2 text-[#1abc9c] hover:text-[#16a085] transition-colors">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <button className="px-4 py-2 text-[#1abc9c] hover:text-[#16a085] transition-colors">
                    Login
                  </button>
                </Link>
                <Link href="/register">
                  <button className="px-4 py-2 bg-[#1abc9c] text-white rounded hover:bg-[#16a085] transition-colors">
                    Get Started
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-[#5a6c7d]"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 animate-fade-in">
            <Link href="/" className="block py-2 text-[#5a6c7d] hover:text-[#1abc9c]">
              Home
            </Link>
            <Link href="/about" className="block py-2 text-[#5a6c7d] hover:text-[#1abc9c]">
              About
            </Link>
            {!isLoggedIn && (
              <>
                <Link href="/login" className="block py-2 text-[#5a6c7d] hover:text-[#1abc9c]">
                  Login
                </Link>
                <Link href="/register" className="block py-2 text-[#1abc9c]">
                  Get Started
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
