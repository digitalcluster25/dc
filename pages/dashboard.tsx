// 📊 Dashboard Page - AUTH_MODULE
// pages/dashboard.tsx

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../modules/auth/hooks/useAuth';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Проверяем аутентификацию
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    router.push('/login');
  };

  // Показываем загрузку пока проверяем аутентификацию
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Если пользователь не авторизован, показываем заглушку
  if (!user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Dashboard - Railway SaaS Platform</title>
        <meta name="description" content="Панель управления Railway SaaS Platform" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
        {/* Header */}
        <header className="border-b border-white/10 backdrop-blur-lg bg-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-white">
                  🚀 Railway SaaS
                </h1>
              </div>

              {/* User menu */}
              <div className="flex items-center space-x-4">
                <div className="text-white">
                  <span className="text-sm text-gray-300">Добро пожаловать,</span>
                  <span className="ml-1 font-medium">
                    {user.firstName || user.email}
                  </span>
                  {user.role === 'admin' && (
                    <span className="ml-2 px-2 py-1 text-xs bg-yellow-500/20 text-yellow-300 rounded">
                      ADMIN
                    </span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors disabled:opacity-50"
                >
                  {isLoggingOut ? 'Выход...' : 'Выйти'}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Welcome Card */}
            <div className="lg:col-span-2">
              <div className="glass-card p-6">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Добро пожаловать в панель управления!
                </h2>
                <p className="text-gray-300 mb-6">
                  Здесь вы можете управлять своими проектами, развертывать приложения 
                  и настраивать инфраструктуру на Railway.
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <button className="btn-primary p-4 text-left">
                    <div className="text-2xl mb-2">🚀</div>
                    <div className="font-semibold">Создать проект</div>
                    <div className="text-sm opacity-80">Развернуть новое приложение</div>
                  </button>
                  
                  <button className="glass-card p-4 text-left hover:bg-white/10 transition-colors">
                    <div className="text-2xl mb-2">📊</div>
                    <div className="font-semibold text-white">Мои проекты</div>
                    <div className="text-sm text-gray-300">Управление существующими</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Profile Card */}
            <div>
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Профиль пользователя
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-300">Email</label>
                    <div className="text-white font-medium">{user.email}</div>
                  </div>
                  
                  {user.firstName && (
                    <div>
                      <label className="text-sm text-gray-300">Имя</label>
                      <div className="text-white font-medium">{user.firstName}</div>
                    </div>
                  )}
                  
                  {user.lastName && (
                    <div>
                      <label className="text-sm text-gray-300">Фамилия</label>
                      <div className="text-white font-medium">{user.lastName}</div>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm text-gray-300">Роль</label>
                    <div className="text-white font-medium capitalize">{user.role}</div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-300">Email подтвержден</label>
                    <div className={`font-medium ${user.emailVerified ? 'text-green-400' : 'text-yellow-400'}`}>
                      {user.emailVerified ? 'Да' : 'Нет'}
                    </div>
                  </div>
                </div>
                
                <button className="w-full mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">
                  Редактировать профиль
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="glass-card p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">0</div>
              <div className="text-gray-300">Активных проектов</div>
            </div>
            
            <div className="glass-card p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">0</div>
              <div className="text-gray-300">Развертываний</div>
            </div>
            
            <div className="glass-card p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">$0</div>
              <div className="text-gray-300">Потрачено в этом месяце</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-white mb-4">Быстрые действия</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="glass-card p-4 text-center hover:bg-white/10 transition-colors">
                <div className="text-2xl mb-2">🐳</div>
                <div className="text-white font-medium">Docker Deploy</div>
              </button>
              
              <button className="glass-card p-4 text-center hover:bg-white/10 transition-colors">
                <div className="text-2xl mb-2">⚡</div>
                <div className="text-white font-medium">Next.js App</div>
              </button>
              
              <button className="glass-card p-4 text-center hover:bg-white/10 transition-colors">
                <div className="text-2xl mb-2">🗃️</div>
                <div className="text-white font-medium">База данных</div>
              </button>
              
              <button className="glass-card p-4 text-center hover:bg-white/10 transition-colors">
                <div className="text-2xl mb-2">🔧</div>
                <div className="text-white font-medium">API Service</div>
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
