'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';
import {
  hospitalsService,
  Doctor,
  DoctorCreateResponse,
  Department,
} from '@/lib/api/services/hospitals.service';

// Form validation schema
const addDoctorSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone_number: z.string().min(1, 'Phone number is required'),
  specialization: z.string().min(1, 'Specialization is required'),
  license_number: z.string().optional(),
  department: z.string().optional(),
});

type AddDoctorFormData = z.infer<typeof addDoctorSchema>;

export default function DoctorManagement() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [newDoctorCredentials, setNewDoctorCredentials] = useState<DoctorCreateResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('All');

  // Fetch doctors
  const {
    data: doctors,
    isLoading: doctorsLoading,
    error: doctorsError,
  } = useQuery({
    queryKey: ['hospital-doctors'],
    queryFn: () => hospitalsService.getDoctors(),
  });

  // Fetch departments
  const { data: departments } = useQuery({
    queryKey: ['hospital-departments'],
    queryFn: () => hospitalsService.getDepartments(),
  });

  // Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddDoctorFormData>({
    resolver: zodResolver(addDoctorSchema),
  });

  // Create doctor mutation
  const createDoctorMutation = useMutation({
    mutationFn: (data: AddDoctorFormData) =>
      hospitalsService.createDoctor({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone_number: data.phone_number,
        specialization: data.specialization,
        license_number: data.license_number,
        department: data.department ? parseInt(data.department) : undefined,
      }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['hospital-doctors'] });
      setNewDoctorCredentials(response);
      setShowAddModal(false);
      setShowCredentialsModal(true);
      reset();
      toast.success('Doctor created successfully!');
    },
    onError: () => {
      toast.error('Failed to create doctor');
    },
  });

  // Delete doctor mutation
  const deleteDoctorMutation = useMutation({
    mutationFn: (id: number) => hospitalsService.deleteDoctor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hospital-doctors'] });
      toast.success('Doctor removed successfully');
    },
    onError: () => {
      toast.error('Failed to remove doctor');
    },
  });

  const handleViewDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowViewModal(true);
  };

  const handleRemoveDoctor = (doctorId: number) => {
    if (confirm('Are you sure you want to remove this doctor?')) {
      deleteDoctorMutation.mutate(doctorId);
    }
  };

  const onSubmit = (data: AddDoctorFormData) => {
    createDoctorMutation.mutate(data);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  // Filter doctors
  const filteredDoctors = (doctors || []).filter((doctor) => {
    const fullName = `${doctor.user.first_name} ${doctor.user.last_name}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      doctor.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment =
      filterDepartment === 'All' || doctor.department_name === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  // Get unique departments
  const uniqueDepartments = [...new Set((doctors || []).map((d) => d.department_name).filter(Boolean))];

  if (doctorsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (doctorsError) {
    return <ErrorMessage message="Failed to load doctors" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2c3e50]">Doctor Management</h1>
          <p className="text-[#5a6c7d] mt-1">Manage your hospital&apos;s doctors</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <span className="mr-2">+</span>
          Add Doctor
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-[#1abc9c]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#5a6c7d] text-sm">Total Doctors</p>
              <p className="text-3xl font-bold text-[#2c3e50] mt-1">{doctors?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#5a6c7d] text-sm">Departments</p>
              <p className="text-3xl font-bold text-[#2c3e50] mt-1">{departments?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#5a6c7d] text-sm">Specializations</p>
              <p className="text-3xl font-bold text-[#2c3e50] mt-1">
                {new Set((doctors || []).map((d) => d.specialization)).size}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#5a6c7d] text-sm">Active Today</p>
              <p className="text-3xl font-bold text-[#2c3e50] mt-1">{doctors?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by name, email, or specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterDepartment('All')}
              className={`px-4 py-2 rounded-lg transition-all ${filterDepartment === 'All'
                  ? 'bg-[#1abc9c] text-white'
                  : 'bg-[#f0f4f7] text-[#5a6c7d] hover:bg-[#e8ecef]'
                }`}
            >
              All
            </button>
            {uniqueDepartments.map((dept) => (
              <button
                key={dept}
                onClick={() => setFilterDepartment(dept || 'All')}
                className={`px-4 py-2 rounded-lg transition-all ${filterDepartment === dept
                    ? 'bg-[#1abc9c] text-white'
                    : 'bg-[#f0f4f7] text-[#5a6c7d] hover:bg-[#e8ecef]'
                  }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Doctors Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f0f4f7]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#2c3e50]">Doctor Info</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#2c3e50]">Username</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#2c3e50]">Specialization</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#2c3e50]">Department</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#2c3e50]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDoctors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#5a6c7d]">
                    No doctors added yet. Click &quot;Add Doctor&quot; to get started.
                  </td>
                </tr>
              ) : (
                filteredDoctors.map((doctor) => (
                  <tr
                    key={doctor.id}
                    className="border-t border-[#e8ecef] hover:bg-[#f0f4f7] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-[#2c3e50]">
                          Dr. {doctor.user.first_name} {doctor.user.last_name}
                        </p>
                        <p className="text-sm text-[#5a6c7d]">{doctor.user.email}</p>
                        <p className="text-sm text-[#5a6c7d]">{doctor.user.phone_number}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="px-2 py-1 bg-[#f0f4f7] rounded text-sm text-[#2c3e50]">
                        {doctor.user.username}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-[#5a6c7d]">{doctor.specialization}</td>
                    <td className="px-6 py-4 text-[#5a6c7d]">
                      {doctor.department_name || 'Not Assigned'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDoctor(doctor)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleRemoveDoctor(doctor.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Doctor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-semibold text-[#2c3e50] mb-6">Add New Doctor</h2>

            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> A username and password will be automatically generated.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  placeholder="John"
                  {...register('first_name')}
                  error={errors.first_name?.message}
                />
                <Input
                  label="Last Name"
                  placeholder="Doe"
                  {...register('last_name')}
                  error={errors.last_name?.message}
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="doctor@example.com"
                  {...register('email')}
                  error={errors.email?.message}
                />
                <Input
                  label="Phone Number"
                  placeholder="+923001234567"
                  {...register('phone_number')}
                  error={errors.phone_number?.message}
                />
                <Input
                  label="Specialization"
                  placeholder="Cardiology"
                  {...register('specialization')}
                  error={errors.specialization?.message}
                />
                <Input
                  label="License Number (Optional)"
                  placeholder="PMC-12345"
                  {...register('license_number')}
                />
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                    Department (Optional)
                  </label>
                  <select
                    {...register('department')}
                    className="w-full px-4 py-3 bg-white border border-[#e8ecef] rounded text-[#5a6c7d] focus:outline-none focus:border-[#1abc9c]"
                  >
                    <option value="">Select Department</option>
                    {departments?.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button type="submit" className="flex-1" disabled={createDoctorMutation.isPending}>
                  {createDoctorMutation.isPending ? 'Creating...' : 'Add Doctor'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setShowAddModal(false);
                    reset();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Doctor Modal */}
      {showViewModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-semibold text-[#2c3e50] mb-6">Doctor Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[#5a6c7d]">Full Name</p>
                <p className="font-semibold text-[#2c3e50]">
                  Dr. {selectedDoctor.user.first_name} {selectedDoctor.user.last_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#5a6c7d]">Username</p>
                <code className="px-2 py-1 bg-[#f0f4f7] rounded text-sm">
                  {selectedDoctor.user.username}
                </code>
              </div>
              <div>
                <p className="text-sm text-[#5a6c7d]">Email</p>
                <p className="font-semibold text-[#2c3e50]">{selectedDoctor.user.email}</p>
              </div>
              <div>
                <p className="text-sm text-[#5a6c7d]">Phone</p>
                <p className="font-semibold text-[#2c3e50]">{selectedDoctor.user.phone_number || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-[#5a6c7d]">Specialization</p>
                <p className="font-semibold text-[#2c3e50]">{selectedDoctor.specialization}</p>
              </div>
              <div>
                <p className="text-sm text-[#5a6c7d]">Department</p>
                <p className="font-semibold text-[#2c3e50]">{selectedDoctor.department_name || 'Not Assigned'}</p>
              </div>
            </div>
            <div className="mt-6">
              <Button variant="secondary" className="w-full" onClick={() => setShowViewModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Credentials Modal */}
      {showCredentialsModal && newDoctorCredentials && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              </div>
              <h2 className="text-2xl font-semibold text-[#2c3e50]">Doctor Created!</h2>
              <p className="text-[#5a6c7d] mt-2">Save these credentials and share them with the doctor.</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-700 font-medium">
                The password will not be shown again!
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#5a6c7d] mb-1">Username</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-4 py-3 bg-[#f0f4f7] rounded font-mono">
                    {newDoctorCredentials.username}
                  </code>
                  <button
                    onClick={() => copyToClipboard(newDoctorCredentials.username, 'Username')}
                    className="px-3 py-3 bg-[#1abc9c] text-white rounded hover:bg-[#16a085]"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5a6c7d] mb-1">Password</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-4 py-3 bg-[#f0f4f7] rounded font-mono">
                    {newDoctorCredentials.password}
                  </code>
                  <button
                    onClick={() => copyToClipboard(newDoctorCredentials.password, 'Password')}
                    className="px-3 py-3 bg-[#1abc9c] text-white rounded hover:bg-[#16a085]"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>

            <Button
              className="w-full mt-6"
              onClick={() => {
                setShowCredentialsModal(false);
                setNewDoctorCredentials(null);
              }}
            >
              Done - I&apos;ve Saved the Credentials
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}