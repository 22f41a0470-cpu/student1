import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  deleteUser,
  getAllUsers,
} from '../../services/authService';
import { UserRole } from '../../types';
import { ADMIN_USER } from '../../constants';

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

describe('authService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    // Initialize with admin user
    localStorageMock.setItem('submission_portal_users', JSON.stringify([ADMIN_USER]));
  });

  it('should register a new user successfully', () => {
    const result = registerUser('Test User', 'test@example.com', 'password123');
    expect(result.user).not.toBeNull();
    expect(result.user?.email).toBe('test@example.com');
    expect(result.user?.role).toBe(UserRole.STUDENT);
    expect(result.error).toBeNull();

    const users = getAllUsers();
    expect(users.length).toBe(2);
  });

  it('should not register a user with an existing email', () => {
    registerUser('Test User', 'test@example.com', 'password123');
    const result = registerUser('Another User', 'test@example.com', 'password456');
    expect(result.user).toBeNull();
    expect(result.error).toBe('User with this email already exists.');

    const users = getAllUsers();
    expect(users.length).toBe(2);
  });

  it('should log in a user with correct credentials', () => {
    registerUser('Test User', 'test@example.com', 'password123');
    const user = loginUser('test@example.com', 'password123');
    expect(user).not.toBeNull();
    expect(user?.email).toBe('test@example.com');
  });

  it('should not log in a user with incorrect password', () => {
    registerUser('Test User', 'test@example.com', 'password123');
    const user = loginUser('test@example.com', 'wrongpassword');
    expect(user).toBeNull();
  });

  it('should not log in a non-existent user', () => {
    const user = loginUser('nouser@example.com', 'password123');
    expect(user).toBeNull();
  });

  it('should set the current user in session on login', () => {
    registerUser('Test User', 'test@example.com', 'password123');
    loginUser('test@example.com', 'password123');
    const currentUser = getCurrentUser();
    expect(currentUser).not.toBeNull();
    expect(currentUser?.email).toBe('test@example.com');
  });

  it('should log out a user', () => {
    registerUser('Test User', 'test@example.com', 'password123');
    loginUser('test@example.com', 'password123');

    logoutUser();
    const currentUser = getCurrentUser();
    expect(currentUser).toBeNull();
  });

  it('should delete a user', () => {
    const newUser = registerUser('Test User', 'test@example.com', 'password123').user;
    expect(newUser).not.toBeNull();

    if(newUser) {
        const result = deleteUser(newUser.id);
        expect(result).toBe(true);
        const users = getAllUsers();
        expect(users.length).toBe(1); // Only admin user should remain
        expect(users.find(u => u.id === newUser.id)).toBeUndefined();
    }
  });

  it('should not delete a non-existent user', () => {
    const result = deleteUser('non-existent-id');
    expect(result).toBe(false);
  });
});
