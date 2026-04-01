import React from 'react';
import { AuthLayout } from '../layouts/AuthLayout';
import { LoginForm } from '../features/auth/LoginForm';

interface LoginPageProps {
  onLogin: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  return (
    <AuthLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Đăng nhập</h1>
        <p className="text-slate-500">Chào mừng trở lại hệ thống.</p>
      </div>
      
      <LoginForm onSuccess={onLogin} />
    </AuthLayout>
  );
};