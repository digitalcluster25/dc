# USER_MODULE - TypeScript Types & Interfaces

Полная типизация для USER_MODULE с интерфейсами для всех сущностей.

## Основные типы

### user.types.ts
- User interface
- Subscription interface  
- UserPreferences interface
- ApiKey interface

### template.types.ts
- Template interface
- TemplateCategory interface
- TemplateConfigSchema interface
- TemplateEnvVar interface

### instance.types.ts
- Instance interface
- InstanceStatus types
- InstanceDomain interface
- InstanceMetrics interface
- InstanceResourceUsage interface

### deployment.types.ts
- DeploymentRequest interface
- DeploymentResponse interface
- DeploymentProgress interface
- DeploymentStep interface

### billing.types.ts
- UsageData interface
- Invoice interface
- InvoiceLineItem interface

### analytics.types.ts
- UserAnalytics interface
- Resource usage tracking
- Performance metrics

### support.types.ts
- SupportTicket interface
- SupportResponse interface
- SupportAttachment interface

### api.types.ts
- ApiResponse generic
- ApiError interface
- Pagination parameters
- Search parameters

### websocket.types.ts
- WebSocketMessage interface
- Real-time update types
- Notification messages

## Особенности

- Строгая типизация
- Generic типы для API responses
- Union types для статусов
- Optional и required поля
- Extends и utility types

## Использование

```typescript
import { User, Instance, Template } from '@/modules/user/types';

const processUser = (user: User): void => {
  console.log(user.name);
};
```