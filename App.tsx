import React, { useState, useEffect, useContext } from 'react';
import { User, UserRole } from './types';
import { getCurrentUser, logoutUser } from './services/authService';
import LoginPage from './components/LoginPage';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import Header from './components/Header';
import { ThemeProvider, ThemeContext } from './contexts/ThemeContext';
import { supabase } from './supabaseClient';

const AppContent: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'dark' ? 'light' : 'dark');
    root.classList.add(theme);
  }, [theme]);
  
  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
      setIsLoading(false);
    }
    
    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
       fetchUser();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-xl text-gray-700 dark:text-gray-300">Loading Application...</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <LoginPage onLogin={handleLogin} />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header user={currentUser} onLogout={handleLogout} />
      {currentUser.role === UserRole.ADMIN ? (
        <AdminDashboard user={currentUser} />
      ) : (
        <StudentDashboard user={currentUser} />
      )}
    </div>
  );
};

const App: React.FC = () => (
  <ThemeProvider>
    <AppContent />
  </ThemeProvider>
);

export default App;
