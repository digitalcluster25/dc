// 🛠️ Formatters and Utilities for CRYPTO_BILLING_MODULE

import { CryptoCurrency, CryptoRate } from '../types/crypto-billing.types';
import { getDecimalPlaces, isStablecoin, CRYPTO_ICONS, CRYPTO_COLORS, NUMBER_FORMAT } from './constants';

/**
 * Форматирование криптовалютных сумм
 */
export function formatCryptoAmount(amount: string | number, currency: CryptoCurrency): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  const decimals = getDecimalPlaces(currency);
  const icon = CRYPTO_ICONS[currency];
  
  if (isNaN(numAmount)) return `0 ${currency}`;
  
  return `${numAmount.toFixed(decimals)} ${currency}`;
}

/**
 * Форматирование фиатных валют
 */
export function formatFiatAmount(amount: number, currency: 'USD' | 'EUR' = 'EUR'): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return formatter.format(amount);
}

/**
 * Форматирование адреса кошелька для отображения
 */
export function formatWalletAddress(address: string, startChars: number = 6, endChars: number = 4): string {
  if (address.length <= startChars + endChars) {
    return address;
  }
  
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Форматирование времени до истечения
 */
export function formatTimeRemaining(expiresAt: Date): string {
  const now = new Date();
  const timeLeft = expiresAt.getTime() - now.getTime();
  
  if (timeLeft <= 0) return 'Истекло';
  
  const minutes = Math.floor(timeLeft / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
  
  if (minutes > 0) {
    return `${minutes}м ${seconds}с`;
  }
  
  return `${seconds}с`;
}

/**
 * Форматирование хеша транзакции
 */
export function formatTransactionHash(hash: string, chars: number = 8): string {
  if (!hash) return 'N/A';
  return `${hash.slice(0, chars)}...${hash.slice(-chars)}`;
}

/**
 * Расчет суммы в криптовалюте по курсу
 */
export function calculateCryptoAmount(fiatAmount: number, rate: CryptoRate): string {
  if (!rate || rate.priceEUR <= 0) return '0';
  
  const cryptoAmount = fiatAmount / rate.priceEUR;
  const decimals = getDecimalPlaces(rate.currency);
  
  return cryptoAmount.toFixed(decimals);
}

/**
 * Валидация криптовалютного адреса
 */
export function validateCryptoAddress(address: string, currency: CryptoCurrency): boolean {
  if (!address) return false;
  
  switch (currency) {
    case 'BTC':
      // Bitcoin адрес: начинается с 1, 3 или bc1
      return /^(1|3|bc1)[a-zA-HJ-NP-Z0-9]{25,62}$/.test(address);
    
    case 'ETH':
    case 'USDT':
    case 'USDC':
    case 'MATIC':
      // Ethereum адрес: 42 символа, начинается с 0x
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    
    case 'BUSD':
      // BSC адрес (аналогично Ethereum)
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    
    default:
      return false;
  }
}

/**
 * Валидация приватного ключа
 */
export function validatePrivateKey(privateKey: string): boolean {
  if (!privateKey) return false;
  
  // Базовая проверка длины (64 hex символа для большинства криптовалют)
  return /^[a-fA-F0-9]{64}$/.test(privateKey.replace(/^0x/, ''));
}

/**
 * Генерация уникального ID для платежа
 */
export function generatePaymentId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `pay_${timestamp}_${randomStr}`;
}

/**
 * Генерация seed для кошелька (НЕ для продакшена!)
 */
export function generateDemoSeed(): string {
  const words = [
    'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
    'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid'
  ];
  
  return Array.from({ length: 12 }, () => 
    words[Math.floor(Math.random() * words.length)]
  ).join(' ');
}

/**
 * Проверка не является ли сумма пылью (dust)
 */
export function isDustAmount(amount: string, currency: CryptoCurrency): boolean {
  const numAmount = parseFloat(amount);
  
  // Минимальные суммы для разных валют
  const dustLimits = {
    BTC: 0.00001,   // 1000 сатоши
    ETH: 0.001,     // 0.001 ETH
    USDT: 0.01,     // 1 цент
    USDC: 0.01,     // 1 цент
    BUSD: 0.01,     // 1 цент
    MATIC: 0.1      // 0.1 MATIC
  };
  
  return numAmount < (dustLimits[currency] || 0.01);
}

/**
 * Форматирование изменения курса за 24 часа
 */
export function formatPriceChange(change24h: number): string {
  const sign = change24h >= 0 ? '+' : '';
  return `${sign}${change24h.toFixed(2)}%`;
}

/**
 * Получение CSS класса для изменения цены
 */
export function getPriceChangeClass(change24h: number): string {
  if (change24h > 0) return 'text-green-500';
  if (change24h < 0) return 'text-red-500';
  return 'text-gray-500';
}

/**
 * Генерация QR кода данных (строка для QR библиотеки)
 */
export function generateQRData(address: string, amount: string, currency: CryptoCurrency): string {
  switch (currency) {
    case 'BTC':
      return `bitcoin:${address}?amount=${amount}`;
    
    case 'ETH':
      return `ethereum:${address}?value=${parseFloat(amount) * 1e18}`;
    
    case 'USDT':
    case 'USDC':
      // ERC-20 токены
      return `ethereum:${address}?value=${amount}`;
    
    case 'BUSD':
      // BSC токен
      return `https://link.trustwallet.com/send?coin=20000714&address=${address}&amount=${amount}`;
    
    case 'MATIC':
      return `ethereum:${address}?value=${parseFloat(amount) * 1e18}`;
    
    default:
      return address;
  }
}

/**
 * Преобразование времени в читаемый формат
 */
export function timeAgo(date: Date): string {
  const now = new Date();
  const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (secondsAgo < 60) return `${secondsAgo} сек. назад`;
  
  const minutesAgo = Math.floor(secondsAgo / 60);
  if (minutesAgo < 60) return `${minutesAgo} мин. назад`;
  
  const hoursAgo = Math.floor(minutesAgo / 60);
  if (hoursAgo < 24) return `${hoursAgo} ч. назад`;
  
  const daysAgo = Math.floor(hoursAgo / 24);
  return `${daysAgo} дн. назад`;
}

/**
 * Получение блокчейн эксплорера URL для транзакции
 */
export function getExplorerUrl(txHash: string, currency: CryptoCurrency): string {
  const baseUrls = {
    BTC: 'https://blockchair.com/bitcoin/transaction/',
    ETH: 'https://etherscan.io/tx/',
    USDT: 'https://etherscan.io/tx/',
    USDC: 'https://etherscan.io/tx/',
    BUSD: 'https://bscscan.com/tx/',
    MATIC: 'https://polygonscan.com/tx/'
  };
  
  return `${baseUrls[currency] || baseUrls.ETH}${txHash}`;
}

/**
 * Форматирование статуса платежа для пользователя
 */
export function formatPaymentStatus(status: string): { text: string; color: string; icon: string } {
  switch (status) {
    case 'pending':
      return { text: 'Ожидание оплаты', color: 'text-yellow-500', icon: '⏳' };
    case 'confirming':
      return { text: 'Подтверждение', color: 'text-blue-500', icon: '🔄' };
    case 'confirmed':
      return { text: 'Подтверждено', color: 'text-green-500', icon: '✅' };
    case 'completed':
      return { text: 'Завершено', color: 'text-green-600', icon: '🎉' };
    case 'expired':
      return { text: 'Истекло', color: 'text-red-500', icon: '⏰' };
    case 'failed':
      return { text: 'Ошибка', color: 'text-red-600', icon: '❌' };
    default:
      return { text: 'Неизвестно', color: 'text-gray-500', icon: '❓' };
  }
}

/**
 * Сокращение больших чисел (1000 -> 1K)
 */
export function abbreviateNumber(num: number): string {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';  
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toString();
}

/**
 * Безопасное парсинг числа
 */
export function safeParseFloat(value: string | number, defaultValue: number = 0): number {
  if (typeof value === 'number') return isNaN(value) ? defaultValue : value;
  
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Проверка валидности email для уведомлений
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Генерация случайного hex цвета
 */
export function randomHexColor(): string {
  return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

/**
 * Debounce функция для оптимизации API вызовов
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T, 
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Throttle функция для ограничения частоты вызовов
 */
export function throttle<T extends (...args: any[]) => void>(
  func: T, 
  delay: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, delay);
    }
  };
}

/**
 * Проверка на мобильное устройство
 */
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Копирование текста в буфер обмена
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback для старых браузеров
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Получение информации о браузере для логирования
 */
export function getBrowserInfo(): { name: string; version: string; os: string } {
  const userAgent = navigator.userAgent;
  
  let browserName = 'Unknown';
  let browserVersion = '0';
  let os = 'Unknown';
  
  // Определение браузера
  if (userAgent.includes('Firefox')) {
    browserName = 'Firefox';
    browserVersion = userAgent.match(/Firefox\/(\d+)/)?.[1] || '0';
  } else if (userAgent.includes('Chrome')) {
    browserName = 'Chrome';
    browserVersion = userAgent.match(/Chrome\/(\d+)/)?.[1] || '0';
  } else if (userAgent.includes('Safari')) {
    browserName = 'Safari';
    browserVersion = userAgent.match(/Safari\/(\d+)/)?.[1] || '0';
  }
  
  // Определение ОС
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iOS')) os = 'iOS';
  
  return { name: browserName, version: browserVersion, os };
}
