import Link from 'next/link';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';

const features = [
  {
    icon: '',
    title: 'Hospital Registration',
    description: 'Seamless onboarding for healthcare facilities with secure credential management',
  },
  {
    icon: '',
    title: 'Patient Record Upload',
    description: 'Secure digital storage for MRIs, CT scans, lab reports, and medical history',
  },
  {
    icon: '',
    title: 'OTP Data Sharing',
    description: 'Privacy-first approach with OTP verification for doctor-patient data access',
  },
  {
    icon: '',
    title: 'Medicine Recommendations',
    description: 'AI-powered suggestions for affordable medicine alternatives',
  },
  {
    icon: '',
    title: 'Hospital Finder',
    description: 'Locate nearby hospitals with ratings, specializations, and real-time availability',
  },
  {
    icon: '',
    title: 'Unified Portal',
    description: 'One platform for patients, doctors, and hospitals to collaborate seamlessly',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#1abc9c] to-[#16a085] text-white py-20 px-4 animate-fade-in">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-slide-up">
            Unified Patient-Centric Portal
          </h1>
          <p className="text-lg md:text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Empowering patients with smart, seamless healthcare management.
            Connect with hospitals, manage records, and get AI-powered recommendations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <button className="px-8 py-3 bg-white text-[#1abc9c] rounded-lg font-semibold hover:bg-gray-100 transition-all hover:scale-105">
                Get Started
              </button>
            </Link>
            <Link href="/login">
              <button className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors">
                Login
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#2c3e50] mb-4">
            Everything You Need
          </h2>
          <p className="text-center text-[#5a6c7d] mb-12 max-w-2xl mx-auto">
            CareHub brings together patients, doctors, and hospitals on one intelligent platform
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-[#f0f4f7] rounded-lg p-6 hover:shadow-lg transition-all hover:-translate-y-1 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-[#2c3e50] mb-2">{feature.title}</h3>
                <p className="text-[#5a6c7d]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-[#f0f4f7]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#2c3e50] mb-6">
            Ready to Transform Your Healthcare Experience?
          </h2>
          <p className="text-[#5a6c7d] mb-8">
            Join thousands of patients and healthcare providers using CareHub
          </p>
          <Link href="/register">
            <button className="px-8 py-3 bg-[#1abc9c] text-white rounded-lg font-semibold hover:bg-[#16a085] transition-all hover:scale-105">
              Create Your Account
            </button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
