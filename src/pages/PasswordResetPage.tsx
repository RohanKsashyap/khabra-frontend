import React from 'react';
import { PasswordResetForm } from '../components/auth/PasswordResetForm';

export function PasswordResetPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-16">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Reset Your Password</h1>
          <p className="text-gray-600">
            Enter your email address and we'll send you instructions to reset your password
          </p>
        </div>
        
        <PasswordResetForm />
      </div>
    </div>
  );
} 