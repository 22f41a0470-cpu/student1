import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterPage from '../../components/RegisterPage';
import * as authService from '../../services/authService';
import { User, UserRole } from '../../types';

// Mock the authService
jest.mock('../../services/authService');
const mockedAuthService = authService as jest.Mocked<typeof authService>;

describe('RegisterPage', () => {
  const onRegister = jest.fn();
  const onSwitchToLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the registration form', () => {
    render(<RegisterPage onRegister={onRegister} onSwitchToLogin={onSwitchToLogin} />);
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('should call onRegister with user data on successful registration', async () => {
    const newUser: User = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: UserRole.STUDENT,
      lastLogin: '',
    };
    mockedAuthService.registerUser.mockReturnValue({ user: newUser, error: null });

    render(<RegisterPage onRegister={onRegister} onSwitchToLogin={onSwitchToLogin} />);

    await userEvent.type(screen.getByLabelText(/full name/i), 'Test User');
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    expect(mockedAuthService.registerUser).toHaveBeenCalledWith(
      'Test User',
      'test@example.com',
      'password123'
    );
    expect(onRegister).toHaveBeenCalledWith(newUser);
    expect(onSwitchToLogin).not.toHaveBeenCalled();
  });

  it('should display an error message on failed registration', async () => {
    mockedAuthService.registerUser.mockReturnValue({
      user: null,
      error: 'Email already exists',
    });

    render(<RegisterPage onRegister={onRegister} onSwitchToLogin={onSwitchToLogin} />);

    await userEvent.type(screen.getByLabelText(/full name/i), 'Test User');
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    expect(mockedAuthService.registerUser).toHaveBeenCalled();
    expect(onRegister).not.toHaveBeenCalled();
    expect(screen.getByText('Email already exists')).toBeInTheDocument();
  });

  it('should call onSwitchToLogin when the login button is clicked', () => {
    render(<RegisterPage onRegister={onRegister} onSwitchToLogin={onSwitchToLogin} />);
    fireEvent.click(screen.getByText(/login here/i));
    expect(onSwitchToLogin).toHaveBeenCalled();
  });
});
