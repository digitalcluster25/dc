// hooks/deployment/useTemplates.ts
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface TemplateFilters {
  category?: string;
  pricingTier?: string;
  complexity?: string;
  search?: string;
  featured?: boolean;
}

export interface Template {
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
  configs?: any[];
}

interface UseTemplatesOptions {
  initialFilters?: TemplateFilters;
  pageSize?: number;
  enabled?: boolean;
}

export function useTemplates(options: UseTemplatesOptions = {}) {
  const { initialFilters = {}, pageSize = 20, enabled = true } = options;
  const [filters, setFilters] = useState<TemplateFilters>(initialFilters);
  const [page, setPage] = useState(0);
  
  const queryClient = useQueryClient();

  // Build query parameters
  const queryParams = new URLSearchParams({
    limit: pageSize.toString(),
    offset: (page * pageSize).toString(),
    ...Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== '') {
        acc[key] = value.toString();
      }
      return acc;
    }, {} as Record<string, string>),
  });

  // Fetch templates
  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['templates', filters, page],
    queryFn: async () => {
      const response = await fetch(`/api/deployment/templates?${queryParams}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to fetch templates');
      }

      return response.json();
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<TemplateFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(0); // Reset to first page when filters change
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({});
    setPage(0);
  }, []);

  // Load more (pagination)
  const loadMore = useCallback(() => {
    if (data?.hasMore && !isFetching) {
      setPage(prev => prev + 1);
    }
  }, [data?.hasMore, isFetching]);

  // Get template by ID
  const getTemplate = useCallback((templateId: string): Template | undefined => {
    return data?.templates?.find((template: Template) => template.id === templateId);
  }, [data?.templates]);

  // Search templates locally
  const searchTemplates = useCallback((query: string): Template[] => {
    if (!data?.templates || !query.trim()) return data?.templates || [];
    
    const searchTerm = query.toLowerCase();
    return data.templates.filter((template: Template) =>
      template.displayName.toLowerCase().includes(searchTerm) ||
      template.description.toLowerCase().includes(searchTerm) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }, [data?.templates]);

  // Filter templates by category
  const filterByCategory = useCallback((category: string): Template[] => {
    if (!data?.templates || !category) return data?.templates || [];
    
    return data.templates.filter((template: Template) => 
      template.category === category
    );
  }, [data?.templates]);

  return {
    templates: data?.templates || [],
    total: data?.total || 0,
    hasMore: data?.hasMore || false,
    loading: isLoading,
    fetching: isFetching,
    error,
    filters,
    page,
    pagination: {
      limit: pageSize,
      offset: page * pageSize,
      total: data?.total || 0,
      hasMore: data?.hasMore || false,
    },
    
    // Actions
    updateFilters,
    clearFilters,
    loadMore,
    refetch,
    
    // Utilities
    getTemplate,
    searchTemplates,
    filterByCategory,
  };
}

// hooks/deployment/useInstances.ts
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface Instance {
  id: string;
  name: string;
  description?: string;
  status: string;
  templateId: string;
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
  currentCpuUsage?: number;
  currentMemoryUsage?: string;
  createdAt: string;
  lastDeployedAt?: string;
}

export interface CreateInstanceInput {
  name: string;
  description?: string;
  templateId: string;
  domain?: {
    type: 'generated' | 'custom';
    customDomain?: string;
  };
  environment?: Record<string, string>;
  configuration?: {
    scaling?: {
      minReplicas?: number;
      maxReplicas?: number;
      targetCpuPercent?: number;
    };
    persistence?: {
      enabled: boolean;
      size?: string;
    };
  };
}

interface InstanceFilters {
  status?: string;
  templateId?: string;
  search?: string;
}

interface UseInstancesOptions {
  initialFilters?: InstanceFilters;
  pageSize?: number;
  enabled?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useInstances(options: UseInstancesOptions = {}) {
  const { 
    initialFilters = {}, 
    pageSize = 20, 
    enabled = true,
    autoRefresh = true,
    refreshInterval = 30000 // 30 seconds
  } = options;
  
  const [filters, setFilters] = useState<InstanceFilters>(initialFilters);
  const [page, setPage] = useState(0);
  const queryClient = useQueryClient();

  // Build query parameters
  const queryParams = new URLSearchParams({
    limit: pageSize.toString(),
    offset: (page * pageSize).toString(),
    ...Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== '') {
        acc[key] = value.toString();
      }
      return acc;
    }, {} as Record<string, string>),
  });

  // Fetch instances
  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['instances', filters, page],
    queryFn: async () => {
      const response = await fetch(`/api/deployment/instances?${queryParams}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to fetch instances');
      }

      return response.json();
    },
    enabled,
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Create instance mutation
  const createInstanceMutation = useMutation({
    mutationFn: async (input: CreateInstanceInput) => {
      const response = await fetch('/api/deployment/instances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to create instance');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success(`Instance "${data.instance.name}" created successfully`);
      queryClient.invalidateQueries({ queryKey: ['instances'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create instance: ${error.message}`);
    },
  });

  // Update instance mutation
  const updateInstanceMutation = useMutation({
    mutationFn: async ({ 
      instanceId, 
      updates 
    }: { 
      instanceId: string; 
      updates: Partial<CreateInstanceInput> 
    }) => {
      const response = await fetch(`/api/deployment/instances/${instanceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to update instance');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      toast.success(`Instance updated successfully`);
      queryClient.invalidateQueries({ queryKey: ['instances'] });
      queryClient.invalidateQueries({ queryKey: ['instance', variables.instanceId] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update instance: ${error.message}`);
    },
  });

  // Delete instance mutation
  const deleteInstanceMutation = useMutation({
    mutationFn: async ({ 
      instanceId, 
      options = {} 
    }: { 
      instanceId: string; 
      options?: { force?: boolean; backup?: boolean; } 
    }) => {
      const queryParams = new URLSearchParams(
        Object.entries(options).reduce((acc, [key, value]) => {
          if (value !== undefined) {
            acc[key] = value.toString();
          }
          return acc;
        }, {} as Record<string, string>)
      );

      const response = await fetch(
        `/api/deployment/instances/${instanceId}?${queryParams}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to delete instance');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Instance deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['instances'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete instance: ${error.message}`);
    },
  });

  // Restart instance mutation
  const restartInstanceMutation = useMutation({
    mutationFn: async (instanceId: string) => {
      const response = await fetch(`/api/deployment/instances/${instanceId}/restart`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to restart instance');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Instance restart initiated');
      queryClient.invalidateQueries({ queryKey: ['instances'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to restart instance: ${error.message}`);
    },
  });

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<InstanceFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(0);
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({});
    setPage(0);
  }, []);

  // Load more
  const loadMore = useCallback(() => {
    if (data?.hasMore && !isFetching) {
      setPage(prev => prev + 1);
    }
  }, [data?.hasMore, isFetching]);

  return {
    instances: data?.instances || [],
    total: data?.total || 0,
    hasMore: data?.hasMore || false,
    loading: isLoading,
    fetching: isFetching,
    error,
    filters,
    page,
    pagination: {
      limit: pageSize,
      offset: page * pageSize,
      total: data?.total || 0,
      hasMore: data?.hasMore || false,
    },
    
    // Actions
    createInstance: createInstanceMutation.mutate,
    updateInstance: updateInstanceMutation.mutate,
    deleteInstance: deleteInstanceMutation.mutate,
    restartInstance: restartInstanceMutation.mutate,
    updateFilters,
    clearFilters,
    loadMore,
    refetch,
    
    // Loading states
    creating: createInstanceMutation.isPending,
    updating: updateInstanceMutation.isPending,
    deleting: deleteInstanceMutation.isPending,
    restarting: restartInstanceMutation.isPending,
  };
}

// hooks/deployment/useInstance.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useInstance(instanceId: string, options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;
  const queryClient = useQueryClient();

  // Fetch single instance
  const {
    data: instance,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['instance', instanceId],
    queryFn: async () => {
      const response = await fetch(`/api/deployment/instances/${instanceId}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to fetch instance');
      }

      const data = await response.json();
      return data.instance;
    },
    enabled: enabled && !!instanceId,
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Scale instance mutation
  const scaleInstanceMutation = useMutation({
    mutationFn: async (resources: {
      cpu?: string;
      memory?: string;
      replicas?: number;
    }) => {
      const response = await fetch(`/api/deployment/instances/${instanceId}/scale`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resources }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to scale instance');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Instance scaling initiated');
      queryClient.invalidateQueries({ queryKey: ['instance', instanceId] });
      queryClient.invalidateQueries({ queryKey: ['instances'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to scale instance: ${error.message}`);
    },
  });

  return {
    instance,
    loading: isLoading,
    error,
    refetch,
    
    // Actions
    scaleInstance: scaleInstanceMutation.mutate,
    scaling: scaleInstanceMutation.isPending,
  };
}

// hooks/deployment/useDeployments.ts
import { useQuery } from '@tanstack/react-query';

export interface Deployment {
  id: string;
  instanceId: string;
  status: string;
  type: string;
  trigger: {
    type: string;
    userId?: string;
    source?: string;
  };
  progress: {
    currentStep: string;
    totalSteps: number;
    completedSteps: number;
    percentage: number;
  };
  timing: {
    startedAt: string;
    completedAt?: string;
    duration?: number;
    estimatedCompletion?: string;
  };
  logs: Array<{
    id: string;
    timestamp: string;
    level: string;
    message: string;
    source: string;
  }>;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

interface UseDeploymentsOptions {
  status?: string;
  pageSize?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useDeployments(
  instanceId: string, 
  options: UseDeploymentsOptions = {}
) {
  const { 
    status, 
    pageSize = 20, 
    autoRefresh = true, 
    refreshInterval = 10000 // 10 seconds
  } = options;

  const queryParams = new URLSearchParams({
    limit: pageSize.toString(),
    ...(status && { status }),
  });

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['deployments', instanceId, status],
    queryFn: async () => {
      const response = await fetch(
        `/api/deployment/instances/${instanceId}/deployments?${queryParams}`
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to fetch deployments');
      }

      return response.json();
    },
    enabled: !!instanceId,
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 30 * 1000, // 30 seconds
  });

  const activeDeployment = data?.deployments?.find((d: Deployment) => 
    ['pending', 'in_progress'].includes(d.status)
  );

  return {
    deployments: data?.deployments || [],
    total: data?.total || 0,
    activeDeployment,
    loading: isLoading,
    error,
    refetch,
  };
}

// hooks/deployment/useRealTimeUpdates.ts
import { useEffect, useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export interface WebSocketEvent<T = any> {
  type: string;
  payload: T;
  timestamp: string;
}

interface UseRealTimeUpdatesOptions {
  instanceId?: string;
  events?: string[];
  onEvent?: (event: WebSocketEvent) => void;
  autoConnect?: boolean;
}

export function useRealTimeUpdates<T = any>(
  eventType: string, 
  options: UseRealTimeUpdatesOptions = {}
) {
  const { instanceId, events, onEvent, autoConnect = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!autoConnect) return;

    const token = localStorage.getItem('auth_token'); // Get from your auth system
    if (!token) {
      setError(new Error('Authentication token not found'));
      return;
    }

    const wsUrl = new URL('/api/deployment/ws', window.location.origin);
    wsUrl.protocol = wsUrl.protocol.replace('http', 'ws');
    wsUrl.searchParams.set('token', token);
    
    if (instanceId) {
      wsUrl.searchParams.set('instanceId', instanceId);
    }

    const ws = new WebSocket(wsUrl.toString());
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setError(null);
      
      // Subscribe to specific events
      if (events) {
        ws.send(JSON.stringify({
          type: 'subscribe',
          events: events,
        }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const wsEvent: WebSocketEvent = JSON.parse(event.data);
        
        // Handle specific event type
        if (wsEvent.type === eventType) {
          setData(wsEvent.payload);
        }
        
        // Call custom event handler
        onEvent?.(wsEvent);
        
        // Invalidate related queries based on event type
        switch (wsEvent.type) {
          case 'instance.status_changed':
            queryClient.invalidateQueries({ queryKey: ['instances'] });
            queryClient.invalidateQueries({ queryKey: ['instance', wsEvent.payload.instanceId] });
            break;
          case 'deployment.started':
          case 'deployment.progress':
          case 'deployment.completed':
            queryClient.invalidateQueries({ queryKey: ['deployments', wsEvent.payload.instanceId] });
            break;
          case 'metrics.updated':
            queryClient.invalidateQueries({ queryKey: ['metrics', wsEvent.payload.instanceId] });
            break;
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };

    ws.onerror = () => {
      setError(new Error('WebSocket connection error'));
    };

    ws.onclose = () => {
      setConnected(false);
      
      // Attempt to reconnect after a delay
      setTimeout(() => {
        if (autoConnect) {
          // Recursive call to reconnect
          // In practice, you might want to implement exponential backoff
        }
      }, 5000);
    };

    return () => {
      ws.close();
    };
  }, [eventType, instanceId, autoConnect, onEvent, events, queryClient]);

  const disconnect = () => {
    wsRef.current?.close();
    setConnected(false);
  };

  const reconnect = () => {
    disconnect();
    // The useEffect will handle reconnection
  };

  return {
    data,
    connected,
    error,
    disconnect,
    reconnect,
  };
}

// hooks/deployment/useInstanceMetrics.ts
import { useQuery } from '@tanstack/react-query';

export interface MetricDataPoint {
  timestamp: string;
  cpu?: number;
  memory?: number;
  bandwidth?: {
    incoming: number;
    outgoing: number;
  };
  requests?: number;
  errors?: number;
}

interface UseInstanceMetricsOptions {
  period?: '1h' | '24h' | '7d' | '30d';
  metrics?: string[];
  interval?: '1m' | '5m' | '1h' | '1d';
  enabled?: boolean;
  refreshInterval?: number;
}

export function useInstanceMetrics(
  instanceId: string, 
  options: UseInstanceMetricsOptions = {}
) {
  const { 
    period = '24h', 
    metrics, 
    interval = '5m', 
    enabled = true,
    refreshInterval = 60000 // 1 minute
  } = options;

  const queryParams = new URLSearchParams({
    period,
    interval,
    ...(metrics && { metrics: metrics.join(',') }),
  });

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['metrics', instanceId, period, metrics, interval],
    queryFn: async () => {
      const response = await fetch(
        `/api/deployment/instances/${instanceId}/metrics?${queryParams}`
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to fetch metrics');
      }

      return response.json();
    },
    enabled: enabled && !!instanceId,
    refetchInterval: refreshInterval,
    staleTime: 30 * 1000, // 30 seconds
  });

  return {
    metrics: data?.data || [],
    period: data?.period,
    interval: data?.interval,
    loading: isLoading,
    error,
    refetch,
  };
}

export {
  useTemplates,
  useInstances,
  useInstance,
  useDeployments,
  useRealTimeUpdates,
  useInstanceMetrics,
};