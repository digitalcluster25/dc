# USER_MODULE - Template Catalog Components

Компоненты для каталога шаблонов с поиском, фильтрацией и деплоем.

## Компоненты

### TemplateCatalog.tsx
Основной компонент каталога:
- Интеграция с template API
- Поиск и фильтрация
- Grid/List view modes
- Error handling

### TemplateCard.tsx
Карточка шаблона:
- Preview изображения
- Template информация
- Rating и статистика
- Deploy и Preview кнопки
- Resource requirements
- Price tier badges

### TemplateListItem.tsx
Элемент списка (альтернативный view):
- Компактный горизонтальный layout
- Все основные данные шаблона
- Quick actions

### CategoryFilter.tsx
Фильтр по категориям:
- Динамическая загрузка категорий
- Template count для каждой категории
- Icons для категорий
- Active state индикация

### TemplateSearch.tsx
Компонент поиска:
- Real-time search
- Clear functionality
- Debounced input

### TemplateSort.tsx
Сортировка шаблонов:
- Popular, Newest, Name, Price
- Ascending/Descending order
- Select dropdown interface

### ViewToggle.tsx
Переключение вида:
- Grid view (карточки)
- List view (строки)
- Button group interface

## Диалоги

### DeployDialog.tsx (следующий файл)
### TemplatePreviewDialog.tsx (следующий файл)

## Особенности

- Responsive grid layout
- Advanced filtering и search
- Real-time updates
- Error states handling
- Loading states
- Empty states
- shadcn/ui integration
- TypeScript типизация

## Интеграция

- DEPLOYMENT_MODULE для templates API
- AUTH_MODULE для subscription limits
- React Query для data management
- Zustand для UI state

## Использование

```typescript
import { TemplateCatalog } from '@/modules/user/components/templates';

export default function TemplatesPage() {
  return <TemplateCatalog />;
}
```