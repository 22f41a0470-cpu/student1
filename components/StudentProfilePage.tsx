import React from 'react';
import { User, Submission, SubmissionStatus } from '../types';
import { downloadFile } from '../utils/fileHelper';

interface StudentProfilePageProps {
  student: User;
  submissions: Submission[];
  onBack: () => void;
}

const statusStyles: Record<SubmissionStatus, string> = {
  [SubmissionStatus.PENDING]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  [SubmissionStatus.APPROVED]: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  [SubmissionStatus.REJECTED]: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  [SubmissionStatus.CHANGES_REQUESTED]: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
};

const StudentProfilePage: React.FC<StudentProfilePageProps> = ({ student, submissions, onBack }) => {
  const studentSubmissions = submissions.filter(s => s.student_id === student.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{student.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{student.email}</p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)] dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:ring-offset-gray-800"
        >
          <span className="material-symbols-outlined !text-base">arrow_back</span>
          Back to User List
        </button>
      </div>

      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Submission History</h3>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider dark:text-gray-300">File Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider dark:text-gray-300">Submission Date</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider dark:text-gray-300">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {studentSubmissions.length > 0 ? studentSubmissions.flatMap(sub => {
              const mainRow = (
                <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{sub.file_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{new Date(sub.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[sub.status]}`}>
                      {sub.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => downloadFile(sub.file_path!, sub.file_name!)}
                      disabled={!sub.file_path}
                      className="p-2 text-gray-500 hover:text-[var(--primary-color)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)] rounded-full dark:text-gray-400 dark:hover:text-[var(--primary-color)] dark:ring-offset-gray-800 disabled:text-gray-300 dark:disabled:text-gray-500 disabled:cursor-not-allowed"
                      title={sub.file_path ? "Download" : "File not available"}
                    >
                          <span className="material-symbols-outlined">download</span>
                      </button>
                  </td>
                </tr>
              );

              if ((sub.status === SubmissionStatus.REJECTED || sub.status === SubmissionStatus.CHANGES_REQUESTED) && sub.rejection_reason) {
                const reasonRow = (
                  <tr key={`${sub.id}-reason`}>
                    <td colSpan={4} className={`px-6 py-3 ${sub.status === SubmissionStatus.REJECTED ? 'bg-red-50 dark:bg-red-900/30' : 'bg-orange-50 dark:bg-orange-900/30'}`}>
                      <div className={`text-sm ${sub.status === SubmissionStatus.REJECTED ? 'text-red-800 dark:text-red-200' : 'text-orange-800 dark:text-orange-200'}`}>
                        <p className="font-semibold">{sub.status === SubmissionStatus.REJECTED ? 'Reason for Rejection:' : 'Admin Feedback:'}</p>
                        <p className="mt-1 whitespace-normal">{sub.rejection_reason}</p>
                      </div>
                    </td>
                  </tr>
                );
                return [mainRow, reasonRow];
              }
              
              return [mainRow];
            }) : (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">No submissions found for this student.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentProfilePage;