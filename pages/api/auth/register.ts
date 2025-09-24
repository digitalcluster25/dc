// 📝 Registration API Endpoint - AUTH_MODULE
// pages/api/auth/register.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { hashPassword } from '../../../modules/auth/lib/password';
import { createEmailVerificationToken } from '../../../modules/auth/lib/jwt';
import { RegisterRequest, RegisterResponse } from '../../../modules/auth/types/auth.types';

// Временная заглушка для базы данных (пока не настроен Drizzle)
interface TempUser {
  id: string;
  email: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  role: 'user' | 'admin';
  emailVerified: boolean;
  createdAt: Date;
}

// Временное хранилище пользователей (в реальном проекте - база данных)
const tempUsers: TempUser[] = [];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RegisterResponse>
) {
  // Только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const { email, password, firstName, lastName }: RegisterRequest = req.body;

    // Валидация входных данных
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email и пароль обязательны'
      });
    }

    // Проверка формата email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Некорректный формат email'
      });
    }

    // Проверка силы пароля
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Пароль должен содержать минимум 8 символов'
      });
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Пароль должен содержать заглавные и строчные буквы, и цифры'
      });
    }

    // Проверка на существующего пользователя
    const existingUser = tempUsers.find(user => user.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Пользователь с таким email уже существует'
      });
    }

    // Хеширование пароля
    const passwordHash = await hashPassword(password);

    // Создание нового пользователя
    const newUser: TempUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: email.toLowerCase(),
      passwordHash,
      firstName: firstName?.trim() || undefined,
      lastName: lastName?.trim() || undefined,
      role: 'user',
      emailVerified: false,
      createdAt: new Date()
    };

    // Сохранение пользователя (временно в массив)
    tempUsers.push(newUser);

    // Создание токена для верификации email
    const verificationToken = await createEmailVerificationToken(newUser.id);

    // TODO: Отправка email с токеном верификации
    console.log('Email verification token:', verificationToken);
    console.log('Verification URL:', `${process.env.NEXTAUTH_URL || 'http://localhost:3080'}/verify-email?token=${verificationToken}`);

    // Возвращаем успешный ответ (без пароля)
    return res.status(201).json({
      success: true,
      message: 'Регистрация успешна! Проверьте email для подтверждения аккаунта.',
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        emailVerified: newUser.emailVerified,
        createdAt: newUser.createdAt,
        updatedAt: newUser.createdAt
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
}

// Утилита для получения всех пользователей (для тестирования)
export function getAllUsers(): TempUser[] {
  return tempUsers;
}

// Утилита для поиска пользователя по email
export function findUserByEmail(email: string): TempUser | undefined {
  return tempUsers.find(user => user.email.toLowerCase() === email.toLowerCase());
}

// Утилита для поиска пользователя по ID
export function findUserById(id: string): TempUser | undefined {
  return tempUsers.find(user => user.id === id);
}

// Утилита для обновления пользователя
export function updateUser(id: string, updates: Partial<TempUser>): TempUser | null {
  const userIndex = tempUsers.findIndex(user => user.id === id);
  if (userIndex === -1) return null;

  tempUsers[userIndex] = { ...tempUsers[userIndex], ...updates };
  return tempUsers[userIndex];
}
