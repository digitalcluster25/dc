// 🎣 Crypto Payment Hook - CRYPTO_BILLING_MODULE

'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  CryptoPayment, 
  CreatePaymentRequest, 
  ServiceType,
  CryptoCurrency,
  PaymentStatus 
} from '../types/crypto-billing.types';
import { useAuth } from '../../auth/hooks/useAuth';

export interface UseCryptoPaymentResult {
  // Состояние
  currentPayment: CryptoPayment | null;
  userPayments: CryptoPayment[];
  loading: boolean;
  error: string | null;

  // Методы
  createPayment: (serviceType: ServiceType, currency: CryptoCurrency) => Promise<CryptoPayment | null>;
  checkPaymentStatus: (paymentId: string) => Promise<CryptoPayment | null>;
  confirmPayment: (paymentId: string, txHash: string) => Promise<boolean>;
  getUserPayments: () => Promise<CryptoPayment[]>;
  
  // Утилиты
  refreshCurrentPayment: () => Promise<void>;
  clearError: () => void;
}

/**
 * Hook для управления криптоплатежами
 */
export function useCryptoPayment(): UseCryptoPaymentResult {
  const { user } = useAuth();
  
  const [currentPayment, setCurrentPayment] = useState<CryptoPayment | null>(null);
  const [userPayments, setUserPayments] = useState<CryptoPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загружаем платежи пользователя при логине
  useEffect(() => {
    if (user) {
      getUserPayments();
    }
  }, [user]);

  // Автообновление статуса текущего платежа
  useEffect(() => {
    if (!currentPayment) return;

    const shouldAutoUpdate = ['pending', 'confirming'].includes(currentPayment.status);
    if (!shouldAutoUpdate) return;

    const interval = setInterval(() => {
      refreshCurrentPayment();
    }, 15000); // Обновляем каждые 15 секунд

    return () => clearInterval(interval);
  }, [currentPayment]);

  /**
   * Создание нового платежа
   */
  const createPayment = useCallback(async (
    serviceType: ServiceType, 
    currency: CryptoCurrency
  ): Promise<CryptoPayment | null> => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Требуется авторизация');
      }

      const response = await fetch('/api/crypto/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          serviceType,
          cryptoCurrency: currency
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Ошибка создания платежа');
      }

      if (data.success && data.payment) {
        setCurrentPayment(data.payment);
        await getUserPayments(); // Обновляем список платежей
        return data.payment;
      } else {
        throw new Error(data.message || 'Неизвестная ошибка');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка создания платежа';
      setError(errorMessage);
      console.error('Payment creation error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Проверка статуса платежа
   */
  const checkPaymentStatus = useCallback(async (paymentId: string): Promise<CryptoPayment | null> => {
    try {
      const response = await fetch(`/api/crypto/check-payment?paymentId=${paymentId}`);
      const data = await response.json();

      if (data.success && data.payment) {
        // Обновляем текущий платеж если это он
        if (currentPayment?.id === paymentId) {
          setCurrentPayment(data.payment);
        }
        
        // Обновляем в списке пользователя
        setUserPayments(prev => 
          prev.map(p => p.id === paymentId ? data.payment : p)
        );

        return data.payment;
      } else {
        throw new Error('Платеж не найден');
      }
    } catch (err) {
      console.error('Payment status check error:', err);
      return null;
    }
  }, [currentPayment]);

  /**
   * Подтверждение платежа с хешем транзакции
   */
  const confirmPayment = useCallback(async (
    paymentId: string, 
    txHash: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Требуется авторизация');
      }

      const response = await fetch('/api/crypto/confirm-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          paymentId,
          transactionHash: txHash
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Ошибка подтверждения платежа');
      }

      if (data.success) {
        // Обновляем статус платежа
        await checkPaymentStatus(paymentId);
        return true;
      } else {
        throw new Error(data.message || 'Не удалось подтвердить платеж');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка подтверждения платежа';
      setError(errorMessage);
      console.error('Payment confirmation error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Получение всех платежей пользователя
   */
  const getUserPayments = useCallback(async (): Promise<CryptoPayment[]> => {
    if (!user) return [];

    try {
      const token = localStorage.getItem('access_token');
      if (!token) return [];

      // В реальном проекте будет отдельный API endpoint
      // Пока используем mock данные
      const mockPayments: CryptoPayment[] = [];
      setUserPayments(mockPayments);
      return mockPayments;

    } catch (err) {
      console.error('Get user payments error:', err);
      return [];
    }
  }, [user]);

  /**
   * Обновление текущего платежа
   */
  const refreshCurrentPayment = useCallback(async (): Promise<void> => {
    if (!currentPayment) return;

    const updatedPayment = await checkPaymentStatus(currentPayment.id);
    if (updatedPayment) {
      setCurrentPayment(updatedPayment);
    }
  }, [currentPayment, checkPaymentStatus]);

  /**
   * Очистка ошибки
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    currentPayment,
    userPayments,
    loading,
    error,
    createPayment,
    checkPaymentStatus,
    confirmPayment,
    getUserPayments,
    refreshCurrentPayment,
    clearError
  };
}

/**
 * Hook для отслеживания конкретного платежа
 */
export function usePaymentStatus(paymentId: string | null) {
  const [payment, setPayment] = useState<CryptoPayment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = useCallback(async () => {
    if (!paymentId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/crypto/check-payment?paymentId=${paymentId}`);
      const data = await response.json();

      if (data.success && data.payment) {
        setPayment(data.payment);
      } else {
        setError('Платеж не найден');
      }
    } catch (err) {
      setError('Ошибка загрузки статуса платежа');
      console.error('Payment status error:', err);
    } finally {
      setLoading(false);
    }
  }, [paymentId]);

  // Загружаем статус при монтировании и изменении paymentId
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Автообновление для активных платежей
  useEffect(() => {
    if (!payment || !['pending', 'confirming'].includes(payment.status)) {
      return;
    }

    const interval = setInterval(() => {
      checkStatus();
    }, 10000); // Обновляем каждые 10 секунд

    return () => clearInterval(interval);
  }, [payment, checkStatus]);

  return {
    payment,
    loading,
    error,
    refresh: checkStatus
  };
}

/**
 * Hook для статистики платежей пользователя
 */
export function usePaymentStats() {
  const { userPayments } = useCryptoPayment();

  const stats = {
    total: userPayments.length,
    completed: userPayments.filter(p => p.status === 'completed').length,
    pending: userPayments.filter(p => ['pending', 'confirming'].includes(p.status)).length,
    failed: userPayments.filter(p => ['failed', 'expired'].includes(p.status)).length,
    totalSpentEUR: userPayments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.priceEUR, 0)
  };

  const recentPayments = userPayments
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const popularServices = userPayments
    .filter(p => p.status === 'completed')
    .reduce((acc, payment) => {
      acc[payment.serviceType] = (acc[payment.serviceType] || 0) + 1;
      return acc;
    }, {} as Record<ServiceType, number>);

  const popularCurrencies = userPayments
    .reduce((acc, payment) => {
      acc[payment.cryptoCurrency] = (acc[payment.cryptoCurrency] || 0) + 1;
      return acc;
    }, {} as Record<CryptoCurrency, number>);

  return {
    stats,
    recentPayments,
    popularServices,
    popularCurrencies
  };
}

/**
 * Hook для управления процессом оплаты (пошаговый)
 */
export function usePaymentFlow() {
  const [step, setStep] = useState<'service' | 'currency' | 'payment' | 'status' | 'complete'>('service');
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<CryptoCurrency>('USDT');
  const [currentPayment, setCurrentPayment] = useState<CryptoPayment | null>(null);

  const { createPayment, loading, error } = useCryptoPayment();

  /**
   * Переход к следующему шагу
   */
  const nextStep = useCallback(() => {
    switch (step) {
      case 'service':
        if (selectedService) setStep('currency');
        break;
      case 'currency':
        setStep('payment');
        break;
      case 'payment':
        setStep('status');
        break;
      case 'status':
        setStep('complete');
        break;
    }
  }, [step, selectedService]);

  /**
   * Возврат к предыдущему шагу
   */
  const prevStep = useCallback(() => {
    switch (step) {
      case 'currency':
        setStep('service');
        break;
      case 'payment':
        setStep('currency');
        break;
      case 'status':
        setStep('payment');
        break;
      case 'complete':
        setStep('status');
        break;
    }
  }, [step]);

  /**
   * Создание платежа и переход к статусу
   */
  const processPayment = useCallback(async () => {
    if (!selectedService) return false;

    const payment = await createPayment(selectedService, selectedCurrency);
    if (payment) {
      setCurrentPayment(payment);
      setStep('status');
      return true;
    }
    return false;
  }, [selectedService, selectedCurrency, createPayment]);

  /**
   * Сброс процесса
   */
  const reset = useCallback(() => {
    setStep('service');
    setSelectedService(null);
    setSelectedCurrency('USDT');
    setCurrentPayment(null);
  }, []);

  return {
    step,
    selectedService,
    selectedCurrency,
    currentPayment,
    loading,
    error,
    setSelectedService,
    setSelectedCurrency,
    nextStep,
    prevStep,
    processPayment,
    reset
  };
}
