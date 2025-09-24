// tests/integration/api/templates.test.ts
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/deployment/templates/route';
import { testDb, setupTestDatabase, teardownTestDatabase } from '../helpers/testDatabase';
import { createTestAuthToken } from '../helpers/testAuth';

describe('GET /api/deployment/templates', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await testDb.cleanup();
    await testDb.seedTemplates([
      {
        name: 'wordpress-cms',
        displayName: 'WordPress CMS',
        category: 'cms',
        featured: true,
        pricingTier: 'starter',
        monthlyPrice: 0,
      },
      {
        name: 'nextjs-app',
        displayName: 'Next.js App',
        category: 'static',
        featured: false,
        pricingTier: 'pro',
        monthlyPrice: 10,
      },
    ]);
  });

  it('should return all templates without filters', async () => {
    // Arrange
    const authToken = await createTestAuthToken({ userId: 'user-123' });
    const request = new NextRequest('http://localhost:3000/api/deployment/templates', {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.templates).toHaveLength(2);
    expect(data.total).toBe(2);
    expect(data.hasMore).toBe(false);

    // Verify templates are returned
    const wordpressTemplate = data.templates.find((t: any) => t.name === 'wordpress-cms');
    expect(wordpressTemplate).toBeDefined();
    expect(wordpressTemplate.featured).toBe(true);
  });

  it('should filter templates by category', async () => {
    // Arrange
    const authToken = await createTestAuthToken({ userId: 'user-123' });
    const request = new NextRequest('http://localhost:3000/api/deployment/templates?category=cms', {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.templates).toHaveLength(1);
    expect(data.templates[0].category).toBe('cms');
    expect(data.templates[0].name).toBe('wordpress-cms');
  });

  it('should filter templates by featured status', async () => {
    // Arrange
    const authToken = await createTestAuthToken({ userId: 'user-123' });
    const request = new NextRequest('http://localhost:3000/api/deployment/templates?featured=true', {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.templates).toHaveLength(1);
    expect(data.templates[0].featured).toBe(true);
  });

  it('should search templates by name', async () => {
    // Arrange
    const authToken = await createTestAuthToken({ userId: 'user-123' });
    const request = new NextRequest('http://localhost:3000/api/deployment/templates?search=wordpress', {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.templates).toHaveLength(1);
    expect(data.templates[0].displayName).toContain('WordPress');
  });

  it('should handle pagination correctly', async () => {
    // Arrange
    const authToken = await createTestAuthToken({ userId: 'user-123' });
    const request = new NextRequest('http://localhost:3000/api/deployment/templates?limit=1&offset=0', {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.templates).toHaveLength(1);
    expect(data.total).toBe(2);
    expect(data.hasMore).toBe(true);
    expect(data.pagination.nextOffset).toBe(1);
  });

  it('should return 401 without authentication', async () => {
    // Arrange
    const request = new NextRequest('http://localhost:3000/api/deployment/templates');

    // Act
    const response = await GET(request);

    // Assert
    expect(response.status).toBe(401);
  });

  it('should return 400 for invalid category', async () => {
    // Arrange
    const authToken = await createTestAuthToken({ userId: 'user-123' });
    const request = new NextRequest('http://localhost:3000/api/deployment/templates?category=invalid', {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });
});

// tests/integration/api/instances.test.ts
import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/deployment/instances/route';
import { testDb, setupTestDatabase, teardownTestDatabase } from '../helpers/testDatabase';
import { createTestAuthToken } from '../helpers/testAuth';
import { mockRailwayClient } from '../helpers/mockRailway';

// Mock Railway client
jest.mock('@/lib/railway/client', () => ({
  railwayClient: mockRailwayClient,
}));

describe('Instances API Integration', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await testDb.cleanup();
    jest.clearAllMocks();
  });

  describe('POST /api/deployment/instances', () => {
    it('should create instance successfully', async () => {
      // Arrange
      const userId = 'user-123';
      const template = await testDb.createTemplate({
        name: 'wordpress-cms',
        displayName: 'WordPress CMS',
        pricingTier: 'starter',
      });

      const createRequest = {
        name: 'My WordPress Site',
        templateId: template.id,
        domain: { type: 'generated' },
        environment: {
          SITE_TITLE: 'My Awesome Site',
          ADMIN_EMAIL: 'admin@example.com',
        },
      };

      // Mock Railway API responses
      mockRailwayClient.createService.mockResolvedValue({
        id: 'railway-service-123',
        projectId: 'railway-project-123',
        name: 'user-user-123-wordpress-cms-instance-123',
      });

      mockRailwayClient.deployService.mockResolvedValue({
        id: 'railway-deployment-123',
        status: 'BUILDING',
      });

      mockRailwayClient.generateDomain.mockResolvedValue({
        id: 'railway-domain-123',
        domain: 'my-site-abc123.railway.app',
      });

      const authToken = await createTestAuthToken({ userId });
      const request = new NextRequest('http://localhost:3000/api/deployment/instances', {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createRequest),
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(201);
      expect(data.instance).toBeDefined();
      expect(data.deployment).toBeDefined();
      expect(data.instance.name).toBe('My WordPress Site');
      expect(data.instance.templateId).toBe(template.id);
      expect(data.instance.userId).toBe(userId);
      expect(data.instance.status).toBe('pending');

      // Verify database records
      const instance = await testDb.findInstanceById(data.instance.id);
      expect(instance).toBeDefined();
      expect(instance.tenantPrefix).toMatch(/^user-user-123-wordpress-cms-.+$/);

      const deployment = await testDb.findDeploymentById(data.deployment.id);
      expect(deployment).toBeDefined();
      expect(deployment.type).toBe('create');
      expect(deployment.status).toBe('pending');

      // Verify Railway API calls
      expect(mockRailwayClient.createService).toHaveBeenCalledWith({
        projectId: expect.any(String),
        name: expect.stringMatching(/^user-user-123-wordpress-cms-.+$/),
        variables: expect.objectContaining({
          SITE_TITLE: 'My Awesome Site',
          ADMIN_EMAIL: 'admin@example.com',
        }),
      });
    });

    it('should validate instance name uniqueness', async () => {
      // Arrange
      const userId = 'user-123';
      const template = await testDb.createTemplate();
      await testDb.createInstance({
        name: 'Existing Instance',
        userId,
        templateId: template.id,
      });

      const createRequest = {
        name: 'Existing Instance', // Duplicate name
        templateId: template.id,
      };

      const authToken = await createTestAuthToken({ userId });
      const request = new NextRequest('http://localhost:3000/api/deployment/instances', {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createRequest),
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.error.code).toBe('INSTANCE_VALIDATION_ERROR');
      expect(data.error.message).toContain('Instance name already exists');
    });

    it('should enforce subscription limits', async () => {
      // Arrange
      const userId = 'user-123';
      const template = await testDb.createTemplate();
      
      // Create instance to reach starter limit (1 instance)
      await testDb.createInstance({
        userId,
        templateId: template.id,
      });

      const createRequest = {
        name: 'Second Instance',
        templateId: template.id,
      };

      const authToken = await createTestAuthToken({ userId });
      const request = new NextRequest('http://localhost:3000/api/deployment/instances', {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createRequest),
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.error.code).toBe('INSTANCE_VALIDATION_ERROR');
      expect(data.error.message).toContain('Instance limit reached');
    });
  });

  describe('GET /api/deployment/instances', () => {
    it('should return user instances with tenant isolation', async () => {
      // Arrange
      const user1Id = 'user-123';
      const user2Id = 'user-456';
      const template = await testDb.createTemplate();

      // Create instances for different users
      const user1Instance = await testDb.createInstance({
        name: 'User 1 Instance',
        userId: user1Id,
        templateId: template.id,
      });

      await testDb.createInstance({
        name: 'User 2 Instance',
        userId: user2Id,
        templateId: template.id,
      });

      const authToken = await createTestAuthToken({ userId: user1Id });
      const request = new NextRequest('http://localhost:3000/api/deployment/instances', {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.instances).toHaveLength(1);
      expect(data.instances[0].id).toBe(user1Instance.id);
      expect(data.instances[0].userId).toBe(user1Id);
      expect(data.total).toBe(1);
    });

    it('should filter instances by status', async () => {
      // Arrange
      const userId = 'user-123';
      const template = await testDb.createTemplate();

      await testDb.createInstance({
        userId,
        templateId: template.id,
        status: 'running',
      });

      await testDb.createInstance({
        userId,
        templateId: template.id,
        status: 'stopped',
      });

      const authToken = await createTestAuthToken({ userId });
      const request = new NextRequest('http://localhost:3000/api/deployment/instances?status=running', {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.instances).toHaveLength(1);
      expect(data.instances[0].status).toBe('running');
    });
  });
});

// tests/integration/services/InstanceService.integration.test.ts
import { InstanceService } from '@/services/deployment/InstanceService';
import { EventBus } from '@/lib/events';
import { testDb, setupTestDatabase, teardownTestDatabase } from '../helpers/testDatabase';
import { mockRailwayClient } from '../helpers/mockRailway';

// Mock Railway client
jest.mock('@/lib/railway/client', () => ({
  railwayClient: mockRailwayClient,
}));

describe('InstanceService Integration', () => {
  let instanceService: InstanceService;
  let eventBus: EventBus;

  beforeAll(async () => {
    await setupTestDatabase();
    eventBus = new EventBus();
    instanceService = new InstanceService(eventBus);
  });

  afterAll(async () => {
    await teardownTestDatabase();
    await eventBus.shutdown();
  });

  beforeEach(async () => {
    await testDb.cleanup();
    jest.clearAllMocks();
  });

  describe('createInstance', () => {
    it('should create instance and process deployment end-to-end', async () => {
      // Arrange
      const userId = 'user-123';
      const template = await testDb.createTemplate({
        name: 'wordpress-cms',
        pricingTier: 'starter',
      });

      const createInput = {
        name: 'Test WordPress',
        templateId: template.id,
        domain: { type: 'generated' as const },
        environment: {
          SITE_TITLE: 'Test Site',
        },
      };

      // Mock Railway API
      mockRailwayClient.createService.mockResolvedValue({
        id: 'railway-service-123',
        projectId: 'railway-project-123',
        name: 'user-user-123-wordpress-cms-test',
      });

      mockRailwayClient.deployService.mockResolvedValue({
        id: 'railway-deployment-123',
        status: 'BUILDING',
      });

      mockRailwayClient.generateDomain.mockResolvedValue({
        id: 'railway-domain-123',
        domain: 'test-site-abc123.railway.app',
      });

      // Track events
      const eventPromises: Promise<any>[] = [];
      eventBus.subscribe('instance.created', (payload) => {
        eventPromises.push(Promise.resolve(payload));
      });

      // Act
      const result = await instanceService.createInstance(userId, createInput);

      // Give background deployment time to process
      await new Promise(resolve => setTimeout(resolve, 100));

      // Assert
      expect(result.instance).toBeDefined();
      expect(result.deployment).toBeDefined();
      expect(result.instance.name).toBe('Test WordPress');
      expect(result.instance.status).toBe('pending');

      // Verify database state
      const instance = await testDb.findInstanceById(result.instance.id);
      expect(instance).toBeDefined();
      expect(instance.railwayServiceId).toBe('railway-service-123');

      // Verify event was published
      const publishedEvents = await Promise.all(eventPromises);
      expect(publishedEvents).toHaveLength(1);
      expect(publishedEvents[0].instanceId).toBe(result.instance.id);

      // Verify Railway API calls
      expect(mockRailwayClient.createService).toHaveBeenCalled();
      expect(mockRailwayClient.deployService).toHaveBeenCalled();
      expect(mockRailwayClient.generateDomain).toHaveBeenCalled();
    });

    it('should rollback on Railway API failure', async () => {
      // Arrange
      const userId = 'user-123';
      const template = await testDb.createTemplate();

      const createInput = {
        name: 'Failing Instance',
        templateId: template.id,
      };

      // Mock Railway API to fail
      mockRailwayClient.createService.mockResolvedValue({
        id: 'railway-service-123',
        projectId: 'railway-project-123',
        name: 'test-service',
      });

      mockRailwayClient.deployService.mockRejectedValue(
        new Error('Railway deployment failed')
      );

      mockRailwayClient.deleteService.mockResolvedValue(undefined);

      // Act & Assert
      await expect(instanceService.createInstance(userId, createInput))
        .rejects.toThrow('Railway deployment failed');

      // Verify rollback was called
      expect(mockRailwayClient.deleteService).toHaveBeenCalledWith('railway-service-123');
    });
  });

  describe('deleteInstance', () => {
    it('should perform soft delete by default', async () => {
      // Arrange
      const userId = 'user-123';
      const template = await testDb.createTemplate();
      const instance = await testDb.createInstance({
        userId,
        templateId: template.id,
        railwayServiceId: 'railway-service-123',
      });

      // Act
      const result = await instanceService.deleteInstance(instance.id, userId);

      // Assert
      expect(result.success).toBe(true);

      // Verify soft delete
      const deletedInstance = await testDb.findInstanceById(instance.id, { includeDeleted: true });
      expect(deletedInstance).toBeDefined();
      expect(deletedInstance.deletedAt).toBeDefined();

      // Verify Railway service was not deleted
      expect(mockRailwayClient.deleteService).not.toHaveBeenCalled();
    });

    it('should perform hard delete when force=true', async () => {
      // Arrange
      const userId = 'user-123';
      const template = await testDb.createTemplate();
      const instance = await testDb.createInstance({
        userId,
        templateId: template.id,
        railwayServiceId: 'railway-service-123',
      });

      mockRailwayClient.deleteService.mockResolvedValue(undefined);

      // Act
      const result = await instanceService.deleteInstance(instance.id, userId, { force: true });

      // Assert
      expect(result.success).toBe(true);

      // Verify hard delete
      const deletedInstance = await testDb.findInstanceById(instance.id, { includeDeleted: true });
      expect(deletedInstance).toBeNull();

      // Verify Railway service was deleted
      expect(mockRailwayClient.deleteService).toHaveBeenCalledWith('railway-service-123');
    });
  });
});

// tests/e2e/deployment-flow.spec.ts
import { test, expect } from '@playwright/test';
import { testDb } from './helpers/database';
import { mockRailwayApi } from './helpers/mockRailway';

test.describe('Complete Deployment Flow', () => {
  test.beforeEach(async ({ page }) => {
    await testDb.cleanup();
    await mockRailwayApi.reset();
    
    // Seed test data
    await testDb.seedTemplates([
      {
        name: 'wordpress-cms',
        displayName: 'WordPress CMS',
        category: 'cms',
        featured: true,
        pricingTier: 'starter',
        monthlyPrice: 0,
      },
    ]);

    // Login user
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
  });

  test('should deploy WordPress template successfully', async ({ page }) => {
    // Step 1: Navigate to templates
    await page.goto('/dashboard/templates');
    await expect(page.locator('[data-testid="templates-page"]')).toBeVisible();

    // Step 2: Select WordPress template
    const wordpressCard = page.locator('[data-testid="template-wordpress-cms"]');
    await expect(wordpressCard).toBeVisible();
    await expect(wordpressCard.locator('text=WordPress CMS')).toBeVisible();
    await expect(wordpressCard.locator('[data-testid="featured-badge"]')).toBeVisible();

    await wordpressCard.click();

    // Step 3: Fill deployment form
    await expect(page.locator('[data-testid="deploy-template-modal"]')).toBeVisible();
    
    await page.fill('[data-testid="instance-name"]', 'My WordPress Site');
    await page.fill('[data-testid="instance-description"]', 'My personal blog');
    
    // Domain configuration
    await page.selectOption('[data-testid="domain-type"]', 'generated');
    
    // Environment variables
    await page.fill('[data-testid="env-SITE_TITLE"]', 'My Awesome Blog');
    await page.fill('[data-testid="env-ADMIN_EMAIL"]', 'admin@myblog.com');

    // Mock Railway API responses
    await mockRailwayApi.mockCreateService({
      id: 'railway-service-123',
      name: 'user-test-wordpress-cms-instance-123',
    });

    await mockRailwayApi.mockDeployService({
      id: 'railway-deployment-123',
      status: 'BUILDING',
    });

    await mockRailwayApi.mockGenerateDomain({
      id: 'railway-domain-123',
      domain: 'my-blog-abc123.railway.app',
    });

    // Step 4: Deploy
    await page.click('[data-testid="deploy-button"]');

    // Step 5: Verify redirect to deployment monitoring
    await page.waitForURL(/\/dashboard\/deployments\/[a-f0-9-]+/);
    await expect(page.locator('[data-testid="deployment-page"]')).toBeVisible();

    // Step 6: Monitor deployment progress
    await expect(page.locator('[data-testid="deployment-status"]')).toContainText('Creating');
    await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible();
    await expect(page.locator('[data-testid="current-step"]')).toContainText('Creating Railway service');

    // Simulate deployment progress
    await mockRailwayApi.simulateDeploymentProgress([
      { step: 'Creating Railway service', progress: 20 },
      { step: 'Configuring environment', progress: 40 },
      { step: 'Deploying service', progress: 60 },
      { step: 'Setting up domain', progress: 80 },
      { step: 'Finalizing deployment', progress: 100 },
    ]);

    // Wait for deployment completion
    await expect(page.locator('[data-testid="deployment-status"]')).toContainText('Running', { 
      timeout: 60000 
    });

    await expect(page.locator('[data-testid="progress-bar"]')).toHaveAttribute('aria-valuenow', '100');

    // Step 7: Verify instance appears in dashboard
    await page.goto('/dashboard/instances');
    
    const instanceCard = page.locator('[data-testid="instance-My WordPress Site"]');
    await expect(instanceCard).toBeVisible();
    await expect(instanceCard.locator('[data-testid="instance-status"]')).toContainText('Running');
    await expect(instanceCard.locator('[data-testid="instance-domain"]')).toContainText('my-blog-abc123.railway.app');

    // Step 8: Verify instance is accessible
    const domainLink = instanceCard.locator('[data-testid="open-site-button"]');
    await expect(domainLink).toBeVisible();
    
    // Mock external site response
    await page.route('**/my-blog-abc123.railway.app**', route => {
      route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<html><body><h1>My Awesome Blog</h1></body></html>',
      });
    });

    // Click opens in new tab
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      domainLink.click(),
    ]);

    await newPage.waitForLoadState();
    await expect(newPage.locator('h1')).toContainText('My Awesome Blog');
    await newPage.close();
  });

  test('should handle deployment failure gracefully', async ({ page }) => {
    // Navigate to templates and select one
    await page.goto('/dashboard/templates');
    await page.click('[data-testid="template-wordpress-cms"]');

    // Fill form
    await page.fill('[data-testid="instance-name"]', 'Failed Instance');
    
    // Mock Railway API to fail
    await mockRailwayApi.mockCreateServiceFailure('Railway API Error: Service limit exceeded');

    // Attempt deploy
    await page.click('[data-testid="deploy-button"]');

    // Should show error state
    await page.waitForURL(/\/dashboard\/deployments\/[a-f0-9-]+/);
    await expect(page.locator('[data-testid="deployment-status"]')).toContainText('Failed', {
      timeout: 30000,
    });

    await expect(page.locator('[data-testid="error-message"]')).toContainText('Railway API Error');
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();

    // Verify instance shows failed status
    await page.goto('/dashboard/instances');
    const failedInstance = page.locator('[data-testid="instance-Failed Instance"]');
    await expect(failedInstance).toBeVisible();
    await expect(failedInstance.locator('[data-testid="instance-status"]')).toContainText('Failed');
  });

  test('should restart instance successfully', async ({ page }) => {
    // Create a running instance
    const instance = await testDb.createInstance({
      name: 'Running Instance',
      status: 'running',
      railwayServiceId: 'railway-service-123',
    });

    await page.goto('/dashboard/instances');

    // Find instance and restart
    const instanceCard = page.locator(`[data-testid="instance-${instance.name}"]`);
    await instanceCard.locator('[data-testid="instance-menu"]').click();
    await page.click('[data-testid="restart-instance"]');

    // Confirm restart
    await expect(page.locator('[data-testid="confirm-restart-dialog"]')).toBeVisible();
    await page.click('[data-testid="confirm-restart-button"]');

    // Mock Railway API
    await mockRailwayApi.mockDeployService({
      id: 'railway-deployment-restart-123',
      status: 'BUILDING',
    });

    // Should show restarting status
    await expect(instanceCard.locator('[data-testid="instance-status"]')).toContainText('Restarting');

    // Simulate restart completion
    await mockRailwayApi.simulateDeploymentSuccess('railway-deployment-restart-123');

    // Should return to running status
    await expect(instanceCard.locator('[data-testid="instance-status"]')).toContainText('Running', {
      timeout: 30000,
    });
  });

  test('should delete instance with confirmation', async ({ page }) => {
    // Create an instance
    const instance = await testDb.createInstance({
      name: 'Instance to Delete',
      status: 'running',
    });

    await page.goto(`/dashboard/instances/${instance.id}`);

    // Delete instance
    await page.click('[data-testid="delete-instance-button"]');

    // Confirm deletion
    await expect(page.locator('[data-testid="delete-instance-dialog"]')).toBeVisible();
    await page.fill('[data-testid="confirm-instance-name"]', instance.name);
    await page.click('[data-testid="confirm-delete-button"]');

    // Should redirect to instances list
    await page.waitForURL('/dashboard/instances');

    // Instance should not be visible
    await expect(page.locator(`[data-testid="instance-${instance.name}"]`)).not.toBeVisible();

    // Should show success message
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Instance deleted successfully');
  });

  test('should show real-time deployment progress updates', async ({ page }) => {
    await page.goto('/dashboard/templates');
    await page.click('[data-testid="template-wordpress-cms"]');
    await page.fill('[data-testid="instance-name"]', 'Real-time Test');

    // Mock Railway API
    await mockRailwayApi.mockCreateService({ id: 'railway-service-123' });

    await page.click('[data-testid="deploy-button"]');
    await page.waitForURL(/\/dashboard\/deployments\/[a-f0-9-]+/);

    // Should receive real-time updates via WebSocket
    const progressBar = page.locator('[data-testid="progress-bar"]');
    const currentStep = page.locator('[data-testid="current-step"]');

    // Simulate real-time progress updates
    await mockRailwayApi.sendWebSocketUpdate({
      type: 'deployment.progress',
      payload: {
        deploymentId: 'deployment-123',
        progress: {
          currentStep: 'Building application',
          percentage: 25,
          totalSteps: 4,
          completedSteps: 1,
        },
      },
    });

    await expect(progressBar).toHaveAttribute('aria-valuenow', '25');
    await expect(currentStep).toContainText('Building application');

    await mockRailwayApi.sendWebSocketUpdate({
      type: 'deployment.progress',
      payload: {
        deploymentId: 'deployment-123',
        progress: {
          currentStep: 'Deploying to Railway',
          percentage: 75,
          totalSteps: 4,
          completedSteps: 3,
        },
      },
    });

    await expect(progressBar).toHaveAttribute('aria-valuenow', '75');
    await expect(currentStep).toContainText('Deploying to Railway');
  });
});

// tests/e2e/helpers/database.ts
import { PrismaClient } from '@prisma/client';

class TestDatabase {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/test_deployment',
        },
      },
    });
  }

  async cleanup() {
    // Clean up in correct order due to foreign keys
    await this.prisma.deploymentLog.deleteMany();
    await this.prisma.deployment.deleteMany();
    await this.prisma.instanceMetric.deleteMany();
    await this.prisma.instanceBackup.deleteMany();
    await this.prisma.instanceEnvironment.deleteMany();
    await this.prisma.instanceDomain.deleteMany();
    await this.prisma.instance.deleteMany();
    await this.prisma.templateConfig.deleteMany();
    await this.prisma.template.deleteMany();
  }

  async seedTemplates(templates: any[]) {
    for (const template of templates) {
      await this.prisma.template.create({
        data: {
          ...template,
          minCpu: template.minCpu || '0.5',
          minMemory: template.minMemory || '512MB',
          minStorage: template.minStorage || '1GB',
          tags: template.tags || [],
          setupTimeMinutes: template.setupTimeMinutes || 5,
          complexity: template.complexity || 'simple',
          status: template.status || 'active',
        },
      });
    }
  }

  async createInstance(data: any) {
    return await this.prisma.instance.create({
      data: {
        name: data.name || 'Test Instance',
        userId: data.userId || 'test-user-123',
        templateId: data.templateId || 'test-template-123',
        status: data.status || 'pending',
        tenantPrefix: data.tenantPrefix || `user-${data.userId || 'test-user-123'}-test-${Date.now()}`,
        railwayServiceId: data.railwayServiceId,
        ...data,
      },
    });
  }

  async findInstanceById(id: string, options?: { includeDeleted?: boolean }) {
    return await this.prisma.instance.findFirst({
      where: {
        id,
        ...(options?.includeDeleted ? {} : { deletedAt: null }),
      },
    });
  }

  async shutdown() {
    await this.prisma.$disconnect();
  }
}

export const testDb = new TestDatabase();

// tests/e2e/helpers/mockRailway.ts
class MockRailwayApi {
  private responses = new Map<string, any>();

  reset() {
    this.responses.clear();
  }

  mockCreateService(response: any) {
    this.responses.set('createService', response);
  }

  mockDeployService(response: any) {
    this.responses.set('deployService', response);
  }

  mockGenerateDomain(response: any) {
    this.responses.set('generateDomain', response);
  }

  mockCreateServiceFailure(error: string) {
    this.responses.set('createService', { error });
  }

  async simulateDeploymentProgress(steps: Array<{ step: string; progress: number }>) {
    for (const stepData of steps) {
      await this.sendWebSocketUpdate({
        type: 'deployment.progress',
        payload: {
          deploymentId: 'deployment-123',
          progress: {
            currentStep: stepData.step,
            percentage: stepData.progress,
            totalSteps: steps.length,
            completedSteps: Math.ceil((stepData.progress / 100) * steps.length),
          },
        },
      });
      
      // Small delay between steps
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Send completion event
    await this.sendWebSocketUpdate({
      type: 'deployment.completed',
      payload: {
        deploymentId: 'deployment-123',
        status: 'success',
        duration: 120,
      },
    });
  }

  async simulateDeploymentSuccess(deploymentId: string) {
    await this.sendWebSocketUpdate({
      type: 'deployment.completed',
      payload: {
        deploymentId,
        status: 'success',
        duration: 30,
      },
    });
  }

  async sendWebSocketUpdate(message: any) {
    // In real implementation, this would send through WebSocket
    // For E2E tests, we can dispatch custom events to the page
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('websocket-message', {
        detail: message,
      }));
    }
  }
}

export const mockRailwayApi = new MockRailwayApi();