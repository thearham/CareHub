'use client';

import { useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';

const teamMembers = [
  { name: 'Team Member 1', role: 'Full Stack Developer', photo: '👨‍💻' },
  { name: 'Team Member 2', role: 'Frontend Developer', photo: '👩‍💻' },
  { name: 'Team Member 3', role: 'Backend Developer', photo: '👨‍💻' },
];

export default function AboutPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 py-12 px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Project Overview */}
          <section className="animate-fade-in">
            <h1 className="text-4xl font-bold text-[#2c3e50] mb-6">About CareHub</h1>
            <div className="bg-white rounded-lg shadow-sm p-8 space-y-4">
              <h2 className="text-2xl font-semibold text-[#1abc9c]">Our Mission</h2>
              <p className="text-[#5a6c7d] leading-relaxed">
                CareHub is a unified patient-centric portal and hospital operations hub designed to revolutionize
                healthcare management. We bridge the gap between patients, doctors, and hospitals through
                intelligent technology and seamless integration.
              </p>
              <p className="text-[#5a6c7d] leading-relaxed">
                Our platform enables secure medical record storage, OTP-based data sharing, AI-powered medicine
                recommendations, and real-time hospital finder services—all in one place.
              </p>
            </div>
          </section>

          {/* Team Section */}
          <section className="animate-slide-up">
            <h2 className="text-3xl font-bold text-[#2c3e50] mb-6">Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {teamMembers.map((member, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-6 text-center">
                  <div className="text-6xl mb-4">{member.photo}</div>
                  <h3 className="text-xl font-semibold text-[#2c3e50] mb-1">{member.name}</h3>
                  <p className="text-[#5a6c7d]">{member.role}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Advisor Section */}
          <section className="animate-slide-up">
            <h2 className="text-3xl font-bold text-[#2c3e50] mb-6">Project Advisor</h2>
            <div className="bg-white rounded-lg shadow-sm p-8 text-center max-w-md mx-auto">
              <div className="text-6xl mb-4">👨‍🏫</div>
              <h3 className="text-xl font-semibold text-[#2c3e50] mb-1">Sir Asad Kamal</h3>
              <p className="text-[#5a6c7d]">Professor, Computer Science Department</p>
            </div>
          </section>

          {/* Contact Form */}
          <section className="animate-slide-up">
            <h2 className="text-3xl font-bold text-[#2c3e50] mb-6">Get In Touch</h2>
            <div className="bg-white rounded-lg shadow-sm p-8 max-w-2xl mx-auto">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-2">Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-white border border-[#e8ecef] rounded text-[#5a6c7d] focus:outline-none focus:border-[#1abc9c] transition-colors"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 bg-white border border-[#e8ecef] rounded text-[#5a6c7d] focus:outline-none focus:border-[#1abc9c] transition-colors"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-2">Message</label>
                  <textarea
                    rows={5}
                    className="w-full px-4 py-3 bg-white border border-[#e8ecef] rounded text-[#5a6c7d] focus:outline-none focus:border-[#1abc9c] transition-colors"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-[#1abc9c] text-white rounded font-medium hover:bg-[#16a085] transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
