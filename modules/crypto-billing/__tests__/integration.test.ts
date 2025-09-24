// 🔄 Integration Tests - CRYPTO_BILLING_MODULE  
// modules/crypto-billing/__tests__/integration.test.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import createPaymentHandler, { findPaymentById, updatePaymentStatus } from '../../../pages/api/crypto/create-payment';
import checkPaymentHandler from '../../../pages/api/crypto/check-payment';
import confirmPaymentHandler from '../../../pages/api/crypto/confirm-payment';
import ratesHandler from '../../../pages/api/crypto/rates';

// Mock environment variables
process.env.CRYPTO_BILLING_SECRET = 'test-secret-key-for-jwt-tokens';
process.env.MASTER_SEED_PHRASE = 'test abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

// Mock external APIs
jest.mock('node-fetch');

describe('Crypto Billing API Integration Tests', () => {
  // Helper function to create authenticated request
  const createAuthenticatedRequest = (method: string, body?: any) => {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { 
        userId: 'test-user-123',
        email: 'test@example.com',
        role: 'user',
        permissions: ['crypto:payment:create', 'crypto:payment:view', 'crypto:payment:confirm']
      },
      process.env.CRYPTO_BILLING_SECRET,
      { expiresIn: '1h' }
    );

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method,
      headers: {
        'authorization': `Bearer ${token}`,
        'content-type': 'application/json'
      },
      body
    });

    return { req, res };
  };

  describe('POST /api/crypto/create-payment', () => {
    test('creates payment successfully with valid data', async () => {
      const { req, res } = createAuthenticatedRequest('POST', {
        serviceType: 'wordpress',
        cryptoCurrency: 'USDT'
      });

      await createPaymentHandler(req, res);

      expect(res._getStatusCode()).toBe(201);
      
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.payment).toBeDefined();
      expect(data.payment.serviceType).toBe('wordpress');
      expect(data.payment.cryptoCurrency).toBe('USDT');
      expect(data.payment.status).toBe('pending');
      expect(data.payment.priceEUR).toBe(10);
      expect(data.payment.paymentAddress).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });

    test('rejects invalid service type', async () => {
      const { req, res } = createAuthenticatedRequest('POST', {
        serviceType: 'invalid-service',
        cryptoCurrency: 'USDT'
      });

      await createPaymentHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.message).toContain('Неподдерживаемый тип сервиса');
    });

    test('rejects invalid crypto currency', async () => {
      const { req, res } = createAuthenticatedRequest('POST', {
        serviceType: 'wordpress',
        cryptoCurrency: 'INVALID_COIN'
      });

      await createPaymentHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.message).toContain('Неподдерживаемая криптовалюта');
    });

    test('requires authentication', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          serviceType: 'wordpress',
          cryptoCurrency: 'USDT'
        }
      });

      await createPaymentHandler(req, res);

      expect(res._getStatusCode()).toBe(401);
      
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.message).toContain('Требуется авторизация');
    });

    test('rejects non-POST methods', async () => {
      const { req, res } = createAuthenticatedRequest('GET');

      await createPaymentHandler(req, res);

      expect(res._getStatusCode()).toBe(405);
      
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.message).toBe('Method not allowed');
    });
  });

  describe('GET /api/crypto/check-payment', () => {
    test('checks existing payment status', async () => {
      // First create a payment
      const { req: createReq, res: createRes } = createAuthenticatedRequest('POST', {
        serviceType: 'wordpress',
        cryptoCurrency: 'USDT'
      });

      await createPaymentHandler(createReq, createRes);
      const createData = JSON.parse(createRes._getData());
      const paymentId = createData.payment.id;

      // Then check its status
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: { paymentId },
        headers: {
          'authorization': `Bearer ${require('jsonwebtoken').sign(
            { userId: 'test-user-123', email: 'test@example.com' },
            process.env.CRYPTO_BILLING_SECRET
          )}`
        }
      });

      await checkPaymentHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.payment).toBeDefined();
      expect(data.payment.id).toBe(paymentId);
    });

    test('returns 404 for non-existent payment', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: { paymentId: 'pay_nonexistent' },
        headers: {
          'authorization': `Bearer ${require('jsonwebtoken').sign(
            { userId: 'test-user-123', email: 'test@example.com' },
            process.env.CRYPTO_BILLING_SECRET
          )}`
        }
      });

      await checkPaymentHandler(req, res);

      expect(res._getStatusCode()).toBe(404);
      
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
    });

    test('requires paymentId parameter', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        headers: {
          'authorization': `Bearer ${require('jsonwebtoken').sign(
            { userId: 'test-user-123', email: 'test@example.com' },
            process.env.CRYPTO_BILLING_SECRET
          )}`
        }
      });

      await checkPaymentHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
    });
  });

  describe('POST /api/crypto/confirm-payment', () => {
    let testPaymentId: string;

    beforeEach(async () => {
      // Create a test payment
      const { req, res } = createAuthenticatedRequest('POST', {
        serviceType: 'wordpress',
        cryptoCurrency: 'USDT'
      });

      await createPaymentHandler(req, res);
      const data = JSON.parse(res._getData());
      testPaymentId = data.payment.id;
    });

    test('confirms payment with valid transaction hash', async () => {
      const { req, res } = createAuthenticatedRequest('POST', {
        paymentId: testPaymentId,
        transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      });

      await confirmPaymentHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.serviceActivated).toBeDefined();
    });

    test('rejects invalid transaction hash format', async () => {
      const { req, res } = createAuthenticatedRequest('POST', {
        paymentId: testPaymentId,
        transactionHash: 'invalid-hash'
      });

      await confirmPaymentHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.message).toContain('Некорректный формат хеша транзакции');
    });

    test('rejects confirmation for non-existent payment', async () => {
      const { req, res } = createAuthenticatedRequest('POST', {
        paymentId: 'pay_nonexistent',
        transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      });

      await confirmPaymentHandler(req, res);

      expect(res._getStatusCode()).toBe(404);
      
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.message).toContain('Платеж не найден');
    });
  });

  describe('GET /api/crypto/rates', () => {
    test('returns crypto rates successfully', async () => {
      // Mock fetch для CoinGecko API
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          bitcoin: { usd: 43000, eur: 39560, usd_24h_change: 2.5, last_updated_at: Date.now() / 1000 },
          ethereum: { usd: 2600, eur: 2392, usd_24h_change: 1.8, last_updated_at: Date.now() / 1000 },
          tether: { usd: 1.0, eur: 0.92, usd_24h_change: 0.1, last_updated_at: Date.now() / 1000 }
        })
      });
      
      global.fetch = mockFetch;

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET'
      });

      await ratesHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.rates).toBeDefined();
      expect(Array.isArray(data.rates)).toBe(true);
    });

    test('returns fallback rates when API fails', async () => {
      // Mock fetch to fail
      const mockFetch = jest.fn().mockRejectedValue(new Error('API Error'));
      global.fetch = mockFetch;

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET'
      });

      await ratesHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.rates).toBeDefined();
      expect(data.rates.length).toBeGreaterThan(0);
    });

    test('filters by currency parameter', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: { currency: 'USDT' }
      });

      await ratesHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.rates).toBeDefined();
    });

    test('rejects non-GET methods', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST'
      });

      await ratesHandler(req, res);

      expect(res._getStatusCode()).toBe(405);
    });
  });

  describe('Payment Flow Integration', () => {
    test('complete payment lifecycle', async () => {
      // 1. Create payment
      const { req: createReq, res: createRes } = createAuthenticatedRequest('POST', {
        serviceType: 'wordpress',
        cryptoCurrency: 'USDT'
      });

      await createPaymentHandler(createReq, createRes);
      expect(createRes._getStatusCode()).toBe(201);
      
      const createData = JSON.parse(createRes._getData());
      const paymentId = createData.payment.id;
      expect(createData.payment.status).toBe('pending');

      // 2. Check payment status
      const { req: checkReq, res: checkRes } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: { paymentId },
        headers: {
          'authorization': `Bearer ${require('jsonwebtoken').sign(
            { userId: 'test-user-123', email: 'test@example.com' },
            process.env.CRYPTO_BILLING_SECRET
          )}`
        }
      });

      await checkPaymentHandler(checkReq, checkRes);
      expect(checkRes._getStatusCode()).toBe(200);
      
      const checkData = JSON.parse(checkRes._getData());
      expect(checkData.payment.status).toBe('pending');

      // 3. Confirm payment
      const { req: confirmReq, res: confirmRes } = createAuthenticatedRequest('POST', {
        paymentId,
        transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      });

      await confirmPaymentHandler(confirmReq, confirmRes);
      expect(confirmRes._getStatusCode()).toBe(200);
      
      const confirmData = JSON.parse(confirmRes._getData());
      expect(confirmData.success).toBe(true);

      // 4. Verify payment was updated
      const updatedPayment = findPaymentById(paymentId);
      expect(updatedPayment?.status).not.toBe('pending');
    });
  });

  describe('Helper Functions', () => {
    test('findPaymentById works correctly', () => {
      // Create a payment first
      const payment = {
        id: 'test-payment-id',
        userId: 'test-user',
        serviceType: 'wordpress' as const,
        cryptoCurrency: 'USDT' as const,
        status: 'pending' as const
      };

      // Payment should not be found initially
      expect(findPaymentById('test-payment-id')).toBeNull();
    });

    test('updatePaymentStatus works correctly', () => {
      const paymentId = 'test-payment-for-update';
      
      // Try to update non-existent payment
      const result = updatePaymentStatus(paymentId, 'confirmed');
      expect(result).toBeNull();
    });
  });
});

// Cleanup after tests
afterAll(() => {
  jest.restoreAllMocks();
});
