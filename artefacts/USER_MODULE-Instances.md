# USER_MODULE - Instance Management Components

Компоненты для управления развернутыми инстансами пользователя.

## Компоненты

### InstanceList.tsx
Основной список инстансов:
- Grid/Table view modes
- Filtering по статусу
- Sorting опции
- Status counts отображение
- Empty states
- Error handling
- Refresh functionality

### InstanceCard.tsx
Карточка инстанса:
- Status indicator с real-time updates
- Resource usage progress bars
- Domain information
- Quick actions (Start/Stop/Settings)
- Dropdown menu с всеми действиями
- Error states отображение
- Copy URL functionality

### InstanceFilters.tsx
Фильтры для инстансов:
- Status filters с counts
- Sort by options
- Active filter indication
- Badge counters

### InstanceActionsDialog.tsx
Confirmation диалоги для действий:
- Restart confirmation
- Delete confirmation с предупреждением
- Destructive action styling
- Cancel/Confirm buttons

### InstanceTableView.tsx (не показан, но упомянут)
Табличное представление инстансов для desktop.

## Actions Поддерживаемые

- **Start** - запуск остановленного инстанса
- **Stop** - остановка работающего инстанса  
- **Restart** - перезапуск с confirmation
- **Delete** - удаление с предупреждением
- **Open Site** - переход на сайт инстанса
- **Copy URL** - копирование URL в буфер
- **View Details** - переход к детальной странице
- **Settings** - настройки инстанса

## Status Management

```typescript
type InstanceStatus = 
  | 'deploying'    // 🔄 Разворачивается  
  | 'running'      // ✅ Работает
  | 'stopped'      // ⏸️ Остановлен
  | 'error'        // ❌ Ошибка
  | 'maintenance'  // 🔧 Обслуживание
  | 'scaling';     // 📈 Масштабируется
```

## Real-time Updates

- WebSocket integration для status updates
- Optimistic UI updates
- Progress bars для resource usage
- Error notifications

## Особенности

- Responsive design (cards на mobile, table на desktop)
- Real-time status updates
- Resource usage visualization
- Domain management
- Error handling с recovery options
- Loading states для всех actions
- Toast notifications для feedback
- shadcn/ui components
- TypeScript типизация

## Интеграция

- useInstances() для загрузки данных
- useInstanceActions() для управления
- useWebSocket() для real-time updates
- React Query для caching и refetching

## Использование

```typescript
import { InstanceList } from '@/modules/user/components/instances';

export default function InstancesPage() {
  return <InstanceList />;
}
```