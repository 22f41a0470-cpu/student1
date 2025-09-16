import React, { useState, useEffect, useMemo } from 'react';
import { Submission, SubmissionStatus, User } from '../types';
import { getAllSubmissions, updateSubmissionStatus } from '../services/submissionService';
import { downloadFile } from '../utils/fileHelper';
import Modal from './common/Modal';
import UserManagement from './UserManagement';
import { getAllUsers } from '../services/authService';
import StudentProfilePage from './StudentProfilePage';
import StudentStatusDashboard from './StudentStatusDashboard';


const statusStyles: Record<SubmissionStatus, string> = {
  [SubmissionStatus.PENDING]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  [SubmissionStatus.APPROVED]: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  [SubmissionStatus.REJECTED]: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  [SubmissionStatus.CHANGES_REQUESTED]: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
};

interface AdminDashboardProps {
  user: User;
}

// Define a new type for submissions that includes the student's name
type EnrichedSubmission = Submission & { studentName: string };

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [modalAction, setModalAction] = useState<'reject' | 'request_changes' | null>(null);
  const [submissionSearchQuery, setSubmissionSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | 'ALL'>('ALL');
  const [activeTab, setActiveTab] = useState<'studentStatus' | 'submissions' | 'users'>('studentStatus');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    const [allSubmissions, allUsers] = await Promise.all([
      getAllSubmissions(),
      getAllUsers(),
    ]);
    setSubmissions(allSubmissions);
    setUsers(allUsers);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  useEffect(() => {
    if (activeTab !== 'users') {
      setSelectedStudentId(null);
    }
  }, [activeTab]);

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
  };

  const handleBackToUserList = () => {
    setSelectedStudentId(null);
  };

  const selectedStudent = useMemo(() => {
    if (!selectedStudentId) return null;
    return users.find(u => u.id === selectedStudentId);
  }, [selectedStudentId, users]);

  const handleApprove = async (submissionId: string) => {
    const submissionToApprove = submissions.find(sub => sub.id === submissionId);
    if (!submissionToApprove) {
      console.error("Could not find submission to approve:", submissionId);
      alert("Error: Could not find the submission to approve.");
      return;
    }
    await updateSubmissionStatus(submissionToApprove, SubmissionStatus.APPROVED);
    fetchData();
  };

  const openFeedbackModal = (submission: Submission, action: 'reject' | 'request_changes') => {
    setSelectedSubmission(submission);
    setModalAction(action);
    setIsModalOpen(true);
  };
  
  const handleReject = async () => {
    if (selectedSubmission && feedback) {
      await updateSubmissionStatus(selectedSubmission, SubmissionStatus.REJECTED, feedback);
      fetchData();
      closeModal();
    }
  };

  const handleRequestChanges = async () => {
    if (selectedSubmission && feedback) {
      await updateSubmissionStatus(selectedSubmission, SubmissionStatus.CHANGES_REQUESTED, feedback);
      fetchData();
      closeModal();
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSubmission(null);
    setFeedback('');
    setModalAction(null);
  };

  const enrichedSubmissions = useMemo((): EnrichedSubmission[] => {
    if (!users.length) return [];
    return submissions.map(sub => {
      const student = users.find(u => u.id === sub.student_id);
      return {
        ...sub,
        studentName: student ? student.name : 'Unknown Student'
      };
    });
  }, [submissions, users]);

  const filteredSubmissions = useMemo(() => {
    return enrichedSubmissions.filter(sub => {
      const searchInput = submissionSearchQuery.toLowerCase();
      const matchesSearch = sub.studentName.toLowerCase().includes(searchInput) ||
                            (sub.file_name && sub.file_name.toLowerCase().includes(searchInput));
      const matchesFilter = statusFilter === 'ALL' || sub.status === statusFilter;
      return matchesSearch && matchesFilter;
    });
  }, [enrichedSubmissions, submissionSearchQuery, statusFilter]);

  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      user.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearchQuery.toLowerCase())
    );
  }, [users, userSearchQuery]);

  if (isLoading) {
    return <div className="text-center p-10 dark:text-white">Loading dashboard...</div>;
  }
  
  const FilterButton: React.FC<{status: SubmissionStatus | 'ALL', label: string}> = ({ status, label }) => (
    <button
        onClick={() => setStatusFilter(status)}
        className={`px-4 py-2 text-sm font-medium rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)] dark:ring-offset-gray-900 transition-colors duration-200 ${
            statusFilter === status
            ? 'text-white bg-[var(--primary-color)] border-transparent'
            : 'text-gray-600 bg-gray-100 border-gray-200 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
        }`}
    >
        {label}
    </button>
  );
  
  const TabButton: React.FC<{tabName: 'studentStatus' | 'submissions' | 'users', label: string}> = ({ tabName, label }) => (
     <button
        onClick={() => setActiveTab(tabName)}
        className={`px-4 py-2 text-base font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)] dark:ring-offset-gray-900 transition-colors duration-200 ${
            activeTab === tabName
            ? 'text-white bg-[var(--primary-color)]'
            : 'text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'
        }`}
    >
        {label}
    </button>
  );


  return (
    <main className="flex-1 px-8 md:px-16 lg:px-24 py-10">
      <div className="flex flex-col max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <div className="flex flex-col gap-1">
                <h1 className="text-gray-900 text-3xl font-bold dark:text-gray-100">Admin Dashboard</h1>
                <p className="text-gray-500 text-base dark:text-gray-400">Review submissions and manage users.</p>
            </div>
        </div>

        <div className="mb-8 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <TabButton tabName='studentStatus' label='Student Status' />
            <TabButton tabName='submissions' label='Submissions' />
            <TabButton tabName='users' label='User Management' />
          </div>
        </div>

        {activeTab === 'studentStatus' && (
          <StudentStatusDashboard users={users} submissions={submissions} />
        )}

        {activeTab === 'submissions' && (
          <div>
            <div className="mb-8">
                <label className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 !text-2xl dark:text-gray-500">search</span>
                    <input 
                        className="form-input w-full pl-12 pr-4 py-3.5 text-lg text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent placeholder:text-gray-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder:text-gray-400"
                        placeholder="Search by student name or file..."
                        value={submissionSearchQuery}
                        onChange={(e) => setSubmissionSearchQuery(e.target.value)}
                    />
                </label>
            </div>
            
            <div className="mb-6 flex flex-wrap items-center gap-4">
                <h3 className="text-base font-medium text-gray-700 dark:text-gray-300">Filter by status:</h3>
                <div className="flex items-center gap-2">
                    <FilterButton status="ALL" label="All" />
                    <FilterButton status={SubmissionStatus.PENDING} label="Pending" />
                    <FilterButton status={SubmissionStatus.APPROVED} label="Approved" />
                    <FilterButton status={SubmissionStatus.REJECTED} label="Rejected" />
                    <FilterButton status={SubmissionStatus.CHANGES_REQUESTED} label="Changes Requested" />
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider dark:text-gray-300">Student</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider dark:text-gray-300">File Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider dark:text-gray-300">Submission Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider dark:text-gray-300">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredSubmissions.length > 0 ? filteredSubmissions.map(sub => (
                    <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{sub.studentName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{sub.file_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{new Date(sub.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[sub.status]}`}>
                          {sub.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                            <button
                              onClick={() => downloadFile(sub.file_path!, sub.file_name!)}
                              disabled={!sub.file_path}
                              className="p-2 text-gray-500 hover:text-[var(--primary-color)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)] rounded-full dark:text-gray-400 dark:hover:text-[var(--primary-color)] dark:ring-offset-gray-800 disabled:text-gray-300 dark:disabled:text-gray-500 disabled:cursor-not-allowed"
                              title={sub.file_path ? "Download" : "File not available"}
                            >
                                <span className="material-symbols-outlined">download</span>
                            </button>
                            {sub.status === SubmissionStatus.PENDING && (
                            <>
                                <button onClick={() => handleApprove(sub.id)} className="p-2 text-gray-500 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 rounded-full dark:text-gray-400 dark:hover:text-green-400 dark:ring-offset-gray-800" title="Approve">
                                    <span className="material-symbols-outlined">check_circle</span>
                                </button>
                                <button onClick={() => openFeedbackModal(sub, 'request_changes')} className="p-2 text-gray-500 hover:text-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 rounded-full dark:text-gray-400 dark:hover:text-orange-400 dark:ring-offset-gray-800" title="Request Changes">
                                    <span className="material-symbols-outlined">edit_note</span>
                                </button>
                                <button onClick={() => openFeedbackModal(sub, 'reject')} className="p-2 text-gray-500 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-full dark:text-gray-400 dark:hover:text-red-400 dark:ring-offset-gray-800" title="Reject">
                                    <span className="material-symbols-outlined">cancel</span>
                                </button>
                            </>
                            )}
                        </div>
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
          </div>
        )}
        
        {activeTab === 'users' && (
          selectedStudent ? (
            <StudentProfilePage
              student={selectedStudent}
              submissions={submissions}
              onBack={handleBackToUserList}
            />
          ) : (
            <UserManagement
              users={filteredUsers}
              submissions={submissions}
              onUserDeleted={fetchData}
              currentUser={user}
              onSelectStudent={handleSelectStudent}
              searchQuery={userSearchQuery}
              onSearchChange={setUserSearchQuery}
            />
          )
        )}
      </div>
       <Modal isOpen={isModalOpen} onClose={closeModal} title={modalAction === 'reject' ? "Reason for Rejection" : "Request Changes"}>
        <div>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full h-32 p-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
            placeholder={modalAction === 'reject' ? "Provide a clear reason for rejecting this submission..." : "Provide clear instructions for the required changes..."}
          />
          <div className="mt-4 flex justify-end space-x-2">
            <button onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancel</button>
            {modalAction === 'reject' ? (
                 <button onClick={handleReject} disabled={!feedback} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-red-300">Confirm Rejection</button>
            ) : (
                <button onClick={handleRequestChanges} disabled={!feedback} className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-md hover:bg-[var(--primary-color-hover)] disabled:opacity-50">Submit Request</button>
            )}
          </div>
        </div>
      </Modal>
    </main>
  );
};

export default AdminDashboard;