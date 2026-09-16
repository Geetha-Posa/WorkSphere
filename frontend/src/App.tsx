import { useState, useEffect } from 'react';
import { User, Task } from './types';
import { INITIAL_TASKS } from './mockData';
import { Header } from './components/Header';
import { LoginPage } from './components/LoginPage';
import { AdminPanel } from './components/AdminPanel';
import { ManagerPanel } from './components/ManagerPanel';
import { EmployeePanel } from './components/EmployeePanel';
import { AccessDenied } from './components/AccessDenied';

export default function App() {
  const [tasks] = useState<Task[]>(INITIAL_TASKS);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const path = window.location.pathname;
    if (path === '/admin' || path === '/manager' || path === '/employee' || path === '/login') {
      return path;
    }
    return '/login';
  });

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

  const navigate = (path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('user', JSON.stringify(user));
    const targetRoute = `/${user.role}`;
    navigate(targetRoute);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

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
      // Auto-redirect to role panel
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
        return <ManagerPanel currentUser={currentUser} tasks={tasks} />;
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
        return <EmployeePanel currentUser={currentUser} tasks={tasks} />;
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

  // If logged in and on login route, handle automatic redirection
  useEffect(() => {
    if (currentUser && (currentPath === '/login' || currentPath === '/')) {
      navigate(`/${currentUser.role}`);
    }
  }, [currentUser, currentPath]);

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
