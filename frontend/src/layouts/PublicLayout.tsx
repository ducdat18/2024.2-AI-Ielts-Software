import Footer from '@/components/layouts/PublicFooter';
import Header from '@/components/layouts/PublicHeader';
import React from 'react';
import { Outlet } from 'react-router-dom';

interface PublicLayoutProps {
  children?: React.ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="flex-1">{children || <Outlet />}</main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
