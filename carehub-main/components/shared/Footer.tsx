import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#2c3e50] text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-semibold mb-4">CareHub</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              Unified Patient-Centric Portal and Hospital Operations Hub
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link href="/about" className="block text-sm text-gray-300 hover:text-[#1abc9c] transition-colors">
                About Us
              </Link>
              <Link href="/contact" className="block text-sm text-gray-300 hover:text-[#1abc9c] transition-colors">
                Contact
              </Link>
              <Link href="/privacy" className="block text-sm text-gray-300 hover:text-[#1abc9c] transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <p className="text-sm text-gray-300">Email: info@carehub.com</p>
            <p className="text-sm text-gray-300">Phone: +92 XXX XXXXXXX</p>
          </div>
        </div>

        <div className="border-t border-gray-600 mt-8 pt-6 text-center text-sm text-gray-400">
          © 2025 CareHub. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
