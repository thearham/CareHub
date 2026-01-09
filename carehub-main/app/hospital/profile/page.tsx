'use client';

import { useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function HospitalProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [hospitalData, setHospitalData] = useState({
    hospitalId: 'HOSP-2024-001',
    hospitalName: 'City General Hospital',
    address: '123 Main Street, Lahore',
    city: 'Lahore',
    province: 'Punjab',
    officialEmail: 'admin@citygeneral.com',
    contactNumber: '+92-42-1234567',
    emergencyContact: '+92-42-7654321',
    registrationNumber: 'REG-LHR-123456',
    adminPassword: '********'
  });

  const [stats] = useState({
    totalDoctors: 45,
    verifiedDoctors: 42,
    totalPatients: 1250,
    totalRecords: 3420,
    pendingRequests: 8
  });

  const handleSave = () => {
    // Here you would call an API to update the hospital profile
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2c3e50]">Hospital Profile</h1>
          <p className="text-[#5a6c7d] mt-1">Manage your hospital information and settings</p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
        ) : (
          <div className="flex gap-3">
            <Button onClick={handleSave}>Save Changes</Button>
            <Button variant="secondary" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-[#1abc9c]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#5a6c7d] text-sm">Total Doctors</p>
              <p className="text-3xl font-bold text-[#2c3e50] mt-1">{stats.totalDoctors}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#5a6c7d] text-sm">Verified Doctors</p>
              <p className="text-3xl font-bold text-[#2c3e50] mt-1">{stats.verifiedDoctors}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#5a6c7d] text-sm">Total Patients</p>
              <p className="text-3xl font-bold text-[#2c3e50] mt-1">{stats.totalPatients}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#5a6c7d] text-sm">Total Records</p>
              <p className="text-3xl font-bold text-[#2c3e50] mt-1">{stats.totalRecords}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#5a6c7d] text-sm">Pending Requests</p>
              <p className="text-3xl font-bold text-[#2c3e50] mt-1">{stats.pendingRequests}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hospital Information */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-semibold text-[#2c3e50] mb-6">Hospital Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#2c3e50] mb-2">
              Hospital ID (Login Username)
            </label>
            <Input
              value={hospitalData.hospitalId}
              disabled
              className="bg-[#f0f4f7]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2c3e50] mb-2">
              Hospital Name
            </label>
            <Input
              value={hospitalData.hospitalName}
              onChange={(e) => setHospitalData({ ...hospitalData, hospitalName: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[#2c3e50] mb-2">
              Address
            </label>
            <Input
              value={hospitalData.address}
              onChange={(e) => setHospitalData({ ...hospitalData, address: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2c3e50] mb-2">
              City
            </label>
            <Input
              value={hospitalData.city}
              onChange={(e) => setHospitalData({ ...hospitalData, city: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2c3e50] mb-2">
              Province
            </label>
            <select
              value={hospitalData.province}
              onChange={(e) => setHospitalData({ ...hospitalData, province: e.target.value })}
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-[#e8ecef] rounded-lg focus:ring-2 focus:ring-[#1abc9c] focus:border-transparent disabled:bg-[#f0f4f7]"
            >
              <option value="Punjab">Punjab</option>
              <option value="Sindh">Sindh</option>
              <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
              <option value="Balochistan">Balochistan</option>
              <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
              <option value="Azad Kashmir">Azad Kashmir</option>
              <option value="Islamabad Capital Territory">Islamabad Capital Territory</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2c3e50] mb-2">
              Official Email Address
            </label>
            <Input
              type="email"
              value={hospitalData.officialEmail}
              onChange={(e) => setHospitalData({ ...hospitalData, officialEmail: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2c3e50] mb-2">
              Contact Number
            </label>
            <Input
              value={hospitalData.contactNumber}
              onChange={(e) => setHospitalData({ ...hospitalData, contactNumber: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2c3e50] mb-2">
              Emergency Contact Number
            </label>
            <Input
              value={hospitalData.emergencyContact}
              onChange={(e) => setHospitalData({ ...hospitalData, emergencyContact: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2c3e50] mb-2">
              Hospital License / Registration Number
            </label>
            <Input
              value={hospitalData.registrationNumber}
              disabled
              className="bg-[#f0f4f7]"
            />
          </div>
        </div>
      </div>

      {/* Administrator Information */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-semibold text-[#2c3e50] mb-6">Administrator Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#2c3e50] mb-2">
              Admin Full Name
            </label>
            <Input
              value="Dr. Muhammad Ali Khan"
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2c3e50] mb-2">
              Admin Email
            </label>
            <Input
              type="email"
              value="admin@citygeneral.com"
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2c3e50] mb-2">
              Admin Phone Number
            </label>
            <Input
              value="+92-300-1234567"
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2c3e50] mb-2">
              Admin Password
            </label>
            <div className="flex gap-2">
              <Input
                type="password"
                value={hospitalData.adminPassword}
                disabled
                className="flex-1 bg-[#f0f4f7]"
              />
              <Button variant="secondary">Change Password</Button>
            </div>
          </div>
        </div>
      </div>

      {/* System Settings */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-semibold text-[#2c3e50] mb-6">System Settings</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-[#f0f4f7] rounded-lg">
            <div>
              <p className="font-semibold text-[#2c3e50]">Email Notifications</p>
              <p className="text-sm text-[#5a6c7d]">Receive email notifications for new doctor registrations</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#1abc9c]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1abc9c]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#f0f4f7] rounded-lg">
            <div>
              <p className="font-semibold text-[#2c3e50]">Auto-approve Doctor Verifications</p>
              <p className="text-sm text-[#5a6c7d]">Automatically verify doctors after registration (not recommended)</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#1abc9c]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1abc9c]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#f0f4f7] rounded-lg">
            <div>
              <p className="font-semibold text-[#2c3e50]">Activity Logs</p>
              <p className="text-sm text-[#5a6c7d]">Enable detailed activity logging for compliance and auditing</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#1abc9c]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1abc9c]"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-lg shadow-sm p-8 border-l-4 border-red-500">
        <h2 className="text-2xl font-semibold text-red-600 mb-4">Danger Zone</h2>
        <p className="text-[#5a6c7d] mb-6">
          These actions are irreversible. Please proceed with caution.
        </p>
        <div className="space-y-3">
          <Button variant="secondary" className="border-red-500 text-red-600 hover:bg-red-50">
            Export All Hospital Data
          </Button>
          <Button variant="secondary" className="border-red-500 text-red-600 hover:bg-red-50 ml-3">
            Deactivate Hospital Account
          </Button>
        </div>
      </div>
    </div>
  );
}
