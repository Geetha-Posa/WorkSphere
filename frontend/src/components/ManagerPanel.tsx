import React, { useState, useEffect } from 'react';
import { Task, User } from '../types';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
}

interface ManagerPanelProps {
  currentUser?: User;
}

export const ManagerPanel: React.FC<ManagerPanelProps> = ({ currentUser }) => {
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const [tasks, setTasks] = useState<Task[]>([]);

  const teamName = currentUser?.team || 'Engineering';

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/tasks/mine', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSyncNow = async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    setSyncStatus('Connecting to Google Drive...');
    setSyncError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/drive/sync/${encodeURIComponent(teamName)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setSyncStatus(data.message || `Successfully synced documents.`);
        await fetchTasks();
      } else {
        setSyncError(data.message || 'Failed to sync Drive files. Please check server configuration.');
        setSyncStatus(null);
      }
    } catch (error) {
      console.error('Failed to sync Drive files:', error);
      setSyncError('Network error while connecting to server. Please try again later.');
      setSyncStatus(null);
    } finally {
      setIsSyncing(false);
    }
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return 'N/A';
    try {
      return new Date(isoString).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div id="manager-panel" className="max-w-6xl mx-auto py-8 px-4 space-y-6">
      <div>
        <h1 id="manager-title" className="text-xl font-semibold text-gray-900">
          Manager Panel
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage and sync team documents from Google Drive ({teamName} team).
        </p>
      </div>

      {/* Google Drive Files Section */}
      <section
        id="synced-drive-files-section"
        className="bg-white border border-gray-200 rounded-lg p-6 shadow-xs"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 border-b border-gray-100 pb-4">
          <div>
            <h2 id="synced-files-heading" className="text-base font-semibold text-gray-900">
              Synced Team Drive Files ({teamName})
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Pull files directly from your team's designated Google Drive folder.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="sync-now-button"
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium py-1.5 px-4 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSyncing ? 'Syncing Drive...' : 'Sync now'}
            </button>

            <span id="synced-files-count" className="text-xs text-gray-500 font-mono bg-gray-50 border border-gray-200 px-2.5 py-1 rounded">
              Files: {tasks.length}
            </span>
          </div>
        </div>

        {syncStatus && (
          <div
            id="sync-status-notice"
            className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 text-sm rounded flex items-center justify-between"
          >
            <span>{syncStatus}</span>
          </div>
        )}

        {syncError && (
          <div
            id="sync-error-notice"
            className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded"
          >
            {syncError}
          </div>
        )}

        {tasks.length === 0 ? (
          <div
            id="no-synced-files-notice"
            className="py-12 text-center text-sm text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200"
          >
            {isSyncing
              ? 'Fetching files from Google Drive...'
              : 'No Drive files synced yet. Click "Sync now" above to load documents.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table id="synced-files-table" className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50">
                  <th className="py-2.5 px-3">File Name</th>
                  <th className="py-2.5 px-3">File ID</th>
                  <th className="py-2.5 px-3">Last Modified</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tasks.map((task) => {
                  const keyId = task._id || task.id || task.driveFileId;
                  const displayId = task.driveFileId || keyId;
                  const displayName = task.filename || task.title;
                  const displayDate = task.updatedAt || task.createdAt || '';
                  
                  return (
                  <tr key={keyId} id={`drive-file-row-${keyId}`} className="hover:bg-gray-50">
                    <td className="py-2.5 px-3 font-medium text-gray-900 flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-blue-600 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21h10a2 2 0 002-2V7.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 1H7a2 2 0 00-2 2v16a2 2 0 002 2z"
                        />
                      </svg>
                      <span>{displayName}</span>
                    </td>
                    <td className="py-2.5 px-3 text-xs font-mono text-gray-500">{displayId}</td>
                    <td className="py-2.5 px-3 text-xs text-gray-600">{formatDate(displayDate)}</td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
