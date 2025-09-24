// 💳 Create Payment API - CRYPTO_BILLING_MODULE
// pages/api/crypto/create-payment.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '../../../modules/auth/lib/middleware';
import { 
  CreatePaymentRequest, 
  CreatePaymentResponse, 
  CryptoPayment, 
  ServiceType,
  CryptoCurrency,
  PaymentStatus 
} from '../../../modules/crypto-billing/types/crypto-billing.types';
import { generatePaymentAddress } from '../../../modules/crypto-billing/lib/wallet-generator';
import { getCryptoRate, calculateCryptoPrice } from '../../../modules/crypto-billing/lib/crypto-rates';
import { SYSTEM_CONFIG, getNetworkByCurrency } from '../../../modules/crypto-billing/utils/constants';
import { generatePaymentId } from '../../../modules/crypto-billing/utils/formatters';

// Временное хранилище платежей (в реальном проекте - PostgreSQL)
const tempPayments: CryptoPayment[] = [];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreatePaymentResponse>
) {
  // Только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    // Проверяем аутентификацию пользователя
    const user = await requireAuth(req);
    
    const { serviceType, cryptoCurrency, network }: CreatePaymentRequest = req.body;

    // Валидация входных данных
    if (!serviceType || !cryptoCurrency) {
      return res.status(400).json({
        success: false,
        message: 'serviceType и cryptoCurrency обязательны'
      });
    }

    // Проверяем поддерживаемые сервисы
    const supportedServices: ServiceType[] = ['wordpress', 'nextjs', 'api', 'database', 'docker', 'static-site'];
    if (!supportedServices.includes(serviceType)) {
      return res.status(400).json({
        success: false,
        message: `Неподдерживаемый тип сервиса: ${serviceType}`
      });
    }

    // Проверяем поддерживаемые криптовалюты
    const supportedCurrencies: CryptoCurrency[] = ['USDT', 'USDC', 'BUSD', 'BTC', 'ETH', 'MATIC'];
    if (!supportedCurrencies.includes(cryptoCurrency)) {
      return res.status(400).json({
        success: false,
        message: `Неподдерживаемая криптовалюта: ${cryptoCurrency}`
      });
    }

    // Проверяем лимит одновременных платежей пользователя
    const userActivePayments = tempPayments.filter(
      p => p.userId === user.userId && ['pending', 'confirming'].includes(p.status)
    );

    if (userActivePayments.length >= 3) {
      return res.status(429).json({
        success: false,
        message: 'Превышен лимит одновременных платежей (максимум 3)'
      });
    }

    // Получаем текущий курс криптовалюты
    const cryptoRate = await getCryptoRate(cryptoCurrency);
    if (!cryptoRate) {
      return res.status(503).json({
        success: false,
        message: 'Не удается получить курс криптовалюты. Попробуйте позже.'
      });
    }

    // Генерируем уникальный ID платежа
    const paymentId = generatePaymentId();

    // Генерируем адрес кошелька для платежа
    const walletData = await generatePaymentAddress(cryptoCurrency, paymentId);

    // Рассчитываем сумму в криптовалюте
    const priceEUR = SYSTEM_CONFIG.SERVICE_PRICE_EUR;
    const priceUSD = priceEUR * 1.09; // Примерный курс EUR/USD
    const cryptoAmount = calculateCryptoPrice(priceEUR, cryptoRate);

    // Генерируем QR-код для платежа
    const qrCodeData = await generateQRCode(walletData.address, cryptoAmount, cryptoCurrency);

    // Определяем время истечения платежа
    const expiresAt = new Date(Date.now() + SYSTEM_CONFIG.PAYMENT_EXPIRY_MINUTES * 60 * 1000);

    // Создаем объект платежа
    const newPayment: CryptoPayment = {
      id: paymentId,
      userId: user.userId,
      serviceType,
      cryptoCurrency,
      network: network || getNetworkByCurrency(cryptoCurrency),
      
      // Финансовые данные
      priceEUR,
      priceUSD,
      cryptoAmount,
      exchangeRate: cryptoRate.priceEUR,
      
      // Кошелек
      paymentAddress: walletData.address,
      privateKey: walletData.privateKey, // В реальном проекте - зашифровано
      qrCode: qrCodeData,
      
      // Статус и временные метки
      status: 'pending' as PaymentStatus,
      createdAt: new Date(),
      expiresAt,
      confirmations: 0,
      requiredConfirmations: SYSTEM_CONFIG.MIN_CONFIRMATIONS[cryptoCurrency] || 1,
      
      // Дополнительная информация
      userAgent: req.headers['user-agent'],
      ipAddress: getClientIP(req)
    };

    // Сохраняем платеж
    tempPayments.push(newPayment);

    // Логируем создание платежа
    console.log(`💳 Payment created:`, {
      paymentId,
      userId: user.userId,
      serviceType,
      cryptoCurrency,
      amount: cryptoAmount,
      address: walletData.address
    });

    // Возвращаем данные платежа (без приватного ключа)
    const responsePayment: CryptoPayment = {
      ...newPayment,
      privateKey: undefined // Не отправляем приватный ключ клиенту
    };

    return res.status(201).json({
      success: true,
      message: 'Платеж успешно создан',
      payment: responsePayment
    });

  } catch (error) {
    console.error('Create payment error:', error);
    
    if (error instanceof Error) {
      if (error.message.startsWith('UNAUTHORIZED')) {
        return res.status(401).json({
          success: false,
          message: 'Требуется авторизация'
        });
      }
      
      if (error.message.startsWith('FORBIDDEN')) {
        return res.status(403).json({
          success: false,
          message: 'Недостаточно прав доступа'
        });
      }
    }
    
    return res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
}

/**
 * Генерация QR кода для платежа (заглушка)
 */
async function generateQRCode(address: string, amount: string, currency: CryptoCurrency): Promise<string> {
  // В реальном проекте здесь будет использоваться библиотека qrcode
  // Для демо возвращаем base64 заглушку
  
  const qrData = {
    address,
    amount,
    currency,
    timestamp: Date.now()
  };
  
  // Простая base64 кодировка данных QR
  return Buffer.from(JSON.stringify(qrData)).toString('base64');
}

/**
 * Получение IP адреса клиента
 */
function getClientIP(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  
  return req.socket.remoteAddress || 'unknown';
}

/**
 * Утилита для получения всех платежей пользователя (для тестирования)
 */
export function getUserPayments(userId: string): CryptoPayment[] {
  return tempPayments
    .filter(payment => payment.userId === userId)
    .map(payment => ({ ...payment, privateKey: undefined })); // Убираем приватные ключи
}

/**
 * Утилита для получения всех платежей (для админа)
 */
export function getAllPayments(): CryptoPayment[] {
  return tempPayments.map(payment => ({ ...payment, privateKey: undefined }));
}

/**
 * Утилита для поиска платежа по ID
 */
export function findPaymentById(paymentId: string): CryptoPayment | null {
  const payment = tempPayments.find(p => p.id === paymentId);
  
  if (payment) {
    return { ...payment, privateKey: undefined };
  }
  
  return null;
}

/**
 * Утилита для обновления статуса платежа
 */
export function updatePaymentStatus(
  paymentId: string, 
  status: PaymentStatus, 
  updates: Partial<CryptoPayment> = {}
): CryptoPayment | null {
  const paymentIndex = tempPayments.findIndex(p => p.id === paymentId);
  
  if (paymentIndex === -1) return null;
  
  // Обновляем платеж
  tempPayments[paymentIndex] = {
    ...tempPayments[paymentIndex],
    status,
    ...updates,
    updatedAt: new Date()
  };
  
  const updatedPayment = tempPayments[paymentIndex];
  
  console.log(`📊 Payment ${paymentId} status updated to ${status}`);
  
  return { ...updatedPayment, privateKey: undefined };
}

/**
 * Очистка истекших платежей
 */
export function cleanupExpiredPayments(): number {
  const now = new Date();
  const initialCount = tempPayments.length;
  
  // Помечаем истекшие платежи как expired
  tempPayments.forEach(payment => {
    if (payment.status === 'pending' && payment.expiresAt < now) {
      payment.status = 'expired';
      console.log(`⏰ Payment ${payment.id} expired`);
    }
  });
  
  // Удаляем старые истекшие платежи (старше 24 часов)
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const beforeCleanup = tempPayments.length;
  
  for (let i = tempPayments.length - 1; i >= 0; i--) {
    const payment = tempPayments[i];
    if (payment.status === 'expired' && payment.createdAt < dayAgo) {
      tempPayments.splice(i, 1);
    }
  }
  
  const removedCount = beforeCleanup - tempPayments.length;
  if (removedCount > 0) {
    console.log(`🧹 Removed ${removedCount} old expired payments`);
  }
  
  return initialCount - tempPayments.length;
}

// Запускаем очистку каждые 5 минут
setInterval(cleanupExpiredPayments, 5 * 60 * 1000);
