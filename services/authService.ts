import { User, UserRole } from '../types';
import { ADMIN_USER, studentData } from '../constants';
import { deleteSubmissionForUser } from './submissionService';

const USERS_KEY = 'submission_portal_users';
const SESSION_KEY = 'submission_portal_session';

const getStoredUsers = (): User[] => {
  const usersJson = localStorage.getItem(USERS_KEY);
  if (usersJson) {
    return JSON.parse(usersJson);
  }
  // If no users, initialize with admin and pre-populated students
  const initialStudents: User[] = studentData.map(student => ({
    id: `student-${student.regNo}`,
    name: student.name,
    email: student.regNo, // Use regNo as email for login
    password: student.regNo, // Use regNo as password
    role: UserRole.STUDENT,
  }));

  const initialUsers = [ADMIN_USER, ...initialStudents];
  localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers));
  return initialUsers;
};

const storeUsers = (users: User[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const getAllUsers = (): User[] => {
  return getStoredUsers();
};

export const registerUser = (name: string, email: string, password: string): User | null => {
  // Registration is disabled now that students are pre-populated.
  alert('Student registration is currently disabled.');
  return null;
};

export const loginUser = (email: string, password: string): User | null => {
  const users = getStoredUsers();
  const userIndex = users.findIndex(
    (u) => u.email === email && u.password === password
  );

  if (userIndex !== -1) {
    const user = users[userIndex];
    user.lastLogin = new Date().toISOString();
    users[userIndex] = user;
    storeUsers(users);
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  }

  return null;
};

export const logoutUser = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const getCurrentUser = (): User | null => {
  const sessionJson = localStorage.getItem(SESSION_KEY);
  return sessionJson ? JSON.parse(sessionJson) : null;
};

export const deleteUser = (userId: string): boolean => {
  let users = getStoredUsers();
  const userToDelete = users.find(u => u.id === userId);

  if (!userToDelete) return false;

  // Also delete their submission if they are a student
  if (userToDelete.role === UserRole.STUDENT) {
    deleteSubmissionForUser(userId);
  }
  
  const updatedUsers = users.filter((user) => user.id !== userId);
  storeUsers(updatedUsers);
  return true;
};
