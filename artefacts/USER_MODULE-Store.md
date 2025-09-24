# USER_MODULE - Zustand Store & State Management

Система управления состоянием для USER_MODULE с использованием Zustand.

## Store Архитектура

### userStore.ts
Основной store для пользовательского состояния:
- User information
- UI состояние (sidebar, theme)
- Loading и error states
- Глобальные actions

### templateStore.ts  
Store для управления шаблонами:
- Templates catalog
- Categories
- Filtering и sorting
- Search functionality

### instanceStore.ts
Store для управления инстансами:
- Instance list
- Metrics данные
- Filtering и view modes
- Loading states для actions

## Особенности

- TypeScript типизация
- DevTools integration
- Persistent состояние для UI preferences
- Optimistic updates
- Error handling

## Использование

```typescript
import { useUserStore } from '@/modules/user/store/userStore';

const MyComponent = () => {
  const { user, theme, setTheme } = useUserStore();
  
  return (
    <div>User: {user?.name}</div>
  );
};
```