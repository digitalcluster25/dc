# USER_MODULE - Shared Components & Utils

Переиспользуемые компоненты и утилиты для всего USER_MODULE.

## Shared Components

### LoadingSpinner.tsx
Компонент загрузки:
- Размеры: sm/md/lg
- Опциональный текст
- Анимация Loader2

### ErrorBoundary.tsx
Обработка ошибок React:
- Fallback UI с refresh кнопкой
- Development error details
- Production-friendly messages

### EmptyState.tsx
Пустые состояния:
- Customizable icon
- Title и description
- Optional action button
- Consistent styling

### StatusBadge.tsx
Статус badges:
- Instance statuses
- Color coding
- Icon integration
- Variant mapping

### ProgressBar.tsx
Progress компонент:
- Resource usage display
- Color variants (success/warning/error)
- Размеры и labeling
- Percentage display

### InfoCard.tsx
Информационные карточки:
- Icon support
- Trend indicators
- Description text
- Flexible layout

### CopyButton.tsx
Кнопка копирования:
- Clipboard API integration
- Success state animation
- Fallback для старых браузеров
- Toast notifications

### ConfirmDialog.tsx
Confirmation диалоги:
- Customizable content
- Variant support (default/destructive)
- Warning icons
- Consistent API

## Utils & Helpers

### formatters.ts
Форматирование данных:
- Currency, dates, file sizes
- Memory и duration formatting
- Domain extraction
- Text truncation
- Status text formatting

### validators.ts
Zod схемы валидации:
- Instance names
- Domains и URLs
- Environment variables
- Resource limits
- User profile data

### constants.ts
Константы приложения:
- Instance statuses
- Template categories
- API endpoints
- Resource limits
- UI константы
- Error messages

### helpers.ts
Вспомогательные функции:
- Class name merging (cn)
- ID generation
- Action permissions
- Color utilities
- Debounce/throttle
- Clipboard operations

## Особенности

- TypeScript строгая типизация
- Consistent API design
- Accessibility support
- Error handling
- Performance optimizations
- Mobile responsive
- Dark theme support

## Использование

```typescript
import { 
  LoadingSpinner, 
  ErrorBoundary, 
  StatusBadge 
} from '@/modules/user/components/shared';

import { formatters, validators, helpers } from '@/modules/user/utils';

const MyComponent = () => {
  const formattedDate = formatters.date(new Date());
  const isValid = validators.instanceName.safeParse('my-app').success;
  
  return (
    <ErrorBoundary>
      <StatusBadge status="running" />
      <LoadingSpinner size="md" />
    </ErrorBoundary>
  );
};
```