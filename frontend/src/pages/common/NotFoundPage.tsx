import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-blue-500 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-200 mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-400 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-4">
          <Link to="/home">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 w-full">
              Go to Home
            </Button>
          </Link>

          <Link to="/tests">
            <Button
              variant="outline"
              className="border-blue-500 text-blue-400 hover:bg-blue-500/20 px-8 py-3 w-full"
            >
              Browse Tests
            </Button>
          </Link>
        </div>

        <div className="mt-8 text-gray-500 text-sm">
          <p>Need help? Contact our support team.</p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
