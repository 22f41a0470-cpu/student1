import React, { useContext } from 'react';
import { User } from '../types';
import { ThemeContext } from '../contexts/ThemeContext';

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 bg-white px-6 py-4 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center gap-4 text-gray-800">
        <div className="size-8 text-[var(--primary-color)]">
          <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z"></path>
          </svg>
        </div>
        <h2 className="text-gray-900 text-xl font-bold leading-tight tracking-[-0.015em] dark:text-gray-100">
          File Submission System
        </h2>
      </div>

      <div className="flex flex-1 justify-end gap-4 items-center">
        {/* Placeholder Nav */}
        <nav className="hidden md:flex items-center gap-2">
           <a className="text-gray-600 hover:text-gray-900 text-sm font-medium leading-normal px-3 py-2 rounded-md dark:text-gray-300 dark:hover:text-white" href="#">Dashboard</a>
           <a className="text-gray-600 hover:text-gray-900 text-sm font-medium leading-normal px-3 py-2 rounded-md dark:text-gray-300 dark:hover:text-white" href="#">Submissions</a>
           <a className="text-gray-600 hover:text-gray-900 text-sm font-medium leading-normal px-3 py-2 rounded-md dark:text-gray-300 dark:hover:text-white" href="#">Users</a>
           <a className="text-gray-600 hover:text-gray-900 text-sm font-medium leading-normal px-3 py-2 rounded-md dark:text-gray-300 dark:hover:text-white" href="#">Settings</a>
        </nav>
        <div className="hidden md:block w-px h-6 bg-gray-200 dark:bg-gray-600"></div>

        <div className="flex items-center gap-2">
          <button className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)] dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:ring-offset-gray-800">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>
          <button onClick={toggleTheme} className="p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)] dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:ring-offset-gray-800">
            {theme === 'dark' ? (
                <span className="material-symbols-outlined">light_mode</span>
            ) : (
                <span className="material-symbols-outlined">dark_mode</span>
            )}
          </button>
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-600"></div>
          <span className="text-gray-600 dark:text-gray-300 hidden sm:block font-medium">{user.name}</span>
           <button
            onClick={onLogout}
            className="p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)] dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:ring-offset-gray-800"
            title="Logout"
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
