
import React from 'react';
import { User } from '../types';

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Submission Portal
        </h1>
        <div className="flex items-center space-x-4">
           <span className="text-gray-600 dark:text-gray-300">Welcome, {user.name}</span>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition ease-in-out duration-150"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
