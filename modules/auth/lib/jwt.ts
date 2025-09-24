// 🔑 JWT Utils for AUTH_MODULE

import { SignJWT, jwtVerify } from 'jose';
import { JWTPayload, UserRole } from '../types/auth.types';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'railway-saas-super-secret-key-change-in-production'
);

const REFRESH_SECRET = new TextEncoder().encode(
  process.env.REFRESH_SECRET || 'railway-saas-refresh-secret-key-change-in-production'
);



/**
 * Создать Access Token (15 минут)
 */
export async function createAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .setSubject(payload.userId)
    .sign(JWT_SECRET);

  return token;
}

/**
 * Создать Refresh Token (7 дней)
 */
export async function createRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .setSubject(payload.userId)
    .sign(REFRESH_SECRET);

  return token;
}

/**
 * Верифицировать Access Token
 */
export async function verifyAccessToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    return {
      userId: payload.sub as string,
      email: payload.email as string,
      role: payload.role as UserRole,
      iat: payload.iat as number,
      exp: payload.exp as number,
    };
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Верифицировать Refresh Token
 */
export async function verifyRefreshToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET);
    
    return {
      userId: payload.sub as string,
      email: payload.email as string,
      role: payload.role as UserRole,
      iat: payload.iat as number,
      exp: payload.exp as number,
    };
  } catch (error) {
    console.error('Refresh token verification failed:', error);
    return null;
  }
}

/**
 * Извлечь токен из заголовков
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7);
}

/**
 * Создать токен для верификации email
 */
export async function createEmailVerificationToken(userId: string): Promise<string> {
  const payload = { userId, type: 'email-verification' };
  
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .setSubject(userId)
    .sign(JWT_SECRET);

  return token;
}

/**
 * Создать токен для сброса пароля
 */
export async function createPasswordResetToken(userId: string): Promise<string> {
  const payload = { userId, type: 'password-reset' };
  
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .setSubject(userId)
    .sign(JWT_SECRET);

  return token;
}

/**
 * Верифицировать специальный токен (email/password reset)
 */
export async function verifySpecialToken(token: string, expectedType: string): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    if (payload.type !== expectedType) {
      return null;
    }
    
    return {
      userId: payload.sub as string,
    };
  } catch (error) {
    console.error('Special token verification failed:', error);
    return null;
  }
}

/**
 * Получить время жизни токена в секундах
 */
export function getTokenExpiryTime(type: 'access' | 'refresh' | 'email' | 'password'): number {
  switch (type) {
    case 'access':
      return 15 * 60; // 15 minutes
    case 'refresh':
      return 7 * 24 * 60 * 60; // 7 days
    case 'email':
      return 24 * 60 * 60; // 24 hours
    case 'password':
      return 1 * 60 * 60; // 1 hour
    default:
      return 15 * 60;
  }
}

/**
 * Создать дату истечения токена
 */
export function createTokenExpiry(type: 'access' | 'refresh' | 'email' | 'password'): Date {
  const seconds = getTokenExpiryTime(type);
  return new Date(Date.now() + seconds * 1000);
}
