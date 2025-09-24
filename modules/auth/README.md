# 🔐 AUTH_MODULE

## Описание модуля
Система аутентификации и управления пользователями для Railway SaaS Platform.

## Функциональность
- ✅ Регистрация пользователей
- ✅ Аутентификация (логин/логаут)
- ✅ Управление сессиями (JWT + Refresh tokens)
- ✅ Верификация email
- ✅ Сброс пароля
- ✅ Управление профилем
- ✅ Role-based access control (Admin/User)

## Структура модуля
```
/modules/auth/
├── components/          # React компоненты
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   ├── UserProfile.tsx
│   └── PasswordReset.tsx
├── hooks/              # Пользовательские хуки
│   ├── useAuth.ts
│   └── useUser.ts
├── types/              # TypeScript типы
│   └── auth.types.ts
├── utils/              # Утилиты
│   ├── validation.ts
│   └── constants.ts
├── lib/                # Серверная логика
│   ├── jwt.ts
│   ├── password.ts
│   └── middleware.ts
└── docs/               # Документация
    ├── API_SPEC.md
    ├── DATABASE_SCHEMA.md
    └── COMPONENTS_LIST.md
```

## API Endpoints
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `POST /api/auth/logout` - Выход
- `POST /api/auth/refresh` - Обновление токена
- `POST /api/auth/verify` - Верификация email
- `POST /api/auth/reset` - Сброс пароля
- `GET /api/auth/me` - Текущий пользователь

## Технологии
- **Frontend:** React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL + Drizzle ORM
- **Auth:** JWT + Refresh tokens
- **Validation:** Zod
- **Email:** Resend/SendGrid

## Зависимости
- База данных (PostgreSQL)
- Email service (Resend)
- Redis (для сессий)

## Статус
🔄 В разработке

## Разработчик
Claude Sonnet 4 - 22.09.2025
