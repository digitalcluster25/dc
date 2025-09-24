// 🧪 Unit Tests - CRYPTO_BILLING_MODULE
// modules/crypto-billing/__tests__/utils.test.ts

import {
  formatCryptoAmount,
  formatFiatAmount,
  formatWalletAddress,
  validateCryptoAddress,
  calculateCryptoPrice,
  formatPaymentStatus,
  generatePaymentId,
  isDustAmount,
  timeAgo,
  copyToClipboard
} from '../utils/formatters';

import {
  getMinConfirmations,
  getCryptoIcon,
  getCryptoColor,
  isStablecoin,
  getNetworkByCurrency
} from '../utils/constants';

import { CryptoRate } from '../types/crypto-billing.types';

describe('Crypto Billing Utils', () => {
  describe('formatCryptoAmount', () => {
    test('formats BTC correctly with 8 decimals', () => {
      expect(formatCryptoAmount('1.23456789', 'BTC')).toBe('1.23456789 BTC');
      expect(formatCryptoAmount('0.00000001', 'BTC')).toBe('0.00000001 BTC');
    });

    test('formats USDT correctly with 2 decimals', () => {
      expect(formatCryptoAmount('1000.50', 'USDT')).toBe('1000.50 USDT');
      expect(formatCryptoAmount('10.123456', 'USDT')).toBe('10.12 USDT');
    });

    test('formats ETH correctly with 6 decimals', () => {
      expect(formatCryptoAmount('1.123456789', 'ETH')).toBe('1.123457 ETH');
    });

    test('handles invalid amounts gracefully', () => {
      expect(formatCryptoAmount('invalid', 'BTC')).toBe('0 BTC');
      expect(formatCryptoAmount('', 'ETH')).toBe('0 ETH');
    });
  });

  describe('formatFiatAmount', () => {
    test('formats EUR correctly', () => {
      expect(formatFiatAmount(10.5, 'EUR')).toBe('€10.50');
      expect(formatFiatAmount(1234.56, 'EUR')).toBe('€1,234.56');
    });

    test('formats USD correctly', () => {
      expect(formatFiatAmount(10.5, 'USD')).toBe('$10.50');
      expect(formatFiatAmount(1234.56, 'USD')).toBe('$1,234.56');
    });

    test('defaults to EUR', () => {
      expect(formatFiatAmount(10.5)).toBe('€10.50');
    });
  });

  describe('formatWalletAddress', () => {
    test('shortens long addresses correctly', () => {
      const longAddress = '0x1234567890abcdefghijklmnopqrstuvwxyz123456';
      expect(formatWalletAddress(longAddress)).toBe('0x1234...3456');
      expect(formatWalletAddress(longAddress, 8, 8)).toBe('0x123456...23456789');
    });

    test('returns short addresses unchanged', () => {
      const shortAddress = '1234567890';
      expect(formatWalletAddress(shortAddress)).toBe(shortAddress);
    });
  });

  describe('validateCryptoAddress', () => {
    test('validates Bitcoin addresses correctly', () => {
      expect(validateCryptoAddress('1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2', 'BTC')).toBe(true);
      expect(validateCryptoAddress('3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy', 'BTC')).toBe(true);
      expect(validateCryptoAddress('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4', 'BTC')).toBe(true);
      expect(validateCryptoAddress('invalid-btc-address', 'BTC')).toBe(false);
    });

    test('validates Ethereum addresses correctly', () => {
      expect(validateCryptoAddress('0x742d35Cc6488DF0C6ba2b93B8C1234abcD1234aB', 'ETH')).toBe(true);
      expect(validateCryptoAddress('0x742d35cc6488df0c6ba2b93b8c1234abcd1234ab', 'ETH')).toBe(true);
      expect(validateCryptoAddress('742d35Cc6488DF0C6ba2b93B8C1234abcD1234aB', 'ETH')).toBe(false);
      expect(validateCryptoAddress('0x742d35Cc6488DF0C6ba2b93B8C1234abcD1234', 'ETH')).toBe(false);
    });

    test('validates stablecoin addresses (same as ETH)', () => {
      const validETHAddress = '0x742d35Cc6488DF0C6ba2b93B8C1234abcD1234aB';
      expect(validateCryptoAddress(validETHAddress, 'USDT')).toBe(true);
      expect(validateCryptoAddress(validETHAddress, 'USDC')).toBe(true);
    });
  });

  describe('calculateCryptoPrice', () => {
    test('calculates correct crypto amount', () => {
      const mockRate: CryptoRate = {
        currency: 'USDT',
        priceEUR: 0.92,
        priceUSD: 1.0,
        change24h: 0.1,
        lastUpdated: new Date()
      };
      
      expect(calculateCryptoPrice(10, mockRate)).toBe('10.87');
    });

    test('handles zero rate gracefully', () => {
      const mockRate: CryptoRate = {
        currency: 'USDT',
        priceEUR: 0,
        priceUSD: 0,
        change24h: 0,
        lastUpdated: new Date()
      };
      
      expect(calculateCryptoPrice(10, mockRate)).toBe('0');
    });
  });

  describe('formatPaymentStatus', () => {
    test('formats all payment statuses correctly', () => {
      expect(formatPaymentStatus('pending')).toEqual({
        text: 'Ожидание оплаты',
        color: 'text-yellow-500',
        icon: '⏳'
      });

      expect(formatPaymentStatus('completed')).toEqual({
        text: 'Завершено',
        color: 'text-green-600',
        icon: '🎉'
      });

      expect(formatPaymentStatus('failed')).toEqual({
        text: 'Ошибка',
        color: 'text-red-600',
        icon: '❌'
      });
    });

    test('handles unknown status', () => {
      expect(formatPaymentStatus('unknown')).toEqual({
        text: 'Неизвестно',
        color: 'text-gray-500',
        icon: '❓'
      });
    });
  });

  describe('generatePaymentId', () => {
    test('generates valid payment IDs', () => {
      const id1 = generatePaymentId();
      const id2 = generatePaymentId();
      
      expect(id1).toMatch(/^pay_[a-z0-9]+_[a-z0-9]+$/);
      expect(id2).toMatch(/^pay_[a-z0-9]+_[a-z0-9]+$/);
      expect(id1).not.toBe(id2); // Should be unique
    });
  });

  describe('isDustAmount', () => {
    test('identifies dust amounts correctly', () => {
      expect(isDustAmount('0.000001', 'BTC')).toBe(true);
      expect(isDustAmount('0.1', 'BTC')).toBe(false);
      
      expect(isDustAmount('0.001', 'USDT')).toBe(true);
      expect(isDustAmount('1.0', 'USDT')).toBe(false);
    });
  });

  describe('timeAgo', () => {
    test('formats recent times correctly', () => {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

      expect(timeAgo(fiveMinutesAgo)).toBe('5 мин. назад');
      expect(timeAgo(twoHoursAgo)).toBe('2 ч. назад');
      expect(timeAgo(threeDaysAgo)).toBe('3 дн. назад');
    });

    test('handles seconds correctly', () => {
      const now = new Date();
      const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000);
      
      expect(timeAgo(thirtySecondsAgo)).toBe('30 сек. назад');
    });
  });

  // Mock копирование в буфер для тестирования
  Object.assign(navigator, {
    clipboard: {
      writeText: jest.fn(() => Promise.resolve())
    }
  });

  describe('copyToClipboard', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('copies text successfully', async () => {
      const result = await copyToClipboard('test text');
      
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test text');
      expect(result).toBe(true);
    });

    test('handles copy failure', async () => {
      (navigator.clipboard.writeText as jest.Mock).mockRejectedValue(new Error('Copy failed'));
      
      const result = await copyToClipboard('test text');
      expect(result).toBe(false);
    });
  });
});

describe('Constants Utils', () => {
  describe('getMinConfirmations', () => {
    test('returns correct confirmations for each currency', () => {
      expect(getMinConfirmations('BTC')).toBe(3);
      expect(getMinConfirmations('ETH')).toBe(12);
      expect(getMinConfirmations('USDT')).toBe(12);
      expect(getMinConfirmations('MATIC')).toBe(128);
    });

    test('returns default for unknown currency', () => {
      expect(getMinConfirmations('UNKNOWN' as any)).toBe(1);
    });
  });

  describe('getCryptoIcon', () => {
    test('returns correct icons for each currency', () => {
      expect(getCryptoIcon('BTC')).toBe('₿');
      expect(getCryptoIcon('ETH')).toBe('Ξ');
      expect(getCryptoIcon('USDT')).toBe('₮');
      expect(getCryptoIcon('UNKNOWN' as any)).toBe('💎');
    });
  });

  describe('getCryptoColor', () => {
    test('returns correct colors for each currency', () => {
      expect(getCryptoColor('BTC')).toBe('#F7931A');
      expect(getCryptoColor('ETH')).toBe('#627EEA');
      expect(getCryptoColor('USDT')).toBe('#26A17B');
    });
  });

  describe('isStablecoin', () => {
    test('correctly identifies stablecoins', () => {
      expect(isStablecoin('USDT')).toBe(true);
      expect(isStablecoin('USDC')).toBe(true);
      expect(isStablecoin('BUSD')).toBe(true);
      expect(isStablecoin('BTC')).toBe(false);
      expect(isStablecoin('ETH')).toBe(false);
    });
  });

  describe('getNetworkByCurrency', () => {
    test('returns correct networks for currencies', () => {
      expect(getNetworkByCurrency('BTC')).toBe('bitcoin');
      expect(getNetworkByCurrency('ETH')).toBe('ethereum');
      expect(getNetworkByCurrency('USDT')).toBe('ethereum');
      expect(getNetworkByCurrency('BUSD')).toBe('bsc');
      expect(getNetworkByCurrency('MATIC')).toBe('polygon');
    });

    test('defaults to ethereum for unknown currency', () => {
      expect(getNetworkByCurrency('UNKNOWN' as any)).toBe('ethereum');
    });
  });
});
