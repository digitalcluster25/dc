// 🔐 Authentication Middleware - CRYPTO_BILLING_MODULE
// modules/crypto-billing/lib/middleware.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { verify } from 'jsonwebtoken';
import { API_LIMITS } from '../utils/constants';

// Rate limiting store (в продакшене - Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Интерфейс для аутентифицированного пользователя
 */
export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: 'user' | 'admin';
  isActive: boolean;
  permissions: string[];
}

/**
 * Расширяем NextApiRequest для аутентифицированных запросов
 */
export interface AuthenticatedRequest extends NextApiRequest {
  user: AuthenticatedUser;
}

/**
 * Middleware для проверки аутентификации
 */
export async function requireAuth(req: NextApiRequest): Promise<AuthenticatedUser> {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('UNAUTHORIZED: Missing or invalid authorization header');
  }

  const token = authHeader.substring(7);
  
  try {
    const jwtSecret = process.env.CRYPTO_BILLING_SECRET || 'default-jwt-secret';
    const decoded = verify(token, jwtSecret) as any;
    
    // Проверяем что токен содержит необходимые поля
    if (!decoded.userId || !decoded.email) {
      throw new Error('UNAUTHORIZED: Invalid token payload');
    }

    // В реальном проекте здесь будет запрос к базе данных
    const user: AuthenticatedUser = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role || 'user',
      isActive: true,
      permissions: decoded.permissions || ['crypto:payment:create', 'crypto:payment:view']
    };

    // Проверяем активность пользователя
    if (!user.isActive) {
      throw new Error('FORBIDDEN: User account is inactive');
    }

    return user;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('UNAUTHORIZED')) {
      throw error;
    }
    throw new Error('UNAUTHORIZED: Invalid or expired token');
  }
}

/**
 * Middleware для проверки прав доступа
 */
export function requirePermission(permission: string) {
  return async (req: NextApiRequest): Promise<AuthenticatedUser> => {
    const user = await requireAuth(req);
    
    // Админы имеют все права
    if (user.role === 'admin') {
      return user;
    }
    
    // Проверяем наличие конкретного права
    if (!user.permissions.includes(permission)) {
      throw new Error(`FORBIDDEN: Missing permission: ${permission}`);
    }
    
    return user;
  };
}

/**
 * Rate limiting middleware
 */
export function rateLimit(options: {
  requests: number;
  windowMs: number;
  keyGenerator?: (req: NextApiRequest) => string;
}) {
  return (req: NextApiRequest, res: NextApiResponse, next?: () => void): boolean => {
    const key = options.keyGenerator ? options.keyGenerator(req) : getClientIP(req);
    const now = Date.now();
    const windowStart = now - options.windowMs;
    
    // Получаем текущий счетчик для клиента
    const current = rateLimitStore.get(key) || { count: 0, resetTime: now + options.windowMs };
    
    // Если окно истекло, сбрасываем счетчик
    if (now > current.resetTime) {
      current.count = 0;
      current.resetTime = now + options.windowMs;
    }
    
    // Проверяем лимит
    if (current.count >= options.requests) {
      // Устанавливаем заголовки rate limit
      res.setHeader('X-RateLimit-Limit', options.requests);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', Math.ceil(current.resetTime / 1000));
      
      res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later',
        retryAfter: Math.ceil((current.resetTime - now) / 1000)
      });
      
      return false;
    }
    
    // Увеличиваем счетчик
    current.count++;
    rateLimitStore.set(key, current);
    
    // Устанавливаем заголовки
    res.setHeader('X-RateLimit-Limit', options.requests);
    res.setHeader('X-RateLimit-Remaining', options.requests - current.count);
    res.setHeader('X-RateLimit-Reset', Math.ceil(current.resetTime / 1000));
    
    return true;
  };
}

/**
 * Middleware для валидации входных данных
 */
export function validateInput<T>(schema: {
  [K in keyof T]: {
    required?: boolean;
    type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
    enum?: any[];
    min?: number;
    max?: number;
    pattern?: RegExp;
  };
}) {
  return (data: any): T => {
    const errors: string[] = [];
    const validated: any = {};
    
    // Проверяем каждое поле схемы
    for (const [fieldName, rules] of Object.entries(schema)) {
      const value = data[fieldName];
      
      // Проверка обязательности
      if (rules.required && (value === undefined || value === null)) {
        errors.push(`Field '${fieldName}' is required`);
        continue;
      }
      
      // Если поле не обязательное и отсутствует, пропускаем
      if (value === undefined || value === null) {
        continue;
      }
      
      // Проверка типа
      if (rules.type) {
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        if (actualType !== rules.type) {
          errors.push(`Field '${fieldName}' must be of type ${rules.type}`);
          continue;
        }
      }
      
      // Проверка enum
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`Field '${fieldName}' must be one of: ${rules.enum.join(', ')}`);
        continue;
      }
      
      // Проверка длины/размера для строк и чисел
      if (rules.min !== undefined) {
        if (typeof value === 'string' && value.length < rules.min) {
          errors.push(`Field '${fieldName}' must be at least ${rules.min} characters`);
          continue;
        }
        if (typeof value === 'number' && value < rules.min) {
          errors.push(`Field '${fieldName}' must be at least ${rules.min}`);
          continue;
        }
      }
      
      if (rules.max !== undefined) {
        if (typeof value === 'string' && value.length > rules.max) {
          errors.push(`Field '${fieldName}' must be no more than ${rules.max} characters`);
          continue;
        }
        if (typeof value === 'number' && value > rules.max) {
          errors.push(`Field '${fieldName}' must be no more than ${rules.max}`);
          continue;
        }
      }
      
      // Проверка паттерна для строк
      if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
        errors.push(`Field '${fieldName}' has invalid format`);
        continue;
      }
      
      validated[fieldName] = value;
    }
    
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }
    
    return validated as T;
  };
}

/**
 * Middleware для логирования запросов
 */
export function logRequest(req: NextApiRequest, startTime: number = Date.now()) {
  const clientIP = getClientIP(req);
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const method = req.method;
  const url = req.url;
  
  console.log(`🔐 ${method} ${url} from ${clientIP}`, {
    timestamp: new Date().toISOString(),
    userAgent,
    contentLength: req.headers['content-length'] || 0
  });
  
  // Возвращаем функцию для логирования ответа
  return (statusCode: number, user?: AuthenticatedUser) => {
    const duration = Date.now() - startTime;
    const level = statusCode >= 500 ? 'ERROR' : statusCode >= 400 ? 'WARN' : 'INFO';
    
    console.log(`${level} ${method} ${url} ${statusCode} ${duration}ms`, {
      userId: user?.userId,
      clientIP,
      duration,
      statusCode
    });
  };
}

/**
 * Получение IP адреса клиента
 */
export function getClientIP(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  const realIP = req.headers['x-real-ip'];
  const remoteIP = req.socket?.remoteAddress;
  
  if (forwarded && typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP && typeof realIP === 'string') {
    return realIP;
  }
  
  return remoteIP || 'unknown';
}

/**
 * Проверка безопасности заголовков
 */
export function validateSecurityHeaders(req: NextApiRequest): boolean {
  // Проверяем Content-Type для POST/PUT запросов
  if (['POST', 'PUT', 'PATCH'].includes(req.method || '')) {
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      return false;
    }
  }
  
  // Проверяем размер запроса
  const contentLength = parseInt(req.headers['content-length'] || '0');
  if (contentLength > 1024 * 1024) { // 1MB лимит
    return false;
  }
  
  return true;
}

/**
 * Wrapper для API handlers с полной защитой
 */
export function withCryptoBillingSecurity(options: {
  requireAuth?: boolean;
  requirePermission?: string;
  rateLimit?: { requests: number; windowMs: number };
  validation?: any;
}) {
  return function(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) {
    return async function(req: NextApiRequest, res: NextApiResponse) {
      const startTime = Date.now();
      const logResponse = logRequest(req, startTime);
      let user: AuthenticatedUser | undefined;
      
      try {
        // Проверка безопасности заголовков
        if (!validateSecurityHeaders(req)) {
          logResponse(400);
          return res.status(400).json({
            success: false,
            message: 'Invalid request headers'
          });
        }
        
        // Rate limiting
        if (options.rateLimit) {
          const rateLimitPassed = rateLimit(options.rateLimit)(req, res);
          if (!rateLimitPassed) {
            logResponse(429);
            return; // Response уже отправлен в rateLimit middleware
          }
        }
        
        // Аутентификация
        if (options.requireAuth || options.requirePermission) {
          if (options.requirePermission) {
            user = await requirePermission(options.requirePermission)(req);
          } else {
            user = await requireAuth(req);
          }
        }
        
        // Валидация входных данных
        if (options.validation && ['POST', 'PUT', 'PATCH'].includes(req.method || '')) {
          try {
            req.body = options.validation(req.body);
          } catch (error) {
            logResponse(400, user);
            return res.status(400).json({
              success: false,
              message: error instanceof Error ? error.message : 'Validation failed'
            });
          }
        }
        
        // Добавляем пользователя к запросу
        (req as AuthenticatedRequest).user = user!;
        
        // Выполняем основной handler
        await handler(req as AuthenticatedRequest, res);
        
        // Логируем успешный ответ
        logResponse(res.statusCode || 200, user);
        
      } catch (error) {
        console.error('API Error:', error);
        
        if (error instanceof Error) {
          if (error.message.startsWith('UNAUTHORIZED')) {
            logResponse(401, user);
            return res.status(401).json({
              success: false,
              message: 'Authentication required'
            });
          }
          
          if (error.message.startsWith('FORBIDDEN')) {
            logResponse(403, user);
            return res.status(403).json({
              success: false,
              message: 'Insufficient permissions'
            });
          }
          
          if (error.message.includes('Validation failed')) {
            logResponse(400, user);
            return res.status(400).json({
              success: false,
              message: error.message
            });
          }
        }
        
        logResponse(500, user);
        return res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    };
  };
}

/**
 * Очистка rate limit cache (для периодического обслуживания)
 */
export function cleanupRateLimitCache(): number {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key);
      cleaned++;
    }
  }
  
  console.log(`🧹 Cleaned ${cleaned} expired rate limit entries`);
  return cleaned;
}

// Запускаем очистку каждые 5 минут
if (typeof window === 'undefined') {
  setInterval(cleanupRateLimitCache, 5 * 60 * 1000);
}

/**
 * Типы для валидации различных запросов
 */
export const CreatePaymentValidation = validateInput<{
  serviceType: string;
  cryptoCurrency: string;
  network?: string;
}>({
  serviceType: {
    required: true,
    type: 'string',
    enum: ['wordpress', 'nextjs', 'api', 'database', 'docker', 'static-site']
  },
  cryptoCurrency: {
    required: true,
    type: 'string',
    enum: ['USDT', 'USDC', 'BUSD', 'BTC', 'ETH', 'MATIC']
  },
  network: {
    required: false,
    type: 'string',
    enum: ['ethereum', 'polygon', 'bsc', 'bitcoin', 'tron']
  }
});

export const CheckPaymentValidation = validateInput<{
  paymentId: string;
}>({
  paymentId: {
    required: true,
    type: 'string',
    min: 10,
    max: 50,
    pattern: /^pay_[a-zA-Z0-9_]+$/
  }
});

export const ConfirmPaymentValidation = validateInput<{
  paymentId: string;
  transactionHash: string;
  blockHeight?: number;
}>({
  paymentId: {
    required: true,
    type: 'string',
    pattern: /^pay_[a-zA-Z0-9_]+$/
  },
  transactionHash: {
    required: true,
    type: 'string',
    min: 64,
    max: 66
  },
  blockHeight: {
    required: false,
    type: 'number',
    min: 0
  }
});

/**
 * Предустановленные конфигурации middleware
 */
export const CryptoBillingMiddleware = {
  // Для создания платежей
  createPayment: withCryptoBillingSecurity({
    requireAuth: true,
    requirePermission: 'crypto:payment:create',
    rateLimit: { requests: 5, windowMs: 60 * 1000 }, // 5 запросов в минуту
    validation: CreatePaymentValidation
  }),
  
  // Для проверки статуса
  checkPayment: withCryptoBillingSecurity({
    requireAuth: true,
    requirePermission: 'crypto:payment:view',
    rateLimit: { requests: 60, windowMs: 60 * 1000 }, // 60 запросов в минуту
    validation: CheckPaymentValidation
  }),
  
  // Для подтверждения платежей
  confirmPayment: withCryptoBillingSecurity({
    requireAuth: true,
    requirePermission: 'crypto:payment:confirm',
    rateLimit: { requests: 10, windowMs: 60 * 1000 }, // 10 запросов в минуту
    validation: ConfirmPaymentValidation
  }),
  
  // Для получения курсов (публичный endpoint)
  getRates: withCryptoBillingSecurity({
    requireAuth: false,
    rateLimit: { requests: 30, windowMs: 60 * 1000 } // 30 запросов в минуту
  }),
  
  // Для админских функций
  admin: withCryptoBillingSecurity({
    requireAuth: true,
    requirePermission: 'crypto:admin',
    rateLimit: { requests: 100, windowMs: 60 * 1000 } // 100 запросов в минуту
  })
};
