import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import StudentDashboard from '../../components/StudentDashboard';
import * as submissionService from '../../services/submissionService';
import { User, UserRole, Submission, SubmissionStatus, StoredFile } from '../../types';

// Mock the submissionService
jest.mock('../../services/submissionService');
const mockedSubmissionService = submissionService as jest.Mocked<typeof submissionService>;

const user: User = {
    id: 'student-1',
    name: 'Test Student',
    email: 'student@test.com',
    password: 'password',
    role: UserRole.STUDENT,
    lastLogin: '',
};

const mockSubmission = (status: SubmissionStatus): Submission => ({
    id: 'sub-1',
    studentId: user.id,
    studentName: user.name,
    file: { name: 'test.pdf', type: 'application/pdf', content: '' },
    status,
    submittedAt: new Date().toISOString(),
    rejectionReason: status === SubmissionStatus.REJECTED ? 'File is not a PDF.' : undefined,
});

describe('StudentDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show the upload form when there is no submission', () => {
    mockedSubmissionService.getSubmissionForUser.mockReturnValue(null);
    render(<StudentDashboard user={user} />);

    expect(screen.getByText('Upload Your File')).toBeInTheDocument();
  });

  it('should show the status and the upload form when a submission is rejected', async () => {
    const rejectedSubmission = mockSubmission(SubmissionStatus.REJECTED);
    mockedSubmissionService.getSubmissionForUser.mockReturnValue(rejectedSubmission);
    render(<StudentDashboard user={user} />);

    // Status card is shown
    expect(screen.getByText('Your Submission Status')).toBeInTheDocument();
    expect(screen.getByText(SubmissionStatus.REJECTED)).toBeInTheDocument();
    expect(screen.getByText('Reason for Rejection:')).toBeInTheDocument();

    // Upload form is also shown
    expect(screen.getByText('Upload Your File')).toBeInTheDocument();
  });

  it('should show the status and a message when a submission is pending', async () => {
    const pendingSubmission = mockSubmission(SubmissionStatus.PENDING);
    mockedSubmissionService.getSubmissionForUser.mockReturnValue(pendingSubmission);
    render(<StudentDashboard user={user} />);

    // Status card is shown
    expect(screen.getByText('Your Submission Status')).toBeInTheDocument();
    expect(screen.getByText(SubmissionStatus.PENDING)).toBeInTheDocument();

    // Upload form is NOT shown
    expect(screen.queryByText('Upload Your File')).not.toBeInTheDocument();

    // Message is shown
    expect(screen.getByText('You cannot submit a new file while your current submission is pending or approved.')).toBeInTheDocument();
  });

  it('should show the status and a message when a submission is approved', async () => {
    const approvedSubmission = mockSubmission(SubmissionStatus.APPROVED);
    mockedSubmissionService.getSubmissionForUser.mockReturnValue(approvedSubmission);
    render(<StudentDashboard user={user} />);

    // Status card is shown
    expect(screen.getByText('Your Submission Status')).toBeInTheDocument();
    expect(screen.getByText(SubmissionStatus.APPROVED)).toBeInTheDocument();

    // Upload form is NOT shown
    expect(screen.queryByText('Upload Your File')).not.toBeInTheDocument();

    // Message is shown
    expect(screen.getByText('You cannot submit a new file while your current submission is pending or approved.')).toBeInTheDocument();
  });
});
