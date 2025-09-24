// utils/validators/templateValidator.ts
import { z } from 'zod';

export const templateSchema = z.object({
  name: z.string()
    .min(3, 'Template name must be at least 3 characters')
    .max(50, 'Template name must be less than 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Template name can only contain lowercase letters, numbers, and hyphens'),
  
  displayName: z.string()
    .min(3, 'Display name must be at least 3 characters')
    .max(100, 'Display name must be less than 100 characters'),
  
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters'),
  
  category: z.enum(['cms', 'ecommerce', 'api', 'static', 'database', 'ai', 'analytics', 'other']),
  
  icon: z.string().url('Icon must be a valid URL').optional(),
  
  featured: z.boolean().default(false),
  
  railwayTemplateId: z.string().optional(),
  
  pricingTier: z.enum(['starter', 'pro', 'business', 'enterprise']),
  
  monthlyPrice: z.number().min(0, 'Monthly price cannot be negative'),
  
  setupFee: z.number().min(0, 'Setup fee cannot be negative').optional(),
  
  minCpu: z.string().regex(/^(0\.5|1|2|4|8)$/, 'CPU must be 0.5, 1, 2, 4, or 8'),
  
  minMemory: z.string().regex(/^(512MB|1GB|2GB|4GB|8GB|16GB)$/, 'Memory must be valid size'),
  
  minStorage: z.string().regex(/^(1GB|5GB|10GB|50GB|100GB|500GB)$/, 'Storage must be valid size'),
  
  tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed').optional(),
  
  setupTimeMinutes: z.number().min(1).max(120).optional(),
  
  complexity: z.enum(['simple', 'medium', 'complex']).optional(),
  
  supportedLanguages: z.array(z.string()).optional(),
  
  requiredServices: z.array(z.string()).optional(),
  
  customDomain: z.boolean().default(true),
  
  sslIncluded: z.boolean().default(true),
  
  backupEnabled: z.boolean().default(false),
  
  autoScaling: z.boolean().default(false),
});

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  data?: any;
}

export async function validateTemplate(data: any): Promise<ValidationResult> {
  try {
    const validated = templateSchema.parse(data);
    
    // Additional business logic validation
    const errors: string[] = [];
    
    // Check if pricing tier matches price
    if (validated.pricingTier === 'starter' && validated.monthlyPrice > 10) {
      errors.push('Starter tier templates should not cost more than $10/month');
    }
    
    // Check resource requirements for pricing tier
    const cpuNum = parseFloat(validated.minCpu);
    if (validated.pricingTier === 'starter' && cpuNum > 1) {
      errors.push('Starter tier templates should not require more than 1 CPU');
    }
    
    // Validate complexity vs setup time
    if (validated.complexity === 'simple' && (validated.setupTimeMinutes || 0) > 10) {
      errors.push('Simple templates should setup in 10 minutes or less');
    }
    
    if (validated.complexity === 'complex' && (validated.setupTimeMinutes || 0) < 10) {
      errors.push('Complex templates typically take more than 10 minutes to setup');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      data: validated,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`),
      };
    }
    
    return {
      isValid: false,
      errors: ['Invalid template data'],
    };
  }
}

// utils/validators/instanceValidator.ts
import { z } from 'zod';

export const createInstanceSchema = z.object({
  name: z.string()
    .min(3, 'Instance name must be at least 3 characters')
    .max(50, 'Instance name must be less than 50 characters')
    .regex(/^[a-zA-Z0-9-_\s]+$/, 'Instance name can only contain letters, numbers, hyphens, underscores, and spaces'),
  
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  
  templateId: z.string().uuid('Invalid template ID'),
  
  domain: z.object({
    type: z.enum(['generated', 'custom']),
    customDomain: z.string().regex(
      /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/,
      'Invalid domain format'
    ).optional(),
  }).refine((data) => {
    if (data.type === 'custom') {
      return !!data.customDomain;
    }
    return true;
  }, {
    message: 'Custom domain is required when type is custom',
  }).optional(),
  
  environment: z.record(z.string(), z.string()).optional(),
  
  configuration: z.object({
    scaling: z.object({
      minReplicas: z.number().min(1).max(10).optional(),
      maxReplicas: z.number().min(1).max(50).optional(),
      targetCpuPercent: z.number().min(10).max(90).optional(),
    }).refine((data) => {
      if (data.minReplicas && data.maxReplicas) {
        return data.minReplicas <= data.maxReplicas;
      }
      return true;
    }, {
      message: 'Min replicas must be less than or equal to max replicas',
    }).optional(),
    
    persistence: z.object({
      enabled: z.boolean(),
      size: z.string().regex(/^(1GB|5GB|10GB|50GB|100GB)$/).optional(),
    }).optional(),
  }).optional(),
});

export const updateInstanceSchema = createInstanceSchema.partial().omit({ templateId: true });

export async function validateInstanceCreation(data: any): Promise<ValidationResult> {
  try {
    const validated = createInstanceSchema.parse(data);
    
    // Additional validation
    const errors: string[] = [];
    
    // Validate environment variables
    if (validated.environment) {
      for (const [key, value] of Object.entries(validated.environment)) {
        if (!key.match(/^[A-Z_][A-Z0-9_]*$/)) {
          errors.push(`Invalid environment variable name: ${key}`);
        }
        
        if (value.length > 1000) {
          errors.push(`Environment variable ${key} value is too long (max 1000 characters)`);
        }
      }
    }
    
    // Validate custom domain
    if (validated.domain?.type === 'custom' && validated.domain.customDomain) {
      // Additional domain validation can be added here
      const domain = validated.domain.customDomain;
      if (domain.includes('localhost') || domain.includes('127.0.0.1')) {
        errors.push('Local domains are not allowed');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      data: validated,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`),
      };
    }
    
    return {
      isValid: false,
      errors: ['Invalid instance data'],
    };
  }
}

// utils/validators/environmentValidator.ts
export interface EnvironmentValidationRule {
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'url' | 'email';
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: string[];
}

export interface EnvironmentValidationSchema {
  [key: string]: EnvironmentValidationRule;
}

export class EnvironmentValidator {
  static validate(
    environment: Record<string, string>,
    template?: { requiredEnvironment?: string[]; optionalEnvironment?: string[] },
    schema?: EnvironmentValidationSchema
  ): ValidationResult {
    const errors: string[] = [];
    
    // Check required variables from template
    if (template?.requiredEnvironment) {
      for (const requiredVar of template.requiredEnvironment) {
        if (!environment[requiredVar]) {
          errors.push(`Missing required variable: ${requiredVar}`);
        }
      }
    }
    
    // Validate each environment variable
    for (const [key, value] of Object.entries(environment)) {
      const validationErrors = this.validateVariable(key, value, schema?.[key]);
      errors.push(...validationErrors);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
  
  private static validateVariable(
    key: string,
    value: string,
    rule?: EnvironmentValidationRule
  ): string[] {
    const errors: string[] = [];
    
    if (!rule) {
      // Basic validation for all variables
      if (key.length > 100) {
        errors.push(`Variable name ${key} is too long (max 100 characters)`);
      }
      
      if (value.length > 1000) {
        errors.push(`Variable ${key} value is too long (max 1000 characters)`);
      }
      
      return errors;
    }
    
    // Required check
    if (rule.required && (!value || value.trim().length === 0)) {
      errors.push(`Variable ${key} is required`);
      return errors;
    }
    
    // Skip other validations if value is empty and not required
    if (!value) {
      return errors;
    }
    
    // Type validation
    if (rule.type) {
      switch (rule.type) {
        case 'number':
          if (isNaN(Number(value))) {
            errors.push(`${key} must be a valid number`);
          } else {
            const numValue = Number(value);
            if (rule.min !== undefined && numValue < rule.min) {
              errors.push(`${key} must be at least ${rule.min}`);
            }
            if (rule.max !== undefined && numValue > rule.max) {
              errors.push(`${key} must be at most ${rule.max}`);
            }
          }
          break;
          
        case 'boolean':
          if (!['true', 'false', '1', '0'].includes(value.toLowerCase())) {
            errors.push(`${key} must be a valid boolean (true/false)`);
          }
          break;
          
        case 'url':
          try {
            new URL(value);
          } catch {
            errors.push(`${key} must be a valid URL`);
          }
          break;
          
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            errors.push(`${key} must be a valid email address`);
          }
          break;
      }
    }
    
    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value)) {
      errors.push(`${key} format is invalid`);
    }
    
    // Length validation
    if (rule.minLength && value.length < rule.minLength) {
      errors.push(`${key} must be at least ${rule.minLength} characters`);
    }
    
    if (rule.maxLength && value.length > rule.maxLength) {
      errors.push(`${key} must be at most ${rule.maxLength} characters`);
    }
    
    // Options validation
    if (rule.options && !rule.options.includes(value)) {
      errors.push(`${key} must be one of: ${rule.options.join(', ')}`);
    }
    
    return errors;
  }
}

// utils/errors/deploymentErrors.ts
export abstract class DeploymentError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;
  
  constructor(message: string, public readonly details?: any) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class TemplateNotFoundError extends DeploymentError {
  readonly code = 'TEMPLATE_NOT_FOUND';
  readonly statusCode = 404;
  
  constructor(templateId: string) {
    super(`Template ${templateId} not found`);
  }
}

export class TemplateValidationError extends DeploymentError {
  readonly code = 'TEMPLATE_VALIDATION_ERROR';
  readonly statusCode = 400;
  
  constructor(errors: string[]) {
    super(`Template validation failed: ${errors.join(', ')}`);
    this.details = { errors };
  }
}

export class InstanceNotFoundError extends DeploymentError {
  readonly code = 'INSTANCE_NOT_FOUND';
  readonly statusCode = 404;
  
  constructor(instanceId: string) {
    super(`Instance ${instanceId} not found`);
  }
}

export class InstanceValidationError extends DeploymentError {
  readonly code = 'INSTANCE_VALIDATION_ERROR';
  readonly statusCode = 400;
  
  constructor(errors: string[]) {
    super(`Instance validation failed: ${errors.join(', ')}`);
    this.details = { errors };
  }
}

export class InsufficientPermissionsError extends DeploymentError {
  readonly code = 'INSUFFICIENT_PERMISSIONS';
  readonly statusCode = 403;
  
  constructor(resource: string) {
    super(`Insufficient permissions to access ${resource}`);
  }
}

export class RailwayApiError extends DeploymentError {
  readonly code = 'RAILWAY_API_ERROR';
  readonly statusCode = 502;
  
  constructor(message: string, public readonly railwayError?: any) {
    super(`Railway API error: ${message}`);
    this.details = railwayError;
  }
}

export class DeploymentFailedError extends DeploymentError {
  readonly code = 'DEPLOYMENT_FAILED';
  readonly statusCode = 500;
  
  constructor(deploymentId: string, reason: string) {
    super(`Deployment ${deploymentId} failed: ${reason}`);
  }
}

export class QuotaExceededError extends DeploymentError {
  readonly code = 'QUOTA_EXCEEDED';
  readonly statusCode = 429;
  
  constructor(resource: string) {
    super(`Quota exceeded for ${resource}`);
  }
}

// utils/helpers/tenantHelper.ts
export class TenantHelper {
  static generateTenantPrefix(userId: string, templateName: string, instanceId: string): string {
    // Clean template name to be URL-safe
    const cleanTemplateName = templateName
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    return `user-${userId}-${cleanTemplateName}-${instanceId}`;
  }
  
  static parseTenantPrefix(prefix: string): {
    userId: string;
    templateName: string;
    instanceId: string;
  } | null {
    const match = prefix.match(/^user-([^-]+)-(.+)-([^-]+)$/);
    
    if (!match) {
      return null;
    }
    
    return {
      userId: match[1],
      templateName: match[2],
      instanceId: match[3],
    };
  }
  
  static validateTenantPrefix(prefix: string): boolean {
    return this.parseTenantPrefix(prefix) !== null;
  }
}

// utils/helpers/resourceHelper.ts
export class ResourceHelper {
  static parseMemory(memoryStr: string): number {
    const match = memoryStr.match(/^(\d+(?:\.\d+)?)(MB|GB)$/i);
    
    if (!match) {
      throw new Error(`Invalid memory format: ${memoryStr}`);
    }
    
    const value = parseFloat(match[1]);
    const unit = match[2].toUpperCase();
    
    switch (unit) {
      case 'MB':
        return value;
      case 'GB':
        return value * 1024;
      default:
        throw new Error(`Unsupported memory unit: ${unit}`);
    }
  }
  
  static formatMemory(memoryMB: number): string {
    if (memoryMB >= 1024) {
      return `${(memoryMB / 1024).toFixed(1)}GB`;
    }
    return `${memoryMB}MB`;
  }
  
  static parseCpu(cpuStr: string): number {
    const value = parseFloat(cpuStr);
    if (isNaN(value) || value <= 0) {
      throw new Error(`Invalid CPU format: ${cpuStr}`);
    }
    return value;
  }
  
  static parseStorage(storageStr: string): number {
    const match = storageStr.match(/^(\d+(?:\.\d+)?)(GB|TB)$/i);
    
    if (!match) {
      throw new Error(`Invalid storage format: ${storageStr}`);
    }
    
    const value = parseFloat(match[1]);
    const unit = match[2].toUpperCase();
    
    switch (unit) {
      case 'GB':
        return value;
      case 'TB':
        return value * 1024;
      default:
        throw new Error(`Unsupported storage unit: ${unit}`);
    }
  }
  
  static formatStorage(storageGB: number): string {
    if (storageGB >= 1024) {
      return `${(storageGB / 1024).toFixed(1)}TB`;
    }
    return `${storageGB}GB`;
  }
  
  static calculateMonthlyCost(
    cpu: string,
    memory: string,
    storage: string,
    tier: string
  ): number {
    const cpuCores = this.parseCpu(cpu);
    const memoryMB = this.parseMemory(memory);
    const storageGB = this.parseStorage(storage);
    
    // Base pricing (simplified model)
    const basePrices = {
      starter: { cpu: 5, memory: 0.01, storage: 0.1 },
      pro: { cpu: 8, memory: 0.015, storage: 0.15 },
      business: { cpu: 12, memory: 0.02, storage: 0.2 },
      enterprise: { cpu: 15, memory: 0.025, storage: 0.25 },
    };
    
    const prices = basePrices[tier as keyof typeof basePrices] || basePrices.starter;
    
    const cpuCost = cpuCores * prices.cpu;
    const memoryCost = (memoryMB / 1024) * prices.memory;
    const storageCost = storageGB * prices.storage;
    
    return Math.round((cpuCost + memoryCost + storageCost) * 100) / 100;
  }
}

// utils/helpers/validationHelper.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';

export function validateRequest<T>(schema: z.ZodSchema<T>, data: any): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map(
        err => `${err.path.join('.')}: ${err.message}`
      );
      throw new Error(`Validation failed: ${formattedErrors.join(', ')}`);
    }
    throw error;
  }
}

export function validateQueryParams(request: NextRequest, schema: z.ZodSchema) {
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());
  return validateRequest(schema, params);
}

export function validateRequestBody(body: any, schema: z.ZodSchema) {
  return validateRequest(schema, body);
}

// utils/helpers/errorHandler.ts
import { NextResponse } from 'next/server';
import { DeploymentError } from '../errors/deploymentErrors';
import { logger } from '../logger';

export function handleApiError(error: unknown): NextResponse {
  logger.error('API Error', { error });
  
  // Handle known deployment errors
  if (error instanceof DeploymentError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          timestamp: new Date().toISOString(),
          requestId: generateRequestId(),
        },
      },
      { status: error.statusCode }
    );
  }
  
  // Handle validation errors
  if (error instanceof Error && error.message.startsWith('Validation failed:')) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
          timestamp: new Date().toISOString(),
          requestId: generateRequestId(),
        },
      },
      { status: 400 }
    );
  }
  
  // Handle generic errors
  const message = error instanceof Error ? error.message : 'Internal server error';
  
  return NextResponse.json(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message,
        timestamp: new Date().toISOString(),
        requestId: generateRequestId(),
      },
    },
    { status: 500 }
  );
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// utils/logger.ts
interface LogContext {
  [key: string]: any;
}

class Logger {
  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
  }

  info(message: string, context?: LogContext): void {
    console.log(this.formatMessage('info', message, context));
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message, context));
  }

  error(message: string, context?: LogContext): void {
    console.error(this.formatMessage('error', message, context));
  }

  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage('debug', message, context));
    }
  }
}

export const logger = new Logger();