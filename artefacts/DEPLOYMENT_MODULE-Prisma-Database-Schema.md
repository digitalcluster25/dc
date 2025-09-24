// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["fullTextSearch", "fullTextIndex"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// DEPLOYMENT_MODULE Enums
enum TemplateCategory {
  cms
  ecommerce
  api
  static
  database
  ai
  analytics
  other
}

enum PricingTier {
  starter
  pro
  business
  enterprise
}

enum TemplateComplexity {
  simple
  medium
  complex
}

enum TemplateStatus {
  active
  deprecated
  maintenance
}

enum InstanceStatus {
  pending
  creating
  building
  deploying
  running
  stopped
  stopping
  starting
  updating
  failed
  deleting
}

enum HealthStatus {
  healthy
  unhealthy
  unknown
  degraded
}

enum DomainType {
  generated
  custom
}

enum DomainStatus {
  pending
  active
  failed
  expired
}

enum SslStatus {
  pending
  active
  failed
  expired
}

enum EnvVarSource {
  user
  template
  system
  inherited
}

enum DeploymentType {
  create
  update
  restart
  scale
  rollback
  stop
  start
}

enum DeploymentStatus {
  pending
  queued
  in_progress
  success
  failed
  cancelled
  rolled_back
}

enum TriggerType {
  manual
  api
  webhook
  scheduled
  system
}

enum LogLevel {
  debug
  info
  warn
  error
  fatal
}

enum LogSource {
  system
  railway
  application
  build
}

enum BackupType {
  manual
  scheduled
  pre_deployment
  pre_deletion
}

enum BackupStatus {
  creating
  completed
  failed
  expired
  deleted
}

// User model from AUTH_MODULE (external reference)
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      String   @default("user")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // DEPLOYMENT_MODULE Relations
  instances   Instance[]
  deployments Deployment[] @relation("DeploymentTriggeredBy")

  @@map("users")
}

// TEMPLATES
model Template {
  id          String   @id @default(cuid())
  name        String   @unique // internal name: wordpress-cms
  displayName String // WordPress CMS
  description String
  category    TemplateCategory
  icon        String? // URL to icon
  featured    Boolean  @default(false)

  // Railway Integration
  railwayTemplateId  String? @unique // Railway Template ID
  railwayTemplateUrl String?
  version            String  @default("1.0.0")

  // Pricing & Resources
  pricingTier  PricingTier @default(starter)
  monthlyPrice Decimal     @default(0.00) @db.Decimal(10, 2)
  setupFee     Decimal?    @default(0.00) @db.Decimal(10, 2)

  // Requirements
  minCpu     String @default("0.5") // "0.5", "1", "2"
  minMemory  String @default("512MB") // "512MB", "1GB"
  minStorage String @default("1GB") // "1GB", "5GB"

  // Metadata
  tags                String[]
  setupTimeMinutes    Int               @default(5)
  complexity          TemplateComplexity @default(simple)
  supportedLanguages  String[]
  requiredServices    String[]

  // Features
  customDomain  Boolean @default(true)
  sslIncluded   Boolean @default(true)
  backupEnabled Boolean @default(false)
  autoScaling   Boolean @default(false)

  // Status
  status                TemplateStatus @default(active)
  deprecatedAt          DateTime?
  replacementTemplateId String?
  replacementTemplate   Template? @relation("TemplateReplacement", fields: [replacementTemplateId], references: [id])
  replacedBy            Template? @relation("TemplateReplacement")

  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  configs   TemplateConfig[]
  instances Instance[]

  // Indexes
  @@index([category])
  @@index([pricingTier])
  @@index([status, featured])
  @@index([name])
  @@map("templates")
}

model TemplateConfig {
  id         String @id @default(cuid())
  templateId String
  template   Template @relation(fields: [templateId], references: [id], onDelete: Cascade)

  // Build Configuration
  buildCommand     String?
  startCommand     String?
  dockerfileContent String?
  healthCheckPath  String? @default("/health")
  ports            Int[]   @default([3000]) // exposed ports

  // Environment Variables
  defaultEnvironment  Json    @default("{}")
  requiredEnvironment String[] @default([])
  optionalEnvironment String[] @default([])
  secretEnvironment   String[] @default([]) // keys that should be encrypted

  // Railway Specific
  railwayConfig       Json     @default("{}")
  serviceDependencies String[] @default([])

  // Validation Rules
  validationRules Json @default("{}")

  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([templateId])
  @@map("template_configs")
}

// INSTANCES
model Instance {
  id          String @id @default(cuid())
  name        String
  description String?

  // Relations
  userId         String
  user           User     @relation(fields: [userId], references: [id])
  templateId     String
  template       Template @relation(fields: [templateId], references: [id])
  subscriptionId String? // from BILLING_MODULE (nullable for free tier)

  // Railway Integration
  railwayProjectId     String?
  railwayServiceId     String?
  railwayEnvironmentId String?

  // Instance Status
  status       InstanceStatus @default(pending)
  healthStatus HealthStatus   @default(unknown)

  // Resource Configuration
  allocatedCpu     String @default("0.5")
  allocatedMemory  String @default("512MB")
  allocatedStorage String @default("1GB")
  replicaCount     Int    @default(1)

  // Resource Usage (cached values)
  currentCpuUsage     Decimal? @db.Decimal(5, 2) // percentage
  currentMemoryUsage  String?  @default("0MB")
  currentStorageUsage String?  @default("0MB")

  // Networking
  internalUrl String?

  // Monitoring
  uptimePercentage  Decimal?  @db.Decimal(5, 2) @default(100.00)
  lastHealthCheck   DateTime?
  lastDeployedAt    DateTime?

  // Billing
  monthlyCost      Decimal?  @db.Decimal(10, 2) @default(0.00)
  lastBillingSync  DateTime?

  // Metadata
  tenantPrefix String @unique // user-{userId}-{serviceType}-{instanceId}
  metadata     Json   @default("{}")

  // Timestamps
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime? // soft delete

  // Relations
  domains      InstanceDomain[]
  environments InstanceEnvironment[]
  deployments  Deployment[]
  metrics      InstanceMetric[]
  backups      InstanceBackup[]

  // Constraints and Indexes
  @@unique([userId, name], name: "unique_user_instance_name")
  @@index([userId])
  @@index([templateId])
  @@index([status])
  @@index([railwayServiceId])
  @@index([tenantPrefix])
  @@index([createdAt])
  @@index([deletedAt])
  @@map("instances")
}

model InstanceDomain {
  id         String @id @default(cuid())
  instanceId String
  instance   Instance @relation(fields: [instanceId], references: [id], onDelete: Cascade)

  // Domain Configuration
  domain    String     @unique
  type      DomainType
  isPrimary Boolean    @default(false)

  // SSL Configuration
  sslEnabled       Boolean   @default(true)
  sslCertificateId String?
  sslStatus        SslStatus @default(pending)
  sslExpiresAt     DateTime?

  // Railway Integration
  railwayDomainId String? @unique

  // Status
  status            DomainStatus @default(pending)
  verificationToken String?
  dnsConfigured     Boolean      @default(false)

  // Timestamps
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
  verifiedAt DateTime?
  expiresAt  DateTime? // for generated domains

  @@index([instanceId])
  @@index([domain])
  @@index([type])
  @@map("instance_domains")
}

model InstanceEnvironment {
  id         String @id @default(cuid())
  instanceId String
  instance   Instance @relation(fields: [instanceId], references: [id], onDelete: Cascade)

  // Environment Variable
  key      String
  value    String? // encrypted for sensitive vars
  isSecret Boolean @default(false)
  isSystem Boolean @default(false) // managed by system, not editable

  // Metadata
  description String?
  source      EnvVarSource @default(user)

  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([instanceId, key])
  @@index([instanceId])
  @@index([key])
  @@index([isSecret])
  @@map("instance_environments")
}

// DEPLOYMENTS
model Deployment {
  id         String @id @default(cuid())
  instanceId String
  instance   Instance @relation(fields: [instanceId], references: [id], onDelete: Cascade)

  // Deployment Info
  type   DeploymentType
  status DeploymentStatus @default(pending)

  // Trigger Information
  triggeredByUserId String?
  triggeredBy       User?       @relation("DeploymentTriggeredBy", fields: [triggeredByUserId], references: [id])
  triggerType       TriggerType @default(manual)
  triggerSource     String? // API, webhook, scheduled job

  // Railway Integration
  railwayDeploymentId String? @unique
  railwayBuildId      String?

  // Changes
  changes        Json? @default("{}")
  previousConfig Json?

  // Progress Tracking
  currentStep      String?
  totalSteps       Int     @default(1)
  completedSteps   Int     @default(0)
  progressPercentage Int    @default(0) // 0-100

  // Timing
  startedAt           DateTime  @default(now())
  completedAt         DateTime?
  duration            Int? // seconds
  estimatedDuration   Int? // seconds

  // Error Information
  errorCode    String?
  errorMessage String?
  errorDetails Json?

  // Metadata
  metadata Json @default("{}")

  // Timestamps
  createdAt DateTime @default(now())

  // Relations
  logs DeploymentLog[]

  @@index([instanceId])
  @@index([status])
  @@index([type])
  @@index([startedAt])
  @@index([triggeredByUserId])
  @@map("deployments")
}

model DeploymentLog {
  id           String @id @default(cuid())
  deploymentId String
  deployment   Deployment @relation(fields: [deploymentId], references: [id], onDelete: Cascade)

  // Log Entry
  timestamp DateTime  @default(now())
  level     LogLevel  @default(info)
  message   String
  source    LogSource @default(system)

  // Context
  step      String?
  component String?
  metadata  Json    @default("{}")

  // Railway Integration
  railwayLogId String?

  // Timestamps
  createdAt DateTime @default(now())

  @@index([deploymentId])
  @@index([timestamp])
  @@index([level])
  @@map("deployment_logs")
}

// METRICS
model InstanceMetric {
  id         String @id @default(cuid())
  instanceId String
  instance   Instance @relation(fields: [instanceId], references: [id], onDelete: Cascade)

  // Timestamp
  recordedAt DateTime @default(now())

  // Resource Metrics
  cpuUsage     Decimal? @db.Decimal(5, 2) // percentage 0-100
  memoryUsage  BigInt? // bytes
  storageUsage BigInt? // bytes

  // Performance Metrics
  responseTime Integer? // milliseconds
  requestCount Integer? @default(0)
  errorCount   Integer? @default(0)

  // Network Metrics
  bandwidthIn  BigInt? @default(0) // bytes
  bandwidthOut BigInt? @default(0) // bytes

  // Health Metrics
  uptimeSeconds Integer? @default(0)
  healthScore   Integer? // 0-100

  // Metadata
  metadata Json @default("{}")

  @@index([instanceId, recordedAt])
  @@index([recordedAt])
  @@map("instance_metrics")
}

// BACKUPS
model InstanceBackup {
  id         String @id @default(cuid())
  instanceId String
  instance   Instance @relation(fields: [instanceId], references: [id], onDelete: Cascade)

  // Backup Info
  name        String
  description String?
  type        BackupType @default(manual)

  // Storage
  storageProvider String @default("railway") // railway, s3, etc
  storagePath     String?
  sizeBytes       BigInt?

  // Status
  status            BackupStatus @default(creating)
  progressPercentage Int         @default(0) // 0-100

  // Timing
  startedAt   DateTime  @default(now())
  completedAt DateTime?
  expiresAt   DateTime? // auto-deletion

  // Metadata
  configSnapshot Json @default("{}")
  metadata       Json @default("{}")

  // Timestamps
  createdAt DateTime @default(now())

  @@index([instanceId])
  @@index([status])
  @@index([expiresAt])
  @@map("instance_backups")
}

// CUSTOM FUNCTIONS AND TRIGGERS
// Note: These would be created via migrations, not in the schema

// Migration example for automatic updated_at trigger:
/*
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_instances_updated_at BEFORE UPDATE ON instances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
*/

// Migration example for tenant prefix generation:
/*
CREATE OR REPLACE FUNCTION generate_tenant_prefix()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.tenant_prefix IS NULL THEN
        NEW.tenant_prefix := format('user-%s-%s-%s', 
            NEW.user_id,
            (SELECT name FROM templates WHERE id = NEW.template_id),
            NEW.id
        );
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER generate_instance_tenant_prefix BEFORE INSERT ON instances
    FOR EACH ROW EXECUTE FUNCTION generate_tenant_prefix();
*/

// Migration example for deployment progress calculation:
/*
CREATE OR REPLACE FUNCTION calculate_deployment_progress()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.total_steps > 0 THEN
        NEW.progress_percentage := ROUND((NEW.completed_steps::DECIMAL / NEW.total_steps::DECIMAL) * 100);
    END IF;
    
    -- Calculate duration if deployment completed
    IF NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL THEN
        NEW.duration := EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at));
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER calculate_deployments_progress BEFORE UPDATE ON deployments
    FOR EACH ROW EXECUTE FUNCTION calculate_deployment_progress();
*/