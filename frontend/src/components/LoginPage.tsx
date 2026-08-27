import React, { useState } from 'react';
import { User } from '../types';

interface LoginPageProps {
  users: User[];
  onLogin: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ users, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedEmail = email.trim().toLowerCase();
    const foundUser = users.find(
      (u) => u.email.toLowerCase() === trimmedEmail && u.password === password
    );

    if (foundUser) {
      onLogin(foundUser);
    } else {
      setErrorMessage('Invalid email or password. Please check your credentials.');
    }
  };

  const handleFillCredentials = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage('');
  };

  return (
    <div id="login-page-container" className="max-w-md mx-auto py-12 px-4">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-xs">
        <div className="mb-6">
          <h1 id="login-heading" className="text-xl font-semibold text-gray-900">
            Sign in to WorkSphere
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Role is automatically resolved from your account.
          </p>
        </div>

        {errorMessage && (
          <div
            id="login-error-message"
            className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded"
          >
            {errorMessage}
          </div>
        )}

        <form id="login-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="login-email-input"
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              Email address
            </label>
            <input
              id="login-email-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@test.com"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
            />
          </div>

          <div>
            <label
              htmlFor="login-password-input"
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="login-password-input"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
            />
          </div>

          <button
            id="login-submit-button"
            type="submit"
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-4 rounded text-sm cursor-pointer transition-colors"
          >
            Sign in
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Demo Accounts for Testing
          </div>
          <div className="space-y-2">
            <div
              id="demo-account-admin"
              onClick={() => handleFillCredentials('admin@test.com', 'password123')}
              className="p-2 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer flex items-center justify-between text-xs transition-colors"
            >
              <div>
                <span className="font-semibold text-gray-900">Admin</span>
                <span className="text-gray-500 ml-2">admin@test.com</span>
              </div>
              <span className="text-gray-400 font-mono text-[11px]">password123</span>
            </div>

            <div
              id="demo-account-manager-eng"
              onClick={() => handleFillCredentials('sarah.manager@test.com', 'password123')}
              className="p-2 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer flex items-center justify-between text-xs transition-colors"
            >
              <div>
                <span className="font-semibold text-gray-900">Manager (Engineering)</span>
                <span className="text-gray-500 ml-2">sarah.manager@test.com</span>
              </div>
              <span className="text-gray-400 font-mono text-[11px]">password123</span>
            </div>

            <div
              id="demo-account-manager-des"
              onClick={() => handleFillCredentials('marcus.manager@test.com', 'password123')}
              className="p-2 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer flex items-center justify-between text-xs transition-colors"
            >
              <div>
                <span className="font-semibold text-gray-900">Manager (Design)</span>
                <span className="text-gray-500 ml-2">marcus.manager@test.com</span>
              </div>
              <span className="text-gray-400 font-mono text-[11px]">password123</span>
            </div>

            <div
              id="demo-account-employee-1"
              onClick={() => handleFillCredentials('alex.emp@test.com', 'password123')}
              className="p-2 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer flex items-center justify-between text-xs transition-colors"
            >
              <div>
                <span className="font-semibold text-gray-900">Employee (Alex R. - Eng)</span>
                <span className="text-gray-500 ml-2">alex.emp@test.com</span>
              </div>
              <span className="text-gray-400 font-mono text-[11px]">password123</span>
            </div>

            <div
              id="demo-account-employee-2"
              onClick={() => handleFillCredentials('jordan.emp@test.com', 'password123')}
              className="p-2 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer flex items-center justify-between text-xs transition-colors"
            >
              <div>
                <span className="font-semibold text-gray-900">Employee (Jordan T. - Design)</span>
                <span className="text-gray-500 ml-2">jordan.emp@test.com</span>
              </div>
              <span className="text-gray-400 font-mono text-[11px]">password123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
