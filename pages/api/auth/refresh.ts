// 🔄 Refresh Token API Endpoint - AUTH_MODULE
// pages/api/auth/refresh.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { verifyRefreshToken, createAccessToken, createRefreshToken } from '../../../modules/auth/lib/jwt';
import { RefreshTokenRequest, RefreshTokenResponse } from '../../../modules/auth/types/auth.types';
import { findUserById } from './register';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RefreshTokenResponse>
) {
  // Только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const { refreshToken }: RefreshTokenRequest = req.body;

    // Валидация входных данных
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token обязателен'
      });
    }

    // Верификация refresh token
    const payload = await verifyRefreshToken(refreshToken);
    if (!payload) {
      return res.status(401).json({
        success: false,
        message: 'Недействительный refresh token'
      });
    }

    // Проверка существования пользователя
    const user = findUserById(payload.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    // TODO: Проверить что refresh token существует в базе данных и не отозван

    // Создание новых токенов
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const newAccessToken = await createAccessToken(tokenPayload);
    const newRefreshToken = await createRefreshToken(tokenPayload);

    // TODO: Удалить старый refresh token из базы и сохранить новый

    return res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Ошибка обновления токена'
    });
  }
}
