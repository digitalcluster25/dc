# 🚀 Railway SaaS Hosting Platform

## 📋 Описание проекта

**Railway SaaS Platform** - современная хостинг-платформа, построенная на базе Railway, предоставляющая готовые шаблоны приложений для быстрого развертывания.

## 🎯 Архитектура

- **Провайдер** управляет Railway аккаунтом с шаблонами
- **Пользователи** выбирают готовые решения из каталога
- **Мультитенанси** через префиксы и метаданные
- **SaaS модель** с подписками и биллингом

## 🛠️ Технологический стек

### Backend
- **Next.js 14 API Routes** - основной backend
- **Railway GraphQL API** - управление инфраструктурой  
- **PostgreSQL** - основная база данных
- **Redis** - кэширование и очереди
- **Stripe** - биллинг и подписки

### Frontend
- **Next.js 14 App Router** - клиентский интерфейс
- **shadcn/ui** - UI компоненты
- **React Query** - state management
- **Zustand** - глобальный store

## 📦 Модули проекта

- 🔐 **AUTH_MODULE** - аутентификация и пользователи
- 💰 **BILLING_MODULE** - подписки и платежи
- 🚀 **DEPLOYMENT_MODULE** - управление Railway инстансами
- 📊 **ADMIN_MODULE** - админка для управления шаблонами
- 👤 **USER_MODULE** - пользовательский интерфейс
- 📈 **ANALYTICS_MODULE** - метрики и мониторинг

## 🚀 Быстрый старт

```bash
# Клонируем репозиторий
git clone https://github.com/digitalcluster25/dc.git
cd dc

# Устанавливаем зависимости
npm install

# Запускаем в режиме разработки
npm run dev
```

## 📚 Документация

Подробная документация находится в папке `/docs`:

- [Правила проекта](./docs/projectrules.md)
- [Системный промпт](./docs/system-prompt.md)
- [Архитектура](./docs/architecture.md)

## 🌐 Домены

- **Production**: https://www.digitalcluster.online
- **Railway Project**: e0fc7f70-e8f8-4ec8-8f98-6efc24fc28df

## 📄 Лицензия

MIT License

---

**Digital Cluster Team** © 2024
