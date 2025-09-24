# 👤 USER_MODULE - Architecture & Planning

**📅 Дата создания:** 23.09.2025  
**🎯 Цель:** Создание пользовательского интерфейса Railway SaaS Platform  
**⚡ Статус:** В разработке  

---

## 🏗️ Архитектура USER_MODULE

### 📋 Основные компоненты
```
USER_MODULE/
├── 🏠 Dashboard - главная страница пользователя
├── 📚 Template Catalog - каталог доступных шаблонов  
├── 🚀 Instance Management - управление развернутыми инстансами
├── ⚙️ Account Settings - настройки профиля и аккаунта
├── 💰 Billing Interface - отображение подписки и использования
├── 📊 Usage Analytics - метрики и статистика
├── 🆘 Support Interface - техподдержка и помощь
└── 📱 Mobile Responsive - адаптивный дизайн
```

### 🔗 Интеграции
```
✅ AUTH_MODULE - аутентификация пользователей
✅ DEPLOYMENT_MODULE - API для управления инстансами  
📋 BILLING_MODULE - будет интегрировано позже
🎨 shadcn/ui - компоненты дизайн-системы
```

---

## 🎨 UI/UX Концепция

### Design System: shadcn/ui
```typescript
// Основные компоненты
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog } from '@/components/ui/dialog'
import { Table } from '@/components/ui/table'
import { Tabs } from '@/components/ui/tabs'
import { Form } from '@/components/ui/form'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Loading } from '@/components/ui/loading'
```

### Цветовая схема
```css
/* Primary Colors - Railway Blue */
--primary: 214 84% 56%;        /* #3b82f6 */  
--primary-foreground: 0 0% 98%; /* #fafafa */

/* Secondary Colors */  
--secondary: 220 14% 96%;      /* #f1f5f9 */
--secondary-foreground: 220 9% 46%; /* #64748b */

/* Accent Colors */
--accent: 142 76% 36%;         /* #10b981 (success) */
--destructive: 0 84% 60%;      /* #ef4444 (error) */
--warning: 38 92% 50%;         /* #f59e0b */
```

### Темная тема поддержка
```css
[data-theme="dark"] {
  --background: 222 84% 5%;     /* #0f172a */
  --foreground: 210 40% 98%;    /* #f8fafc */
  --primary: 214 84% 56%;       /* #3b82f6 */
}
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile First Design */
sm: '640px',   /* Планшеты */
md: '768px',   /* Планшеты большие */  
lg: '1024px',  /* Десктоп */
xl: '1280px',  /* Десктоп большой */
2xl: '1536px'  /* 4K мониторы */
```

---

## 🏠 Dashboard Layout

### Структура страницы
```
┌─────────────────────────────────────┐
│ Header (Navigation + User Menu)     │
├─────────────────────────────────────┤
│ Sidebar   │ Main Content Area      │
│ - Dashboard│ ┌─────────────────────┐ │
│ - Templates│ │ Welcome Card        │ │
│ - Instances│ │                     │ │  
│ - Settings │ ├─────────────────────┤ │
│ - Billing  │ │ Quick Actions       │ │
│ - Support  │ │                     │ │
│           │ ├─────────────────────┤ │
│           │ │ Recent Activity     │ │
│           │ │                     │ │
│           │ └─────────────────────┘ │
└─────────────────────────────────────┘
```

### Mobile Layout (< 768px)
```
┌─────────────────────┐
│ Mobile Header       │
│ (+ Hamburger Menu)  │  
├─────────────────────┤
│ Main Content        │
│ (Стек карточек)     │
│                     │
│                     │
│                     │
└─────────────────────┘
```

---

## 📚 Template Catalog

### Категории шаблонов
```typescript
interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  templates: Template[];
}

const categories = [
  {
    id: 'cms',
    name: 'CMS & Blogs', 
    description: 'WordPress, Ghost, Strapi',
    icon: FileText,
    color: 'bg-blue-500'
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    description: 'WooCommerce, Shopify, Medusa', 
    icon: ShoppingCart,
    color: 'bg-green-500'
  },
  {
    id: 'apps',
    name: 'Web Apps',
    description: 'React, Next.js, Vue, Nuxt',
    icon: Code,  
    color: 'bg-purple-500'
  },
  {
    id: 'api',
    name: 'Backend API',
    description: 'Node.js, Python, Go, PHP',
    icon: Server,
    color: 'bg-orange-500' 
  },
  {
    id: 'database',
    name: 'Databases', 
    description: 'PostgreSQL, MongoDB, Redis',
    icon: Database,
    color: 'bg-red-500'
  }
];
```

### Template Card Design
```
┌─────────────────────────┐
│ [Icon] Template Name    │
│                         │
│ Short description text  │
│ that explains what this │
│ template provides.      │
│                         │
│ [Badge: Category]       │
│ [Badge: Price Tier]     │
│                         │  
│ Resources: 1GB RAM      │
│ Setup time: ~5 min      │
│                         │
│ [Deploy] [Preview]      │
└─────────────────────────┘
```

---

## 🚀 Instance Management

### Instance States
```typescript
type InstanceStatus = 
  | 'deploying'    // 🔄 Разворачивается  
  | 'running'      // ✅ Работает
  | 'stopped'      // ⏸️ Остановлен
  | 'error'        // ❌ Ошибка
  | 'maintenance'  // 🔧 Обслуживание
  | 'scaling';     // 📈 Масштабируется
```

### Instance Card Design
```
┌─────────────────────────────────────┐
│ [Status Badge] Instance Name        │  
│ wordpress-blog-001                  │
│                                     │
│ Template: WordPress CMS             │
│ Created: 2 days ago                 │
│ Domain: blog.example.com           │
│                                     │
│ Resources:                          │
│ ████████░░ CPU 80% | RAM 1.2GB     │
│                                     │
│ [Open] [Settings] [•••Menu]        │
└─────────────────────────────────────┘
```

### Instance Actions Menu
```
┌─────────────────┐
│ 🔗 Open Site    │
│ ⚙️ Settings     │  
│ 📊 Analytics    │
│ 🔄 Restart      │
│ ⏸️ Stop         │
│ 📋 Logs         │
│ 🗑️ Delete       │
└─────────────────┘
```

---

## ⚙️ Account Settings

### Settings Sections
```typescript
interface SettingsSection {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType;
}

const settingsSections = [
  {
    id: 'profile',
    title: 'Profile Information',
    description: 'Update your personal details',
    component: ProfileSettings
  },
  {
    id: 'security', 
    title: 'Security',
    description: 'Password and two-factor auth',
    component: SecuritySettings
  },
  {
    id: 'preferences',
    title: 'Preferences', 
    description: 'Theme, notifications, language',
    component: PreferenceSettings
  },
  {
    id: 'api',
    title: 'API Keys',
    description: 'Manage your API access',  
    component: ApiKeySettings
  }
];
```

---

## 💰 Billing Interface (Placeholder)

### Current Subscription Display
```
┌─────────────────────────────────────┐
│ Current Plan: Pro ($25/month)       │
│                                     │
│ Instances: 3/5 used                 │
│ ████████░░ 60%                     │
│                                     │  
│ Storage: 12GB/50GB used             │
│ ███░░░░░░░ 24%                     │
│                                     │
│ Next billing: Oct 23, 2025         │
│                                     │
│ [Upgrade] [Manage Billing]         │
└─────────────────────────────────────┘
```

---

## 📊 State Management

### Zustand Global Store
```typescript
interface UserStore {
  // User state
  user: User | null;
  subscription: Subscription | null;
  
  // Templates
  templates: Template[];
  selectedCategory: string;
  
  // Instances  
  instances: Instance[];
  deployingInstances: string[];
  
  // UI state
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  
  // Actions
  setUser: (user: User) => void;
  loadTemplates: () => Promise<void>;
  loadInstances: () => Promise<void>;
  deployInstance: (templateId: string, config: any) => Promise<void>;
  toggleSidebar: () => void;
}
```

### React Query Keys
```typescript
export const queryKeys = {
  user: ['user'] as const,
  templates: ['templates'] as const,
  template: (id: string) => ['template', id] as const,
  instances: ['instances'] as const, 
  instance: (id: string) => ['instance', id] as const,
  usage: ['usage'] as const,
  billing: ['billing'] as const,
} as const;
```

---

## 🔄 Real-time Updates

### WebSocket Integration  
```typescript
// Подключение к WebSocket из DEPLOYMENT_MODULE
const useWebSocket = () => {
  const updateInstance = useUserStore(state => state.updateInstance);
  
  useEffect(() => {
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL!);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'instance_status_update') {
        updateInstance(data.instanceId, {
          status: data.status,
          ...(data.error && { error: data.error })
        });
      }
    };
    
    return () => ws.close();
  }, [updateInstance]);
};
```

---

## 🧪 Testing Strategy

### Component Tests
```typescript
// Dashboard.test.tsx
describe('Dashboard', () => {
  it('shows welcome message for new users', () => {
    render(<Dashboard user={newUser} />);
    expect(screen.getByText(/welcome to railway saas/i)).toBeInTheDocument();
  });
  
  it('displays user instances', () => {
    render(<Dashboard user={userWithInstances} />);
    expect(screen.getByText('My Instances')).toBeInTheDocument();
  });
});

// TemplateCard.test.tsx  
describe('TemplateCard', () => {
  it('shows deploy button for valid subscription', () => {
    render(<TemplateCard template={wordpressTemplate} canDeploy={true} />);
    expect(screen.getByText('Deploy')).toBeEnabled();
  });
});
```

### Integration Tests
```typescript
// user-flow.test.tsx
describe('User Flow', () => {
  it('should deploy WordPress template', async () => {
    // 1. Login  
    await loginUser('test@example.com', 'password');
    
    // 2. Navigate to templates
    fireEvent.click(screen.getByText('Templates'));
    
    // 3. Select WordPress
    const wordpressCard = screen.getByText('WordPress CMS');
    fireEvent.click(wordpressCard);
    
    // 4. Configure and deploy
    fireEvent.change(screen.getByLabelText('Site Name'), {
      target: { value: 'My Blog' }
    });
    fireEvent.click(screen.getByText('Deploy'));
    
    // 5. Check deployment started
    await waitFor(() => {
      expect(screen.getByText('Deployment started')).toBeInTheDocument();
    });
  });
});
```

---

## 📂 File Structure

```
/modules/user/
├── components/
│   ├── dashboard/
│   │   ├── Dashboard.tsx
│   │   ├── WelcomeCard.tsx  
│   │   ├── QuickActions.tsx
│   │   ├── RecentActivity.tsx
│   │   └── index.ts
│   ├── templates/
│   │   ├── TemplateCatalog.tsx
│   │   ├── TemplateCard.tsx
│   │   ├── CategoryFilter.tsx
│   │   ├── DeployDialog.tsx
│   │   └── index.ts
│   ├── instances/
│   │   ├── InstanceList.tsx
│   │   ├── InstanceCard.tsx  
│   │   ├── InstanceActions.tsx
│   │   ├── InstanceSettings.tsx
│   │   └── index.ts
│   ├── settings/
│   │   ├── AccountSettings.tsx
│   │   ├── ProfileSettings.tsx
│   │   ├── SecuritySettings.tsx
│   │   └── index.ts
│   ├── layout/  
│   │   ├── UserLayout.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── Navigation.tsx
│   │   └── index.ts
│   └── shared/
│       ├── LoadingSpinner.tsx
│       ├── ErrorBoundary.tsx
│       ├── EmptyState.tsx
│       └── index.ts
├── hooks/
│   ├── useTemplates.ts
│   ├── useInstances.ts  
│   ├── useDeployment.ts
│   ├── useWebSocket.ts
│   └── index.ts
├── store/
│   ├── userStore.ts
│   ├── templateStore.ts
│   ├── instanceStore.ts
│   └── index.ts
├── types/
│   ├── user.types.ts
│   ├── template.types.ts
│   ├── instance.types.ts
│   └── index.ts
└── utils/
    ├── formatters.ts
    ├── validators.ts  
    ├── constants.ts
    └── index.ts
```

---

## 🎯 MVP Features Priority

### Phase 1: Core Dashboard (Неделя 1)
- ✅ Базовый Dashboard layout
- ✅ Navigation и Sidebar
- ✅ User profile display  
- ✅ Responsive design

### Phase 2: Template Catalog (Неделя 1-2)
- ✅ Template grid с карточками
- ✅ Category filtering
- ✅ Search functionality
- ✅ Deploy dialog

### Phase 3: Instance Management (Неделя 2)  
- ✅ Instance list с статусами
- ✅ Real-time status updates
- ✅ Basic instance actions
- ✅ WebSocket integration

### Phase 4: Settings & Polish (Неделя 2-3)
- ✅ Account settings
- ✅ Theme switching  
- ✅ Error handling
- ✅ Loading states

---

## 🚀 Integration Points

### AUTH_MODULE Integration
```typescript
// Использование готового auth
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { requireAuth } from '@/modules/auth/lib/middleware';

const Dashboard = () => {
  const { user, logout } = useAuth();
  
  return (
    <UserLayout user={user}>
      <DashboardContent />
    </UserLayout>
  );
};
```

### DEPLOYMENT_MODULE Integration
```typescript  
// Использование готовых API endpoints
const useTemplates = () => {
  return useQuery({
    queryKey: queryKeys.templates,
    queryFn: () => fetch('/api/templates').then(res => res.json())
  });
};

const useCreateInstance = () => {
  return useMutation({
    mutationFn: (data: CreateInstanceData) => 
      fetch('/api/instances/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => res.json())
  });
};
```

---

## 🎯 Success Metrics

### Technical Metrics
- **Page Load Time:** < 2 seconds
- **Component Render Time:** < 100ms  
- **API Response Time:** < 200ms
- **WebSocket Latency:** < 50ms
- **Bundle Size:** < 500KB (gzipped)

### UX Metrics  
- **Template Deployment:** < 30 seconds
- **Navigation Speed:** Instant (SPA routing)
- **Mobile Usability:** 100% responsive
- **Accessibility:** WCAG 2.1 AA compliant

### Business Metrics
- **Template Discovery:** Высокий CTR на Deploy
- **User Engagement:** Время сессии > 5 минут
- **Feature Usage:** Все основные функции используются
- **User Satisfaction:** Positive feedback

---

**🎯 USER_MODULE готов к разработке!**

Архитектура спланирована с учетом готовых AUTH_MODULE и DEPLOYMENT_MODULE.
Использование shadcn/ui обеспечит современный и консистентный дизайн.
Модульная структура позволит легко поддерживать и расширять функционал.

**Следующий шаг:** Создание основных компонентов и их имплементация! 🚀