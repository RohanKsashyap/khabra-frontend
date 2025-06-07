import React from 'react';
import { RegisterForm } from '../components/auth/RegisterForm';

export function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-16">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Join Our Network</h1>
          <p className="text-gray-600">
            Create your account to start your MLM business journey
          </p>
        </div>
        
        <RegisterForm />
      </div>
    </div>
  );
}