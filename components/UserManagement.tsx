import React from 'react';
import { User, UserRole, Submission, SubmissionStatus } from '../types';
import { deleteUser } from '../services/authService';

interface UserManagementProps {
  users: User[];
  submissions: Submission[];
  onUserDeleted: () => void;
  currentUser: User;
  onSelectStudent: (studentId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const roleStyles: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  [UserRole.STUDENT]: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300',
};

const statusStyles: Record<SubmissionStatus, string> = {
  [SubmissionStatus.PENDING]: 'text-yellow-800 dark:text-yellow-300',
  [SubmissionStatus.APPROVED]: 'text-green-800 dark:text-green-300',
  [SubmissionStatus.REJECTED]: 'text-red-800 dark:text-red-300',
};

const UserManagement: React.FC<UserManagementProps> = ({ users, submissions, onUserDeleted, currentUser, onSelectStudent, searchQuery, onSearchChange }) => {

  const handleDelete = async (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to delete the user "${userName}"? This action cannot be undone.`)) {
      const success = await deleteUser(userId);
      if (success) {
        alert('User deleted successfully.');
        onUserDeleted();
      } else {
        alert('Failed to delete user.');
      }
    }
  };

  const getSubmissionStatus = (user: User): React.ReactNode => {
    if (user.role !== UserRole.STUDENT) {
      return <span className="text-gray-400 dark:text-gray-500">—</span>;
    }
    const submission = submissions.find(s => s.student_id === user.id);
    if (!submission) {
      return <span className="text-gray-500 dark:text-gray-400">Not Submitted</span>;
    }
    return <span className={statusStyles[submission.status]}>{submission.status}</span>;
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <label className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 !text-2xl dark:text-gray-500">search</span>
              <input 
                  className="form-input w-full pl-12 pr-4 py-3 text-base text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent placeholder:text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder:text-gray-400"
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
              />
          </label>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">S.No.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Submission Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last Updated</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {users.length > 0 ? users.map((user, index) => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{index + 1}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
                  {user.role === UserRole.STUDENT ? (
                    <button
                      onClick={() => onSelectStudent(user.id)}
                      className="font-medium text-[var(--primary-color)] hover:underline focus:outline-none"
                      aria-label={`View profile for ${user.name}`}
                    >
                      {user.name}
                    </button>
                  ) : (
                    user.name
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${roleStyles[user.role]}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{getSubmissionStatus(user)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {user.updated_at ? new Date(user.updated_at).toLocaleString() : 'Never'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {user.role !== UserRole.ADMIN && (
                      <button
                          onClick={() => handleDelete(user.id, user.name)}
                          disabled={user.id === currentUser.id}
                          className="p-2 text-gray-500 rounded-full hover:bg-red-100 hover:text-red-600 disabled:text-gray-300 disabled:hover:bg-transparent dark:hover:bg-red-900/50 dark:disabled:text-gray-600"
                          aria-label={`Delete ${user.name}`}
                          title={user.id === currentUser.id ? "Cannot delete yourself" : `Delete ${user.name}`}
                      >
                          <span className="material-symbols-outlined">delete</span>
                      </button>
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;