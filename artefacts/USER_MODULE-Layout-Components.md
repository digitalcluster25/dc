# USER_MODULE - Layout Components

Основные layout компоненты для пользовательского интерфейса Railway SaaS Platform.

## Компоненты

### UserLayout.tsx
Главный layout компонент, который обертывает все страницы пользователя.

### Header.tsx  
Верхняя панель с навигацией, поиском и пользовательским меню.

### Sidebar.tsx
Боковая панель с основной навигацией и быстрыми действиями.

### Navigation.tsx
Горизонтальная навигация для мобильных устройств и дополнительных контекстов.

## Основные функции

- Responsive дизайн с адаптивным sidebar
- Интеграция с темной темой
- Поддержка мобильных устройств
- Интеграция с AUTH_MODULE для отображения пользователя
- WebSocket подключение для real-time уведомлений

## Использование

```typescript
import { UserLayout } from '@/modules/user/components/layout';

export default function Page() {
  return (
    <UserLayout>
      <YourPageContent />
    </UserLayout>
  );
}
```