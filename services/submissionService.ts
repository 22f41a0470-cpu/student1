
import { Submission, SubmissionStatus, StoredFile, User } from '../types';
import { fileToBase64 } from '../utils/fileHelper';

const SUBMISSIONS_KEY = 'submission_portal_submissions';

const getStoredSubmissions = (): Submission[] => {
  const submissionsJson = localStorage.getItem(SUBMISSIONS_KEY);
  return submissionsJson ? JSON.parse(submissionsJson) : [];
};

const storeSubmissions = (submissions: Submission[]) => {
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
};

export const createSubmission = async (student: User, file: File): Promise<Submission> => {
  const base64Content = await fileToBase64(file);
  const storedFile: StoredFile = {
    name: file.name,
    type: file.type,
    content: base64Content,
  };

  const newSubmission: Submission = {
    id: `sub-${Date.now()}`,
    studentId: student.id,
    studentName: student.name,
    file: storedFile,
    status: SubmissionStatus.PENDING,
    submittedAt: new Date().toISOString(),
  };

  const submissions = getStoredSubmissions();
  submissions.push(newSubmission);
  storeSubmissions(submissions);

  return newSubmission;
};

export const getSubmissionForUser = (userId: string): Submission | null => {
  const submissions = getStoredSubmissions();
  return submissions.find((sub) => sub.studentId === userId) || null;
};

export const getAllSubmissions = (): Submission[] => {
  return getStoredSubmissions().sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
};

export const updateSubmissionStatus = (
  submissionId: string,
  status: SubmissionStatus,
  rejectionReason?: string
): Submission | null => {
  const submissions = getStoredSubmissions();
  const submissionIndex = submissions.findIndex((sub) => sub.id === submissionId);

  if (submissionIndex === -1) {
    return null;
  }

  const updatedSubmission = {
    ...submissions[submissionIndex],
    status,
    rejectionReason: status === SubmissionStatus.REJECTED ? rejectionReason : undefined,
  };

  submissions[submissionIndex] = updatedSubmission;
  storeSubmissions(submissions);

  return updatedSubmission;
};
