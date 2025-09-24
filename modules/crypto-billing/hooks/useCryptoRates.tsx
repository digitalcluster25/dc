// 💱 Crypto Rates Hook - CRYPTO_BILLING_MODULE

'use client';

import { useState, useEffect, useCallback } from 'react';
import { CryptoRate, CryptoCurrency } from '../types/crypto-billing.types';
import { CURRENCY_PRIORITY, INTERVALS } from '../utils/constants';
import { isStablecoin } from '../utils/formatters';

export interface UseCryptoRatesResult {
  // Состояние
  rates: CryptoRate[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  
  // Методы
  getRateFor: (currency: CryptoCurrency) => CryptoRate | null;
  refreshRates: () => Promise<void>;
  getRecommendedCurrency: () => CryptoCurrency;
  
  // Утилиты
  clearError: () => void;
}

/**
 * Hook для управления курсами криптовалют
 */
export function useCryptoRates(): UseCryptoRatesResult {
  const [rates, setRates] = useState<CryptoRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Загружаем курсы при монтировании
  useEffect(() => {
    loadRates();
  }, []);

  // Автообновление курсов каждую минуту
  useEffect(() => {
    const interval = setInterval(() => {
      loadRates(true); // silent update
    }, INTERVALS.RATE_UPDATE);

    return () => clearInterval(interval);
  }, []);

  /**
   * Загрузка курсов из API
   */
  const loadRates = async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/crypto/rates');
      const data = await response.json();

      if (data.success) {
        setRates(data.rates);
        setLastUpdated(new Date(data.lastUpdated));
      } else {
        throw new Error('Не удалось загрузить курсы валют');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки курсов';
      setError(errorMessage);
      console.error('Crypto rates loading error:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  /**
   * Получение курса конкретной валюты
   */
  const getRateFor = useCallback((currency: CryptoCurrency): CryptoRate | null => {
    return rates.find(rate => rate.currency === currency) || null;
  }, [rates]);

  /**
   * Обновление курсов вручную
   */
  const refreshRates = useCallback(async (): Promise<void> => {
    await loadRates();
  }, []);

  /**
   * Получение рекомендуемой валюты для оплаты
   */
  const getRecommendedCurrency = useCallback((): CryptoCurrency => {
    // Ищем самую стабильную валюту среди stablecoins
    const stableRates = rates.filter(rate => isStablecoin(rate.currency));
    
    if (stableRates.length > 0) {
      // Находим валюту с минимальными колебаниями за 24ч
      const mostStable = stableRates.reduce((prev, current) => 
        Math.abs(current.change24h) < Math.abs(prev.change24h) ? current : prev
      );
      
      return mostStable.currency;
    }

    // Если нет данных о stablecoins, возвращаем USDT по умолчанию
    return 'USDT';
  }, [rates]);

  /**
   * Очистка ошибки
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    rates,
    loading,
    error,
    lastUpdated,
    getRateFor,
    refreshRates,
    getRecommendedCurrency,
    clearError
  };
}

/**
 * Hook для конкретной валюты
 */
export function useCryptoRate(currency: CryptoCurrency) {
  const { rates, loading, error, getRateFor, refreshRates } = useCryptoRates();
  
  const rate = getRateFor(currency);
  
  return {
    rate,
    loading,
    error,
    refresh: refreshRates,
    isAvailable: !!rate
  };
}

/**
 * Hook для отслеживания изменений курса
 */
export function useRateMonitor(currency: CryptoCurrency, threshold: number = 5) {
  const [alerts, setAlerts] = useState<Array<{ timestamp: Date; change: number; price: number }>>([]);
  const { rate } = useCryptoRate(currency);
  const [previousPrice, setPreviousPrice] = useState<number | null>(null);

  useEffect(() => {
    if (!rate || previousPrice === null) {
      if (rate) setPreviousPrice(rate.priceEUR);
      return;
    }

    const changePercent = ((rate.priceEUR - previousPrice) / previousPrice) * 100;
    
    // Если изменение больше порога, создаем алерт
    if (Math.abs(changePercent) >= threshold) {
      setAlerts(prev => [...prev, {
        timestamp: new Date(),
        change: changePercent,
        price: rate.priceEUR
      }].slice(-10)); // Храним последние 10 алертов
    }

    setPreviousPrice(rate.priceEUR);
  }, [rate, previousPrice, threshold]);

  return {
    currentRate: rate,
    alerts,
    clearAlerts: () => setAlerts([])
  };
}

/**
 * Hook для сравнения валют
 */
export function useCurrencyComparison(currencies: CryptoCurrency[]) {
  const { rates } = useCryptoRates();
  
  const comparison = currencies.map(currency => {
    const rate = rates.find(r => r.currency === currency);
    
    return {
      currency,
      rate,
      isStablecoin: isStablecoin(currency),
      priceForService: rate ? (10 / rate.priceEUR).toFixed(rate.currency === 'BTC' ? 8 : 4) : '0',
      change24h: rate?.change24h || 0,
      isRecommended: isStablecoin(currency) && Math.abs(rate?.change24h || 0) < 1
    };
  }).sort((a, b) => {
    // Сортируем по приоритету: рекомендуемые, стабильные, остальные
    if (a.isRecommended && !b.isRecommended) return -1;
    if (!a.isRecommended && b.isRecommended) return 1;
    if (a.isStablecoin && !b.isStablecoin) return -1;
    if (!a.isStablecoin && b.isStablecoin) return 1;
    return 0;
  });

  return {
    comparison,
    bestOption: comparison.find(c => c.isRecommended) || comparison[0],
    stablecoins: comparison.filter(c => c.isStablecoin),
    volatileCoins: comparison.filter(c => !c.isStablecoin)
  };
}

/**
 * Hook для истории курсов (простая версия)
 */
export function useRateHistory(currency: CryptoCurrency, days: number = 7) {
  const [history, setHistory] = useState<Array<{ date: Date; price: number }>>([]);
  const [loading, setLoading] = useState(false);
  const { rate } = useCryptoRate(currency);

  useEffect(() => {
    if (!rate) return;

    // Генерируем mock историю на основе текущей цены
    const generateMockHistory = () => {
      const currentPrice = rate.priceEUR;
      const data = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        // Генерируем случайные изменения цены ±5%
        const variation = 1 + (Math.random() - 0.5) * 0.1;
        const price = currentPrice * variation;
        
        data.push({ date, price });
      }
      
      // Последняя точка - текущая цена
      data[data.length - 1].price = currentPrice;
      
      return data;
    };

    setLoading(true);
    // Симулируем загрузку данных
    setTimeout(() => {
      setHistory(generateMockHistory());
      setLoading(false);
    }, 500);

  }, [currency, days, rate]);

  const trend = history.length > 1 
    ? history[history.length - 1].price > history[0].price ? 'up' : 'down'
    : 'stable';

  const changePercent = history.length > 1
    ? ((history[history.length - 1].price - history[0].price) / history[0].price) * 100
    : 0;

  return {
    history,
    loading,
    trend,
    changePercent,
    minPrice: Math.min(...history.map(h => h.price)),
    maxPrice: Math.max(...history.map(h => h.price))
  };
}

/**
 * Hook для конвертации валют
 */
export function useCurrencyConverter() {
  const { rates } = useCryptoRates();

  const convert = useCallback((
    amount: number,
    fromCurrency: CryptoCurrency,
    toCurrency: CryptoCurrency
  ): number => {
    const fromRate = rates.find(r => r.currency === fromCurrency);
    const toRate = rates.find(r => r.currency === toCurrency);

    if (!fromRate || !toRate) return 0;

    // amount in fromCurrency -> EUR -> toCurrency
    const eurValue = amount * fromRate.priceEUR;
    const convertedAmount = eurValue / toRate.priceEUR;

    return convertedAmount;
  }, [rates]);

  const convertToFiat = useCallback((
    amount: number,
    currency: CryptoCurrency,
    fiatCurrency: 'EUR' | 'USD' = 'EUR'
  ): number => {
    const rate = rates.find(r => r.currency === currency);
    if (!rate) return 0;

    return amount * (fiatCurrency === 'EUR' ? rate.priceEUR : rate.priceUSD);
  }, [rates]);

  const convertFromFiat = useCallback((
    amount: number,
    currency: CryptoCurrency,
    fiatCurrency: 'EUR' | 'USD' = 'EUR'
  ): number => {
    const rate = rates.find(r => r.currency === currency);
    if (!rate) return 0;

    const fiatPrice = fiatCurrency === 'EUR' ? rate.priceEUR : rate.priceUSD;
    return amount / fiatPrice;
  }, [rates]);

  return {
    convert,
    convertToFiat,
    convertFromFiat,
    isReady: rates.length > 0
  };
}

/**
 * Hook для статистики курсов
 */
export function useRateStatistics() {
  const { rates } = useCryptoRates();

  const statistics = {
    totalCurrencies: rates.length,
    stablecoinsCount: rates.filter(r => isStablecoin(r.currency)).length,
    
    // Курсы с ростом/падением
    risingCount: rates.filter(r => r.change24h > 0).length,
    fallingCount: rates.filter(r => r.change24h < 0).length,
    stableCount: rates.filter(r => r.change24h === 0).length,
    
    // Экстремальные изменения
    biggestGainer: rates.reduce((max, rate) => 
      rate.change24h > (max?.change24h || -Infinity) ? rate : max, null as CryptoRate | null
    ),
    biggestLoser: rates.reduce((min, rate) => 
      rate.change24h < (min?.change24h || Infinity) ? rate : min, null as CryptoRate | null
    ),
    
    // Средние значения
    averageChange: rates.length > 0 
      ? rates.reduce((sum, rate) => sum + rate.change24h, 0) / rates.length 
      : 0,
    
    // Рекомендации
    mostStable: rates
      .filter(r => isStablecoin(r.currency))
      .reduce((min, rate) => 
        Math.abs(rate.change24h) < Math.abs(min?.change24h || Infinity) ? rate : min, 
        null as CryptoRate | null
      ),
    
    lastUpdate: rates.length > 0 ? rates[0].lastUpdated : null
  };

  return statistics;
}

/**
 * Context Provider для курсов (если нужен глобальный стейт)
 */
import { createContext, useContext, ReactNode } from 'react';

interface CryptoRatesContextType {
  rates: CryptoRate[];
  loading: boolean;
  error: string | null;
  refreshRates: () => Promise<void>;
  getRateFor: (currency: CryptoCurrency) => CryptoRate | null;
}

const CryptoRatesContext = createContext<CryptoRatesContextType | null>(null);

export function CryptoRatesProvider({ children }: { children: ReactNode }) {
  const cryptoRates = useCryptoRates();

  return (
    <CryptoRatesContext.Provider value={cryptoRates}>
      {children}
    </CryptoRatesContext.Provider>
  );
}

export function useCryptoRatesContext(): CryptoRatesContextType {
  const context = useContext(CryptoRatesContext);
  if (!context) {
    throw new Error('useCryptoRatesContext must be used within CryptoRatesProvider');
  }
  return context;
}
