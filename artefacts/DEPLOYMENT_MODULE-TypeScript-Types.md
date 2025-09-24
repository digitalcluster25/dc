// types/deployment/index.ts

// Base types
export type TemplateCategory = 
  | 'cms' 
  | 'ecommerce' 
  | 'api' 
  | 'static' 
  | 'database' 
  | 'ai' 
  | 'analytics' 
  | 'other';

export type PricingTier = 'starter' | 'pro' | 'business' | 'enterprise';

export type TemplateComplexity = 'simple' | 'medium' | 'complex';

export type TemplateStatus = 'active' | 'deprecated' | 'maintenance';

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

export type HealthStatus = 'healthy' | 'unhealthy' | 'unknown' | 'degraded';

export type DomainType = 'generated' | 'custom';

export type DomainStatus = 'pending' | 'active' | 'failed' | 'expired';

export type SslStatus = 'pending' | 'active' | 'failed' | 'expired';

export type DeploymentType = 'create' | 'update' | 'restart' | 'scale' | 'rollback' | 'stop' | 'start';

export type DeploymentStatus = 
  | 'pending' 
  | 'queued' 
  | 'in_progress' 
  | 'success' 
  | 'failed' 
  | 'cancelled' 
  | 'rolled_back';

export type TriggerType = 'manual' | 'api' | 'webhook' | 'scheduled' | 'system';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export type LogSource = 'system' | 'railway' | 'application' | 'build';

export type EnvVarSource = 'user' | 'template' | 'system' | 'inherited';

export type BackupType = 'manual' | 'scheduled' | 'pre_deployment' | 'pre_deletion';

export type BackupStatus = 'creating' | 'completed' | 'failed' | 'expired' | 'deleted';

// Resource types
export interface ResourceRequirements {
  cpu: string; // "0.5", "1", "2", "4", "8"
  memory: string; // "512MB", "1GB", "2GB", "4GB", "8GB", "16GB"
  storage: string; // "1GB", "5GB", "10GB", "50GB", "100GB", "500GB"
}

export interface ResourceUsage {
  cpu: {
    current: number; // percentage
    average24h: number;
  };
  memory: {
    current: string; // "256MB"
    average24h: string;
  };
  storage: {
    used: string; // "1.2GB"
    available: string; // "5GB"
  };
  bandwidth: {
    incoming24h: string; // "10MB"
    outgoing24h: string; // "50MB"
  };
}

// Template types
export interface TemplateMetadata {
  setupTimeMinutes: number;
  complexity: TemplateComplexity;
  supportedLanguages?: string[];
  requiredServices?: string[];
  customDomain: boolean;
  sslIncluded: boolean;
  backupEnabled: boolean;
  autoScaling: boolean;
}

export interface TemplatePricing {
  tier: PricingTier;
  monthlyPrice: number;
  setupFee?: number;
  resources: ResourceRequirements;
}

export interface TemplateConfiguration {
  defaultEnvironment: Record<string, string>;
  requiredEnvironment: string[];
  optionalEnvironment: string[];
  secretEnvironment: string[];
  ports: number[];
  healthCheckPath?: string;
  buildCommand?: string;
  startCommand?: string;
  dockerfile?: string;
  railwayConfig?: Record<string, any>;
  serviceDependencies?: string[];
  validationRules?: Record<string, any>;
}

export interface Template {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: TemplateCategory;
  icon?: string;
  featured: boolean;
  railwayTemplateId?: string;
  railwayTemplateUrl?: string;
  version: string;
  pricing: TemplatePricing;
  metadata: TemplateMetadata;
  configuration?: TemplateConfiguration;
  tags: string[];
  status: TemplateStatus;
  deprecatedAt?: string;
  replacementTemplateId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateExample {
  title: string;
  description: string;
  demoUrl?: string;
  sourceUrl?: string;
  previewImages: string[];
}

export interface EnvironmentVariable {
  key: string;
  description: string;
  required: boolean;
  defaultValue?: string;
  type: 'string' | 'number' | 'boolean' | 'url' | 'secret';
}

// Instance types
export interface InstanceDomain {
  id: string;
  domain: string;
  type: DomainType;
  isPrimary: boolean;
  sslEnabled: boolean;
  sslStatus: SslStatus;
  status: DomainStatus;
  railwayDomainId?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface InstanceEnvironment {
  id: string;
  key: string;
  value: string;
  isSecret: boolean;
  isSystem: boolean;
  description?: string;
  source: EnvVarSource;
  createdAt: string;
  updatedAt: string;
}

export interface InstanceConfiguration {
  scaling?: {
    minReplicas: number;
    maxReplicas: number;
    targetCpuPercent?: number;
    autoScaling: boolean;
  };
  persistence?: {
    enabled: boolean;
    size: string;
  };
  networking?: {
    internalUrl?: string;
    customDomains: string[];
  };
}

export interface Instance {
  id: string;
  name: string;
  description?: string;
  userId: string;
  templateId: string;
  template: Pick<Template, 'displayName' | 'category' | 'icon'>;
  subscriptionId?: string;
  status: InstanceStatus;
  healthStatus: HealthStatus;
  
  // Railway integration
  railwayProjectId?: string;
  railwayServiceId?: string;
  railwayEnvironmentId?: string;
  
  // Resource allocation
  allocatedResources: ResourceRequirements;
  currentUsage?: ResourceUsage;
  
  // Configuration
  configuration: InstanceConfiguration;
  tenantPrefix: string;
  
  // Domains and environment
  domains: InstanceDomain[];
  environment: InstanceEnvironment[];
  
  // Monitoring
  uptimePercentage: number;
  lastHealthCheck?: string;
  lastDeployedAt?: string;
  
  // Billing
  monthlyCost: number;
  lastBillingSync?: string;
  
  // Metadata
  metadata: Record<string, any>;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

// Deployment types
export interface DeploymentTrigger {
  type: TriggerType;
  userId?: string;
  source?: string;
}

export interface DeploymentProgress {
  currentStep: string;
  totalSteps: number;
  completedSteps: number;
  percentage: number; // 0-100
}

export interface DeploymentTiming {
  startedAt: string;
  completedAt?: string;
  duration?: number; // seconds
  estimatedCompletion?: string;
}

export interface DeploymentError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface DeploymentChanges {
  environment?: Record<string, string>;
  resources?: Partial<ResourceRequirements>;
  configuration?: Partial<InstanceConfiguration>;
  [key: string]: any;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  source: LogSource;
  step?: string;
  component?: string;
  metadata?: Record<string, any>;
}

export interface Deployment {
  id: string;
  instanceId: string;
  type: DeploymentType;
  status: DeploymentStatus;
  trigger: DeploymentTrigger;
  
  // Railway integration
  railwayDeploymentId?: string;
  railwayBuildId?: string;
  
  // Changes and configuration
  changes?: DeploymentChanges;
  previousConfig?: Record<string, any>;
  
  // Progress tracking
  progress: DeploymentProgress;
  timing: DeploymentTiming;
  
  // Error information
  error?: DeploymentError;
  
  // Logs and metadata
  logs: LogEntry[];
  metadata: Record<string, any>;
  
  // Timestamps
  createdAt: string;
}

// Metrics types
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
  responseTime?: number;
  uptime?: number;
}

export interface InstanceMetrics {
  instanceId: string;
  uptime: {
    current: number; // seconds
    percentage24h: number; // 0-100
    percentage30d: number;
  };
  performance: {
    responseTime: {
      current: number; // ms
      average24h: number;
    };
    errorRate: {
      current: number; // 0-100
      average24h: number;
    };
  };
  usage: ResourceUsage;
  history: MetricDataPoint[];
}

// Backup types
export interface InstanceBackup {
  id: string;
  instanceId: string;
  name: string;
  description?: string;
  type: BackupType;
  status: BackupStatus;
  
  // Storage information
  storageProvider: string;
  storagePath?: string;
  sizeBytes?: number;
  
  // Progress and timing
  progressPercentage: number;
  startedAt: string;
  completedAt?: string;
  expiresAt?: string;
  
  // Configuration snapshot
  configSnapshot: Record<string, any>;
  metadata: Record<string, any>;
  
  createdAt: string;
}

// API Request/Response types
export interface CreateTemplateRequest {
  name: string;
  displayName: string;
  description: string;
  category: TemplateCategory;
  icon?: string;
  featured?: boolean;
  railwayTemplateId?: string;
  pricingTier: PricingTier;
  monthlyPrice: number;
  setupFee?: number;
  minCpu: string;
  minMemory: string;
  minStorage: string;
  tags?: string[];
  setupTimeMinutes?: number;
  complexity?: TemplateComplexity;
  supportedLanguages?: string[];
  requiredServices?: string[];
  customDomain?: boolean;
  sslIncluded?: boolean;
  backupEnabled?: boolean;
  autoScaling?: boolean;
  configuration?: Partial<TemplateConfiguration>;
}

export interface CreateInstanceRequest {
  name: string;
  description?: string;
  templateId: string;
  domain?: {
    type: DomainType;
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

export interface UpdateInstanceRequest {
  name?: string;
  description?: string;
  environment?: Record<string, string>;
  configuration?: Partial<InstanceConfiguration>;
}

export interface ScaleInstanceRequest {
  resources: {
    cpu?: string;
    memory?: string;
    replicas?: number;
  };
}

export interface DeployInstanceRequest {
  changes?: DeploymentChanges;
  options?: {
    gracefulRestart?: boolean;
    skipHealthCheck?: boolean;
    rollbackOnFailure?: boolean;
  };
}

export interface AddDomainRequest {
  domain: string;
  sslEnabled?: boolean;
}

// Filter and pagination types
export interface TemplateFilters {
  category?: TemplateCategory;
  pricingTier?: PricingTier;
  complexity?: TemplateComplexity;
  search?: string;
  featured?: boolean;
}

export interface InstanceFilters {
  status?: InstanceStatus;
  templateId?: string;
  search?: string;
}

export interface DeploymentFilters {
  status?: DeploymentStatus;
  type?: DeploymentType;
  triggeredBy?: string;
}

export interface PaginationParams {
  limit: number;
  offset: number;
}

export interface PaginationMeta {
  limit: number;
  offset: number;
  total: number;
  hasMore: boolean;
  nextOffset?: number;
}

export interface SortParams {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    requestId: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface TemplatesResponse extends PaginatedResponse<Template> {}

export interface InstancesResponse extends PaginatedResponse<Instance> {}

export interface DeploymentsResponse extends PaginatedResponse<Deployment> {}

export interface CreateInstanceResponse {
  instance: Instance;
  deployment: Deployment;
}

export interface UpdateInstanceResponse {
  instance: Instance;
  requiresRestart: boolean;
}

export interface RestartInstanceResponse {
  deployment: Deployment;
  estimatedDowntime: number; // seconds
}

export interface ScaleInstanceResponse {
  deployment: Deployment;
  newResourceLimits: ResourceRequirements;
  additionalCost: number; // monthly cost difference
}

export interface DeleteInstanceResponse {
  success: boolean;
  backupId?: string;
  message: string;
}

export interface MetricsResponse {
  period: string;
  interval: string;
  data: MetricDataPoint[];
}

export interface LogsResponse {
  logs: LogEntry[];
  hasMore: boolean;
  nextCursor?: string;
}

export interface DomainsResponse {
  domains: InstanceDomain[];
}

export interface BackupsResponse {
  backups: InstanceBackup[];
}

// WebSocket Event types
export interface WebSocketEvent<T = any> {
  type: string;
  payload: T;
  timestamp: string;
}

export interface InstanceStatusChangedEvent {
  instanceId: string;
  oldStatus: InstanceStatus;
  newStatus: InstanceStatus;
  timestamp: string;
}

export interface DeploymentProgressEvent {
  deploymentId: string;
  instanceId: string;
  progress: DeploymentProgress;
  timestamp: string;
}

export interface DeploymentCompletedEvent {
  deploymentId: string;
  instanceId: string;
  status: DeploymentStatus;
  duration: number;
  timestamp: string;
}

export interface MetricsUpdatedEvent {
  instanceId: string;
  metrics: Pick<InstanceMetrics, 'performance' | 'usage'>;
  timestamp: string;
}

export interface LogsNewEntryEvent {
  instanceId: string;
  log: LogEntry;
  timestamp: string;
}

export type DeploymentWebSocketEvents = {
  'instance.status_changed': InstanceStatusChangedEvent;
  'deployment.started': { deploymentId: string; instanceId: string; type: DeploymentType };
  'deployment.progress': DeploymentProgressEvent;
  'deployment.completed': DeploymentCompletedEvent;
  'deployment.failed': { deploymentId: string; instanceId: string; error: string };
  'logs.new_entry': LogsNewEntryEvent;
  'metrics.updated': MetricsUpdatedEvent;
};

// Service interfaces
export interface ITemplateService {
  getTemplates(filters?: TemplateFilters, pagination?: PaginationParams): Promise<TemplatesResponse>;
  getTemplate(id: string): Promise<Template>;
  createTemplate(input: CreateTemplateRequest): Promise<Template>;
  updateTemplate(id: string, input: Partial<CreateTemplateRequest>): Promise<Template>;
  deleteTemplate(id: string): Promise<void>;
  syncWithRailway(): Promise<void>;
}

export interface IInstanceService {
  createInstance(userId: string, input: CreateInstanceRequest): Promise<CreateInstanceResponse>;
  getInstance(instanceId: string, userId?: string): Promise<Instance>;
  getUserInstances(userId: string, filters?: InstanceFilters, pagination?: PaginationParams): Promise<InstancesResponse>;
  updateInstance(instanceId: string, userId: string, updates: UpdateInstanceRequest): Promise<UpdateInstanceResponse>;
  deleteInstance(instanceId: string, userId: string, options?: { force?: boolean; backup?: boolean }): Promise<DeleteInstanceResponse>;
  restartInstance(instanceId: string, userId: string): Promise<RestartInstanceResponse>;
  scaleInstance(instanceId: string, userId: string, resources: ScaleInstanceRequest): Promise<ScaleInstanceResponse>;
}

export interface IDeploymentService {
  getDeployments(instanceId: string, filters?: DeploymentFilters, pagination?: PaginationParams): Promise<DeploymentsResponse>;
  getDeployment(deploymentId: string): Promise<Deployment>;
  deployInstance(instanceId: string, userId: string, request: DeployInstanceRequest): Promise<Deployment>;
  cancelDeployment(deploymentId: string, userId: string): Promise<void>;
  rollbackDeployment(deploymentId: string, userId: string, targetDeploymentId?: string): Promise<Deployment>;
  getDeploymentLogs(deploymentId: string, options?: { limit?: number; since?: string }): Promise<LogsResponse>;
}

export interface IDomainService {
  getDomains(instanceId: string): Promise<DomainsResponse>;
  addDomain(instanceId: string, domain: AddDomainRequest): Promise<InstanceDomain>;
  removeDomain(instanceId: string, domainId: string): Promise<void>;
  setPrimaryDomain(instanceId: string, domainId: string): Promise<void>;
  verifyDomain(domainId: string): Promise<boolean>;
}

export interface IMetricsService {
  getInstanceMetrics(instanceId: string, period: string, metrics?: string[]): Promise<MetricsResponse>;
  getMetricsHistory(instanceId: string, period: string, interval: string): Promise<MetricDataPoint[]>;
  recordMetric(instanceId: string, metric: Partial<MetricDataPoint>): Promise<void>;
}

export interface IBackupService {
  getBackups(instanceId: string): Promise<BackupsResponse>;
  createBackup(instanceId: string, name: string, type?: BackupType): Promise<InstanceBackup>;
  restoreBackup(instanceId: string, backupId: string): Promise<Deployment>;
  deleteBackup(backupId: string): Promise<void>;
}

// Event Bus types
export interface IEventBus {
  publish<T extends keyof DeploymentWebSocketEvents>(
    event: T,
    payload: DeploymentWebSocketEvents[T]
  ): Promise<void>;
  
  subscribe<T extends keyof DeploymentWebSocketEvents>(
    event: T,
    handler: (payload: DeploymentWebSocketEvents[T]) => Promise<void>
  ): void;
  
  unsubscribe(event: string, handler: Function): void;
}

// Configuration types
export interface RailwayConfig {
  apiKey: string;
  apiUrl?: string;
  timeout?: number;
  retries?: number;
}

export interface DeploymentConfig {
  railway: RailwayConfig;
  database: {
    url: string;
    maxConnections?: number;
  };
  redis: {
    url: string;
  };
  encryption: {
    key: string;
    algorithm?: string;
  };
  monitoring: {
    enabled: boolean;
    sentry?: {
      dsn: string;
    };
  };
  features: {
    autoScaling: boolean;
    backups: boolean;
    customDomains: boolean;
    realTimeUpdates: boolean;
  };
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = 
  Pick<T, Exclude<keyof T, Keys>> & 
  { [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>> }[Keys];

export type WithTimestamps<T> = T & {
  createdAt: string;
  updatedAt: string;
};

export type WithSoftDelete<T> = T & {
  deletedAt?: string;
};

// Export all types
export type {
  // Re-export commonly used types for convenience
  Template as DeploymentTemplate,
  Instance as DeploymentInstance,
  Deployment as DeploymentDeployment,
  InstanceMetrics as DeploymentMetrics,
  LogEntry as DeploymentLogEntry,
  MetricDataPoint as DeploymentMetricDataPoint,
};