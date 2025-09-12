
import React, { useState, useEffect } from 'react';
import { User, Submission, SubmissionStatus } from '../types';
import { getSubmissionForUser, createSubmission } from '../services/submissionService';

interface StudentDashboardProps {
  user: User;
}

const statusStyles: Record<SubmissionStatus, string> = {
  [SubmissionStatus.PENDING]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  [SubmissionStatus.APPROVED]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  [SubmissionStatus.REJECTED]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const StatusCard: React.FC<{ submission: Submission }> = ({ submission }) => (
  <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
    <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Your Submission Status</h3>
    <div className="space-y-4">
      <div>
        <span className="font-semibold text-gray-600 dark:text-gray-400">File Name:</span>
        <span className="ml-2 text-gray-800 dark:text-gray-200">{submission.file.name}</span>
      </div>
      <div>
        <span className="font-semibold text-gray-600 dark:text-gray-400">Submitted At:</span>
        <span className="ml-2 text-gray-800 dark:text-gray-200">{new Date(submission.submittedAt).toLocaleString()}</span>
      </div>
      <div className="flex items-center">
        <span className="font-semibold text-gray-600 dark:text-gray-400">Status:</span>
        <span className={`ml-2 px-3 py-1 text-sm font-semibold rounded-full ${statusStyles[submission.status]}`}>
          {submission.status}
        </span>
      </div>
      {submission.status === SubmissionStatus.REJECTED && submission.rejectionReason && (
        <div className="pt-2">
          <p className="font-semibold text-gray-600 dark:text-gray-400">Reason for Rejection:</p>
          <p className="mt-1 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-md text-red-700 dark:text-red-300">{submission.rejectionReason}</p>
        </div>
      )}
    </div>
  </div>
);

const UploadForm: React.FC<{ user: User; onUploadSuccess: (submission: Submission) => void }> = ({ user, onUploadSuccess }) => {
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
      onUploadSuccess(newSubmission);
    } catch (err) {
      setError('File upload failed. Please try again.');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Upload Your File</h3>
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
          className="w-full px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 disabled:bg-indigo-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition ease-in-out duration-150"
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
    const fetchSubmission = () => {
      const sub = getSubmissionForUser(user.id);
      setSubmission(sub);
      setIsLoading(false);
    };
    fetchSubmission();
  }, [user.id]);

  if (isLoading) {
    return <div className="text-center p-10">Loading...</div>;
  }

  return (
    <main className="container mx-auto px-6 py-8">
      {submission ? (
        <StatusCard submission={submission} />
      ) : (
        <UploadForm user={user} onUploadSuccess={setSubmission} />
      )}
    </main>
  );
};

export default StudentDashboard;
