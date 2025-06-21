import { useAuth } from '@/hooks/useAuthApi';
import React from 'react';

interface UserProfileProps {
  showEmail?: boolean;
  showRole?: boolean;
  className?: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  showEmail = false,
  showRole = false,
  className = '',
}) => {
  const { user, userName, userEmail, userRole } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
        <span className="text-white font-medium text-sm">
          {userName
            ?.split(' ')
            .map((n) => n[0])
            .join('') || 'U'}
        </span>
      </div>

      {/* User Info */}
      <div className="flex flex-col">
        <span className="text-white font-medium">{userName}</span>
        {showEmail && (
          <span className="text-gray-400 text-sm">{userEmail}</span>
        )}
        {showRole && (
          <span className="text-blue-400 text-xs capitalize">{userRole}</span>
        )}
      </div>
    </div>
  );
};
