// 🔐 Login Page - AUTH_MODULE
// pages/login.tsx

import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import LoginForm from '../modules/auth/components/LoginForm';

export default function LoginPage() {
  const router = useRouter();
  const [showRegister, setShowRegister] = useState(false);

  const handleLoginSuccess = () => {
    // Перенаправляем на dashboard или на страницу, с которой пришли
    const redirectTo = router.query.redirect as string || '/dashboard';
    router.push(redirectTo);
  };

  const handleRegisterClick = () => {
    router.push('/register');
  };

  return (
    <>
      <Head>
        <title>Вход - Railway SaaS Platform</title>
        <meta name="description" content="Войдите в свой аккаунт Railway SaaS Platform" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              🚀 Railway SaaS
            </h1>
            <p className="text-gray-300">
              Хостинг-платформа нового поколения
            </p>
          </div>

          {/* Login Form */}
          <LoginForm
            onSuccess={handleLoginSuccess}
            onRegisterClick={handleRegisterClick}
          />

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">
              © 2025 Railway SaaS Platform. Все права защищены.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
