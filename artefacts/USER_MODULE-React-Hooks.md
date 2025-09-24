# USER_MODULE - React Hooks & API Integration

Система React хуков для интеграции с API и управления состоянием.

## Основные хуки

### useTemplates.ts
- Загрузка списка шаблонов
- Поиск и фильтрация
- Категории шаблонов  
- Детали отдельного шаблона
- React Query интеграция

### useInstances.ts
- Управление инстансами пользователя
- CRUD операции (start, stop, restart, delete)
- Real-time обновления статусов
- Метрики и мониторинг
- Batch операции

### useDeployment.ts
- Создание новых инстансов
- Прогресс деплоя
- Error handling
- WebSocket integration для real-time обновлений

### useWebSocket.ts
- Real-time подключения
- Обработка сообщений
- Reconnection logic
- Event handling для обновлений инстансов

### useUser.ts
- Профиль пользователя
- Обновление настроек
- Preferences управление
- Интеграция с AUTH_MODULE

## Особенности

- React Query для кеширования
- Optimistic updates
- Error boundaries
- TypeScript типизация
- Retry логика
- Real-time updates

## Использование

```typescript
import { useTemplates, useInstances } from '@/modules/user/hooks';

const MyComponent = () => {
  const { data: templates, isLoading } = useTemplates();
  const { data: instances } = useInstances();
  
  return <div>Templates: {templates?.length}</div>;
};
```