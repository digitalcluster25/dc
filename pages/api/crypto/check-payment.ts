// 🔍 Check Payment Status API - CRYPTO_BILLING_MODULE
// pages/api/crypto/check-payment.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { 
  CheckPaymentRequest, 
  CheckPaymentResponse, 
  PaymentStatus 
} from '../../../modules/crypto-billing/types/crypto-billing.types';
import { findPaymentById, updatePaymentStatus } from './create-payment';
import { getAddressBalance } from '../../../modules/crypto-billing/lib/wallet-generator';
import { getCryptoRate } from '../../../modules/crypto-billing/lib/crypto-rates';
import { SYSTEM_CONFIG } from '../../../modules/crypto-billing/utils/constants';
import { safeParseFloat } from '../../../modules/crypto-billing/utils/formatters';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CheckPaymentResponse>
) {
  // Поддерживаем GET и POST запросы
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      payment: null
    });
  }

  try {
    // Получаем paymentId из параметров или body
    let paymentId: string;
    
    if (req.method === 'GET') {
      paymentId = req.query.paymentId as string;
    } else {
      const body: CheckPaymentRequest = req.body;
      paymentId = body.paymentId;
    }

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        payment: null
      });
    }

    // Находим платеж
    let payment = findPaymentById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        payment: null
      });
    }

    // Проверяем не истек ли платеж
    const now = new Date();
    if (payment.status === 'pending' && payment.expiresAt < now) {
      payment = updatePaymentStatus(paymentId, 'expired');
    }

    // Если платеж уже завершен или провален, возвращаем как есть
    if (['completed', 'failed', 'expired'].includes(payment!.status)) {
      return res.status(200).json({
        success: true,
        payment: payment!
      });
    }

    // Проверяем баланс кошелька только для активных платежей
    if (['pending', 'confirming'].includes(payment!.status)) {
      await checkPaymentOnBlockchain(payment!);
      
      // Перезагружаем обновленный платеж
      payment = findPaymentById(paymentId);
    }

    return res.status(200).json({
      success: true,
      payment: payment!,
      transactionInfo: payment!.transactionHash ? {
        hash: payment!.transactionHash,
        confirmations: payment!.confirmations,
        amount: payment!.cryptoAmount,
        timestamp: payment!.confirmedAt || new Date()
      } : undefined
    });

  } catch (error) {
    console.error('Check payment error:', error);
    
    return res.status(500).json({
      success: false,
      payment: null
    });
  }
}

/**
 * Проверка платежа в блокчейне
 */
async function checkPaymentOnBlockchain(payment: any) {
  try {
    // Получаем текущий баланс адреса
    const balance = await getAddressBalance(payment.paymentAddress, payment.cryptoCurrency);
    const balanceAmount = safeParseFloat(balance, 0);
    const requiredAmount = safeParseFloat(payment.cryptoAmount, 0);

    console.log(`🔍 Checking payment ${payment.id}:`, {
      address: payment.paymentAddress,
      currency: payment.cryptoCurrency,
      balance: balanceAmount,
      required: requiredAmount
    });

    // Если баланс достаточный
    if (balanceAmount >= requiredAmount) {
      
      // Если статус еще pending, переводим в confirming
      if (payment.status === 'pending') {
        updatePaymentStatus(payment.id, 'confirming', {
          transactionHash: generateFakeTransactionHash(payment.cryptoCurrency),
          confirmations: 0
        });
        
        console.log(`💰 Payment ${payment.id} received, waiting for confirmations`);
      }
      
      // Если статус confirming, проверяем подтверждения
      if (payment.status === 'confirming') {
        const currentConfirmations = await getCurrentConfirmations(payment.cryptoCurrency);
        const requiredConfirmations = payment.requiredConfirmations;
        
        updatePaymentStatus(payment.id, 'confirming', {
          confirmations: currentConfirmations
        });
        
        // Если достаточно подтверждений, помечаем как confirmed
        if (currentConfirmations >= requiredConfirmations) {
          updatePaymentStatus(payment.id, 'confirmed', {
            confirmedAt: new Date()
          });
          
          console.log(`✅ Payment ${payment.id} confirmed with ${currentConfirmations} confirmations`);
          
          // Запускаем активацию сервиса
          await activateService(payment);
        }
      }
    }
    
    // Проверяем переплату
    if (balanceAmount > requiredAmount * 1.1) { // Если переплата больше 10%
      console.warn(`⚠️ Overpayment detected for ${payment.id}: ${balanceAmount} vs ${requiredAmount}`);
      // В реальном проекте здесь будет логика зачисления излишка на баланс
    }

  } catch (error) {
    console.error(`Error checking payment ${payment.id} on blockchain:`, error);
    
    // При ошибке проверки блокчейна помечаем как failed если прошло слишком много времени
    const maxWaitTime = SYSTEM_CONFIG.MAX_CONFIRMATION_TIME[payment.cryptoCurrency] || 60;
    const waitTime = (new Date().getTime() - payment.createdAt.getTime()) / (1000 * 60);
    
    if (waitTime > maxWaitTime) {
      updatePaymentStatus(payment.id, 'failed', {
        failureReason: 'Blockchain check timeout'
      });
    }
  }
}

/**
 * Генерация фейкового хеша транзакции для демо
 */
function generateFakeTransactionHash(currency: string): string {
  const prefix = currency === 'BTC' ? '' : '0x';
  const length = currency === 'BTC' ? 64 : 64;
  
  let hash = prefix;
  for (let i = 0; i < length; i++) {
    hash += Math.floor(Math.random() * 16).toString(16);
  }
  
  return hash;
}

/**
 * Получение текущего количества подтверждений (симуляция)
 */
async function getCurrentConfirmations(currency: string): Promise<number> {
  // Для демо симулируем рост подтверждений со временем
  const minConfirmations = SYSTEM_CONFIG.MIN_CONFIRMATIONS[currency] || 1;
  const random = Math.random();
  
  if (random < 0.3) return 0;
  if (random < 0.6) return Math.floor(minConfirmations / 2);
  if (random < 0.9) return minConfirmations;
  return minConfirmations + Math.floor(Math.random() * 5);
}

/**
 * Активация сервиса после подтверждения платежа
 */
async function activateService(payment: any) {
  try {
    console.log(`🚀 Activating service ${payment.serviceType} for payment ${payment.id}`);
    
    // Симулируем активацию сервиса
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2 секунды "активации"
    
    const serviceDetails = {
      type: payment.serviceType,
      endpoint: generateServiceEndpoint(payment.serviceType),
      credentials: generateServiceCredentials(payment.serviceType)
    };
    
    updatePaymentStatus(payment.id, 'completed', {
      completedAt: new Date(),
      serviceDetails
    });
    
    console.log(`✅ Service ${payment.serviceType} activated for payment ${payment.id}`);
    
    // TODO: Здесь будет интеграция с Railway API для реального создания сервиса
    
  } catch (error) {
    console.error(`Failed to activate service for payment ${payment.id}:`, error);
    
    updatePaymentStatus(payment.id, 'failed', {
      failureReason: 'Service activation failed'
    });
  }
}

/**
 * Генерация endpoint для сервиса
 */
function generateServiceEndpoint(serviceType: string): string {
  const subdomain = `${serviceType}-${Math.random().toString(36).substring(2, 8)}`;
  return `https://${subdomain}.railway.app`;
}

/**
 * Генерация учетных данных для сервиса
 */
function generateServiceCredentials(serviceType: string): Record<string, string> {
  const baseCredentials = {
    serviceId: `srv_${Math.random().toString(36).substring(2, 10)}`,
    apiKey: `key_${Math.random().toString(36).substring(2, 20)}`,
  };
  
  switch (serviceType) {
    case 'wordpress':
      return {
        ...baseCredentials,
        adminUsername: 'admin',
        adminPassword: Math.random().toString(36).substring(2, 12),
        dbHost: 'localhost',
        dbName: `wp_${Math.random().toString(36).substring(2, 8)}`
      };
    
    case 'database':
      return {
        ...baseCredentials,
        dbHost: `db-${Math.random().toString(36).substring(2, 8)}.railway.app`,
        dbPort: '5432',
        dbUser: 'postgres',
        dbPassword: Math.random().toString(36).substring(2, 16),
        dbName: `db_${Math.random().toString(36).substring(2, 8)}`
      };
    
    case 'api':
      return {
        ...baseCredentials,
        apiEndpoint: `https://api-${Math.random().toString(36).substring(2, 8)}.railway.app`,
        authToken: `token_${Math.random().toString(36).substring(2, 24)}`
      };
    
    default:
      return baseCredentials;
  }
}

/**
 * Утилита для ручной проверки всех активных платежей
 */
export async function checkAllActivePayments() {
  const { getAllPayments } = await import('./create-payment');
  const allPayments = getAllPayments();
  
  const activePayments = allPayments.filter(p => 
    ['pending', 'confirming'].includes(p.status)
  );
  
  console.log(`🔄 Checking ${activePayments.length} active payments`);
  
  for (const payment of activePayments) {
    await checkPaymentOnBlockchain(payment);
  }
}

// Запускаем автоматическую проверку активных платежей каждые 30 секунд
setInterval(checkAllActivePayments, 30 * 1000);
