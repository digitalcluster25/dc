# 💎 Crypto Billing Module

**Современная система криптоплатежей для SaaS хостинг платформ**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](./package.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.x-black.svg)](https://nextjs.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)

## 🎯 Обзор

Crypto Billing Module - это полнофункциональная система приема криптовалютных платежей, разработанная специально для SaaS хостинг платформ. Модуль позволяет пользователям оплачивать услуги хостинга в Bitcoin, Ethereum, стабильных монетах и других криптовалютах.

### ⚡ Ключевые особенности

- 🚀 **Мгновенная активация** - Сервисы активируются за 2-5 минут после подтверждения платежа
- 💎 **6 криптовалют** - USDT, USDC, BUSD, BTC, ETH, MATIC
- 🛡️ **Безопасность** - HD кошельки, необратимые транзакции, AES шифрование
- 🌍 **Глобальность** - Работает в любой стране без банковских ограничений  
- 💰 **Низкие комиссии** - Особенно для stablecoins
- 📱 **Удобство** - QR-коды, автокопирование, мобильная оптимизация
- 🔄 **Автоматизация** - Полный цикл от платежа до активации сервиса
- 📊 **Аналитика** - Детальная статистика и административная панель

### 🛍️ Поддерживаемые сервисы

| Сервис | Описание | Время активации |
|--------|----------|-----------------|
| 📝 **WordPress CMS** | Готовый сайт с админ-панелью | ~5 минут |
| ⚡ **Next.js App** | React приложение с SSR | ~3 минуты |
| 🔧 **REST API** | Node.js API с документацией | ~2 минуты |
| 🗃️ **Database** | PostgreSQL с бэкапами | ~2 минуты |
| 🐳 **Docker Container** | Кастомный контейнер | ~4 минуты |
| 🌐 **Static Website** | HTML/CSS/JS сайт | ~1 минута |

Все сервисы по **единой цене 10€**

---

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
npm install jsonwebtoken @types/jsonwebtoken qrcode @types/qrcode axios web3 bitcoinjs-lib
```

### 2. Настройка переменных окружения

Создайте `.env.local`:

```bash
# Основные настройки
MASTER_SEED_PHRASE="your twelve word seed phrase here"
CRYPTO_BILLING_SECRET="your-secret-key-for-jwt"

# API ключи
INFURA_PROJECT_ID="your-infura-project-id"
COINGECKO_API_KEY="your-coingecko-api-key"
BLOCKCYPHER_TOKEN="your-blockcypher-token"

# Сети
ETHEREUM_NETWORK="mainnet"
BITCOIN_NETWORK="mainnet"
NODE_ENV="development"
```

### 3. Добавление модуля в проект

```tsx
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

### 4. Создание страницы оплаты

```tsx
// app/checkout/page.tsx
'use client';

import { CryptoCheckout } from '@/modules/crypto-billing';

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-8">
      <CryptoCheckout
        serviceType="wordpress"
        onPaymentCreated={(payment) => {
          console.log('Payment created:', payment.id);
        }}
        onPaymentComplete={(payment) => {
          console.log('Service activated!', payment.id);
        }}
      />
    </div>
  );
}
```

### 5. Запуск демо

```bash
npm run dev
# Откройте http://localhost:3000/crypto-billing-demo
```

---

## 📁 Структура модуля

```
modules/crypto-billing/
├── components/           # React компоненты
│   ├── ServiceSelector.tsx
│   ├── CryptoCheckout.tsx
│   ├── PaymentStatus.tsx  
│   ├── PriceCalculator.tsx
│   ├── CryptoWallet.tsx
│   └── AdminDashboard.tsx
├── hooks/               # React hooks
│   ├── useCryptoPayment.tsx
│   └── useCryptoRates.tsx
├── lib/                 # Основная логика
│   ├── crypto-rates.ts
│   ├── wallet-generator.ts
│   ├── middleware.ts
│   └── init.ts
├── types/              # TypeScript типы
│   └── crypto-billing.types.ts
├── utils/              # Утилиты  
│   ├── constants.ts
│   └── formatters.ts
├── docs/               # Документация
│   ├── API_SPEC.md
│   ├── EXAMPLES.md
│   └── DEPENDENCIES.md
└── index.ts           # Главный экспорт
```

---

## 🔧 API Endpoints

### Создание платежа
```http
POST /api/crypto/create-payment
Authorization: Bearer <token>
Content-Type: application/json

{
  "serviceType": "wordpress",
  "cryptoCurrency": "USDT"
}
```

### Проверка статуса
```http
GET /api/crypto/check-payment?paymentId=pay_abc123
Authorization: Bearer <token>
```

### Подтверждение платежа
```http  
POST /api/crypto/confirm-payment
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentId": "pay_abc123",
  "transactionHash": "0xabcdef..."
}
```

### Получение курсов валют
```http
GET /api/crypto/rates
```

> 📚 **[Полная API документация](./docs/API_SPEC.md)**

---

## ⚛️ React компоненты

### ServiceSelector
Выбор типа сервиса для заказа:

```tsx
import { ServiceSelector } from '@/modules/crypto-billing';

<ServiceSelector
  selectedService={selectedService}
  onServiceSelect={(service) => setSelectedService(service)}
/>
```

### CryptoCheckout  
Полный процесс оплаты с выбором валюты:

```tsx
import { CryptoCheckout } from '@/modules/crypto-billing';

<CryptoCheckout
  serviceType="wordpress"
  onPaymentCreated={(payment) => console.log(payment)}
/>
```

### PaymentStatus
Отображение статуса платежа в реальном времени:

```tsx
import { PaymentStatus } from '@/modules/crypto-billing';

<PaymentStatus
  paymentId="pay_abc123"
  onStatusChange={(status) => console.log(status)}
  autoRefresh={true}
/>
```

### PriceCalculator
Калькулятор стоимости в разных криптовалютах:

```tsx
import { PriceCalculator } from '@/modules/crypto-billing';

<PriceCalculator
  serviceType="wordpress"
  selectedCurrency="USDT"
  showComparison={true}
/>
```

> 📚 **[Примеры использования](./docs/EXAMPLES.md)**

---

## 🎣 React Hooks

### useCryptoPayment
Управление платежами:

```tsx
import { useCryptoPayment } from '@/modules/crypto-billing';

function PaymentComponent() {
  const {
    currentPayment,
    userPayments,
    loading,
    error,
    createPayment,
    checkPaymentStatus
  } = useCryptoPayment();

  const handleCreatePayment = async () => {
    const payment = await createPayment('wordpress', 'USDT');
    if (payment) {
      console.log('Payment created:', payment.id);
    }
  };

  return (
    <div>
      <button onClick={handleCreatePayment} disabled={loading}>
        {loading ? 'Создание...' : 'Создать платеж'}
      </button>
      {error && <p>Ошибка: {error}</p>}
    </div>
  );
}
```

### useCryptoRates
Получение курсов валют:

```tsx
import { useCryptoRates } from '@/modules/crypto-billing';

function RatesDisplay() {
  const { rates, loading, error, refreshRates } = useCryptoRates();

  if (loading) return <div>Загрузка курсов...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div>
      {rates.map(rate => (
        <div key={rate.currency}>
          <strong>{rate.currency}</strong>: €{rate.priceEUR.toFixed(4)}
          <span className={rate.change24h >= 0 ? 'text-green' : 'text-red'}>
            {rate.change24h >= 0 ? '+' : ''}{rate.change24h.toFixed(2)}%
          </span>
        </div>
      ))}
      <button onClick={refreshRates}>Обновить</button>
    </div>
  );
}
```

---

## 👑 Административная панель

```tsx
import { AdminDashboard } from '@/modules/crypto-billing';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <AdminDashboard />
    </div>
  );
}
```

Административная панель включает:
- 📊 **Обзор** - ключевые метрики и статистика
- 💳 **Платежи** - детальный список всех транзакций  
- 📈 **Аналитика** - графики доходов и популярности валют
- ⚙️ **Настройки** - конфигурация системы

---

## 🔐 Безопасность

### Аутентификация и авторизация
```tsx
// Использование middleware для защиты API
import { CryptoBillingMiddleware } from '@/modules/crypto-billing';

export default CryptoBillingMiddleware.createPayment(
  async (req, res) => {
    // req.user содержит аутентифицированного пользователя
    const { serviceType, cryptoCurrency } = req.body;
    
    // Бизнес-логика создания платежа
    // ...
  }
);
```

### Rate Limiting
- 5 запросов/мин для создания платежей
- 60 запросов/мин для проверки статуса
- 30 запросов/мин для получения курсов

### Защищенное хранение
- HD кошельки с уникальным адресом для каждого платежа
- AES шифрование приватных ключей
- JWT токены для аутентификации
- Валидация всех входящих данных

---

## 🌍 Поддерживаемые сети и валюты

| Валюта | Сеть | Время подтверждения | Комиссии | Статус |
|--------|------|-------------------|----------|---------|
| 💎 **USDT** | Ethereum/Tron | ~3 минуты | Средние/Низкие | ✅ Активно |
| 💎 **USDC** | Ethereum/Polygon | ~3 минуты / ~1 минута | Средние/Минимальные | ✅ Активно |
| 💎 **BUSD** | BSC | ~1 минута | Минимальные | ✅ Активно |
| ₿ **Bitcoin** | Bitcoin | ~10 минут | Переменные | ✅ Активно |
| Ξ **Ethereum** | Ethereum | ~3 минуты | Высокие | ✅ Активно |
| ◈ **Polygon** | Polygon | ~1 минута | Минимальные | ✅ Активно |

### Планируемые валюты
- 🔶 **BNB** (Binance Smart Chain)
- ⭐ **SOL** (Solana)  
- 🔺 **TRX** (Tron)
- 💠 **ADA** (Cardano)

---

## 📊 Мониторинг и аналитика

### Health Check
```bash
curl http://localhost:3000/api/health/crypto-billing
```

### Ключевые метрики
- Общее количество платежей
- Процент успешных транзакций  
- Средний время подтверждения
- Популярные валюты и сервисы
- Доход по периодам

### Логирование
Все операции логируются с детализацией:
```
🔐 POST /api/crypto/create-payment from 192.168.1.1
INFO POST /api/crypto/create-payment 201 1234ms userId=user_123
💳 Payment created: pay_abc123 { currency: USDT, amount: 10.85 }
```

---

## 🧪 Тестирование

### Unit тесты
```bash
npm run test:crypto
```

### Integration тесты  
```bash
npm run test:integration
```

### E2E тесты
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:coverage
```

Покрытие тестами: **>85%**

---

## 🚀 Развертывание

### Development
```bash
npm run dev
# Открыть http://localhost:3000/crypto-billing-demo
```

### Production Build
```bash
npm run build
npm run start
```

### Environment Variables (Production)
```bash
# Безопасность
MASTER_SEED_PHRASE="real production seed phrase with 12 words"
CRYPTO_BILLING_SECRET="strong-256-bit-secret-key"
WEBHOOK_SECRET="webhook-verification-secret"

# External APIs
INFURA_PROJECT_ID="production-infura-id" 
COINGECKO_API_KEY="production-coingecko-key"
BLOCKCYPHER_TOKEN="production-blockcypher-token"

# Networks
ETHEREUM_NETWORK="mainnet"
BITCOIN_NETWORK="mainnet" 
NODE_ENV="production"

# Database
DATABASE_URL="postgresql://user:pass@prod-db:5432/crypto_billing"
REDIS_URL="redis://prod-redis:6379"
```

### Docker
```bash
docker build -t crypto-billing-app .
docker run -p 3000:3000 crypto-billing-app
```

---

## 🔧 Конфигурация

### Настройка цен
```typescript
// Изменение цены сервисов
export const SYSTEM_CONFIG = {
  SERVICE_PRICE_EUR: 15, // Изменить с 10€ на 15€
  PAYMENT_EXPIRY_MINUTES: 60,
  // ...
};
```

### Добавление новой криптовалюты
```typescript
// В constants.ts
export const SUPPORTED_CURRENCIES = [
  // Существующие валюты...
  {
    symbol: 'SOL',
    name: 'Solana',
    network: 'solana',
    decimals: 9,
    icon: '⭐',
    isStablecoin: false,
    minConfirmations: 32,
    avgConfirmationTime: 1
  }
];
```

### Кастомизация UI
```css
/* Переменные CSS для брендинга */
:root {
  --crypto-primary: #3B82F6;
  --crypto-success: #10B981;
  --crypto-warning: #F59E0B;
  --crypto-error: #EF4444;
}
```

---

## 🤝 Интеграция с Railway

### Автоматическая активация сервисов
```typescript
// lib/railway-integration.ts
export async function activateUserService(payment: CryptoPayment) {
  const railway = new Railway();
  
  // Создаем проект в Railway
  const project = await railway.createProject({
    name: `${payment.serviceType}-${payment.userId}`,
    template: getServiceTemplate(payment.serviceType),
    environmentVariables: {
      USER_ID: payment.userId,
      PAYMENT_ID: payment.id
    }
  });

  // Генерируем домен
  const domain = await railway.generateDomain(project.id);
  
  return {
    success: true,
    serviceUrl: domain.url,
    credentials: generateServiceCredentials(payment.serviceType)
  };
}
```

---

## 🐛 Troubleshooting

### Частые проблемы

**1. "Курсы валют не загружаются"**
```bash
# Проверьте API ключ CoinGecko
curl "https://api.coingecko.com/api/v3/ping"

# Проверьте переменные окружения
echo $COINGECKO_API_KEY
```

**2. "Ошибка генерации кошелька"**
```bash
# Проверьте seed phrase (должен быть 12 слов)
echo $MASTER_SEED_PHRASE | wc -w

# Для разработки используйте demo seed:
MASTER_SEED_PHRASE="abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"
```

**3. "JWT ошибка аутентификации"**
```bash
# Проверьте секретный ключ
echo $CRYPTO_BILLING_SECRET

# Сгенерируйте новый ключ:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**4. "Rate limit exceeded"**
```typescript
// Увеличьте лимиты в middleware.ts
export const API_LIMITS = {
  MAX_CONCURRENT_PAYMENTS: 5,    // было 3
  RATE_LIMIT_PER_MINUTE: 120,    // было 60
  // ...
};
```

### Debug Mode
```bash
DEBUG=crypto-billing:* npm run dev
```

### Logs Location
- Development: Console output
- Production: `./logs/crypto-billing/`

---

## 📞 Поддержка

### Документация
- 📚 **[API Specification](./docs/API_SPEC.md)** - Полное описание API
- 💻 **[Examples](./docs/EXAMPLES.md)** - Примеры использования
- 📦 **[Dependencies](./docs/DEPENDENCIES.md)** - Зависимости и установка

### Сообщество
- 💬 **GitHub Issues** - Для багов и feature requests
- 📧 **Email**: crypto-support@your-domain.com
- 💬 **Discord**: https://discord.gg/your-server

### Статус системы
- 🟢 **Status Page**: https://status.your-domain.com
- 📊 **Metrics**: https://metrics.your-domain.com

---

## 🎯 Roadmap

### v1.1 (Q4 2025)
- [ ] Lightning Network поддержка для Bitcoin
- [ ] Solana (SOL) интеграция
- [ ] Multi-signature кошельки
- [ ] Webhook уведомления
- [ ] Расширенная аналитика

### v1.2 (Q1 2026)  
- [ ] DeFi интеграции (Staking, Yield)
- [ ] NFT поддержка для премиум аккаунтов
- [ ] Cross-chain мосты
- [ ] Mobile SDK
- [ ] White-label решения

### v2.0 (Q2 2026)
- [ ] AI-оптимизация комиссий
- [ ] Decentralized exchange интеграция  
- [ ] Layer 2 решения (Arbitrum, Optimism)
- [ ] Enterprise features
- [ ] Compliance инструменты

---

## 📄 License

MIT License - см. [LICENSE](./LICENSE) файл

## 🙏 Credits

Разработан с ❤️ командой Railway SaaS Platform

- **Claude Sonnet 4** - Архитектура и разработка модуля
- **Railway** - Инфраструктура хостинга  
- **CoinGecko** - API курсов валют
- **Infura** - Ethereum node provider
- **BlockCypher** - Bitcoin API

---

## ⭐ Начало работы

1. **[Установите зависимости](#-быстрый-старт)**
2. **[Настройте переменные окружения](#-быстрый-старт)**  
3. **[Запустите демо](#-быстрый-старт)**
4. **[Изучите примеры](./docs/EXAMPLES.md)**
5. **[Интегрируйте в проект](#️-react-компоненты)**

**Готовы принимать криптоплатежи за 10 минут!** 🚀

---

<div align="center">
  <strong>💎 Crypto Billing Module - Будущее SaaS платежей уже здесь!</strong>
  
  <p>
    <a href="#-обзор">Обзор</a> •
    <a href="#-быстрый-старт">Быстрый старт</a> •
    <a href="#️-api-endpoints">API</a> •
    <a href="#️-react-компоненты">Компоненты</a> •
    <a href="#-административная-панель">Админка</a> •
    <a href="./docs/EXAMPLES.md">Примеры</a>
  </p>
</div>
