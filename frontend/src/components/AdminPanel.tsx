import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';

export const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'manager' | 'employee'>('employee');
  const [team, setTeam] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [errorNotice, setErrorNotice] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          const formattedUsers = data.map((u: any) => ({
            id: u._id,
            name: u.name,
            email: u.email,
            role: u.role as UserRole,
            team: u.team,
          }));
          setUsers(formattedUsers);
        }
      } catch (error) {
        console.error('Failed to fetch users', error);
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessNotice('');
    setErrorNotice('');

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedTeam = team.trim();

    if (!trimmedName || !trimmedEmail || !password || !trimmedTeam) {
      setErrorNotice('All fields are required.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          password: password,
          role: role,
          team: trimmedTeam,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setUsers(prev => [...prev, {
          id: data._id,
          name: data.name,
          email: data.email,
          role: data.role as UserRole,
          team: data.team,
        }]);

        setSuccessNotice(`User "${data.name}" created successfully.`);
        setName('');
        setEmail('');
        setPassword('');
        setRole('employee');
        setTeam('');
      } else {
        setErrorNotice(data.message || 'Failed to create user.');
      }
    } catch (error) {
      setErrorNotice('Network error. Please try again later.');
    }
  };

  return (
    <div id="admin-panel" className="max-w-6xl mx-auto py-8 px-4 space-y-8">
      <div>
        <h1 id="admin-title" className="text-xl font-semibold text-gray-900">
          Admin Panel
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage user accounts and organization access.
        </p>
      </div>

      {/* Create New User Section */}
      <section
        id="admin-create-user-section"
        className="bg-white border border-gray-200 rounded-lg p-6"
      >
        <h2 id="create-user-heading" className="text-base font-semibold text-gray-900 mb-4">
          Create New User
        </h2>

        {successNotice && (
          <div
            id="admin-success-notice"
            className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 text-sm rounded"
          >
            {successNotice}
          </div>
        )}

        {errorNotice && (
          <div
            id="admin-error-notice"
            className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded"
          >
            {errorNotice}
          </div>
        )}

        <form id="create-user-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="user-name-input"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Full Name
              </label>
              <input
                id="user-name-input"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jane Doe"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
              />
            </div>

            <div>
              <label
                htmlFor="user-email-input"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="user-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. jane@test.com"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
              />
            </div>

            <div>
              <label
                htmlFor="user-password-input"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                id="user-password-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter user password"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
              />
            </div>

            <div>
              <label
                htmlFor="user-role-select"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Role
              </label>
              <select
                id="user-role-select"
                value={role}
                onChange={(e) => setRole(e.target.value as 'manager' | 'employee')}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
              >
                <option value="manager">Manager</option>
                <option value="employee">Employee</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="user-team-input"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Team
              </label>
              <input
                id="user-team-input"
                type="text"
                required
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                placeholder="e.g. Engineering or Design"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              id="create-user-submit-button"
              type="submit"
              className="bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-5 rounded text-sm cursor-pointer transition-colors"
            >
              Add User
            </button>
          </div>
        </form>
      </section>

      {/* Existing Users Table */}
      <section
        id="admin-user-list-section"
        className="bg-white border border-gray-200 rounded-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="existing-users-heading" className="text-base font-semibold text-gray-900">
            Existing Users
          </h2>
          <span id="user-count-badge" className="text-xs text-gray-500 font-mono">
            Total: {users.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table id="users-table" className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50">
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Team</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u.id} id={`user-row-${u.id}`} className="hover:bg-gray-50">
                  <td className="py-2.5 px-3 font-medium text-gray-900">{u.name}</td>
                  <td className="py-2.5 px-3 text-gray-600 font-mono text-xs">{u.email}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 text-xs rounded font-medium capitalize ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : u.role === 'manager'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-gray-700">{u.team}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
