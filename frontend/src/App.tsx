import { useState, useEffect, useCallback } from 'react';
import { User } from './types';
import { Header } from './components/Header';
import { LoginPage } from './components/LoginPage';
import { AdminPanel } from './components/AdminPanel';
import { ManagerPanel } from './components/ManagerPanel';
import { EmployeePanel } from './components/EmployeePanel';
import { AccessDenied } from './components/AccessDenied';
import {
  apiFetch,
  setAccessToken,
  setOnAuthFailure,
  setOnUserUpdate,
} from './api/client';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState<boolean>(true);
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const path = window.location.pathname;
    if (path === '/admin' || path === '/manager' || path === '/employee' || path === '/login') {
      return path;
    }
    return '/login';
  });

  const navigate = useCallback((path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
  }, []);

  // Sync with browser history
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/admin' || path === '/manager' || path === '/employee' || path === '/login') {
        setCurrentPath(path);
      } else {
        setCurrentPath('/login');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Clear legacy tokens and restore session on app load
  useEffect(() => {
    // Ensure no tokens or roles remain in localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('role');

    // Register auth callbacks
    setOnAuthFailure(() => {
      setAccessToken(null);
      setCurrentUser(null);
      navigate('/login');
    });

    setOnUserUpdate((user: User) => {
      setCurrentUser(user);
    });

    const restoreSession = async () => {
      try {
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setAccessToken(data.accessToken);
          setCurrentUser(data.user);
        } else {
          setAccessToken(null);
          setCurrentUser(null);
        }
      } catch (error) {
        setAccessToken(null);
        setCurrentUser(null);
      } finally {
        setIsSessionLoading(false);
      }
    };

    restoreSession();
  }, [navigate]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    const targetRoute = `/${user.role}`;
    navigate(targetRoute);
  };

  const handleLogout = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAccessToken(null);
      setCurrentUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      navigate('/login');
    }
  };

  // If logged in and on login route, handle automatic redirection
  useEffect(() => {
    if (!isSessionLoading && currentUser && (currentPath === '/login' || currentPath === '/')) {
      navigate(`/${currentUser.role}`);
    }
  }, [isSessionLoading, currentUser, currentPath, navigate]);

  // Loading state while restoring session on app load
  if (isSessionLoading) {
    return (
      <div
        id="session-loading-screen"
        className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4"
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-gray-600">Restoring session...</p>
        </div>
      </div>
    );
  }

  // Render view based on authentication and route
  const renderContent = () => {
    // 1. Not logged in
    if (!currentUser) {
      if (currentPath === '/login' || currentPath === '/') {
        return <LoginPage onLogin={handleLogin} />;
      }
      // Accessing protected route while logged out
      return (
        <AccessDenied
          currentUser={null}
          attemptedPath={currentPath}
          onGoToRolePanel={() => navigate('/login')}
          onLogout={handleLogout}
        />
      );
    }

    // 2. Logged in, navigating to /login
    if (currentPath === '/login' || currentPath === '/') {
      return (
        <div className="py-12 text-center text-sm text-gray-500">
          Redirecting to /{currentUser.role}...
        </div>
      );
    }

    // 3. Admin Route
    if (currentPath === '/admin') {
      if (currentUser.role === 'admin') {
        return <AdminPanel />;
      }
      return (
        <AccessDenied
          currentUser={currentUser}
          attemptedPath={currentPath}
          onGoToRolePanel={() => navigate(`/${currentUser.role}`)}
          onLogout={handleLogout}
        />
      );
    }

    // 4. Manager Route
    if (currentPath === '/manager') {
      if (currentUser.role === 'manager') {
        return <ManagerPanel currentUser={currentUser} />;
      }
      return (
        <AccessDenied
          currentUser={currentUser}
          attemptedPath={currentPath}
          onGoToRolePanel={() => navigate(`/${currentUser.role}`)}
          onLogout={handleLogout}
        />
      );
    }

    // 5. Employee Route
    if (currentPath === '/employee') {
      if (currentUser.role === 'employee') {
        return <EmployeePanel currentUser={currentUser} />;
      }
      return (
        <AccessDenied
          currentUser={currentUser}
          attemptedPath={currentPath}
          onGoToRolePanel={() => navigate(`/${currentUser.role}`)}
          onLogout={handleLogout}
        />
      );
    }

    // Unknown route
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center">
        <h2 className="text-base font-semibold text-gray-900 mb-2">Page Not Found</h2>
        <p className="text-xs text-gray-500 mb-4">The route {currentPath} does not exist.</p>
        <button
          onClick={() => navigate(currentUser ? `/${currentUser.role}` : '/login')}
          className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans antialiased">
      <Header
        currentUser={currentUser}
        currentPath={currentPath}
        onNavigate={navigate}
        onLogout={handleLogout}
      />

      <main className="flex-1 pb-12">{renderContent()}</main>

      <footer className="py-4 border-t border-gray-200 bg-white text-center text-xs text-gray-400">
        WorkSphere &middot; Mock Front-End Shell &middot; Roles: Admin, Manager, Employee
      </footer>
    </div>
  );
}
