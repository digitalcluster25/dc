// 🎯 Crypto Billing Module Initialization - CRYPTO_BILLING_MODULE

import { initializeCryptoRates } from './crypto-rates';
import { initializeWalletModule } from './wallet-generator';
import { ENV_KEYS, SYSTEM_CONFIG } from '../utils/constants';

/**
 * Инициализация модуля криптоплатежей
 */
export async function initializeCryptoBilling(): Promise<{
  success: boolean;
  message: string;
  config: any;
}> {
  console.log('🚀 Initializing CRYPTO_BILLING_MODULE...');

  try {
    // Проверяем переменные окружения
    const envCheck = checkEnvironmentVariables();
    if (!envCheck.success) {
      return envCheck;
    }

    // Инициализируем подмодули
    initializeCryptoRates();
    initializeWalletModule();

    // Проверяем подключения к внешним API
    await testExternalConnections();

    // Выводим конфигурацию
    const config = getModuleConfig();
    console.log('✅ CRYPTO_BILLING_MODULE initialized successfully');
    console.log('📊 Configuration:', config);

    return {
      success: true,
      message: 'Crypto billing module initialized successfully',
      config
    };

  } catch (error) {
    console.error('❌ Failed to initialize CRYPTO_BILLING_MODULE:', error);
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown initialization error',
      config: null
    };
  }
}

/**
 * Проверка переменных окружения
 */
function checkEnvironmentVariables(): { success: boolean; message: string } {
  const requiredVars = [
    ENV_KEYS.MASTER_SEED_PHRASE,
    ENV_KEYS.CRYPTO_BILLING_SECRET
  ];

  const missingVars = requiredVars.filter(key => !process.env[key]);

  if (missingVars.length > 0) {
    return {
      success: false,
      message: `Missing required environment variables: ${missingVars.join(', ')}`
    };
  }

  // Проверяем важные переменные
  const masterSeed = process.env[ENV_KEYS.MASTER_SEED_PHRASE];
  if (masterSeed === 'demo-seed-phrase-for-testing-only') {
    console.warn('⚠️  Using demo master seed phrase. Set proper MASTER_SEED_PHRASE for production!');
  }

  return { success: true, message: 'Environment variables OK' };
}

/**
 * Тестирование подключений к внешним API
 */
async function testExternalConnections(): Promise<void> {
  const connections = [];

  // Тестируем CoinGecko API
  try {
    const coingeckoResponse = await fetch('https://api.coingecko.com/api/v3/ping', {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    connections.push({
      service: 'CoinGecko',
      status: coingeckoResponse.ok ? 'OK' : 'ERROR',
      latency: Date.now() - Date.now() // Placeholder
    });
  } catch (error) {
    connections.push({
      service: 'CoinGecko',
      status: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Логируем результаты
  connections.forEach(conn => {
    if (conn.status === 'OK') {
      console.log(`✅ ${conn.service} connection: OK`);
    } else {
      console.warn(`⚠️  ${conn.service} connection: ${conn.status}`, conn.error || '');
    }
  });
}

/**
 * Получение конфигурации модуля
 */
function getModuleConfig() {
  return {
    version: '1.0.0',
    servicePriceEUR: SYSTEM_CONFIG.SERVICE_PRICE_EUR,
    paymentExpiryMinutes: SYSTEM_CONFIG.PAYMENT_EXPIRY_MINUTES,
    supportedCurrencies: ['USDT', 'USDC', 'BUSD', 'BTC', 'ETH', 'MATIC'],
    supportedServices: ['wordpress', 'nextjs', 'api', 'database', 'docker', 'static-site'],
    minConfirmations: SYSTEM_CONFIG.MIN_CONFIRMATIONS,
    environment: process.env.NODE_ENV || 'development',
    features: {
      lightningNetwork: false, // MVP не поддерживает
      multiSig: false,        // MVP не поддерживает  
      staking: false,         // Будущая функция
      defi: false             // Будущая функция
    }
  };
}

/**
 * Проверка здоровья модуля
 */
export async function checkCryptoBillingHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: any[];
  timestamp: Date;
}> {
  const checks = [];
  let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

  // Проверка переменных окружения
  const envCheck = checkEnvironmentVariables();
  checks.push({
    name: 'Environment Variables',
    status: envCheck.success ? 'pass' : 'fail',
    message: envCheck.message
  });

  if (!envCheck.success) {
    overallStatus = 'unhealthy';
  }

  // Проверка курсов валют
  try {
    const ratesResponse = await fetch('http://localhost:3000/api/crypto/rates');
    checks.push({
      name: 'Crypto Rates API',
      status: ratesResponse.ok ? 'pass' : 'fail',
      message: ratesResponse.ok ? 'Rates API working' : 'Rates API error'
    });

    if (!ratesResponse.ok && overallStatus === 'healthy') {
      overallStatus = 'degraded';
    }
  } catch (error) {
    checks.push({
      name: 'Crypto Rates API',
      status: 'fail',
      message: 'API unreachable'
    });
    overallStatus = 'unhealthy';
  }

  // Проверка генерации кошельков
  try {
    // Тестируем генерацию кошелька
    const { generatePaymentAddress } = await import('./wallet-generator');
    const testWallet = await generatePaymentAddress('USDT', 'test-payment-id');
    
    checks.push({
      name: 'Wallet Generation',
      status: testWallet.address ? 'pass' : 'fail',
      message: testWallet.address ? 'Wallet generation working' : 'Wallet generation failed'
    });

    if (!testWallet.address && overallStatus === 'healthy') {
      overallStatus = 'degraded';
    }
  } catch (error) {
    checks.push({
      name: 'Wallet Generation',
      status: 'fail',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
    overallStatus = 'unhealthy';
  }

  return {
    status: overallStatus,
    checks,
    timestamp: new Date()
  };
}

/**
 * Получение статистики модуля
 */
export function getCryptoBillingStats() {
  // В реальном проекте эти данные будут из базы данных
  return {
    totalPayments: 0,
    activePayments: 0,
    completedPayments: 0,
    failedPayments: 0,
    totalRevenue: 0,
    averagePaymentTime: 0,
    popularCurrencies: ['USDT', 'USDC', 'BTC'],
    popularServices: ['wordpress', 'nextjs', 'api'],
    uptime: '99.9%',
    lastUpdated: new Date()
  };
}

/**
 * Graceful shutdown модуля
 */
export async function shutdownCryptoBilling(): Promise<void> {
  console.log('🛑 Shutting down CRYPTO_BILLING_MODULE...');

  try {
    // Очищаем интервалы и таймеры
    // В реальном проекте здесь будет очистка ресурсов

    // Сохраняем состояние
    // В реальном проекте здесь будет сохранение в БД

    console.log('✅ CRYPTO_BILLING_MODULE shutdown complete');
  } catch (error) {
    console.error('❌ Error during CRYPTO_BILLING_MODULE shutdown:', error);
  }
}

/**
 * Middleware для инициализации в Next.js
 */
export function withCryptoBilling(handler: any) {
  return async (req: any, res: any) => {
    // Проверяем что модуль инициализирован
    if (!global.cryptoBillingInitialized) {
      const initResult = await initializeCryptoBilling();
      if (!initResult.success) {
        return res.status(500).json({
          error: 'Crypto billing module not initialized',
          message: initResult.message
        });
      }
      global.cryptoBillingInitialized = true;
    }

    return handler(req, res);
  };
}

/**
 * Проверка совместимости браузера
 */
export function checkBrowserCompatibility(): {
  compatible: boolean;
  features: Record<string, boolean>;
  recommendations: string[];
} {
  if (typeof window === 'undefined') {
    return {
      compatible: true,
      features: {},
      recommendations: []
    };
  }

  const features = {
    webCrypto: !!(window.crypto && window.crypto.subtle),
    clipboard: !!(navigator.clipboard && navigator.clipboard.writeText),
    qrReader: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    notifications: !!(window.Notification),
    serviceWorker: !!('serviceWorker' in navigator),
    webAssembly: !!(window.WebAssembly)
  };

  const compatible = features.webCrypto && features.clipboard;
  const recommendations = [];

  if (!features.webCrypto) {
    recommendations.push('Обновите браузер для поддержки Web Crypto API');
  }

  if (!features.clipboard) {
    recommendations.push('Включите доступ к буферу обмена для удобного копирования');
  }

  if (!features.qrReader) {
    recommendations.push('Разрешите доступ к камере для сканирования QR-кодов');
  }

  return {
    compatible,
    features,
    recommendations
  };
}

/**
 * Экспорт всех функций инициализации
 */
export {
  ENV_KEYS,
  SYSTEM_CONFIG
};
