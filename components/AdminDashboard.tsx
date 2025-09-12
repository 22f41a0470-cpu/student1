
import React, { useState, useEffect, useCallback } from 'react';
import { Submission, SubmissionStatus } from '../types';
import { getAllSubmissions, updateSubmissionStatus } from '../services/submissionService';
import { downloadBase64File } from '../utils/fileHelper';
import Modal from './common/Modal';

const statusStyles: Record<SubmissionStatus, string> = {
  [SubmissionStatus.PENDING]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  [SubmissionStatus.APPROVED]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  [SubmissionStatus.REJECTED]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const AdminDashboard: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  const fetchSubmissions = useCallback(() => {
    const allSubmissions = getAllSubmissions();
    setSubmissions(allSubmissions);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleApprove = (submissionId: string) => {
    updateSubmissionStatus(submissionId, SubmissionStatus.APPROVED);
    fetchSubmissions();
  };

  const openRejectModal = (submission: Submission) => {
    setSelectedSubmission(submission);
    setIsModalOpen(true);
  };
  
  const handleReject = () => {
    if (selectedSubmission && rejectionReason) {
      updateSubmissionStatus(selectedSubmission.id, SubmissionStatus.REJECTED, rejectionReason);
      fetchSubmissions();
      closeModal();
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSubmission(null);
    setRejectionReason('');
  };

  if (isLoading) {
    return <div className="text-center p-10 dark:text-white">Loading submissions...</div>;
  }

  return (
    <main className="container mx-auto px-6 py-8">
      <h2 className="text-3xl font-semibold text-gray-800 dark:text-white mb-6">All Submissions</h2>
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">File</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Submitted At</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {submissions.length > 0 ? submissions.map(sub => (
              <tr key={sub.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{sub.studentName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{sub.file.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(sub.submittedAt).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[sub.status]}`}>
                    {sub.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button onClick={() => downloadBase64File(sub.file)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200">Download</button>
                  {sub.status === SubmissionStatus.PENDING && (
                    <>
                      <button onClick={() => handleApprove(sub.id)} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-200">Approve</button>
                      <button onClick={() => openRejectModal(sub)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200">Reject</button>
                    </>
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">No submissions found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal} title="Reason for Rejection">
        <div>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="w-full h-32 p-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Provide a clear reason for rejecting this submission..."
          />
          <div className="mt-4 flex justify-end space-x-2">
            <button onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancel</button>
            <button onClick={handleReject} disabled={!rejectionReason} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-red-300">Confirm Rejection</button>
          </div>
        </div>
      </Modal>
    </main>
  );
};

export default AdminDashboard;
