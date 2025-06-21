import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { AuthBackground } from './AuthBackground';
import { AuthLogo } from './AuthLogo';

interface AuthLayoutProps {
  children: React.ReactNode;
  showBackToHome?: boolean;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  showBackToHome = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Background animation
      gsap.fromTo(
        containerRef.current.querySelector('.background-gradient'),
        { opacity: 0 },
        { opacity: 1, duration: 1 }
      );

      // Logo animation
      gsap.fromTo(
        containerRef.current.querySelector('.logo-container'),
        { scale: 0, rotation: -180 },
        {
          scale: 1,
          rotation: 0,
          duration: 1,
          delay: 0.2,
          ease: 'back.out(1.7)',
        }
      );

      // Form animation
      gsap.fromTo(
        containerRef.current.querySelector('.form-container'),
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.4 }
      );

      // Input animations
      gsap.fromTo(
        containerRef.current.querySelectorAll('.form-field'),
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          delay: 0.6,
          stagger: 0.1,
        }
      );
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-black text-white relative overflow-hidden"
    >
      <AuthBackground />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <AuthLogo />
          {children}

          {showBackToHome && (
            <div className="text-center mt-6">
              <Link
                to="/home"
                className="text-gray-400 hover:text-gray-300 text-sm transition-colors flex items-center justify-center"
              >
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
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Home
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
