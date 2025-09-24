// ✅ Confirm Payment API - CRYPTO_BILLING_MODULE
// pages/api/crypto/confirm-payment.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '../../../modules/auth/lib/middleware';
import { 
  ConfirmPaymentRequest, 
  ConfirmPaymentResponse 
} from '../../../modules/crypto-billing/types/crypto-billing.types';
import { findPaymentById, updatePaymentStatus } from './create-payment';
import { validateAddress } from '../../../modules/crypto-billing/lib/wallet-generator';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ConfirmPaymentResponse>
) {
  // Только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
      serviceActivated: false
    });
  }

  try {
    // Проверяем аутентификацию пользователя
    const user = await requireAuth(req);
    
    const { paymentId, transactionHash, blockHeight }: ConfirmPaymentRequest = req.body;

    // Валидация входных данных
    if (!paymentId || !transactionHash) {
      return res.status(400).json({
        success: false,
        message: 'paymentId и transactionHash обязательны',
        serviceActivated: false
      });
    }

    // Находим платеж
    const payment = findPaymentById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Платеж не найден',
        serviceActivated: false
      });
    }

    // Проверяем что платеж принадлежит пользователю
    if (payment.userId !== user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Нет доступа к этому платежу',
        serviceActivated: false
      });
    }

    // Проверяем статус платежа
    if (!['pending', 'confirming'].includes(payment.status)) {
      return res.status(400).json({
        success: false,
        message: `Платеж находится в статусе ${payment.status} и не может быть подтвержден`,
        serviceActivated: false
      });
    }

    // Валидация хеша транзакции (базовая проверка)
    if (!isValidTransactionHash(transactionHash, payment.cryptoCurrency)) {
      return res.status(400).json({
        success: false,
        message: 'Некорректный формат хеша транзакции',
        serviceActivated: false
      });
    }

    // Проверяем не истек ли платеж
    const now = new Date();
    if (payment.expiresAt < now) {
      updatePaymentStatus(paymentId, 'expired');
      
      return res.status(400).json({
        success: false,
        message: 'Время платежа истекло',
        serviceActivated: false
      });
    }

    // В реальном проекте здесь будет проверка транзакции в блокчейне
    const transactionValid = await validateTransactionOnBlockchain(
      transactionHash, 
      payment.paymentAddress, 
      payment.cryptoAmount,
      payment.cryptoCurrency
    );

    if (!transactionValid) {
      return res.status(400).json({
        success: false,
        message: 'Транзакция не найдена или недействительна',
        serviceActivated: false
      });
    }

    // Обновляем статус платежа
    const updatedPayment = updatePaymentStatus(paymentId, 'confirmed', {
      transactionHash,
      blockHeight,
      confirmedAt: new Date(),
      confirmations: 1 // В реальном проекте получаем из блокчейна
    });

    // Активируем сервис
    const serviceActivated = await activateUserService(updatedPayment!);
    
    const finalStatus = serviceActivated ? 'completed' : 'confirmed';
    const finalPayment = updatePaymentStatus(paymentId, finalStatus, {
      completedAt: serviceActivated ? new Date() : undefined
    });

    console.log(`✅ Payment ${paymentId} confirmed and service ${serviceActivated ? 'activated' : 'pending'}`);

    return res.status(200).json({
      success: true,
      message: serviceActivated 
        ? 'Платеж подтвержден и сервис активирован' 
        : 'Платеж подтвержден, активация сервиса в процессе',
      serviceActivated,
      serviceDetails: serviceActivated ? generateServiceDetails(payment.serviceType) : undefined
    });

  } catch (error) {
    console.error('Confirm payment error:', error);
    
    if (error instanceof Error) {
      if (error.message.startsWith('UNAUTHORIZED')) {
        return res.status(401).json({
          success: false,
          message: 'Требуется авторизация',
          serviceActivated: false
        });
      }
    }
    
    return res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера',
      serviceActivated: false
    });
  }
}

/**
 * Валидация формата хеша транзакции
 */
function isValidTransactionHash(hash: string, currency: string): boolean {
  switch (currency) {
    case 'BTC':
      // Bitcoin transaction hash: 64 hex characters
      return /^[a-fA-F0-9]{64}$/.test(hash);
    
    case 'ETH':
    case 'USDT':
    case 'USDC':
    case 'MATIC':
      // Ethereum transaction hash: 0x + 64 hex characters
      return /^0x[a-fA-F0-9]{64}$/.test(hash);
    
    case 'BUSD':
      // BSC transaction hash (аналогично Ethereum)
      return /^0x[a-fA-F0-9]{64}$/.test(hash);
    
    default:
      return false;
  }
}

/**
 * Проверка транзакции в блокчейне (симуляция)
 */
async function validateTransactionOnBlockchain(
  txHash: string, 
  address: string, 
  expectedAmount: string, 
  currency: string
): Promise<boolean> {
  try {
    console.log(`🔍 Validating transaction ${txHash} for ${currency}`);
    
    // В реальном проекте здесь будет запрос к blockchain explorer API
    // Для демо возвращаем true с вероятностью 80%
    await new Promise(resolve => setTimeout(resolve, 1000)); // Симуляция задержки API
    
    const isValid = Math.random() > 0.2; // 80% вероятность успеха
    
    if (isValid) {
      console.log(`✅ Transaction ${txHash} validated successfully`);
    } else {
      console.log(`❌ Transaction ${txHash} validation failed`);
    }
    
    return isValid;
    
  } catch (error) {
    console.error(`Error validating transaction ${txHash}:`, error);
    return false;
  }
}

/**
 * Активация сервиса для пользователя
 */
async function activateUserService(payment: any): Promise<boolean> {
  try {
    console.log(`🚀 Activating ${payment.serviceType} service for user ${payment.userId}`);
    
    // Симулируем активацию сервиса (в реальном проекте - Railway API)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 90% вероятность успешной активации
    const success = Math.random() > 0.1;
    
    if (success) {
      console.log(`✅ Service ${payment.serviceType} activated for payment ${payment.id}`);
    } else {
      console.error(`❌ Failed to activate service ${payment.serviceType} for payment ${payment.id}`);
    }
    
    return success;
    
  } catch (error) {
    console.error('Service activation error:', error);
    return false;
  }
}

/**
 * Генерация деталей активированного сервиса
 */
function generateServiceDetails(serviceType: string) {
  const baseUrl = `https://${serviceType}-${Math.random().toString(36).substring(2, 8)}.railway.app`;
  
  switch (serviceType) {
    case 'wordpress':
      return {
        type: 'wordpress',
        url: baseUrl,
        adminUrl: `${baseUrl}/wp-admin`,
        credentials: {
          username: 'admin',
          password: Math.random().toString(36).substring(2, 12)
        }
      };
    
    case 'nextjs':
      return {
        type: 'nextjs',
        url: baseUrl,
        apiUrl: `${baseUrl}/api`,
        deployment: {
          status: 'deployed',
          buildTime: '2m 34s'
        }
      };
    
    case 'api':
      return {
        type: 'api',
        url: baseUrl,
        endpoints: {
          docs: `${baseUrl}/docs`,
          health: `${baseUrl}/health`
        },
        apiKey: `sk_${Math.random().toString(36).substring(2, 20)}`
      };
    
    case 'database':
      return {
        type: 'database',
        host: `db-${Math.random().toString(36).substring(2, 8)}.railway.app`,
        port: 5432,
        database: `db_${Math.random().toString(36).substring(2, 8)}`,
        credentials: {
          username: 'postgres',
          password: Math.random().toString(36).substring(2, 16)
        }
      };
    
    case 'docker':
      return {
        type: 'docker',
        url: baseUrl,
        image: 'custom-app:latest',
        status: 'running',
        resources: {
          cpu: '0.5 vCPU',
          memory: '512MB'
        }
      };
    
    case 'static-site':
      return {
        type: 'static-site',
        url: baseUrl,
        cdn: `https://cdn.railway.app/${Math.random().toString(36).substring(2, 10)}`,
        status: 'deployed'
      };
    
    default:
      return {
        type: serviceType,
        url: baseUrl,
        status: 'active'
      };
  }
}

/**
 * Получение списка активированных сервисов пользователя
 */
export async function getUserServices(userId: string) {
  const { getAllPayments } = await import('./create-payment');
  const userPayments = getAllPayments().filter(p => 
    p.userId === userId && p.status === 'completed'
  );
  
  return userPayments.map(payment => ({
    paymentId: payment.id,
    serviceType: payment.serviceType,
    activatedAt: payment.completedAt,
    details: generateServiceDetails(payment.serviceType)
  }));
}
