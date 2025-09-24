// 🛡️ Authentication Middleware for AUTH_MODULE

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, extractTokenFromHeader } from './jwt';
import { UserRole, JWTPayload } from '../types/auth.types';

export interface AuthenticatedRequest extends NextRequest {
  user: JWTPayload;
}

/**
 * Middleware для проверки аутентификации
 */
export async function requireAuth(request: NextRequest): Promise<JWTPayload> {
  const authHeader = request.headers.get('authorization');
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    throw new Error('UNAUTHORIZED: No token provided');
  }

  const payload = await verifyAccessToken(token);
  if (!payload) {
    throw new Error('UNAUTHORIZED: Invalid token');
  }

  return payload;
}

/**
 * Middleware для проверки роли пользователя
 */
export async function requireRole(
  request: NextRequest, 
  allowedRoles: UserRole[]
): Promise<JWTPayload> {
  const user = await requireAuth(request);

  if (!allowedRoles.includes(user.role)) {
    throw new Error('FORBIDDEN: Insufficient permissions');
  }

  return user;
}

/**
 * Middleware для админов
 */
export async function requireAdmin(request: NextRequest): Promise<JWTPayload> {
  return requireRole(request, ['admin']);
}

/**
 * Middleware для пользователей и админов
 */
export async function requireUser(request: NextRequest): Promise<JWTPayload> {
  return requireRole(request, ['user', 'admin']);
}

/**
 * Опциональная аутентификация (не бросает ошибку)
 */
export async function optionalAuth(request: NextRequest): Promise<JWTPayload | null> {
  try {
    return await requireAuth(request);
  } catch {
    return null;
  }
}

/**
 * Wrapper для API routes с аутентификацией
 */
export function withAuth(
  handler: (request: NextRequest, user: JWTPayload) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const user = await requireAuth(request);
      return handler(request, user);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed';
      
      if (message.startsWith('UNAUTHORIZED')) {
        return NextResponse.json(
          { error: 'Unauthorized', message: 'Please login to access this resource' },
          { status: 401 }
        );
      }
      
      if (message.startsWith('FORBIDDEN')) {
        return NextResponse.json(
          { error: 'Forbidden', message: 'You do not have permission to access this resource' },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: 'Authentication Error', message },
        { status: 401 }
      );
    }
  };
}

/**
 * Wrapper для API routes с проверкой роли
 */
export function withRole(
  allowedRoles: UserRole[],
  handler: (request: NextRequest, user: JWTPayload) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const user = await requireRole(request, allowedRoles);
      return handler(request, user);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authorization failed';
      
      if (message.startsWith('UNAUTHORIZED')) {
        return NextResponse.json(
          { error: 'Unauthorized', message: 'Please login to access this resource' },
          { status: 401 }
        );
      }
      
      if (message.startsWith('FORBIDDEN')) {
        return NextResponse.json(
          { error: 'Forbidden', message: 'You do not have permission to access this resource' },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: 'Authorization Error', message },
        { status: 403 }
      );
    }
  };
}

/**
 * Wrapper только для админов
 */
export function withAdmin(
  handler: (request: NextRequest, user: JWTPayload) => Promise<NextResponse>
) {
  return withRole(['admin'], handler);
}

/**
 * Wrapper для любых авторизованных пользователей
 */
export function withUser(
  handler: (request: NextRequest, user: JWTPayload) => Promise<NextResponse>
) {
  return withRole(['user', 'admin'], handler);
}

/**
 * Rate limiting middleware
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minute
) {
  return async (request: NextRequest): Promise<boolean> => {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const key = `${ip}`;

    const current = rateLimitStore.get(key);
    
    if (!current || now > current.resetTime) {
      // Новое окно или сброс
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return true;
    }

    if (current.count >= maxRequests) {
      return false; // Превышен лимит
    }

    // Увеличиваем счетчик
    current.count++;
    return true;
  };
}

/**
 * Wrapper с rate limiting
 */
export function withRateLimit(
  maxRequests: number = 10,
  windowMs: number = 60000,
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  const checkRateLimit = rateLimit(maxRequests, windowMs);
  
  return async (request: NextRequest): Promise<NextResponse> => {
    const allowed = await checkRateLimit(request);
    
    if (!allowed) {
      return NextResponse.json(
        { 
          error: 'Rate Limit Exceeded', 
          message: `Too many requests. Try again later.` 
        },
        { status: 429 }
      );
    }

    return handler(request);
  };
}

/**
 * Комбинированный wrapper с аутентификацией и rate limiting
 */
export function withAuthAndRateLimit(
  maxRequests: number = 100,
  windowMs: number = 60000,
  handler: (request: NextRequest, user: JWTPayload) => Promise<NextResponse>
) {
  return withRateLimit(maxRequests, windowMs, withAuth(handler));
}

/**
 * Middleware для проверки email verification
 */
export async function requireEmailVerified(user: JWTPayload): Promise<void> {
  // Здесь нужно будет проверить в базе данных
  // Пока что заглушка
  console.log('Checking email verification for user:', user.userId);
}

/**
 * Утилита для извлечения пользователя из cookie
 */
export function extractUserFromCookies(request: NextRequest): JWTPayload | null {
  try {
    const token = request.cookies.get('access_token')?.value;
    if (!token) return null;

    // Здесь нужно будет добавить верификацию токена
    // Пока что заглушка
    return null;
  } catch {
    return null;
  }
}

/**
 * Проверка CORS для API
 */
export function corsHeaders(origin?: string) {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3080',
    'https://railway-saas.com',
    process.env.FRONTEND_URL
  ].filter(Boolean);

  const corsOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  return {
    'Access-Control-Allow-Origin': corsOrigin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
}

/**
 * Wrapper для добавления CORS headers
 */
export function withCors(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: corsHeaders(request.headers.get('origin') || undefined)
      });
    }

    const response = await handler(request);
    
    // Add CORS headers to response
    const headers = corsHeaders(request.headers.get('origin') || undefined);
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  };
}
