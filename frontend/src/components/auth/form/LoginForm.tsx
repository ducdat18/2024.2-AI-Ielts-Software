import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LoginRequest } from '@/types';
import { TextInput } from './TextInput';
import { PasswordInput } from './PasswordInput';
import { useAuth } from '@/hooks/useAuthApi';
import { ErrorMessage } from '../shared/ErrorMassage';
import { LoadingSpinner } from '../shared/LoadingSpinner';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginError {
  field?: string;
  message: string;
}

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading: isLoggingIn, user } = useAuth();

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState<LoginError[]>([]);

  // Get redirect path from location state or default to appropriate dashboard
  const from = location.state?.from?.pathname || '/learner/dashboard';

  // Handle successful login redirect
  useEffect(() => {
    if (user) {
      const redirectPath =
        user.userRole === 'admin' ? '/admin/dashboard' : from;
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate, from]);

  const validateForm = (): boolean => {
    const newErrors: LoginError[] = [];

    // Email validation
    if (!formData.email) {
      newErrors.push({ field: 'email', message: 'Email is required' });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.push({
        field: 'email',
        message: 'Please enter a valid email address',
      });
    }

    // Password validation
    if (!formData.password) {
      newErrors.push({ field: 'password', message: 'Password is required' });
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear field-specific errors
    if (errors.some((error) => error.field === name)) {
      setErrors((prev) => prev.filter((error) => error.field !== name));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setErrors([]);

    try {
      const loginRequest: LoginRequest = {
        email: formData.email,
        password: formData.password,
      };

      await login(loginRequest);
      // Navigation is handled by useEffect above
    } catch (error: any) {
      console.error('Login error:', error);
      setErrors([
        {
          message:
            error?.response?.data?.message ||
            'Invalid email or password. Please try again.',
        },
      ]);
    }
  };

  const getFieldError = (field: string) => {
    return errors.find((error) => error.field === field)?.message;
  };

  const getGeneralError = () => {
    return errors.find((error) => !error.field)?.message;
  };

  return (
    <Card className="form-container bg-gray-800/80 backdrop-blur-sm border-gray-700 shadow-2xl">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold text-white mb-2">
          Welcome Back
        </CardTitle>
        <p className="text-gray-400">
          Sign in to continue your IELTS preparation
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Error */}
          {getGeneralError() && <ErrorMessage message={getGeneralError()!} />}

          {/* Email Field */}
          <TextInput
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            label="Email Address"
            placeholder="Enter your email"
            error={getFieldError('email')}
            disabled={isLoggingIn}
            required
          />

          {/* Password Field */}
          <PasswordInput
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            label="Password"
            placeholder="Enter your password"
            error={getFieldError('password')}
            disabled={isLoggingIn}
            required
          />

          {/* Remember Me & Forgot Password */}
          <div className="form-field flex items-center justify-between">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                disabled={isLoggingIn}
              />
              <span className="ml-2 text-sm text-gray-300">Remember me</span>
            </label>
            <Link
              to="/auth/forgot-password"
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoggingIn}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 text-lg font-semibold shadow-lg transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 disabled:opacity-50"
          >
            {isLoggingIn ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size="sm" />
                <span className="ml-2">Signing In...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                Sign In
                <svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
              </div>
            )}
          </Button>
        </form>

        {/* Register Link */}
        <div className="text-center mt-6 pt-6 border-t border-gray-700">
          <p className="text-gray-400">
            Don't have an account?{' '}
            <Link
              to="/auth/register"
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Create Account
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
