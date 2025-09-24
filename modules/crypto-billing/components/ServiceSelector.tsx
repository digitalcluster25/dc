// 🛍️ Service Selector Component - CRYPTO_BILLING_MODULE

'use client';

import { useState } from 'react';
import { ServiceType, ServiceInfo } from '../types/crypto-billing.types';
import { SERVICE_CATALOG } from '../utils/constants';

interface ServiceSelectorProps {
  onServiceSelect: (serviceType: ServiceType) => void;
  selectedService?: ServiceType;
  className?: string;
}

export default function ServiceSelector({ 
  onServiceSelect, 
  selectedService, 
  className = '' 
}: ServiceSelectorProps) {
  const [hoveredService, setHoveredService] = useState<ServiceType | null>(null);

  const handleServiceClick = (serviceType: ServiceType) => {
    onServiceSelect(serviceType);
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Выберите сервис
        </h2>
        <p className="text-gray-300 text-lg">
          Все сервисы стоят <span className="font-bold text-blue-400">10€</span> и активируются мгновенно
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SERVICE_CATALOG.map((service) => (
          <div
            key={service.type}
            onClick={() => handleServiceClick(service.type)}
            onMouseEnter={() => setHoveredService(service.type)}
            onMouseLeave={() => setHoveredService(null)}
            className={`
              glass-card p-6 cursor-pointer transition-all duration-300 transform
              ${selectedService === service.type 
                ? 'ring-2 ring-blue-500 bg-blue-500/20 scale-105' 
                : 'hover:bg-white/10 hover:scale-105'
              }
              ${hoveredService === service.type ? 'shadow-2xl' : ''}
            `}
          >
            {/* Service Icon */}
            <div className="text-center mb-4">
              <div className="text-6xl mb-3">{service.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2">
                {service.name}
              </h3>
              <p className="text-gray-300 text-sm mb-3">
                {service.description}
              </p>
              <div className="text-2xl font-bold text-blue-400">
                €{service.priceEUR}
              </div>
            </div>

            {/* Features */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-200 mb-2">
                Включает:
              </h4>
              {service.features.map((feature, index) => (
                <div key={index} className="flex items-center text-sm text-gray-300">
                  <span className="text-green-400 mr-2">✓</span>
                  {feature}
                </div>
              ))}
            </div>

            {/* Deployment Time */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Время активации:</span>
                <span className="text-blue-400 font-medium">
                  ~{service.deploymentTime} мин
                </span>
              </div>
            </div>

            {/* Selected Indicator */}
            {selectedService === service.type && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Service Details Modal */}
      {selectedService && (
        <div className="mt-8 glass-card p-6">
          <h3 className="text-xl font-bold text-white mb-4">
            Выбранный сервис: {SERVICE_CATALOG.find(s => s.type === selectedService)?.name}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-200 mb-2">Что вы получите:</h4>
              <ul className="space-y-1">
                {SERVICE_CATALOG.find(s => s.type === selectedService)?.features.map((feature, index) => (
                  <li key={index} className="text-gray-300 text-sm flex items-center">
                    <span className="text-green-400 mr-2">•</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-200 mb-2">Детали:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Цена:</span>
                  <span className="text-blue-400 font-bold">
                    €{SERVICE_CATALOG.find(s => s.type === selectedService)?.priceEUR}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Активация:</span>
                  <span className="text-green-400">
                    ~{SERVICE_CATALOG.find(s => s.type === selectedService)?.deploymentTime} минут
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Домен:</span>
                  <span className="text-gray-300">Включен</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">SSL:</span>
                  <span className="text-green-400">Автоматически</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              className="btn-primary px-8 py-3 text-lg font-semibold"
              onClick={() => {
                // Здесь будет переход к оплате
                console.log('Переход к оплате сервиса:', selectedService);
              }}
            >
              Перейти к оплате 💳
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Компактный селектор сервисов для сайдбара
 */
export function ServiceSelectorCompact({ 
  onServiceSelect, 
  selectedService,
  className = '' 
}: ServiceSelectorProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4">Выберите сервис</h3>
      
      {SERVICE_CATALOG.map((service) => (
        <div
          key={service.type}
          onClick={() => onServiceSelect(service.type)}
          className={`
            flex items-center p-3 rounded-lg cursor-pointer transition-colors
            ${selectedService === service.type 
              ? 'bg-blue-500/20 border border-blue-500' 
              : 'bg-white/5 hover:bg-white/10'
            }
          `}
        >
          <div className="text-2xl mr-3">{service.icon}</div>
          <div className="flex-1">
            <div className="font-medium text-white text-sm">{service.name}</div>
            <div className="text-gray-400 text-xs">{service.description}</div>
          </div>
          <div className="text-blue-400 font-bold text-sm">€{service.priceEUR}</div>
        </div>
      ))}
    </div>
  );
}

/**
 * Карточка отдельного сервиса
 */
interface ServiceCardProps {
  service: ServiceInfo;
  selected: boolean;
  onClick: () => void;
}

export function ServiceCard({ service, selected, onClick }: ServiceCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        relative glass-card p-6 cursor-pointer transition-all duration-300 
        ${selected ? 'ring-2 ring-blue-500 bg-blue-500/20' : 'hover:bg-white/10'}
        hover:transform hover:scale-105
      `}
    >
      {/* Popular Badge */}
      {['wordpress', 'nextjs', 'api'].includes(service.type) && (
        <div className="absolute -top-2 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-2 py-1 rounded">
          ПОПУЛЯРНЫЙ
        </div>
      )}

      <div className="text-center">
        <div className="text-4xl mb-3">{service.icon}</div>
        <h3 className="text-lg font-bold text-white mb-2">{service.name}</h3>
        <p className="text-gray-300 text-sm mb-4">{service.description}</p>
        
        <div className="text-xl font-bold text-blue-400 mb-4">
          €{service.priceEUR}
        </div>

        {/* Quick Features */}
        <div className="text-xs text-gray-400 space-y-1">
          <div>⚡ {service.deploymentTime} мин активация</div>
          <div>🛡️ SSL включен</div>
          <div>🌐 Персональный домен</div>
        </div>
      </div>

      {selected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm">✓</span>
        </div>
      )}
    </div>
  );
}
