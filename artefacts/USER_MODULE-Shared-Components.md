# USER_MODULE - Shared Components & Utils

Переиспользуемые компоненты и утилиты для USER_MODULE.

## Shared Components

### LoadingSpinner.tsx
Компонент загрузки с:
- Размеры (sm, md, lg)
- Optional текст
- Кастомные стили
- Accessibility support

### ErrorBoundary.tsx
Error boundary класс с:
- Graceful error handling
- Development error details
- Refresh page functionality
- Custom fallback support

### EmptyState.tsx
Пустые состояния с:
- Кастомными иконками
- Descriptive messaging
- Optional action buttons
- Consistent styling

### StatusBadge.tsx
Унифицированные status badges:
- Color-coded статусы
- Icon integration
- Consistent sizing
- Theme support

### ProgressBar.tsx
Progress indicators с:
- Multiple sizes
- Color variants (success, warning, error)
- Percentage display
- Label support

### InfoCard.tsx
Information cards с:
- Icon support
- Trend indicators
- Flexible content
- Responsive design

### CopyButton.tsx
Copy to clipboard functionality:
- Success state animation
- Toast notifications
- Multiple variants
- Accessibility support

### ConfirmDialog.tsx
Confirmation dialogs с:
- Destructive action warnings
- Custom messaging
- Button variants
- Warning icons

## Utils & Helpers

### formatters.ts
Форматирование данных:
- Currency formatting
- Date/time utilities
- File size conversion
- Memory formatting
- Duration calculations
- Domain extraction

### validators.ts
Validation utilities:
- Zod schemas для всех форм
- Instance name validation
- Domain validation
- Resource limit validation
- Environment variable validation

### constants.ts
Системные константы:
- Status enums
- API endpoints
- Resource limits
- UI configurations
- Error messages

### helpers.ts
Вспомогательные функции:
- Class name utilities (cn)
- ID generation
- Action permissions
- Color utilities
- Debounce/throttle
- Clipboard operations

## Особенности

- TypeScript типизация
- Consistent API design
- Accessibility support
- Theme compatibility
- Mobile responsiveness
- Error resilience

## Использование

```typescript
import { 
  LoadingSpinner, 
  StatusBadge, 
  formatters,
  helpers 
} from '@/modules/user/components/shared';

// Usage examples
<LoadingSpinner size="lg" text="Loading..." />
<StatusBadge status="running" />

const formattedPrice = formatters.currency(25.99);
const className = helpers.cn('base-class', conditionalClass);
```