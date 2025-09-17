import React, { useState, useEffect, useMemo } from 'react';
import { User, Submission, SubmissionStatus } from '../types';
import { getSubmissionsForUser, createSubmission } from '../services/submissionService';
import { formatStatus } from '../utils/statusHelper';
import { getFileIcon } from '../utils/fileIconHelper';

interface StudentDashboardProps {
  user: User;
}

const statusStyles: Record<SubmissionStatus, string> = {
  [SubmissionStatus.PENDING]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  [SubmissionStatus.APPROVED]: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  [SubmissionStatus.REJECTED]: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  [SubmissionStatus.CHANGES_REQUESTED]: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
};

const UploadForm: React.FC<{
  user: User;
  onUploadSuccess: (submission: Submission) => void;
  submissionStatus?: SubmissionStatus | null;
}> = ({ user, onUploadSuccess, submissionStatus }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }
    setIsUploading(true);
    setUploadProgress(0);
    setError('');

    try {
      const handleProgress = (percentage: number) => {
        setUploadProgress(percentage);
      };
      
      const newSubmission = await createSubmission(user, file, handleProgress);
      if (newSubmission) {
        onUploadSuccess(newSubmission);
      } else {
        setError('File upload failed. Please try again.');
      }
    } catch (err) {
      setError('File upload failed. Please try again.');
      console.error(err);
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const getTitle = () => {
    if (submissionStatus === SubmissionStatus.REJECTED || submissionStatus === SubmissionStatus.CHANGES_REQUESTED) {
      return 'Upload a New File';
    }
    return 'Upload Your File';
  };

  const getMessage = () => {
    if (submissionStatus === SubmissionStatus.REJECTED) {
      return "Your previous submission was rejected. Please review the feedback, make the necessary changes, and upload the corrected file.";
    }
    if (submissionStatus === SubmissionStatus.CHANGES_REQUESTED) {
      return "The admin has requested changes. Please review the feedback and upload a revised version of your file.";
    }
    return null;
  };

  const message = getMessage();

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">{getTitle()}</h3>
      {message && (
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          {message}
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="file_input">
            Select file
          </label>
          <input
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
            id="file_input"
            type="file"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        
        {isUploading && (
          <div className="mt-4">
            <div className="flex justify-between mb-1">
              <span className="text-base font-medium text-gray-700 dark:text-white">Uploading file...</span>
              <span className="text-sm font-medium text-gray-700 dark:text-white">{uploadProgress ?? 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div 
                className="bg-[var(--primary-color)] h-2.5 rounded-full transition-all duration-300 ease-linear" 
                style={{ width: `${uploadProgress ?? 0}%` }}
                role="progressbar"
                aria-valuenow={uploadProgress ?? 0}
                aria-valuemin={0}
                aria-valuemax={100}
              ></div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isUploading || !file}
          className="w-full mt-4 px-4 py-2 bg-[var(--primary-color)] text-white rounded-md hover:bg-[var(--primary-color-hover)] disabled:bg-indigo-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)] transition ease-in-out duration-150"
        >
          {isUploading ? `Uploading...` : 'Submit File'}
        </button>
      </form>
    </div>
  );
};

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user }) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const hallTicketNumber = useMemo(() => user.email.split('@')[0].toUpperCase(), [user.email]);

  const stats = useMemo(() => {
    return {
      total: submissions.length,
      approved: submissions.filter(s => s.status === SubmissionStatus.APPROVED).length,
      rejected: submissions.filter(s => s.status === SubmissionStatus.REJECTED || s.status === SubmissionStatus.CHANGES_REQUESTED).length,
    };
  }, [submissions]);
  
  const fetchSubmissions = async () => {
    const subs = await getSubmissionsForUser(user.id);
    setSubmissions(subs);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSubmissions();
  }, [user.id]);

  const handleUploadSuccess = (newSubmission: Submission) => {
    // Re-fetch all submissions to get the most up-to-date list
    fetchSubmissions();
  };

  if (isLoading) {
    return <div className="text-center p-10 dark:text-gray-300">Loading dashboard...</div>;
  }

  const latestSubmission = submissions.length > 0 ? submissions[0] : null;
  const canUploadNewFile = !latestSubmission || latestSubmission.status === SubmissionStatus.REJECTED || latestSubmission.status === SubmissionStatus.CHANGES_REQUESTED;

  return (
    <main className="container mx-auto px-4 sm:px-6 py-8">
       <div className="max-w-7xl mx-auto space-y-8">
            {/* User Details Card */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                        <span className="material-symbols-outlined text-5xl text-[var(--primary-color)]">account_circle</span>
                    </div>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Username</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-200">{user.name}</p>
                        </div>
                         <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Hall Ticket Number</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-200">{hallTicketNumber}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Address</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-200">{user.email}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Mobile Number</p>
                            <p className="text-lg font-semibold text-gray-500 dark:text-gray-400 italic">Not Provided</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 flex items-center">
                    <div className="bg-blue-100 dark:bg-blue-900/50 rounded-full p-3"><span className="material-symbols-outlined text-3xl text-blue-600 dark:text-blue-300">inventory</span></div>
                    <div className="ml-4">
                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
                        <p className="text-gray-500 dark:text-gray-400">Total Files Submitted</p>
                    </div>
                 </div>
                 <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 flex items-center">
                    <div className="bg-green-100 dark:bg-green-900/50 rounded-full p-3"><span className="material-symbols-outlined text-3xl text-green-600 dark:text-green-300">task_alt</span></div>
                    <div className="ml-4">
                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.approved}</p>
                        <p className="text-gray-500 dark:text-gray-400">Files Approved</p>
                    </div>
                 </div>
                 <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 flex items-center">
                    <div className="bg-red-100 dark:bg-red-900/50 rounded-full p-3"><span className="material-symbols-outlined text-3xl text-red-600 dark:text-red-300">highlight_off</span></div>
                    <div className="ml-4">
                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.rejected}</p>
                        <p className="text-gray-500 dark:text-gray-400">Files Rejected</p>
                    </div>
                 </div>
            </div>

            {/* Submission History */}
             <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Submission Details</h3>
                </div>
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">S.No.</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">File Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Submitted Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {submissions.length > 0 ? submissions.flatMap((sub, index) => {
                                const mainRow = (
                                    <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{index + 1}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-300">
                                             <span className="inline-flex items-center gap-2">
                                                <span className="material-symbols-outlined text-lg text-gray-500" aria-hidden="true">
                                                    {getFileIcon(sub.file_name, sub.file_type)}
                                                </span>
                                                <span className="truncate max-w-sm" title={sub.file_name ?? ''}>{sub.file_name}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(sub.created_at).toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[sub.status]}`}>
                                            {formatStatus(sub.status)}
                                            </span>
                                        </td>
                                    </tr>
                                );

                                if ((sub.status === SubmissionStatus.REJECTED || sub.status === SubmissionStatus.CHANGES_REQUESTED) && sub.rejection_reason) {
                                    const reasonRow = (
                                    <tr key={`${sub.id}-reason`}>
                                        <td colSpan={4} className={`px-6 py-3 ${sub.status === SubmissionStatus.REJECTED ? 'bg-red-50 dark:bg-red-900/30' : 'bg-orange-50 dark:bg-orange-900/30'}`}>
                                        <div className={`text-sm ${sub.status === SubmissionStatus.REJECTED ? 'text-red-800 dark:text-red-200' : 'text-orange-800 dark:text-orange-200'}`}>
                                            <p className="font-semibold">{sub.status === SubmissionStatus.REJECTED ? 'Reason for Rejection:' : 'Admin Feedback:'}</p>
                                            <p className="mt-1 whitespace-pre-wrap">{sub.rejection_reason}</p>
                                        </div>
                                        </td>
                                    </tr>
                                    );
                                    return [mainRow, reasonRow];
                                }
                                return [mainRow];
                            }) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">You have not submitted any files yet.</td>
                                </tr>
                            )}
                         </tbody>
                    </table>
                 </div>
            </div>

            {/* Upload Form (conditional) */}
            {canUploadNewFile && (
                <UploadForm
                user={user}
                onUploadSuccess={handleUploadSuccess}
                submissionStatus={latestSubmission?.status}
                />
            )}
       </div>
    </main>
  );
};

export default StudentDashboard;