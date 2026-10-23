import React, { useState, useEffect } from 'react';
import { User, UserRole, Team } from '../types';
import { apiFetch } from '../api/client';

export const AdminPanel: React.FC = () => {
  // Teams state
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [driveFolderId, setDriveFolderId] = useState('');
  const [teamSuccessNotice, setTeamSuccessNotice] = useState('');
  const [teamErrorNotice, setTeamErrorNotice] = useState('');
  const [teamSubmitting, setTeamSubmitting] = useState(false);

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'manager' | 'employee'>('employee');
  const [team, setTeam] = useState('');
  const [userSuccessNotice, setUserSuccessNotice] = useState('');
  const [userErrorNotice, setUserErrorNotice] = useState('');
  const [userSubmitting, setUserSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await apiFetch('/api/users');
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

  const fetchTeams = async () => {
    try {
      setTeamsLoading(true);
      const response = await apiFetch('/api/teams');
      if (response.ok) {
        const data = await response.json();
        setTeams(data);
      }
    } catch (error) {
      console.error('Failed to fetch teams', error);
    } finally {
      setTeamsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchTeams();
  }, []);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setTeamSuccessNotice('');
    setTeamErrorNotice('');

    const trimmedName = teamName.trim();
    const trimmedFolderId = driveFolderId.trim();

    if (!trimmedName || !trimmedFolderId) {
      setTeamErrorNotice('Team name and Drive folder ID are required.');
      return;
    }

    try {
      setTeamSubmitting(true);
      const response = await apiFetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: trimmedName,
          driveFolderId: trimmedFolderId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTeamSuccessNotice(`Team "${data.name}" created successfully.`);
        setTeamName('');
        setDriveFolderId('');
        await fetchTeams();
      } else {
        setTeamErrorNotice(data.message || 'Failed to create team.');
      }
    } catch (error) {
      setTeamErrorNotice('Network error. Please try again later.');
    } finally {
      setTeamSubmitting(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserSuccessNotice('');
    setUserErrorNotice('');

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedTeam = team.trim();

    if (!trimmedName || !trimmedEmail || !password) {
      setUserErrorNotice('Name, email, and password are required.');
      return;
    }

    if (['manager', 'employee'].includes(role) && !trimmedTeam) {
      setUserErrorNotice('Please select a team.');
      return;
    }

    try {
      setUserSubmitting(true);
      const response = await apiFetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
        setUsers((prev) => [
          ...prev,
          {
            id: data._id,
            name: data.name,
            email: data.email,
            role: data.role as UserRole,
            team: data.team,
          },
        ]);

        setUserSuccessNotice(`User "${data.name}" created successfully.`);
        setName('');
        setEmail('');
        setPassword('');
        setRole('employee');
        setTeam('');
      } else {
        setUserErrorNotice(data.message || 'Failed to create user.');
      }
    } catch (error) {
      setUserErrorNotice('Network error. Please try again later.');
    } finally {
      setUserSubmitting(false);
    }
  };

  return (
    <div id="admin-panel" className="max-w-6xl mx-auto py-8 px-4 space-y-8">
      <div>
        <h1 id="admin-title" className="text-xl font-semibold text-gray-900">
          Admin Panel
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage teams, user accounts, and organization access.
        </p>
      </div>

      {/* Create New Team Section */}
      <section
        id="admin-create-team-section"
        className="bg-white border border-gray-200 rounded-lg p-6"
      >
        <h2 id="create-team-heading" className="text-base font-semibold text-gray-900 mb-4">
          Create New Team
        </h2>

        {teamSuccessNotice && (
          <div
            id="team-success-notice"
            className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 text-sm rounded"
          >
            {teamSuccessNotice}
          </div>
        )}

        {teamErrorNotice && (
          <div
            id="team-error-notice"
            className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded"
          >
            {teamErrorNotice}
          </div>
        )}

        <form id="create-team-form" onSubmit={handleCreateTeam} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="team-name-input"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Team Name
              </label>
              <input
                id="team-name-input"
                type="text"
                required
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. Design, Mobile, Security"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
              />
            </div>

            <div>
              <label
                htmlFor="team-folder-id-input"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Google Drive Folder ID
              </label>
              <input
                id="team-folder-id-input"
                type="text"
                required
                value={driveFolderId}
                onChange={(e) => setDriveFolderId(e.target.value)}
                placeholder="e.g. 1kOZ_kAxRcwj4LElCBVjIGX-HSDP45ldv"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-900 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              id="create-team-submit-button"
              type="submit"
              disabled={teamSubmitting}
              className="bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-5 rounded text-sm cursor-pointer transition-colors disabled:opacity-50"
            >
              {teamSubmitting ? 'Verifying & Adding...' : 'Add Team'}
            </button>
          </div>
        </form>
      </section>

      {/* Existing Teams Table */}
      <section
        id="admin-teams-list-section"
        className="bg-white border border-gray-200 rounded-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="existing-teams-heading" className="text-base font-semibold text-gray-900">
            Existing Teams
          </h2>
          <span id="teams-count-badge" className="text-xs text-gray-500 font-mono">
            Total: {teams.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table id="teams-table" className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50">
                <th className="py-2.5 px-3">Team Name</th>
                <th className="py-2.5 px-3">Drive Folder ID</th>
                <th className="py-2.5 px-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {teams.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-4 text-center text-sm text-gray-500">
                    {teamsLoading ? 'Loading teams...' : 'No teams found. Create one above.'}
                  </td>
                </tr>
              ) : (
                teams.map((t) => (
                  <tr key={t._id} id={`team-row-${t._id}`} className="hover:bg-gray-50">
                    <td className="py-2.5 px-3 font-medium text-gray-900">{t.name}</td>
                    <td className="py-2.5 px-3 text-gray-600 font-mono text-xs">
                      {t.driveFolderId || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-gray-500 text-xs">
                      {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Create New User Section */}
      <section
        id="admin-create-user-section"
        className="bg-white border border-gray-200 rounded-lg p-6"
      >
        <h2 id="create-user-heading" className="text-base font-semibold text-gray-900 mb-4">
          Create New User
        </h2>

        {userSuccessNotice && (
          <div
            id="admin-success-notice"
            className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 text-sm rounded"
          >
            {userSuccessNotice}
          </div>
        )}

        {userErrorNotice && (
          <div
            id="admin-error-notice"
            className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded"
          >
            {userErrorNotice}
          </div>
        )}

        <form id="create-user-form" onSubmit={handleCreateUser} className="space-y-4">
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

            {['manager', 'employee'].includes(role) && (
              <div className="md:col-span-2">
                <label
                  htmlFor="user-team-select"
                  className="block text-xs font-medium text-gray-700 mb-1"
                >
                  Team
                </label>
                <select
                  id="user-team-select"
                  required
                  value={team}
                  onChange={(e) => setTeam(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                >
                  <option value="">Select a team</option>
                  {teams.map((t) => (
                    <option key={t._id} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
                {teams.length === 0 && !teamsLoading && (
                  <p className="text-xs text-amber-600 mt-1">
                    No teams available. Create a team above before adding users.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              id="create-user-submit-button"
              type="submit"
              disabled={userSubmitting}
              className="bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-5 rounded text-sm cursor-pointer transition-colors disabled:opacity-50"
            >
              {userSubmitting ? 'Adding...' : 'Add User'}
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
                  <td className="py-2.5 px-3 text-gray-700">{u.team || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
