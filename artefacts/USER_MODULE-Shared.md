# USER_MODULE - Shared Components & Utils

Переиспользуемые компоненты и утилиты для всего USER_MODULE.

## Shared Components

### LoadingSpinner.tsx
Спиннер загрузки:
- Разные размеры (sm, md, lg)
- Опциональный текст
- Центрирование
- Lucide-react icon

### ErrorBoundary.tsx
Error boundary для обработки ошибок:
- Fallback UI при ошибках
- Development mode детали
- Refresh functionality
- Graceful error handling

### EmptyState.tsx
Empty states для списков:
- Кастомизируемая иконка
- Заголовок и описание
- Опциональное действие (кнопка)
- Центрированный layout

### StatusBadge.tsx
Бейджи статусов:
- Разные статусы инстансов
- Цветовое кодирование
- Иконки для каждого статуса
- Consistent styling

### ProgressBar.tsx
Progress индикаторы:
- Resource usage bars
- Разные цвета (default, success, warning, error)
- Размеры и labels
- Percentage отображение

### InfoCard.tsx
Информационные карточки:
- Статистика и метрики
- Icons и trends
- Responsive design
- Consistent spacing

### CopyButton.tsx
Кнопка копирования в буфер:
- Success state indication
- Toast notifications
- Fallback для старых браузеров
- Accessible design

### ConfirmDialog.tsx
Диалог подтверждения:
- Destructive и default варианты
- Warning icons
- Custom text
- Alert dialog base

## Utils & Formatters

### formatters.ts
Функции форматирования:
- Currency (USD, EUR, etc.)
- Dates (relative, absolute)
- File sizes (B, KB, MB, GB)
- Memory (MB, GB)
- Duration (seconds to readable)
- Numbers и percentages
- Template slugs
- Domain extraction

### validators.ts
Zod схемы валидации:
- Instance names
- Domain names
- Email addresses
- Passwords
- Environment variables
- Resource limits
- User profiles

### constants.ts
Константы приложения:
- Instance statuses
- Template categories
- Pricing tiers
- API endpoints
- Resource limits
- UI dimensions
- Themes
- WebSocket events
- Storage keys
- Error/Success messages

### helpers.ts
Утилитарные функции:
- Class name combining (cn)
- Random ID generation
- Instance name suggestions
- Action permissions
- Status colors
- Debounce/throttle
- Clipboard operations
- Mobile detection
- User initials
- API error formatting
- Resource parsing

## Особенности

- TypeScript типизация
- shadcn/ui integration
- Responsive design
- Accessibility support
- Error handling
- Loading states
- Consistent styling
- Performance optimization

## Использование

```typescript
import { 
  LoadingSpinner, 
  EmptyState, 
  StatusBadge,
  formatters,
  validators,
  constants,
  helpers
} from '@/modules/user/components/shared';

// Components
<LoadingSpinner size="lg" text="Loading instances..." />
<StatusBadge status="running" showIcon />
<EmptyState 
  icon={Server}
  title="No instances"
  description="Deploy your first template"
/>

// Utils
const formattedDate = formatters.date(new Date());
const isValidName = validators.instanceName.safeParse(name);
const status = constants.INSTANCE_STATUS.RUNNING;
const className = helpers.cn('base-class', active && 'active');
```