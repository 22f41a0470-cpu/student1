import React, { useState, useEffect, useMemo } from 'react';
import { Submission, SubmissionStatus, User, EnrichedSubmission } from '../types';
import { getAllSubmissions, updateSubmissionStatus } from '../services/submissionService';
import { downloadFile } from '../utils/fileHelper';
import Modal from './common/Modal';
import UserManagement from './UserManagement';
import { getAllUsers } from '../services/authService';
import StudentProfilePage from './StudentProfilePage';
import StudentStatusDashboard from './StudentStatusDashboard';
import { formatStatus } from '../utils/statusHelper';
import FileViewerModal from './common/FileViewerModal';
import { getFileIcon } from '../utils/fileIconHelper';


const statusStyles: Record<SubmissionStatus, string> = {
  [SubmissionStatus.PENDING]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  [SubmissionStatus.APPROVED]: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  [SubmissionStatus.REJECTED]: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  [SubmissionStatus.CHANGES_REQUESTED]: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
};

interface AdminDashboardProps {
  user: User;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [submissionSearchQuery, setSubmissionSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | 'ALL'>('ALL');
  const [activeTab, setActiveTab] = useState<'studentStatus' | 'submissions' | 'users'>('studentStatus');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [viewingSubmission, setViewingSubmission] = useState<EnrichedSubmission | null>(null);


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

  const openRejectModal = (submission: Submission) => {
    setSelectedSubmission(submission);
    setIsRejectModalOpen(true);
  };
  
  const handleReject = async () => {
    if (selectedSubmission && feedback) {
      await updateSubmissionStatus(selectedSubmission, SubmissionStatus.REJECTED, feedback);
      fetchData();
      closeModal();
    }
  };

  const closeModal = () => {
    setIsRejectModalOpen(false);
    setSelectedSubmission(null);
    setFeedback('');
  };

  const enrichedSubmissions = useMemo((): EnrichedSubmission[] => {
    if (!users.length) return [];
    
    const userMap = new Map<string, string>(users.map(u => [u.id, u.name]));

    return submissions
      .map(sub => ({
        ...sub,
        studentName: userMap.get(sub.student_id) || 'Unknown Student',
      }))
      .filter(sub => {
        const matchesQuery =
          submissionSearchQuery === '' ||
          sub.studentName.toLowerCase().includes(submissionSearchQuery.toLowerCase()) ||
          sub.file_name?.toLowerCase().includes(submissionSearchQuery.toLowerCase());
        
        const matchesStatus =
          statusFilter === 'ALL' ||
          sub.status === statusFilter;

        return matchesQuery && matchesStatus;
      });
  }, [submissions, users, submissionSearchQuery, statusFilter]);

  const filteredUsers = useMemo(() => {
    if (!userSearchQuery) return users;
    return users.filter(user => 
      user.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearchQuery.toLowerCase())
    );
  }, [users, userSearchQuery]);

  const statusFilterOptions = [
    { value: 'ALL', label: 'All Statuses' },
    ...Object.values(SubmissionStatus).map(status => ({
        value: status,
        label: formatStatus(status),
    }))
  ];
  
  const handleViewSubmission = (submission: EnrichedSubmission) => {
      setViewingSubmission(submission);
  };

  const handleCloseViewer = () => {
      setViewingSubmission(null);
  };

  const handleViewerApprove = (submissionId: string) => {
      handleApprove(submissionId);
      handleCloseViewer();
  };

  const handleViewerReject = (submission: Submission) => {
      openRejectModal(submission);
      handleCloseViewer();
  }

  const renderContent = () => {
    if (isLoading) {
      return <div className="text-center p-10 dark:text-gray-300">Loading...</div>;
    }

    if (activeTab === 'users' && selectedStudent) {
      return <StudentProfilePage student={selectedStudent} submissions={submissions} onBack={handleBackToUserList} />;
    }

    switch (activeTab) {
      case 'studentStatus':
        return <StudentStatusDashboard users={users} submissions={submissions} />;
      case 'submissions':
        return (
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4">
               <label className="relative flex-grow">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 !text-2xl dark:text-gray-500">search</span>
                  <input 
                      className="form-input w-full pl-12 pr-4 py-3 text-base text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent placeholder:text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder:text-gray-400"
                      placeholder="Search by student name or file name..."
                      value={submissionSearchQuery}
                      onChange={(e) => setSubmissionSearchQuery(e.target.value)}
                  />
              </label>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as SubmissionStatus | 'ALL')}
                className="form-select pl-4 pr-10 py-3 text-base text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              >
                  {statusFilterOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">File Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Submitted At</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {enrichedSubmissions.length > 0 ? enrichedSubmissions.map(sub => (
                    <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">{sub.studentName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                         <button 
                            onClick={() => handleViewSubmission(sub)}
                            className="inline-flex items-center gap-2 text-left hover:text-[var(--primary-color)] dark:hover:text-[var(--primary-color)]"
                         >
                            <span className="material-symbols-outlined text-lg text-gray-500" aria-hidden="true">
                                {getFileIcon(sub.file_name, sub.file_type)}
                            </span>
                            <span className="truncate max-w-sm" title={sub.file_name ?? ''}>{sub.file_name}</span>
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(sub.created_at).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[sub.status]}`}>
                          {formatStatus(sub.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                         {sub.status === SubmissionStatus.PENDING && (
                            <>
                                <button
                                    onClick={() => openRejectModal(sub)}
                                    className="p-2 text-gray-500 rounded-full hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/50"
                                    title="Reject"
                                >
                                    <span className="material-symbols-outlined !text-base">cancel</span>
                                </button>
                                <button
                                    onClick={() => handleApprove(sub.id)}
                                    className="p-2 text-gray-500 rounded-full hover:bg-green-100 hover:text-green-600 dark:hover:bg-green-900/50"
                                    title="Approve"
                                >
                                    <span className="material-symbols-outlined !text-base">check_circle</span>
                                </button>
                            </>
                        )}
                        <button
                            onClick={() => downloadFile(sub.file_path!, sub.file_name!)}
                            disabled={!sub.file_path}
                            className="p-2 text-gray-500 rounded-full hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/50 disabled:text-gray-300 dark:disabled:text-gray-600"
                            title={sub.file_path ? "Download" : "File not available"}
                        >
                            <span className="material-symbols-outlined !text-base">download</span>
                        </button>
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
        );
      case 'users':
        return (
          <UserManagement 
            users={filteredUsers} 
            submissions={submissions}
            onUserDeleted={fetchData}
            currentUser={user}
            onSelectStudent={handleSelectStudent}
            searchQuery={userSearchQuery}
            onSearchChange={setUserSearchQuery}
          />
        );
      default:
        return null;
    }
  };

  const tabs = [
    { id: 'studentStatus', label: 'Student Status', icon: 'monitoring' },
    { id: 'submissions', label: 'Submissions', icon: 'folder_managed' },
    { id: 'users', label: 'User Management', icon: 'group' },
  ];

  return (
    <main className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Admin Dashboard</h1>
      
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`${
                activeTab === tab.id
                  ? 'border-[var(--primary-color)] text-[var(--primary-color)]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'
              } group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ease-in-out`}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              <span className="material-symbols-outlined !text-xl mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {renderContent()}

      <Modal isOpen={isRejectModalOpen} onClose={closeModal} title="Reject Submission">
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Please provide a reason for rejecting this submission. The student will see this feedback.
          </p>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] dark:bg-gray-700 dark:text-white dark:border-gray-600"
            placeholder="e.g., 'Missing required sections, please review the guidelines and resubmit.'"
          />
          <div className="flex justify-end gap-3">
            <button onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancel</button>
            <button onClick={handleReject} disabled={!feedback} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-300">Reject</button>
          </div>
        </div>
      </Modal>

      <FileViewerModal 
        submission={viewingSubmission}
        onClose={handleCloseViewer}
        onApprove={handleViewerApprove}
        onReject={handleViewerReject}
      />
    </main>
  );
};

export default AdminDashboard;
