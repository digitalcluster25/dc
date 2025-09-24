# USER_MODULE - Instance Management Components

Компоненты для управления развернутыми инстансами пользователя.

## Основные компоненты

### InstanceList.tsx
Главная страница управления инстансами:
- Grid/Table view modes
- Filtering system
- Status overview
- Empty states для новых пользователей
- Integration с useInstances hook

### InstanceCard.tsx
Карточка инстанса с:
- Status indicators с цветовой кодировкой
- Resource usage progress bars
- Quick actions menu
- Error state отображение
- Real-time updates

### InstanceFilters.tsx  
Система фильтрации:
- Status-based фильтры с счетчиками
- Sort options
- Active filter indicators
- Responsive button layout

### InstanceActionsDialog.tsx
Confirmation диалоги для:
- Restart инстанса
- Delete инстанса
- Warning states для destructive actions

### InstanceTableView.tsx (referenced)
Табличное отображение инстансов для desktop.

## Instance Actions

Поддерживаемые действия:
- **Start/Stop** - управление состоянием
- **Restart** - перезапуск с confirmation
- **Delete** - удаление с предупреждением
- **Open Site** - переход на развернутый сайт
- **View Settings** - детальные настройки
- **Copy URL** - копирование ссылки

## Status Management

Поддерживаемые статусы:
- `running` - работающий инстанс
- `stopped` - остановленный
- `deploying` - в процессе деплоя
- `error` - ошибка деплоя/работы
- `maintenance` - техобслуживание
- `scaling` - масштабирование

## Особенности

- Real-time status updates через WebSocket
- Resource usage visualization
- Batch operations support
- Error recovery suggestions
- Mobile-responsive design
- Accessibility features

## Использование

```typescript
import { InstanceList } from '@/modules/user/components/instances';

export default function InstancesPage() {
  return <InstanceList />;
}
```