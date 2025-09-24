// 💳 Crypto Checkout Component - CRYPTO_BILLING_MODULE

'use client';

import { useState, useEffect } from 'react';
import { 
  CryptoCurrency, 
  CryptoPayment, 
  ServiceType, 
  CryptoRate 
} from '../types/crypto-billing.types';
import { SUPPORTED_CURRENCIES, SERVICE_CATALOG } from '../utils/constants';
import { 
  formatCryptoAmount, 
  formatFiatAmount, 
  formatWalletAddress, 
  formatTimeRemaining,
  copyToClipboard 
} from '../utils/formatters';

interface CryptoCheckoutProps {
  serviceType: ServiceType;
  onPaymentCreated?: (payment: CryptoPayment) => void;
  onPaymentComplete?: (payment: CryptoPayment) => void;
  className?: string;
}

export default function CryptoCheckout({
  serviceType,
  onPaymentCreated,
  onPaymentComplete,
  className = ''
}: CryptoCheckoutProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<CryptoCurrency>('USDT');
  const [cryptoRates, setCryptoRates] = useState<CryptoRate[]>([]);
  const [currentPayment, setCurrentPayment] = useState<CryptoPayment | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'select' | 'payment' | 'completed'>('select');
  const [timeRemaining, setTimeRemaining] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const selectedService = SERVICE_CATALOG.find(s => s.type === serviceType);
  const selectedRate = cryptoRates.find(r => r.currency === selectedCurrency);

  // Загружаем курсы валют при загрузке
  useEffect(() => {
    loadCryptoRates();
  }, []);

  // Обновляем оставшееся время
  useEffect(() => {
    if (currentPayment && currentPayment.expiresAt) {
      const interval = setInterval(() => {
        const remaining = formatTimeRemaining(currentPayment.expiresAt);
        setTimeRemaining(remaining);
        
        if (remaining === 'Истекло') {
          clearInterval(interval);
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [currentPayment]);

  /**
   * Загрузка курсов криптовалют
   */
  const loadCryptoRates = async () => {
    try {
      const response = await fetch('/api/crypto/rates');
      const data = await response.json();
      
      if (data.success) {
        setCryptoRates(data.rates);
      }
    } catch (error) {
      console.error('Failed to load crypto rates:', error);
    }
  };

  /**
   * Создание платежа
   */
  const createPayment = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/crypto/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          serviceType,
          cryptoCurrency: selectedCurrency
        })
      });

      const data = await response.json();
      
      if (data.success && data.payment) {
        setCurrentPayment(data.payment);
        setStep('payment');
        onPaymentCreated?.(data.payment);
      } else {
        alert('Ошибка создания платежа: ' + data.message);
      }
    } catch (error) {
      console.error('Payment creation error:', error);
      alert('Произошла ошибка при создании платежа');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Копирование в буфер обмена
   */
  const handleCopy = async (text: string, type: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  /**
   * Рендер выбора валюты
   */
  const renderCurrencySelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-4">
          Выберите криптовалюту для оплаты
        </h2>
        <div className="glass-card p-4 inline-block">
          <div className="text-lg text-gray-300">
            {selectedService?.name} - <span className="text-blue-400 font-bold">€10</span>
          </div>
        </div>
      </div>

      {/* Рекомендуемые валюты (Stablecoins) */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
          💎 Рекомендуемые (стабильные)
          <span className="ml-2 text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
            НИЗКИЕ КОМИССИИ
          </span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SUPPORTED_CURRENCIES
            .filter(currency => currency.isStablecoin)
            .map((currency) => {
              const rate = cryptoRates.find(r => r.currency === currency.symbol);
              const cryptoAmount = rate ? (10 / rate.priceEUR).toFixed(2) : '~';
              
              return (
                <div
                  key={currency.symbol}
                  onClick={() => setSelectedCurrency(currency.symbol)}
                  className={`
                    glass-card p-4 cursor-pointer transition-all
                    ${selectedCurrency === currency.symbol 
                      ? 'ring-2 ring-blue-500 bg-blue-500/20' 
                      : 'hover:bg-white/10'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-2xl mr-3">{currency.icon}</div>
                      <div>
                        <div className="font-bold text-white">{currency.symbol}</div>
                        <div className="text-sm text-gray-300">{currency.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-400">
                        {cryptoAmount} {currency.symbol}
                      </div>
                      <div className="text-xs text-gray-400">
                        ≈€{rate?.priceEUR.toFixed(3) || '1.00'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 text-xs text-gray-400 flex items-center justify-between">
                    <span>⚡ {currency.avgConfirmationTime} мин</span>
                    <span className="text-green-400">Стабильная</span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Другие криптовалюты */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">
          🌟 Другие криптовалюты
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SUPPORTED_CURRENCIES
            .filter(currency => !currency.isStablecoin)
            .map((currency) => {
              const rate = cryptoRates.find(r => r.currency === currency.symbol);
              const cryptoAmount = rate ? (10 / rate.priceEUR).toFixed(6) : '~';
              
              return (
                <div
                  key={currency.symbol}
                  onClick={() => setSelectedCurrency(currency.symbol)}
                  className={`
                    glass-card p-4 cursor-pointer transition-all
                    ${selectedCurrency === currency.symbol 
                      ? 'ring-2 ring-blue-500 bg-blue-500/20' 
                      : 'hover:bg-white/10'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="text-2xl mr-3">{currency.icon}</div>
                      <div>
                        <div className="font-bold text-white">{currency.symbol}</div>
                        <div className="text-sm text-gray-300">{currency.name}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold text-blue-400 text-sm">
                      {cryptoAmount} {currency.symbol}
                    </div>
                    <div className="text-xs text-gray-400">
                      €{rate?.priceEUR.toFixed(2) || 'N/A'}
                      {rate?.change24h && (
                        <span className={`ml-1 ${rate.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {rate.change24h >= 0 ? '+' : ''}{rate.change24h.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Кнопка создания платежа */}
      <div className="text-center">
        <button
          onClick={createPayment}
          disabled={loading}
          className="btn-primary px-8 py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
              Создание платежа...
            </div>
          ) : (
            `Оплатить ${selectedRate ? formatCryptoAmount((10 / selectedRate.priceEUR).toString(), selectedCurrency) : '...'}`
          )}
        </button>
        
        <p className="text-sm text-gray-400 mt-2">
          Нажимая кнопку, вы соглашаетесь с условиями оплаты
        </p>
      </div>
    </div>
  );

  /**
   * Рендер страницы оплаты
   */
  const renderPaymentPage = () => {
    if (!currentPayment) return null;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            Оплата {selectedService?.name}
          </h2>
          <div className="text-gray-300">
            Переведите точную сумму на указанный адрес
          </div>
          {timeRemaining && timeRemaining !== 'Истекло' && (
            <div className="mt-2 text-yellow-400 font-medium">
              ⏰ Время на оплату: {timeRemaining}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Code */}
          <div className="text-center">
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Отсканируйте QR-код
              </h3>
              
              {/* QR Code Placeholder */}
              <div className="w-64 h-64 mx-auto mb-4 bg-white rounded-lg flex items-center justify-center">
                <div className="text-center text-black">
                  <div className="text-4xl mb-2">📱</div>
                  <div className="text-sm">QR код для</div>
                  <div className="font-bold">{currentPayment.cryptoCurrency}</div>
                </div>
              </div>
              
              <p className="text-sm text-gray-300">
                Используйте любой крипто-кошелек с поддержкой QR-кодов
              </p>
            </div>
          </div>

          {/* Payment Details */}
          <div className="space-y-4">
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Детали платежа
              </h3>
              
              <div className="space-y-4">
                {/* Amount */}
                <div>
                  <label className="text-sm text-gray-300">Сумма к оплате:</label>
                  <div className="flex items-center justify-between bg-white/5 p-3 rounded mt-1">
                    <span className="text-xl font-bold text-blue-400">
                      {formatCryptoAmount(currentPayment.cryptoAmount, currentPayment.cryptoCurrency)}
                    </span>
                    <button
                      onClick={() => handleCopy(currentPayment.cryptoAmount, 'amount')}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {copied === 'amount' ? '✓' : '📋'}
                    </button>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="text-sm text-gray-300">Адрес для перевода:</label>
                  <div className="flex items-center justify-between bg-white/5 p-3 rounded mt-1">
                    <span className="font-mono text-sm text-white">
                      {formatWalletAddress(currentPayment.paymentAddress, 8, 8)}
                    </span>
                    <button
                      onClick={() => handleCopy(currentPayment.paymentAddress, 'address')}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {copied === 'address' ? '✓ Скопировано' : '📋 Копировать'}
                    </button>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Полный адрес: {currentPayment.paymentAddress}
                  </div>
                </div>

                {/* Network */}
                <div>
                  <label className="text-sm text-gray-300">Сеть:</label>
                  <div className="bg-white/5 p-3 rounded mt-1">
                    <span className="text-white font-medium">
                      {currentPayment.network.charAt(0).toUpperCase() + currentPayment.network.slice(1)}
                    </span>
                    <span className="text-gray-400 ml-2">
                      (минимум {currentPayment.requiredConfirmations} подтверждений)
                    </span>
                  </div>
                </div>

                {/* Exchange Rate */}
                <div>
                  <label className="text-sm text-gray-300">Курс обмена:</label>
                  <div className="bg-white/5 p-3 rounded mt-1">
                    <span className="text-white">
                      1 {currentPayment.cryptoCurrency} = €{currentPayment.exchangeRate.toFixed(3)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="glass-card p-4">
              <h4 className="font-semibold text-white mb-3">📋 Инструкция:</h4>
              <ol className="text-sm text-gray-300 space-y-2">
                <li>1. Скопируйте адрес кошелька выше</li>
                <li>2. Откройте ваш крипто-кошелек</li>
                <li>3. Отправьте <strong>точную сумму</strong> на указанный адрес</li>
                <li>4. Дождитесь подтверждения в блокчейне</li>
                <li>5. Ваш сервис будет активирован автоматически</li>
              </ol>
              
              <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded">
                <div className="text-yellow-300 text-sm font-medium">
                  ⚠️ Внимание: отправляйте только {currentPayment.cryptoCurrency} на этот адрес!
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Check Button */}
        <div className="text-center">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            🔄 Проверить статус платежа
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`w-full max-w-6xl mx-auto ${className}`}>
      {step === 'select' && renderCurrencySelection()}
      {step === 'payment' && renderPaymentPage()}
    </div>
  );
}
