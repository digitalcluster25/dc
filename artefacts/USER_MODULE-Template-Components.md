# USER_MODULE - Template Catalog Components

Компоненты для каталога шаблонов и системы деплоя.

## Основные компоненты

### TemplateCatalog.tsx
Главная страница каталога с:
- Интеграцией фильтров и поиска
- Grid/List view переключение
- Error handling
- Loading states

### TemplateCard.tsx & TemplateListItem.tsx
Карточки шаблонов с:
- Детальной информацией (цена, ресурсы, рейтинг)
- Preview изображениями
- Deploy и Preview кнопками
- Status indicators (Featured, Coming Soon)

### CategoryFilter.tsx
Фильтрация по категориям:
- Visual category buttons с иконками
- Template count для каждой категории
- Active state indicators

### TemplateSearch.tsx
Поиск по шаблонам:
- Real-time search
- Clear functionality
- Placeholder suggestions

### TemplateSort.tsx & ViewToggle.tsx
Сортировка и отображение:
- Multiple sort options (популярность, дата, цена)
- Ascending/Descending toggle
- Grid/List view switch

## Деплой система

### DeployDialog.tsx
Комплексный диалог развертывания:
- Multi-step форма (Basic, Advanced, Review)
- Environment variables конфигурация
- Resource настройки
- Validation и error handling
- Integration с useDeployment hook

### TemplatePreviewDialog.tsx  
Детальный превью шаблона:
- Image gallery с навигацией
- Tabbed информация (Overview, Specs, Features, Setup)
- Technical specifications
- Feature highlights
- Setup instructions

## Особенности

- Полная интеграция с DEPLOYMENT_MODULE API
- Real-time validation
- Responsive дизайн
- Accessibility support
- Error boundaries
- Loading states
- Optimistic updates

## Использование

```typescript
import { TemplateCatalog } from '@/modules/user/components/templates';

export default function TemplatesPage() {
  return <TemplateCatalog />;
}
```