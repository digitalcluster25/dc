// 💎 Crypto Billing Types for CRYPTO_BILLING_MODULE

// Поддерживаемые криптовалюты
export type CryptoCurrency = 'USDT' | 'USDC' | 'BUSD' | 'BTC' | 'ETH' | 'MATIC';

// Blockchain сети
export type BlockchainNetwork = 'ethereum' | 'polygon' | 'bsc' | 'bitcoin' | 'tron';

// Типы сервисов (10€ за каждый)
export type ServiceType = 
  | 'wordpress'
  | 'nextjs'
  | 'api'
  | 'database'
  | 'docker'
  | 'static-site';

// Статусы платежа
export type PaymentStatus = 
  | 'pending'      // Ожидание платежа
  | 'confirming'   // Подтверждение в блокчейне
  | 'confirmed'    // Платеж подтвержден
  | 'completed'    // Сервис активирован
  | 'expired'      // Истек срок ожидания
  | 'failed';      // Ошибка платежа

// Информация о криптовалюте
export interface CryptoCurrencyInfo {
  symbol: CryptoCurrency;
  name: string;
  network: BlockchainNetwork;
  decimals: number;
  contractAddress?: string; // Для токенов ERC-20
  icon: string;
  isStablecoin: boolean;
  minConfirmations: number;
  avgConfirmationTime: number; // в минутах
}

// Текущие курсы криптовалют
export interface CryptoRate {
  currency: CryptoCurrency;
  priceUSD: number;
  priceEUR: number;
  change24h: number;
  lastUpdated: Date;
}

// Информация о сервисе
export interface ServiceInfo {
  type: ServiceType;
  name: string;
  description: string;
  icon: string;
  priceEUR: number; // 10€ для всех в MVP
  features: string[];
  deploymentTime: number; // в минутах
}

// Данные для создания платежа
export interface CreatePaymentRequest {
  userId: string;
  serviceType: ServiceType;
  cryptoCurrency: CryptoCurrency;
  network?: BlockchainNetwork;
}

// Ответ при создании платежа
export interface CreatePaymentResponse {
  success: boolean;
  message: string;
  payment?: CryptoPayment;
}

// Основная структура криптоплатежа
export interface CryptoPayment {
  id: string;
  userId: string;
  serviceType: ServiceType;
  cryptoCurrency: CryptoCurrency;
  network: BlockchainNetwork;
  
  // Финансовые данные
  priceEUR: number;
  priceUSD: number;
  cryptoAmount: string; // В строке для точности
  exchangeRate: number;
  
  // Wallet данные
  paymentAddress: string;
  privateKey?: string; // Только на сервере
  qrCode: string; // Base64 QR код
  
  // Статус и временные метки
  status: PaymentStatus;
  createdAt: Date;
  expiresAt: Date;
  confirmedAt?: Date;
  completedAt?: Date;
  
  // Транзакция
  transactionHash?: string;
  blockHeight?: number;
  confirmations: number;
  requiredConfirmations: number;
  
  // Дополнительная информация
  userAgent?: string;
  ipAddress?: string;
  refundAddress?: string;
}

// История транзакций
export interface TransactionHistory {
  id: string;
  paymentId: string;
  txHash: string;
  blockHeight: number;
  confirmations: number;
  amount: string;
  from: string;
  to: string;
  gasUsed?: number;
  gasPrice?: string;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'failed';
}

// Пользовательский баланс и статистика
export interface UserCryptoBalance {
  userId: string;
  availableCredits: number; // Количество доступных сервисов
  totalPaidEUR: number;
  totalTransactions: number;
  lastPaymentDate?: Date;
  preferredCurrency?: CryptoCurrency;
}

// Статистика платежей для админа
export interface PaymentAnalytics {
  totalPayments: number;
  totalVolumeEUR: number;
  totalVolumeUSD: number;
  paymentsByCurrency: Record<CryptoCurrency, number>;
  paymentsByService: Record<ServiceType, number>;
  conversionRate: number; // % успешных платежей
  averageConfirmationTime: number; // в минутах
  popularCurrencies: CryptoCurrency[];
  recentTransactions: CryptoPayment[];
}

// Конфигурация кошелька
export interface WalletConfig {
  network: BlockchainNetwork;
  masterSeed: string;
  derivationPath: string;
  addressIndex: number;
  privateKey: string;
  publicKey: string;
  address: string;
}

// Мониторинг блокчейна
export interface BlockchainMonitor {
  network: BlockchainNetwork;
  currency: CryptoCurrency;
  lastBlockHeight: number;
  lastUpdateTime: Date;
  isOnline: boolean;
  avgBlockTime: number; // в секундах
  pendingTransactions: number;
}

// API запросы и ответы
export interface CheckPaymentRequest {
  paymentId: string;
}

export interface CheckPaymentResponse {
  success: boolean;
  payment: CryptoPayment;
  transactionInfo?: {
    hash: string;
    confirmations: number;
    amount: string;
    timestamp: Date;
  };
}

export interface GetRatesResponse {
  success: boolean;
  rates: CryptoRate[];
  lastUpdated: Date;
}

export interface ConfirmPaymentRequest {
  paymentId: string;
  transactionHash: string;
  blockHeight?: number;
}

export interface ConfirmPaymentResponse {
  success: boolean;
  message: string;
  serviceActivated: boolean;
  serviceDetails?: {
    type: ServiceType;
    endpoint?: string;
    credentials?: Record<string, string>;
  };
}

// Errors и валидация
export interface CryptoPaymentError {
  code: string;
  message: string;
  field?: string;
}

export const CRYPTO_ERROR_CODES = {
  INVALID_CURRENCY: 'INVALID_CURRENCY',
  INSUFFICIENT_AMOUNT: 'INSUFFICIENT_AMOUNT',
  PAYMENT_EXPIRED: 'PAYMENT_EXPIRED',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  WALLET_ERROR: 'WALLET_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;

// Константы для валют
export const SUPPORTED_CURRENCIES: CryptoCurrencyInfo[] = [
  // Основные Stablecoins
  {
    symbol: 'USDT',
    name: 'Tether USD',
    network: 'ethereum',
    decimals: 6,
    contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    icon: '/crypto/usdt.svg',
    isStablecoin: true,
    minConfirmations: 12,
    avgConfirmationTime: 3
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    network: 'ethereum',
    decimals: 6,
    contractAddress: '0xA0b86a33E6441c8f6532D93d85b8C1b4cf6d1b85',
    icon: '/crypto/usdc.svg',
    isStablecoin: true,
    minConfirmations: 12,
    avgConfirmationTime: 3
  },
  {
    symbol: 'BUSD',
    name: 'Binance USD',
    network: 'bsc',
    decimals: 18,
    contractAddress: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    icon: '/crypto/busd.svg',
    isStablecoin: true,
    minConfirmations: 20,
    avgConfirmationTime: 1
  },
  
  // Основные криптовалюты
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    network: 'bitcoin',
    decimals: 8,
    icon: '/crypto/btc.svg',
    isStablecoin: false,
    minConfirmations: 3,
    avgConfirmationTime: 10
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    network: 'ethereum',
    decimals: 18,
    icon: '/crypto/eth.svg',
    isStablecoin: false,
    minConfirmations: 12,
    avgConfirmationTime: 3
  },
  {
    symbol: 'MATIC',
    name: 'Polygon',
    network: 'polygon',
    decimals: 18,
    icon: '/crypto/matic.svg',
    isStablecoin: false,
    minConfirmations: 128,
    avgConfirmationTime: 1
  }
];

// Информация о сервисах
export const SERVICE_CATALOG: ServiceInfo[] = [
  {
    type: 'wordpress',
    name: 'WordPress CMS',
    description: 'Готовый сайт с админ-панелью',
    icon: '📝',
    priceEUR: 10,
    features: ['WordPress 6.0+', 'Admin панель', 'SSL сертификат', '1GB хранилище'],
    deploymentTime: 5
  },
  {
    type: 'nextjs',
    name: 'Next.js App',
    description: 'React приложение с SSR',
    icon: '⚡',
    priceEUR: 10,
    features: ['Next.js 13+', 'SSR/SSG', 'TypeScript', 'Vercel оптимизация'],
    deploymentTime: 3
  },
  {
    type: 'api',
    name: 'REST API Service',
    description: 'Backend API на Node.js',
    icon: '🔧',
    priceEUR: 10,
    features: ['Node.js 18+', 'Express.js', 'API документация', 'Rate limiting'],
    deploymentTime: 2
  },
  {
    type: 'database',
    name: 'Database Service',
    description: 'PostgreSQL или MongoDB',
    icon: '🗃️',
    priceEUR: 10,
    features: ['PostgreSQL 15', 'Автобэкапы', '10GB хранилище', 'Мониторинг'],
    deploymentTime: 2
  },
  {
    type: 'docker',
    name: 'Docker Container',
    description: 'Кастомный Docker образ',
    icon: '🐳',
    priceEUR: 10,
    features: ['Docker поддержка', 'CI/CD', 'Health checks', 'Logs'],
    deploymentTime: 4
  },
  {
    type: 'static-site',
    name: 'Static Website',
    description: 'HTML/CSS/JS статичный сайт',
    icon: '🌐',
    priceEUR: 10,
    features: ['CDN доставка', 'SSL сертификат', 'Custom домен', 'Кэширование'],
    deploymentTime: 1
  }
];

// Utility типы
export type CryptoCurrencySymbol = CryptoCurrencyInfo['symbol'];
export type ServiceTypeKey = ServiceInfo['type'];

// Context типы для React
export interface CryptoBillingContextType {
  // Состояние
  currentPayment: CryptoPayment | null;
  userBalance: UserCryptoBalance | null;
  cryptoRates: CryptoRate[];
  loading: boolean;
  
  // Методы
  createPayment: (request: CreatePaymentRequest) => Promise<CryptoPayment | null>;
  checkPayment: (paymentId: string) => Promise<CryptoPayment | null>;
  getCryptoRates: () => Promise<CryptoRate[]>;
  getUserBalance: (userId: string) => Promise<UserCryptoBalance | null>;
  
  // Утилиты
  formatCryptoAmount: (amount: string, currency: CryptoCurrency) => string;
  calculatePrice: (priceEUR: number, currency: CryptoCurrency) => string;
  generateQRCode: (address: string, amount: string, currency: CryptoCurrency) => Promise<string>;
}
