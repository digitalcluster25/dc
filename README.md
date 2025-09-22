# 🚀 Railway SaaS Platform

## 📋 Описание проекта

**Railway SaaS Platform** - современная хостинг-платформа, построенная на базе Railway, предоставляющая готовые шаблоны приложений для быстрого развертывания.

## ✅ Текущий статус (v0.1.0)

### 🎯 Готово:
- ✅ **Next.js 13.5.6** - стабильная конфигурация
- ✅ **React 18.2.0** - UI фреймворк  
- ✅ **TypeScript 5** - типизация
- ✅ **Tailwind CSS** - современные стили
- ✅ **Pages Router** - маршрутизация
- ✅ **Railway CLI** - интеграция с Railway

### 🔄 В разработке:
- 🔐 **AUTH_MODULE** - система аутентификации
- 💳 **BILLING_MODULE** - интеграция с Stripe
- 🚀 **DEPLOYMENT_MODULE** - управление Railway

## 🛠️ Технологический стек

### Frontend
- **Next.js 13.5.6** с Pages Router
- **React 18.2.0** + TypeScript 5
- **Tailwind CSS** для стилизации
- **React Query** для state management (планируется)

### Backend  
- **Next.js API Routes** - основной backend
- **PostgreSQL** - основная база данных (планируется)
- **Redis** - кэширование (планируется)
- **Stripe** - биллинг (планируется)

### DevOps
- **Railway** - хостинг и деплой
- **GitHub** - система контроля версий
- **Docker** - контейнеризация (планируется)

## 🚀 Быстрый старт

### Локальная разработка:
```bash
# Клонируем репозиторий
git clone https://github.com/digitalcluster25/dc.git
cd dc

# Устанавливаем зависимости
npm install

# Запускаем в режиме разработки
npm run dev
```

### Деплой на Railway:
```bash
# Используем готовый скрипт
./deploy.sh
```

## 📁 Структура проекта

```
railway-saas-platform/
├── 📄 pages/                    # Next.js страницы
│   ├── 📄 index.tsx             # Главная страница
│   └── 📄 _app.tsx              # App компонент
├── 📁 modules/                  # Модули проекта
│   └── 📁 auth/                 # AUTH_MODULE
├── 📁 components/               # React компоненты
├── 📁 styles/                   # Глобальные стили
├── 📁 docs/                     # Документация
├── 📄 package.json              # Зависимости
├── 📄 tailwind.config.js        # Tailwind конфигурация
└── 📄 next.config.js            # Next.js конфигурация
```

## 🎯 Бизнес-модель

- **Провайдер** управляет Railway аккаунтом с шаблонами
- **Пользователи** выбирают готовые решения из каталога
- **Мультитенанси** через префиксы и метаданные
- **SaaS модель** с подписками и биллингом

## 📚 Документация

- [Правила проекта](./docs/projectrules.md)
- [Системный промпт](./docs/system-prompt.md)
- [Архитектура](./docs/architecture.md)

## 🌐 Проект

- **Домен**: https://www.digitalcluster.online
- **Railway Project**: e0fc7f70-e8f8-4ec8-8f98-6efc24fc28df
- **GitHub**: https://github.com/digitalcluster25/dc

## 📄 Лицензия

MIT License

---

**Digital Cluster Team** © 2024
