// 🚀 Main Export - CRYPTO_BILLING_MODULE
// modules/crypto-billing/index.ts

// Types
export * from './types/crypto-billing.types';

// Components
export { default as ServiceSelector } from './components/ServiceSelector';
export { ServiceSelectorCompact, ServiceCard } from './components/ServiceSelector';

export { default as CryptoCheckout } from './components/CryptoCheckout';

export { default as PaymentStatus } from './components/PaymentStatus';
export { PaymentStatusCompact } from './components/PaymentStatus';

export { default as PriceCalculator } from './components/PriceCalculator';
export { PriceCalculatorCompact } from './components/PriceCalculator';

export { default as CryptoWallet } from './components/CryptoWallet';
export { CryptoWalletCompact } from './components/CryptoWallet';

// Hooks
export { 
  useCryptoPayment, 
  usePaymentStatus, 
  usePaymentStats, 
  usePaymentFlow 
} from './hooks/useCryptoPayment';

export { 
  useCryptoRates, 
  useCryptoRate, 
  useRateMonitor, 
  useCurrencyComparison, 
  useRateHistory, 
  useCurrencyConverter, 
  useRateStatistics,
  CryptoRatesProvider,
  useCryptoRatesContext 
} from './hooks/useCryptoRates';

// Libraries
export * from './lib/crypto-rates';
export * from './lib/wallet-generator';

// Utils
export * from './utils/constants';
export * from './utils/formatters';

// API Functions (for server-side usage)
export { 
  findPaymentById, 
  updatePaymentStatus, 
  getUserPayments, 
  getAllPayments, 
  cleanupExpiredPayments 
} from '../../pages/api/crypto/create-payment';

export { checkAllActivePayments } from '../../pages/api/crypto/check-payment';

export { getUserServices } from '../../pages/api/crypto/confirm-payment';

// Initialization
export { initializeCryptoBilling } from './lib/init';
