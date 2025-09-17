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
          <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8c1.39 0 2.69.36 3.83 1.01A5.99 5.99 0 0 0 12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.08 0 3.92-1.05 5-2.65A7.94 7.94 0 0 1 12 20z"/>
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