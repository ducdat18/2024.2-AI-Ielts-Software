// components/auth/AuthLogo.tsx
import React from 'react';
import { Link } from 'react-router-dom';

export const AuthLogo: React.FC = () => {
  return (
    <div className="logo-container text-center mb-8">
      <Link to="/home" className="inline-flex items-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mr-4 shadow-lg">
          <span className="text-white font-bold text-2xl">AI</span>
        </div>
        <div className="text-left">
          <h1 className="text-2xl font-bold text-white">IELTS Online</h1>
          <p className="text-sm text-blue-400">AI-Powered Learning</p>
        </div>
      </Link>
    </div>
  );
};
