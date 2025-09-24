// 🔐 LoginForm Component for AUTH_MODULE

'use client';

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LoginFormData } from '../types/auth.types';

interface LoginFormProps {
  onSuccess?: () => void;
  onRegisterClick?: () => void;
  className?: string;
}

export default function LoginForm({ onSuccess, onRegisterClick, className = '' }: LoginFormProps) {
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [submitError, setSubmitError] = useState('');

  /**
   * Валидация формы
   */
  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Некорректный email';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Обработка отправки формы
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) {
      return;
    }

    try {
      const success = await login(formData.email, formData.password);
      
      if (success) {
        onSuccess?.();
      } else {
        setSubmitError('Неверный email или пароль');
      }
    } catch (error) {
      setSubmitError('Произошла ошибка при входе');
      console.error('Login error:', error);
    }
  };

  /**
   * Обработка изменения полей
   */
  const handleChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Очищаем ошибку для поля при изменении
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <div className="glass-card p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Добро пожаловать
          </h2>
          <p className="text-gray-300">
            Войдите в свой аккаунт
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.email ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="your@email.com"
              disabled={loading}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-400">{errors.email}</p>
            )}
          </div>

          {/* Password field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
              Пароль
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.password ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="••••••••"
              disabled={loading}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-400">{errors.password}</p>
            )}
          </div>

          {/* Submit error */}
          {submitError && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-sm text-red-300">{submitError}</p>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Вход...
              </div>
            ) : (
              'Войти'
            )}
          </button>

          {/* Links */}
          <div className="space-y-3 text-center">
            <button
              type="button"
              className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
              onClick={() => {/* TODO: Implement forgot password */}}
            >
              Забыли пароль?
            </button>
            
            {onRegisterClick && (
              <div className="text-sm text-gray-300">
                Нет аккаунта?{' '}
                <button
                  type="button"
                  onClick={onRegisterClick}
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  Зарегистрироваться
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Компактная версия формы входа
 */
export function LoginFormCompact({ onSuccess, className = '' }: Omit<LoginFormProps, 'onRegisterClick'>) {
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Заполните все поля');
      return;
    }

    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        onSuccess?.();
      } else {
        setError('Неверные данные');
      }
    } catch {
      setError('Ошибка входа');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div className="flex space-x-3">
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className="flex-1 px-3 py-2 bg-white/10 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Пароль"
          value={formData.password}
          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          className="flex-1 px-3 py-2 bg-white/10 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors disabled:opacity-50"
        >
          {loading ? '...' : 'Войти'}
        </button>
      </div>
      
      {error && (
        <p className="text-sm text-red-400 text-center">{error}</p>
      )}
    </form>
  );
}
