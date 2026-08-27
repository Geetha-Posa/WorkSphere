import React, { useState } from 'react';
import { Task } from '../types';

interface ManagerPanelProps {
  tasks: Task[];
}

export const ManagerPanel: React.FC<ManagerPanelProps> = ({ tasks }) => {
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncNow = () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncStatus('Checking for new documents...');

    setTimeout(() => {
      setSyncStatus('No new documents found');
      setIsSyncing(false);
      // clear after 3 seconds for clean UI feedback
      setTimeout(() => {
        setSyncStatus(null);
      }, 3000);
    }, 1000);
  };

  return (
    <div id="manager-panel" className="max-w-6xl mx-auto py-8 px-4 space-y-6">
      <div>
        <h1 id="manager-title" className="text-xl font-semibold text-gray-900">
          Manager Panel
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Overview of all team tasks across the organization.
        </p>
      </div>

      <section
        id="manager-tasks-section"
        className="bg-white border border-gray-200 rounded-lg p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <button
              id="sync-now-button"
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 text-sm font-medium py-1.5 px-3.5 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSyncing ? 'Syncing...' : 'Sync now'}
            </button>
            {syncStatus && (
              <span
                id="sync-status-message"
                className="text-xs text-gray-600 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded"
              >
                {syncStatus}
              </span>
            )}
          </div>

          <span id="all-tasks-count" className="text-xs text-gray-500 font-mono">
            Total Tasks: {tasks.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table id="manager-tasks-table" className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50">
                <th className="py-2.5 px-3">Title</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Team</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tasks.map((task) => (
                <tr key={task.id} id={`task-row-${task.id}`} className="hover:bg-gray-50">
                  <td className="py-2.5 px-3 font-medium text-gray-900">{task.title}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 text-xs rounded font-medium capitalize ${
                        task.status === 'resolved'
                          ? 'bg-green-100 text-green-800'
                          : task.status === 'pending review'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {task.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-gray-700">{task.team}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
