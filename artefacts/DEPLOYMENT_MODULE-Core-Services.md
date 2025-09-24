// src/services/deployment/TemplateService.ts
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { railwayClient } from '@/lib/railway/client';
import { logger } from '@/utils/logger';
import { validateTemplate } from '@/utils/validators/templateValidator';
import { TemplateNotFoundError, TemplateValidationError } from '@/utils/errors';

export interface TemplateFilters {
  category?: string;
  pricingTier?: string;
  complexity?: string;
  search?: string;
  featured?: boolean;
}

export interface CreateTemplateInput {
  name: string;
  displayName: string;
  description: string;
  category: string;
  icon?: string;
  featured?: boolean;
  railwayTemplateId?: string;
  pricingTier: string;
  monthlyPrice: number;
  minCpu: string;
  minMemory: string;
  minStorage: string;
  tags?: string[];
  setupTimeMinutes?: number;
  complexity?: string;
  supportedLanguages?: string[];
  requiredServices?: string[];
  customDomain?: boolean;
  sslIncluded?: boolean;
  backupEnabled?: boolean;
  autoScaling?: boolean;
}

export class TemplateService {
  async getTemplates(filters: TemplateFilters = {}, pagination = { skip: 0, take: 20 }) {
    const where: Prisma.TemplateWhereInput = {
      status: 'active',
      deletedAt: null,
    };

    // Apply filters
    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.pricingTier) {
      where.pricingTier = filters.pricingTier;
    }

    if (filters.complexity) {
      where.complexity = filters.complexity;
    }

    if (filters.featured !== undefined) {
      where.featured = filters.featured;
    }

    if (filters.search) {
      where.OR = [
        { displayName: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { tags: { has: filters.search } },
      ];
    }

    const [templates, total] = await Promise.all([
      prisma.template.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: [
          { featured: 'desc' },
          { createdAt: 'desc' }
        ],
        include: {
          configs: true,
        },
      }),
      prisma.template.count({ where }),
    ]);

    return {
      templates,
      total,
      hasMore: pagination.skip + pagination.take < total,
    };
  }

  async getTemplate(id: string) {
    const template = await prisma.template.findFirst({
      where: {
        id,
        status: 'active',
        deletedAt: null,
      },
      include: {
        configs: true,
      },
    });

    if (!template) {
      throw new TemplateNotFoundError(id);
    }

    return template;
  }

  async createTemplate(input: CreateTemplateInput) {
    // Validate template data
    const validation = await validateTemplate(input);
    if (!validation.isValid) {
      throw new TemplateValidationError(validation.errors);
    }

    // Check if template name is unique
    const existingTemplate = await prisma.template.findUnique({
      where: { name: input.name },
    });

    if (existingTemplate) {
      throw new TemplateValidationError(['Template name already exists']);
    }

    // Validate Railway template if provided
    if (input.railwayTemplateId) {
      await this.validateRailwayTemplate(input.railwayTemplateId);
    }

    const template = await prisma.template.create({
      data: {
        ...input,
        version: '1.0.0',
        status: 'active',
      },
      include: {
        configs: true,
      },
    });

    logger.info('Template created', { templateId: template.id, name: template.name });

    return template;
  }

  async updateTemplate(id: string, input: Partial<CreateTemplateInput>) {
    const template = await this.getTemplate(id);

    // Validate updates
    if (input.name && input.name !== template.name) {
      const existingTemplate = await prisma.template.findFirst({
        where: { 
          name: input.name,
          id: { not: id },
        },
      });

      if (existingTemplate) {
        throw new TemplateValidationError(['Template name already exists']);
      }
    }

    const updatedTemplate = await prisma.template.update({
      where: { id },
      data: {
        ...input,
        updatedAt: new Date(),
      },
      include: {
        configs: true,
      },
    });

    logger.info('Template updated', { templateId: id, changes: Object.keys(input) });

    return updatedTemplate;
  }

  async deleteTemplate(id: string) {
    const template = await this.getTemplate(id);

    // Check if template is used by any instances
    const instanceCount = await prisma.instance.count({
      where: {
        templateId: id,
        deletedAt: null,
      },
    });

    if (instanceCount > 0) {
      throw new TemplateValidationError([
        `Cannot delete template. ${instanceCount} instances are using this template.`
      ]);
    }

    // Soft delete
    await prisma.template.update({
      where: { id },
      data: {
        status: 'deprecated',
        deletedAt: new Date(),
      },
    });

    logger.info('Template deleted', { templateId: id });
  }

  async syncWithRailway() {
    try {
      const railwayTemplates = await railwayClient.getTemplates();
      
      for (const railwayTemplate of railwayTemplates) {
        const existingTemplate = await prisma.template.findUnique({
          where: { railwayTemplateId: railwayTemplate.id },
        });

        if (!existingTemplate) {
          // Create new template from Railway
          await this.createTemplateFromRailway(railwayTemplate);
        } else {
          // Update existing template
          await this.updateTemplateFromRailway(existingTemplate.id, railwayTemplate);
        }
      }

      logger.info('Template sync with Railway completed');
    } catch (error) {
      logger.error('Template sync with Railway failed', error);
      throw error;
    }
  }

  private async validateRailwayTemplate(railwayTemplateId: string) {
    try {
      const templates = await railwayClient.getTemplates();
      const template = templates.find(t => t.id === railwayTemplateId);
      
      if (!template) {
        throw new TemplateValidationError(['Railway template not found']);
      }

      return template;
    } catch (error) {
      logger.error('Railway template validation failed', { railwayTemplateId, error });
      throw new TemplateValidationError(['Invalid Railway template ID']);
    }
  }

  private async createTemplateFromRailway(railwayTemplate: any) {
    const templateData: CreateTemplateInput = {
      name: railwayTemplate.name.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      displayName: railwayTemplate.name,
      description: railwayTemplate.description || 'Imported from Railway',
      category: this.categorizeRailwayTemplate(railwayTemplate),
      railwayTemplateId: railwayTemplate.id,
      pricingTier: 'starter',
      monthlyPrice: 0,
      minCpu: '0.5',
      minMemory: '512MB',
      minStorage: '1GB',
      setupTimeMinutes: 5,
      complexity: 'simple',
      customDomain: true,
      sslIncluded: true,
    };

    return await this.createTemplate(templateData);
  }

  private async updateTemplateFromRailway(templateId: string, railwayTemplate: any) {
    return await this.updateTemplate(templateId, {
      displayName: railwayTemplate.name,
      description: railwayTemplate.description,
    });
  }

  private categorizeRailwayTemplate(railwayTemplate: any): string {
    const name = railwayTemplate.name.toLowerCase();
    
    if (name.includes('wordpress') || name.includes('cms')) return 'cms';
    if (name.includes('shop') || name.includes('ecommerce')) return 'ecommerce';
    if (name.includes('api') || name.includes('backend')) return 'api';
    if (name.includes('static') || name.includes('frontend')) return 'static';
    if (name.includes('database') || name.includes('db')) return 'database';
    if (name.includes('ai') || name.includes('ml')) return 'ai';
    
    return 'other';
  }
}

// src/services/deployment/InstanceService.ts
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { railwayClient } from '@/lib/railway/client';
import { EventBus } from '@/lib/events';
import { logger } from '@/utils/logger';
import { 
  InstanceNotFoundError, 
  InsufficientPermissionsError,
  InstanceValidationError 
} from '@/utils/errors';

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

export class InstanceService {
  constructor(private eventBus: EventBus) {}

  async createInstance(userId: string, input: CreateInstanceInput) {
    // Validate template exists and is active
    const template = await prisma.template.findFirst({
      where: {
        id: input.templateId,
        status: 'active',
        deletedAt: null,
      },
      include: {
        configs: true,
      },
    });

    if (!template) {
      throw new InstanceValidationError(['Template not found or inactive']);
    }

    // Check user subscription limits
    await this.checkUserLimits(userId, template.pricingTier);

    // Validate instance name uniqueness for user
    const existingInstance = await prisma.instance.findFirst({
      where: {
        userId,
        name: input.name,
        deletedAt: null,
      },
    });

    if (existingInstance) {
      throw new InstanceValidationError(['Instance name already exists']);
    }

    // Start transaction for instance creation
    const result = await prisma.$transaction(async (tx) => {
      // Create instance record
      const instance = await tx.instance.create({
        data: {
          name: input.name,
          description: input.description,
          userId,
          templateId: input.templateId,
          status: 'pending',
          allocatedCpu: template.minCpu,
          allocatedMemory: template.minMemory,
          allocatedStorage: template.minStorage,
          monthlyPrice: template.monthlyPrice,
          tenantPrefix: this.generateTenantPrefix(userId, template.name, ''),
        },
      });

      // Update tenant prefix with actual instance ID
      const updatedInstance = await tx.instance.update({
        where: { id: instance.id },
        data: {
          tenantPrefix: this.generateTenantPrefix(userId, template.name, instance.id),
        },
        include: {
          template: true,
        },
      });

      // Create deployment record
      const deployment = await tx.deployment.create({
        data: {
          instanceId: instance.id,
          type: 'create',
          status: 'pending',
          triggeredByUserId: userId,
          triggerType: 'manual',
          changes: {
            instance: input,
            template: template.name,
          },
          totalSteps: 5,
          currentStep: 'Initializing',
        },
      });

      return { instance: updatedInstance, deployment };
    });

    // Start background deployment process
    this.processDeployment(result.instance, result.deployment, input);

    // Emit event
    await this.eventBus.publish('instance.created', {
      instanceId: result.instance.id,
      userId,
      templateId: input.templateId,
      timestamp: new Date().toISOString(),
    });

    logger.info('Instance creation started', {
      instanceId: result.instance.id,
      userId,
      templateId: input.templateId,
    });

    return result;
  }

  async getInstance(instanceId: string, userId?: string) {
    const where: Prisma.InstanceWhereInput = {
      id: instanceId,
      deletedAt: null,
    };

    // Add user filter if provided (for tenant isolation)
    if (userId) {
      where.userId = userId;
    }

    const instance = await prisma.instance.findFirst({
      where,
      include: {
        template: true,
        domains: true,
        environments: true,
        deployments: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!instance) {
      throw new InstanceNotFoundError(instanceId);
    }

    return instance;
  }

  async getUserInstances(userId: string, filters: {
    status?: string;
    templateId?: string;
    search?: string;
  } = {}, pagination = { skip: 0, take: 20 }) {
    const where: Prisma.InstanceWhereInput = {
      userId,
      deletedAt: null,
    };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.templateId) {
      where.templateId = filters.templateId;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [instances, total] = await Promise.all([
      prisma.instance.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
        include: {
          template: true,
          domains: {
            where: { isPrimary: true },
            take: 1,
          },
          _count: {
            select: { deployments: true },
          },
        },
      }),
      prisma.instance.count({ where }),
    ]);

    return {
      instances,
      total,
      hasMore: pagination.skip + pagination.take < total,
    };
  }

  async updateInstance(instanceId: string, userId: string, updates: {
    name?: string;
    description?: string;
    environment?: Record<string, string>;
    configuration?: any;
  }) {
    // Verify ownership
    const instance = await this.getInstance(instanceId, userId);

    // Validate name uniqueness if changing
    if (updates.name && updates.name !== instance.name) {
      const existingInstance = await prisma.instance.findFirst({
        where: {
          userId,
          name: updates.name,
          id: { not: instanceId },
          deletedAt: null,
        },
      });

      if (existingInstance) {
        throw new InstanceValidationError(['Instance name already exists']);
      }
    }

    const updatedInstance = await prisma.instance.update({
      where: { id: instanceId },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
      include: {
        template: true,
        domains: true,
        environments: true,
      },
    });

    // If environment variables changed, update Railway service
    if (updates.environment) {
      await this.updateRailwayEnvironment(instance.railwayServiceId, updates.environment);
    }

    logger.info('Instance updated', { instanceId, userId, changes: Object.keys(updates) });

    return updatedInstance;
  }

  async deleteInstance(instanceId: string, userId: string, options: {
    force?: boolean;
    backup?: boolean;
  } = {}) {
    // Verify ownership
    const instance = await this.getInstance(instanceId, userId);

    // Create backup if requested
    let backupId: string | undefined;
    if (options.backup) {
      backupId = await this.createInstanceBackup(instance);
    }

    if (options.force) {
      // Hard delete: remove from Railway and database
      await this.hardDeleteInstance(instance);
    } else {
      // Soft delete: mark as deleted but keep Railway service
      await prisma.instance.update({
        where: { id: instanceId },
        data: {
          status: 'deleting',
          deletedAt: new Date(),
        },
      });
    }

    // Emit event
    await this.eventBus.publish('instance.deleted', {
      instanceId,
      userId,
      backupId,
      hardDelete: options.force,
      timestamp: new Date().toISOString(),
    });

    logger.info('Instance deleted', { instanceId, userId, force: options.force });

    return { success: true, backupId };
  }

  async restartInstance(instanceId: string, userId: string) {
    // Verify ownership
    const instance = await this.getInstance(instanceId, userId);

    if (instance.status !== 'running') {
      throw new InstanceValidationError(['Instance must be running to restart']);
    }

    // Create deployment record
    const deployment = await prisma.deployment.create({
      data: {
        instanceId,
        type: 'restart',
        status: 'pending',
        triggeredByUserId: userId,
        triggerType: 'manual',
        totalSteps: 3,
        currentStep: 'Stopping service',
      },
    });

    // Update instance status
    await prisma.instance.update({
      where: { id: instanceId },
      data: { status: 'restarting' },
    });

    // Trigger Railway restart
    try {
      await railwayClient.deployService(instance.railwayServiceId);
      
      await prisma.deployment.update({
        where: { id: deployment.id },
        data: {
          status: 'success',
          completedAt: new Date(),
          completedSteps: 3,
        },
      });

      await prisma.instance.update({
        where: { id: instanceId },
        data: { status: 'running' },
      });

    } catch (error) {
      await prisma.deployment.update({
        where: { id: deployment.id },
        data: {
          status: 'failed',
          errorMessage: error.message,
          completedAt: new Date(),
        },
      });

      await prisma.instance.update({
        where: { id: instanceId },
        data: { status: 'failed' },
      });

      throw error;
    }

    logger.info('Instance restart initiated', { instanceId, userId });

    return deployment;
  }

  // Private methods

  private generateTenantPrefix(userId: string, templateName: string, instanceId: string): string {
    return `user-${userId}-${templateName}-${instanceId}`;
  }

  private async checkUserLimits(userId: string, templateTier: string) {
    // This will be implemented when BILLING_MODULE is ready
    // For now, just check basic instance count limits
    
    const instanceCount = await prisma.instance.count({
      where: {
        userId,
        deletedAt: null,
      },
    });

    const limits = {
      starter: 1,
      pro: 5,
      business: 50,
    };

    // Default to starter limits
    const userLimit = limits.starter;

    if (instanceCount >= userLimit) {
      throw new InstanceValidationError([
        `Instance limit reached. Your plan allows ${userLimit} instances.`
      ]);
    }
  }

  private async processDeployment(instance: any, deployment: any, input: CreateInstanceInput) {
    try {
      // Step 1: Create Railway project/service
      await this.updateDeploymentStep(deployment.id, 'Creating Railway service', 1);
      
      const railwayService = await railwayClient.createService({
        projectId: process.env.RAILWAY_PROJECT_ID!,
        name: instance.tenantPrefix,
        variables: this.prepareEnvironmentVariables(instance.template, input.environment),
      });

      // Step 2: Configure environment
      await this.updateDeploymentStep(deployment.id, 'Configuring environment', 2);
      
      // Step 3: Deploy service
      await this.updateDeploymentStep(deployment.id, 'Deploying service', 3);
      
      await railwayClient.deployService(railwayService.id);

      // Step 4: Configure domain
      await this.updateDeploymentStep(deployment.id, 'Setting up domain', 4);
      
      let domain;
      if (input.domain?.type === 'custom' && input.domain.customDomain) {
        domain = await railwayClient.createDomain(railwayService.id, input.domain.customDomain);
      } else {
        domain = await railwayClient.generateDomain(railwayService.id);
      }

      // Step 5: Finalize
      await this.updateDeploymentStep(deployment.id, 'Finalizing deployment', 5);

      // Update instance with Railway data
      await prisma.instance.update({
        where: { id: instance.id },
        data: {
          railwayServiceId: railwayService.id,
          railwayProjectId: railwayService.projectId,
          status: 'running',
          lastDeployedAt: new Date(),
        },
      });

      // Create domain record
      await prisma.instanceDomain.create({
        data: {
          instanceId: instance.id,
          domain: domain.domain,
          type: input.domain?.type || 'generated',
          isPrimary: true,
          railwayDomainId: domain.id,
          status: 'active',
        },
      });

      // Complete deployment
      await prisma.deployment.update({
        where: { id: deployment.id },
        data: {
          status: 'success',
          completedAt: new Date(),
          completedSteps: 5,
        },
      });

      await this.eventBus.publish('deployment.completed', {
        deploymentId: deployment.id,
        instanceId: instance.id,
        status: 'success',
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      logger.error('Deployment failed', { 
        instanceId: instance.id, 
        deploymentId: deployment.id, 
        error 
      });

      // Update deployment as failed
      await prisma.deployment.update({
        where: { id: deployment.id },
        data: {
          status: 'failed',
          errorMessage: error.message,
          completedAt: new Date(),
        },
      });

      // Update instance status
      await prisma.instance.update({
        where: { id: instance.id },
        data: { status: 'failed' },
      });

      await this.eventBus.publish('deployment.failed', {
        deploymentId: deployment.id,
        instanceId: instance.id,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  private async updateDeploymentStep(deploymentId: string, step: string, completed: number) {
    await prisma.deployment.update({
      where: { id: deploymentId },
      data: {
        currentStep: step,
        completedSteps: completed,
        status: 'in_progress',
      },
    });
  }

  private prepareEnvironmentVariables(template: any, userEnvironment: Record<string, string> = {}) {
    const templateDefaults = template.configs?.[0]?.defaultEnvironment || {};
    
    return {
      ...templateDefaults,
      ...userEnvironment,
      // Add system variables
      TENANT_PREFIX: template.tenantPrefix,
      TEMPLATE_ID: template.id,
    };
  }

  private async updateRailwayEnvironment(serviceId: string, environment: Record<string, string>) {
    await railwayClient.setServiceVariables(serviceId, environment);
  }

  private async createInstanceBackup(instance: any): Promise<string> {
    // Placeholder for backup functionality
    // Will be implemented in future version
    return 'backup-' + Date.now();
  }

  private async hardDeleteInstance(instance: any) {
    // Delete from Railway
    if (instance.railwayServiceId) {
      await railwayClient.deleteService(instance.railwayServiceId);
    }

    // Delete from database
    await prisma.instance.delete({
      where: { id: instance.id },
    });
  }
}

export { TemplateService, InstanceService };