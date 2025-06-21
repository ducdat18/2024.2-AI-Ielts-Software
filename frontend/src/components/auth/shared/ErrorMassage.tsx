import React from 'react';

interface ErrorMessageProps {
  message: string;
  variant?: 'error' | 'success';
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  variant = 'error',
}) => {
  const bgColor =
    variant === 'error'
      ? 'bg-red-500/20 border-red-500/50'
      : 'bg-green-500/20 border-green-500/50';
  const textColor = variant === 'error' ? 'text-red-300' : 'text-green-300';

  return (
    <div className={`p-4 ${bgColor} border rounded-lg`}>
      <p className={`${textColor} text-sm`}>{message}</p>
    </div>
  );
};
