'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';

export default function Settings() {
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
  });

  return (
    <div className="min-h-screen bg-[#f0f4f7] p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#2c3e50]">Settings</h1>
          <p className="text-[#5a6c7d] mt-1">Manage your application preferences</p>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-semibold text-[#2c3e50] mb-6">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#f0f4f7] rounded-lg">
              <div>
                <p className="font-semibold text-[#2c3e50]">Email Notifications</p>
                <p className="text-sm text-[#5a6c7d]">Receive notifications via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={notifications.email}
                  onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#1abc9c]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1abc9c]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#f0f4f7] rounded-lg">
              <div>
                <p className="font-semibold text-[#2c3e50]">SMS Notifications</p>
                <p className="text-sm text-[#5a6c7d]">Receive notifications via SMS</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={notifications.sms}
                  onChange={(e) => setNotifications({...notifications, sms: e.target.checked})}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#1abc9c]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1abc9c]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#f0f4f7] rounded-lg">
              <div>
                <p className="font-semibold text-[#2c3e50]">Push Notifications</p>
                <p className="text-sm text-[#5a6c7d]">Receive push notifications in browser</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={notifications.push}
                  onChange={(e) => setNotifications({...notifications, push: e.target.checked})}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#1abc9c]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1abc9c]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-semibold text-[#2c3e50] mb-6">Privacy & Security</h2>
          <div className="space-y-4">
            <Button variant="secondary">Download My Data</Button>
            <Button variant="secondary" className="ml-3">Two-Factor Authentication</Button>
          </div>
        </div>

        {/* About */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-semibold text-[#2c3e50] mb-4">About CareHub</h2>
          <p className="text-[#5a6c7d] mb-2">Version 1.0.0</p>
          <p className="text-[#5a6c7d]">
            CareHub is a comprehensive healthcare management platform for patients, doctors, and hospitals.
          </p>
        </div>
      </div>
    </div>
  );
}
