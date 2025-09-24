# USER_MODULE - Deploy & Preview Dialogs

Модальные окна для деплоя шаблонов и просмотра их деталей.

## Компоненты

### DeployDialog.tsx
Диалог деплоя нового инстанса:

**Функциональность:**
- Multi-step форма (Basic, Advanced, Review)
- Валидация с react-hook-form и zod
- Environment variables настройка
- Resource configuration
- Custom domain setup
- Real-time deployment progress
- Subscription limits проверка

**Шаги:**
1. **Basic** - имя, описание, домен, auto-deploy
2. **Advanced** - env variables, resources
3. **Review** - итоговая информация и подтверждение

**Интеграция:**
- DEPLOYMENT_MODULE API для создания инстансов
- AUTH_MODULE для subscription limits
- Real-time progress через WebSocket

### TemplatePreviewDialog.tsx
Диалог превью шаблона:

**Функциональность:**
- Detailed template information
- Image gallery с navigation
- Multi-tab interface (Overview, Specs, Features, Setup)
- Technical specifications
- Feature highlights
- Setup instructions
- Direct deploy integration

**Табы:**
1. **Overview** - описание, статистика, tags
2. **Specs** - технические характеристики, env variables
3. **Features** - что включено, безопасность
4. **Setup** - пошаговые инструкции

## Особенности

- Responsive modal design
- Multi-step wizards
- Form validation с Zod
- Real-time deployment tracking
- Error handling и recovery
- Loading states
- Success/error feedback
- shadcn/ui dialogs
- TypeScript типизация

## Валидация

```typescript
const deploySchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
  custom_domain: z.string().optional(),
  environment_variables: z.record(z.string()).optional(),
  resource_config: z.object({
    cpu_limit: z.string().optional(),
    memory_limit: z.string().optional(),
    storage_limit: z.string().optional(),
  }).optional(),
  auto_deploy: z.boolean().default(true),
});
```

## Интеграция

- useDeployment() hook для API calls
- useAuth() для subscription validation
- Form handling с react-hook-form
- Toast notifications для feedback

## Использование

Диалоги вызываются из TemplateCard/TemplateListItem компонентов при клике на Deploy или Preview кнопки.