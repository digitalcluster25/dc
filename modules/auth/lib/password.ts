// 🔒 Password Utils for AUTH_MODULE

import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const SALT_ROUNDS = 12;

/**
 * Захешировать пароль
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    console.error('Password hashing failed:', error);
    throw new Error('Failed to hash password');
  }
}

/**
 * Проверить пароль
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    const isValid = await bcrypt.compare(password, hashedPassword);
    return isValid;
  } catch (error) {
    console.error('Password verification failed:', error);
    return false;
  }
}

/**
 * Сгенерировать случайный токен
 */
export function generateRandomToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Сгенерировать безопасный refresh token
 */
export function generateRefreshToken(): string {
  return generateRandomToken(64);
}

/**
 * Валидация силы пароля
 */
export interface PasswordStrength {
  isValid: boolean;
  score: number; // 0-100
  errors: string[];
  suggestions: string[];
}

export function validatePasswordStrength(password: string): PasswordStrength {
  const errors: string[] = [];
  const suggestions: string[] = [];
  let score = 0;

  // Минимальная длина
  if (password.length < 8) {
    errors.push('Пароль должен содержать минимум 8 символов');
  } else {
    score += 20;
  }

  // Максимальная длина
  if (password.length > 128) {
    errors.push('Пароль не должен превышать 128 символов');
    return { isValid: false, score: 0, errors, suggestions };
  }

  // Заглавные буквы
  if (!/[A-Z]/.test(password)) {
    errors.push('Пароль должен содержать заглавные буквы');
    suggestions.push('Добавьте заглавные буквы');
  } else {
    score += 15;
  }

  // Строчные буквы
  if (!/[a-z]/.test(password)) {
    errors.push('Пароль должен содержать строчные буквы');
    suggestions.push('Добавьте строчные буквы');
  } else {
    score += 15;
  }

  // Цифры
  if (!/\d/.test(password)) {
    errors.push('Пароль должен содержать цифры');
    suggestions.push('Добавьте цифры');
  } else {
    score += 15;
  }

  // Специальные символы
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Пароль должен содержать специальные символы');
    suggestions.push('Добавьте специальные символы (!@#$%^&*)');
  } else {
    score += 15;
  }

  // Дополнительные баллы за длину
  if (password.length >= 12) {
    score += 10;
  }
  if (password.length >= 16) {
    score += 10;
  }

  // Проверка на распространенные пароли
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey'
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Этот пароль слишком простой');
    suggestions.push('Используйте уникальный пароль');
    score = Math.max(0, score - 30);
  }

  // Проверка на повторяющиеся символы
  if (/(.)\1{2,}/.test(password)) {
    suggestions.push('Избегайте повторяющихся символов');
    score = Math.max(0, score - 10);
  }

  const isValid = errors.length === 0 && score >= 60;

  return {
    isValid,
    score: Math.min(100, score),
    errors,
    suggestions
  };
}

/**
 * Проверить, не является ли пароль скомпрометированным
 * (интеграция с Have I Been Pwned API)
 */
export async function checkPasswordBreach(password: string): Promise<boolean> {
  try {
    // Создаем SHA-1 хеш пароля
    const hash = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
    const prefix = hash.substring(0, 5);
    const suffix = hash.substring(5);

    // Запрос к API Have I Been Pwned
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    
    if (!response.ok) {
      // Если API недоступен, считаем пароль безопасным
      return false;
    }

    const data = await response.text();
    const lines = data.split('\n');

    // Ищем наш хеш в результатах
    for (const line of lines) {
      const [hashSuffix] = line.split(':');
      if (hashSuffix === suffix) {
        return true; // Пароль найден в базе утечек
      }
    }

    return false; // Пароль не найден в базе утечек
  } catch (error) {
    console.error('Password breach check failed:', error);
    // При ошибке считаем пароль безопасным
    return false;
  }
}

/**
 * Сгенерировать безопасный пароль
 */
export function generateSecurePassword(length: number = 16): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  const allChars = lowercase + uppercase + numbers + symbols;
  let password = '';

  // Обеспечиваем наличие хотя бы одного символа каждого типа
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Заполняем остальные позиции случайными символами
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Перемешиваем символы
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Очистить чувствительные данные из памяти
 */
export function clearSensitiveData(data: string): void {
  // В JavaScript нет прямого способа очистки памяти,
  // но мы можем перезаписать переменную
  if (typeof data === 'string') {
    // Это больше психологический эффект, чем реальная безопасность
    data = '*'.repeat(data.length);
  }
}

/**
 * Создать соль для дополнительного хеширования
 */
export function generateSalt(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Создать хеш с дополнительной солью
 */
export function createSaltedHash(data: string, salt: string): string {
  return crypto.createHash('sha256').update(data + salt).digest('hex');
}
