'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';
import { accountsService } from '@/lib/api/services/accounts.service';

export default function PatientProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user'],
    queryFn: accountsService.getMe,
  });

  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone_number: user.phone_number || '',
      });
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: (data: typeof formData) => accountsService.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Profile updated successfully');
      setIsEditing(false);
    },
    onError: () => {
      toast.error('Failed to update profile');
    },
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message="Failed to load profile" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2c3e50]">My Profile</h1>
          <p className="text-[#5a6c7d] mt-1">Manage your personal information</p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
        ) : (
          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button variant="secondary" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-semibold text-[#2c3e50] mb-6">Personal Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#2c3e50] mb-2">
              Username
            </label>
            <Input
              value={user?.username || ''}
              disabled
              className="bg-[#f0f4f7]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2c3e50] mb-2">
              Email Address
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2c3e50] mb-2">
              First Name
            </label>
            <Input
              value={formData.first_name}
              onChange={(e) => setFormData({...formData, first_name: e.target.value})}
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2c3e50] mb-2">
              Last Name
            </label>
            <Input
              value={formData.last_name}
              onChange={(e) => setFormData({...formData, last_name: e.target.value})}
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2c3e50] mb-2">
              Phone Number
            </label>
            <Input
              value={formData.phone_number}
              onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
              disabled={!isEditing}
            />
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-semibold text-[#2c3e50] mb-6">Change Password</h2>
        <div className="max-w-md space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#2c3e50] mb-2">
              Current Password
            </label>
            <Input type="password" placeholder="Enter current password" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2c3e50] mb-2">
              New Password
            </label>
            <Input type="password" placeholder="Enter new password" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2c3e50] mb-2">
              Confirm New Password
            </label>
            <Input type="password" placeholder="Confirm new password" />
          </div>
          <Button>Change Password</Button>
        </div>
      </div>
    </div>
  );
}
