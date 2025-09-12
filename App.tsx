
import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types';
import { getCurrentUser, logoutUser } from './services/authService';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import Header from './components/Header';

type View = 'LOGIN' | 'REGISTER';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<View>('LOGIN');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setAuthView('LOGIN');
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-xl text-gray-700 dark:text-gray-300">Loading Application...</div>
      </div>
    );
  }

  if (!currentUser) {
    return authView === 'LOGIN' ? (
      <LoginPage onLogin={handleLogin} onSwitchToRegister={() => setAuthView('REGISTER')} />
    ) : (
      <RegisterPage onRegister={() => {}} onSwitchToLogin={() => setAuthView('LOGIN')} />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header user={currentUser} onLogout={handleLogout} />
      {currentUser.role === UserRole.ADMIN ? (
        <AdminDashboard />
      ) : (
        <StudentDashboard user={currentUser} />
      )}
    </div>
  );
};

export default App;
