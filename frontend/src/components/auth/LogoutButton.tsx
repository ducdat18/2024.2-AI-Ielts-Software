import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuthApi';
import { LoadingSpinner } from './shared/LoadingSpinner';

interface LogoutButtonProps {
  variant?:
    | 'default'
    | 'outline'
    | 'ghost'
    | 'secondary'
    | 'destructive'
    | 'link';
  size?: 'sm' | 'default' | 'lg' | 'icon';
  className?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
  onLogout?: () => void; // Thêm prop onLogout callback
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({
  variant = 'outline',
  size = 'default',
  className = '',
  showIcon = true,
  children,
  onLogout, // Destructure onLogout prop
}) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();

      // Call the callback function if provided (for closing mobile menu, etc.)
      if (onLogout) {
        onLogout();
      }

      navigate('/home');
    } catch (error) {
      console.error('Logout error:', error);

      // Still call callback and navigate even if logout API fails
      if (onLogout) {
        onLogout();
      }
      navigate('/home');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      variant={variant}
      size={size}
      disabled={isLoggingOut}
      className={`border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors ${className}`}
    >
      {isLoggingOut ? (
        <LoadingSpinner size="sm" color="border-current" />
      ) : (
        <>
          {showIcon && (
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          )}
          {children || 'Logout'}
        </>
      )}
    </Button>
  );
};
