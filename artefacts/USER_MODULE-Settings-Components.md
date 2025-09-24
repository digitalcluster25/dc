# USER_MODULE - Settings Components

Компоненты для управления настройками аккаунта пользователя.

## Основные компоненты

### AccountSettings.tsx
Главная страница настроек с:
- Tabbed navigation (Profile, Security, Preferences, API Keys, Billing)
- Responsive tab design
- Icon integration
- Error boundary protection

### ProfileSettings.tsx
Настройки профиля:
- Avatar upload (placeholder)
- Personal information форма
- Real-time validation
- Form integration с React Hook Form
- Integration с useUpdateUserProfile hook

### SecuritySettings.tsx
Настройки безопасности:
- Security overview dashboard
- Password change form
- Two-factor authentication toggle
- Active sessions management
- Security status indicators

### PreferenceSettings.tsx
Пользовательские предпочтения:
- Theme selection (Light, Dark, System)
- Language и timezone settings
- Notification preferences
- UI customization options
- Integration с useUserStore

### BillingSettings.tsx (Placeholder)
Placeholder для billing функций:
- "Coming Soon" message
- Integration point для BILLING_MODULE
- Consistent styling с остальными settings

### ApiKeySettings.tsx (Placeholder)
Placeholder для API key управления:
- "Coming Soon" message  
- Integration point для API_MODULE
- Future API key functionality

## Security Features

### Security Overview
- Strong password check
- Two-factor authentication status
- Recent login activity monitoring
- Email verification status
- Visual security indicators

### Session Management
- Current session identification
- Active sessions list
- Session revocation
- Auto-logout settings
- Device/location information

## Notification System

Поддерживаемые типы уведомлений:
- **Deployment Updates** - статус деплоев
- **Billing Notifications** - счета и подписки
- **Security Alerts** - важные security события
- **Marketing Emails** - продуктовые обновления
- **Weekly Reports** - usage статистика

## Особенности

- React Hook Form integration
- Zod validation schemas
- Real-time form validation
- Optimistic updates
- Error handling с toast notifications
- Responsive design
- Accessibility support
- Integration с USER_MODULE stores

## Использование

```typescript
import { AccountSettings } from '@/modules/user/components/settings';

export default function SettingsPage() {
  return <AccountSettings />;
}
```