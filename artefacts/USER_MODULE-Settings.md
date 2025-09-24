# USER_MODULE - Settings Components

Компоненты для настроек пользователя и управления аккаунтом.

## Компоненты

### AccountSettings.tsx
Основной компонент настроек:
- Tab navigation (Profile, Security, Preferences, API Keys, Billing)
- Responsive tabs
- Icons для каждой секции
- Error boundary protection

### ProfileSettings.tsx
Настройки профиля:
- Avatar upload (placeholder)
- Personal information form
- Bio и website fields
- Location setting
- Form validation с react-hook-form
- Update mutations с React Query

### SecuritySettings.tsx
Настройки безопасности:
- Security overview dashboard
- Password change form
- Two-factor authentication toggle
- Active sessions management
- Security recommendations
- Strong validation requirements

### PreferenceSettings.tsx
Пользовательские настройки:
- Theme selection (Light/Dark/System)
- Language и timezone
- Notification preferences
- Email settings toggles
- Auto-save functionality

### BillingSettings.tsx
Billing настройки (placeholder):
- Coming soon indicator
- Integration с BILLING_MODULE
- Subscription overview placeholder

### ApiKeySettings.tsx
API ключи (placeholder):
- Coming soon indicator  
- Integration с API_MODULE
- Key management placeholder

## Формы и Валидация

### Profile Form Schema
```typescript
const profileSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  bio: z.string().max(500).optional(),
  website: z.string().url().optional().or(z.literal('')),
  location: z.string().max(100).optional(),
});
```

### Password Change Schema
```typescript
const passwordSchema = z.object({
  current_password: z.string().min(1),
  new_password: z.string().min(8),
  confirm_password: z.string(),
}).refine(data => data.new_password === data.confirm_password);
```

## Особенности

- Multi-tab interface
- Form validation
- Real-time preview
- Theme switching
- Notification management
- Security overview
- Session management
- Progressive enhancement
- Responsive design
- shadcn/ui components
- TypeScript типизация

## Интеграция

- useUserProfile() для загрузки профиля
- useUpdateUserProfile() для обновлений
- useUserPreferences() для настроек
- AUTH_MODULE для пользовательских данных
- Zustand для theme management

## Placeholder Модули

Некоторые секции показывают "Coming Soon" состояния для модулей, которые будут реализованы позже:
- **BILLING_MODULE** - полное управление подпиской
- **API_MODULE** - управление API ключами

## Использование

```typescript
import { AccountSettings } from '@/modules/user/components/settings';

export default function SettingsPage() {
  return <AccountSettings />;
}
```

## Security Features

- Password strength validation
- Two-factor authentication (UI ready)
- Session management
- Security audit dashboard
- Login activity tracking
- Auto-logout options