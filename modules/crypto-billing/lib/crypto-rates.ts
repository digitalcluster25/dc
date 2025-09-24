// 💰 Crypto Rates Library for CRYPTO_BILLING_MODULE

import { CryptoCurrency, CryptoRate } from '../types/crypto-billing.types';
import { CURRENCY_PRIORITY, API_LIMITS } from '../utils/constants';

/**
 * Клиент для работы с CoinGecko API
 */
class CoinGeckoClient {
  private baseUrl = 'https://api.coingecko.com/api/v3';
  private apiKey?: string;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout = 60 * 1000; // 1 минута

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  /**
   * Выполнение запроса к API с кэшированием
   */
  private async request(endpoint: string): Promise<any> {
    const cacheKey = endpoint;
    const cached = this.cache.get(cacheKey);
    
    // Проверяем кэш
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const url = `${this.baseUrl}${endpoint}`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (this.apiKey) {
        headers['x-cg-demo-api-key'] = this.apiKey;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_LIMITS.EXTERNAL_API_TIMEOUT);

      const response = await fetch(url, {
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Кэшируем результат
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      
      return data;
    } catch (error) {
      console.error('CoinGecko API request failed:', error);
      
      // Возвращаем кэшированные данные если есть
      if (cached) {
        console.warn('Using cached data due to API error');
        return cached.data;
      }
      
      throw error;
    }
  }

  /**
   * Получение курсов криптовалют
   */
  async getCryptoPrices(currencies: CryptoCurrency[]): Promise<CryptoRate[]> {
    // Маппинг наших символов на ID CoinGecko
    const coinGeckoIds = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'USDT': 'tether',
      'USDC': 'usd-coin',
      'BUSD': 'binance-usd',
      'MATIC': 'matic-network'
    };

    const ids = currencies.map(currency => coinGeckoIds[currency]).join(',');
    const endpoint = `/simple/price?ids=${ids}&vs_currencies=usd,eur&include_24hr_change=true&include_last_updated_at=true`;

    try {
      const data = await this.request(endpoint);
      const rates: CryptoRate[] = [];

      for (const currency of currencies) {
        const coinId = coinGeckoIds[currency];
        const priceData = data[coinId];

        if (priceData) {
          rates.push({
            currency,
            priceUSD: priceData.usd || 0,
            priceEUR: priceData.eur || 0,
            change24h: priceData.usd_24h_change || 0,
            lastUpdated: new Date(priceData.last_updated_at * 1000 || Date.now())
          });
        } else {
          // Fallback цены для стабильных монет
          if (['USDT', 'USDC', 'BUSD'].includes(currency)) {
            rates.push({
              currency,
              priceUSD: 1.0,
              priceEUR: 0.92, // Примерный курс EUR/USD
              change24h: 0,
              lastUpdated: new Date()
            });
          }
        }
      }

      return rates;
    } catch (error) {
      console.error('Failed to fetch crypto prices:', error);
      
      // Возвращаем fallback цены
      return this.getFallbackRates(currencies);
    }
  }

  /**
   * Fallback курсы при недоступности API
   */
  private getFallbackRates(currencies: CryptoCurrency[]): CryptoRate[] {
    const fallbackPrices = {
      'BTC': { usd: 43000, eur: 39560 },
      'ETH': { usd: 2600, eur: 2392 },
      'USDT': { usd: 1.0, eur: 0.92 },
      'USDC': { usd: 1.0, eur: 0.92 },
      'BUSD': { usd: 1.0, eur: 0.92 },
      'MATIC': { usd: 0.85, eur: 0.78 }
    };

    return currencies.map(currency => ({
      currency,
      priceUSD: fallbackPrices[currency]?.usd || 1,
      priceEUR: fallbackPrices[currency]?.eur || 0.92,
      change24h: 0,
      lastUpdated: new Date()
    }));
  }

  /**
   * Получение детальной информации о криптовалюте
   */
  async getCryptoDetails(currency: CryptoCurrency) {
    const coinGeckoIds = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum', 
      'USDT': 'tether',
      'USDC': 'usd-coin',
      'BUSD': 'binance-usd',
      'MATIC': 'matic-network'
    };

    const coinId = coinGeckoIds[currency];
    if (!coinId) return null;

    try {
      const data = await this.request(`/coins/${coinId}`);
      
      return {
        id: data.id,
        symbol: data.symbol.toUpperCase(),
        name: data.name,
        description: data.description?.en?.slice(0, 200) || '',
        image: data.image?.large || '',
        marketCap: data.market_data?.market_cap?.usd || 0,
        totalVolume: data.market_data?.total_volume?.usd || 0,
        circulatingSupply: data.market_data?.circulating_supply || 0,
        totalSupply: data.market_data?.total_supply || 0,
        allTimeHigh: data.market_data?.ath?.usd || 0,
        allTimeLow: data.market_data?.atl?.usd || 0,
        priceChange7d: data.market_data?.price_change_percentage_7d || 0,
        priceChange30d: data.market_data?.price_change_percentage_30d || 0,
        lastUpdated: new Date(data.last_updated)
      };
    } catch (error) {
      console.error(`Failed to fetch details for ${currency}:`, error);
      return null;
    }
  }
}

/**
 * Глобальный инстанс клиента
 */
const coinGeckoClient = new CoinGeckoClient(process.env.COINGECKO_API_KEY);

/**
 * Получение курсов всех поддерживаемых криптовалют
 */
export async function getAllCryptoRates(): Promise<CryptoRate[]> {
  return await coinGeckoClient.getCryptoPrices(CURRENCY_PRIORITY);
}

/**
 * Получение курса конкретной криптовалюты
 */
export async function getCryptoRate(currency: CryptoCurrency): Promise<CryptoRate | null> {
  const rates = await coinGeckoClient.getCryptoPrices([currency]);
  return rates.find(rate => rate.currency === currency) || null;
}

/**
 * Получение курсов для stablecoins
 */
export async function getStablecoinRates(): Promise<CryptoRate[]> {
  return await coinGeckoClient.getCryptoPrices(['USDT', 'USDC', 'BUSD']);
}

/**
 * Получение детальной информации о криптовалюте
 */
export async function getCryptoDetails(currency: CryptoCurrency) {
  return await coinGeckoClient.getCryptoDetails(currency);
}

/**
 * Расчет стоимости в криптовалюте
 */
export function calculateCryptoPrice(eurAmount: number, cryptoRate: CryptoRate): string {
  if (!cryptoRate || cryptoRate.priceEUR <= 0) return '0';
  
  const cryptoAmount = eurAmount / cryptoRate.priceEUR;
  
  // Определяем количество знаков после запятой в зависимости от валюты
  const decimals = getCryptoDecimals(cryptoRate.currency);
  
  return cryptoAmount.toFixed(decimals);
}

/**
 * Определение количества знаков после запятой для криптовалюты
 */
function getCryptoDecimals(currency: CryptoCurrency): number {
  switch (currency) {
    case 'BTC': return 8;
    case 'ETH': return 6; 
    case 'USDT':
    case 'USDC':
    case 'BUSD': return 2;
    case 'MATIC': return 4;
    default: return 6;
  }
}

/**
 * Проверка стабильности курса (для stablecoins)
 */
export function isCurrencyStable(rate: CryptoRate): boolean {
  const stablecoins = ['USDT', 'USDC', 'BUSD'];
  
  if (!stablecoins.includes(rate.currency)) return false;
  
  // Stablecoin считается стабильным если цена близка к $1 и изменение < 2%
  return Math.abs(rate.priceUSD - 1.0) < 0.05 && Math.abs(rate.change24h) < 2.0;
}

/**
 * Получение рекомендуемой валюты для оплаты
 */
export async function getRecommendedCurrency(): Promise<CryptoCurrency> {
  try {
    const stableRates = await getStablecoinRates();
    
    // Ищем самый стабильный stablecoin
    for (const rate of stableRates) {
      if (isCurrencyStable(rate)) {
        return rate.currency;
      }
    }
    
    // Если все нестабильные, возвращаем USDT по умолчанию
    return 'USDT';
  } catch (error) {
    console.error('Failed to get recommended currency:', error);
    return 'USDT';
  }
}

/**
 * Конвертация между валютами
 */
export function convertCurrency(
  amount: number, 
  fromRate: CryptoRate, 
  toRate: CryptoRate, 
  targetCurrency: 'USD' | 'EUR' = 'EUR'
): number {
  if (!fromRate || !toRate) return 0;
  
  const fromPrice = targetCurrency === 'USD' ? fromRate.priceUSD : fromRate.priceEUR;
  const toPrice = targetCurrency === 'USD' ? toRate.priceUSD : toRate.priceEUR;
  
  if (fromPrice <= 0 || toPrice <= 0) return 0;
  
  // amount in fromCurrency -> fiat -> toCurrency
  const fiatAmount = amount * fromPrice;
  const convertedAmount = fiatAmount / toPrice;
  
  return convertedAmount;
}

/**
 * Мониторинг изменения курсов
 */
export class RateMonitor {
  private subscribers: Map<CryptoCurrency, ((rate: CryptoRate) => void)[]> = new Map();
  private intervals: Map<CryptoCurrency, NodeJS.Timeout> = new Map();
  
  /**
   * Подписка на изменения курса валюты
   */
  subscribe(currency: CryptoCurrency, callback: (rate: CryptoRate) => void, intervalMs: number = 60000) {
    if (!this.subscribers.has(currency)) {
      this.subscribers.set(currency, []);
    }
    
    this.subscribers.get(currency)!.push(callback);
    
    // Запускаем мониторинг если еще не запущен
    if (!this.intervals.has(currency)) {
      const interval = setInterval(async () => {
        try {
          const rate = await getCryptoRate(currency);
          if (rate) {
            const callbacks = this.subscribers.get(currency) || [];
            callbacks.forEach(cb => cb(rate));
          }
        } catch (error) {
          console.error(`Rate monitoring error for ${currency}:`, error);
        }
      }, intervalMs);
      
      this.intervals.set(currency, interval);
    }
  }
  
  /**
   * Отписка от мониторинга
   */
  unsubscribe(currency: CryptoCurrency, callback: (rate: CryptoRate) => void) {
    const callbacks = this.subscribers.get(currency);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
      
      // Если нет подписчиков, останавливаем мониторинг
      if (callbacks.length === 0) {
        const interval = this.intervals.get(currency);
        if (interval) {
          clearInterval(interval);
          this.intervals.delete(currency);
        }
        this.subscribers.delete(currency);
      }
    }
  }
  
  /**
   * Очистка всех подписок
   */
  cleanup() {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
    this.subscribers.clear();
  }
}

/**
 * Глобальный монитор курсов
 */
export const rateMonitor = new RateMonitor();

/**
 * Получение исторических данных курса (упрощенная версия)
 */
export async function getHistoricalRates(currency: CryptoCurrency, days: number = 7): Promise<{ date: Date; price: number }[]> {
  // В MVP возвращаем заглушку, в будущем можно использовать CoinGecko API
  const now = new Date();
  const currentRate = await getCryptoRate(currency);
  const currentPrice = currentRate?.priceEUR || 1;
  
  return Array.from({ length: days }, (_, i) => ({
    date: new Date(now.getTime() - (days - 1 - i) * 24 * 60 * 60 * 1000),
    price: currentPrice * (0.95 + Math.random() * 0.1) // Случайное изменение ±5%
  }));
}

/**
 * Экспорт всех основных функций
 */
export {
  coinGeckoClient,
  CoinGeckoClient
};

/**
 * Инициализация модуля курсов
 */
export function initializeCryptoRates() {
  console.log('🚀 Crypto rates module initialized');
  
  // Предварительная загрузка курсов
  getAllCryptoRates().catch(error => {
    console.error('Failed to preload crypto rates:', error);
  });
}
