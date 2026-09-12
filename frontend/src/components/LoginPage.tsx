import React, { useState } from 'react';
import { User } from '../types';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedEmail = email.trim().toLowerCase();
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: trimmedEmail, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        
        // Map backend _id to frontend id
        const userObj = {
          id: data._id,
          name: data.name,
          email: data.email,
          role: data.role,
          team: data.team,
        };
        
        onLogin(userObj as any);
      } else {
        setErrorMessage(data.message || 'Invalid email or password. Please check your credentials.');
      }
    } catch (error) {
      setErrorMessage('Failed to connect to the server. Please try again later.');
    }
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
            <div className="relative">
              <input
                id="login-password-input"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500 cursor-pointer"
              >
                {showPassword ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            id="login-submit-button"
            type="submit"
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-4 rounded text-sm cursor-pointer transition-colors"
          >
            Sign in
          </button>
        </form>

      </div>
    </div>
  );
};
