# 📋 ПРАВИЛА РАБОТЫ С ПРОЕКТОМ Railway SaaS Platform

## 🎯 Общие принципы

### Модульная разработка
Проект разбит на **независимые модули**, каждый из которых можно разрабатывать в отдельном чате:

```
🔐 AUTH_MODULE - аутентификация и пользователи
💰 BILLING_MODULE - подписки и платежи  
🚀 DEPLOYMENT_MODULE - управление Railway инстансами
📊 ADMIN_MODULE - админка для управления шаблонами
👤 USER_MODULE - пользовательский интерфейс
📈 ANALYTICS_MODULE - метрики и мониторинг
🛠️ API_MODULE - внешнее API для разработчиков
📞 SUPPORT_MODULE - техподдержка и документация
```

### Принцип работы с чатами
- **Один чат = один модуль** максимум
- **Всегда начинать чат** с этого файла правил и системного промпта
- **Указывать номер модуля** в начале каждого чата
- **Сохранять артефакты** и ссылки между чатами через документацию

---

## 📚 Структура документации

### Обязательные файлы для каждого модуля
```
/{MODULE_NAME}/
├── README.md                 # Описание модуля
├── ARCHITECTURE.md           # Техническая архитектура  
├── API_SPEC.md              # API спецификация
├── DATABASE_SCHEMA.md       # Схема БД для модуля
├── COMPONENTS_LIST.md       # Список React компонентов
├── TESTS_PLAN.md           # План тестирования
├── DEPLOYMENT_GUIDE.md     # Инструкции по деплою
└── CHANGELOG.md            # История изменений
```

### Общие файлы проекта
```
/docs/
├── SYSTEM_PROMPT.md         # Системный промпт (этот файл)
├── PROJECT_RULES.md         # Правила работы (текущий файл)
├── TECH_STACK.md           # Технологический стек
├── DATABASE_GLOBAL.md      # Общая схема БД
├── API_GATEWAY.md          # Общие API правила
├── DEPLOYMENT_STRATEGY.md  # Стратегия деплоя
├── SECURITY_GUIDELINES.md  # Требования безопасности
└── PROGRESS_TRACKER.md     # Трекер прогресса
```

---

## 🔧 Модули проекта

### 🔐 AUTH_MODULE (Приоритет: Высокий)
**Описание:** Система регистрации, логина, управления пользователями

**Ключевые компоненты:**
- User registration/login
- Email verification  
- Password reset
- User profiles и settings
- Role-based access control
- Session management

**Зависимости:** База данных, Email service
**Блокирует:** Все остальные модули

### 💰 BILLING_MODULE (Приоритет: Высокий)  
**Описание:** Подписки, тарифы, интеграция со Stripe

**Ключевые компоненты:**
- Subscription plans
- Stripe integration
- Invoice generation
- Usage tracking
- Payment methods
- Billing history

**Зависимости:** AUTH_MODULE, External APIs (Stripe)
**Блокирует:** DEPLOYMENT_MODULE

### 🚀 DEPLOYMENT_MODULE (Приоритет: Критический)
**Описание:** Ядро системы - управление Railway инстансами

**Ключевые компоненты:**
- Template management
- Instance creation/deletion
- Railway API integration
- Environment configuration
- Domain management
- Deployment monitoring

**Зависимости:** AUTH_MODULE, BILLING_MODULE, Railway API
**Блокирует:** USER_MODULE, ADMIN_MODULE

### 📊 ADMIN_MODULE (Приоритет: Средний)
**Описание:** Админ-панель для управления платформой

**Ключевые компоненты:**
- Template CRUD
- User management
- Analytics dashboard
- System monitoring
- Configuration management
- Support tools

**Зависимости:** AUTH_MODULE, DEPLOYMENT_MODULE
**Блокирует:** Нет

### 👤 USER_MODULE (Приоритет: Высокий)
**Описание:** Пользовательский интерфейс платформы

**Ключевые компоненты:**
- Template catalog
- Instance dashboard  
- Account settings
- Billing interface
- Support interface
- Usage metrics

**Зависимости:** AUTH_MODULE, BILLING_MODULE, DEPLOYMENT_MODULE
**Блокирует:** Нет

### 📈 ANALYTICS_MODULE (Приоритет: Низкий)
**Описание:** Сбор метрик и аналитика

**Ключевые компоненты:**
- Usage tracking
- Performance metrics
- Business analytics
- Resource monitoring
- Alert system
- Reporting

**Зависимости:** Все модули (для сбора данных)
**Блокирует:** Нет

### 🛠️ API_MODULE (Приоритет: Низкий)
**Описание:** Внешнее API для разработчиков

**Ключевые компоненты:**
- REST API endpoints
- API authentication
- Rate limiting
- API documentation
- SDK generation
- Webhook system

**Зависимости:** AUTH_MODULE, DEPLOYMENT_MODULE
**Блокирует:** Нет

### 📞 SUPPORT_MODULE (Приоритет: Средний)
**Описание:** Техподдержка и документация

**Ключевые компоненты:**
- Ticket system
- Knowledge base
- Live chat
- Documentation site
- Video tutorials
- Community forum

**Зависимости:** AUTH_MODULE
**Блокирует:** Нет

---

## 🏗️ Порядок разработки

### Phase 1: Foundation (Недели 1-4)
```
1. AUTH_MODULE (неделя 1-2)
   - User registration/login
   - Basic user management
   
2. BILLING_MODULE (неделя 2-3)  
   - Stripe integration
   - Basic subscription plans
   
3. DEPLOYMENT_MODULE (неделя 3-4)
   - Railway API integration
   - Basic template deployment
```

### Phase 2: Core Platform (Недели 5-8)
```
4. USER_MODULE (неделя 5-6)
   - Template catalog
   - Instance management
   
5. ADMIN_MODULE (неделя 6-7)
   - Template CRUD
   - User management
   
6. Polish & Testing (неделя 8)
   - Bug fixes
   - Performance optimization
```

### Phase 3: Advanced Features (Недели 9-12)
```
7. ANALYTICS_MODULE (неделя 9-10)
8. API_MODULE (неделя 11)  
9. SUPPORT_MODULE (неделя 12)
```

---

## 📝 Правила кодирования

### Именование файлов и папок
```
Компоненты: PascalCase (UserDashboard.tsx)
Хуки: camelCase с префиксом use (useAuth.ts)
Утилиты: camelCase (formatPrice.ts)
Константы: UPPER_SNAKE_CASE (API_ENDPOINTS.ts)
Типы: PascalCase с суффиксом Type (UserType.ts)
```

### Структура компонентов
```typescript
// Импорты (внешние библиотеки -> внутренние)
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

// Типы
interface ComponentProps {
  title: string;
  onAction: () => void;
}

// Основной компонент
export default function Component({ title, onAction }: ComponentProps) {
  // Логика компонента
  return (
    // JSX
  );
}
```

### API маршруты
```typescript
// app/api/{module}/{action}/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Аутентификация
    const user = await requireAuth(request);
    
    // Валидация входных данных
    const data = await request.json();
    
    // Бизнес-логика
    const result = await processData(data);
    
    // Ответ
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error message' },
      { status: 500 }
    );
  }
}
```

---

## 🗄️ Соглашения по базе данных

### Именование таблиц
```sql
users           -- пользователи (множественное число)
subscriptions   -- подписки
templates       -- шаблоны
instances       -- инстансы
deployments     -- развертывания
```

### Обязательные поля для каждой таблицы
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

### Внешние ключи
```sql
user_id         UUID REFERENCES users(id) ON DELETE CASCADE
subscription_id UUID REFERENCES subscriptions(id)
```

---

## 🔒 Правила безопасности

### Аутентификация
- **Все API маршруты** должны проверять аутентификацию
- **JWT токены** с коротким временем жизни (15 минут)
- **Refresh токены** для продления сессии
- **Rate limiting** на все публичные endpoints

### Авторизация
```typescript
// Проверка прав доступа
const canAccessInstance = (user: User, instance: Instance) => {
  return instance.user_id === user.id || user.role === 'admin';
};
```

### Данные пользователей
- **Никогда не логировать** пароли и токены
- **Шифрование** чувствительных данных в БД
- **HTTPS only** для всех запросов
- **Валидация** всех пользовательских вводов

---

## 📊 Monitoring и логирование

### Обязательные логи
```typescript
// Каждое действие пользователя
logger.info('User action', {
  user_id: user.id,
  action: 'create_instance',
  template_id: template.id,
  timestamp: new Date().toISOString()
});

// Ошибки с контекстом
logger.error('Deployment failed', {
  user_id: user.id,
  instance_id: instance.id,
  error: error.message,
  stack: error.stack
});
```

### Метрики для отслеживания
- Время отклика API
- Количество активных пользователей
- Успешность развертываний
- Использование ресурсов Railway
- Конверсия регистрация → подписка

---

## 🚀 Правила развертывания

### Environment Variables
```bash
# Разработка
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/railway_saas_dev

# Staging  
NODE_ENV=staging
DATABASE_URL=postgresql://staging-db/railway_saas

# Production
NODE_ENV=production
DATABASE_URL=postgresql://prod-db/railway_saas
```

### Миграции БД
```bash
# Создание миграции
npm run migration:create add_templates_table

# Применение миграций
npm run migration:up

# Откат миграции
npm run migration:down
```

### Deployment checklist
- [ ] Все тесты проходят
- [ ] Миграции БД применены
- [ ] Environment variables настроены
- [ ] Health checks работают
- [ ] Мониторинг настроен

---

## 🧪 Тестирование

### Уровни тестирования
```
Unit Tests:      Отдельные функции и компоненты
Integration:     API endpoints и БД операции  
E2E Tests:       Полные пользовательские сценарии
Load Tests:      Производительность под нагрузкой
```

### Обязательные тесты
- Регистрация и аутентификация
- Создание и удаление инстансов
- Биллинг и подписки
- Критические пользовательские пути

---

## 📞 Коммуникация между чатами

### При работе с модулем указывать:
```
🔧 МОДУЛЬ: AUTH_MODULE
📅 ДАТА: 2024-01-20
👤 РАЗРАБОТЧИК: [ваше имя]
🎯 ЦЕЛЬ: Реализация user registration
📋 СТАТУС: В процессе
🔗 СВЯЗАННЫЕ ЧАТЫ: [ссылки на другие чаты]
```

### Артефакты для передачи между чатами:
- **Схемы БД** в SQL формате
- **API спецификации** в OpenAPI/Swagger
- **React компоненты** с TypeScript
- **Конфигурационные файлы**
- **Документация** в Markdown

### Файл прогресса (обновлять в каждом чате):
```markdown
## ПРОГРЕСС РАЗРАБОТКИ

### ✅ Завершено
- [x] AUTH_MODULE: User registration
- [x] AUTH_MODULE: Login/logout

### 🔄 В процессе  
- [ ] BILLING_MODULE: Stripe integration

### 📋 Запланировано
- [ ] DEPLOYMENT_MODULE: Railway API
- [ ] USER_MODULE: Template catalog
```

---

## ⚠️ Важные ограничения

### Railway API Limits
- **1000 запросов/час** на токен (нужно кэширование)
- **100 сервисов max** на аккаунт (планировать масштабирование)
- **5GB RAM max** на сервис (ограничение для тарифов)

### Технические ограничения
- **PostgreSQL**: max 100 подключений
- **Redis**: max 1GB данных на Hobby план
- **File uploads**: max 10MB через Next.js API

### Бизнес-ограничения
- **Stripe**: комиссия 2.9% + $0.30 за транзакцию
- **Email**: лимиты на количество писем
- **Support**: время отклика зависит от тарифа

---

## 🎯 Критерии готовности

### Для каждого модуля:
- [ ] Все компоненты реализованы
- [ ] API endpoints протестированы  
- [ ] Схема БД создана и протестирована
- [ ] Unit тесты написаны и проходят
- [ ] Документация обновлена
- [ ] Security review пройден
- [ ] Performance тесты выполнены

### Для релиза:
- [ ] Все модули Phase 1 готовы
- [ ] E2E тесты проходят
- [ ] Load testing выполнен
- [ ] Monitoring настроен
- [ ] Documentation завершена
- [ ] Security audit пройден

**Следуйте этим правилам для эффективной и структурированной разработки Railway SaaS Platform! 🚀**