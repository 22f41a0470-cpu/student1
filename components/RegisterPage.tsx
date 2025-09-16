import React, { useState } from 'react';
import { registerUser } from '../services/authService';
import { User } from '../types';

interface RegisterPageProps {
  onRegister: (user: User) => void;
  onSwitchToLogin: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const user = await registerUser(name, email, password);
    if (user) {
      setIsSuccess(true);
      // Supabase might require email confirmation.
      // For now, we'll let the user know to check their email and then switch to login.
      setTimeout(() => {
          onSwitchToLogin();
      }, 3000)
    } else {
      setError('Registration failed. The email might already be in use.');
    }
    setIsLoading(false);
  };

  if(isSuccess) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 text-center">
                <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-4">Registration Successful!</h2>
                <p className="text-gray-700 dark:text-gray-300">
                    Please check your email for a confirmation link if required. You will be redirected to the login page shortly.
                </p>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-8">Register</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
           <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] dark:bg-gray-700 dark:text-white dark:border-gray-600"
              required
              autoComplete="name"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] dark:bg-gray-700 dark:text-white dark:border-gray-600"
              required
              autoComplete="email"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] dark:bg-gray-700 dark:text-white dark:border-gray-600"
              required
              autoComplete="new-password"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[var(--primary-color)] text-white py-2 px-4 rounded-md hover:bg-[var(--primary-color-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)] transition duration-300 disabled:opacity-50"
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="text-center mt-4 text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <button onClick={onSwitchToLogin} className="text-[var(--primary-color)] hover:underline font-medium">
            Login here
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
