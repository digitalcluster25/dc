-- migrations/001_create_deployment_tables.sql
-- DEPLOYMENT_MODULE Initial Migration

-- Create Enums
CREATE TYPE template_category AS ENUM (
    'cms', 'ecommerce', 'api', 'static', 'database', 'ai', 'analytics', 'other'
);

CREATE TYPE pricing_tier AS ENUM ('starter', 'pro', 'business', 'enterprise');

CREATE TYPE template_complexity AS ENUM ('simple', 'medium', 'complex');

CREATE TYPE template_status AS ENUM ('active', 'deprecated', 'maintenance');

CREATE TYPE instance_status AS ENUM (
    'pending', 'creating', 'building', 'deploying', 'running', 
    'stopped', 'stopping', 'starting', 'updating', 'failed', 'deleting'
);

CREATE TYPE health_status AS ENUM ('healthy', 'unhealthy', 'unknown', 'degraded');

CREATE TYPE domain_type AS ENUM ('generated', 'custom');

CREATE TYPE domain_status AS ENUM ('pending', 'active', 'failed', 'expired');

CREATE TYPE ssl_status AS ENUM ('pending', 'active', 'failed', 'expired');

CREATE TYPE env_var_source AS ENUM ('user', 'template', 'system', 'inherited');

CREATE TYPE deployment_type AS ENUM (
    'create', 'update', 'restart', 'scale', 'rollback', 'stop', 'start'
);

CREATE TYPE deployment_status AS ENUM (
    'pending', 'queued', 'in_progress', 'success', 'failed', 'cancelled', 'rolled_back'
);

CREATE TYPE trigger_type AS ENUM ('manual', 'api', 'webhook', 'scheduled', 'system');

CREATE TYPE log_level AS ENUM ('debug', 'info', 'warn', 'error', 'fatal');

CREATE TYPE log_source AS ENUM ('system', 'railway', 'application', 'build');

CREATE TYPE backup_type AS ENUM ('manual', 'scheduled', 'pre_deployment', 'pre_deletion');

CREATE TYPE backup_status AS ENUM ('creating', 'completed', 'failed', 'expired', 'deleted');

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- TEMPLATES
-- =============================================

CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category template_category NOT NULL,
    icon VARCHAR(500),
    featured BOOLEAN DEFAULT false,
    
    -- Railway Integration
    railway_template_id VARCHAR(100) UNIQUE,
    railway_template_url VARCHAR(500),
    version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
    
    -- Pricing & Resources
    pricing_tier pricing_tier NOT NULL DEFAULT 'starter',
    monthly_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    setup_fee DECIMAL(10,2) DEFAULT 0.00,
    
    -- Requirements
    min_cpu VARCHAR(20) DEFAULT '0.5',
    min_memory VARCHAR(20) DEFAULT '512MB',
    min_storage VARCHAR(20) DEFAULT '1GB',
    
    -- Metadata
    tags TEXT[] DEFAULT '{}',
    setup_time_minutes INTEGER DEFAULT 5,
    complexity template_complexity DEFAULT 'simple',
    supported_languages TEXT[] DEFAULT '{}',
    required_services TEXT[] DEFAULT '{}',
    
    -- Features
    custom_domain BOOLEAN DEFAULT true,
    ssl_included BOOLEAN DEFAULT true,
    backup_enabled BOOLEAN DEFAULT false,
    auto_scaling BOOLEAN DEFAULT false,
    
    -- Status
    status template_status DEFAULT 'active',
    deprecated_at TIMESTAMP WITH TIME ZONE,
    replacement_template_id UUID REFERENCES templates(id),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT templates_name_check CHECK (name ~ '^[a-z0-9-]+$')
);

-- Templates Indexes
CREATE INDEX idx_templates_category ON templates(category);
CREATE INDEX idx_templates_pricing_tier ON templates(pricing_tier);
CREATE INDEX idx_templates_status ON templates(status) WHERE status = 'active';
CREATE INDEX idx_templates_featured ON templates(featured) WHERE featured = true;
CREATE INDEX idx_templates_railway_template_id ON templates(railway_template_id) WHERE railway_template_id IS NOT NULL;

-- =============================================
-- TEMPLATE CONFIGS
-- =============================================

CREATE TABLE template_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    
    -- Build Configuration
    build_command TEXT,
    start_command TEXT,
    dockerfile_content TEXT,
    health_check_path VARCHAR(255) DEFAULT '/health',
    ports INTEGER[] DEFAULT ARRAY[3000],
    
    -- Environment Variables
    default_environment JSONB DEFAULT '{}',
    required_environment TEXT[] DEFAULT '{}',
    optional_environment TEXT[] DEFAULT '{}',
    secret_environment TEXT[] DEFAULT '{}',
    
    -- Railway Specific
    railway_config JSONB DEFAULT '{}',
    service_dependencies TEXT[] DEFAULT '{}',
    
    -- Validation Rules
    validation_rules JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_template_configs_template_id ON template_configs(template_id);

-- =============================================
-- INSTANCES
-- =============================================

CREATE TABLE instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Relations
    user_id UUID NOT NULL, -- from AUTH_MODULE
    template_id UUID NOT NULL REFERENCES templates(id),
    subscription_id UUID, -- from BILLING_MODULE (nullable for free tier)
    
    -- Railway Integration
    railway_project_id VARCHAR(100),
    railway_service_id VARCHAR(100),
    railway_environment_id VARCHAR(100),
    
    -- Instance Status
    status instance_status DEFAULT 'pending',
    health_status health_status DEFAULT 'unknown',
    
    -- Resource Configuration
    allocated_cpu VARCHAR(20) NOT NULL DEFAULT '0.5',
    allocated_memory VARCHAR(20) NOT NULL DEFAULT '512MB',
    allocated_storage VARCHAR(20) NOT NULL DEFAULT '1GB',
    replica_count INTEGER DEFAULT 1,
    
    -- Resource Usage (cached values)
    current_cpu_usage DECIMAL(5,2) DEFAULT 0.00,
    current_memory_usage VARCHAR(20) DEFAULT '0MB',
    current_storage_usage VARCHAR(20) DEFAULT '0MB',
    
    -- Networking
    internal_url VARCHAR(500),
    
    -- Monitoring
    uptime_percentage DECIMAL(5,2) DEFAULT 100.00,
    last_health_check TIMESTAMP WITH TIME ZONE,
    last_deployed_at TIMESTAMP WITH TIME ZONE,
    
    -- Billing
    monthly_cost DECIMAL(10,2) DEFAULT 0.00,
    last_billing_sync TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    tenant_prefix VARCHAR(100) NOT NULL UNIQUE,
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE, -- soft delete
    
    -- Constraints
    CONSTRAINT instances_name_length CHECK (LENGTH(name) >= 3),
    CONSTRAINT instances_tenant_prefix_format CHECK (
        tenant_prefix ~ '^user-[a-f0-9-]+-[a-z0-9-]+-[a-f0-9-]+$'
    )
);

-- Create unique constraint for user + name combination (excluding deleted)
CREATE UNIQUE INDEX idx_instances_unique_user_name 
ON instances(user_id, name) 
WHERE deleted_at IS NULL;

-- Instances Indexes
CREATE INDEX idx_instances_user_id ON instances(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_instances_template_id ON instances(template_id);
CREATE INDEX idx_instances_status ON instances(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_instances_railway_service ON instances(railway_service_id) WHERE railway_service_id IS NOT NULL;
CREATE INDEX idx_instances_tenant_prefix ON instances(tenant_prefix);
CREATE INDEX idx_instances_created_at ON instances(created_at);

-- =============================================
-- INSTANCE DOMAINS
-- =============================================

CREATE TABLE instance_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id UUID NOT NULL REFERENCES instances(id) ON DELETE CASCADE,
    
    -- Domain Configuration
    domain VARCHAR(255) NOT NULL UNIQUE,
    type domain_type NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    
    -- SSL Configuration
    ssl_enabled BOOLEAN DEFAULT true,
    ssl_certificate_id VARCHAR(100),
    ssl_status ssl_status DEFAULT 'pending',
    ssl_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Railway Integration
    railway_domain_id VARCHAR(100) UNIQUE,
    
    -- Status
    status domain_status DEFAULT 'pending',
    verification_token VARCHAR(255),
    dns_configured BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE -- for generated domains
);

-- Ensure only one primary domain per instance
CREATE UNIQUE INDEX idx_instance_domains_one_primary 
ON instance_domains(instance_id) 
WHERE is_primary = true;

-- Instance Domains Indexes
CREATE INDEX idx_instance_domains_instance_id ON instance_domains(instance_id);
CREATE INDEX idx_instance_domains_domain ON instance_domains(domain);
CREATE INDEX idx_instance_domains_type ON instance_domains(type);
CREATE INDEX idx_instance_domains_railway_id ON instance_domains(railway_domain_id) WHERE railway_domain_id IS NOT NULL;

-- =============================================
-- INSTANCE ENVIRONMENTS
-- =============================================

CREATE TABLE instance_environments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id UUID NOT NULL REFERENCES instances(id) ON DELETE CASCADE,
    
    -- Environment Variable
    key VARCHAR(255) NOT NULL,
    value TEXT, -- encrypted for sensitive vars
    is_secret BOOLEAN DEFAULT false,
    is_system BOOLEAN DEFAULT false, -- managed by system, not editable
    
    -- Metadata
    description TEXT,
    source env_var_source DEFAULT 'user',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(instance_id, key)
);

-- Instance Environments Indexes
CREATE INDEX idx_instance_envs_instance_id ON instance_environments(instance_id);
CREATE INDEX idx_instance_envs_key ON instance_environments(key);
CREATE INDEX idx_instance_envs_is_secret ON instance_environments(is_secret) WHERE is_secret = true;

-- =============================================
-- DEPLOYMENTS
-- =============================================

CREATE TABLE deployments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id UUID NOT NULL REFERENCES instances(id) ON DELETE CASCADE,
    
    -- Deployment Info
    type deployment_type NOT NULL,
    status deployment_status DEFAULT 'pending',
    
    -- Trigger Information
    triggered_by_user_id UUID, -- who triggered this deployment
    trigger_type trigger_type DEFAULT 'manual',
    trigger_source VARCHAR(255), -- API, webhook, scheduled job
    
    -- Railway Integration
    railway_deployment_id VARCHAR(100) UNIQUE,
    railway_build_id VARCHAR(100),
    
    -- Changes
    changes JSONB DEFAULT '{}',
    previous_config JSONB,
    
    -- Progress Tracking
    current_step VARCHAR(100),
    total_steps INTEGER DEFAULT 1,
    completed_steps INTEGER DEFAULT 0,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    duration INTEGER, -- seconds
    estimated_duration INTEGER, -- seconds
    
    -- Error Information
    error_code VARCHAR(100),
    error_message TEXT,
    error_details JSONB,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT deployments_duration_check CHECK (
        (completed_at IS NULL) OR (duration >= 0)
    ),
    CONSTRAINT deployments_steps_check CHECK (
        completed_steps <= total_steps AND completed_steps >= 0
    )
);

-- Deployments Indexes
CREATE INDEX idx_deployments_instance_id ON deployments(instance_id);
CREATE INDEX idx_deployments_status ON deployments(status);
CREATE INDEX idx_deployments_type ON deployments(type);
CREATE INDEX idx_deployments_started_at ON deployments(started_at DESC);
CREATE INDEX idx_deployments_user_id ON deployments(triggered_by_user_id) WHERE triggered_by_user_id IS NOT NULL;
CREATE INDEX idx_deployments_railway_id ON deployments(railway_deployment_id) WHERE railway_deployment_id IS NOT NULL;

-- =============================================
-- DEPLOYMENT LOGS
-- =============================================

CREATE TABLE deployment_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deployment_id UUID NOT NULL REFERENCES deployments(id) ON DELETE CASCADE,
    
    -- Log Entry
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    level log_level DEFAULT 'info',
    message TEXT NOT NULL,
    source log_source DEFAULT 'system',
    
    -- Context
    step VARCHAR(100),
    component VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    
    -- Railway Integration
    railway_log_id VARCHAR(100),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deployment Logs Indexes
CREATE INDEX idx_deployment_logs_deployment_id ON deployment_logs(deployment_id);
CREATE INDEX idx_deployment_logs_timestamp ON deployment_logs(timestamp DESC);
CREATE INDEX idx_deployment_logs_level ON deployment_logs(level);

-- =============================================
-- INSTANCE METRICS
-- =============================================

CREATE TABLE instance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id UUID NOT NULL REFERENCES instances(id) ON DELETE CASCADE,
    
    -- Timestamp
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Resource Metrics
    cpu_usage DECIMAL(5,2), -- percentage 0-100
    memory_usage BIGINT, -- bytes
    storage_usage BIGINT, -- bytes
    
    -- Performance Metrics
    response_time INTEGER, -- milliseconds
    request_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    
    -- Network Metrics
    bandwidth_in BIGINT DEFAULT 0, -- bytes
    bandwidth_out BIGINT DEFAULT 0, -- bytes
    
    -- Health Metrics
    uptime_seconds INTEGER DEFAULT 0,
    health_score INTEGER CHECK (health_score BETWEEN 0 AND 100),
    
    -- Metadata
    metadata JSONB DEFAULT '{}'
);

-- Instance Metrics Indexes (Time-series optimized)
CREATE INDEX idx_instance_metrics_instance_time ON instance_metrics(instance_id, recorded_at DESC);
CREATE INDEX idx_instance_metrics_recorded_at ON instance_metrics(recorded_at DESC);

-- =============================================
-- INSTANCE BACKUPS
-- =============================================

CREATE TABLE instance_backups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id UUID NOT NULL REFERENCES instances(id) ON DELETE CASCADE,
    
    -- Backup Info
    name VARCHAR(200) NOT NULL,
    description TEXT,
    type backup_type DEFAULT 'manual',
    
    -- Storage
    storage_provider VARCHAR(50) DEFAULT 'railway',
    storage_path VARCHAR(500),
    size_bytes BIGINT,
    
    -- Status
    status backup_status DEFAULT 'creating',
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE, -- auto-deletion
    
    -- Metadata
    config_snapshot JSONB,
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Instance Backups Indexes
CREATE INDEX idx_instance_backups_instance_id ON instance_backups(instance_id);
CREATE INDEX idx_instance_backups_status ON instance_backups(status);
CREATE INDEX idx_instance_backups_expires_at ON instance_backups(expires_at) WHERE expires_at IS NOT NULL;

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to automatically update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_templates_updated_at 
    BEFORE UPDATE ON templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_template_configs_updated_at 
    BEFORE UPDATE ON template_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_instances_updated_at 
    BEFORE UPDATE ON instances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_instance_domains_updated_at 
    BEFORE UPDATE ON instance_domains
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_instance_environments_updated_at 
    BEFORE UPDATE ON instance_environments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate tenant prefix
CREATE OR REPLACE FUNCTION generate_tenant_prefix()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.tenant_prefix IS NULL OR NEW.tenant_prefix = '' THEN
        NEW.tenant_prefix := format('user-%s-%s-%s', 
            NEW.user_id,
            (SELECT REPLACE(name, '_', '-') FROM templates WHERE id = NEW.template_id),
            NEW.id
        );
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER generate_instance_tenant_prefix 
    BEFORE INSERT ON instances
    FOR EACH ROW EXECUTE FUNCTION generate_tenant_prefix();

-- Function to calculate deployment progress
CREATE OR REPLACE FUNCTION calculate_deployment_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate progress percentage
    IF NEW.total_steps > 0 THEN
        NEW.progress_percentage := ROUND((NEW.completed_steps::DECIMAL / NEW.total_steps::DECIMAL) * 100);
    END IF;
    
    -- Calculate duration if deployment completed
    IF NEW.completed_at IS NOT NULL AND (OLD.completed_at IS NULL OR OLD.completed_at != NEW.completed_at) THEN
        NEW.duration := EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at))::INTEGER;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER calculate_deployments_progress 
    BEFORE UPDATE ON deployments
    FOR EACH ROW EXECUTE FUNCTION calculate_deployment_progress();

-- Function to clean up old metrics (called by background job)
CREATE OR REPLACE FUNCTION cleanup_old_metrics()
RETURNS void AS $$
BEGIN
    -- Delete metrics older than 90 days
    DELETE FROM instance_metrics 
    WHERE recorded_at < NOW() - INTERVAL '90 days';
    
    -- Delete deployment logs older than 90 days for completed deployments
    DELETE FROM deployment_logs 
    WHERE created_at < NOW() - INTERVAL '90 days'
    AND deployment_id IN (
        SELECT id FROM deployments 
        WHERE status IN ('success', 'failed', 'cancelled')
        AND completed_at < NOW() - INTERVAL '30 days'
    );
    
    -- Delete expired backups
    DELETE FROM instance_backups 
    WHERE expires_at < NOW() 
    AND status != 'creating';
END;
$$ language 'plpgsql';

-- =============================================
-- INITIAL DATA AND INDEXES
-- =============================================

-- Create indexes for foreign key relationships
CREATE INDEX idx_template_configs_template_foreign ON template_configs(template_id);
CREATE INDEX idx_instances_template_foreign ON instances(template_id);
CREATE INDEX idx_instance_domains_instance_foreign ON instance_domains(instance_id);
CREATE INDEX idx_instance_environments_instance_foreign ON instance_environments(instance_id);
CREATE INDEX idx_deployments_instance_foreign ON deployments(instance_id);
CREATE INDEX idx_deployment_logs_deployment_foreign ON deployment_logs(deployment_id);
CREATE INDEX idx_instance_metrics_instance_foreign ON instance_metrics(instance_id);
CREATE INDEX idx_instance_backups_instance_foreign ON instance_backups(instance_id);

-- Full-text search indexes for templates
CREATE INDEX idx_templates_search 
ON templates USING gin(
    to_tsvector('english', display_name || ' ' || description || ' ' || array_to_string(tags, ' '))
);

-- Partial indexes for performance
CREATE INDEX idx_active_instances ON instances(user_id, status) 
WHERE deleted_at IS NULL AND status IN ('running', 'stopped', 'failed');

CREATE INDEX idx_active_deployments ON deployments(instance_id, status) 
WHERE status IN ('pending', 'in_progress');

CREATE INDEX idx_recent_metrics ON instance_metrics(instance_id, recorded_at DESC) 
WHERE recorded_at > NOW() - INTERVAL '7 days';

-- =============================================
-- PERMISSIONS AND SECURITY
-- =============================================

-- Enable Row Level Security on sensitive tables
ALTER TABLE instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE instance_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE instance_environments ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE instance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE instance_backups ENABLE ROW LEVEL SECURITY;

-- RLS Policies will be created in a separate migration
-- after AUTH_MODULE is integrated

-- =============================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON TABLE templates IS 'Available deployment templates with metadata and configuration';
COMMENT ON TABLE template_configs IS 'Configuration settings for deployment templates';
COMMENT ON TABLE instances IS 'User instances deployed from templates';
COMMENT ON TABLE instance_domains IS 'Domain configurations for instances';
COMMENT ON TABLE instance_environments IS 'Environment variables for instances';
COMMENT ON TABLE deployments IS 'Deployment history and progress tracking';
COMMENT ON TABLE deployment_logs IS 'Detailed logs for deployment processes';
COMMENT ON TABLE instance_metrics IS 'Performance and resource usage metrics';
COMMENT ON TABLE instance_backups IS 'Backup management for instances';

COMMENT ON COLUMN instances.tenant_prefix IS 'Unique identifier for multi-tenant isolation';
COMMENT ON COLUMN instances.railway_service_id IS 'Railway service identifier for API calls';
COMMENT ON COLUMN deployments.progress_percentage IS 'Calculated progress based on completed/total steps';
COMMENT ON COLUMN instance_environments.value IS 'Encrypted for sensitive variables marked as secrets';

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Verify tables were created
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN (
        'templates', 'template_configs', 'instances', 'instance_domains',
        'instance_environments', 'deployments', 'deployment_logs',
        'instance_metrics', 'instance_backups'
    );
    
    IF table_count != 9 THEN
        RAISE EXCEPTION 'Expected 9 tables, found %', table_count;
    END IF;
    
    RAISE NOTICE 'DEPLOYMENT_MODULE tables created successfully: % tables', table_count;
END $$;

-- Verify indexes were created
DO $$
DECLARE
    index_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO index_count 
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND indexname LIKE 'idx_%';
    
    RAISE NOTICE 'DEPLOYMENT_MODULE indexes created: % indexes', index_count;
END $$;