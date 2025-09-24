// components/deployment/atoms/StatusBadge.tsx
import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Loader2,
  Circle 
} from 'lucide-react';

export type InstanceStatus = 
  | 'pending' 
  | 'creating' 
  | 'building' 
  | 'deploying' 
  | 'running' 
  | 'stopped' 
  | 'stopping' 
  | 'starting' 
  | 'updating' 
  | 'failed' 
  | 'deleting';

export type DeploymentStatus = 
  | 'pending' 
  | 'queued' 
  | 'in_progress' 
  | 'success' 
  | 'failed' 
  | 'cancelled' 
  | 'rolled_back';

interface StatusBadgeProps {
  status: InstanceStatus | DeploymentStatus;
  variant?: 'default' | 'outline' | 'dot';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const statusConfig = {
  // Instance statuses
  pending: { 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
    icon: Clock,
    label: 'Pending' 
  },
  creating: { 
    color: 'bg-blue-100 text-blue-800 border-blue-200', 
    icon: Loader2,
    label: 'Creating' 
  },
  building: { 
    color: 'bg-blue-100 text-blue-800 border-blue-200', 
    icon: Loader2,
    label: 'Building' 
  },
  deploying: { 
    color: 'bg-blue-100 text-blue-800 border-blue-200', 
    icon: Loader2,
    label: 'Deploying' 
  },
  running: { 
    color: 'bg-green-100 text-green-800 border-green-200', 
    icon: CheckCircle,
    label: 'Running' 
  },
  stopped: { 
    color: 'bg-gray-100 text-gray-800 border-gray-200', 
    icon: Circle,
    label: 'Stopped' 
  },
  stopping: { 
    color: 'bg-orange-100 text-orange-800 border-orange-200', 
    icon: Loader2,
    label: 'Stopping' 
  },
  starting: { 
    color: 'bg-blue-100 text-blue-800 border-blue-200', 
    icon: Loader2,
    label: 'Starting' 
  },
  updating: { 
    color: 'bg-purple-100 text-purple-800 border-purple-200', 
    icon: Loader2,
    label: 'Updating' 
  },
  failed: { 
    color: 'bg-red-100 text-red-800 border-red-200', 
    icon: XCircle,
    label: 'Failed' 
  },
  deleting: { 
    color: 'bg-red-100 text-red-800 border-red-200', 
    icon: Loader2,
    label: 'Deleting' 
  },
  
  // Deployment statuses
  queued: { 
    color: 'bg-gray-100 text-gray-800 border-gray-200', 
    icon: Clock,
    label: 'Queued' 
  },
  in_progress: { 
    color: 'bg-blue-100 text-blue-800 border-blue-200', 
    icon: Loader2,
    label: 'In Progress' 
  },
  success: { 
    color: 'bg-green-100 text-green-800 border-green-200', 
    icon: CheckCircle,
    label: 'Success' 
  },
  cancelled: { 
    color: 'bg-gray-100 text-gray-800 border-gray-200', 
    icon: XCircle,
    label: 'Cancelled' 
  },
  rolled_back: { 
    color: 'bg-orange-100 text-orange-800 border-orange-200', 
    icon: AlertCircle,
    label: 'Rolled Back' 
  },
};

const sizeConfig = {
  sm: 'text-xs px-2 py-1',
  md: 'text-sm px-2.5 py-1.5',
  lg: 'text-base px-3 py-2',
};

export default function StatusBadge({ 
  status, 
  variant = 'default', 
  size = 'md', 
  showIcon = true,
  className 
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const IconComponent = config.icon;
  const isAnimated = ['creating', 'building', 'deploying', 'stopping', 'starting', 'updating', 'deleting', 'in_progress'].includes(status);

  if (variant === 'dot') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className={cn(
          'w-2 h-2 rounded-full',
          config.color.split(' ')[0].replace('bg-', 'bg-').replace('-100', '-500')
        )} />
        <span className="text-sm font-medium">{config.label}</span>
      </div>
    );
  }

  return (
    <Badge 
      variant={variant}
      className={cn(
        config.color,
        sizeConfig[size],
        'font-medium border',
        className
      )}
    >
      {showIcon && (
        <IconComponent 
          className={cn(
            'w-3 h-3 mr-1',
            isAnimated && 'animate-spin'
          )} 
        />
      )}
      {config.label}
    </Badge>
  );
}

// components/deployment/atoms/ResourceMeter.tsx
import React from 'react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface ResourceMeterProps {
  label: string;
  current: number;
  total: number;
  unit: string;
  variant?: 'linear' | 'circular';
  showLabels?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

export default function ResourceMeter({
  label,
  current,
  total,
  unit,
  variant = 'linear',
  showLabels = true,
  color = 'primary',
  className
}: ResourceMeterProps) {
  const percentage = Math.min((current / total) * 100, 100);
  
  const getColor = () => {
    if (color !== 'primary') return color;
    
    if (percentage >= 90) return 'danger';
    if (percentage >= 70) return 'warning';
    return 'success';
  };

  const colorClass = getColor();
  
  const colorConfig = {
    primary: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
  };

  if (variant === 'circular') {
    const circumference = 2 * Math.PI * 16;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className={cn('flex flex-col items-center space-y-2', className)}>
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              className="stroke-gray-200"
              strokeWidth="2"
            />
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              className={cn('transition-all duration-300', colorConfig[colorClass]?.replace('bg-', 'stroke-'))}
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-semibold">{Math.round(percentage)}%</span>
          </div>
        </div>
        {showLabels && (
          <div className="text-center">
            <div className="text-sm font-medium">{label}</div>
            <div className="text-xs text-gray-500">
              {current}{unit} / {total}{unit}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {showLabels && (
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">{label}</span>
          <span className="text-sm text-gray-500">
            {current}{unit} / {total}{unit}
          </span>
        </div>
      )}
      <Progress 
        value={percentage} 
        className={cn('h-2', colorConfig[colorClass])}
      />
      {showLabels && (
        <div className="text-xs text-gray-500 text-right">
          {Math.round(percentage)}% used
        </div>
      )}
    </div>
  );
}

// components/deployment/molecules/TemplateCard.tsx
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  DollarSign, 
  Cpu, 
  HardDrive, 
  Star,
  ArrowRight 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Template {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
  icon?: string;
  featured: boolean;
  pricingTier: string;
  monthlyPrice: number;
  setupTimeMinutes: number;
  complexity: 'simple' | 'medium' | 'complex';
  tags: string[];
  minCpu: string;
  minMemory: string;
  minStorage: string;
}

interface TemplateCardProps {
  template: Template;
  featured?: boolean;
  onSelect?: (template: Template) => void;
  onViewDetails?: (templateId: string) => void;
  selected?: boolean;
  className?: string;
}

const categoryColors = {
  cms: 'bg-blue-100 text-blue-800',
  ecommerce: 'bg-purple-100 text-purple-800',
  api: 'bg-green-100 text-green-800',
  static: 'bg-yellow-100 text-yellow-800',
  database: 'bg-red-100 text-red-800',
  ai: 'bg-indigo-100 text-indigo-800',
  other: 'bg-gray-100 text-gray-800',
};

const complexityColors = {
  simple: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  complex: 'bg-red-100 text-red-800',
};

export default function TemplateCard({
  template,
  featured = false,
  onSelect,
  onViewDetails,
  selected = false,
  className
}: TemplateCardProps) {
  const handleSelect = () => {
    onSelect?.(template);
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDetails?.(template.id);
  };

  return (
    <Card 
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]',
        selected && 'ring-2 ring-blue-500 shadow-lg',
        featured && 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-white',
        className
      )}
      onClick={handleSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {template.icon ? (
              <img 
                src={template.icon} 
                alt={template.displayName}
                className="w-8 h-8 rounded"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-xs font-bold">
                  {template.displayName.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h3 className="font-semibold text-lg">{template.displayName}</h3>
              {(template.featured || featured) && (
                <div className="flex items-center space-x-1 mt-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                  <span className="text-xs text-yellow-600 font-medium">Featured</span>
                </div>
              )}
            </div>
          </div>
          <Badge 
            className={cn(
              'text-xs',
              categoryColors[template.category as keyof typeof categoryColors] || categoryColors.other
            )}
          >
            {template.category.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {template.description}
        </p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center space-x-2 text-sm">
            <DollarSign className="w-4 h-4 text-gray-500" />
            <span>
              {template.monthlyPrice === 0 ? 'Free' : `$${template.monthlyPrice}/mo`}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Clock className="w-4 h-4 text-gray-500" />
            <span>{template.setupTimeMinutes}min setup</span>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
          <div className="flex items-center space-x-1">
            <Cpu className="w-3 h-3" />
            <span>{template.minCpu} CPU</span>
          </div>
          <div className="flex items-center space-x-1">
            <HardDrive className="w-3 h-3" />
            <span>{template.minMemory} RAM</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Badge 
            variant="outline"
            className={cn(
              'text-xs',
              complexityColors[template.complexity]
            )}
          >
            {template.complexity}
          </Badge>
          
          <div className="flex flex-wrap gap-1">
            {template.tags.slice(0, 2).map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="text-xs"
              >
                {tag}
              </Badge>
            ))}
            {template.tags.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{template.tags.length - 2}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex space-x-2 w-full">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleViewDetails}
            className="flex-1"
          >
            Details
          </Button>
          <Button 
            size="sm" 
            onClick={handleSelect}
            className="flex-1"
          >
            Deploy
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

// components/deployment/molecules/InstanceCard.tsx
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal, 
  ExternalLink, 
  RotateCcw, 
  Settings, 
  Trash2,
  Play,
  Square,
  Eye
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import StatusBadge from '../atoms/StatusBadge';
import ResourceMeter from '../atoms/ResourceMeter';
import { cn } from '@/lib/utils';

interface Instance {
  id: string;
  name: string;
  description?: string;
  status: string;
  template: {
    displayName: string;
    category: string;
  };
  domains: Array<{
    domain: string;
    isPrimary: boolean;
  }>;
  allocatedCpu: string;
  allocatedMemory: string;
  currentCpuUsage: number;
  currentMemoryUsage: string;
  createdAt: string;
  lastDeployedAt?: string;
}

interface InstanceCardProps {
  instance: Instance;
  showMetrics?: boolean;
  onManage?: (instanceId: string) => void;
  onViewLogs?: (instanceId: string) => void;
  onRestart?: (instanceId: string) => void;
  onStart?: (instanceId: string) => void;
  onStop?: (instanceId: string) => void;
  onDelete?: (instanceId: string) => void;
  className?: string;
}

export default function InstanceCard({
  instance,
  showMetrics = true,
  onManage,
  onViewLogs,
  onRestart,
  onStart,
  onStop,
  onDelete,
  className
}: InstanceCardProps) {
  const primaryDomain = instance.domains.find(d => d.isPrimary);
  const isRunning = instance.status === 'running';
  const isStopped = instance.status === 'stopped';
  const canManage = ['running', 'stopped', 'failed'].includes(instance.status);

  const handleExternalLink = () => {
    if (primaryDomain) {
      window.open(`https://${primaryDomain.domain}`, '_blank');
    }
  };

  // Parse memory usage
  const parseMemory = (memStr: string) => {
    const num = parseFloat(memStr);
    if (memStr.includes('GB')) return num * 1024;
    return num;
  };

  const currentMemoryMB = parseMemory(instance.currentMemoryUsage || '0MB');
  const allocatedMemoryMB = parseMemory(instance.allocatedMemory);

  return (
    <Card className={cn('hover:shadow-md transition-shadow duration-200', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold text-lg truncate">{instance.name}</h3>
              <StatusBadge status={instance.status as any} size="sm" />
            </div>
            
            <p className="text-sm text-gray-600 mb-2">
              {instance.template.displayName}
            </p>
            
            {instance.description && (
              <p className="text-xs text-gray-500 line-clamp-2">
                {instance.description}
              </p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canManage && (
                <DropdownMenuItem onClick={() => onManage?.(instance.id)}>
                  <Settings className="w-4 h-4 mr-2" />
                  Manage
                </DropdownMenuItem>
              )}
              
              <DropdownMenuItem onClick={() => onViewLogs?.(instance.id)}>
                <Eye className="w-4 h-4 mr-2" />
                View Logs
              </DropdownMenuItem>

              {primaryDomain && isRunning && (
                <DropdownMenuItem onClick={handleExternalLink}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Site
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              {isRunning && (
                <>
                  <DropdownMenuItem onClick={() => onRestart?.(instance.id)}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Restart
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStop?.(instance.id)}>
                    <Square className="w-4 h-4 mr-2" />
                    Stop
                  </DropdownMenuItem>
                </>
              )}

              {isStopped && (
                <DropdownMenuItem onClick={() => onStart?.(instance.id)}>
                  <Play className="w-4 h-4 mr-2" />
                  Start
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={() => onDelete?.(instance.id)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent>
        {primaryDomain && (
          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-1">Domain</div>
            <div className="flex items-center space-x-2">
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                {primaryDomain.domain}
              </code>
              {isRunning && (
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={handleExternalLink}
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        )}

        {showMetrics && isRunning && (
          <div className="space-y-3">
            <ResourceMeter
              label="CPU"
              current={instance.currentCpuUsage || 0}
              total={100}
              unit="%"
              showLabels={false}
            />
            
            <ResourceMeter
              label="Memory"
              current={currentMemoryMB}
              total={allocatedMemoryMB}
              unit="MB"
              showLabels={false}
            />
          </div>
        )}

        <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
          <span>
            Created {new Date(instance.createdAt).toLocaleDateString()}
          </span>
          {instance.lastDeployedAt && (
            <span>
              Last deployed {new Date(instance.lastDeployedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// components/deployment/organisms/TemplateGallery.tsx
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, SlidersHorizontal, Star } from 'lucide-react';
import TemplateCard from '../molecules/TemplateCard';
import { cn } from '@/lib/utils';

interface TemplateFilters {
  category?: string;
  pricingTier?: string;
  complexity?: string;
  search?: string;
  featured?: boolean;
}

interface Template {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
  icon?: string;
  featured: boolean;
  pricingTier: string;
  monthlyPrice: number;
  setupTimeMinutes: number;
  complexity: 'simple' | 'medium' | 'complex';
  tags: string[];
  minCpu: string;
  minMemory: string;
  minStorage: string;
}

interface PaginationProps {
  limit: number;
  offset: number;
  total: number;
  hasMore: boolean;
}

interface TemplateGalleryProps {
  templates: Template[];
  loading?: boolean;
  onSelectTemplate?: (template: Template) => void;
  onViewTemplate?: (templateId: string) => void;
  filters?: TemplateFilters;
  onFiltersChange?: (filters: TemplateFilters) => void;
  pagination?: PaginationProps;
  onLoadMore?: () => void;
  className?: string;
}

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'cms', label: 'CMS' },
  { value: 'ecommerce', label: 'E-Commerce' },
  { value: 'api', label: 'API & Backend' },
  { value: 'static', label: 'Static Sites' },
  { value: 'database', label: 'Databases' },
  { value: 'ai', label: 'AI & ML' },
];

const pricingTiers = [
  { value: '', label: 'All Pricing' },
  { value: 'starter', label: 'Starter' },
  { value: 'pro', label: 'Pro' },
  { value: 'business', label: 'Business' },
];

const complexityLevels = [
  { value: '', label: 'All Complexity' },
  { value: 'simple', label: 'Simple' },
  { value: 'medium', label: 'Medium' },
  { value: 'complex', label: 'Complex' },
];

export default function TemplateGallery({
  templates,
  loading = false,
  onSelectTemplate,
  onViewTemplate,
  filters = {},
  onFiltersChange,
  pagination,
  onLoadMore,
  className
}: TemplateGalleryProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange?.({
      ...filters,
      search: e.target.value || undefined,
    });
  };

  const handleFilterChange = (key: keyof TemplateFilters, value: string) => {
    onFiltersChange?.({
      ...filters,
      [key]: value || undefined,
    });
  };

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template.id);
    onSelectTemplate?.(template);
  };

  const featuredTemplates = templates.filter(t => t.featured);
  const regularTemplates = templates.filter(t => !t.featured);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search templates..."
              value={filters.search || ''}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
          
          <Button
            variant="outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center space-x-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </Button>

          <Button
            variant={filters.featured ? 'default' : 'outline'}
            onClick={() => handleFilterChange('featured', filters.featured ? '' : 'true')}
            className="flex items-center space-x-2"
          >
            <Star className={cn('w-4 h-4', filters.featured && 'fill-current')} />
            <span>Featured</span>
          </Button>
        </div>

        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-gray-50">
            <Select
              value={filters.category || ''}
              onValueChange={(value) => handleFilterChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.pricingTier || ''}
              onValueChange={(value) => handleFilterChange('pricingTier', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pricing" />
              </SelectTrigger>
              <SelectContent>
                {pricingTiers.map((tier) => (
                  <SelectItem key={tier.value} value={tier.value}>
                    {tier.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.complexity || ''}
              onValueChange={(value) => handleFilterChange('complexity', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Complexity" />
              </SelectTrigger>
              <SelectContent>
                {complexityLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Active Filters */}
        {Object.entries(filters).some(([_, value]) => value) && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => {
              if (!value) return null;
              
              const label = key === 'search' ? `"${value}"` : 
                          key === 'featured' ? 'Featured' :
                          value;
              
              return (
                <Badge 
                  key={key} 
                  variant="secondary"
                  className="cursor-pointer hover:bg-gray-200"
                  onClick={() => handleFilterChange(key as keyof TemplateFilters, '')}
                >
                  {label} ×
                </Badge>
              );
            })}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFiltersChange?.({})}
              className="h-6 px-2 text-xs"
            >
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Featured Templates */}
      {featuredTemplates.length > 0 && !filters.category && !filters.search && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-yellow-500 fill-current" />
            <h2 className="text-xl font-semibold">Featured Templates</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                featured
                onSelect={handleTemplateSelect}
                onViewDetails={onViewTemplate}
                selected={selectedTemplate === template.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Regular Templates */}
      <div className="space-y-4">
        {featuredTemplates.length > 0 && !filters.category && !filters.search && (
          <h2 className="text-xl font-semibold">All Templates</h2>
        )}
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 bg-gray-200 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : regularTemplates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={handleTemplateSelect}
                onViewDetails={onViewTemplate}
                selected={selectedTemplate === template.id}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              No templates found matching your criteria
            </div>
            <Button 
              variant="outline" 
              onClick={() => onFiltersChange?.({})}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Load More */}
      {pagination?.hasMore && onLoadMore && (
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={onLoadMore}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More Templates'}
          </Button>
        </div>
      )}

      {/* Results Count */}
      {pagination && (
        <div className="text-sm text-gray-500 text-center">
          Showing {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total} templates
        </div>
      )}
    </div>
  );
}