import { User, UserRole } from '../types';
import { ADMIN_USER } from '../constants';
import { deleteSubmissionForUser } from './submissionService';

const USERS_KEY = 'submission_portal_users';
const SESSION_KEY = 'submission_portal_session';

const getStoredUsers = (): User[] => {
  const usersJson = localStorage.getItem(USERS_KEY);
  if (usersJson) {
    return JSON.parse(usersJson);
  }
  // If no users, initialize with admin
  const initialUsers = [ADMIN_USER];
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
  const users = getStoredUsers();
  const existingUser = users.find((user) => user.email === email);
  if (existingUser) {
    alert('User with this email already exists.');
    return null;
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    name,
    email,
    password,
    role: UserRole.STUDENT,
    lastLogin: new Date().toISOString(),
  };

  users.push(newUser);
  storeUsers(users);
  return newUser;
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