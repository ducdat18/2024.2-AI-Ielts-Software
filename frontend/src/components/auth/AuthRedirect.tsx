import React from 'react';
import { Navigate } from 'react-router-dom';
import { LoadingSpinner } from './shared/LoadingSpinner';
import { useAuth } from '@/hooks/useAuthApi';

interface AuthRedirectProps {
  children: React.ReactNode;
}

export const AuthRedirect: React.FC<AuthRedirectProps> = ({ children }) => {
  const { isAuthenticated, userRole, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner />
          <div className="text-white text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  // Redirect authenticated users to their appropriate dashboard
  if (isAuthenticated) {
    const redirectPath =
      userRole === 'admin' ? '/admin/dashboard' : '/learner/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  // Show auth pages (login/register) for non-authenticated users
  return <>{children}</>;
};
