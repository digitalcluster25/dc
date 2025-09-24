# USER_MODULE - Dashboard Components

Компоненты для главной страницы пользователя (Dashboard).

## Основные компоненты

### Dashboard.tsx
Главный компонент dashboard с интеграцией всех подкомпонентов:
- WebSocket connection
- Error boundary
- Responsive layout
- Conditional rendering для новых/существующих пользователей

### WelcomeCard.tsx  
Приветственная карточка с:
- Персонализированным приветствием
- Отображением подписки и лимитов
- CTA кнопками для действий
- Avatar пользователя

### QuickActions.tsx
Быстрые действия:
- Deploy Template
- My Instances
- Analytics (coming soon)
- Settings, Billing, Support
- Responsive grid layout

### InstancesOverview.tsx
Обзор инстансов пользователя:
- Первые 3 инстанса с подробностями
- Resource usage indicators
- Quick actions (open, settings)
- Link на полный список

### RecentActivity.tsx
Лента последней активности:
- Deployments, restarts, stops
- Временные метки
- Status indicators
- Цветовая кодировка событий

### FeaturedTemplates.tsx (referenced)
Рекомендуемые шаблоны для новых пользователей.

## Особенности

- Полная интеграция с AUTH_MODULE и DEPLOYMENT_MODULE
- Real-time обновления через WebSocket
- Empty states для новых пользователей
- Resource usage visualization
- Mobile-responsive дизайн

## Использование

```typescript
import { Dashboard } from '@/modules/user/components/dashboard';

export default function DashboardPage() {
  return <Dashboard />;
}
```