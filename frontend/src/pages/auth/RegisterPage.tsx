import React, { useState } from 'react';

import type { CreateUserDto } from '@/types';
import { AuthLayout, RegisterForm, VerificationForm } from '@/components/auth';

type RegistrationStep = 'form' | 'verification';

const RegisterPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('form');
  const [registrationEmail, setRegistrationEmail] = useState('');
  const [registrationData, setRegistrationData] =
    useState<CreateUserDto | null>(null);

  const handleFormSuccess = (email: string, userData: CreateUserDto) => {
    setRegistrationEmail(email);
    setRegistrationData(userData);
    setCurrentStep('verification');
  };

  const handleBackToForm = () => {
    setCurrentStep('form');
    setRegistrationEmail('');
    setRegistrationData(null);
  };

  return (
    <AuthLayout showBackToHome={currentStep === 'form'}>
      {currentStep === 'form' ? (
        <RegisterForm onSuccess={handleFormSuccess} />
      ) : (
        <VerificationForm
          email={registrationEmail}
          onBack={handleBackToForm}
          registrationData={registrationData!}
        />
      )}
    </AuthLayout>
  );
};

export default RegisterPage;
