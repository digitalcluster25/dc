# 🏗️ Архитектура Railway SaaS Platform

## Общая архитектура

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Users         │    │   Platform      │    │   Railway       │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Dashboard   │ │◄──►│ │ Next.js App │ │◄──►│ │ API         │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Templates   │ │    │ │ PostgreSQL  │ │    │ │ Services    │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Модульная архитектура

### Frontend Architecture (Next.js 14)

```
app/
├── (auth)/                 # Защищенные роуты
│   ├── dashboard/          # Пользовательская панель
│   ├── admin/              # Админ-панель
│   └── billing/            # Биллинг интерфейс
├── (public)/               # Публичные страницы
│   ├── templates/          # Каталог шаблонов
│   ├── pricing/            # Цены и тарифы
│   └── docs/               # Документация
├── api/                    # API Routes
│   ├── auth/               # Аутентификация
│   ├── railway/            # Railway API proxy
│   ├── stripe/             # Stripe webhooks
│   └── templates/          # CRUD шаблонов
└── globals.css             # Глобальные стили
```

### Backend Architecture (API Routes)

```
api/
├── auth/
│   ├── login/              # POST /api/auth/login
│   ├── register/           # POST /api/auth/register
│   ├── refresh/            # POST /api/auth/refresh
│   └── logout/             # POST /api/auth/logout
├── users/
│   ├── profile/            # GET/PUT /api/users/profile
│   └── [id]/               # GET/PUT/DELETE /api/users/[id]
├── templates/
│   ├── route.ts            # GET/POST /api/templates
│   ├── [id]/               # GET/PUT/DELETE /api/templates/[id]
│   └── deploy/             # POST /api/templates/deploy
├── instances/
│   ├── route.ts            # GET/POST /api/instances
│   ├── [id]/               # GET/PUT/DELETE /api/instances/[id]
│   └── status/             # GET /api/instances/status
├── billing/
│   ├── subscription/       # GET/POST /api/billing/subscription
│   ├── invoices/           # GET /api/billing/invoices
│   └── usage/              # GET /api/billing/usage
└── railway/
    ├── projects/           # GET /api/railway/projects
    ├── services/           # GET/POST /api/railway/services
    └── deployments/        # GET /api/railway/deployments
```

### Database Architecture (PostgreSQL)

```sql
-- Пользователи платформы
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Подписки и тарифы
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    plan_name VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Доступные шаблоны
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    railway_template_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    price_tier VARCHAR(50) NOT NULL,
    resources JSONB NOT NULL,
    setup_config JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Развернутые инстансы
CREATE TABLE instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES templates(id),
    railway_service_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255),
    status VARCHAR(50) NOT NULL,
    config JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- История развертываний
CREATE TABLE deployments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id UUID REFERENCES instances(id) ON DELETE CASCADE,
    railway_deployment_id VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL,
    logs TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    finished_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Метрики использования
CREATE TABLE usage_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id UUID REFERENCES instances(id) ON DELETE CASCADE,
    metric_type VARCHAR(100) NOT NULL,
    value DECIMAL(10,4) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для производительности
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_instances_user_id ON instances(user_id);
CREATE INDEX idx_deployments_instance_id ON deployments(instance_id);
CREATE INDEX idx_usage_metrics_instance_id ON usage_metrics(instance_id);
CREATE INDEX idx_usage_metrics_recorded_at ON usage_metrics(recorded_at);
```

### Component Architecture

```
components/
├── ui/                     # Базовые UI компоненты (shadcn/ui)
│   ├── button.tsx
│   ├── input.tsx
│   ├── dialog.tsx
│   └── ...
├── layout/                 # Layout компоненты
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   └── Footer.tsx
├── auth/                   # Компоненты аутентификации
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   └── ProtectedRoute.tsx
├── templates/              # Компоненты шаблонов
│   ├── TemplateCard.tsx
│   ├── TemplateGrid.tsx
│   └── DeployDialog.tsx
├── instances/              # Компоненты инстансов
│   ├── InstanceCard.tsx
│   ├── InstanceStatus.tsx
│   └── InstanceLogs.tsx
└── dashboard/              # Dashboard компоненты
    ├── StatsCard.tsx
    ├── UsageChart.tsx
    └── RecentActivity.tsx
```

### Service Layer Architecture

```
lib/
├── auth/                   # Аутентификация
│   ├── jwt.ts             # JWT utilities
│   ├── password.ts        # Password hashing
│   └── middleware.ts      # Auth middleware
├── database/              # База данных
│   ├── connection.ts      # DB connection
│   ├── queries.ts         # SQL queries
│   └── migrations/        # DB migrations
├── railway/               # Railway API
│   ├── client.ts          # Railway API client
│   ├── templates.ts       # Template operations
│   └── deployments.ts     # Deployment operations
├── stripe/                # Stripe биллинг
│   ├── client.ts          # Stripe client
│   ├── subscriptions.ts   # Subscription logic
│   └── webhooks.ts        # Webhook handlers
├── redis/                 # Кэширование
│   ├── client.ts          # Redis client
│   └── cache.ts           # Cache utilities
└── utils/                 # Общие утилиты
    ├── validation.ts      # Zod schemas
    ├── errors.ts          # Error handling
    └── constants.ts       # Constants
```

## Data Flow Architecture

### User Registration Flow
```
1. User submits registration form
2. Validate email/password
3. Hash password with bcrypt
4. Save user to PostgreSQL
5. Send verification email
6. Generate JWT tokens
7. Redirect to dashboard
```

### Template Deployment Flow
```
1. User selects template
2. Configure deployment options
3. Validate user subscription limits
4. Call Railway API to create service
5. Apply template configuration
6. Save instance to database
7. Monitor deployment status
8. Update instance status
9. Send notification to user
```

### Billing Webhook Flow
```
1. Stripe sends webhook
2. Verify webhook signature
3. Parse event data
4. Update subscription status
5. Update user permissions
6. Send confirmation email
7. Log billing event
```

## Security Architecture

### Authentication & Authorization
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │   Server    │    │  Database   │
└─────────────┘    └─────────────┘    └─────────────┘
       │                  │                  │
       │ POST /login      │                  │
       ├─────────────────►│                  │
       │                  │ Verify password  │
       │                  ├─────────────────►│
       │                  │ User data        │
       │                  │◄─────────────────┤
       │ JWT tokens       │                  │
       │◄─────────────────┤                  │
       │                  │                  │
       │ API request      │                  │
       │ + Bearer token   │                  │
       ├─────────────────►│                  │
       │                  │ Verify JWT       │
       │                  │ Get user role    │
       │                  ├─────────────────►│
       │ Authorized       │                  │
       │ response         │                  │
       │◄─────────────────┤                  │
```

### Railway API Security
```
- Мастер-токен хранится в переменных окружения
- Proxy все Railway запросы через наш backend
- Никогда не передавать Railway токен клиенту
- Валидация всех Railway операций
- Rate limiting для Railway API
```

### Database Security
```
- SSL/TLS шифрование соединений
- Row Level Security (RLS) для мультитенанси
- Prepared statements против SQL injection
- Регулярные бэкапы с шифрованием
- Audit logs всех операций
```

## Monitoring & Observability

### Metrics Collection
```
Application Metrics:
- Request/response times
- Error rates
- User registrations
- Template deployments
- Active instances

Business Metrics:
- MRR (Monthly Recurring Revenue)
- Churn rate
- CAC (Customer Acquisition Cost)
- Template popularity
- Resource utilization

Technical Metrics:
- Database performance
- Railway API response times
- Redis hit/miss rates
- Memory/CPU usage
```

### Logging Strategy
```
Structured Logging (JSON):
{
  "timestamp": "2024-01-20T10:30:00Z",
  "level": "info",
  "service": "deployment",
  "user_id": "uuid",
  "action": "create_instance",
  "template_id": "uuid",
  "railway_service_id": "service-123",
  "duration_ms": 1234,
  "status": "success"
}
```

### Error Tracking
```
- Sentry для error tracking
- Custom error boundaries в React
- Structured error responses
- Error categorization и alerts
- Performance monitoring
```

## Deployment Architecture

### Production Environment
```
Railway Services:
├── web-service (Next.js app)
├── postgres-service (PostgreSQL)
├── redis-service (Redis)
└── cron-service (Background jobs)

Environment Variables:
- DATABASE_URL
- REDIS_URL
- RAILWAY_API_TOKEN
- STRIPE_SECRET_KEY
- JWT_SECRET
- SENTRY_DSN
```

### CI/CD Pipeline
```
GitHub Actions:
1. Code push to main branch
2. Run tests (Jest + Playwright)
3. Build Next.js application
4. Run database migrations
5. Deploy to Railway
6. Run smoke tests
7. Send deployment notification
```

### Scaling Strategy
```
Horizontal Scaling:
- Multiple Next.js instances
- PostgreSQL read replicas
- Redis clustering
- CDN для статических файлов

Vertical Scaling:
- Увеличение RAM/CPU по мере роста
- Railway автоскейлинг
- Database connection pooling
- Optimized queries и indexes
```

Эта архитектура обеспечивает масштабируемость, безопасность и производительность Railway SaaS Platform.
