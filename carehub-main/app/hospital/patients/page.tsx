'use client';

import { useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

// Mock data - replace with API calls
const initialPatientRecords = [
  {
    id: 1,
    patientName: 'Muhammad Arham',
    patientId: 'PT-2024-001',
    cnic: '35202-1234567-1',
    recordType: 'MRI',
    uploadDate: '2024-07-01',
    doctorAssigned: 'Dr. Ahmed Hassan',
    status: 'Active'
  },
  {
    id: 2,
    patientName: 'Fatima Khan',
    patientId: 'PT-2024-002',
    cnic: '35202-7654321-2',
    recordType: 'Blood Test',
    uploadDate: '2024-07-03',
    doctorAssigned: 'Dr. Fatima Ali',
    status: 'Pending Review'
  },
  {
    id: 3,
    patientName: 'Ali Hassan',
    patientId: 'PT-2024-003',
    cnic: '35202-9876543-3',
    recordType: 'X-Ray',
    uploadDate: '2024-07-05',
    doctorAssigned: 'Dr. Saad Khan',
    status: 'Completed'
  },
];

const accessRequests = [
  {
    id: 1,
    doctorName: 'Dr. Ahmed Hassan',
    doctorId: 'DOC-001',
    patientName: 'Muhammad Arham',
    requestDate: '2024-07-10',
    status: 'Pending',
    purpose: 'Follow-up consultation'
  },
  {
    id: 2,
    doctorName: 'Dr. Fatima Ali',
    doctorId: 'DOC-002',
    patientName: 'Fatima Khan',
    requestDate: '2024-07-11',
    status: 'Approved',
    purpose: 'Initial consultation'
  },
];

export default function PatientRecordsManagement() {
  const [records] = useState(initialPatientRecords);
  const [requests] = useState(accessRequests);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('records');
  const [selectedRecord, setSelectedRecord] = useState<typeof initialPatientRecords[0] | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const handleViewRecord = (record: typeof initialPatientRecords[0]) => {
    setSelectedRecord(record);
    setShowDetailsModal(true);
  };

  const filteredRecords = records.filter(record =>
    record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.cnic.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#2c3e50]">Patient Records Management</h1>
            <p className="text-[#5a6c7d] mt-1">Monitor and manage patient medical records</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-[#1abc9c]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#5a6c7d] text-sm">Total Records</p>
                <p className="text-3xl font-bold text-[#2c3e50] mt-1">{records.length}</p>
              </div>
              <div className="text-4xl">📋</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#5a6c7d] text-sm">Active Records</p>
                <p className="text-3xl font-bold text-[#2c3e50] mt-1">
                  {records.filter(r => r.status === 'Active').length}
                </p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#5a6c7d] text-sm">Pending Requests</p>
                <p className="text-3xl font-bold text-[#2c3e50] mt-1">
                  {requests.filter(r => r.status === 'Pending').length}
                </p>
              </div>
              <div className="text-4xl">⏳</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#5a6c7d] text-sm">Total Patients</p>
                <p className="text-3xl font-bold text-[#2c3e50] mt-1">
                  {new Set(records.map(r => r.patientId)).size}
                </p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-[#e8ecef]">
            <div className="flex">
              <button
                onClick={() => setActiveTab('records')}
                className={`px-6 py-4 font-medium transition-all ${
                  activeTab === 'records'
                    ? 'text-[#1abc9c] border-b-2 border-[#1abc9c]'
                    : 'text-[#5a6c7d] hover:text-[#2c3e50]'
                }`}
              >
                Patient Records
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`px-6 py-4 font-medium transition-all ${
                  activeTab === 'requests'
                    ? 'text-[#1abc9c] border-b-2 border-[#1abc9c]'
                    : 'text-[#5a6c7d] hover:text-[#2c3e50]'
                }`}
              >
                Access Requests ({requests.filter(r => r.status === 'Pending').length})
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-6">
            <Input
              placeholder="Search by patient name, ID, or CNIC..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Records Tab */}
          {activeTab === 'records' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#f0f4f7]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#2c3e50]">Patient Info</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#2c3e50]">Patient ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#2c3e50]">Record Type</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#2c3e50]">Upload Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#2c3e50]">Doctor Assigned</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#2c3e50]">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#2c3e50]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="border-t border-[#e8ecef] hover:bg-[#f0f4f7] transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-[#2c3e50]">{record.patientName}</p>
                          <p className="text-sm text-[#5a6c7d]">CNIC: {record.cnic}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#5a6c7d]">{record.patientId}</td>
                      <td className="px-6 py-4 text-[#5a6c7d]">{record.recordType}</td>
                      <td className="px-6 py-4 text-[#5a6c7d]">{record.uploadDate}</td>
                      <td className="px-6 py-4 text-[#5a6c7d]">{record.doctorAssigned}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          record.status === 'Active' ? 'bg-green-100 text-green-700' :
                          record.status === 'Pending Review' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewRecord(record)}
                          className="text-[#1abc9c] hover:text-[#16a085] font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Access Requests Tab */}
          {activeTab === 'requests' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#f0f4f7]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#2c3e50]">Doctor Info</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#2c3e50]">Patient Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#2c3e50]">Purpose</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#2c3e50]">Request Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#2c3e50]">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#2c3e50]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id} className="border-t border-[#e8ecef] hover:bg-[#f0f4f7] transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-[#2c3e50]">{request.doctorName}</p>
                          <p className="text-sm text-[#5a6c7d]">ID: {request.doctorId}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#5a6c7d]">{request.patientName}</td>
                      <td className="px-6 py-4 text-[#5a6c7d]">{request.purpose}</td>
                      <td className="px-6 py-4 text-[#5a6c7d]">{request.requestDate}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          request.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                          request.status === 'Approved' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {request.status === 'Pending' && (
                          <div className="flex gap-2">
                            <button className="text-green-600 hover:text-green-700 font-medium">
                              Approve
                            </button>
                            <button className="text-red-600 hover:text-red-700 font-medium">
                              Reject
                            </button>
                          </div>
                        )}
                        {request.status !== 'Pending' && (
                          <span className="text-[#5a6c7d] text-sm">No actions available</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Record Details Modal */}
        {showDetailsModal && selectedRecord && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-scale-in">
              <h2 className="text-2xl font-semibold text-[#2c3e50] mb-6">Record Details</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-[#5a6c7d]">Patient Name</p>
                    <p className="font-semibold text-[#2c3e50]">{selectedRecord.patientName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#5a6c7d]">Patient ID</p>
                    <p className="font-semibold text-[#2c3e50]">{selectedRecord.patientId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#5a6c7d]">CNIC</p>
                    <p className="font-semibold text-[#2c3e50]">{selectedRecord.cnic}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#5a6c7d]">Record Type</p>
                    <p className="font-semibold text-[#2c3e50]">{selectedRecord.recordType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#5a6c7d]">Upload Date</p>
                    <p className="font-semibold text-[#2c3e50]">{selectedRecord.uploadDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#5a6c7d]">Doctor Assigned</p>
                    <p className="font-semibold text-[#2c3e50]">{selectedRecord.doctorAssigned}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#5a6c7d]">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      selectedRecord.status === 'Active' ? 'bg-green-100 text-green-700' :
                      selectedRecord.status === 'Pending Review' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {selectedRecord.status}
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
