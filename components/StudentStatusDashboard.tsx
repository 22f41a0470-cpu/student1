import React, { useMemo, useState } from 'react';
import { User, Submission, SubmissionStatus } from '../types';
import { studentData } from '../constants';

interface StudentStatusDashboardProps {
  users: User[];
  submissions: Submission[];
}

const submissionStatusStyles: Record<SubmissionStatus | 'Not Submitted', string> = {
  [SubmissionStatus.PENDING]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  [SubmissionStatus.APPROVED]: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  [SubmissionStatus.REJECTED]: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  [SubmissionStatus.CHANGES_REQUESTED]: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
  'Not Submitted': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

const loginStatusStyles: Record<'Never' | 'Logged In', string> = {
    'Never': 'text-gray-500 dark:text-gray-400',
    'Logged In': 'text-green-600 dark:text-green-400',
}

const StudentStatusDashboard: React.FC<StudentStatusDashboardProps> = ({ users, submissions }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const enrichedStudentData = useMemo(() => {
    const data = studentData.map(student => {
      const correspondingUser = users.find(u => u.email.toLowerCase().startsWith(student.regNo.toLowerCase()));
      
      let submissionDetails: { status: SubmissionStatus | 'Not Submitted' } = { status: 'Not Submitted' };
      if (correspondingUser) {
        const submission = submissions.find(s => s.student_id === correspondingUser.id);
        if (submission) {
          submissionDetails.status = submission.status;
        }
      }

      return {
        regNo: student.regNo,
        name: student.name,
        loginStatus: correspondingUser?.updated_at ? `Logged in: ${new Date(correspondingUser.updated_at).toLocaleString()}` : 'Never',
        hasLoggedIn: !!correspondingUser?.updated_at,
        submissionStatus: submissionDetails.status,
      };
    });

    if (!searchQuery) {
        return data;
    }

    return data.filter(student => 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.regNo.toLowerCase().includes(searchQuery.toLowerCase())
    );

  }, [users, submissions, searchQuery]);

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg">
       <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <label className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 !text-2xl dark:text-gray-500">search</span>
              <input 
                  className="form-input w-full pl-12 pr-4 py-3 text-base text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent placeholder:text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder:text-gray-400"
                  placeholder="Search by student name or register number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
              />
          </label>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Reg. No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Submission Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Login Status</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {enrichedStudentData.length > 0 ? enrichedStudentData.map((student) => (
              <tr key={student.regNo} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">{student.regNo}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{student.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${submissionStatusStyles[student.submissionStatus]}`}>
                    {typeof student.submissionStatus === 'string' ? student.submissionStatus.replace('_', ' ') : student.submissionStatus}
                  </span>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${loginStatusStyles[student.hasLoggedIn ? 'Logged In' : 'Never']}`}>
                    {student.loginStatus}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">No students found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentStatusDashboard;