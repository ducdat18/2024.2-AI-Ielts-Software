import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { LoadingSpinner } from './shared/LoadingSpinner';
import { useAuth } from '@/hooks/useAuthApi';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requireAuth = true,
}) => {
  const { isAuthenticated, userRole, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
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

  // Redirect to login if authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole && userRole !== requiredRole) {
    // Redirect to appropriate dashboard based on user role
    const redirectPath =
      userRole === 'admin' ? '/admin/dashboard' : '/learner/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};
