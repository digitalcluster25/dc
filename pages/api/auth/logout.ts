// 🚪 Logout API Endpoint - AUTH_MODULE
// pages/api/auth/logout.ts

import { NextApiRequest, NextApiResponse } from 'next';

interface LogoutRequest {
  refreshToken?: string;
}

interface LogoutResponse {
  success: boolean;
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LogoutResponse>
) {
  // Только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const { refreshToken }: LogoutRequest = req.body;

    if (refreshToken) {
      // TODO: Удалить refresh token из базы данных для отзыва
      console.log('Revoking refresh token:', refreshToken);
    }

    // TODO: Добавить refresh token в blacklist

    return res.status(200).json({
      success: true,
      message: 'Выход выполнен успешно'
    });

  } catch (error) {
    console.error('Logout error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Ошибка при выходе'
    });
  }
}
