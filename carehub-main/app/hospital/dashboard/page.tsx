'use client';

import { useRouter } from 'next/navigation';

export default function HospitalDashboard() {
  const router = useRouter();

  const stats = {
    totalDoctors: 45,
    verifiedDoctors: 42,
    pendingDoctors: 3,
    totalPatients: 1250,
    activeRecords: 3420,
    pendingAccessRequests: 8,
    departments: 12,
    todayAppointments: 23
  };

  const recentActivities = [
    {
      id: 1,
      type: 'doctor_added',
      message: 'Dr. Ahmed Hassan was added to Cardiology department',
      time: '2 hours ago',
      icon: ''
    },
    {
      id: 2,
      type: 'access_request',
      message: 'Dr. Fatima Ali requested access to patient record PT-2024-001',
      time: '4 hours ago',
      icon: ''
    },
    {
      id: 3,
      type: 'record_uploaded',
      message: 'New MRI scan uploaded for patient PT-2024-015',
      time: '6 hours ago',
      icon: ''
    },
    {
      id: 4,
      type: 'doctor_verified',
      message: 'Dr. Saad Khan has been verified successfully',
      time: '1 day ago',
      icon: ''
    },
  ];

  const quickActions = [
    {
      title: 'Manage Doctors',
      description: 'Add and verify doctor credentials',
      icon: '',
      color: 'bg-blue-50 text-blue-600',
      action: () => router.push('/hospital/doctors')
    },
    {
      title: 'Departments',
      description: 'Create and organize hospital departments',
      icon: '',
      color: 'bg-teal-50 text-teal-600',
      action: () => router.push('/hospital/departments')
    },
    // ...ot
    {
      title: 'Patient Records',
      description: 'View and manage patient medical records',
      icon: '',
      color: 'bg-green-50 text-green-600',
      action: () => router.push('/hospital/patients')
    },
    {
      title: 'Audit Logs',
      description: 'Monitor system activity and compliance',
      icon: '',
      color: 'bg-purple-50 text-purple-600',
      action: () => router.push('/hospital/audit-logs')
    },
    {
      title: 'Hospital Profile',
      description: 'Update hospital information',
      icon: '',
      color: 'bg-orange-50 text-orange-600',
      action: () => router.push('/hospital/profile')
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#2c3e50]">Hospital Dashboard</h1>
        <p className="text-[#5a6c7d] mt-1">Welcome back! Here&apos;s what&apos;s happening at your hospital today.</p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-[#1abc9c]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#5a6c7d] text-sm">Total Doctors</p>
              <p className="text-3xl font-bold text-[#2c3e50] mt-1">{stats.totalDoctors}</p>
              <p className="text-xs text-green-600 mt-1">
                {stats.verifiedDoctors} verified
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#5a6c7d] text-sm">Total Patients</p>
              <p className="text-3xl font-bold text-[#2c3e50] mt-1">{stats.totalPatients}</p>
              <p className="text-xs text-blue-600 mt-1">
                {stats.activeRecords} active records
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#5a6c7d] text-sm">Pending Requests</p>
              <p className="text-3xl font-bold text-[#2c3e50] mt-1">{stats.pendingAccessRequests}</p>
              <p className="text-xs text-yellow-600 mt-1">
                Requires attention
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#5a6c7d] text-sm">Today&apos;s Appointments</p>
              <p className="text-3xl font-bold text-[#2c3e50] mt-1">{stats.todayAppointments}</p>
              <p className="text-xs text-purple-600 mt-1">
                Across {stats.departments} departments
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-[#2c3e50] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="p-4 rounded-lg border-2 border-[#e8ecef] hover:border-[#1abc9c] transition-all hover:shadow-md text-left group"
            >
              <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform`}>
                {action.icon}
              </div>
              <h3 className="font-semibold text-[#2c3e50] mb-1">{action.title}</h3>
              <p className="text-sm text-[#5a6c7d]">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[#2c3e50]">Recent Activity</h2>
            <button
              onClick={() => router.push('/hospital/audit-logs')}
              className="text-sm text-[#1abc9c] hover:text-[#16a085] font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 bg-[#f0f4f7] rounded-lg hover:bg-[#e8ecef] transition-colors">
                <div className="text-2xl">{activity.icon}</div>
                <div className="flex-1">
                  <p className="text-sm text-[#2c3e50]">{activity.message}</p>
                  <p className="text-xs text-[#5a6c7d] mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Overview */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-[#2c3e50] mb-4">System Overview</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-semibold text-[#2c3e50]">System Status</p>
                  <p className="text-sm text-[#5a6c7d]">All systems operational</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                Online
              </span>
            </div>

            <div className="p-4 bg-[#f0f4f7] rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#5a6c7d]">Doctor Verification Rate</span>
                <span className="text-sm font-semibold text-[#2c3e50]">
                  {Math.round((stats.verifiedDoctors / stats.totalDoctors) * 100)}%
                </span>
              </div>
              <div className="w-full bg-[#e8ecef] rounded-full h-2">
                <div
                  className="bg-[#1abc9c] h-2 rounded-full transition-all"
                  style={{ width: `${(stats.verifiedDoctors / stats.totalDoctors) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="p-4 bg-[#f0f4f7] rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#5a6c7d]">Storage Used</span>
                <span className="text-sm font-semibold text-[#2c3e50]">65%</span>
              </div>
              <div className="w-full bg-[#e8ecef] rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: '65%' }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#f0f4f7] rounded-lg text-center">
                <p className="text-2xl font-bold text-[#2c3e50]">{stats.departments}</p>
                <p className="text-xs text-[#5a6c7d] mt-1">Departments</p>
              </div>
              <div className="p-3 bg-[#f0f4f7] rounded-lg text-center">
                <p className="text-2xl font-bold text-[#2c3e50]">{stats.pendingDoctors}</p>
                <p className="text-xs text-[#5a6c7d] mt-1">Pending Verifications</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
