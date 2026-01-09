'use client';

import { useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

// Mock audit log data - replace with API calls
const initialAuditLogs = [
  {
    id: 1,
    timestamp: '2024-07-15 14:30:25',
    user: 'Dr. Ahmed Hassan (DOC-001)',
    action: 'Accessed Patient Record',
    resource: 'PT-2024-001',
    details: 'Viewed MRI scan results',
    ipAddress: '192.168.1.45',
    status: 'Success'
  },
  {
    id: 2,
    timestamp: '2024-07-15 13:15:10',
    user: 'Admin (HOSP-2024-001)',
    action: 'Doctor Verification',
    resource: 'DOC-045',
    details: 'Verified Dr. Fatima Ali credentials',
    ipAddress: '192.168.1.10',
    status: 'Success'
  },
  {
    id: 3,
    timestamp: '2024-07-15 12:45:33',
    user: 'Dr. Saad Khan (DOC-003)',
    action: 'Requested Access',
    resource: 'PT-2024-015',
    details: 'OTP verification pending',
    ipAddress: '192.168.1.52',
    status: 'Pending'
  },
  {
    id: 4,
    timestamp: '2024-07-15 11:20:18',
    user: 'Patient (PT-2024-007)',
    action: 'Record Upload',
    resource: 'Blood Test Results',
    details: 'Uploaded CBC test results',
    ipAddress: '103.255.12.34',
    status: 'Success'
  },
  {
    id: 5,
    timestamp: '2024-07-15 10:05:42',
    user: 'Admin (HOSP-2024-001)',
    action: 'Doctor Registration',
    resource: 'DOC-046',
    details: 'Added new doctor to system',
    ipAddress: '192.168.1.10',
    status: 'Success'
  },
  {
    id: 6,
    timestamp: '2024-07-15 09:30:15',
    user: 'Dr. Ahmed Hassan (DOC-001)',
    action: 'Failed Login Attempt',
    resource: 'Login System',
    details: 'Incorrect password entered',
    ipAddress: '192.168.1.45',
    status: 'Failed'
  },
  {
    id: 7,
    timestamp: '2024-07-14 18:45:22',
    user: 'Admin (HOSP-2024-001)',
    action: 'Profile Update',
    resource: 'Hospital Profile',
    details: 'Updated emergency contact number',
    ipAddress: '192.168.1.10',
    status: 'Success'
  },
  {
    id: 8,
    timestamp: '2024-07-14 16:15:55',
    user: 'Dr. Fatima Ali (DOC-002)',
    action: 'Prescription Upload',
    resource: 'PT-2024-003',
    details: 'Uploaded prescription for patient',
    ipAddress: '192.168.1.48',
    status: 'Success'
  },
];

export default function AuditLogs() {
  const [logs] = useState(initialAuditLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedLog, setSelectedLog] = useState<typeof initialAuditLogs[0] | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const actionTypes = ['All', 'Accessed Patient Record', 'Doctor Verification', 'Requested Access', 'Record Upload', 'Doctor Registration', 'Failed Login Attempt', 'Profile Update', 'Prescription Upload'];
  const statusTypes = ['All', 'Success', 'Pending', 'Failed'];

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = filterAction === 'All' || log.action === filterAction;
    const matchesStatus = filterStatus === 'All' || log.status === filterStatus;

    return matchesSearch && matchesAction && matchesStatus;
  });

  const handleViewDetails = (log: typeof initialAuditLogs[0]) => {
    setSelectedLog(log);
    setShowDetailsModal(true);
  };

  const handleExportLogs = () => {
    alert('Exporting audit logs... (This would trigger a CSV/PDF download)');
  };

  const stats = {
    totalLogs: logs.length,
    successfulActions: logs.filter(l => l.status === 'Success').length,
    failedActions: logs.filter(l => l.status === 'Failed').length,
    pendingActions: logs.filter(l => l.status === 'Pending').length,
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#2c3e50]">Audit Logs & System Monitoring</h1>
            <p className="text-[#5a6c7d] mt-1">Track all system activities for compliance and security</p>
          </div>
          <Button onClick={handleExportLogs}>
            <span className="mr-2">📥</span>
            Export Logs
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-[#1abc9c]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#5a6c7d] text-sm">Total Activities</p>
                <p className="text-3xl font-bold text-[#2c3e50] mt-1">{stats.totalLogs}</p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#5a6c7d] text-sm">Successful</p>
                <p className="text-3xl font-bold text-[#2c3e50] mt-1">{stats.successfulActions}</p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#5a6c7d] text-sm">Pending</p>
                <p className="text-3xl font-bold text-[#2c3e50] mt-1">{stats.pendingActions}</p>
              </div>
              <div className="text-4xl">⏳</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#5a6c7d] text-sm">Failed</p>
                <p className="text-3xl font-bold text-[#2c3e50] mt-1">{stats.failedActions}</p>
              </div>
              <div className="text-4xl">❌</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                Search
              </label>
              <Input
                placeholder="Search logs by user, action, or resource..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                Filter by Action
              </label>
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="w-full px-4 py-2 border border-[#e8ecef] rounded-lg focus:ring-2 focus:ring-[#1abc9c] focus:border-transparent"
              >
                {actionTypes.map(action => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                Filter by Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-[#e8ecef] rounded-lg focus:ring-2 focus:ring-[#1abc9c] focus:border-transparent"
              >
                {statusTypes.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#e8ecef] bg-[#f0f4f7]">
            <h2 className="text-xl font-semibold text-[#2c3e50]">Activity Log ({filteredLogs.length} entries)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f0f4f7]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#2c3e50]">Timestamp</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#2c3e50]">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#2c3e50]">Action</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#2c3e50]">Resource</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#2c3e50]">Details</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#2c3e50]">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#2c3e50]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-t border-[#e8ecef] hover:bg-[#f0f4f7] transition-colors">
                    <td className="px-6 py-4 text-sm text-[#5a6c7d]">{log.timestamp}</td>
                    <td className="px-6 py-4 text-sm text-[#2c3e50] font-medium">{log.user}</td>
                    <td className="px-6 py-4 text-sm text-[#5a6c7d]">{log.action}</td>
                    <td className="px-6 py-4 text-sm text-[#5a6c7d]">{log.resource}</td>
                    <td className="px-6 py-4 text-sm text-[#5a6c7d] max-w-xs truncate">{log.details}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        log.status === 'Success' ? 'bg-green-100 text-green-700' :
                        log.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDetails(log)}
                        className="text-[#1abc9c] hover:text-[#16a085] text-sm font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Details Modal */}
        {showDetailsModal && selectedLog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-scale-in">
              <h2 className="text-2xl font-semibold text-[#2c3e50] mb-6">Audit Log Details</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-[#5a6c7d]">Log ID</p>
                    <p className="font-semibold text-[#2c3e50]">#{selectedLog.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#5a6c7d]">Timestamp</p>
                    <p className="font-semibold text-[#2c3e50]">{selectedLog.timestamp}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-[#5a6c7d]">User</p>
                    <p className="font-semibold text-[#2c3e50]">{selectedLog.user}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#5a6c7d]">Action</p>
                    <p className="font-semibold text-[#2c3e50]">{selectedLog.action}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#5a6c7d]">Resource</p>
                    <p className="font-semibold text-[#2c3e50]">{selectedLog.resource}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-[#5a6c7d]">Details</p>
                    <p className="font-semibold text-[#2c3e50]">{selectedLog.details}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#5a6c7d]">IP Address</p>
                    <p className="font-semibold text-[#2c3e50]">{selectedLog.ipAddress}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#5a6c7d]">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      selectedLog.status === 'Success' ? 'bg-green-100 text-green-700' :
                      selectedLog.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {selectedLog.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setShowDetailsModal(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
