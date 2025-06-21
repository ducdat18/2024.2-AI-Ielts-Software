import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { authAPI } from '@/api/authApi';
import type { CreateUserDto, VerificationRequestDto } from '@/types';
import { ErrorMessage } from '../shared/ErrorMassage';
import { LoadingSpinner } from '../shared/LoadingSpinner';

interface VerificationFormProps {
  email: string;
  onBack: () => void;
  registrationData: CreateUserDto;
}

export const VerificationForm: React.FC<VerificationFormProps> = ({
  email,
  onBack,
  registrationData,
}) => {
  const navigate = useNavigate();
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ message: string; field?: string }[]>(
    []
  );

  const validateVerificationCode = (): boolean => {
    if (!verificationCode || verificationCode.length !== 6) {
      setErrors([
        {
          field: 'verificationCode',
          message: 'Please enter the 6-digit verification code',
        },
      ]);
      return false;
    }
    setErrors([]);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateVerificationCode()) {
      return;
    }

    setIsLoading(true);
    setErrors([]);

    try {
      const verificationRequest: VerificationRequestDto = {
        email: email,
        verificationCode: verificationCode,
      };

      const user = await authAPI.verifyAndRegister(verificationRequest);

      // Store auth data
      localStorage.setItem('authToken', 'mock-jwt-token');
      localStorage.setItem('userRole', user.userRole);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userName', `${user.firstName} ${user.lastName}`);

      // Redirect to learner dashboard
      navigate('/learner/dashboard');
    } catch (error: any) {
      console.error('Registration verification error:', error);
      setErrors([
        {
          message:
            error?.response?.data?.message ||
            'Invalid verification code. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    setErrors([]);

    try {
      await authAPI.sendVerificationCode(registrationData);

      setErrors([
        {
          message: 'Verification code sent successfully!',
          field: 'success',
        },
      ]);
    } catch (error: any) {
      console.error('Resend code error:', error);
      setErrors([
        {
          message:
            error?.response?.data?.message ||
            'Failed to resend verification code.',
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

  const getSuccessMessage = () => {
    return errors.find((error) => error.field === 'success')?.message;
  };

  return (
    <Card className="form-container bg-gray-800/80 backdrop-blur-sm border-gray-700 shadow-2xl">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold text-white mb-2">
          Verify Your Email
        </CardTitle>
        <p className="text-gray-400">
          Enter the verification code to complete registration
        </p>
      </CardHeader>

      <CardContent>
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Check Your Email
          </h3>
          <p className="text-gray-400 text-sm">
            We've sent a 6-digit verification code to
            <br />
            <span className="text-blue-400 font-medium">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Error */}
          {getGeneralError() && <ErrorMessage message={getGeneralError()!} />}

          {/* Success Message */}
          {getSuccessMessage() && (
            <ErrorMessage message={getSuccessMessage()!} variant="success" />
          )}

          {/* Verification Code Input */}
          <div className="form-field space-y-2">
            <label
              htmlFor="verificationCode"
              className="block text-sm font-medium text-gray-300"
            >
              Verification Code
            </label>
            <input
              type="text"
              id="verificationCode"
              name="verificationCode"
              value={verificationCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setVerificationCode(value);
                if (
                  errors.some((error) => error.field === 'verificationCode')
                ) {
                  setErrors((prev) =>
                    prev.filter((error) => error.field !== 'verificationCode')
                  );
                }
              }}
              className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 text-center text-2xl tracking-widest ${
                getFieldError('verificationCode')
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-600 focus:ring-blue-500 focus:border-blue-500'
              }`}
              placeholder="000000"
              maxLength={6}
              disabled={isLoading}
            />
            {getFieldError('verificationCode') && (
              <p className="text-red-400 text-sm flex items-center justify-center">
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
                {getFieldError('verificationCode')}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || verificationCode.length !== 6}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 text-lg font-semibold shadow-lg transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner />
                <span className="ml-2">Verifying...</span>
              </div>
            ) : (
              'Complete Registration'
            )}
          </Button>

          {/* Resend Code */}
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2">
              Didn't receive the code?
            </p>
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleResendCode}
                disabled={isLoading}
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Resend Code
              </Button>
              <br />
              <Button
                type="button"
                variant="ghost"
                onClick={onBack}
                disabled={isLoading}
                className="text-gray-400 hover:text-gray-300"
              >
                Back to Form
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
