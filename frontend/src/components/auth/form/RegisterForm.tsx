import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CreateUserDto } from '@/types';
import { TextInput } from './TextInput';
import { PasswordInput } from './PasswordInput';
import { authAPI } from '@/api/authApi';
import { ErrorMessage } from '../shared/ErrorMassage';
import { LoadingSpinner } from '../shared/LoadingSpinner';

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  country: string;
  agreeToTerms: boolean;
}

interface RegisterError {
  field?: string;
  message: string;
}

interface RegisterFormProps {
  onSuccess: (email: string, userData: CreateUserDto) => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    country: '',
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<RegisterError[]>([]);

  const validateForm = (): boolean => {
    const newErrors: RegisterError[] = [];

    // First name validation
    if (!formData.firstName) {
      newErrors.push({ field: 'firstName', message: 'First name is required' });
    } else if (formData.firstName.length < 2) {
      newErrors.push({
        field: 'firstName',
        message: 'First name must be at least 2 characters',
      });
    }

    // Last name validation
    if (!formData.lastName) {
      newErrors.push({ field: 'lastName', message: 'Last name is required' });
    } else if (formData.lastName.length < 2) {
      newErrors.push({
        field: 'lastName',
        message: 'Last name must be at least 2 characters',
      });
    }

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
    } else if (formData.password.length < 8) {
      newErrors.push({
        field: 'password',
        message: 'Password must be at least 8 characters',
      });
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.push({
        field: 'password',
        message:
          'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      });
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.push({
        field: 'confirmPassword',
        message: 'Please confirm your password',
      });
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.push({
        field: 'confirmPassword',
        message: 'Passwords do not match',
      });
    }

    // Date of birth validation
    if (!formData.dateOfBirth) {
      newErrors.push({
        field: 'dateOfBirth',
        message: 'Date of birth is required',
      });
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      if (age < 13) {
        newErrors.push({
          field: 'dateOfBirth',
          message: 'You must be at least 13 years old',
        });
      }
    }

    // Terms agreement validation
    if (!formData.agreeToTerms) {
      newErrors.push({
        field: 'agreeToTerms',
        message: 'You must agree to the terms and conditions',
      });
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

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

    setIsLoading(true);
    setErrors([]);

    try {
      const createUserDto: CreateUserDto = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        dateOfBirth: formData.dateOfBirth,
        country: formData.country || undefined,
      };

      await authAPI.sendVerificationCode(createUserDto);
      onSuccess(formData.email, createUserDto);
    } catch (error: any) {
      console.error('Registration step 1 error:', error);
      setErrors([
        {
          message:
            error?.response?.data?.message ||
            'Failed to send verification code. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
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
          Create Your Account
        </CardTitle>
        <p className="text-gray-400">
          Join thousands of students improving their IELTS scores
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Error */}
          {getGeneralError() && <ErrorMessage message={getGeneralError()!} />}

          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              label="First Name"
              placeholder="Enter your first name"
              error={getFieldError('firstName')}
              disabled={isLoading}
              required
            />

            <TextInput
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              label="Last Name"
              placeholder="Enter your last name"
              error={getFieldError('lastName')}
              disabled={isLoading}
              required
            />
          </div>

          {/* Email Field */}
          <TextInput
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            label="Email Address"
            placeholder="Enter your email address"
            error={getFieldError('email')}
            disabled={isLoading}
            required
          />

          {/* Password Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PasswordInput
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              label="Password"
              placeholder="Create a password"
              error={getFieldError('password')}
              disabled={isLoading}
              required
            />

            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              label="Confirm Password"
              placeholder="Confirm your password"
              error={getFieldError('confirmPassword')}
              disabled={isLoading}
              required
            />
          </div>

          {/* Personal Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              label="Date of Birth"
              placeholder=""
              error={getFieldError('dateOfBirth')}
              disabled={isLoading}
              required
            />

            <TextInput
              id="country"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              label="Country"
              placeholder="Enter your country"
              error={getFieldError('country')}
              disabled={isLoading}
            />
          </div>

          {/* Terms Agreement */}
          <div className="form-field space-y-2">
            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                className={`mt-1 mr-3 w-4 h-4 text-blue-600 bg-gray-700 border rounded focus:ring-blue-500 focus:ring-2 ${
                  getFieldError('agreeToTerms')
                    ? 'border-red-500'
                    : 'border-gray-600'
                }`}
                disabled={isLoading}
              />
              <span className="text-sm text-gray-300">
                I agree to the{' '}
                <Link
                  to="/terms"
                  className="text-blue-400 hover:text-blue-300"
                  target="_blank"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  to="/privacy"
                  className="text-blue-400 hover:text-blue-300"
                  target="_blank"
                >
                  Privacy Policy
                </Link>
                *
              </span>
            </label>
            {getFieldError('agreeToTerms') && (
              <p className="text-red-400 text-sm flex items-center ml-7">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {getFieldError('agreeToTerms')}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 text-lg font-semibold shadow-lg transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner />
                <span className="ml-2">Sending Verification Code...</span>
              </div>
            ) : (
              'Register'
            )}
          </Button>
        </form>

        {/* Login Link */}
        <div className="text-center mt-6 pt-6 border-t border-gray-700">
          <p className="text-gray-400">
            Already have an account?{' '}
            <Link
              to="/auth/login"
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
