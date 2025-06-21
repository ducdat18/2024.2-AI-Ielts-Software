import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuthApi'; // Sử dụng hook auth chuyên dụng
import { LogoutButton } from '../auth';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Sử dụng useAuth hook từ useAuthApi.tsx thay vì useApi.tsx
  const { isAuthenticated, userName, userRole, userEmail, isLoading } =
    useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', to: '/home' },
    { name: 'Tests', to: '/tests' },
    { name: 'About', to: '/about' },
  ];

  // Function để lấy dashboard route dựa trên user role
  const getDashboardRoute = () => {
    if (userRole === 'admin') {
      return '/admin/dashboard';
    }
    return '/learner/dashboard';
  };

  // Function để hiển thị user info
  const getUserDisplayName = () => {
    if (userName) {
      return userName;
    }
    if (userEmail) {
      return userEmail.split('@')[0]; // Fallback to email username part
    }
    return 'User';
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled || isMobileMenuOpen ? 'bg-black shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/home" className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center mr-3">
            <span className="text-white font-bold text-lg">AI</span>
          </div>
          <p className="text-white font-bold text-2xl uppercase tracking-wider">
            IELTS Online
          </p>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`text-md font-medium transition-colors ${
                location.pathname === item.to
                  ? 'text-blue-500'
                  : 'text-white hover:text-blue-400'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth Section */}
        <div className="hidden md:flex items-center space-x-4">
          {isLoading ? (
            // Loading state
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-300 text-sm">Loading...</span>
            </div>
          ) : isAuthenticated ? (
            // Authenticated state
            <>
              <div className="flex flex-col items-end">
                <span className="text-gray-300 text-sm">
                  Welcome, {getUserDisplayName()}
                </span>
                {userRole && (
                  <span className="text-gray-400 text-xs capitalize">
                    {userRole === 'admin' ? 'Administrator' : 'Student'}
                  </span>
                )}
              </div>
              <Link to={getDashboardRoute()}>
                <Button
                  variant="outline"
                  className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors"
                >
                  Dashboard
                </Button>
              </Link>
              <LogoutButton />
            </>
          ) : (
            // Non-authenticated state
            <>
              <Link to="/auth/login">
                <Button
                  variant="outline"
                  className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors"
                >
                  Login
                </Button>
              </Link>
              <Link to="/auth/register">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white transition-colors">
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div
          className="md:hidden flex items-center justify-center w-10 h-10 cursor-pointer"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          <div className="relative w-6 h-5">
            <span
              className={`absolute h-0.5 w-full bg-white transition-all duration-300 ${
                isMobileMenuOpen ? 'top-2 rotate-45' : 'top-0'
              }`}
            ></span>
            <span
              className={`absolute h-0.5 w-full bg-white top-2 transition-all duration-300 ${
                isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
              }`}
            ></span>
            <span
              className={`absolute h-0.5 w-full bg-white transition-all duration-300 ${
                isMobileMenuOpen ? 'top-2 -rotate-45' : 'top-4'
              }`}
            ></span>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden absolute w-full bg-black transition-all duration-300 ease-in-out overflow-hidden ${
          isMobileMenuOpen ? 'max-h-screen py-4' : 'max-h-0 py-0'
        }`}
      >
        <div className="container mx-auto px-4">
          <nav className="flex flex-col space-y-4">
            {/* Navigation Items */}
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`text-sm font-medium transition-colors p-2 rounded ${
                  location.pathname === item.to
                    ? 'text-blue-500 bg-blue-900/20'
                    : 'text-white hover:text-blue-400 hover:bg-gray-800/20'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}

            {/* Mobile Auth Section */}
            <div className="flex flex-col space-y-3 pt-3 border-t border-gray-800">
              {isLoading ? (
                // Loading state for mobile
                <div className="flex items-center justify-center space-x-2 p-2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-300 text-sm">Loading...</span>
                </div>
              ) : isAuthenticated ? (
                // Authenticated state for mobile
                <>
                  <div className="text-sm text-gray-300 px-2 py-1 border-b border-gray-800 pb-2">
                    <div>Welcome, {getUserDisplayName()}</div>
                    {userRole && (
                      <div className="text-xs text-gray-400 capitalize mt-1">
                        {userRole === 'admin' ? 'Administrator' : 'Student'}
                      </div>
                    )}
                  </div>
                  <Link
                    to={getDashboardRoute()}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button
                      variant="outline"
                      className="w-full border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors"
                    >
                      Dashboard
                    </Button>
                  </Link>
                  <LogoutButton
                    className="w-full"
                    onLogout={() => setIsMobileMenuOpen(false)}
                  />
                </>
              ) : (
                // Non-authenticated state for mobile
                <>
                  <Link
                    to="/auth/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button
                      variant="outline"
                      className="w-full border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link
                    to="/auth/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors">
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
