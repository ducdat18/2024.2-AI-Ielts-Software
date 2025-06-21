import React from 'react';
import { Outlet } from 'react-router-dom';
import Footer from '@/components/layouts/PublicFooter';
import Header from '@/components/layouts/PublicHeader';

interface LearnerLayoutProps {
  children?: React.ReactNode;
}

const LearnerLayout: React.FC<LearnerLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="flex-1">{children || <Outlet />}</main>
      <Footer />
    </div>
  );
};

export default LearnerLayout;
