'use client';

import { useState } from 'react';
import { authService } from '@/lib/api/services/auth.service';
import { accountsService } from '@/lib/api/services/accounts.service';

export default function ApiTestPage() {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginResponse, setLoginResponse] = useState<any>(null);
  const [loginError, setLoginError] = useState<any>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const [registerData, setRegisterData] = useState<{
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    date_of_birth: string;
    gender: 'M' | 'F' | 'O';
    address: string;
    consent: boolean;
  }>({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    date_of_birth: '',
    gender: 'M',
    address: '',
    consent: false,
  });
  const [registerResponse, setRegisterResponse] = useState<any>(null);
  const [registerError, setRegisterError] = useState<any>(null);
  const [registerLoading, setRegisterLoading] = useState(false);

  const [meResponse, setMeResponse] = useState<any>(null);
  const [meError, setMeError] = useState<any>(null);
  const [meLoading, setMeLoading] = useState(false);

  const testLogin = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    setLoginLoading(true);
    setLoginResponse(null);
    setLoginError(null);

    console.log('Attempting login with:', { username: loginEmail, password: loginPassword });

    try {
      const response = await authService.login({
        username: loginEmail,
        password: loginPassword,
      });
      setLoginResponse(response);
      console.log('Login Success:', response);
    } catch (error: any) {
      setLoginError({
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        sentData: { username: loginEmail, password: loginPassword },
      });
      console.log('Login Error:', error);
      console.log('Data sent:', { username: loginEmail, password: loginPassword });
    } finally {
      setLoginLoading(false);
    }
  };

  const testRegister = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    setRegisterLoading(true);
    setRegisterResponse(null);
    setRegisterError(null);

    console.log('Attempting register with:', registerData);

    try {
      const response = await accountsService.registerPatient(registerData);
      setRegisterResponse(response);
      console.log('Register Success:', response);
    } catch (error: any) {
      setRegisterError({
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        sentData: registerData,
      });
      console.log('Register Error:', error);
      console.log('Data sent:', registerData);
      console.log('Validation errors:', error.response?.data);
    } finally {
      setRegisterLoading(false);
    }
  };

  const testMe = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    setMeLoading(true);
    setMeResponse(null);
    setMeError(null);
    try {
      const response = await accountsService.getMe();
      setMeResponse(response);
      console.log('Get Me Success:', response);
    } catch (error: any) {
      setMeError({
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      console.log('Get Me Error:', error);
    } finally {
      setMeLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">API Endpoint Test Page</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Login Test */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Test Login</h2>
            <div className="mb-3 p-2 bg-gray-100 rounded text-xs">
              <p><strong>Current Values:</strong></p>
              <p>Email: {loginEmail || '(empty)'}</p>
              <p>Password: {loginPassword ? '***' : '(empty)'}</p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Email/Username</label>
                <input
                  type="text"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter email or username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter password"
                />
              </div>
              <button
                type="button"
                onClick={testLogin}
                disabled={loginLoading}
                className="w-full bg-blue-600 text-white rounded py-2 hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loginLoading ? 'Testing...' : 'Test Login'}
              </button>
            </div>

            {loginResponse && (
              <div className="mt-4 p-4 bg-green-50 rounded">
                <h3 className="font-semibold text-green-800 mb-2">Success Response:</h3>
                <pre className="text-xs overflow-auto">{JSON.stringify(loginResponse, null, 2)}</pre>
              </div>
            )}

            {loginError && (
              <div className="mt-4 p-4 bg-red-50 rounded">
                <h3 className="font-semibold text-red-800 mb-2">Error Response:</h3>
                <pre className="text-xs overflow-auto">{JSON.stringify(loginError, null, 2)}</pre>
              </div>
            )}
          </div>

          {/* Register Test */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Test Register</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <input
                  type="text"
                  value={registerData.username}
                  onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={registerData.password_confirm}
                  onChange={(e) => setRegisterData({ ...registerData, password_confirm: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <input
                  type="text"
                  value={registerData.first_name}
                  onChange={(e) => setRegisterData({ ...registerData, first_name: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <input
                  type="text"
                  value={registerData.last_name}
                  onChange={(e) => setRegisterData({ ...registerData, last_name: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input
                  type="text"
                  value={registerData.phone_number}
                  onChange={(e) => setRegisterData({ ...registerData, phone_number: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={registerData.date_of_birth}
                  onChange={(e) => setRegisterData({ ...registerData, date_of_birth: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Gender</label>
                <select
                  value={registerData.gender}
                  onChange={(e) => setRegisterData({ ...registerData, gender: e.target.value as 'M' | 'F' | 'O' })}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <textarea
                  value={registerData.address}
                  onChange={(e) => setRegisterData({ ...registerData, address: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                  rows={2}
                  placeholder="Enter full address"
                />
              </div>
              <div className="flex items-start">
                <input
                  type="checkbox"
                  checked={registerData.consent}
                  onChange={(e) => setRegisterData({ ...registerData, consent: e.target.checked })}
                  className="mt-1 mr-2"
                  id="consent"
                />
                <label htmlFor="consent" className="text-sm">
                  I consent to the terms and conditions
                </label>
              </div>
              <button
                type="button"
                onClick={testRegister}
                disabled={registerLoading}
                className="w-full bg-green-600 text-white rounded py-2 hover:bg-green-700 disabled:bg-gray-400"
              >
                {registerLoading ? 'Testing...' : 'Test Register'}
              </button>
            </div>

            {registerResponse && (
              <div className="mt-4 p-4 bg-green-50 rounded">
                <h3 className="font-semibold text-green-800 mb-2">Success Response:</h3>
                <pre className="text-xs overflow-auto">{JSON.stringify(registerResponse, null, 2)}</pre>
              </div>
            )}

            {registerError && (
              <div className="mt-4 p-4 bg-red-50 rounded">
                <h3 className="font-semibold text-red-800 mb-2">Error Response:</h3>
                <pre className="text-xs overflow-auto">{JSON.stringify(registerError, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>

        {/* Get Me Test */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">Test Get Current User (/api/accounts/me/)</h2>
          <p className="text-sm text-gray-600 mb-4">
            This requires a valid access token. Login first to get a token, then test this endpoint.
          </p>
          <button
            type="button"
            onClick={testMe}
            disabled={meLoading}
            className="bg-purple-600 text-white rounded px-6 py-2 hover:bg-purple-700 disabled:bg-gray-400"
          >
            {meLoading ? 'Testing...' : 'Test Get Me'}
          </button>

          {meResponse && (
            <div className="mt-4 p-4 bg-green-50 rounded">
              <h3 className="font-semibold text-green-800 mb-2">Success Response:</h3>
              <pre className="text-xs overflow-auto">{JSON.stringify(meResponse, null, 2)}</pre>
            </div>
          )}

          {meError && (
            <div className="mt-4 p-4 bg-red-50 rounded">
              <h3 className="font-semibold text-red-800 mb-2">Error Response:</h3>
              <pre className="text-xs overflow-auto">{JSON.stringify(meError, null, 2)}</pre>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>Use this page to test your authentication endpoints directly</li>
            <li>Login endpoint: POST /api/token/ - Returns access and refresh tokens</li>
            <li>Register endpoint: POST /api/accounts/patients/register/ - Creates a new patient user</li>
            <li>Get Me endpoint: GET /api/accounts/me/ - Returns current user info (requires auth token)</li>
            <li>Check the browser console (F12) for network requests and detailed errors</li>
            <li>All responses (success or error) will be displayed on this page</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
