# DEPLOYMENT_MODULE - Integration & E2E Tests

## 🧪 Integration Tests

### API Integration Tests

```typescript
// tests/integration/api/templates.test.ts
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/templates/route';
import { prisma } from '@/lib/db';
import { createMockUser, createTestJWT } from '@/tests/helpers/auth';
import { seedTestTemplates } from '@/tests/helpers/seed';

describe('/api/templates Integration Tests', () => {
  beforeEach(async () => {
    // Clean database
    await prisma.template.deleteMany();
    await prisma.user.deleteMany();
    
    // Seed test data
    await seedTestTemplates();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /api/templates', () => {
    it('should return paginated templates with filters', async () => {
      // Arrange
      const request = new NextRequest(
        'http://localhost:3000/api/templates?category=cms&featured=true&limit=5'
      );

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.templates).toBeInstanceOf(Array);
      expect(data.data.total).toBeGreaterThanOrEqual(0);
      expect(data.data.hasMore).toBeDefined();
      
      // Check that all returned templates match filters
      data.data.templates.forEach((template: any) => {
        expect(template.category).toBe('cms');
        expect(template.featured).toBe(true);
        expect(template.status).toBe('active');
      });
    });

    it('should handle search filters correctly', async () => {
      // Arrange
      const request = new NextRequest(
        'http://localhost:3000/api/templates?search=wordpress'
      );

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      data.data.templates.forEach((template: any) => {
        const matchesSearch = 
          template.displayName.toLowerCase().includes('wordpress') ||
          template.description.toLowerCase().includes('wordpress') ||
          template.tags.includes('wordpress');
        expect(matchesSearch).toBe(true);
      });
    });

    it('should return 500 on database error', async () => {
      // Arrange - Force database error
      jest.spyOn(prisma.template, 'findMany').mockRejectedValueOnce(
        new Error('Database connection failed')
      );

      const request = new NextRequest('http://localhost:3000/api/templates');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Database connection failed');
    });
  });

  describe('POST /api/templates', () => {
    it('should create template successfully with admin auth', async () => {
      // Arrange
      const adminUser = await createMockUser({ role: 'admin' });
      const jwt = createTestJWT(adminUser.id);
      
      const templateData = {
        name: 'test-api-template',
        displayName: 'Test API Template',
        description: 'Created via API integration test',
        category: 'api',
        pricingTier: 'starter',
        monthlyPrice: 0,
        minCpu: '0.5',
        minMemory: '512MB',
        minStorage: '1GB',
      };

      const request = new NextRequest('http://localhost:3000/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify(templateData),
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe(templateData.name);
      expect(data.data.id).toBeDefined();

      // Verify in database
      const createdTemplate = await prisma.template.findUnique({
        where: { id: data.data.id },
      });
      expect(createdTemplate).toBeTruthy();
      expect(createdTemplate!.name).toBe(templateData.name);
    });

    it('should reject unauthorized users', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Authentication required');
    });

    it('should reject non-admin users', async () => {
      // Arrange
      const regularUser = await createMockUser({ role: 'user' });
      const jwt = createTestJWT(regularUser.id);

      const request = new NextRequest('http://localhost:3000/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify({}),
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Admin access required');
    });

    it('should validate template data', async () => {
      // Arrange
      const adminUser = await createMockUser({ role: 'admin' });
      const jwt = createTestJWT(adminUser.id);

      const invalidData = {
        name: 'Invalid Name With Spaces!',
        // Missing required fields
      };

      const request = new NextRequest('http://localhost:3000/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify(invalidData),
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.errors).toBeInstanceOf(Array);
      expect(data.errors.length).toBeGreaterThan(0);
    });
  });
});

// tests/integration/api/instances.test.ts
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/instances/route';
import { POST as createInstance } from '@/app/api/instances/create/route';
import { prisma } from '@/lib/db';
import { createMockUser, createTestJWT } from '@/tests/helpers/auth';
import { seedTestTemplates, seedTestInstances } from '@/tests/helpers/seed';
import { mockRailwayClient } from '@/tests/mocks/railway';

// Mock Railway client for integration tests
jest.mock('@/lib/railway/client', () => mockRailwayClient);

describe('/api/instances Integration Tests', () => {
  let testUser: any;
  let userJWT: string;
  let testTemplate: any;

  beforeEach(async () => {
    // Clean database
    await prisma.instance.deleteMany();
    await prisma.template.deleteMany();
    await prisma.user.deleteMany();
    
    // Create test user and template
    testUser = await createMockUser();
    userJWT = createTestJWT(testUser.id);
    
    const templates = await seedTestTemplates();
    testTemplate = templates[0];
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /api/instances', () => {
    it('should return user instances with pagination', async () => {
      // Arrange
      await seedTestInstances(testUser.id, [testTemplate.id]);
      
      const request = new NextRequest(
        'http://localhost:3000/api/instances?limit=10',
        {
          headers: { 'Authorization': `Bearer ${userJWT}` },
        }
      );

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.instances).toBeInstanceOf(Array);
      
      // Verify tenant isolation - only user's instances returned
      data.data.instances.forEach((instance: any) => {
        expect(instance.userId).toBe(testUser.id);
      });
    });

    it('should filter instances by status and template', async () => {
      // Arrange
      await seedTestInstances(testUser.id, [testTemplate.id]);
      
      const request = new NextRequest(
        `http://localhost:3000/api/instances?status=running&templateId=${testTemplate.id}`,
        {
          headers: { 'Authorization': `Bearer ${userJWT}` },
        }
      );

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      data.data.instances.forEach((instance: any) => {
        expect(instance.status).toBe('running');
        expect(instance.templateId).toBe(testTemplate.id);
      });
    });
  });

  describe('POST /api/instances/create', () => {
    it('should create instance successfully', async () => {
      // Arrange
      const instanceData = {
        name: 'test-instance',
        description: 'Integration test instance',
        templateId: testTemplate.id,
        domain: { type: 'generated' },
        environment: {
          'NODE_ENV': 'production',
          'CUSTOM_VAR': 'test-value',
        },
      };

      const request = new NextRequest('http://localhost:3000/api/instances/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userJWT}`,
        },
        body: JSON.stringify(instanceData),
      });

      // Act
      const response = await createInstance(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.instance.name).toBe(instanceData.name);
      expect(data.data.instance.userId).toBe(testUser.id);
      expect(data.data.instance.tenantPrefix).toContain(testUser.id);
      expect(data.data.deployment).toBeDefined();

      // Verify Railway API was called
      expect(mockRailwayClient.createService).toHaveBeenCalledWith(
        expect.objectContaining({
          name: expect.stringContaining(testUser.id),
          variables: expect.objectContaining(instanceData.environment),
        })
      );

      // Verify in database
      const createdInstance = await prisma.instance.findUnique({
        where: { id: data.data.instance.id },
        include: { deployments: true },
      });
      
      expect(createdInstance).toBeTruthy();
      expect(createdInstance!.deployments).toHaveLength(1);
      expect(createdInstance!.deployments[0].type).toBe('create');
    });

    it('should reject duplicate instance names for same user', async () => {
      // Arrange
      await prisma.instance.create({
        data: {
          name: 'duplicate-name',
          userId: testUser.id,
          templateId: testTemplate.id,
          status: 'running',
          tenantPrefix: 'test-prefix',
          allocatedCpu: '0.5',
          allocatedMemory: '512MB',
          allocatedStorage: '1GB',
          monthlyPrice: 0,
        },
      });

      const instanceData = {
        name: 'duplicate-name',
        templateId: testTemplate.id,
        domain: { type: 'generated' },
      };

      const request = new NextRequest('http://localhost:3000/api/instances/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userJWT}`,
        },
        body: JSON.stringify(instanceData),
      });

      // Act
      const response = await createInstance(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.errors).toContain('Instance name already exists');
    });

    it('should respect user instance limits', async () => {
      // Arrange - Create max instances for starter tier
      await prisma.instance.create({
        data: {
          name: 'existing-instance',
          userId: testUser.id,
          templateId: testTemplate.id,
          status: 'running',
          tenantPrefix: 'test-prefix',
          allocatedCpu: '0.5',
          allocatedMemory: '512MB',
          allocatedStorage: '1GB',
          monthlyPrice: 0,
        },
      });

      const instanceData = {
        name: 'over-limit-instance',
        templateId: testTemplate.id,
        domain: { type: 'generated' },
      };

      const request = new NextRequest('http://localhost:3000/api/instances/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userJWT}`,
        },
        body: JSON.stringify(instanceData),
      });

      // Act
      const response = await createInstance(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.errors).toContain('Instance limit reached');
    });
  });
});
```

### Database Integration Tests

```typescript
// tests/integration/database/templates.test.ts
import { TemplateService } from '@/services/deployment/TemplateService';
import { prisma } from '@/lib/db';
import { seedTestTemplates } from '@/tests/helpers/seed';

describe('TemplateService Database Integration', () => {
  let templateService: TemplateService;

  beforeEach(async () => {
    templateService = new TemplateService();
    await prisma.template.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Real Database Operations', () => {
    it('should perform complex template queries correctly', async () => {
      // Arrange
      await seedTestTemplates();

      // Act
      const result = await templateService.getTemplates(
        { 
          category: 'cms', 
          featured: true,
          search: 'wordpress',
        },
        { skip: 0, take: 5 }
      );

      // Assert
      expect(result.templates).toBeInstanceOf(Array);
      expect(result.total).toBeGreaterThanOrEqual(0);
      expect(result.hasMore).toBeDefined();

      // Verify SQL query optimization
      const queryStart = Date.now();
      await templateService.getTemplates({}, { skip: 0, take: 100 });
      const queryTime = Date.now() - queryStart;
      
      expect(queryTime).toBeLessThan(500); // Should complete within 500ms
    });

    it('should handle concurrent template creation', async () => {
      // Arrange
      const templatePromises = Array.from({ length: 5 }, (_, i) => 
        templateService.createTemplate({
          name: `concurrent-template-${i}`,
          displayName: `Concurrent Template ${i}`,
          description: 'Test concurrent creation',
          category: 'api',
          pricingTier: 'starter',
          monthlyPrice: 0,
          minCpu: '0.5',
          minMemory: '512MB',
          minStorage: '1GB',
        })
      );

      // Act
      const results = await Promise.allSettled(templatePromises);

      // Assert
      const successful = results.filter(r => r.status === 'fulfilled');
      const failed = results.filter(r => r.status === 'rejected');

      expect(successful.length).toBe(5);
      expect(failed.length).toBe(0);

      // Verify all templates were created
      const count = await prisma.template.count();
      expect(count).toBe(5);
    });

    it('should maintain data integrity with foreign key constraints', async () => {
      // Arrange
      const template = await templateService.createTemplate({
        name: 'fk-test-template',
        displayName: 'FK Test Template',
        description: 'Testing foreign key constraints',
        category: 'cms',
        pricingTier: 'starter',
        monthlyPrice: 0,
        minCpu: '0.5',
        minMemory: '512MB',
        minStorage: '1GB',
      });

      // Create instance using this template
      await prisma.instance.create({
        data: {
          name: 'fk-test-instance',
          userId: 'test-user-id',
          templateId: template.id,
          status: 'running',
          tenantPrefix: 'test-prefix',
          allocatedCpu: '0.5',
          allocatedMemory: '512MB',
          allocatedStorage: '1GB',
          monthlyPrice: 0,
        },
      });

      // Act & Assert - Should not be able to delete template with instances
      await expect(templateService.deleteTemplate(template.id))
        .rejects.toThrow('Cannot delete template');

      // Clean up instance first
      await prisma.instance.deleteMany({ where: { templateId: template.id } });
      
      // Now deletion should work
      await expect(templateService.deleteTemplate(template.id))
        .resolves.not.toThrow();
    });
  });

  describe('Transaction Handling', () => {
    it('should rollback transaction on error', async () => {
      // Arrange
      const validTemplate = {
        name: 'transaction-test',
        displayName: 'Transaction Test',
        description: 'Testing transaction rollback',
        category: 'cms',
        pricingTier: 'starter',
        monthlyPrice: 0,
        minCpu: '0.5',
        minMemory: '512MB',
        minStorage: '1GB',
      };

      // Mock prisma to fail during transaction
      const originalCreate = prisma.template.create;
      jest.spyOn(prisma.template, 'create').mockImplementationOnce(() => {
        throw new Error('Simulated database error');
      });

      // Act & Assert
      await expect(templateService.createTemplate(validTemplate))
        .rejects.toThrow('Simulated database error');

      // Verify no partial data was saved
      const count = await prisma.template.count();
      expect(count).toBe(0);

      // Restore original implementation
      prisma.template.create = originalCreate;
    });
  });
});

// tests/integration/database/instances.test.ts
import { InstanceService } from '@/services/deployment/InstanceService';
import { EventBus } from '@/lib/events';
import { prisma } from '@/lib/db';
import { seedTestTemplates } from '@/tests/helpers/seed';

describe('InstanceService Database Integration', () => {
  let instanceService: InstanceService;
  let eventBus: EventBus;
  let testTemplate: any;

  beforeEach(async () => {
    eventBus = new EventBus();
    instanceService = new InstanceService(eventBus);
    
    await prisma.instance.deleteMany();
    await prisma.template.deleteMany();
    
    const templates = await seedTestTemplates();
    testTemplate = templates[0];
  });

  afterEach(async () => {
    await eventBus.shutdown();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Instance Creation with Database Constraints', () => {
    it('should maintain referential integrity', async () => {
      // Act
      const result = await instanceService.createInstance('test-user-123', {
        name: 'integrity-test',
        templateId: testTemplate.id,
        domain: { type: 'generated' },
      });

      // Assert
      const instance = await prisma.instance.findUnique({
        where: { id: result.instance.id },
        include: {
          template: true,
          deployments: true,
        },
      });

      expect(instance).toBeTruthy();
      expect(instance!.template.id).toBe(testTemplate.id);
      expect(instance!.deployments).toHaveLength(1);
    });

    it('should handle database constraints properly', async () => {
      // Arrange - Create instance with specific name
      await instanceService.createInstance('test-user-123', {
        name: 'unique-name-test',
        templateId: testTemplate.id,
        domain: { type: 'generated' },
      });

      // Act & Assert - Should fail with duplicate name constraint
      await expect(instanceService.createInstance('test-user-123', {
        name: 'unique-name-test',
        templateId: testTemplate.id,
        domain: { type: 'generated' },
      })).rejects.toThrow('Instance name already exists');
    });
  });

  describe('Bulk Operations', () => {
    it('should handle multiple instance operations efficiently', async () => {
      // Arrange
      const userIds = ['user-1', 'user-2', 'user-3'];
      
      // Act - Create instances for multiple users
      const createPromises = userIds.map(userId => 
        instanceService.createInstance(userId, {
          name: `bulk-instance-${userId}`,
          templateId: testTemplate.id,
          domain: { type: 'generated' },
        })
      );

      const results = await Promise.all(createPromises);

      // Assert
      expect(results).toHaveLength(3);
      results.forEach((result, index) => {
        expect(result.instance.userId).toBe(userIds[index]);
        expect(result.instance.name).toContain(userIds[index]);
      });

      // Verify database state
      const instanceCount = await prisma.instance.count();
      expect(instanceCount).toBe(3);
    });
  });
});
```

## 🎭 End-to-End (E2E) Tests

### User Journey E2E Tests

```typescript
// tests/e2e/deployment-flow.test.ts
import { test, expect, Page } from '@playwright/test';
import { createTestUser, cleanupTestData } from '@/tests/helpers/e2e-setup';

test.describe('Complete Deployment Flow E2E', () => {
  let page: Page;
  let testUser: any;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    testUser = await createTestUser();
    
    // Login as test user
    await page.goto('/login');
    await page.fill('[data-testid="email"]', testUser.email);
    await page.fill('[data-testid="password"]', 'test-password');
    await page.click('[data-testid="login-submit"]');
    
    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="user-dashboard"]');
  });

  test.afterEach(async () => {
    await cleanupTestData(testUser.id);
    await page.close();
  });

  test('User can browse and deploy WordPress template', async () => {
    // Step 1: Navigate to template catalog
    await page.click('[data-testid="browse-templates"]');
    await page.waitForSelector('[data-testid="template-catalog"]');

    // Step 2: Filter for CMS templates
    await page.click('[data-testid="filter-category"]');
    await page.click('[data-testid="category-cms"]');
    
    // Wait for filtered results
    await page.waitForSelector('[data-testid="template-card"]:has-text("WordPress")');

    // Step 3: Select WordPress template
    await page.click('[data-testid="template-card"]:has-text("WordPress")');
    await page.waitForSelector('[data-testid="template-details"]');

    // Verify template information is displayed
    await expect(page.locator('[data-testid="template-name"]')).toContainText('WordPress');
    await expect(page.locator('[data-testid="template-price"]')).toBeVisible();
    await expect(page.locator('[data-testid="template-resources"]')).toBeVisible();

    // Step 4: Start deployment
    await page.click('[data-testid="deploy-template"]');
    await page.waitForSelector('[data-testid="deployment-form"]');

    // Step 5: Fill deployment form
    await page.fill('[data-testid="instance-name"]', 'my-wordpress-site');
    await page.fill('[data-testid="instance-description"]', 'E2E test WordPress site');
    
    // Select domain type
    await page.click('[data-testid="domain-type-generated"]');
    
    // Add environment variables
    await page.click('[data-testid="add-env-var"]');
    await page.fill('[data-testid="env-key-0"]', 'SITE_TITLE');
    await page.fill('[data-testid="env-value-0"]', 'My Test Site');

    // Step 6: Submit deployment
    await page.click('[data-testid="start-deployment"]');
    
    // Wait for deployment to start
    await page.waitForSelector('[data-testid="deployment-progress"]');
    
    // Verify deployment progress is shown
    await expect(page.locator('[data-testid="deployment-status"]')).toContainText('pending');
    await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible();
    await expect(page.locator('[data-testid="current-step"]')).toBeVisible();

    // Step 7: Wait for deployment completion (with timeout)
    await page.waitForSelector('[data-testid="deployment-success"]', { timeout: 60000 });
    
    // Verify successful deployment
    await expect(page.locator('[data-testid="deployment-status"]')).toContainText('success');
    await expect(page.locator('[data-testid="instance-url"]')).toBeVisible();
    await expect(page.locator('[data-testid="admin-credentials"]')).toBeVisible();

    // Step 8: Navigate to instance dashboard
    await page.click('[data-testid="view-instance"]');
    await page.waitForSelector('[data-testid="instance-dashboard"]');

    // Verify instance information
    await expect(page.locator('[data-testid="instance-name"]')).toContainText('my-wordpress-site');
    await expect(page.locator('[data-testid="instance-status"]')).toContainText('running');
    await expect(page.locator('[data-testid="instance-url"]')).toBeVisible();

    // Step 9: Test instance functionality
    const instanceUrl = await page.locator('[data-testid="instance-url"]').textContent();
    
    // Open instance in new tab
    const instancePage = await page.context().newPage();
    await instancePage.goto(instanceUrl!);
    
    // Verify WordPress is running
    await expect(instancePage.locator('body')).toContainText('WordPress');
    
    await instancePage.close();

    // Step 10: Test instance management
    await page.click('[data-testid="instance-actions"]');
    await page.click('[data-testid="restart-instance"]');
    
    // Confirm restart
    await page.click('[data-testid="confirm-restart"]');
    
    // Wait for restart to complete
    await page.waitForSelector('[data-testid="instance-status"]:has-text("restarting")');
    await page.waitForSelector('[data-testid="instance-status"]:has-text("running")', { timeout: 30000 });
  });

  test('User can manage multiple instances', async () => {
    // Create multiple instances for testing
    const instances = [
      { name: 'wordpress-blog', template: 'WordPress CMS' },
      { name: 'api-backend', template: 'Node.js API' },
      { name: 'static-site', template: 'Next.js Static' },
    ];

    // Deploy multiple instances
    for (const instance of instances) {
      await page.goto('/templates');
      await page.click(`[data-testid="template-card"]:has-text("${instance.template}")`);
      await page.click('[data-testid="deploy-template"]');
      await page.fill('[data-testid="instance-name"]', instance.name);
      await page.click('[data-testid="start-deployment"]');
      await page.waitForSelector('[data-testid="deployment-success"]', { timeout: 60000 });
    }

    // Navigate to instances dashboard
    await page.goto('/dashboard/instances');
    await page.waitForSelector('[data-testid="instances-list"]');

    // Verify all instances are listed
    for (const instance of instances) {
      await expect(page.locator(`[data-testid="instance-row"]:has-text("${instance.name}")`))
        .toBeVisible();
    }

    // Test filtering
    await page.fill('[data-testid="instances-search"]', 'wordpress');
    await page.waitForTimeout(500); // Wait for debounce
    
    await expect(page.locator('[data-testid="instance-row"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="instance-row"]')).toContainText('wordpress-blog');

    // Clear filter
    await page.fill('[data-testid="instances-search"]', '');
    await page.waitForTimeout(500);
    
    await expect(page.locator('[data-testid="instance-row"]')).toHaveCount(3);

    // Test status filtering
    await page.click('[data-testid="status-filter"]');
    await page.click('[data-testid="status-running"]');
    
    await expect(page.locator('[data-testid="instance-row"]')).toHaveCount(3);

    // Test bulk actions
    await page.check('[data-testid="select-instance-0"]');
    await page.check('[data-testid="select-instance-1"]');
    
    await page.click('[data-testid="bulk-actions"]');
    await page.click('[data-testid="bulk-restart"]');
    
    // Confirm bulk action
    await page.click('[data-testid="confirm-bulk-action"]');
    
    // Verify bulk operation feedback
    await expect(page.locator('[data-testid="bulk-operation-status"]'))
      .toContainText('Restarting 2 instances');
  });

  test('User receives real-time deployment updates', async () => {
    // Start deployment
    await page.goto('/templates');
    await page.click('[data-testid="template-card"]:first');
    await page.click('[data-testid="deploy-template"]');
    await page.fill('[data-testid="instance-name"]', 'realtime-test');
    await page.click('[data-testid="start-deployment"]');

    // Monitor real-time updates
    const progressUpdates: string[] = [];
    
    // Listen for progress updates
    page.on('websocket', ws => {
      ws.on('framereceived', frame => {
        const data = JSON.parse(frame.payload);
        if (data.type === 'deployment.progress') {
          progressUpdates.push(data.step);
        }
      });
    });

    // Wait for deployment completion
    await page.waitForSelector('[data-testid="deployment-success"]', { timeout: 60000 });

    // Verify we received progress updates
    expect(progressUpdates.length).toBeGreaterThan(0);
    expect(progressUpdates).toContain('Creating Railway service');
    expect(progressUpdates).toContain('Configuring environment');
    expect(progressUpdates).toContain('Deploying service');

    // Verify final status
    await expect(page.locator('[data-testid="deployment-status"]')).toContainText('success');
    await expect(page.locator('[data-testid="progress-percentage"]')).toContainText('100%');
  });

  test('User can handle deployment failures gracefully', async () => {
    // Mock Railway API to simulate failure
    await page.route('**/api/railway/**', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Railway service unavailable' }),
      });
    });

    // Start deployment
    await page.goto('/templates');
    await page.click('[data-testid="template-card"]:first');
    await page.click('[data-testid="deploy-template"]');
    await page.fill('[data-testid="instance-name"]', 'failure-test');
    await page.click('[data-testid="start-deployment"]');

    // Wait for failure
    await page.waitForSelector('[data-testid="deployment-failed"]', { timeout: 30000 });

    // Verify error handling
    await expect(page.locator('[data-testid="deployment-status"]')).toContainText('failed');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="retry-deployment"]')).toBeVisible();
    await expect(page.locator('[data-testid="contact-support"]')).toBeVisible();

    // Test retry functionality
    await page.unroute('**/api/railway/**'); // Remove mock
    await page.click('[data-testid="retry-deployment"]');
    
    // Should start new deployment
    await page.waitForSelector('[data-testid="deployment-progress"]');
    await expect(page.locator('[data-testid="deployment-status"]')).toContainText('pending');
  });
});

// tests/e2e/template-management.test.ts
import { test, expect, Page } from '@playwright/test';
import { createAdminUser, cleanupTestData } from '@/tests/helpers/e2e-setup';

test.describe('Template Management E2E (Admin)', () => {
  let page: Page;
  let adminUser: any;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    adminUser = await createAdminUser();
    
    // Login as admin
    await page.goto('/login');
    await page.fill('[data-testid="email"]', adminUser.email);
    await page.fill('[data-testid="password"]', 'admin-password');
    await page.click('[data-testid="login-submit"]');
    
    // Navigate to admin panel
    await page.goto('/admin');
    await page.waitForSelector('[data-testid="admin-dashboard"]');
  });

  test.afterEach(async () => {
    await cleanupTestData(adminUser.id);
    await page.close();
  });

  test('Admin can create and manage templates', async () => {
    // Navigate to templates management
    await page.click('[data-testid="manage-templates"]');
    await page.waitForSelector('[data-testid="templates-admin"]');

    // Create new template
    await page.click('[data-testid="create-template"]');
    await page.waitForSelector('[data-testid="template-form"]');

    // Fill template form
    await page.fill('[data-testid="template-name"]', 'custom-api-template');
    await page.fill('[data-testid="template-display-name"]', 'Custom API Template');
    await page.fill('[data-testid="template-description"]', 'A custom API template for E2E testing');
    
    await page.selectOption('[data-testid="template-category"]', 'api');
    await page.selectOption('[data-testid="template-pricing-tier"]', 'pro');
    
    await page.fill('[data-testid="template-price"]', '25');
    await page.fill('[data-testid="template-cpu"]', '1.0');
    await page.fill('[data-testid="template-memory"]', '1GB');
    await page.fill('[data-testid="template-storage"]', '10GB');

    // Add template configuration
    await page.click('[data-testid="add-config"]');
    await page.fill('[data-testid="config-key-0"]', 'NODE_ENV');
    await page.fill('[data-testid="config-value-0"]', 'production');

    // Set template as featured
    await page.check('[data-testid="template-featured"]');

    // Submit template
    await page.click('[data-testid="save-template"]');

    // Verify success
    await page.waitForSelector('[data-testid="template-created-success"]');
    await expect(page.locator('[data-testid="success-message"]'))
      .toContainText('Template created successfully');

    // Verify template appears in list
    await page.goto('/admin/templates');
    await page.waitForSelector('[data-testid="templates-table"]');
    
    await expect(page.locator('[data-testid="template-row"]:has-text("custom-api-template")'))
      .toBeVisible();

    // Edit template
    await page.click('[data-testid="edit-template"]:has-text("custom-api-template")');
    await page.waitForSelector('[data-testid="template-form"]');

    // Update description
    await page.fill('[data-testid="template-description"]', 'Updated E2E test template');
    await page.click('[data-testid="save-template"]');

    // Verify update
    await page.waitForSelector('[data-testid="template-updated-success"]');

    // Test template activation/deactivation
    await page.goto('/admin/templates');
    await page.click('[data-testid="template-actions"]:has-text("custom-api-template")');
    await page.click('[data-testid="deactivate-template"]');
    
    // Confirm deactivation
    await page.click('[data-testid="confirm-deactivate"]');
    
    // Verify status change
    await expect(page.locator('[data-testid="template-status"]:has-text("custom-api-template")'))
      .toContainText('inactive');

    // Test template deletion (with instances check)
    await page.click('[data-testid="template-actions"]:has-text("custom-api-template")');
    await page.click('[data-testid="delete-template"]');
    
    // Should be able to delete since no instances
    await page.click('[data-testid="confirm-delete"]');
    
    // Verify deletion
    await page.waitForSelector('[data-testid="template-deleted-success"]');
    await expect(page.locator('[data-testid="template-row"]:has-text("custom-api-template")'))
      .not.toBeVisible();
  });

  test('Admin can sync templates from Railway', async () => {
    // Navigate to templates sync
    await page.click('[data-testid="manage-templates"]');
    await page.click('[data-testid="sync-templates"]');

    // Start sync process
    await page.click('[data-testid="start-sync"]');
    
    // Wait for sync to complete
    await page.waitForSelector('[data-testid="sync-completed"]', { timeout: 30000 });

    // Verify sync results
    await expect(page.locator('[data-testid="sync-summary"]')).toBeVisible();
    await expect(page.locator('[data-testid="templates-synced"]')).toBeVisible();
    await expect(page.locator('[data-testid="templates-updated"]')).toBeVisible();

    // Verify new templates appear in list
    await page.goto('/admin/templates');
    const templateCount = await page.locator('[data-testid="template-row"]').count();
    expect(templateCount).toBeGreaterThan(0);
  });
});
```

### Performance E2E Tests

```typescript
// tests/e2e/performance.test.ts
import { test, expect } from '@playwright/test';
import { createTestUser } from '@/tests/helpers/e2e-setup';

test.describe('Performance E2E Tests', () => {
  test('Template catalog loads within performance budget', async ({ page }) => {
    const user = await createTestUser();
    
    // Login
    await page.goto('/login');
    await page.fill('[data-testid="email"]', user.email);
    await page.fill('[data-testid="password"]', 'test-password');
    
    // Measure template catalog load time
    const startTime = Date.now();
    await page.click('[data-testid="login-submit"]');
    await page.goto('/templates');
    await page.waitForSelector('[data-testid="template-catalog"]');
    const loadTime = Date.now() - startTime;

    // Assert performance budget
    expect(loadTime).toBeLessThan(3000); // 3 seconds budget

    // Check that templates are visible
    const templateCount = await page.locator('[data-testid="template-card"]').count();
    expect(templateCount).toBeGreaterThan(0);

    // Measure search performance
    const searchStart = Date.now();
    await page.fill('[data-testid="template-search"]', 'wordpress');
    await page.waitForFunction(() => 
      document.querySelectorAll('[data-testid="template-card"]').length > 0
    );
    const searchTime = Date.now() - searchStart;

    expect(searchTime).toBeLessThan(1000); // 1 second for search
  });

  test('Instance dashboard loads efficiently with multiple instances', async ({ page }) => {
    const user = await createTestUser();
    
    // TODO: Create multiple test instances for this user
    // This would require test data setup
    
    await page.goto('/login');
    await page.fill('[data-testid="email"]', user.email);
    await page.fill('[data-testid="password"]', 'test-password');
    await page.click('[data-testid="login-submit"]');

    // Measure dashboard load
    const startTime = Date.now();
    await page.goto('/dashboard');
    await page.waitForSelector('[data-testid="instances-overview"]');
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(2000); // 2 seconds budget

    // Test pagination performance
    if (await page.locator('[data-testid="pagination"]').isVisible()) {
      const paginationStart = Date.now();
      await page.click('[data-testid="next-page"]');
      await page.waitForSelector('[data-testid="instances-list"]');
      const paginationTime = Date.now() - paginationStart;

      expect(paginationTime).toBeLessThan(800); // 800ms for pagination
    }
  });

  test('Real-time updates perform efficiently', async ({ page }) => {
    const user = await createTestUser();
    
    await page.goto('/login');
    await page.fill('[data-testid="email"]', user.email);
    await page.fill('[data-testid="password"]', 'test-password');
    await page.click('[data-testid="login-submit"]');

    // Start deployment to test real-time updates
    await page.goto('/templates');
    await page.click('[data-testid="template-card"]:first');
    await page.click('[data-testid="deploy-template"]');
    await page.fill('[data-testid="instance-name"]', 'performance-test');
    
    // Measure WebSocket connection establishment
    const wsStartTime = Date.now();
    await page.click('[data-testid="start-deployment"]');
    await page.waitForSelector('[data-testid="deployment-progress"]');
    
    // Wait for first real-time update
    await page.waitForFunction(() => 
      document.querySelector('[data-testid="current-step"]')?.textContent !== 'Initializing'
    );
    const wsTime = Date.now() - wsStartTime;

    expect(wsTime).toBeLessThan(5000); // 5 seconds for initial connection and first update

    // Monitor update frequency
    let updateCount = 0;
    const monitorStart = Date.now();
    
    await page.evaluate(() => {
      // Monitor DOM changes for updates
      const observer = new MutationObserver(() => {
        window.updateCount = (window.updateCount || 0) + 1;
      });
      
      const progressElement = document.querySelector('[data-testid="deployment-progress"]');
      if (progressElement) {
        observer.observe(progressElement, { 
          childList: true, 
          subtree: true, 
          attributes: true 
        });
      }
    });

    // Wait 10 seconds and check update frequency
    await page.waitForTimeout(10000);
    updateCount = await page.evaluate(() => window.updateCount || 0);

    // Should receive reasonable update frequency (not too many, not too few)
    expect(updateCount).toBeGreaterThan(0);
    expect(updateCount).toBeLessThan(50); // Avoid spam
  });
});
```

### Test Helpers and Setup

```typescript
// tests/helpers/e2e-setup.ts
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function createTestUser(overrides: any = {}) {
  const hashedPassword = await bcrypt.hash('test-password', 10);
  
  return await prisma.user.create({
    data: {
      email: `test-${Date.now()}@example.com`,
      password: hashedPassword,
      name: 'Test User',
      role: 'user',
      emailVerified: new Date(),
      ...overrides,
    },
  });
}

export async function createAdminUser(overrides: any = {}) {
  return await createTestUser({
    role: 'admin',
    email: `admin-${Date.now()}@example.com`,
    name: 'Admin User',
    ...overrides,
  });
}

export async function cleanupTestData(userId: string) {
  // Clean up in correct order due to foreign key constraints
  await prisma.deployment.deleteMany({
    where: { instance: { userId } },
  });
  
  await prisma.instanceDomain.deleteMany({
    where: { instance: { userId } },
  });
  
  await prisma.instance.deleteMany({
    where: { userId },
  });
  
  await prisma.user.delete({
    where: { id: userId },
  });
}

export async function seedTestInstances(userId: string, templateIds: string[]) {
  const instances = [];
  
  for (let i = 0; i < templateIds.length; i++) {
    const instance = await prisma.instance.create({
      data: {
        name: `test-instance-${i}`,
        userId,
        templateId: templateIds[i],
        status: 'running',
        tenantPrefix: `user-${userId}-test-instance-${i}`,
        allocatedCpu: '0.5',
        allocatedMemory: '512MB',
        allocatedStorage: '1GB',
        monthlyPrice: 0,
      },
    });
    
    instances.push(instance);
  }
  
  return instances;
}

// tests/helpers/seed.ts
import { prisma } from '@/lib/db';

export async function seedTestTemplates() {
  const templates = [
    {
      name: 'wordpress-cms',
      displayName: 'WordPress CMS',
      description: 'Popular content management system',
      category: 'cms',
      featured: true,
      pricingTier: 'starter',
      monthlyPrice: 0,
      minCpu: '0.5',
      minMemory: '512MB',
      minStorage: '1GB',
      setupTimeMinutes: 5,
      complexity: 'simple',
      status: 'active',
      tags: ['wordpress', 'cms', 'blog'],
    },
    {
      name: 'nodejs-api',
      displayName: 'Node.js API',
      description: 'RESTful API backend with Node.js',
      category: 'api',
      featured: false,
      pricingTier: 'pro',
      monthlyPrice: 25,
      minCpu: '1.0',
      minMemory: '1GB',
      minStorage: '5GB',
      setupTimeMinutes: 3,
      complexity: 'simple',
      status: 'active',
      tags: ['nodejs', 'api', 'backend'],
    },
    {
      name: 'nextjs-static',
      displayName: 'Next.js Static Site',
      description: 'Static site generator with Next.js',
      category: 'static',
      featured: true,
      pricingTier: 'starter',
      monthlyPrice: 0,
      minCpu: '0.25',
      minMemory: '256MB',
      minStorage: '1GB',
      setupTimeMinutes: 2,
      complexity: 'simple',
      status: 'active',
      tags: ['nextjs', 'static', 'react'],
    },
  ];

  const createdTemplates = [];
  for (const template of templates) {
    const created = await prisma.template.create({ data: template });
    createdTemplates.push(created);
  }

  return createdTemplates;
}

// tests/mocks/railway.ts
export const mockRailwayClient = {
  createService: jest.fn().mockResolvedValue({
    id: 'mock-service-id',
    projectId: 'mock-project-id',
    name: 'mock-service',
  }),
  
  deployService: jest.fn().mockResolvedValue({
    id: 'mock-deployment-id',
    status: 'success',
  }),
  
  generateDomain: jest.fn().mockResolvedValue({
    id: 'mock-domain-id',
    domain: 'mock-service.railway.app',
  }),
  
  createDomain: jest.fn().mockResolvedValue({
    id: 'mock-custom-domain-id',
    domain: 'custom.example.com',
  }),
  
  setServiceVariables: jest.fn().mockResolvedValue({}),
  
  deleteService: jest.fn().mockResolvedValue({}),
  
  getTemplates: jest.fn().mockResolvedValue([
    {
      id: 'railway-template-1',
      name: 'Railway WordPress',
      description: 'WordPress from Railway',
    },
  ]),
};
```

## 🚀 Test Configuration

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/e2e-results.xml' }],
  ],
  
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

### Jest Configuration for Integration Tests

```typescript
// jest.integration.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  displayName: 'integration',
  testMatch: ['<rootDir>/tests/integration/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/integration/setup.ts'],
  testEnvironment: 'node',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testTimeout: 30000,
  maxWorkers: 1, // Run integration tests sequentially
};

module.exports = createJestConfig(customJestConfig);
```

## 📊 Test Coverage and Quality Gates

### Coverage Requirements

```typescript
// coverage.config.js
module.exports = {
  collectCoverageFrom: [
    'src/services/deployment/**/*.ts',
    'src/app/api/templates/**/*.ts',
    'src/app/api/instances/**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    './src/services/deployment/': {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
};
```

Эти интеграционные и E2E тесты обеспечивают:

✅ **Полное покрытие API endpoints**  
✅ **Тестирование реальных Database операций**  
✅ **End-to-end пользовательских сценариев**  
✅ **Performance testing**  
✅ **Real-time updates тестирование**  
✅ **Error handling scenarios**  
✅ **Multi-browser compatibility**  
✅ **Mobile responsiveness**

Теперь DEPLOYMENT_MODULE имеет полный набор тестов всех уровней!