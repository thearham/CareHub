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
import { hospitalsService, Department } from '@/lib/api/services/hospitals.service';

// Form validation schema
const addDepartmentSchema = z.object({
  name: z.string().min(1, 'Department name is required'),
});

type AddDepartmentFormData = z.infer<typeof addDepartmentSchema>;

export default function DepartmentManagement() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);

  // Fetch departments
  const {
    data: departments,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['hospital-departments'],
    queryFn: () => hospitalsService.getDepartments(),
  });

  // Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddDepartmentFormData>({
    resolver: zodResolver(addDepartmentSchema),
  });

  // Create department mutation
  const createDepartmentMutation = useMutation({
    mutationFn: (data: AddDepartmentFormData) => hospitalsService.createDepartment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hospital-departments'] });
      setShowAddModal(false);
      reset();
      toast.success('Department created successfully!');
    },
    onError: (error: Error & { response?: { data?: { detail?: string; name?: string[] } } }) => {
      const errorMsg = error.response?.data?.detail || 
                       error.response?.data?.name?.[0] || 
                       'Failed to create department';
      toast.error(errorMsg);
    },
  });

  // Delete department mutation
  const deleteDepartmentMutation = useMutation({
    mutationFn: (id: number) => hospitalsService.deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hospital-departments'] });
      toast.success('Department deleted successfully!');
    },
    onError: (error: Error & { response?: { data?: { detail?: string } } }) => {
      const errorMsg = error.response?.data?.detail || 'Failed to delete department';
      toast.error(errorMsg);
    },
  });

  const onSubmit = (data: AddDepartmentFormData) => {
    createDepartmentMutation.mutate(data);
  };

  const handleDeleteDepartment = (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}" department?`)) {
      deleteDepartmentMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message="Failed to load departments" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2c3e50]">Department Management</h1>
          <p className="text-[#5a6c7d] mt-1">Manage your hospital&apos;s departments</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <span className="mr-2">+</span>
          Add Department
        </Button>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-[#1abc9c]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#5a6c7d] text-sm">Total Departments</p>
              <p className="text-3xl font-bold text-[#2c3e50] mt-1">{departments?.length || 0}</p>
            </div>
            <div className="text-4xl">🏥</div>
          </div>
        </div>
      </div>

      {/* Departments Grid */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-[#2c3e50] mb-4">All Departments</h2>
        
        {departments?.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏥</div>
            <h3 className="text-xl font-semibold text-[#2c3e50] mb-2">No Departments Yet</h3>
            <p className="text-[#5a6c7d] mb-4">
              Create your first department to start adding doctors.
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <span className="mr-2">+</span>
              Add First Department
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments?.map((dept) => (
              <div
                key={dept.id}
                className="border border-[#e8ecef] rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#1abc9c]/10 rounded-lg flex items-center justify-center">
                      <span className="text-xl">🏥</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#2c3e50]">{dept.name}</h3>
                      <p className="text-sm text-[#5a6c7d]">ID: {dept.id}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                    className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                    disabled={deleteDepartmentMutation.isPending}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Department Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-semibold text-[#2c3e50] mb-6">Add New Department</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Department Name"
                placeholder="e.g., Cardiology, Neurology, Pediatrics"
                {...register('name')}
                error={errors.name?.message}
              />

              <div className="flex gap-3 mt-6">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createDepartmentMutation.isPending}
                >
                  {createDepartmentMutation.isPending ? 'Creating...' : 'Add Department'}
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
    </div>
  );
}