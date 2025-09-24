// 🎣 useAuth Hook for AUTH_MODULE

'use client';

import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { 
  User, 
  AuthContextType, 
  LoginRequest, 
  RegisterRequest, 
  UpdateProfileRequest,
  ChangePasswordRequest 
} from '../types/auth.types';

// Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth Provider - обертка для приложения
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Проверить текущего пользователя при загрузке
  useEffect(() => {
    checkCurrentUser();
  }, []);

  /**
   * Проверить текущего пользователя
   */
  const checkCurrentUser = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // Токен недействителен, пытаемся обновить
        const refreshed = await refreshToken();
        if (!refreshed) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
    } catch (error) {
      console.error('Error checking current user:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Вход в систему
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Сохраняем токены
        localStorage.setItem('access_token', data.accessToken);
        localStorage.setItem('refresh_token', data.refreshToken);
        
        // Устанавливаем пользователя
        setUser(data.user);
        
        return true;
      } else {
        console.error('Login failed:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Регистрация
   */
  const register = async (data: RegisterRequest): Promise<boolean> => {
    try {
      setLoading(true);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // После регистрации пользователь должен подтвердить email
        return true;
      } else {
        console.error('Registration failed:', result.message);
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Выход из системы
   */
  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        // Уведомляем сервер о выходе
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Очищаем локальное состояние
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
    }
  };

  /**
   * Обновление токена
   */
  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshTokenValue = localStorage.getItem('refresh_token');
      if (!refreshTokenValue) {
        return false;
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('access_token', data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem('refresh_token', data.refreshToken);
        }
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  };

  /**
   * Обновление профиля
   */
  const updateProfile = async (data: UpdateProfileRequest): Promise<boolean> => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        return false;
      }

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setUser(result.user);
        return true;
      } else {
        console.error('Profile update failed:', result.message);
        return false;
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return false;
    }
  };

  /**
   * Смена пароля
   */
  const changePassword = async (data: ChangePasswordRequest): Promise<boolean> => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        return false;
      }

      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        return true;
      } else {
        console.error('Password change failed:', result.message);
        return false;
      }
    } catch (error) {
      console.error('Password change error:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    refreshToken,
    updateProfile,
    changePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook для использования Auth Context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

/**
 * Hook для проверки аутентификации
 */
export function useRequireAuth() {
  const { user, loading } = useAuth();
  
  useEffect(() => {
    if (!loading && !user) {
      // Redirect to login page
      window.location.href = '/login';
    }
  }, [user, loading]);

  return { user, loading };
}

/**
 * Hook для проверки роли
 */
export function useRequireRole(requiredRole: 'user' | 'admin') {
  const { user, loading } = useAuth();
  
  useEffect(() => {
    if (!loading) {
      if (!user) {
        window.location.href = '/login';
      } else if (user.role !== requiredRole && requiredRole === 'admin') {
        // Redirect to unauthorized page
        window.location.href = '/unauthorized';
      }
    }
  }, [user, loading, requiredRole]);

  return { user, loading, hasAccess: user?.role === requiredRole || (requiredRole === 'user' && user?.role === 'admin') };
}

/**
 * Hook для автоматического обновления токена
 */
export function useTokenRefresh() {
  const { refreshToken: refresh } = useAuth();

  useEffect(() => {
    const interval = setInterval(async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        // Проверяем, не истек ли токен (в реальном приложении нужно парсить JWT)
        await refresh();
      }
    }, 14 * 60 * 1000); // Обновляем каждые 14 минут (токен живет 15 минут)

    return () => clearInterval(interval);
  }, [refresh]);
}

/**
 * Утилита для добавления Authorization header
 */
export function getAuthHeaders(): { Authorization?: string } {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Утилита для API запросов с автоматической авторизацией
 */
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Если токен истек, пытаемся обновить
  if (response.status === 401) {
    const { refreshToken } = useAuth();
    const refreshed = await refreshToken();
    
    if (refreshed) {
      // Повторяем запрос с новым токеном
      const newHeaders = {
        ...headers,
        ...getAuthHeaders(),
      };
      
      return fetch(url, {
        ...options,
        headers: newHeaders,
      });
    }
  }

  return response;
}
