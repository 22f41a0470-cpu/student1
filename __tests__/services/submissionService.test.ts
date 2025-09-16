import {
  createSubmission,
  getSubmissionForUser,
  getAllSubmissions,
  updateSubmissionStatus,
  deleteSubmissionForUser,
} from '../../services/submissionService';
import { User, UserRole, SubmissionStatus, StoredFile } from '../../types';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock fileToBase64
jest.mock('../../utils/fileHelper', () => ({
  fileToBase64: jest.fn().mockResolvedValue('base64-content'),
}));

const student: User = {
  id: 'student-1',
  name: 'Test Student',
  email: 'student@test.com',
  password: 'password',
  role: UserRole.STUDENT,
  lastLogin: new Date().toISOString(),
};

const file = new File([''], 'test.pdf', { type: 'application/pdf' });

describe('submissionService', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should create a new submission', async () => {
    const submission = await createSubmission(student, file);
    expect(submission).not.toBeNull();
    expect(submission.studentId).toBe(student.id);
    expect(submission.status).toBe(SubmissionStatus.PENDING);

    const storedSubmission = getSubmissionForUser(student.id);
    expect(storedSubmission).toEqual(submission);
  });

  it('should replace an existing submission when a student re-submits', async () => {
    // First submission
    const firstSubmission = await createSubmission(student, file);
    expect(firstSubmission.file.name).toBe('test.pdf');

    const newFile = new File([''], 'new-test.pdf', { type: 'application/pdf' });
    // Second submission
    const secondSubmission = await createSubmission(student, newFile);
    expect(secondSubmission.file.name).toBe('new-test.pdf');

    const submissions = getAllSubmissions();
    expect(submissions.length).toBe(1);
    expect(submissions[0].id).toBe(secondSubmission.id);
  });

  it('should get all submissions', async () => {
    await createSubmission(student, file);
    const submissions = getAllSubmissions();
    expect(submissions.length).toBe(1);
  });

  it('should update a submission status', async () => {
    const submission = await createSubmission(student, file);
    updateSubmissionStatus(submission.id, SubmissionStatus.APPROVED);
    const updatedSubmission = getSubmissionForUser(student.id);
    expect(updatedSubmission?.status).toBe(SubmissionStatus.APPROVED);
  });

  it('should delete a submission for a user', async () => {
    await createSubmission(student, file);
    let submission = getSubmissionForUser(student.id);
    expect(submission).not.toBeNull();

    deleteSubmissionForUser(student.id);
    submission = getSubmissionForUser(student.id);
    expect(submission).toBeNull();
  });
});
