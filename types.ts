export enum UserRole {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN',
}

export enum SubmissionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Should not be stored long-term, but needed for registration
  role: UserRole;
  lastLogin?: string;
}

export interface StoredFile {
  name: string;
  type: string;
  content: string; // Base64 encoded content
}

export interface Submission {
  id: string;
  studentId: string;
  studentName: string;
  file: StoredFile;
  status: SubmissionStatus;
  submittedAt: string;
  rejectionReason?: string;
}