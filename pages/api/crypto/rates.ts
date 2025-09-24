// 💰 Crypto Rates API - CRYPTO_BILLING_MODULE  
// pages/api/crypto/rates.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { GetRatesResponse, CryptoRate } from '../../../modules/crypto-billing/types/crypto-billing.types';
import { getAllCryptoRates, getCryptoRate, getStablecoinRates } from '../../../modules/crypto-billing/lib/crypto-rates';
import { CURRENCY_PRIORITY } from '../../../modules/crypto-billing/utils/constants';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetRatesResponse>
) {
  // Только GET запросы
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      rates: [],
      lastUpdated: new Date()
    });
  }

  try {
    const { currency, stablecoins } = req.query;

    let rates: CryptoRate[] = [];

    if (currency && typeof currency === 'string') {
      // Получаем курс конкретной валюты
      const singleRate = await getCryptoRate(currency.toUpperCase() as any);
      
      if (singleRate) {
        rates = [singleRate];
      } else {
        return res.status(404).json({
          success: false,
          rates: [],
          lastUpdated: new Date()
        });
      }
    } else if (stablecoins === 'true') {
      // Получаем только стабильные монеты
      rates = await getStablecoinRates();
    } else {
      // Получаем все поддерживаемые валюты
      rates = await getAllCryptoRates();
    }

    // Сортируем по приоритету
    rates.sort((a, b) => {
      const aIndex = CURRENCY_PRIORITY.indexOf(a.currency);
      const bIndex = CURRENCY_PRIORITY.indexOf(b.currency);
      return aIndex - bIndex;
    });

    return res.status(200).json({
      success: true,
      rates,
      lastUpdated: new Date()
    });

  } catch (error) {
    console.error('Get rates error:', error);
    
    // Возвращаем fallback курсы при ошибке
    const fallbackRates: CryptoRate[] = [
      { currency: 'USDT', priceUSD: 1.0, priceEUR: 0.92, change24h: 0.1, lastUpdated: new Date() },
      { currency: 'USDC', priceUSD: 1.0, priceEUR: 0.92, change24h: -0.1, lastUpdated: new Date() },
      { currency: 'BUSD', priceUSD: 1.0, priceEUR: 0.92, change24h: 0.05, lastUpdated: new Date() },
      { currency: 'BTC', priceUSD: 43000, priceEUR: 39560, change24h: 2.5, lastUpdated: new Date() },
      { currency: 'ETH', priceUSD: 2600, priceEUR: 2392, change24h: 1.8, lastUpdated: new Date() },
      { currency: 'MATIC', priceUSD: 0.85, priceEUR: 0.78, change24h: -1.2, lastUpdated: new Date() }
    ];

    return res.status(200).json({
      success: true,
      rates: fallbackRates,
      lastUpdated: new Date()
    });
  }
}

/**
 * Endpoint для получения рекомендуемой валюты
 */
export async function getRecommendedCurrencyAPI(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const stableRates = await getStablecoinRates();
    
    // Находим наиболее стабильную валюту (минимальные колебания за 24ч)
    const mostStable = stableRates.reduce((prev, current) => 
      Math.abs(current.change24h) < Math.abs(prev.change24h) ? current : prev
    );

    return res.status(200).json({
      success: true,
      recommendedCurrency: mostStable.currency,
      reason: `Наименьшие колебания (${mostStable.change24h.toFixed(2)}%)`,
      rate: mostStable
    });

  } catch (error) {
    console.error('Get recommended currency error:', error);
    
    return res.status(200).json({
      success: true,
      recommendedCurrency: 'USDT',
      reason: 'Default recommendation',
      rate: { currency: 'USDT', priceUSD: 1.0, priceEUR: 0.92, change24h: 0, lastUpdated: new Date() }
    });
  }
}
