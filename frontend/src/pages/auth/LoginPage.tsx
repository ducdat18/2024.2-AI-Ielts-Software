import { AuthLayout, LoginForm } from '@/components/auth';
import React from 'react';

const LoginPage: React.FC = () => {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
};

export default LoginPage;
