# USER_MODULE - Dashboard Components

Компоненты главной страницы пользователя с обзором инстансов и быстрыми действиями.

## Компоненты

### Dashboard.tsx
Основной компонент дашборда:
- Интеграция с AUTH_MODULE
- WebSocket connection для real-time updates
- Layout для новых и существующих пользователей
- Error boundary обработка

### WelcomeCard.tsx
Приветственная карточка:
- Персонализированное приветствие
- Аватар пользователя с fallback
- Информация о подписке и лимитах
- CTA кнопки для новых пользователей

### QuickActions.tsx
Быстрые действия:
- Deploy Template
- My Instances
- Analytics (coming soon)
- Settings
- Billing
- Support
- Hover эффекты и интерактивность

### InstancesOverview.tsx
Обзор инстансов пользователя:
- Список первых 3 инстансов
- Real-time статус обновления
- Resource usage индикаторы
- Quick actions для каждого инстанса
- Empty state для новых пользователей

### RecentActivity.tsx
Лента недавней активности:
- Deployment events
- Instance actions
- Система уведомлений
- Timeline интерфейс

## Особенности

- Responsive design
- Real-time updates через WebSocket
- Error boundary protection
- Loading states
- Empty states для новых пользователей
- shadcn/ui компоненты
- TypeScript типизация

## Интеграция

- AUTH_MODULE для пользовательских данных
- DEPLOYMENT_MODULE для инстансов и шаблонов
- WebSocket для real-time обновлений
- React Query для data fetching

## Использование

```typescript
import { Dashboard } from '@/modules/user/components/dashboard';

export default function DashboardPage() {
  return <Dashboard />;
}
```