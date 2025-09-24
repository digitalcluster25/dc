// tests/unit/services/TemplateService.test.ts
import { TemplateService } from '@/services/deployment/TemplateService';
import { prisma } from '@/lib/db';
import { railwayClient } from '@/lib/railway/client';
import { validateTemplate } from '@/utils/validators/templateValidator';
import { TemplateNotFoundError, TemplateValidationError } from '@/utils/errors';

// Mock dependencies
jest.mock('@/lib/db');
jest.mock('@/lib/railway/client');
jest.mock('@/utils/validators/templateValidator');

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockRailwayClient = railwayClient as jest.Mocked<typeof railwayClient>;
const mockValidateTemplate = validateTemplate as jest.MockedFunction<typeof validateTemplate>;

describe('TemplateService', () => {
  let templateService: TemplateService;

  beforeEach(() => {
    templateService = new TemplateService();
    jest.clearAllMocks();
  });

  describe('getTemplates', () => {
    it('should return filtered templates with pagination', async () => {
      // Arrange
      const mockTemplates = [
        {
          id: 'template-1',
          name: 'wordpress-cms',
          displayName: 'WordPress CMS',
          category: 'cms',
          featured: true,
          status: 'active',
          createdAt: new Date(),
        },
      ];

      const filters = { category: 'cms', featured: true };
      const pagination = { skip: 0, take: 20 };

      mockPrisma.template.findMany.mockResolvedValue(mockTemplates as any);
      mockPrisma.template.count.mockResolvedValue(1);

      // Act
      const result = await templateService.getTemplates(filters, pagination);

      // Assert
      expect(mockPrisma.template.findMany).toHaveBeenCalledWith({
        where: {
          status: 'active',
          deletedAt: null,
          category: 'cms',
          featured: true,
        },
        skip: 0,
        take: 20,
        orderBy: [
          { featured: 'desc' },
          { createdAt: 'desc' }
        ],
        include: {
          configs: true,
        },
      });

      expect(result).toEqual({
        templates: mockTemplates,
        total: 1,
        hasMore: false,
      });
    });

    it('should handle search filters correctly', async () => {
      // Arrange
      const filters = { search: 'wordpress' };
      mockPrisma.template.findMany.mockResolvedValue([]);
      mockPrisma.template.count.mockResolvedValue(0);

      // Act
      await templateService.getTemplates(filters);

      // Assert
      expect(mockPrisma.template.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { displayName: { contains: 'wordpress', mode: 'insensitive' } },
              { description: { contains: 'wordpress', mode: 'insensitive' } },
              { tags: { has: 'wordpress' } },
            ],
          }),
        })
      );
    });
  });

  describe('getTemplate', () => {
    it('should return template by id', async () => {
      // Arrange
      const templateId = 'template-1';
      const mockTemplate = {
        id: templateId,
        name: 'wordpress-cms',
        status: 'active',
        deletedAt: null,
      };

      mockPrisma.template.findFirst.mockResolvedValue(mockTemplate as any);

      // Act
      const result = await templateService.getTemplate(templateId);

      // Assert
      expect(mockPrisma.template.findFirst).toHaveBeenCalledWith({
        where: {
          id: templateId,
          status: 'active',
          deletedAt: null,
        },
        include: {
          configs: true,
        },
      });

      expect(result).toBe(mockTemplate);
    });

    it('should throw TemplateNotFoundError when template does not exist', async () => {
      // Arrange
      const templateId = 'non-existent';
      mockPrisma.template.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(templateService.getTemplate(templateId))
        .rejects.toThrow(TemplateNotFoundError);
    });
  });

  describe('createTemplate', () => {
    const validTemplateInput = {
      name: 'test-template',
      displayName: 'Test Template',
      description: 'A test template for unit testing',
      category: 'cms' as const,
      pricingTier: 'starter' as const,
      monthlyPrice: 0,
      minCpu: '0.5',
      minMemory: '512MB',
      minStorage: '1GB',
    };

    it('should create template successfully', async () => {
      // Arrange
      mockValidateTemplate.mockResolvedValue({
        isValid: true,
        errors: [],
        data: validTemplateInput,
      });

      mockPrisma.template.findUnique.mockResolvedValue(null); // No existing template
      mockPrisma.template.create.mockResolvedValue({
        ...validTemplateInput,
        id: 'template-1',
        version: '1.0.0',
        status: 'active',
      } as any);

      // Act
      const result = await templateService.createTemplate(validTemplateInput);

      // Assert
      expect(mockValidateTemplate).toHaveBeenCalledWith(validTemplateInput);
      expect(mockPrisma.template.findUnique).toHaveBeenCalledWith({
        where: { name: validTemplateInput.name },
      });
      expect(mockPrisma.template.create).toHaveBeenCalled();
      expect(result.id).toBe('template-1');
    });

    it('should throw validation error for invalid template', async () => {
      // Arrange
      mockValidateTemplate.mockResolvedValue({
        isValid: false,
        errors: ['Template name is required'],
      });

      // Act & Assert
      await expect(templateService.createTemplate(validTemplateInput))
        .rejects.toThrow(TemplateValidationError);
    });

    it('should throw validation error for duplicate template name', async () => {
      // Arrange
      mockValidateTemplate.mockResolvedValue({
        isValid: true,
        errors: [],
        data: validTemplateInput,
      });

      mockPrisma.template.findUnique.mockResolvedValue({
        id: 'existing-template',
        name: validTemplateInput.name,
      } as any);

      // Act & Assert
      await expect(templateService.createTemplate(validTemplateInput))
        .rejects.toThrow(TemplateValidationError);
    });
  });

  describe('syncWithRailway', () => {
    it('should sync templates from Railway API', async () => {
      // Arrange
      const railwayTemplates = [
        {
          id: 'railway-template-1',
          name: 'Railway WordPress',
          description: 'WordPress template from Railway',
        },
      ];

      mockRailwayClient.getTemplates.mockResolvedValue(railwayTemplates);
      mockPrisma.template.findUnique.mockResolvedValue(null);

      const createTemplateSpy = jest.spyOn(templateService as any, 'createTemplateFromRailway')
        .mockResolvedValue({});

      // Act
      await templateService.syncWithRailway();

      // Assert
      expect(mockRailwayClient.getTemplates).toHaveBeenCalled();
      expect(createTemplateSpy).toHaveBeenCalledWith(railwayTemplates[0]);
    });
  });
});

// tests/unit/services/InstanceService.test.ts
import { InstanceService } from '@/services/deployment/InstanceService';
import { EventBus } from '@/lib/events';
import { prisma } from '@/lib/db';
import { railwayClient } from '@/lib/railway/client';
import { InstanceValidationError } from '@/utils/errors';

// Mock dependencies
jest.mock('@/lib/db');
jest.mock('@/lib/railway/client');

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockRailwayClient = railwayClient as jest.Mocked<typeof railwayClient>;
const mockEventBus = {
  publish: jest.fn(),
} as jest.Mocked<EventBus>;

describe('InstanceService', () => {
  let instanceService: InstanceService;

  beforeEach(() => {
    instanceService = new InstanceService(mockEventBus);
    jest.clearAllMocks();
  });

  describe('createInstance', () => {
    const userId = 'user-123';
    const createInstanceInput = {
      name: 'test-instance',
      templateId: 'template-123',
      domain: { type: 'generated' as const },
    };

    const mockTemplate = {
      id: 'template-123',
      name: 'wordpress-cms',
      status: 'active',
      pricingTier: 'starter',
      monthlyPrice: 0,
      minCpu: '0.5',
      minMemory: '512MB',
      minStorage: '1GB',
    };

    it('should create instance successfully', async () => {
      // Arrange
      mockPrisma.template.findFirst.mockResolvedValue(mockTemplate as any);
      mockPrisma.instance.findFirst.mockResolvedValue(null); // No existing instance
      mockPrisma.instance.count.mockResolvedValue(0); // No existing instances for user

      const mockInstance = {
        id: 'instance-123',
        name: 'test-instance',
        userId,
        templateId: 'template-123',
        status: 'pending',
        tenantPrefix: '',
      };

      const mockDeployment = {
        id: 'deployment-123',
        instanceId: 'instance-123',
        type: 'create',
        status: 'pending',
      };

      // Mock transaction
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return callback({
          instance: {
            create: jest.fn().mockResolvedValue(mockInstance),
            update: jest.fn().mockResolvedValue({
              ...mockInstance,
              tenantPrefix: 'user-user-123-wordpress-cms-instance-123',
              template: mockTemplate,
            }),
          },
          deployment: {
            create: jest.fn().mockResolvedValue(mockDeployment),
          },
        } as any);
      });

      const processDeploymentSpy = jest.spyOn(instanceService as any, 'processDeployment')
        .mockResolvedValue(undefined);

      // Act
      const result = await instanceService.createInstance(userId, createInstanceInput);

      // Assert
      expect(mockPrisma.template.findFirst).toHaveBeenCalledWith({
        where: {
          id: createInstanceInput.templateId,
          status: 'active',
          deletedAt: null,
        },
        include: {
          configs: true,
        },
      });

      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'instance.created',
        expect.objectContaining({
          instanceId: 'instance-123',
          userId,
          templateId: 'template-123',
        })
      );

      expect(processDeploymentSpy).toHaveBeenCalled();
      expect(result.instance.id).toBe('instance-123');
      expect(result.deployment.id).toBe('deployment-123');
    });

    it('should throw validation error for non-existent template', async () => {
      // Arrange
      mockPrisma.template.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(instanceService.createInstance(userId, createInstanceInput))
        .rejects.toThrow(InstanceValidationError);
    });

    it('should throw validation error for duplicate instance name', async () => {
      // Arrange
      mockPrisma.template.findFirst.mockResolvedValue(mockTemplate as any);
      mockPrisma.instance.findFirst.mockResolvedValue({
        id: 'existing-instance',
        name: createInstanceInput.name,
        userId,
      } as any);

      // Act & Assert
      await expect(instanceService.createInstance(userId, createInstanceInput))
        .rejects.toThrow(InstanceValidationError);
    });

    it('should check user limits', async () => {
      // Arrange
      mockPrisma.template.findFirst.mockResolvedValue(mockTemplate as any);
      mockPrisma.instance.findFirst.mockResolvedValue(null);
      mockPrisma.instance.count.mockResolvedValue(1); // User already has 1 instance (starter limit)

      // Act & Assert
      await expect(instanceService.createInstance(userId, createInstanceInput))
        .rejects.toThrow(InstanceValidationError);
    });
  });

  describe('restartInstance', () => {
    const instanceId = 'instance-123';
    const userId = 'user-123';

    const mockInstance = {
      id: instanceId,
      userId,
      status: 'running',
      railwayServiceId: 'railway-service-123',
    };

    it('should restart instance successfully', async () => {
      // Arrange
      mockPrisma.instance.findFirst.mockResolvedValue(mockInstance as any);
      mockPrisma.deployment.create.mockResolvedValue({
        id: 'deployment-123',
        instanceId,
        type: 'restart',
        status: 'pending',
      } as any);

      mockPrisma.instance.update.mockResolvedValue(mockInstance as any);
      mockRailwayClient.deployService.mockResolvedValue({} as any);

      // Act
      const result = await instanceService.restartInstance(instanceId, userId);

      // Assert
      expect(mockPrisma.instance.findFirst).toHaveBeenCalledWith({
        where: {
          id: instanceId,
          deletedAt: null,
        },
        include: {
          template: true,
          domains: true,
          environments: true,
          deployments: expect.any(Object),
        },
      });

      expect(mockRailwayClient.deployService).toHaveBeenCalledWith(
        mockInstance.railwayServiceId
      );

      expect(result.id).toBe('deployment-123');
    });

    it('should throw validation error for non-running instance', async () => {
      // Arrange
      mockPrisma.instance.findFirst.mockResolvedValue({
        ...mockInstance,
        status: 'stopped',
      } as any);

      // Act & Assert
      await expect(instanceService.restartInstance(instanceId, userId))
        .rejects.toThrow(InstanceValidationError);
    });
  });
});

// tests/unit/utils/validators/templateValidator.test.ts
import { validateTemplate, templateSchema } from '@/utils/validators/templateValidator';

describe('templateValidator', () => {
  const validTemplateData = {
    name: 'test-template',
    displayName: 'Test Template',
    description: 'A valid test template for unit testing',
    category: 'cms',
    pricingTier: 'starter',
    monthlyPrice: 0,
    minCpu: '0.5',
    minMemory: '512MB',
    minStorage: '1GB',
  };

  describe('templateSchema', () => {
    it('should validate correct template data', () => {
      // Act
      const result = templateSchema.safeParse(validTemplateData);

      // Assert
      expect(result.success).toBe(true);
    });

    it('should reject invalid template name', () => {
      // Arrange
      const invalidData = {
        ...validTemplateData,
        name: 'Invalid Name With Spaces',
      };

      // Act
      const result = templateSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('lowercase letters, numbers, and hyphens');
      }
    });

    it('should reject invalid pricing tier', () => {
      // Arrange
      const invalidData = {
        ...validTemplateData,
        pricingTier: 'invalid-tier',
      };

      // Act
      const result = templateSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
    });

    it('should reject negative monthly price', () => {
      // Arrange
      const invalidData = {
        ...validTemplateData,
        monthlyPrice: -10,
      };

      // Act
      const result = templateSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
    });
  });

  describe('validateTemplate', () => {
    it('should return valid result for correct data', async () => {
      // Act
      const result = await validateTemplate(validTemplateData);

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.data).toBeDefined();
    });

    it('should return business logic validation errors', async () => {
      // Arrange
      const invalidData = {
        ...validTemplateData,
        pricingTier: 'starter',
        monthlyPrice: 15, // Too expensive for starter tier
      };

      // Act
      const result = await validateTemplate(invalidData);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Starter tier templates should not cost more than $10/month');
    });

    it('should validate complexity vs setup time', async () => {
      // Arrange
      const invalidData = {
        ...validTemplateData,
        complexity: 'simple',
        setupTimeMinutes: 15, // Too long for simple template
      };

      // Act
      const result = await validateTemplate(invalidData);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Simple templates should setup in 10 minutes or less');
    });
  });
});

// tests/unit/utils/helpers/resourceHelper.test.ts
import { ResourceHelper } from '@/utils/helpers/resourceHelper';

describe('ResourceHelper', () => {
  describe('parseMemory', () => {
    it('should parse MB correctly', () => {
      expect(ResourceHelper.parseMemory('512MB')).toBe(512);
      expect(ResourceHelper.parseMemory('1024MB')).toBe(1024);
    });

    it('should parse GB correctly', () => {
      expect(ResourceHelper.parseMemory('1GB')).toBe(1024);
      expect(ResourceHelper.parseMemory('2.5GB')).toBe(2560);
    });

    it('should throw error for invalid format', () => {
      expect(() => ResourceHelper.parseMemory('invalid')).toThrow('Invalid memory format');
      expect(() => ResourceHelper.parseMemory('512')).toThrow('Invalid memory format');
    });
  });

  describe('formatMemory', () => {
    it('should format MB values', () => {
      expect(ResourceHelper.formatMemory(512)).toBe('512MB');
      expect(ResourceHelper.formatMemory(1023)).toBe('1023MB');
    });

    it('should format GB values', () => {
      expect(ResourceHelper.formatMemory(1024)).toBe('1.0GB');
      expect(ResourceHelper.formatMemory(1536)).toBe('1.5GB');
    });
  });

  describe('calculateMonthlyCost', () => {
    it('should calculate cost for starter tier', () => {
      const cost = ResourceHelper.calculateMonthlyCost(
        '0.5',    // CPU
        '512MB',  // Memory
        '1GB',    // Storage
        'starter' // Tier
      );

      expect(cost).toBeGreaterThan(0);
      expect(typeof cost).toBe('number');
    });

    it('should calculate higher cost for higher tiers', () => {
      const starterCost = ResourceHelper.calculateMonthlyCost('0.5', '512MB', '1GB', 'starter');
      const proCost = ResourceHelper.calculateMonthlyCost('0.5', '512MB', '1GB', 'pro');

      expect(proCost).toBeGreaterThan(starterCost);
    });
  });
});

// tests/unit/utils/helpers/tenantHelper.test.ts
import { TenantHelper } from '@/utils/helpers/tenantHelper';

describe('TenantHelper', () => {
  describe('generateTenantPrefix', () => {
    it('should generate correct prefix format', () => {
      const prefix = TenantHelper.generateTenantPrefix(
        'user-123',
        'wordpress-cms',
        'instance-456'
      );

      expect(prefix).toBe('user-user-123-wordpress-cms-instance-456');
    });

    it('should clean template name', () => {
      const prefix = TenantHelper.generateTenantPrefix(
        'user-123',
        'WordPress CMS!',
        'instance-456'
      );

      expect(prefix).toBe('user-user-123-wordpress-cms-instance-456');
    });
  });

  describe('parseTenantPrefix', () => {
    it('should parse valid prefix correctly', () => {
      const result = TenantHelper.parseTenantPrefix(
        'user-user-123-wordpress-cms-instance-456'
      );

      expect(result).toEqual({
        userId: 'user-123',
        templateName: 'wordpress-cms',
        instanceId: 'instance-456',
      });
    });

    it('should return null for invalid prefix', () => {
      const result = TenantHelper.parseTenantPrefix('invalid-prefix');
      expect(result).toBeNull();
    });
  });

  describe('validateTenantPrefix', () => {
    it('should validate correct prefix', () => {
      const isValid = TenantHelper.validateTenantPrefix(
        'user-user-123-wordpress-cms-instance-456'
      );
      expect(isValid).toBe(true);
    });

    it('should reject invalid prefix', () => {
      const isValid = TenantHelper.validateTenantPrefix('invalid-prefix');
      expect(isValid).toBe(false);
    });
  });
});

// tests/unit/lib/events/EventBus.test.ts
import { EventBus } from '@/lib/events/EventBus';

describe('EventBus', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
  });

  afterEach(async () => {
    await eventBus.shutdown();
  });

  describe('subscribe and publish', () => {
    it('should call handler when event is published', async () => {
      // Arrange
      const handler = jest.fn();
      const eventData = {
        instanceId: 'instance-123',
        oldStatus: 'pending' as const,
        newStatus: 'running' as const,
        timestamp: new Date().toISOString(),
      };

      // Act
      eventBus.subscribe('instance.status_changed', handler);
      await eventBus.publish('instance.status_changed', eventData);

      // Give async handlers time to execute
      await new Promise(resolve => setTimeout(resolve, 10));

      // Assert
      expect(handler).toHaveBeenCalledWith(eventData);
    });

    it('should call multiple handlers for same event', async () => {
      // Arrange
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const eventData = {
        deploymentId: 'deployment-123',
        instanceId: 'instance-123',
        type: 'create' as const,
      };

      // Act
      eventBus.subscribe('deployment.started', handler1);
      eventBus.subscribe('deployment.started', handler2);
      await eventBus.publish('deployment.started', eventData);

      await new Promise(resolve => setTimeout(resolve, 10));

      // Assert
      expect(handler1).toHaveBeenCalledWith(eventData);
      expect(handler2).toHaveBeenCalledWith(eventData);
    });

    it('should handle async handlers correctly', async () => {
      // Arrange
      const handler = jest.fn().mockResolvedValue(undefined);
      const eventData = {
        instanceId: 'instance-123',
        oldStatus: 'pending' as const,
        newStatus: 'running' as const,
        timestamp: new Date().toISOString(),
      };

      // Act
      eventBus.subscribe('instance.status_changed', handler);
      await eventBus.publish('instance.status_changed', eventData);

      await new Promise(resolve => setTimeout(resolve, 10));

      // Assert
      expect(handler).toHaveBeenCalledWith(eventData);
    });
  });

  describe('unsubscribe', () => {
    it('should remove handler from event', async () => {
      // Arrange
      const handler = jest.fn();
      const eventData = {
        instanceId: 'instance-123',
        oldStatus: 'pending' as const,
        newStatus: 'running' as const,
        timestamp: new Date().toISOString(),
      };

      // Act
      eventBus.subscribe('instance.status_changed', handler);
      eventBus.unsubscribe('instance.status_changed', handler);
      await eventBus.publish('instance.status_changed', eventData);

      await new Promise(resolve => setTimeout(resolve, 10));

      // Assert
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', () => {
      // Arrange
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      eventBus.subscribe('instance.status_changed', handler1);
      eventBus.subscribe('deployment.started', handler1);
      eventBus.subscribe('deployment.started', handler2);

      // Act
      const stats = eventBus.getStats();

      // Assert
      expect(stats.totalEventTypes).toBe(2);
      expect(stats.totalHandlers).toBe(3);
      expect(stats.eventTypeStats['instance.status_changed']).toBe(1);
      expect(stats.eventTypeStats['deployment.started']).toBe(2);
    });
  });
});

// tests/setup.ts - Test setup file
import { jest } from '@jest/globals';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.RAILWAY_API_KEY = 'test-railway-key';

// Mock console methods in tests
global.console = {
  ...console,
  // Uncomment to ignore console.log/warn/error during tests
  // log: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Increase timeout for tests that involve async operations
jest.setTimeout(10000);

// Global test utilities
global.createMockTemplate = (overrides = {}) => ({
  id: 'template-123',
  name: 'test-template',
  displayName: 'Test Template',
  description: 'A test template',
  category: 'cms',
  featured: false,
  pricingTier: 'starter',
  monthlyPrice: 0,
  minCpu: '0.5',
  minMemory: '512MB',
  minStorage: '1GB',
  status: 'active',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

global.createMockInstance = (overrides = {}) => ({
  id: 'instance-123',
  name: 'test-instance',
  userId: 'user-123',
  templateId: 'template-123',
  status: 'running',
  tenantPrefix: 'user-user-123-test-template-instance-123',
  allocatedCpu: '0.5',
  allocatedMemory: '512MB',
  allocatedStorage: '1GB',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

global.createMockDeployment = (overrides = {}) => ({
  id: 'deployment-123',
  instanceId: 'instance-123',
  type: 'create',
  status: 'pending',
  triggeredByUserId: 'user-123',
  triggerType: 'manual',
  totalSteps: 5,
  completedSteps: 0,
  progressPercentage: 0,
  startedAt: new Date(),
  createdAt: new Date(),
  ...overrides,
});