// 👛 Crypto Wallet Component - CRYPTO_BILLING_MODULE

'use client';

import { useState, useEffect } from 'react';
import { CryptoPayment, CryptoCurrency } from '../types/crypto-billing.types';
import { 
  formatWalletAddress, 
  formatCryptoAmount, 
  copyToClipboard,
  getCryptoIcon,
  getCryptoColor 
} from '../utils/formatters';

interface CryptoWalletProps {
  payment: CryptoPayment;
  showQRCode?: boolean;
  showInstructions?: boolean;
  className?: string;
}

export default function CryptoWallet({
  payment,
  showQRCode = true,
  showInstructions = true,
  className = ''
}: CryptoWalletProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [qrCodeUrl, setQRCodeUrl] = useState<string | null>(null);

  // Генерируем QR-код URL
  useEffect(() => {
    if (showQRCode) {
      generateQRCodeUrl();
    }
  }, [payment, showQRCode]);

  /**
   * Генерация URL для QR-кода через внешний сервис
   */
  const generateQRCodeUrl = () => {
    const qrData = encodeURIComponent(getPaymentURI(payment));
    const size = '256x256';
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}&data=${qrData}`;
    setQRCodeUrl(qrUrl);
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
   * Открытие кошелька (если поддерживается)
   */
  const openWallet = () => {
    const uri = getPaymentURI(payment);
    
    // Пытаемся открыть URI в приложении кошелька
    if (typeof window !== 'undefined') {
      window.location.href = uri;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">
          💰 Адрес для оплаты
        </h3>
        <p className="text-gray-300">
          Отправьте точную сумму на указанный адрес
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* QR Code Section */}
        {showQRCode && (
          <div className="text-center">
            <div className="glass-card p-6">
              <h4 className="font-semibold text-white mb-4">
                📱 Отсканируйте QR-код
              </h4>
              
              {qrCodeUrl ? (
                <div className="inline-block p-4 bg-white rounded-lg mb-4">
                  <img 
                    src={qrCodeUrl} 
                    alt="Payment QR Code"
                    className="w-48 h-48 mx-auto"
                    onError={() => setQRCodeUrl(null)}
                  />
                </div>
              ) : (
                <div className="w-48 h-48 mx-auto mb-4 bg-white rounded-lg flex flex-col items-center justify-center">
                  <div className="text-6xl mb-2" style={{ color: getCryptoColor(payment.cryptoCurrency) }}>
                    {getCryptoIcon(payment.cryptoCurrency)}
                  </div>
                  <div className="text-black font-bold">{payment.cryptoCurrency}</div>
                  <div className="text-black text-sm">Платеж</div>
                </div>
              )}
              
              <button
                onClick={openWallet}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                📱 Открыть в кошельке
              </button>
              
              <p className="text-xs text-gray-400 mt-3">
                Используйте любой криптокошелек с поддержкой QR-кодов
              </p>
            </div>
          </div>
        )}

        {/* Payment Details */}
        <div className="space-y-4">
          {/* Amount */}
          <div className="glass-card p-4">
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Точная сумма к оплате:
            </label>
            <div className="flex items-center justify-between bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-4 rounded-lg border border-blue-500/30">
              <div className="flex items-center">
                <div className="text-3xl mr-3" style={{ color: getCryptoColor(payment.cryptoCurrency) }}>
                  {getCryptoIcon(payment.cryptoCurrency)}
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-400">
                    {formatCryptoAmount(payment.cryptoAmount, payment.cryptoCurrency)}
                  </div>
                  <div className="text-sm text-gray-300">
                    ≈ €{payment.priceEUR} по курсу €{payment.exchangeRate.toFixed(4)}
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => handleCopy(payment.cryptoAmount, 'amount')}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                title="Копировать сумму"
              >
                {copied === 'amount' ? '✅' : '📋'}
              </button>
            </div>
          </div>

          {/* Address */}
          <div className="glass-card p-4">
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Адрес кошелька ({payment.cryptoCurrency}):
            </label>
            
            {/* Full address display */}
            <div className="bg-white/5 p-3 rounded-lg mb-3">
              <div className="font-mono text-sm text-white break-all">
                {payment.paymentAddress}
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex space-x-2">
              <button
                onClick={() => handleCopy(payment.paymentAddress, 'address')}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                {copied === 'address' ? '✅ Скопировано' : '📋 Копировать адрес'}
              </button>
              
              <button
                onClick={() => {
                  const explorerUrl = getExplorerUrl(payment.paymentAddress, payment.cryptoCurrency);
                  window.open(explorerUrl, '_blank');
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                title="Посмотреть в блокчейн эксплорере"
              >
                🔗
              </button>
            </div>
          </div>

          {/* Network Info */}
          <div className="glass-card p-4">
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Информация о сети:
            </label>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Блокчейн:</span>
                <span className="text-white font-medium capitalize">
                  {payment.network}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Требуется подтверждений:</span>
                <span className="text-white font-medium">
                  {payment.requiredConfirmations}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Текущие подтверждения:</span>
                <span className="text-blue-400 font-medium">
                  {payment.confirmations} / {payment.requiredConfirmations}
                </span>
              </div>
              
              {payment.confirmations > 0 && (
                <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((payment.confirmations / payment.requiredConfirmations) * 100, 100)}%`
                    }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      {showInstructions && (
        <div className="glass-card p-6">
          <h4 className="font-semibold text-white mb-4">
            📋 Пошаговая инструкция:
          </h4>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">
                1
              </div>
              <div>
                <div className="font-medium text-white mb-1">Скопируйте адрес кошелька</div>
                <div className="text-sm text-gray-300">
                  Нажмите "Копировать адрес" выше или отсканируйте QR-код
                </div>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">
                2
              </div>
              <div>
                <div className="font-medium text-white mb-1">Откройте ваш криптокошелек</div>
                <div className="text-sm text-gray-300">
                  Используйте любое приложение-кошелек с поддержкой {payment.cryptoCurrency}
                </div>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">
                3
              </div>
              <div>
                <div className="font-medium text-white mb-1">Отправьте точную сумму</div>
                <div className="text-sm text-gray-300">
                  <strong>{formatCryptoAmount(payment.cryptoAmount, payment.cryptoCurrency)}</strong> 
                  {' '}на указанный адрес. Не изменяйте сумму!
                </div>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">
                4
              </div>
              <div>
                <div className="font-medium text-white mb-1">Дождитесь подтверждения</div>
                <div className="text-sm text-gray-300">
                  После {payment.requiredConfirmations} подтверждений в блокчейне ваш сервис будет активирован
                </div>
              </div>
            </div>
          </div>

          {/* Warnings */}
          <div className="mt-6 space-y-3">
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
              <div className="flex items-start">
                <span className="text-red-400 text-xl mr-3">⚠️</span>
                <div>
                  <div className="font-medium text-red-300 mb-1">Важно:</div>
                  <div className="text-sm text-red-200">
                    Отправляйте только <strong>{payment.cryptoCurrency}</strong> на этот адрес. 
                    Отправка других криптовалют приведет к потере средств!
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
              <div className="flex items-start">
                <span className="text-yellow-400 text-xl mr-3">💡</span>
                <div>
                  <div className="font-medium text-yellow-300 mb-1">Совет:</div>
                  <div className="text-sm text-yellow-200">
                    Проверьте комиссию за транзакцию в вашем кошельке. 
                    Для экономии используйте стабильные монеты на быстрых сетях.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Компактное отображение кошелька
 */
interface CryptoWalletCompactProps {
  payment: CryptoPayment;
  className?: string;
}

export function CryptoWalletCompact({ payment, className = '' }: CryptoWalletCompactProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(payment.paymentAddress);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`glass-card p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="text-2xl mr-3" style={{ color: getCryptoColor(payment.cryptoCurrency) }}>
            {getCryptoIcon(payment.cryptoCurrency)}
          </div>
          <div>
            <div className="font-bold text-blue-400">
              {formatCryptoAmount(payment.cryptoAmount, payment.cryptoCurrency)}
            </div>
            <div className="text-sm text-gray-300">≈ €{payment.priceEUR}</div>
          </div>
        </div>
        
        <button
          onClick={handleCopy}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
        >
          {copied ? '✅' : '📋'}
        </button>
      </div>
      
      <div className="text-xs text-gray-400 font-mono break-all">
        {formatWalletAddress(payment.paymentAddress, 12, 12)}
      </div>
    </div>
  );
}

/**
 * Утилитарные функции
 */

// Получение URI для открытия в кошельке
function getPaymentURI(payment: CryptoPayment): string {
  const { cryptoCurrency, paymentAddress, cryptoAmount } = payment;
  
  switch (cryptoCurrency) {
    case 'BTC':
      return `bitcoin:${paymentAddress}?amount=${cryptoAmount}`;
    
    case 'ETH':
      return `ethereum:${paymentAddress}?value=${parseFloat(cryptoAmount) * 1e18}`;
    
    case 'USDT':
    case 'USDC':
      // ERC-20 tokens
      return `ethereum:${paymentAddress}?value=${cryptoAmount}`;
    
    case 'BUSD':
      // BSC token
      return `https://link.trustwallet.com/send?coin=20000714&address=${paymentAddress}&amount=${cryptoAmount}`;
    
    case 'MATIC':
      return `ethereum:${paymentAddress}?value=${parseFloat(cryptoAmount) * 1e18}&chainId=137`;
    
    default:
      return paymentAddress;
  }
}

// Получение URL блокчейн эксплорера
function getExplorerUrl(address: string, currency: CryptoCurrency): string {
  const baseUrls = {
    BTC: 'https://blockchair.com/bitcoin/address/',
    ETH: 'https://etherscan.io/address/',
    USDT: 'https://etherscan.io/address/',
    USDC: 'https://etherscan.io/address/',
    BUSD: 'https://bscscan.com/address/',
    MATIC: 'https://polygonscan.com/address/'
  };
  
  return `${baseUrls[currency] || baseUrls.ETH}${address}`;
}
