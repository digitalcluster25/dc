// 💎 Constants for CRYPTO_BILLING_MODULE

import { CryptoCurrency, BlockchainNetwork, ServiceType } from '../types/crypto-billing.types';

// Основные константы системы
export const SYSTEM_CONFIG = {
  // Цена за сервис (в EUR)
  SERVICE_PRICE_EUR: 10,
  
  // Время жизни платежа (в минутах)
  PAYMENT_EXPIRY_MINUTES: 60,
  
  // Минимальное количество подтверждений
  MIN_CONFIRMATIONS: {
    BTC: 3,
    ETH: 12,
    USDT: 12,
    USDC: 12,
    BUSD: 20,
    MATIC: 128
  },
  
  // Максимальное время ожидания подтверждения (в минутах)
  MAX_CONFIRMATION_TIME: {
    BTC: 60,
    ETH: 15,
    USDT: 15,
    USDC: 15,  
    BUSD: 5,
    MATIC: 5
  }
} as const;

// Конфигурация блокчейн сетей
export const NETWORK_CONFIG = {
  ethereum: {
    name: 'Ethereum',
    chainId: 1,
    rpcUrl: 'https://mainnet.infura.io/v3/',
    explorerUrl: 'https://etherscan.io',
    nativeCurrency: 'ETH',
    blockTime: 12 // секунды
  },
  polygon: {
    name: 'Polygon',
    chainId: 137,
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    nativeCurrency: 'MATIC',
    blockTime: 2
  },
  bsc: {
    name: 'Binance Smart Chain',
    chainId: 56,
    rpcUrl: 'https://bsc-dataseed.binance.org',
    explorerUrl: 'https://bscscan.com',
    nativeCurrency: 'BNB',
    blockTime: 3
  },
  bitcoin: {
    name: 'Bitcoin',
    chainId: 0,
    rpcUrl: 'https://api.blockcypher.com/v1/btc/main',
    explorerUrl: 'https://blockchair.com/bitcoin',
    nativeCurrency: 'BTC',
    blockTime: 600
  }
} as const;

// Контракты токенов (Mainnet адреса)
export const TOKEN_CONTRACTS = {
  ethereum: {
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    USDC: '0xA0b86a33E6441c8f6532D93d85b8C1b4cf6d1b85'
  },
  polygon: {
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
  },
  bsc: {
    USDT: '0x55d398326f99059fF775485246999027B3197955',
    USDC: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    BUSD: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56'
  }
} as const;

// Приоритет валют для пользователя (по популярности)
export const CURRENCY_PRIORITY: CryptoCurrency[] = [
  'USDT', // Самый популярный stablecoin
  'USDC', // Второй по популярности stablecoin
  'BUSD', // BSC stablecoin с низкими комиссиями
  'ETH',  // Ethereum
  'BTC',  // Bitcoin
  'MATIC' // Polygon для дешевых транзакций
];

// Рекомендуемые валюты для новых пользователей
export const RECOMMENDED_CURRENCIES: CryptoCurrency[] = ['USDT', 'USDC', 'BUSD'];

// Thresholds для уведомлений
export const ALERT_THRESHOLDS = {
  // Минимальная сумма для обработки (в USD)
  MIN_PAYMENT_USD: 5,
  
  // Максимальная сумма без дополнительной проверки (в USD)  
  MAX_AUTO_CONFIRM_USD: 100,
  
  // Время для отправки напоминания о неоплаченном счете (в минутах)
  PAYMENT_REMINDER_MINUTES: 30,
  
  // Лимит неудачных попыток оплаты
  MAX_FAILED_ATTEMPTS: 3
} as const;

// Сообщения для пользователя
export const USER_MESSAGES = {
  ru: {
    PAYMENT_CREATED: 'Платеж создан. Переведите точную сумму на указанный адрес.',
    PAYMENT_PENDING: 'Ожидаем поступление платежа...',
    PAYMENT_CONFIRMING: 'Платеж получен, ждем подтверждения в блокчейне...',
    PAYMENT_CONFIRMED: 'Платеж подтвержден! Активируем ваш сервис.',
    PAYMENT_COMPLETED: 'Сервис успешно активирован!',
    PAYMENT_EXPIRED: 'Время платежа истекло. Создайте новый платеж.',
    PAYMENT_FAILED: 'Ошибка при обработке платежа.',
    
    INSUFFICIENT_AMOUNT: 'Сумма платежа меньше требуемой.',
    OVERPAYMENT_WARNING: 'Вы перевели больше требуемой суммы. Излишек будет зачислен на баланс.',
    NETWORK_CONGESTION: 'Сеть перегружена. Подтверждение может занять больше времени.',
    
    SERVICE_ACTIVATING: 'Активируем ваш сервис. Это займет несколько минут.',
    SERVICE_READY: 'Ваш сервис готов к использованию!',
    SERVICE_ERROR: 'Ошибка при активации сервиса. Обратитесь в поддержку.'
  },
  en: {
    PAYMENT_CREATED: 'Payment created. Send exact amount to provided address.',
    PAYMENT_PENDING: 'Waiting for payment...',
    PAYMENT_CONFIRMING: 'Payment received, waiting for blockchain confirmation...',
    PAYMENT_CONFIRMED: 'Payment confirmed! Activating your service.',
    PAYMENT_COMPLETED: 'Service successfully activated!',
    PAYMENT_EXPIRED: 'Payment expired. Please create a new payment.',
    PAYMENT_FAILED: 'Payment processing failed.',
    
    INSUFFICIENT_AMOUNT: 'Payment amount is less than required.',
    OVERPAYMENT_WARNING: 'You sent more than required. Excess will be credited to balance.',
    NETWORK_CONGESTION: 'Network is congested. Confirmation may take longer.',
    
    SERVICE_ACTIVATING: 'Activating your service. This will take a few minutes.',
    SERVICE_READY: 'Your service is ready to use!',
    SERVICE_ERROR: 'Service activation failed. Contact support.'
  }
} as const;

// Иконки для UI
export const CRYPTO_ICONS = {
  BTC: '₿',
  ETH: 'Ξ',
  USDT: '₮',
  USDC: '$',
  BUSD: '$',
  MATIC: '◈'
} as const;

// Цвета для UI
export const CRYPTO_COLORS = {
  BTC: '#F7931A',
  ETH: '#627EEA', 
  USDT: '#26A17B',
  USDC: '#2775CA',
  BUSD: '#F0B90B',
  MATIC: '#8247E5'
} as const;

// Форматирование чисел
export const NUMBER_FORMAT = {
  // Количество знаков после запятой
  CRYPTO_DECIMALS: {
    BTC: 8,
    ETH: 6,
    USDT: 2,
    USDC: 2,
    BUSD: 2,
    MATIC: 4
  },
  
  // Форматы для отображения
  CURRENCY_FORMAT: {
    USD: { symbol: '$', decimals: 2 },
    EUR: { symbol: '€', decimals: 2 },
    BTC: { symbol: '₿', decimals: 8 },
    ETH: { symbol: 'Ξ', decimals: 6 }
  }
} as const;

// Временные интервалы (в миллисекундах)
export const INTERVALS = {
  PAYMENT_CHECK: 30 * 1000,      // Проверка платежа каждые 30 секунд
  RATE_UPDATE: 60 * 1000,        // Обновление курсов каждую минуту
  BLOCKCHAIN_MONITOR: 15 * 1000, // Мониторинг блокчейна каждые 15 секунд
  CLEANUP_EXPIRED: 5 * 60 * 1000 // Очистка истекших платежей каждые 5 минут
} as const;

// Лимиты API
export const API_LIMITS = {
  // Максимальное количество одновременных платежей на пользователя
  MAX_CONCURRENT_PAYMENTS: 3,
  
  // Максимальное количество запросов в минуту
  RATE_LIMIT_PER_MINUTE: 60,
  
  // Максимальный размер ответа API
  MAX_RESPONSE_SIZE: 1024 * 1024, // 1MB
  
  // Timeout для внешних API запросов
  EXTERNAL_API_TIMEOUT: 10000 // 10 секунд
} as const;

// Пути к файлам
export const FILE_PATHS = {
  // Логи
  PAYMENT_LOGS: './logs/payments/',
  ERROR_LOGS: './logs/errors/',
  
  // QR коды
  QR_CODES_DIR: './public/qr-codes/',
  
  // Backups
  WALLET_BACKUP: './backups/wallets/',
  
  // Конфиг
  NETWORK_CONFIG: './config/networks.json'
} as const;

// Environment Variables ключи
export const ENV_KEYS = {
  // Blockchain APIs
  INFURA_PROJECT_ID: 'INFURA_PROJECT_ID',
  BLOCKCYPHER_TOKEN: 'BLOCKCYPHER_TOKEN',
  COINGECKO_API_KEY: 'COINGECKO_API_KEY',
  
  // Wallets
  MASTER_SEED_PHRASE: 'MASTER_SEED_PHRASE',
  HOT_WALLET_PRIVATE_KEY: 'HOT_WALLET_PRIVATE_KEY',
  
  // Networks
  ETHEREUM_NETWORK: 'ETHEREUM_NETWORK',
  BITCOIN_NETWORK: 'BITCOIN_NETWORK',
  
  // Security
  CRYPTO_BILLING_SECRET: 'CRYPTO_BILLING_SECRET',
  WEBHOOK_SECRET: 'WEBHOOK_SECRET'
} as const;

// Функции-помощники для работы с константами
export const getTokenContract = (network: BlockchainNetwork, currency: CryptoCurrency): string | undefined => {
  return TOKEN_CONTRACTS[network]?.[currency];
};

export const getMinConfirmations = (currency: CryptoCurrency): number => {
  return SYSTEM_CONFIG.MIN_CONFIRMATIONS[currency] || 1;
};

export const getMaxConfirmationTime = (currency: CryptoCurrency): number => {
  return SYSTEM_CONFIG.MAX_CONFIRMATION_TIME[currency] || 60;
};

export const getCryptoIcon = (currency: CryptoCurrency): string => {
  return CRYPTO_ICONS[currency] || '💎';
};

export const getCryptoColor = (currency: CryptoCurrency): string => {
  return CRYPTO_COLORS[currency] || '#000000';
};

export const getDecimalPlaces = (currency: CryptoCurrency): number => {
  return NUMBER_FORMAT.CRYPTO_DECIMALS[currency] || 6;
};

export const isStablecoin = (currency: CryptoCurrency): boolean => {
  return ['USDT', 'USDC', 'BUSD'].includes(currency);
};

export const getNetworkByCurrency = (currency: CryptoCurrency): BlockchainNetwork => {
  switch (currency) {
    case 'BTC':
      return 'bitcoin';
    case 'ETH':
    case 'USDT':
    case 'USDC':
      return 'ethereum';
    case 'BUSD':
      return 'bsc';
    case 'MATIC':
      return 'polygon';
    default:
      return 'ethereum';
  }
};
