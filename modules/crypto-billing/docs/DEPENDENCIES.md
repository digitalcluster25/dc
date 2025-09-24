# 📦 Package Dependencies - CRYPTO_BILLING_MODULE

## Основные зависимости для модуля

### Core Dependencies
Добавьте эти пакеты в ваш `package.json`:

```json
{
  "dependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    
    "jsonwebtoken": "^9.0.0",
    "@types/jsonwebtoken": "^9.0.0",
    
    "qrcode": "^1.5.3",
    "@types/qrcode": "^1.5.0",
    
    "axios": "^1.6.0",
    
    "web3": "^4.0.0",
    "bitcoinjs-lib": "^6.1.0",
    "ethers": "^6.0.0"
  },
  
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0",
    "jest": "^29.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

## Команды установки

### NPM
```bash
# Core dependencies
npm install @types/node typescript next react react-dom
npm install jsonwebtoken @types/jsonwebtoken
npm install qrcode @types/qrcode
npm install axios web3 bitcoinjs-lib ethers

# Dev dependencies  
npm install -D @types/react @types/react-dom eslint eslint-config-next
npm install -D jest @testing-library/react @testing-library/jest-dom
npm install -D tailwindcss autoprefixer postcss
```

### Yarn
```bash
# Core dependencies
yarn add @types/node typescript next react react-dom
yarn add jsonwebtoken @types/jsonwebtoken
yarn add qrcode @types/qrcode
yarn add axios web3 bitcoinjs-lib ethers

# Dev dependencies
yarn add -D @types/react @types/react-dom eslint eslint-config-next
yarn add -D jest @testing-library/react @testing-library/jest-dom
yarn add -D tailwindcss autoprefixer postcss
```

### PNPM
```bash
# Core dependencies
pnpm add @types/node typescript next react react-dom
pnpm add jsonwebtoken @types/jsonwebtoken
pnpm add qrcode @types/qrcode
pnpm add axios web3 bitcoinjs-lib ethers

# Dev dependencies
pnpm add -D @types/react @types/react-dom eslint eslint-config-next
pnpm add -D jest @testing-library/react @testing-library/jest-dom
pnpm add -D tailwindcss autoprefixer postcss
```

## Описание зависимостей

### 🔐 Безопасность и аутентификация
- **jsonwebtoken** - Для создания и верификации JWT токенов
- **@types/jsonwebtoken** - TypeScript типы для jsonwebtoken

### 💎 Криптовалюты и блокчейн
- **web3** - Для взаимодействия с Ethereum и EVM-совместимыми сетями
- **bitcoinjs-lib** - Для работы с Bitcoin транзакциями и адресами
- **ethers** - Альтернатива web3 для Ethereum (опционально)

### 📱 QR коды и UI
- **qrcode** - Генерация QR кодов для криптокошельков
- **@types/qrcode** - TypeScript типы для qrcode

### 🌐 HTTP клиент
- **axios** - HTTP клиент для API запросов к внешним сервисам

### ⚛️ React и Next.js
- **next** - React фреймворк
- **react**, **react-dom** - React библиотеки
- **@types/react**, **@types/react-dom** - TypeScript типы

### 🧪 Тестирование
- **jest** - Тестовый фреймворк
- **@testing-library/react** - Утилиты для тестирования React компонентов
- **@testing-library/jest-dom** - Дополнительные матчеры для Jest

### 🎨 Стилизация
- **tailwindcss** - CSS фреймворк (если используется)
- **autoprefixer**, **postcss** - Обработка CSS

## Опциональные зависимости

### Для продвинутой крипто функциональности
```bash
# HD Wallets
npm install bip39 bip32
npm install @types/bip39

# Криптография  
npm install crypto-js
npm install @types/crypto-js

# Дополнительные блокчейны
npm install @solana/web3.js  # Solana support
npm install tronweb          # Tron support
```

### Для мониторинга и логирования
```bash
# Логирование
npm install winston pino

# Мониторинг
npm install @sentry/nextjs

# Метрики
npm install prom-client
```

### Для базы данных (если используется)
```bash
# PostgreSQL
npm install pg @types/pg
npm install prisma @prisma/client

# Redis
npm install redis @types/redis

# MongoDB  
npm install mongoose @types/mongoose
```

## Environment Variables

Создайте файл `.env.local` с необходимыми переменными:

```bash
# Crypto Billing
MASTER_SEED_PHRASE="your twelve word seed phrase here for hd wallets"
CRYPTO_BILLING_SECRET="your-secret-key-for-jwt-and-encryption"

# External APIs
INFURA_PROJECT_ID="your-infura-project-id-for-ethereum"
COINGECKO_API_KEY="your-coingecko-api-key-for-rates"
BLOCKCYPHER_TOKEN="your-blockcypher-token-for-bitcoin"

# Networks (mainnet/testnet)
ETHEREUM_NETWORK="mainnet"
BITCOIN_NETWORK="mainnet"
NODE_ENV="development"

# Security
WEBHOOK_SECRET="your-webhook-verification-secret"
API_RATE_LIMIT="100"

# Database (опционально)
DATABASE_URL="postgresql://user:pass@localhost:5432/crypto_billing"
REDIS_URL="redis://localhost:6379"
```

## TypeScript конфигурация

Обновите `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"],
      "@/modules/crypto-billing": ["./modules/crypto-billing"],
      "@/modules/crypto-billing/*": ["./modules/crypto-billing/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    "modules/crypto-billing/**/*.ts",
    "modules/crypto-billing/**/*.tsx"
  ],
  "exclude": ["node_modules"]
}
```

## ESLint конфигурация

Обновите `.eslintrc.json`:

```json
{
  "extends": ["next/core-web-vitals"],
  "rules": {
    "@typescript-eslint/no-unused-vars": ["error"],
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error",
    "no-var": "error"
  },
  "overrides": [
    {
      "files": ["modules/crypto-billing/**/*.ts", "modules/crypto-billing/**/*.tsx"],
      "rules": {
        "react-hooks/exhaustive-deps": "warn"
      }
    }
  ]
}
```

## Jest конфигурация

Создайте `jest.config.js`:

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleDirectories: ['node_modules', '<rootDir>/'],
  moduleNameMapping: {
    '^@/modules/crypto-billing/(.*)$': '<rootDir>/modules/crypto-billing/$1',
    '^@/modules/crypto-billing$': '<rootDir>/modules/crypto-billing/index.ts',
  },
  testMatch: [
    '<rootDir>/modules/crypto-billing/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/__tests__/crypto-billing/**/*.{js,jsx,ts,tsx}'
  ],
  collectCoverageFrom: [
    'modules/crypto-billing/**/*.{js,jsx,ts,tsx}',
    '!modules/crypto-billing/**/*.d.ts',
    '!modules/crypto-billing/**/index.{js,jsx,ts,tsx}'
  ]
}

module.exports = createJestConfig(customJestConfig)
```

## Tailwind CSS конфигурация

Обновите `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './modules/crypto-billing/**/*.{js,ts,jsx,tsx}', // Добавляем модуль
  ],
  theme: {
    extend: {
      colors: {
        crypto: {
          bitcoin: '#F7931A',
          ethereum: '#627EEA',
          usdt: '#26A17B',
          usdc: '#2775CA',
          busd: '#F0B90B',
          matic: '#8247E5'
        }
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography')
  ],
}
```

## Scripts в package.json

Добавьте полезные скрипты:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:crypto": "jest --testPathPattern=crypto-billing",
    
    "crypto:demo": "next dev --port 3000 && open http://localhost:3000/crypto-billing-demo",
    "crypto:init": "node -e \"require('./modules/crypto-billing/lib/init.ts').initializeCryptoBilling()\"",
    "crypto:health": "curl http://localhost:3000/api/health/crypto-billing",
    
    "build:crypto": "tsc --project modules/crypto-billing/tsconfig.json",
    "lint:crypto": "eslint modules/crypto-billing/**/*.{ts,tsx}"
  }
}
```

## Контрольный список установки

- [ ] Установлены все основные зависимости
- [ ] Настроены переменные окружения
- [ ] Обновлен TypeScript конфигурация
- [ ] Настроен ESLint для модуля
- [ ] Добавлена Jest конфигурация для тестов
- [ ] Обновлен Tailwind для стилей модуля
- [ ] Добавлены npm scripts для разработки
- [ ] Проверена совместимость версий Next.js и React

## Проверка установки

Запустите следующие команды для проверки:

```bash
# Проверка TypeScript
npm run type-check

# Проверка линтера
npm run lint:crypto

# Запуск тестов модуля
npm run test:crypto

# Запуск демо
npm run crypto:demo

# Проверка здоровья модуля (после запуска dev сервера)
npm run crypto:health
```

Если все команды выполняются без ошибок, модуль готов к использованию! 🚀
