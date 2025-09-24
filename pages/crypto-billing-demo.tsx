// 🎮 Complete Demo Page - CRYPTO_BILLING_MODULE
// pages/crypto-billing-demo.tsx

'use client';

import { useState } from 'react';
import { 
  ServiceSelector, 
  CryptoCheckout, 
  PaymentStatus, 
  PriceCalculator,
  CryptoRatesProvider,
  useCryptoRates,
  usePaymentFlow
} from '../modules/crypto-billing';
import { ServiceType, CryptoPayment } from '../modules/crypto-billing/types/crypto-billing.types';

export default function CryptoBillingDemo() {
  return (
    <CryptoRatesProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black">
        <DemoContent />
      </div>
    </CryptoRatesProvider>
  );
}

function DemoContent() {
  const [currentStep, setCurrentStep] = useState<'intro' | 'services' | 'calculator' | 'checkout' | 'payment' | 'status'>('intro');
  const [selectedService, setSelectedService] = useState<ServiceType>('wordpress');
  const [currentPayment, setCurrentPayment] = useState<CryptoPayment | null>(null);

  const { rates, loading: ratesLoading } = useCryptoRates();

  return (
    <>
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-3xl">💎</div>
              <div>
                <h1 className="text-2xl font-bold text-white">Crypto Billing Demo</h1>
                <p className="text-gray-300 text-sm">SaaS хостинг с криптоплатежами</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-300">
                {rates.length > 0 ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Курсы обновлены</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    <span>Загрузка курсов...</span>
                  </div>
                )}
              </div>
              
              <nav className="hidden md:flex space-x-4">
                {[
                  { id: 'intro', label: '🏠 Главная' },
                  { id: 'services', label: '🛍️ Сервисы' },
                  { id: 'calculator', label: '🧮 Калькулятор' },
                  { id: 'checkout', label: '💳 Оплата' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentStep(item.id as any)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentStep === item.id 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {currentStep === 'intro' && (
          <IntroSection onGetStarted={() => setCurrentStep('services')} />
        )}

        {currentStep === 'services' && (
          <div className="space-y-8">
            <ServiceSelector
              selectedService={selectedService}
              onServiceSelect={(service) => {
                setSelectedService(service);
                setCurrentStep('calculator');
              }}
            />
            
            <div className="text-center">
              <button
                onClick={() => setCurrentStep('calculator')}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                disabled={!selectedService}
              >
                Продолжить с {selectedService} →
              </button>
            </div>
          </div>
        )}

        {currentStep === 'calculator' && (
          <div className="space-y-8">
            <PriceCalculator
              serviceType={selectedService}
              selectedCurrency="USDT"
              showComparison={true}
            />
            
            <div className="text-center space-x-4">
              <button
                onClick={() => setCurrentStep('services')}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              >
                ← Назад к сервисам
              </button>
              <button
                onClick={() => setCurrentStep('checkout')}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                Перейти к оплате →
              </button>
            </div>
          </div>
        )}

        {currentStep === 'checkout' && (
          <div className="space-y-8">
            <CryptoCheckout
              serviceType={selectedService}
              onPaymentCreated={(payment) => {
                setCurrentPayment(payment);
                setCurrentStep('status');
              }}
            />
            
            <div className="text-center">
              <button
                onClick={() => setCurrentStep('calculator')}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              >
                ← Назад к калькулятору
              </button>
            </div>
          </div>
        )}

        {currentStep === 'status' && currentPayment && (
          <div className="space-y-8">
            <PaymentStatus
              paymentId={currentPayment.id}
              onStatusChange={(status) => {
                if (status === 'completed') {
                  alert('🎉 Сервис успешно активирован!');
                }
              }}
            />
            
            <div className="text-center space-x-4">
              <button
                onClick={() => {
                  setCurrentPayment(null);
                  setCurrentStep('intro');
                }}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              >
                ← На главную
              </button>
              <button
                onClick={() => setCurrentStep('services')}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
              >
                🚀 Заказать еще сервис
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20 backdrop-blur-sm mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Crypto Billing</h3>
              <p className="text-gray-400 text-sm">
                Современная система криптоплатежей для SaaS хостинга
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-3">Поддерживаемые валюты</h4>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>💎 USDT, USDC, BUSD</li>
                <li>₿ Bitcoin (BTC)</li>
                <li>Ξ Ethereum (ETH)</li>
                <li>◈ Polygon (MATIC)</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-3">Сервисы</h4>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>📝 WordPress CMS</li>
                <li>⚡ Next.js Apps</li>
                <li>🔧 REST API</li>
                <li>🗃️ Databases</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-3">Преимущества</h4>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>🚀 Мгновенная активация</li>
                <li>🛡️ Безопасные платежи</li>
                <li>🌍 Глобальная доступность</li>
                <li>💰 Низкие комиссии</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-8 pt-6 text-center text-gray-400 text-sm">
            <p>© 2025 Crypto Billing Module. Демонстрация возможностей криптоплатежей.</p>
          </div>
        </div>
      </footer>
    </>
  );
}

// Компонент интро секции
function IntroSection({ onGetStarted }: { onGetStarted: () => void }) {
  const { rates } = useCryptoRates();
  
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold text-white">
            Crypto <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Billing</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            Современная система криптоплатежей для SaaS хостинга. 
            Принимайте платежи в Bitcoin, Ethereum и стабильных монетах.
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-6 text-4xl">
          <div className="animate-bounce delay-0">💎</div>
          <div className="animate-bounce delay-100">₿</div>
          <div className="animate-bounce delay-200">Ξ</div>
          <div className="animate-bounce delay-300">◈</div>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={onGetStarted}
            className="px-12 py-4 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all transform hover:scale-105 shadow-2xl"
          >
            🚀 Начать демо
          </button>
          
          <p className="text-gray-400 text-sm">
            Все сервисы по <span className="text-blue-400 font-bold">€10</span> • Активация за <span className="text-green-400 font-bold">2-5 минут</span>
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          {
            icon: '⚡',
            title: 'Мгновенные платежи',
            description: 'Криптоплатежи обрабатываются за минуты, не дни'
          },
          {
            icon: '🛡️',
            title: 'Полная безопасность',
            description: 'HD кошельки и необратимые транзакции'
          },
          {
            icon: '🌍',
            title: 'Глобальная доступность',
            description: 'Работает в любой стране мира'
          },
          {
            icon: '💰',
            title: 'Низкие комиссии',
            description: 'Особенно при использовании стабильных монет'
          }
        ].map((feature, index) => (
          <div key={index} className="glass-card p-6 text-center space-y-4 hover:scale-105 transition-transform">
            <div className="text-4xl">{feature.icon}</div>
            <h3 className="text-xl font-bold text-white">{feature.title}</h3>
            <p className="text-gray-300">{feature.description}</p>
          </div>
        ))}
      </section>

      {/* Live Rates Preview */}
      {rates.length > 0 && (
        <section className="glass-card p-8">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            📈 Актуальные курсы криптовалют
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {rates.slice(0, 6).map(rate => (
              <div key={rate.currency} className="text-center space-y-2">
                <div className="text-2xl">
                  {rate.currency === 'BTC' ? '₿' :
                   rate.currency === 'ETH' ? 'Ξ' :
                   rate.currency === 'USDT' ? '₮' :
                   rate.currency === 'USDC' ? '$' :
                   rate.currency === 'BUSD' ? '$' :
                   rate.currency === 'MATIC' ? '◈' : '💎'}
                </div>
                <div className="font-bold text-white">{rate.currency}</div>
                <div className="text-blue-400 font-mono text-sm">
                  €{rate.priceEUR.toFixed(rate.currency === 'BTC' ? 0 : 4)}
                </div>
                <div className={`text-xs ${
                  rate.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {rate.change24h >= 0 ? '+' : ''}{rate.change24h.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-6">
            <p className="text-gray-400 text-sm">
              Курсы обновляются каждую минуту • Данные от CoinGecko
            </p>
          </div>
        </section>
      )}

      {/* Process Steps */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-white text-center">
          Как это работает?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            {
              step: '1',
              title: 'Выберите сервис',
              description: 'WordPress, Next.js, API или база данных',
              icon: '🛍️'
            },
            {
              step: '2', 
              title: 'Выберите валюту',
              description: 'Bitcoin, Ethereum или стабильные монеты',
              icon: '💎'
            },
            {
              step: '3',
              title: 'Совершите платеж',
              description: 'Отсканируйте QR-код или скопируйте адрес',
              icon: '📱'
            },
            {
              step: '4',
              title: 'Получите сервис',
              description: 'Автоматическая активация за 2-5 минут',
              icon: '🚀'
            }
          ].map((item, index) => (
            <div key={index} className="relative">
              {index < 3 && (
                <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-blue-500 to-transparent -z-10"></div>
              )}
              
              <div className="glass-card p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto text-white font-bold text-lg">
                  {item.step}
                </div>
                <div className="text-3xl">{item.icon}</div>
                <h3 className="text-lg font-bold text-white">{item.title}</h3>
                <p className="text-gray-300 text-sm">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
