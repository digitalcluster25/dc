// 📊 Payment Status Component - CRYPTO_BILLING_MODULE

'use client';

import { useState, useEffect } from 'react';
import { 
  CryptoPayment, 
  PaymentStatus as PaymentStatusType,
  SERVICE_CATALOG
} from '../types/crypto-billing.types';
import { 
  formatPaymentStatus, 
  formatTimeRemaining, 
  formatCryptoAmount,
  formatWalletAddress,
  getExplorerUrl,
  timeAgo
} from '../utils/formatters';

interface PaymentStatusProps {
  paymentId: string;
  onStatusChange?: (status: PaymentStatusType) => void;
  autoRefresh?: boolean;
  className?: string;
}

export default function PaymentStatus({
  paymentId,
  onStatusChange,
  autoRefresh = true,
  className = ''
}: PaymentStatusProps) {
  const [payment, setPayment] = useState<CryptoPayment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState('');

  // Загружаем данные платежа
  useEffect(() => {
    loadPaymentStatus();
  }, [paymentId]);

  // Автообновление статуса
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      if (payment && ['pending', 'confirming'].includes(payment.status)) {
        loadPaymentStatus();
      }
    }, 10000); // Обновляем каждые 10 секунд

    return () => clearInterval(interval);
  }, [payment, autoRefresh]);

  // Обновление оставшегося времени
  useEffect(() => {
    if (payment?.expiresAt) {
      const interval = setInterval(() => {
        const remaining = formatTimeRemaining(payment.expiresAt);
        setTimeRemaining(remaining);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [payment]);

  /**
   * Загрузка статуса платежа
   */
  const loadPaymentStatus = async () => {
    try {
      setError('');
      
      const response = await fetch(`/api/crypto/check-payment?paymentId=${paymentId}`);
      const data = await response.json();

      if (data.success && data.payment) {
        setPayment(data.payment);
        onStatusChange?.(data.payment.status);
      } else {
        setError('Платеж не найден');
      }
    } catch (error) {
      console.error('Failed to load payment status:', error);
      setError('Ошибка загрузки статуса платежа');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`glass-card p-8 text-center ${className}`}>
        <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white">Загрузка статуса платежа...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`glass-card p-8 text-center ${className}`}>
        <div className="text-red-400 text-xl mb-4">❌</div>
        <p className="text-red-300 mb-4">{error}</p>
        <button
          onClick={() => {
            setLoading(true);
            loadPaymentStatus();
          }}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className={`glass-card p-8 text-center ${className}`}>
        <p className="text-gray-300">Платеж не найден</p>
      </div>
    );
  }

  const statusInfo = formatPaymentStatus(payment.status);
  const serviceInfo = SERVICE_CATALOG.find(s => s.type === payment.serviceType);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Status */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">
            Платеж #{payment.id.slice(-8)}
          </h2>
          <div className={`flex items-center ${statusInfo.color} font-semibold`}>
            <span className="text-xl mr-2">{statusInfo.icon}</span>
            {statusInfo.text}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-300">Сервис:</label>
            <div className="text-white font-medium">
              {serviceInfo?.icon} {serviceInfo?.name}
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-300">Сумма:</label>
            <div className="text-white font-medium">
              {formatCryptoAmount(payment.cryptoAmount, payment.cryptoCurrency)}
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-300">Создан:</label>
            <div className="text-white font-medium">
              {timeAgo(payment.createdAt)}
            </div>
          </div>
        </div>
      </div>

      {/* Status-specific Content */}
      {payment.status === 'pending' && (
        <div className="glass-card p-6">
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">⏳</div>
            <h3 className="text-xl font-bold text-white mb-2">
              Ожидание платежа
            </h3>
            <p className="text-gray-300">
              Переведите указанную сумму на адрес кошелька
            </p>
            {timeRemaining && timeRemaining !== 'Истекло' && (
              <div className="mt-3 text-yellow-400 font-medium">
                ⏰ Осталось времени: {timeRemaining}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-300">Адрес для перевода:</label>
              <div className="flex items-center justify-between bg-white/5 p-3 rounded mt-1">
                <span className="font-mono text-white">
                  {formatWalletAddress(payment.paymentAddress)}
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(payment.paymentAddress)}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  📋 Копировать
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-300">Точная сумма:</label>
              <div className="bg-white/5 p-3 rounded mt-1">
                <span className="text-xl font-bold text-blue-400">
                  {formatCryptoAmount(payment.cryptoAmount, payment.cryptoCurrency)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {payment.status === 'confirming' && (
        <div className="glass-card p-6">
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">🔄</div>
            <h3 className="text-xl font-bold text-white mb-2">
              Подтверждение в блокчейне
            </h3>
            <p className="text-gray-300">
              Платеж получен, ожидаем подтверждения
            </p>
          </div>

          <div className="space-y-4">
            {payment.transactionHash && (
              <div>
                <label className="text-sm text-gray-300">Хеш транзакции:</label>
                <div className="flex items-center justify-between bg-white/5 p-3 rounded mt-1">
                  <span className="font-mono text-white">
                    {formatWalletAddress(payment.transactionHash)}
                  </span>
                  <a
                    href={getExplorerUrl(payment.transactionHash, payment.cryptoCurrency)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    🔗 Посмотреть
                  </a>
                </div>
              </div>
            )}

            <div>
              <label className="text-sm text-gray-300">Подтверждения:</label>
              <div className="bg-white/5 p-3 rounded mt-1">
                <div className="flex items-center justify-between">
                  <span className="text-white">
                    {payment.confirmations} / {payment.requiredConfirmations}
                  </span>
                  <div className="flex-1 ml-4">
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min((payment.confirmations / payment.requiredConfirmations) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {payment.status === 'confirmed' && (
        <div className="glass-card p-6">
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-white mb-2">
              Платеж подтвержден
            </h3>
            <p className="text-gray-300">
              Активируем ваш сервис...
            </p>
          </div>

          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="w-6 h-6 border-2 border-green-300 border-t-transparent rounded-full animate-spin mr-3"></div>
              <span className="text-green-300">
                Настраиваем {serviceInfo?.name}...
              </span>
            </div>
          </div>
        </div>
      )}

      {payment.status === 'completed' && (
        <div className="glass-card p-6">
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-white mb-2">
              Сервис готов к использованию!
            </h3>
            <p className="text-gray-300">
              {serviceInfo?.name} успешно активирован
            </p>
          </div>

          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-6">
            <div className="text-green-300 font-medium text-center">
              ✅ Активация завершена {payment.completedAt && timeAgo(payment.completedAt)}
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => {
                // TODO: Переход к управлению сервисом
                console.log('Navigate to service management');
              }}
              className="btn-primary px-8 py-3 text-lg font-semibold"
            >
              Перейти к сервису 🚀
            </button>
          </div>
        </div>
      )}

      {payment.status === 'expired' && (
        <div className="glass-card p-6">
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">⏰</div>
            <h3 className="text-xl font-bold text-white mb-2">
              Время платежа истекло
            </h3>
            <p className="text-gray-300">
              Платеж не был получен в установленный срок
            </p>
          </div>

          <div className="text-center">
            <button
              onClick={() => {
                // TODO: Создать новый платеж
                window.location.reload();
              }}
              className="btn-primary px-6 py-3 font-semibold"
            >
              Создать новый платеж
            </button>
          </div>
        </div>
      )}

      {payment.status === 'failed' && (
        <div className="glass-card p-6">
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">❌</div>
            <h3 className="text-xl font-bold text-white mb-2">
              Ошибка обработки платежа
            </h3>
            <p className="text-gray-300">
              Произошла ошибка при обработке вашего платежа
            </p>
          </div>

          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <div className="text-red-300 text-center">
              Свяжитесь с поддержкой для решения проблемы
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => {
                // TODO: Контакт поддержки
                console.log('Contact support');
              }}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded transition-colors"
            >
              Связаться с поддержкой
            </button>
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="text-center">
        <button
          onClick={() => {
            setLoading(true);
            loadPaymentStatus();
          }}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded transition-colors"
          disabled={loading}
        >
          {loading ? '🔄 Обновление...' : '🔄 Обновить статус'}
        </button>
      </div>
    </div>
  );
}

/**
 * Компактный компонент статуса платежа
 */
interface PaymentStatusCompactProps {
  payment: CryptoPayment;
  className?: string;
}

export function PaymentStatusCompact({ payment, className = '' }: PaymentStatusCompactProps) {
  const statusInfo = formatPaymentStatus(payment.status);
  const serviceInfo = SERVICE_CATALOG.find(s => s.type === payment.serviceType);

  return (
    <div className={`glass-card p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-2xl mr-3">{statusInfo.icon}</span>
          <div>
            <div className="font-medium text-white">
              {serviceInfo?.name}
            </div>
            <div className="text-sm text-gray-300">
              {formatCryptoAmount(payment.cryptoAmount, payment.cryptoCurrency)}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`font-medium ${statusInfo.color}`}>
            {statusInfo.text}
          </div>
          <div className="text-xs text-gray-400">
            {timeAgo(payment.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
}