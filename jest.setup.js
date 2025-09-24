// 🧪 Jest Setup for CRYPTO_BILLING_MODULE
// jest.setup.js

import '@testing-library/jest-dom';

// Mock environment variables
process.env.CRYPTO_BILLING_SECRET = 'test-secret-key-for-jwt-tokens';
process.env.MASTER_SEED_PHRASE = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
process.env.NODE_ENV = 'test';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    };
  },
}));

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useSearchParams() {
    return {
      get: jest.fn((key) => {
        const params = { service: 'wordpress', paymentId: 'pay_test123' };
        return params[key] || null;
      })
    };
  },
  usePathname: () => '/',
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      refresh: jest.fn(),
    };
  }
}));

// Mock Web APIs
const mockClipboard = {
  writeText: jest.fn(() => Promise.resolve())
};

Object.defineProperty(navigator, 'clipboard', {
  value: mockClipboard,
  writable: true
});

// Mock crypto API
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: jest.fn((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }),
    subtle: {
      generateKey: jest.fn(),
      importKey: jest.fn(),
      exportKey: jest.fn(),
      sign: jest.fn(),
      verify: jest.fn()
    }
  }
});

// Mock fetch API
global.fetch = jest.fn();

// Mock console methods for cleaner test output
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Reset all mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

// Custom matchers
expect.extend({
  toBeValidPaymentId(received) {
    const pass = typeof received === 'string' && /^pay_[a-z0-9]+_[a-z0-9]+$/.test(received);
    
    return {
      message: () => pass 
        ? `expected ${received} not to be a valid payment ID`
        : `expected ${received} to be a valid payment ID (format: pay_xxxxx_xxxxx)`,
      pass
    };
  },
  
  toBeValidCryptoAddress(received, currency) {
    let pass = false;
    
    switch (currency) {
      case 'BTC':
        pass = /^(1|3|bc1)[a-zA-HJ-NP-Z0-9]{25,62}$/.test(received);
        break;
      case 'ETH':
      case 'USDT':
      case 'USDC':
      case 'MATIC':
        pass = /^0x[a-fA-F0-9]{40}$/.test(received);
        break;
      case 'BUSD':
        pass = /^0x[a-fA-F0-9]{40}$/.test(received);
        break;
      default:
        pass = false;
    }
    
    return {
      message: () => pass
        ? `expected ${received} not to be a valid ${currency} address`
        : `expected ${received} to be a valid ${currency} address`,
      pass
    };
  },
  
  toBeValidTransactionHash(received, currency) {
    let pass = false;
    
    switch (currency) {
      case 'BTC':
        pass = /^[a-fA-F0-9]{64}$/.test(received);
        break;
      case 'ETH':
      case 'USDT':
      case 'USDC':
      case 'MATIC':
      case 'BUSD':
        pass = /^0x[a-fA-F0-9]{64}$/.test(received);
        break;
      default:
        pass = false;
    }
    
    return {
      message: () => pass
        ? `expected ${received} not to be a valid ${currency} transaction hash`
        : `expected ${received} to be a valid ${currency} transaction hash`,
      pass
    };
  }
});

// Global test utilities
global.testUtils = {
  // Create mock payment data
  createMockPayment(overrides = {}) {
    return {
      id: 'pay_test123_456789',
      userId: 'user_test123',
      serviceType: 'wordpress',
      cryptoCurrency: 'USDT',
      network: 'ethereum',
      priceEUR: 10,
      priceUSD: 10.90,
      cryptoAmount: '10.85',
      exchangeRate: 0.92,
      paymentAddress: '0x742d35Cc6488DF0C6ba2b93B8C1234abcD1234aB',
      status: 'pending',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
      confirmations: 0,
      requiredConfirmations: 12,
      ...overrides
    };
  },
  
  // Create mock crypto rate
  createMockRate(overrides = {}) {
    return {
      currency: 'USDT',
      priceUSD: 1.0,
      priceEUR: 0.92,
      change24h: 0.1,
      lastUpdated: new Date(),
      ...overrides
    };
  },
  
  // Create authenticated user token
  createAuthToken(userData = {}) {
    const jwt = require('jsonwebtoken');
    const defaultUser = {
      userId: 'test-user-123',
      email: 'test@example.com',
      role: 'user',
      permissions: ['crypto:payment:create', 'crypto:payment:view', 'crypto:payment:confirm']
    };
    
    return jwt.sign(
      { ...defaultUser, ...userData },
      process.env.CRYPTO_BILLING_SECRET,
      { expiresIn: '1h' }
    );
  },
  
  // Wait for async operations
  waitFor(ms = 100) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};

// Mock timers for tests that use setTimeout/setInterval
jest.useFakeTimers();

// Setup console spy for debugging
if (process.env.DEBUG === 'true') {
  jest.spyOn(console, 'log').mockImplementation((...args) => {
    if (args[0]?.includes?.('🔐') || args[0]?.includes?.('💳') || args[0]?.includes?.('✅')) {
      originalError(...args);
    }
  });
}
