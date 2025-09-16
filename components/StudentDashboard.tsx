import React, { useState, useEffect } from 'react';
import { User, Submission, SubmissionStatus } from '../types';
import { getSubmissionForUser, createSubmission } from '../services/submissionService';

interface StudentDashboardProps {
  user: User;
}

const statusStyles: Record<SubmissionStatus, string> = {
  [SubmissionStatus.PENDING]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  [SubmissionStatus.APPROVED]: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  [SubmissionStatus.REJECTED]: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  [SubmissionStatus.CHANGES_REQUESTED]: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
};

const StatusCard: React.FC<{ submission: Submission }> = ({ submission }) => (
  <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
    <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Your Submission Status</h3>
    <div className="space-y-4">
      <div>
        <span className="font-semibold text-gray-600 dark:text-gray-400">File Name:</span>
        <span className="ml-2 text-gray-800 dark:text-gray-200">{submission.file_name}</span>
      </div>
      <div>
        <span className="font-semibold text-gray-600 dark:text-gray-400">Submitted At:</span>
        <span className="ml-2 text-gray-800 dark:text-gray-200">{new Date(submission.created_at).toLocaleString()}</span>
      </div>
      <div className="flex items-center">
        <span className="font-semibold text-gray-600 dark:text-gray-400">Status:</span>
        <span className={`ml-2 px-3 py-1 text-sm font-semibold rounded-full ${statusStyles[submission.status]}`}>
          {submission.status.replace('_', ' ')}
        </span>
      </div>
      {(submission.status === SubmissionStatus.REJECTED || submission.status === SubmissionStatus.CHANGES_REQUESTED) && submission.rejection_reason && (
        <div className="pt-2">
          <p className="font-semibold text-gray-600 dark:text-gray-400">
            {submission.status === SubmissionStatus.REJECTED ? 'Reason for Rejection:' : 'Admin Feedback:'}
          </p>
          <p className={`mt-1 p-3 rounded-md text-sm ${submission.status === SubmissionStatus.REJECTED ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300' : 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-500/30 text-orange-700 dark:text-orange-300'}`}>
            {submission.rejection_reason}
          </p>
        </div>
      )}
    </div>
  </div>
);

const UploadForm: React.FC<{
  user: User;
  onUploadSuccess: (submission: Submission) => void;
  submissionStatus?: SubmissionStatus | null;
}> = ({ user, onUploadSuccess, submissionStatus }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

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
    try {
      const newSubmission = await createSubmission(user, file);
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
      return "Your previous submission was rejected. Please review the feedback above, make the necessary changes, and upload the corrected file.";
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
          />
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <button
          type="submit"
          disabled={isUploading || !file}
          className="w-full px-4 py-2 bg-[var(--primary-color)] text-white rounded-md hover:bg-[var(--primary-color-hover)] disabled:bg-indigo-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)] transition ease-in-out duration-150"
        >
          {isUploading ? 'Uploading...' : 'Submit File'}
        </button>
      </form>
    </div>
  );
};

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user }) => {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubmission = async () => {
      const sub = await getSubmissionForUser(user.id);
      setSubmission(sub);
      setIsLoading(false);
    };
    fetchSubmission();
  }, [user.id]);

  if (isLoading) {
    return <div className="text-center p-10 dark:text-gray-300">Loading...</div>;
  }

  const canUploadNewFile = !submission || submission.status === SubmissionStatus.REJECTED || submission.status === SubmissionStatus.CHANGES_REQUESTED;

  return (
    <main className="container mx-auto px-6 py-8">
       <div className="max-w-4xl mx-auto space-y-8">
          {submission && (
            <StatusCard submission={submission} />
          )}
          {canUploadNewFile && (
            <UploadForm
              user={user}
              onUploadSuccess={setSubmission}
              submissionStatus={submission?.status}
            />
          )}
       </div>
    </main>
  );
};

export default StudentDashboard;