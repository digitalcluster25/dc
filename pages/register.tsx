// 📝 Register Page - AUTH_MODULE
// pages/register.tsx

import { useRouter } from 'next/router';
import Head from 'next/head';
import RegisterForm from '../modules/auth/components/RegisterForm';

export default function RegisterPage() {
  const router = useRouter();

  const handleRegisterSuccess = () => {
    // После успешной регистрации перенаправляем на страницу входа
    setTimeout(() => {
      router.push('/login?message=registration-success');
    }, 3000); // Даем время показать сообщение об успехе
  };

  const handleLoginClick = () => {
    router.push('/login');
  };

  return (
    <>
      <Head>
        <title>Регистрация - Railway SaaS Platform</title>
        <meta name="description" content="Создайте аккаунт в Railway SaaS Platform" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              🚀 Railway SaaS
            </h1>
            <p className="text-gray-300">
              Присоединяйтесь к нам уже сегодня
            </p>
          </div>

          {/* Register Form */}
          <RegisterForm
            onSuccess={handleRegisterSuccess}
            onLoginClick={handleLoginClick}
          />

          {/* Features */}
          <div className="mt-8 text-center">
            <div className="grid grid-cols-3 gap-4 text-sm text-gray-300">
              <div>
                <div className="text-2xl mb-1">⚡</div>
                <div>Быстрый деплой</div>
              </div>
              <div>
                <div className="text-2xl mb-1">🛡️</div>
                <div>Безопасность</div>
              </div>
              <div>
                <div className="text-2xl mb-1">📈</div>
                <div>Масштабирование</div>
              </div>
            </div>
          </div>

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
