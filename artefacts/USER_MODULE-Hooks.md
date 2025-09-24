# USER_MODULE - React Hooks & API Integration

React Query хуки для интеграции с DEPLOYMENT_MODULE API и управления состоянием.

## API Хуки

### useTemplates.ts
- useTemplates() - загрузка всех шаблонов
- useTemplate(id) - загрузка одного шаблона
- useTemplateCategories() - категории шаблонов
- useFeaturedTemplates() - популярные шаблоны

### useInstances.ts
- useInstances() - загрузка инстансов пользователя
- useInstance(id) - загрузка одного инстанса
- useInstanceMetrics(id) - метрики инстанса
- useInstanceActions() - действия с инстансами (start/stop/restart/delete)

### useDeployment.ts
- useDeployment() - деплой новых инстансов
- Real-time progress tracking
- Error handling и recovery

### useWebSocket.ts
- Real-time подключение к DEPLOYMENT_MODULE
- Обновления статуса инстансов
- Deployment progress events
- Notification система

### useUser.ts
- useUserProfile() - профиль пользователя
- useUpdateUserProfile() - обновление профиля
- useUserPreferences() - настройки пользователя
- useUpdateUserPreferences() - обновление настроек

## Особенности

- React Query для кэширования
- Optimistic updates
- Background refetching
- Error handling
- WebSocket integration
- TypeScript типизация
- Custom query keys

## Использование

```typescript
import { useTemplates, useDeployment } from '@/modules/user/hooks';

const MyComponent = () => {
  const { data: templates, isLoading } = useTemplates();
  const { deployInstance, isDeploying } = useDeployment();
  
  const handleDeploy = (templateId: string) => {
    deployInstance.mutate({ template_id: templateId, name: 'my-app' });
  };
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {templates?.map(template => (
        <div key={template.id}>{template.name}</div>
      ))}
    </div>
  );
};
```