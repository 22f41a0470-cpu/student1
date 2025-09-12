
import { User, UserRole } from '../types';
import { ADMIN_USER } from '../constants';

const USERS_KEY = 'submission_portal_users';
const SESSION_KEY = 'submission_portal_session';

const getStoredUsers = (): User[] => {
  const usersJson = localStorage.getItem(USERS_KEY);
  return usersJson ? JSON.parse(usersJson) : [ADMIN_USER];
};

const storeUsers = (users: User[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
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
  };

  users.push(newUser);
  storeUsers(users);
  return newUser;
};

export const loginUser = (email: string, password: string): User | null => {
  if (email === ADMIN_USER.email && password === ADMIN_USER.password) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(ADMIN_USER));
    return ADMIN_USER;
  }

  const users = getStoredUsers();
  const user = users.find(
    (u) => u.role === UserRole.STUDENT && u.email === email && u.password === password
  );

  if (user) {
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
