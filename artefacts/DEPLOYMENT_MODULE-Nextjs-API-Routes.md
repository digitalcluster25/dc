// app/api/deployment/templates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { TemplateService } from '@/services/deployment/TemplateService';
import { validateRequest } from '@/utils/validation';
import { handleApiError } from '@/utils/errorHandler';

const getTemplatesSchema = z.object({
  category: z.string().optional(),
  pricingTier: z.enum(['starter', 'pro', 'business', 'enterprise']).optional(),
  complexity: z.enum(['simple', 'medium', 'complex']).optional(),
  search: z.string().optional(),
  featured: z.boolean().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

const templateService = new TemplateService();

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
    
    const { searchParams } = new URL(request.url);
    const query = validateRequest(getTemplatesSchema, Object.fromEntries(searchParams));

    const { limit, offset, ...filters } = query;
    
    const result = await templateService.getTemplates(
      filters,
      { skip: offset, take: limit }
    );

    return NextResponse.json({
      templates: result.templates,
      total: result.total,
      hasMore: result.hasMore,
      pagination: {
        limit,
        offset,
        nextOffset: result.hasMore ? offset + limit : null,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// app/api/deployment/templates/[templateId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { TemplateService } from '@/services/deployment/TemplateService';
import { handleApiError } from '@/utils/errorHandler';

const templateService = new TemplateService();

export async function GET(
  request: NextRequest,
  { params }: { params: { templateId: string } }
) {
  try {
    await requireAuth(request);
    
    const template = await templateService.getTemplate(params.templateId);
    
    return NextResponse.json({ template });
  } catch (error) {
    return handleApiError(error);
  }
}

// app/api/deployment/instances/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { InstanceService } from '@/services/deployment/InstanceService';
import { EventBus } from '@/lib/events';
import { validateRequest } from '@/utils/validation';
import { handleApiError } from '@/utils/errorHandler';

const createInstanceSchema = z.object({
  name: z.string().min(3).max(50).regex(/^[a-zA-Z0-9-_\s]+$/),
  description: z.string().max(500).optional(),
  templateId: z.string().uuid(),
  domain: z.object({
    type: z.enum(['generated', 'custom']),
    customDomain: z.string().optional(),
  }).optional(),
  environment: z.record(z.string()).optional(),
  configuration: z.object({
    scaling: z.object({
      minReplicas: z.number().min(1).max(10).optional(),
      maxReplicas: z.number().min(1).max(50).optional(),
      targetCpuPercent: z.number().min(10).max(90).optional(),
    }).optional(),
    persistence: z.object({
      enabled: z.boolean(),
      size: z.string().optional(),
    }).optional(),
  }).optional(),
});

const getInstancesSchema = z.object({
  status: z.string().optional(),
  templateId: z.string().uuid().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  sortBy: z.enum(['name', 'status', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const eventBus = new EventBus();
const instanceService = new InstanceService(eventBus);

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireAuth(request);
    const body = await request.json();
    const data = validateRequest(createInstanceSchema, body);

    const result = await instanceService.createInstance(user.id, data);

    return NextResponse.json({
      instance: result.instance,
      deployment: result.deployment,
    }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { user } = await requireAuth(request);
    
    const { searchParams } = new URL(request.url);
    const query = validateRequest(getInstancesSchema, Object.fromEntries(searchParams));

    const { limit, offset, sortBy, sortOrder, ...filters } = query;
    
    const result = await instanceService.getUserInstances(
      user.id,
      filters,
      { skip: offset, take: limit }
    );

    return NextResponse.json({
      instances: result.instances,
      total: result.total,
      hasMore: result.hasMore,
      pagination: {
        limit,
        offset,
        nextOffset: result.hasMore ? offset + limit : null,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// app/api/deployment/instances/[instanceId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { InstanceService } from '@/services/deployment/InstanceService';
import { EventBus } from '@/lib/events';
import { validateRequest } from '@/utils/validation';
import { handleApiError } from '@/utils/errorHandler';

const updateInstanceSchema = z.object({
  name: z.string().min(3).max(50).regex(/^[a-zA-Z0-9-_\s]+$/).optional(),
  description: z.string().max(500).optional(),
  environment: z.record(z.string()).optional(),
  configuration: z.object({
    scaling: z.object({
      minReplicas: z.number().min(1).max(10).optional(),
      maxReplicas: z.number().min(1).max(50).optional(),
    }).optional(),
  }).optional(),
});

const deleteInstanceSchema = z.object({
  force: z.boolean().default(false),
  backup: z.boolean().default(false),
});

const eventBus = new EventBus();
const instanceService = new InstanceService(eventBus);

export async function GET(
  request: NextRequest,
  { params }: { params: { instanceId: string } }
) {
  try {
    const { user } = await requireAuth(request);
    
    const instance = await instanceService.getInstance(params.instanceId, user.id);
    
    return NextResponse.json({ instance });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { instanceId: string } }
) {
  try {
    const { user } = await requireAuth(request);
    const body = await request.json();
    const data = validateRequest(updateInstanceSchema, body);

    const instance = await instanceService.updateInstance(
      params.instanceId,
      user.id,
      data
    );

    return NextResponse.json({ 
      instance,
      requiresRestart: !!(data.environment || data.configuration),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { instanceId: string } }
) {
  try {
    const { user } = await requireAuth(request);
    
    const { searchParams } = new URL(request.url);
    const options = validateRequest(deleteInstanceSchema, Object.fromEntries(searchParams));

    const result = await instanceService.deleteInstance(
      params.instanceId,
      user.id,
      options
    );

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

// app/api/deployment/instances/[instanceId]/restart/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { InstanceService } from '@/services/deployment/InstanceService';
import { EventBus } from '@/lib/events';
import { handleApiError } from '@/utils/errorHandler';

const eventBus = new EventBus();
const instanceService = new InstanceService(eventBus);

export async function POST(
  request: NextRequest,
  { params }: { params: { instanceId: string } }
) {
  try {
    const { user } = await requireAuth(request);
    
    const deployment = await instanceService.restartInstance(params.instanceId, user.id);
    
    return NextResponse.json({ 
      deployment,
      estimatedDowntime: 30, // seconds
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// app/api/deployment/instances/[instanceId]/scale/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { validateRequest } from '@/utils/validation';
import { handleApiError } from '@/utils/errorHandler';

const scaleInstanceSchema = z.object({
  resources: z.object({
    cpu: z.string().optional(),
    memory: z.string().optional(),
    replicas: z.number().min(1).max(10).optional(),
  }),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { instanceId: string } }
) {
  try {
    const { user } = await requireAuth(request);
    const body = await request.json();
    const data = validateRequest(scaleInstanceSchema, body);

    // Implementation would scale the Railway service
    // For now, return a placeholder response
    
    return NextResponse.json({
      deployment: {
        id: 'deployment-' + Date.now(),
        status: 'pending',
        type: 'scale',
      },
      newResourceLimits: data.resources,
      additionalCost: 0, // Calculate based on new resources
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// app/api/deployment/instances/[instanceId]/deployments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { validateRequest } from '@/utils/validation';
import { handleApiError } from '@/utils/errorHandler';

const getDeploymentsSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'success', 'failed', 'cancelled']).optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { instanceId: string } }
) {
  try {
    const { user } = await requireAuth(request);
    
    // Verify user owns the instance
    const instance = await prisma.instance.findFirst({
      where: {
        id: params.instanceId,
        userId: user.id,
        deletedAt: null,
      },
    });

    if (!instance) {
      return NextResponse.json(
        { error: { code: 'INSTANCE_NOT_FOUND', message: 'Instance not found' } },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = validateRequest(getDeploymentsSchema, Object.fromEntries(searchParams));

    const where: any = {
      instanceId: params.instanceId,
    };

    if (query.status) {
      where.status = query.status;
    }

    const [deployments, total] = await Promise.all([
      prisma.deployment.findMany({
        where,
        skip: query.offset,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          logs: {
            orderBy: { timestamp: 'asc' },
            take: 50, // Limit logs per deployment
          },
        },
      }),
      prisma.deployment.count({ where }),
    ]);

    return NextResponse.json({
      deployments,
      total,
      hasMore: query.offset + query.limit < total,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// app/api/deployment/instances/[instanceId]/domains/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { railwayClient } from '@/lib/railway/client';
import { validateRequest } from '@/utils/validation';
import { handleApiError } from '@/utils/errorHandler';

const addDomainSchema = z.object({
  domain: z.string().min(3).max(255),
  sslEnabled: z.boolean().default(true),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { instanceId: string } }
) {
  try {
    const { user } = await requireAuth(request);
    
    // Verify user owns the instance
    const instance = await prisma.instance.findFirst({
      where: {
        id: params.instanceId,
        userId: user.id,
        deletedAt: null,
      },
      include: {
        domains: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!instance) {
      return NextResponse.json(
        { error: { code: 'INSTANCE_NOT_FOUND', message: 'Instance not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      domains: instance.domains,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { instanceId: string } }
) {
  try {
    const { user } = await requireAuth(request);
    const body = await request.json();
    const data = validateRequest(addDomainSchema, body);
    
    // Verify user owns the instance
    const instance = await prisma.instance.findFirst({
      where: {
        id: params.instanceId,
        userId: user.id,
        deletedAt: null,
      },
    });

    if (!instance) {
      return NextResponse.json(
        { error: { code: 'INSTANCE_NOT_FOUND', message: 'Instance not found' } },
        { status: 404 }
      );
    }

    // Create domain in Railway
    const railwayDomain = await railwayClient.createDomain(
      instance.railwayServiceId,
      data.domain
    );

    // Create domain record in database
    const domain = await prisma.instanceDomain.create({
      data: {
        instanceId: params.instanceId,
        domain: data.domain,
        type: 'custom',
        sslEnabled: data.sslEnabled,
        railwayDomainId: railwayDomain.id,
        status: 'pending',
      },
    });

    return NextResponse.json({ domain }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

// app/api/deployment/instances/[instanceId]/metrics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { validateRequest } from '@/utils/validation';
import { handleApiError } from '@/utils/errorHandler';

const getMetricsSchema = z.object({
  period: z.enum(['1h', '24h', '7d', '30d']).default('24h'),
  metrics: z.array(z.enum(['cpu', 'memory', 'bandwidth', 'requests', 'errors'])).optional(),
  interval: z.enum(['1m', '5m', '1h', '1d']).default('5m'),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { instanceId: string } }
) {
  try {
    const { user } = await requireAuth(request);
    
    // Verify user owns the instance
    const instance = await prisma.instance.findFirst({
      where: {
        id: params.instanceId,
        userId: user.id,
        deletedAt: null,
      },
    });

    if (!instance) {
      return NextResponse.json(
        { error: { code: 'INSTANCE_NOT_FOUND', message: 'Instance not found' } },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = validateRequest(getMetricsSchema, Object.fromEntries(searchParams));

    // Calculate time range based on period
    const now = new Date();
    const periodMap = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    };
    
    const startTime = new Date(now.getTime() - periodMap[query.period]);

    // Fetch metrics from database
    const metrics = await prisma.instanceMetric.findMany({
      where: {
        instanceId: params.instanceId,
        recordedAt: {
          gte: startTime,
          lte: now,
        },
      },
      orderBy: { recordedAt: 'asc' },
    });

    // Format metrics data
    const data = metrics.map(metric => ({
      timestamp: metric.recordedAt.toISOString(),
      cpu: metric.cpuUsage,
      memory: metric.memoryUsage,
      bandwidth: {
        incoming: metric.bandwidthIn,
        outgoing: metric.bandwidthOut,
      },
      requests: metric.requestCount,
      errors: metric.errorCount,
    }));

    return NextResponse.json({
      period: query.period,
      interval: query.interval,
      data,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// app/api/deployment/instances/[instanceId]/logs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { validateRequest } from '@/utils/validation';
import { handleApiError } from '@/utils/errorHandler';

const getLogsSchema = z.object({
  level: z.enum(['debug', 'info', 'warn', 'error']).optional(),
  source: z.enum(['application', 'system', 'deployment']).optional(),
  limit: z.coerce.number().min(1).max(1000).default(100),
  since: z.string().datetime().optional(),
  search: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { instanceId: string } }
) {
  try {
    const { user } = await requireAuth(request);
    
    // Verify user owns the instance
    const instance = await prisma.instance.findFirst({
      where: {
        id: params.instanceId,
        userId: user.id,
        deletedAt: null,
      },
    });

    if (!instance) {
      return NextResponse.json(
        { error: { code: 'INSTANCE_NOT_FOUND', message: 'Instance not found' } },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = validateRequest(getLogsSchema, Object.fromEntries(searchParams));

    // Build where clause for deployment logs
    const where: any = {
      deployment: {
        instanceId: params.instanceId,
      },
    };

    if (query.level) {
      where.level = query.level;
    }

    if (query.source) {
      where.source = query.source;
    }

    if (query.since) {
      where.timestamp = {
        gte: new Date(query.since),
      };
    }

    if (query.search) {
      where.message = {
        contains: query.search,
        mode: 'insensitive',
      };
    }

    const logs = await prisma.deploymentLog.findMany({
      where,
      take: query.limit,
      orderBy: { timestamp: 'desc' },
      include: {
        deployment: {
          select: {
            id: true,
            type: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json({
      logs: logs.map(log => ({
        id: log.id,
        timestamp: log.timestamp.toISOString(),
        level: log.level,
        message: log.message,
        source: log.source,
        step: log.step,
        component: log.component,
        metadata: log.metadata,
        deployment: log.deployment,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// app/api/deployment/health/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { railwayClient } from '@/lib/railway/client';

export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    checks: {
      database: { healthy: false, responseTime: 0 },
      railway: { healthy: false, responseTime: 0 },
    },
  };

  try {
    // Database health check
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    checks.checks.database = {
      healthy: true,
      responseTime: Date.now() - dbStart,
    };

    // Railway API health check
    const railwayStart = Date.now();
    const railwayHealthy = await railwayClient.healthCheck();
    checks.checks.railway = {
      healthy: railwayHealthy,
      responseTime: Date.now() - railwayStart,
    };

    const allHealthy = Object.values(checks.checks).every(check => check.healthy);
    checks.status = allHealthy ? 'healthy' : 'unhealthy';

    return NextResponse.json(checks, {
      status: allHealthy ? 200 : 503,
    });
  } catch (error) {
    checks.status = 'unhealthy';
    return NextResponse.json(checks, { status: 503 });
  }
}