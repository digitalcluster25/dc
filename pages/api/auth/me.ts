// 👤 Current User API Endpoint - AUTH_MODULE
// pages/api/auth/me.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { verifyAccessToken, extractTokenFromHeader } from '../../../modules/auth/lib/jwt';
import { findUserById } from './register';

interface MeResponse {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: 'user' | 'admin';
    emailVerified: boolean;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MeResponse>
) {
  // Только GET запросы
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    // Извлекаем токен из заголовка Authorization
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Токен авторизации не предоставлен'
      });
    }

    // Верифицируем access token
    const payload = await verifyAccessToken(token);
    if (!payload) {
      return res.status(401).json({
        success: false,
        message: 'Недействительный токен'
      });
    }

    // Находим пользователя в базе данных
    const user = findUserById(payload.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    // Возвращаем информацию о пользователе (без пароля)
    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        emailVerified: user.emailVerified,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Get current user error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
}
