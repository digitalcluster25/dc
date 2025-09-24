// 📝 RegisterForm Component for AUTH_MODULE

'use client';

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { RegisterFormData } from '../types/auth.types';

interface RegisterFormProps {
  onSuccess?: () => void;
  onLoginClick?: () => void;
  className?: string;
}

export default function RegisterForm({ onSuccess, onLoginClick, className = '' }: RegisterFormProps) {
  const { register, loading } = useAuth();
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});
  const [submitError, setSubmitError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  /**
   * Валидация формы
   */
  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterFormData> = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Некорректный email';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Пароль должен содержать минимум 8 символов';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Пароль должен содержать заглавные и строчные буквы, и цифры';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Подтвердите пароль';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    // First name validation (optional but if provided should be valid)
    if (formData.firstName && formData.firstName.trim().length < 2) {
      newErrors.firstName = 'Имя должно содержать минимум 2 символа';
    }

    // Last name validation (optional but if provided should be valid)
    if (formData.lastName && formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Фамилия должна содержать минимум 2 символа';
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
      const success = await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
      });
      
      if (success) {
        setShowSuccess(true);
        setTimeout(() => {
          onSuccess?.();
        }, 2000);
      } else {
        setSubmitError('Ошибка регистрации. Возможно, пользователь с таким email уже существует');
      }
    } catch (error) {
      setSubmitError('Произошла ошибка при регистрации');
      console.error('Registration error:', error);
    }
  };

  /**
   * Обработка изменения полей
   */
  const handleChange = (field: keyof RegisterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Очищаем ошибку для поля при изменении
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  /**
   * Показать сообщение об успешной регистрации
   */
  if (showSuccess) {
    return (
      <div className={`w-full max-w-md mx-auto ${className}`}>
        <div className="glass-card p-8 text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Регистрация успешна!
          </h2>
          <p className="text-gray-300 mb-6">
            Мы отправили письмо с подтверждением на ваш email. 
            Пожалуйста, проверьте почту и следуйте инструкциям.
          </p>
          {onLoginClick && (
            <button
              onClick={onLoginClick}
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Вернуться к входу
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <div className="glass-card p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Создать аккаунт
          </h2>
          <p className="text-gray-300">
            Присоединяйтесь к Railway SaaS
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-200 mb-2">
                Имя
              </label>
              <input
                type="text"
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.firstName ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Иван"
                disabled={loading}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-400">{errors.firstName}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-200 mb-2">
                Фамилия
              </label>
              <input
                type="text"
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.lastName ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Иванов"
                disabled={loading}
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-400">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Email field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
              Email *
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
              required
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-400">{errors.email}</p>
            )}
          </div>

          {/* Password field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
              Пароль *
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
              required
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-400">{errors.password}</p>
            )}
            <p className="mt-1 text-xs text-gray-400">
              Минимум 8 символов, заглавные и строчные буквы, цифры
            </p>
          </div>

          {/* Confirm password field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200 mb-2">
              Подтвердите пароль *
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="••••••••"
              disabled={loading}
              required
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
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
                Регистрация...
              </div>
            ) : (
              'Создать аккаунт'
            )}
          </button>

          {/* Terms */}
          <p className="text-xs text-gray-400 text-center">
            Регистрируясь, вы соглашаетесь с{' '}
            <a href="/terms" className="text-blue-400 hover:text-blue-300">
              Условиями использования
            </a>{' '}
            и{' '}
            <a href="/privacy" className="text-blue-400 hover:text-blue-300">
              Политикой конфиденциальности
            </a>
          </p>

          {/* Login link */}
          {onLoginClick && (
            <div className="text-sm text-gray-300 text-center">
              Уже есть аккаунт?{' '}
              <button
                type="button"
                onClick={onLoginClick}
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Войти
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
