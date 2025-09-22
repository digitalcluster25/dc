# 🎯 СИСТЕМНЫЙ ПРОМПТ: Railway SaaS Hosting Platform

## Архитектура проекта
Мы разрабатываем **SaaS хостинг-платформу** по модели традиционного хостинг-провайдера, но на базе Railway.

### Бизнес-модель
- **Провайдер** (владелец) имеет один Railway аккаунт с шаблонами
- **Пользователи** регистрируются на платформе и выбирают готовые шаблоны  
- **Инстансы** разворачиваются в Railway аккаунте провайдера
- **Мультитенанси** - изоляция пользователей через префиксы и метаданные

### Ключевые отличия от первоначального MVP
❌ **НЕ делаем:** Панель для управления своими Railway проектами  
✅ **Делаем:** SaaS платформу где провайдер сдает готовые решения в аренду

## Роли в системе

### 🔧 Администратор (Провайдер)
- Управляет Railway аккаунтом с мастер-токеном
- Добавляет/редактирует доступные шаблоны в админке
- Настраивает цены и лимиты для тарифов
- Мониторит использование ресурсов всех клиентов
- Управляет биллингом и подписками

### 👤 Пользователь (Клиент)
- Регистрируется на платформе без Railway аккаунта
- Выбирает шаблон из каталога (WordPress, Next.js, etc.)
- Настраивает базовые параметры (название, домен)
- Получает готовый инстанс с админ-доступом
- Управляет своими инстансами через веб-панель

## Технические принципы

### Мультитенанси
```
Каждый пользовательский инстанс имеет:
- Префикс: user-{userId}-{serviceType}-{instanceId}
- Метаданные: customer_id, subscription_tier, created_at
- Изоляция: отдельные env variables, домены, базы данных
```

### Шаблонная система
```
Шаблон = Railway Project Template + Metadata:
- template_id: внутренний ID
- railway_template_id: ID в Railway
- display_name: "WordPress CMS"
- category: "cms", "ecommerce", "app"
- price_tier: "basic", "pro", "enterprise"
- resources: {cpu: "0.5", memory: "512MB", storage: "1GB"}
- setup_script: post-deployment конфигурация
```

### Биллинг и лимиты
```
Тарифы:
- Starter: 1 инстанс, базовые ресурсы
- Pro: 5 инстансов, увеличенные ресурсы  
- Business: безлимит инстансов, premium ресурсы
```

## Технологический стек

### Backend
- **Next.js 14 API Routes** - основной backend
- **Railway GraphQL API** - управление инфраструктурой
- **PostgreSQL** - пользователи, подписки, инстансы
- **Redis** - кэширование и очереди задач
- **Stripe** - биллинг и подписки

### Frontend  
- **Next.js 14 App Router** - клиентский интерфейс
- **shadcn/ui** - UI компоненты
- **React Query** - state management
- **Zustand** - глобальный store

### DevOps
- **Railway** - хостинг всей платформы
- **Docker** - контейнеризация
- **GitHub Actions** - CI/CD
- **Sentry** - мониторинг ошибок

## Структура базы данных

### Основные таблицы
```sql
users - пользователи платформы
subscriptions - подписки и тарифы  
templates - доступные шаблоны
instances - развернутые инстансы
deployments - история деплоев
usage_metrics - метрики использования ресурсов
invoices - биллинг и платежи
support_tickets - техподдержка
```

### Ключевые связи
```
User -> Subscription -> Instances -> Railway Services
Template -> Category -> Pricing Tier
Instance -> Usage Metrics -> Billing
```

## Пользовательские сценарии

### 🚀 Сценарий 1: Деплой WordPress
1. Пользователь заходит в каталог шаблонов
2. Выбирает "WordPress CMS" 
3. Вводит название сайта и домен
4. Платформа автоматически:
   - Создает новый Railway service с префиксом
   - Настраивает базу данных MySQL
   - Устанавливает WordPress с начальной конфигурацией
   - Связывает пользовательский домен
5. Пользователь получает готовый сайт и админ-доступ

### 🛒 Сценарий 2: Развертывание магазина
1. Выбор "WooCommerce Store"  
2. Настройка (название, валюта, домен)
3. Автоматический деплой с предустановленными плагинами
4. Интеграция с платежными системами
5. Готовый интернет-магазин

### 📱 Сценарий 3: Мобильное приложение API
1. Выбор "Node.js REST API"
2. Настройка endpoints и базы данных  
3. Автоматическая генерация документации API
4. Настройка CORS и аутентификации
5. Готовый backend для мобильного приложения

## Монетизация

### Модель ценообразования
```
Starter: $5/месяц
- 1 активный инстанс
- 512MB RAM, 0.5 CPU
- 5GB SSD storage
- Стандартная поддержка

Pro: $25/месяц  
- 5 активных инстансов
- 2GB RAM, 1 CPU
- 50GB SSD storage
- Приоритетная поддержка
- Custom домены

Business: $99/месяц
- Безлимит инстансов
- 8GB RAM, 4 CPU  
- 500GB SSD storage
- Dedicated поддержка
- White-label опции
```

### Дополнительные услуги
- Backup & Restore: $2/GB/месяц
- Premium поддержка: $50/месяц
- Custom интеграции: $200/час
- Managed миграции: от $100

## Ключевые метрики

### Бизнес-метрики
- Monthly Recurring Revenue (MRR)
- Customer Acquisition Cost (CAC)  
- Customer Lifetime Value (LTV)
- Churn Rate по тарифам
- Average Revenue Per User (ARPU)

### Технические метрики
- Время деплоя шаблона (цель: <3 минут)
- Uptime инстансов (цель: 99.9%)
- Resource utilization по тарифам
- Support ticket resolution time

## Развитие продукта

### Phase 1: MVP (4 недели)
- Базовая регистрация и аутентификация
- 5-10 популярных шаблонов (WordPress, Next.js, API)
- Простой биллинг через Stripe
- Админка для управления шаблонами

### Phase 2: Growth (8 недель)  
- 25+ шаблонов всех категорий
- Расширенная настройка инстансов
- Система поддержки и документация
- Партнерская программа

### Phase 3: Scale (12 недель)
- White-label решения
- API для разработчиков
- Marketplace для сторонних шаблонов
- Enterprise функции

## Конкурентные преимущества

### VS традиционные хостинги
✅ Современная инфраструктура Railway  
✅ Автоматический деплой из Git  
✅ Встроенная CI/CD  
✅ Serverless архитектура  

### VS Vercel/Netlify
✅ Полнофункциональные приложения с БД  
✅ Более простая настройка для не-разработчиков  
✅ Готовые CMS и ecommerce решения  

### VS DigitalOcean App Platform  
✅ Более простой UX  
✅ Предустановленные популярные стеки  
✅ Автоматическая оптимизация производительности

## Технические ограничения Railway

### Resource Limits
- Starter: $5 Railway credits
- Pro: $25 Railway credits  
- Business: $100 Railway credits

### Service Limits
- Max 100 services per Railway account
- Max 5GB RAM per service
- Max 100GB storage per service  

### API Rate Limits
- 1000 requests/hour на токен
- Batch операции для множественных деплоев
- Кэширование для часто запрашиваемых данных

## Архитектурные паттерны

### Event-Driven Architecture
```
User Action -> Event Queue -> Background Jobs -> Railway API -> Database Update -> WebSocket Notification
```

### Микросервисная структура
```
auth-service: аутентификация и авторизация
billing-service: подписки и платежи  
deployment-service: управление Railway инстансами
monitoring-service: метрики и алерты
notification-service: email и push уведомления
```

### Кэширование стратегия
```
Redis Layers:
- Session cache (TTL: 30 min)
- Template cache (TTL: 1 hour)  
- Instance status cache (TTL: 5 min)
- User preferences cache (TTL: 24 hours)
```

Этот системный промпт определяет архитектуру SaaS хостинг-платформы на базе Railway с мультитенанси и готовыми шаблонами для пользователей.
