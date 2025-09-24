// 🔐 Login API Endpoint - AUTH_MODULE
// pages/api/auth/login.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { verifyPassword } from '../../../modules/auth/lib/password';
import { createAccessToken, createRefreshToken } from '../../../modules/auth/lib/jwt';
import { LoginRequest, LoginResponse } from '../../../modules/auth/types/auth.types';
import { findUserByEmail, updateUser } from './register';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoginResponse>
) {
  // Только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const { email, password }: LoginRequest = req.body;

    // Валидация входных данных
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email и пароль обязательны'
      });
    }

    // Поиск пользователя по email
    const user = findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Неверный email или пароль'
      });
    }

    // Проверка пароля
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Неверный email или пароль'
      });
    }

    // Проверка верификации email (можно отключить для тестирования)
    const requireEmailVerification = process.env.REQUIRE_EMAIL_VERIFICATION === 'true';
    if (requireEmailVerification && !user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Подтвердите email перед входом в систему'
      });
    }

    // Создание токенов
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = await createAccessToken(tokenPayload);
    const refreshToken = await createRefreshToken(tokenPayload);

    // Обновление времени последнего входа
    updateUser(user.id, {
      lastLoginAt: new Date()
    });

    // TODO: Сохранить refresh token в базе данных для отзыва

    // Успешный вход
    return res.status(200).json({
      success: true,
      message: 'Вход выполнен успешно',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        emailVerified: user.emailVerified,
        lastLoginAt: new Date(),
        createdAt: user.createdAt,
        updatedAt: new Date()
      },
      accessToken,
      refreshToken
    });

  } catch (error) {
    console.error('Login error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
}

// Rate limiting для login endpoint
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

export function checkLoginRateLimit(ip: string): boolean {
  const now = Date.now();
  const maxAttempts = 5;
  const windowMs = 15 * 60 * 1000; // 15 минут

  const attempts = loginAttempts.get(ip);
  
  if (!attempts) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
    return true;
  }

  // Сбросить счетчик если прошло больше времени чем окно
  if (now - attempts.lastAttempt > windowMs) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
    return true;
  }

  // Проверить превышение лимита
  if (attempts.count >= maxAttempts) {
    return false;
  }

  // Увеличить счетчик
  attempts.count++;
  attempts.lastAttempt = now;
  return true;
}

// Очистка старых записей rate limiting
setInterval(() => {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  
  for (const [ip, attempts] of loginAttempts.entries()) {
    if (now - attempts.lastAttempt > windowMs) {
      loginAttempts.delete(ip);
    }
  }
}, 5 * 60 * 1000); // Очищаем каждые 5 минут
