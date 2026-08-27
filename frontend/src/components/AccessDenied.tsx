import React from 'react';
import { User } from '../types';

interface AccessDeniedProps {
  currentUser: User | null;
  attemptedPath: string;
  onGoToRolePanel: () => void;
  onLogout: () => void;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  currentUser,
  attemptedPath,
  onGoToRolePanel,
  onLogout,
}) => {
  return (
    <div id="access-denied-container" className="max-w-md mx-auto py-16 px-4">
      <div className="bg-white border border-gray-200 rounded-lg p-6 text-center space-y-4">
        <div className="text-red-600 font-semibold text-lg" id="access-denied-title">
          Access Denied
        </div>
        <p className="text-sm text-gray-600">
          You do not have permission to access <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">{attemptedPath}</code>.
        </p>

        {currentUser && (
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded border border-gray-200 text-left space-y-1">
            <div><span className="font-medium text-gray-700">Logged in as:</span> {currentUser.name}</div>
            <div><span className="font-medium text-gray-700">Account role:</span> <span className="capitalize font-semibold text-gray-900">{currentUser.role}</span></div>
            <div><span className="font-medium text-gray-700">Required role:</span> <span className="capitalize font-semibold text-gray-900">{attemptedPath.replace('/', '')}</span></div>
          </div>
        )}

        <div className="flex items-center justify-center gap-3 pt-2">
          {currentUser ? (
            <button
              id="return-to-authorized-panel-button"
              onClick={onGoToRolePanel}
              className="bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-4 rounded text-xs cursor-pointer transition-colors"
            >
              Go to my /{currentUser.role} panel
            </button>
          ) : (
            <button
              id="login-redirect-button"
              onClick={onLogout}
              className="bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-4 rounded text-xs cursor-pointer transition-colors"
            >
              Sign in
            </button>
          )}

          {currentUser && (
            <button
              id="access-denied-logout-button"
              onClick={onLogout}
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded text-xs cursor-pointer transition-colors"
            >
              Sign out
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
