import React from 'react';
import { User, UserRole } from '../types';
import { deleteUser } from '../services/authService';

interface UserManagementProps {
  users: User[];
  onUserDeleted: () => void;
  currentUser: User;
}

const roleStyles: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  [UserRole.STUDENT]: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300',
};

const UserManagement: React.FC<UserManagementProps> = ({ users, onUserDeleted, currentUser }) => {

  const handleDelete = (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to delete the user "${userName}"? This action cannot be undone.`)) {
      const success = deleteUser(userId);
      if (success) {
        alert('User deleted successfully.');
        onUserDeleted();
      } else {
        alert('Failed to delete user.');
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last Login</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {users.length > 0 ? users.map(user => (
            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">{user.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.email}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${roleStyles[user.role]}`}>
                  {user.role}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => handleDelete(user.id, user.name)}
                  disabled={user.id === currentUser.id}
                  className="p-2 text-gray-500 rounded-full hover:bg-red-100 hover:text-red-600 disabled:text-gray-300 disabled:hover:bg-transparent dark:hover:bg-red-900/50 dark:disabled:text-gray-600"
                  aria-label={`Delete ${user.name}`}
                  title={user.id === currentUser.id ? "Cannot delete yourself" : `Delete ${user.name}`}
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">No users found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;