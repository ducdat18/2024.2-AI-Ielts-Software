import React from 'react';

export const AuthBackground: React.FC = () => {
  return (
    <div className="background-gradient absolute inset-0">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-gray-900/40" />
      <div className="absolute inset-0 bg-[url('/images/auth-bg.jpg')] bg-cover bg-center opacity-10" />

      {/* Animated background elements */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
      <div
        className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: '1s' }}
      ></div>
    </div>
  );
};
