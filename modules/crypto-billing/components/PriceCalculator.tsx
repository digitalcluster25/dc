// 🧮 Price Calculator Component - CRYPTO_BILLING_MODULE

'use client';

import { useState, useEffect } from 'react';
import { CryptoCurrency, ServiceType, CryptoRate } from '../types/crypto-billing.types';
import { useCryptoRates, useCurrencyConverter } from '../hooks/useCryptoRates';
import { SERVICE_CATALOG, SYSTEM_CONFIG } from '../utils/constants';
import { formatCryptoAmount, formatFiatAmount, getCryptoIcon, getCryptoColor } from '../utils/formatters';

interface PriceCalculatorProps {
  serviceType?: ServiceType;
  selectedCurrency?: CryptoCurrency;
  onCurrencyChange?: (currency: CryptoCurrency) => void;
  showComparison?: boolean;
  className?: string;
}

export default function PriceCalculator({
  serviceType = 'wordpress',
  selectedCurrency = 'USDT',
  onCurrencyChange,
  showComparison = true,
  className = ''
}: PriceCalculatorProps) {
  const { rates, loading, error, refreshRates } = useCryptoRates();
  const { convertFromFiat } = useCurrencyConverter();
  const [customAmount, setCustomAmount] = useState<number>(SYSTEM_CONFIG.SERVICE_PRICE_EUR);

  const selectedService = SERVICE_CATALOG.find(s => s.type === serviceType);
  const selectedRate = rates.find(r => r.currency === selectedCurrency);

  // Рассчитываем цену в выбранной криптовалюте
  const cryptoPrice = selectedRate 
    ? convertFromFiat(customAmount, selectedCurrency, 'EUR')
    : 0;

  // Получаем сравнение со всеми валютами
  const allPrices = rates.map(rate => ({
    currency: rate.currency,
    amount: convertFromFiat(customAmount, rate.currency, 'EUR'),
    rate: rate,
    isSelected: rate.currency === selectedCurrency,
    isStablecoin: ['USDT', 'USDC', 'BUSD'].includes(rate.currency)
  }));

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          💰 Калькулятор стоимости
        </h2>
        <p className="text-gray-300">
          Рассчитайте точную стоимость в криптовалютах
        </p>
      </div>

      {/* Service Selection */}
      <div className="glass-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-200 mb-3 block">
              Выбранный сервис:
            </label>
            <div className="flex items-center p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="text-3xl mr-4">{selectedService?.icon}</div>
              <div>
                <div className="font-semibold text-white">{selectedService?.name}</div>
                <div className="text-sm text-gray-300">{selectedService?.description}</div>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-200 mb-3 block">
              Настройка цены (€):
            </label>
            <div className="space-y-3">
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(parseFloat(e.target.value) || 0)}
                className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                min="1"
                max="1000"
                step="1"
              />
              <div className="flex space-x-2">
                <button
                  onClick={() => setCustomAmount(10)}
                  className={`px-3 py-1 rounded text-sm ${customAmount === 10 ? 'bg-blue-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
                >
                  €10
                </button>
                <button
                  onClick={() => setCustomAmount(25)}
                  className={`px-3 py-1 rounded text-sm ${customAmount === 25 ? 'bg-blue-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
                >
                  €25
                </button>
                <button
                  onClick={() => setCustomAmount(50)}
                  className={`px-3 py-1 rounded text-sm ${customAmount === 50 ? 'bg-blue-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
                >
                  €50
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Calculator */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">
            Стоимость в криптовалюте
          </h3>
          <button
            onClick={refreshRates}
            disabled={loading}
            className="flex items-center space-x-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            <span className={loading ? 'animate-spin' : ''}>🔄</span>
            <span>Обновить курсы</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <div className="text-red-300">
              ⚠️ {error}
            </div>
          </div>
        )}

        {/* Selected Currency Display */}
        {selectedRate && (
          <div className="mb-8">
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/30">
              <div className="flex items-center">
                <div className="text-4xl mr-4" style={{ color: getCryptoColor(selectedCurrency) }}>
                  {getCryptoIcon(selectedCurrency)}
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {formatCryptoAmount(cryptoPrice.toString(), selectedCurrency)}
                  </div>
                  <div className="text-gray-300">
                    ≈ {formatFiatAmount(customAmount)} по курсу €{selectedRate.priceEUR.toFixed(4)}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-300 mb-1">Изменение за 24ч:</div>
                <div className={`font-semibold ${
                  selectedRate.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {selectedRate.change24h >= 0 ? '+' : ''}{selectedRate.change24h.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Currency Selection Grid */}
        <div>
          <h4 className="font-semibold text-white mb-4">Выберите криптовалюту:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allPrices.map(({ currency, amount, rate, isSelected, isStablecoin }) => (
              <div
                key={currency}
                onClick={() => onCurrencyChange?.(currency)}
                className={`
                  p-4 rounded-lg cursor-pointer transition-all border
                  ${isSelected 
                    ? 'bg-blue-500/20 border-blue-500' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }
                `}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="text-2xl mr-3" style={{ color: getCryptoColor(currency) }}>
                      {getCryptoIcon(currency)}
                    </div>
                    <div>
                      <div className="font-bold text-white">{currency}</div>
                      {isStablecoin && (
                        <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                          СТАБИЛЬНАЯ
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {isSelected && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="font-bold text-blue-400">
                    {formatCryptoAmount(amount.toString(), currency)}
                  </div>
                  <div className="text-xs text-gray-400">
                    €{rate.priceEUR.toFixed(currency === 'BTC' ? 0 : 4)} за 1 {currency}
                  </div>
                  <div className={`text-xs ${
                    rate.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {rate.change24h >= 0 ? '+' : ''}{rate.change24h.toFixed(1)}% (24ч)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison Table (if enabled) */}
      {showComparison && (
        <div className="glass-card p-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            📊 Сравнение всех валют
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 text-gray-300">Валюта</th>
                  <th className="text-right py-3 text-gray-300">Количество</th>
                  <th className="text-right py-3 text-gray-300">Курс (€)</th>
                  <th className="text-right py-3 text-gray-300">Изменение 24ч</th>
                  <th className="text-right py-3 text-gray-300">Тип</th>
                </tr>
              </thead>
              <tbody>
                {allPrices
                  .sort((a, b) => {
                    // Сортируем: выбранная → стабильные → остальные
                    if (a.isSelected && !b.isSelected) return -1;
                    if (!a.isSelected && b.isSelected) return 1;
                    if (a.isStablecoin && !b.isStablecoin) return -1;
                    if (!a.isStablecoin && b.isStablecoin) return 1;
                    return 0;
                  })
                  .map(({ currency, amount, rate, isSelected, isStablecoin }) => (
                    <tr
                      key={currency}
                      className={`
                        border-b border-white/5 hover:bg-white/5 cursor-pointer
                        ${isSelected ? 'bg-blue-500/10' : ''}
                      `}
                      onClick={() => onCurrencyChange?.(currency)}
                    >
                      <td className="py-3">
                        <div className="flex items-center">
                          <div className="text-lg mr-2" style={{ color: getCryptoColor(currency) }}>
                            {getCryptoIcon(currency)}
                          </div>
                          <div>
                            <div className="font-medium text-white">{currency}</div>
                            {isSelected && (
                              <span className="text-xs text-blue-400">✓ Выбрано</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="text-right py-3 font-mono text-blue-400">
                        {formatCryptoAmount(amount.toString(), currency)}
                      </td>
                      <td className="text-right py-3 text-white">
                        €{rate.priceEUR.toFixed(currency === 'BTC' ? 0 : 4)}
                      </td>
                      <td className={`text-right py-3 ${
                        rate.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {rate.change24h >= 0 ? '+' : ''}{rate.change24h.toFixed(1)}%
                      </td>
                      <td className="text-right py-3">
                        {isStablecoin ? (
                          <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                            Стабильная
                          </span>
                        ) : (
                          <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded">
                            Волатильная
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="glass-card p-4">
        <h4 className="font-semibold text-white mb-3">💡 Советы:</h4>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex items-start">
            <span className="text-green-400 mr-2">•</span>
            <span>Стабильные монеты (USDT, USDC, BUSD) имеют минимальные колебания курса</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-400 mr-2">•</span>
            <span>Bitcoin и Ethereum могут иметь значительные комиссии за транзакцию</span>
          </li>
          <li className="flex items-start">
            <span className="text-purple-400 mr-2">•</span>
            <span>Polygon (MATIC) предлагает быстрые и дешевые транзакции</span>
          </li>
          <li className="flex items-start">
            <span className="text-yellow-400 mr-2">•</span>
            <span>Курсы обновляются каждую минуту</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

/**
 * Компактный калькулятор для встраивания
 */
interface PriceCalculatorCompactProps {
  currency: CryptoCurrency;
  amount: number;
  className?: string;
}

export function PriceCalculatorCompact({ 
  currency, 
  amount = 10, 
  className = '' 
}: PriceCalculatorCompactProps) {
  const { getRateFor } = useCryptoRates();
  const rate = getRateFor(currency);
  
  const cryptoAmount = rate ? amount / rate.priceEUR : 0;
  
  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      <span className="text-gray-300">≈</span>
      <div className="flex items-center">
        <span className="text-lg mr-1" style={{ color: getCryptoColor(currency) }}>
          {getCryptoIcon(currency)}
        </span>
        <span className="font-bold text-blue-400">
          {formatCryptoAmount(cryptoAmount.toString(), currency)}
        </span>
      </div>
      {rate && (
        <span className="text-xs text-gray-400">
          (€{rate.priceEUR.toFixed(3)})
        </span>
      )}
    </div>
  );
}
