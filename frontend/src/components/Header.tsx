import React from 'react';
import { User } from '../types';

interface HeaderProps {
  currentUser: User | null;
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  currentPath,
  onNavigate,
  onLogout,
}) => {
  return (
    <header id="app-header" className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <button
            id="nav-brand-button"
            onClick={() => {
              if (currentUser) {
                onNavigate(`/${currentUser.role}`);
              } else {
                onNavigate('/login');
              }
            }}
            className="text-lg font-semibold text-gray-900 tracking-tight hover:text-gray-700 cursor-pointer"
          >
            WorkSphere
          </button>
          {currentUser && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200">
                {currentPath}
              </span>
            </div>
          )}
        </div>

        {currentUser ? (
          <div className="flex items-center gap-4">
            <div className="text-right text-xs">
              <div className="font-medium text-gray-900">{currentUser.name}</div>
              <div className="text-gray-500">
                <span className="capitalize font-semibold text-gray-700">{currentUser.role}</span>
                {' · '}
                <span>{currentUser.team}</span>
              </div>
            </div>
            <button
              id="logout-button"
              onClick={onLogout}
              className="text-xs text-gray-600 hover:text-gray-900 border border-gray-300 hover:border-gray-400 bg-white px-3 py-1.5 rounded cursor-pointer transition-colors"
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="text-xs text-gray-500 font-medium">Task Assignment System</div>
        )}
      </div>
    </header>
  );
};
