// 👑 Admin Dashboard - CRYPTO_BILLING_MODULE
// modules/crypto-billing/components/AdminDashboard.tsx

'use client';

import { useState, useEffect } from 'react';
import { 
  CryptoPayment, 
  CryptoRate, 
  PaymentAnalytics,
  ServiceType,
  CryptoCurrency
} from '../types/crypto-billing.types';
import { 
  formatCryptoAmount, 
  formatFiatAmount, 
  formatPaymentStatus, 
  timeAgo,
  abbreviateNumber
} from '../utils/formatters';
import { getCryptoIcon } from '../utils/constants';
import { useCryptoRates } from '../hooks/useCryptoRates';

interface AdminDashboardProps {
  className?: string;
}

export default function AdminDashboard({ className = '' }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'analytics' | 'settings'>('overview');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('24h');
  
  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">👑 Crypto Billing Admin</h1>
            <p className="text-gray-300">Управление криптоплатежами и сервисами</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="24h">Последние 24ч</option>
              <option value="7d">Последние 7 дней</option>
              <option value="30d">Последние 30 дней</option>
              <option value="all">Все время</option>
            </select>
            
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
              🔄 Обновить
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 bg-white/5 p-1 rounded-lg">
          {[
            { id: 'overview', label: '📊 Обзор', icon: '📊' },
            { id: 'payments', label: '💳 Платежи', icon: '💳' },
            { id: 'analytics', label: '📈 Аналитика', icon: '📈' },
            { id: 'settings', label: '⚙️ Настройки', icon: '⚙️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-4 py-3 rounded-md font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
        {activeTab === 'overview' && <OverviewTab timeRange={timeRange} />}
        {activeTab === 'payments' && <PaymentsTab timeRange={timeRange} />}
        {activeTab === 'analytics' && <AnalyticsTab timeRange={timeRange} />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
}

/**
 * Вкладка обзора с ключевыми метриками
 */
function OverviewTab({ timeRange }: { timeRange: string }) {
  const { rates } = useCryptoRates();
  const [stats, setStats] = useState<any>(null);
  const [recentPayments, setRecentPayments] = useState<CryptoPayment[]>([]);

  // Загружаем статистику (в реальном проекте из API)
  useEffect(() => {
    // Mock статистика
    setStats({
      totalPayments: 1247,
      totalRevenue: 18456.50,
      activePayments: 23,
      successRate: 94.7,
      averagePaymentTime: 4.2,
      topCurrency: 'USDT',
      topService: 'wordpress',
      pendingPayments: 5,
      failedPayments: 8
    });

    // Mock последние платежи
    setRecentPayments([
      {
        id: 'pay_abc123',
        userId: 'user_123',
        serviceType: 'wordpress',
        cryptoCurrency: 'USDT',
        cryptoAmount: '10.85',
        priceEUR: 10,
        status: 'completed',
        createdAt: new Date(Date.now() - 1000 * 60 * 5),
        paymentAddress: '0x1234...5678'
      }
    ] as CryptoPayment[]);
  }, [timeRange]);

  if (!stats) {
    return <div className="text-center py-12 text-white">Загрузка статистики...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <MetricCard
          title="Всего платежей"
          value={abbreviateNumber(stats.totalPayments)}
          subtitle={`+12% за ${timeRange}`}
          icon="💳"
          color="blue"
        />
        
        <MetricCard
          title="Доход"
          value={formatFiatAmount(stats.totalRevenue)}
          subtitle="€8,234 в этом месяце"
          icon="💰"
          color="green"
        />
        
        <MetricCard
          title="Активные платежи"
          value={stats.activePayments.toString()}
          subtitle="В процессе обработки"
          icon="🔄"
          color="yellow"
        />
        
        <MetricCard
          title="Успешность"
          value={`${stats.successRate}%`}
          subtitle="Конверсия платежей"
          icon="✅"
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Payments */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Последние платежи</h3>
            <button className="text-blue-400 hover:text-blue-300 text-sm">
              Показать все →
            </button>
          </div>
          
          <div className="space-y-4">
            {recentPayments.map(payment => {
              const statusInfo = formatPaymentStatus(payment.status);
              return (
                <div key={payment.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {getCryptoIcon(payment.cryptoCurrency)}
                    </div>
                    <div>
                      <div className="text-white font-medium">
                        {formatCryptoAmount(payment.cryptoAmount, payment.cryptoCurrency)}
                      </div>
                      <div className="text-sm text-gray-300">
                        {payment.serviceType} • {timeAgo(payment.createdAt)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`font-medium ${statusInfo.color}`}>
                      {statusInfo.text}
                    </div>
                    <div className="text-sm text-gray-400">
                      #{payment.id.slice(-6)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Crypto Rates */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Курсы валют</h3>
            <div className="text-sm text-gray-300">
              Обновлено: {new Date().toLocaleTimeString()}
            </div>
          </div>
          
          <div className="space-y-3">
            {rates.slice(0, 6).map(rate => (
              <div key={rate.currency} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-xl">
                    {getCryptoIcon(rate.currency)}
                  </div>
                  <div>
                    <div className="text-white font-medium">{rate.currency}</div>
                    <div className="text-sm text-gray-300">
                      €{rate.priceEUR.toFixed(rate.currency === 'BTC' ? 0 : 4)}
                    </div>
                  </div>
                </div>
                
                <div className={`font-medium ${
                  rate.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {rate.change24h >= 0 ? '+' : ''}{rate.change24h.toFixed(2)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="glass-card p-6">
        <h3 className="text-xl font-bold text-white mb-6">Состояние системы</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SystemHealthCard
            title="API"
            status="healthy"
            value="99.9%"
            subtitle="Uptime"
          />
          
          <SystemHealthCard
            title="Blockchain"
            status="healthy"
            value="<1s"
            subtitle="Avg response"
          />
          
          <SystemHealthCard
            title="Wallets"
            status="healthy"
            value="1,247"
            subtitle="Generated"
          />
          
          <SystemHealthCard
            title="Rates"
            status="healthy"
            value="1m"
            subtitle="Last update"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Вкладка с детальным списком платежей
 */
function PaymentsTab({ timeRange }: { timeRange: string }) {
  const [payments, setPayments] = useState<CryptoPayment[]>([]);
  const [filters, setFilters] = useState({
    status: 'all',
    currency: 'all',
    service: 'all'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // В реальном проекте здесь будет загрузка из API
    const mockPayments: CryptoPayment[] = Array.from({ length: 20 }, (_, i) => ({
      id: `pay_${Math.random().toString(36).substring(2, 10)}`,
      userId: `user_${Math.random().toString(36).substring(2, 6)}`,
      serviceType: ['wordpress', 'nextjs', 'api', 'database'][Math.floor(Math.random() * 4)] as ServiceType,
      cryptoCurrency: ['USDT', 'USDC', 'BTC', 'ETH', 'MATIC'][Math.floor(Math.random() * 5)] as CryptoCurrency,
      cryptoAmount: (Math.random() * 100 + 10).toFixed(6),
      priceEUR: 10,
      priceUSD: 10.90,
      exchangeRate: 0.92,
      status: ['pending', 'confirming', 'confirmed', 'completed', 'expired', 'failed'][Math.floor(Math.random() * 6)] as any,
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      paymentAddress: `0x${Math.random().toString(16).substring(2, 42)}`,
      confirmations: Math.floor(Math.random() * 20)
    }));

    setTimeout(() => {
      setPayments(mockPayments);
      setLoading(false);
    }, 500);
  }, [timeRange]);

  const filteredPayments = payments.filter(payment => {
    if (filters.status !== 'all' && payment.status !== filters.status) return false;
    if (filters.currency !== 'all' && payment.cryptoCurrency !== filters.currency) return false;
    if (filters.service !== 'all' && payment.serviceType !== filters.service) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="glass-card p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="text-sm text-gray-300 mb-1 block">Статус:</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="all">Все</option>
              <option value="pending">Ожидание</option>
              <option value="confirming">Подтверждение</option>
              <option value="completed">Завершено</option>
              <option value="failed">Неуспешно</option>
            </select>
          </div>
          
          <div>
            <label className="text-sm text-gray-300 mb-1 block">Валюта:</label>
            <select
              value={filters.currency}
              onChange={(e) => setFilters(prev => ({ ...prev, currency: e.target.value }))}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="all">Все</option>
              <option value="USDT">USDT</option>
              <option value="USDC">USDC</option>
              <option value="BTC">BTC</option>
              <option value="ETH">ETH</option>
              <option value="MATIC">MATIC</option>
            </select>
          </div>
          
          <div>
            <label className="text-sm text-gray-300 mb-1 block">Сервис:</label>
            <select
              value={filters.service}
              onChange={(e) => setFilters(prev => ({ ...prev, service: e.target.value }))}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="all">Все</option>
              <option value="wordpress">WordPress</option>
              <option value="nextjs">Next.js</option>
              <option value="api">API</option>
              <option value="database">Database</option>
            </select>
          </div>
          
          <div className="ml-auto">
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-sm transition-colors">
              📊 Экспорт
            </button>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-white">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            Загрузка платежей...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left p-4 text-gray-300 font-medium">ID</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Пользователь</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Сервис</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Сумма</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Валюта</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Статус</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Создан</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map(payment => {
                  const statusInfo = formatPaymentStatus(payment.status);
                  return (
                    <tr key={payment.id} className="border-t border-white/10 hover:bg-white/5">
                      <td className="p-4">
                        <div className="font-mono text-white text-sm">
                          #{payment.id.slice(-8)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-white text-sm">
                          {payment.userId.slice(-6)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-white text-sm capitalize">
                          {payment.serviceType}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-white text-sm">
                          €{payment.priceEUR}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getCryptoIcon(payment.cryptoCurrency)}</span>
                          <span className="text-white text-sm">{payment.cryptoCurrency}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color} bg-current bg-opacity-20`}>
                          <span className="mr-1">{statusInfo.icon}</span>
                          {statusInfo.text}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-gray-300 text-sm">
                          {timeAgo(payment.createdAt)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <button className="text-blue-400 hover:text-blue-300 text-sm">
                            👁️
                          </button>
                          <button className="text-green-400 hover:text-green-300 text-sm">
                            🔄
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Вкладка аналитики
 */
function AnalyticsTab({ timeRange }: { timeRange: string }) {
  return (
    <div className="space-y-8">
      <div className="text-center py-20">
        <div className="text-6xl mb-4">📈</div>
        <h3 className="text-2xl font-bold text-white mb-2">Аналитика в разработке</h3>
        <p className="text-gray-300">
          Здесь будут графики доходов, популярные валюты, конверсия и другая аналитика
        </p>
      </div>
    </div>
  );
}

/**
 * Вкладка настроек
 */
function SettingsTab() {
  return (
    <div className="space-y-8">
      <div className="glass-card p-6">
        <h3 className="text-xl font-bold text-white mb-6">⚙️ Настройки системы</h3>
        
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Цена сервиса (EUR):
            </label>
            <input
              type="number"
              defaultValue="10"
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Время жизни платежа (минуты):
            </label>
            <input
              type="number"
              defaultValue="60"
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="flex items-center space-x-3">
              <input type="checkbox" className="form-checkbox" />
              <span className="text-white">Автоматическая активация сервисов</span>
            </label>
          </div>
          
          <div>
            <label className="flex items-center space-x-3">
              <input type="checkbox" className="form-checkbox" />
              <span className="text-white">Email уведомления</span>
            </label>
          </div>
          
          <button className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
            💾 Сохранить настройки
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Компонент карточки метрики
 */
function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color 
}: { 
  title: string; 
  value: string; 
  subtitle: string; 
  icon: string; 
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}) {
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30',
    yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
    red: 'from-red-500/20 to-red-600/20 border-red-500/30',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30'
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-6`}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-3xl">{icon}</div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{value}</div>
          <div className="text-sm text-gray-300">{title}</div>
        </div>
      </div>
      <div className="text-xs text-gray-400">{subtitle}</div>
    </div>
  );
}

/**
 * Компонент карточки здоровья системы
 */
function SystemHealthCard({
  title,
  status,
  value,
  subtitle
}: {
  title: string;
  status: 'healthy' | 'warning' | 'error';
  value: string;
  subtitle: string;
}) {
  const statusColors = {
    healthy: 'text-green-400',
    warning: 'text-yellow-400',
    error: 'text-red-400'
  };

  const statusIcons = {
    healthy: '✅',
    warning: '⚠️',
    error: '❌'
  };

  return (
    <div className="bg-white/5 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white font-medium">{title}</span>
        <span className={statusColors[status]}>
          {statusIcons[status]}
        </span>
      </div>
      <div className="text-xl font-bold text-white">{value}</div>
      <div className="text-xs text-gray-400">{subtitle}</div>
    </div>
  );
}
