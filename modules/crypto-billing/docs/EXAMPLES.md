# 🚀 Examples - CRYPTO_BILLING_MODULE

## Быстрый старт

### 1. Базовая настройка

```typescript
// app/layout.tsx
import { CryptoRatesProvider } from '@/modules/crypto-billing';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <CryptoRatesProvider>
          {children}
        </CryptoRatesProvider>
      </body>
    </html>
  );
}
```

### 2. Страница выбора сервиса

```tsx
// app/services/page.tsx
'use client';

import { useState } from 'react';
import { ServiceSelector } from '@/modules/crypto-billing';
import { ServiceType } from '@/modules/crypto-billing/types/crypto-billing.types';

export default function ServicesPage() {
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);

  const handleServiceSelect = (serviceType: ServiceType) => {
    setSelectedService(serviceType);
    // Переход к оплате
    window.location.href = `/checkout?service=${serviceType}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-8">
      <ServiceSelector
        onServiceSelect={handleServiceSelect}
        selectedService={selectedService}
      />
    </div>
  );
}
```

### 3. Страница оплаты

```tsx
// app/checkout/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { CryptoCheckout } from '@/modules/crypto-billing';
import { ServiceType, CryptoPayment } from '@/modules/crypto-billing/types/crypto-billing.types';

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const serviceType = searchParams.get('service') as ServiceType;

  const handlePaymentCreated = (payment: CryptoPayment) => {
    console.log('Payment created:', payment.id);
    // Переход к странице статуса
    window.location.href = `/payment/${payment.id}`;
  };

  const handlePaymentComplete = (payment: CryptoPayment) => {
    console.log('Payment completed:', payment.id);
    // Переход к активированному сервису
    window.location.href = `/services/${payment.serviceType}`;
  };

  if (!serviceType) {
    return <div>Выберите сервис</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-8">
      <CryptoCheckout
        serviceType={serviceType}
        onPaymentCreated={handlePaymentCreated}
        onPaymentComplete={handlePaymentComplete}
      />
    </div>
  );
}
```

### 4. Страница статуса платежа

```tsx
// app/payment/[id]/page.tsx
'use client';

import { PaymentStatus } from '@/modules/crypto-billing';
import { PaymentStatus as PaymentStatusType } from '@/modules/crypto-billing/types/crypto-billing.types';

export default function PaymentStatusPage({ params }: { params: { id: string } }) {
  const handleStatusChange = (status: PaymentStatusType) => {
    if (status === 'completed') {
      // Показать уведомление об успешной активации
      alert('Сервис успешно активирован!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-8">
      <div className="max-w-4xl mx-auto">
        <PaymentStatus
          paymentId={params.id}
          onStatusChange={handleStatusChange}
          autoRefresh={true}
        />
      </div>
    </div>
  );
}
```

---

## Использование хуков

### 1. Hook для управления платежами

```tsx
// components/PaymentFlow.tsx
'use client';

import { useCryptoPayment } from '@/modules/crypto-billing';

export function PaymentFlow() {
  const {
    currentPayment,
    userPayments,
    loading,
    error,
    createPayment,
    checkPaymentStatus,
    clearError
  } = useCryptoPayment();

  const handleCreatePayment = async () => {
    const payment = await createPayment('wordpress', 'USDT');
    if (payment) {
      console.log('Payment created:', payment.id);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-500/20 p-4 rounded border border-red-500">
          <p className="text-red-300">{error}</p>
          <button onClick={clearError} className="text-red-400 underline">
            Закрыть
          </button>
        </div>
      )}

      <button
        onClick={handleCreatePayment}
        disabled={loading}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium disabled:opacity-50"
      >
        {loading ? 'Создание...' : 'Создать платеж'}
      </button>

      {currentPayment && (
        <div className="bg-white/10 p-4 rounded">
          <h3 className="font-bold text-white">Текущий платеж</h3>
          <p className="text-gray-300">ID: {currentPayment.id}</p>
          <p className="text-gray-300">Статус: {currentPayment.status}</p>
        </div>
      )}
    </div>
  );
}
```

### 2. Hook для курсов валют

```tsx
// components/CurrencyDisplay.tsx
'use client';

import { useCryptoRates, useCurrencyConverter } from '@/modules/crypto-billing';

export function CurrencyDisplay() {
  const { rates, loading, error, refreshRates } = useCryptoRates();
  const { convertFromFiat } = useCurrencyConverter();

  if (loading) return <div>Загрузка курсов...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  const servicePrice = 10; // EUR

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Курсы валют</h3>
        <button
          onClick={refreshRates}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          Обновить
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rates.map(rate => {
          const cryptoAmount = convertFromFiat(servicePrice, rate.currency);
          
          return (
            <div key={rate.currency} className="bg-white/10 p-4 rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-white">{rate.currency}</span>
                <span className={`text-sm ${
                  rate.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {rate.change24h >= 0 ? '+' : ''}{rate.change24h.toFixed(2)}%
                </span>
              </div>
              
              <div className="text-2xl font-bold text-blue-400">
                {cryptoAmount.toFixed(rate.currency === 'BTC' ? 8 : 4)}
              </div>
              
              <div className="text-sm text-gray-300">
                €{rate.priceEUR.toFixed(4)} за 1 {rate.currency}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### 3. Hook для статистики платежей

```tsx
// components/PaymentStats.tsx
'use client';

import { usePaymentStats } from '@/modules/crypto-billing';

export function PaymentStats() {
  const { stats, recentPayments, popularServices } = usePaymentStats();

  return (
    <div className="space-y-6">
      {/* Общая статистика */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/10 p-4 rounded text-center">
          <div className="text-2xl font-bold text-blue-400">{stats.total}</div>
          <div className="text-sm text-gray-300">Всего платежей</div>
        </div>
        
        <div className="bg-white/10 p-4 rounded text-center">
          <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
          <div className="text-sm text-gray-300">Завершено</div>
        </div>
        
        <div className="bg-white/10 p-4 rounded text-center">
          <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
          <div className="text-sm text-gray-300">В процессе</div>
        </div>
        
        <div className="bg-white/10 p-4 rounded text-center">
          <div className="text-2xl font-bold text-blue-400">€{stats.totalSpentEUR}</div>
          <div className="text-sm text-gray-300">Потрачено</div>
        </div>
      </div>

      {/* Последние платежи */}
      <div className="bg-white/10 p-6 rounded">
        <h3 className="text-lg font-bold text-white mb-4">Последние платежи</h3>
        <div className="space-y-3">
          {recentPayments.map(payment => (
            <div key={payment.id} className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">
                  {payment.serviceType}
                </div>
                <div className="text-sm text-gray-300">
                  {payment.cryptoAmount} {payment.cryptoCurrency}
                </div>
              </div>
              <div className="text-right">
                <div className={`font-medium ${
                  payment.status === 'completed' ? 'text-green-400' :
                  payment.status === 'pending' ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {payment.status}
                </div>
                <div className="text-sm text-gray-300">
                  {new Date(payment.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## API Usage Examples

### 1. Создание платежа (Server-side)

```typescript
// pages/api/custom/create-service-payment.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createPayment, getCryptoRate } from '@/modules/crypto-billing';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { serviceType, cryptoCurrency, userId } = req.body;

    // Получаем текущий курс
    const rate = await getCryptoRate(cryptoCurrency);
    if (!rate) {
      return res.status(400).json({ error: 'Currency rate not available' });
    }

    // Создаем платеж
    const payment = await createPayment({
      userId,
      serviceType,
      cryptoCurrency
    });

    return res.status(201).json({
      success: true,
      payment: {
        id: payment.id,
        amount: payment.cryptoAmount,
        address: payment.paymentAddress,
        qrCode: payment.qrCode,
        expiresAt: payment.expiresAt
      }
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

### 2. Webhook для обработки платежей

```typescript
// pages/api/webhooks/crypto-payment.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { updatePaymentStatus, activateService } from '@/modules/crypto-billing';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Проверяем подпись webhook (в реальном проекте)
    const { paymentId, transactionHash, confirmations } = req.body;

    // Обновляем статус платежа
    const payment = await updatePaymentStatus(paymentId, 'confirming', {
      transactionHash,
      confirmations
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Если достаточно подтверждений, активируем сервис
    if (confirmations >= payment.requiredConfirmations) {
      await activateService(payment);
      
      await updatePaymentStatus(paymentId, 'completed', {
        completedAt: new Date()
      });

      // Отправляем уведомление пользователю
      await sendServiceActivatedEmail(payment.userId, payment.serviceType);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function sendServiceActivatedEmail(userId: string, serviceType: string) {
  // Логика отправки email уведомления
  console.log(`Service ${serviceType} activated for user ${userId}`);
}

async function activateService(payment: any) {
  // Логика активации сервиса через Railway API
  console.log(`Activating ${payment.serviceType} service...`);
}
```

---

## Интеграция с Railway

### 1. Активация сервиса после платежа

```typescript
// lib/railway-integration.ts
import { Railway } from '@/modules/railway';
import { CryptoPayment, ServiceType } from '@/modules/crypto-billing';

export async function activateUserService(payment: CryptoPayment): Promise<{
  success: boolean;
  serviceUrl?: string;
  credentials?: any;
}> {
  try {
    const railway = new Railway();
    
    // Определяем шаблон для сервиса
    const templateConfig = getServiceTemplate(payment.serviceType);
    
    // Создаем проект в Railway
    const project = await railway.createProject({
      name: `${payment.serviceType}-${payment.userId}`,
      template: templateConfig.templateId,
      environmentVariables: {
        USER_ID: payment.userId,
        PAYMENT_ID: payment.id,
        SERVICE_TYPE: payment.serviceType
      }
    });

    // Ждем деплоя
    await railway.waitForDeployment(project.id);

    // Генерируем домен
    const domain = await railway.generateDomain(project.id);

    return {
      success: true,
      serviceUrl: domain.url,
      credentials: generateServiceCredentials(payment.serviceType)
    };
  } catch (error) {
    console.error('Service activation error:', error);
    return { success: false };
  }
}

function getServiceTemplate(serviceType: ServiceType) {
  const templates = {
    wordpress: { templateId: 'wordpress-6.0', port: 80 },
    nextjs: { templateId: 'nextjs-13', port: 3000 },
    api: { templateId: 'nodejs-express', port: 3000 },
    database: { templateId: 'postgresql-15', port: 5432 },
    docker: { templateId: 'custom-docker', port: 8080 },
    'static-site': { templateId: 'static-nginx', port: 80 }
  };
  
  return templates[serviceType] || templates.api;
}

function generateServiceCredentials(serviceType: ServiceType) {
  // Генерация учетных данных для сервиса
  switch (serviceType) {
    case 'wordpress':
      return {
        adminUser: 'admin',
        adminPassword: generateSecurePassword(),
        dbPassword: generateSecurePassword()
      };
    case 'database':
      return {
        username: 'postgres',
        password: generateSecurePassword(),
        database: `db_${Math.random().toString(36).substring(2, 8)}`
      };
    default:
      return {
        apiKey: generateApiKey()
      };
  }
}

function generateSecurePassword(): string {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

function generateApiKey(): string {
  return 'sk_' + Math.random().toString(36).substring(2, 20);
}
```

---

## Мониторинг и логирование

### 1. Система логирования

```typescript
// lib/crypto-billing-logger.ts
export class CryptoBillingLogger {
  static logPaymentCreated(payment: any) {
    console.log(`💳 Payment created: ${payment.id}`, {
      userId: payment.userId,
      serviceType: payment.serviceType,
      currency: payment.cryptoCurrency,
      amount: payment.cryptoAmount,
      timestamp: new Date()
    });
  }

  static logPaymentConfirmed(paymentId: string, txHash: string) {
    console.log(`✅ Payment confirmed: ${paymentId}`, {
      transactionHash: txHash,
      timestamp: new Date()
    });
  }

  static logServiceActivated(paymentId: string, serviceType: string) {
    console.log(`🚀 Service activated: ${serviceType} for payment ${paymentId}`, {
      timestamp: new Date()
    });
  }

  static logError(context: string, error: any) {
    console.error(`❌ Error in ${context}:`, {
      error: error.message,
      stack: error.stack,
      timestamp: new Date()
    });
  }
}
```

### 2. Health Check система

```typescript
// pages/api/health/crypto-billing.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { checkCryptoBillingHealth } from '@/modules/crypto-billing';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const health = await checkCryptoBillingHealth();
  
  const statusCode = health.status === 'healthy' ? 200 : 
                    health.status === 'degraded' ? 200 : 503;

  res.status(statusCode).json(health);
}
```

---

## Тестирование

### 1. Unit тесты

```typescript
// __tests__/crypto-billing.test.ts
import { formatCryptoAmount, validateAddress, calculateCryptoPrice } from '@/modules/crypto-billing';

describe('Crypto Billing Utils', () => {
  test('formatCryptoAmount formats correctly', () => {
    expect(formatCryptoAmount('1.23456789', 'BTC')).toBe('1.23456789 BTC');
    expect(formatCryptoAmount('1000.50', 'USDT')).toBe('1000.50 USDT');
  });

  test('validateAddress works for different currencies', () => {
    expect(validateAddress('1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2', 'BTC')).toBe(true);
    expect(validateAddress('0x742d35Cc9488DF0C6ba2b93B8C1234abcD1234aB', 'ETH')).toBe(true);
    expect(validateAddress('invalid-address', 'BTC')).toBe(false);
  });

  test('calculateCryptoPrice calculates correct amount', () => {
    const mockRate = { currency: 'USDT', priceEUR: 0.92 };
    expect(calculateCryptoPrice(10, mockRate)).toBe('10.87');
  });
});
```

### 2. Integration тесты

```typescript
// __tests__/integration/payment-flow.test.ts
import { createPayment, checkPaymentStatus } from '@/modules/crypto-billing';

describe('Payment Flow Integration', () => {
  test('complete payment flow', async () => {
    // Создаем платеж
    const payment = await createPayment({
      userId: 'test-user',
      serviceType: 'wordpress',
      cryptoCurrency: 'USDT'
    });

    expect(payment).toBeDefined();
    expect(payment.status).toBe('pending');

    // Проверяем статус
    const status = await checkPaymentStatus(payment.id);
    expect(status.payment.id).toBe(payment.id);
  });
});
```

---

## Production Deployment

### 1. Environment Variables

```bash
# .env.production
MASTER_SEED_PHRASE="your secure 12-word seed phrase here"
CRYPTO_BILLING_SECRET="your-crypto-billing-secret-key"
INFURA_PROJECT_ID="your-infura-project-id"
COINGECKO_API_KEY="your-coingecko-api-key"
BLOCKCYPHER_TOKEN="your-blockcypher-token"

# Network settings
ETHEREUM_NETWORK="mainnet"
BITCOIN_NETWORK="mainnet"

# Security
WEBHOOK_SECRET="your-webhook-secret"
```

### 2. Docker Configuration

```dockerfile
# Dockerfile для production
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

### 3. Monitoring Setup

```typescript
// lib/monitoring.ts
import { getCryptoBillingStats } from '@/modules/crypto-billing';

export function setupMonitoring() {
  // Отправка метрик каждые 5 минут
  setInterval(async () => {
    const stats = getCryptoBillingStats();
    
    // Отправка в систему мониторинга (Prometheus, DataDog, etc.)
    await sendMetrics({
      'crypto_payments_total': stats.totalPayments,
      'crypto_payments_active': stats.activePayments,
      'crypto_revenue_total': stats.totalRevenue
    });
  }, 5 * 60 * 1000);
}

async function sendMetrics(metrics: Record<string, number>) {
  // Реализация отправки метрик
  console.log('Metrics:', metrics);
}
```
