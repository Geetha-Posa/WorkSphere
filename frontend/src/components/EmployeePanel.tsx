import React from 'react';
import { Task, User } from '../types';

interface EmployeePanelProps {
  currentUser: User;
  tasks: Task[];
}

export const EmployeePanel: React.FC<EmployeePanelProps> = ({ currentUser, tasks }) => {
  const assignedTasks = tasks.filter((task) => task.assignedTo === currentUser.id);

  return (
    <div id="employee-panel" className="max-w-6xl mx-auto py-8 px-4 space-y-6">
      <div>
        <h1 id="employee-title" className="text-xl font-semibold text-gray-900">
          My Tasks
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Tasks assigned to {currentUser.name} ({currentUser.team} team).
        </p>
      </div>

      <section
        id="employee-tasks-section"
        className="bg-white border border-gray-200 rounded-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="assigned-tasks-heading" className="text-base font-semibold text-gray-900">
            Assigned Tasks
          </h2>
          <span id="assigned-tasks-count" className="text-xs text-gray-500 font-mono">
            Assigned: {assignedTasks.length}
          </span>
        </div>

        {assignedTasks.length === 0 ? (
          <div
            id="no-tasks-assigned-notice"
            className="py-8 text-center text-sm text-gray-500 bg-gray-50 rounded border border-dashed border-gray-200"
          >
            No tasks currently assigned to you.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table id="employee-tasks-table" className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50">
                  <th className="py-2.5 px-3">Title</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Team</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {assignedTasks.map((task) => (
                  <tr key={task.id} id={`emp-task-row-${task.id}`} className="hover:bg-gray-50">
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
        )}
      </section>
    </div>
  );
};
