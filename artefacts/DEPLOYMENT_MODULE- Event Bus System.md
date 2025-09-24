// lib/events/EventBus.ts
import { EventEmitter } from 'events';
import { logger } from '@/utils/logger';
import type { DeploymentWebSocketEvents } from '@/types/deployment';

export interface EventHandler<T = any> {
  (payload: T): Promise<void> | void;
}

export interface EventMetadata {
  eventId: string;
  timestamp: string;
  source: string;
  userId?: string;
  instanceId?: string;
  retryCount?: number;
}

export interface EventWithMetadata<T = any> {
  type: string;
  payload: T;
  metadata: EventMetadata;
}

export class EventBus {
  private emitter: EventEmitter;
  private handlers = new Map<string, Set<EventHandler>>();
  private deadLetterQueue: EventWithMetadata[] = [];
  private maxRetries = 3;
  private retryDelay = 1000; // milliseconds

  constructor() {
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(100); // Increase default limit
    this.setupErrorHandling();
  }

  private setupErrorHandling() {
    this.emitter.on('error', (error) => {
      logger.error('EventBus error', { error });
    });

    // Handle uncaught exceptions in event handlers
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception in event handler', { error });
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled promise rejection in event handler', { 
        reason, 
        promise 
      });
    });
  }

  async publish<T extends keyof DeploymentWebSocketEvents>(
    eventType: T,
    payload: DeploymentWebSocketEvents[T],
    source = 'deployment-module'
  ): Promise<void> {
    const metadata: EventMetadata = {
      eventId: this.generateEventId(),
      timestamp: new Date().toISOString(),
      source,
      userId: (payload as any).userId,
      instanceId: (payload as any).instanceId,
      retryCount: 0,
    };

    const event: EventWithMetadata<DeploymentWebSocketEvents[T]> = {
      type: eventType,
      payload,
      metadata,
    };

    await this.publishEvent(event);
  }

  private async publishEvent<T>(event: EventWithMetadata<T>): Promise<void> {
    try {
      logger.debug('Publishing event', {
        type: event.type,
        eventId: event.metadata.eventId,
        source: event.metadata.source,
      });

      const handlers = this.handlers.get(event.type) || new Set();
      const promises: Promise<void>[] = [];

      for (const handler of handlers) {
        promises.push(this.executeHandler(handler, event));
      }

      // Execute all handlers concurrently
      await Promise.allSettled(promises);

      // Also emit to EventEmitter for legacy compatibility
      this.emitter.emit(event.type, event.payload, event.metadata);

      logger.debug('Event published successfully', {
        type: event.type,
        eventId: event.metadata.eventId,
        handlerCount: handlers.size,
      });

    } catch (error) {
      logger.error('Failed to publish event', {
        type: event.type,
        eventId: event.metadata.eventId,
        error,
      });

      // Retry logic
      await this.handleEventFailure(event, error);
    }
  }

  private async executeHandler<T>(
    handler: EventHandler<T>,
    event: EventWithMetadata<T>
  ): Promise<void> {
    try {
      const result = handler(event.payload);
      
      // Handle both sync and async handlers
      if (result instanceof Promise) {
        await result;
      }

    } catch (error) {
      logger.error('Event handler failed', {
        type: event.type,
        eventId: event.metadata.eventId,
        error,
      });

      // Don't rethrow - we want other handlers to continue
      // Individual handler failures are logged but don't stop event processing
    }
  }

  private async handleEventFailure<T>(
    event: EventWithMetadata<T>,
    error: unknown
  ): Promise<void> {
    const retryCount = (event.metadata.retryCount || 0) + 1;

    if (retryCount <= this.maxRetries) {
      // Retry with exponential backoff
      const delay = this.retryDelay * Math.pow(2, retryCount - 1);
      
      logger.warn('Retrying failed event', {
        type: event.type,
        eventId: event.metadata.eventId,
        retryCount,
        delay,
      });

      setTimeout(async () => {
        const retryEvent = {
          ...event,
          metadata: {
            ...event.metadata,
            retryCount,
          },
        };

        await this.publishEvent(retryEvent);
      }, delay);

    } else {
      // Move to dead letter queue
      logger.error('Event failed after max retries, moving to dead letter queue', {
        type: event.type,
        eventId: event.metadata.eventId,
        retryCount,
        error,
      });

      this.deadLetterQueue.push(event);
      
      // Emit dead letter event for monitoring
      this.emitter.emit('deadLetter', event, error);
    }
  }

  subscribe<T extends keyof DeploymentWebSocketEvents>(
    eventType: T,
    handler: EventHandler<DeploymentWebSocketEvents[T]>
  ): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }

    this.handlers.get(eventType)!.add(handler as EventHandler);

    logger.debug('Event handler subscribed', {
      eventType,
      handlerCount: this.handlers.get(eventType)!.size,
    });
  }

  unsubscribe<T extends keyof DeploymentWebSocketEvents>(
    eventType: T,
    handler: EventHandler<DeploymentWebSocketEvents[T]>
  ): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      handlers.delete(handler as EventHandler);
      
      if (handlers.size === 0) {
        this.handlers.delete(eventType);
      }

      logger.debug('Event handler unsubscribed', {
        eventType,
        remainingHandlers: handlers.size,
      });
    }
  }

  // Legacy EventEmitter compatibility
  on<T extends keyof DeploymentWebSocketEvents>(
    eventType: T,
    handler: EventHandler<DeploymentWebSocketEvents[T]>
  ): void {
    this.subscribe(eventType, handler);
  }

  off<T extends keyof DeploymentWebSocketEvents>(
    eventType: T,
    handler: EventHandler<DeploymentWebSocketEvents[T]>
  ): void {
    this.unsubscribe(eventType, handler);
  }

  // Utility methods
  getSubscriberCount(eventType: string): number {
    return this.handlers.get(eventType)?.size || 0;
  }

  getActiveEventTypes(): string[] {
    return Array.from(this.handlers.keys());
  }

  getDeadLetterQueue(): EventWithMetadata[] {
    return [...this.deadLetterQueue];
  }

  clearDeadLetterQueue(): void {
    this.deadLetterQueue.length = 0;
    logger.info('Dead letter queue cleared');
  }

  reprocessDeadLetterQueue(): Promise<void> {
    const events = [...this.deadLetterQueue];
    this.deadLetterQueue.length = 0;

    logger.info('Reprocessing dead letter queue', { eventCount: events.length });

    return Promise.all(
      events.map(event => {
        // Reset retry count for reprocessing
        event.metadata.retryCount = 0;
        return this.publishEvent(event);
      })
    ).then(() => {
      logger.info('Dead letter queue reprocessed');
    });
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Health and statistics
  getStats() {
    const eventTypeStats = new Map<string, number>();
    
    for (const [eventType, handlers] of this.handlers) {
      eventTypeStats.set(eventType, handlers.size);
    }

    return {
      totalEventTypes: this.handlers.size,
      totalHandlers: Array.from(this.handlers.values()).reduce(
        (sum, handlers) => sum + handlers.size, 
        0
      ),
      eventTypeStats: Object.fromEntries(eventTypeStats),
      deadLetterQueueSize: this.deadLetterQueue.length,
      maxListeners: this.emitter.getMaxListeners(),
    };
  }

  async shutdown(): Promise<void> {
    logger.info('Shutting down EventBus');

    // Clear all handlers
    this.handlers.clear();

    // Remove all EventEmitter listeners
    this.emitter.removeAllListeners();

    logger.info('EventBus shutdown complete');
  }
}

// Singleton instance
let eventBusInstance: EventBus | null = null;

export function getEventBus(): EventBus {
  if (!eventBusInstance) {
    eventBusInstance = new EventBus();
  }
  return eventBusInstance;
}

// lib/events/DeploymentEventHandlers.ts
import { getEventBus } from './EventBus';
import { prisma } from '@/lib/db';
import { logger } from '@/utils/logger';
import type { 
  InstanceStatusChangedEvent,
  DeploymentProgressEvent,
  DeploymentCompletedEvent,
  MetricsUpdatedEvent 
} from '@/types/deployment';

export class DeploymentEventHandlers {
  private eventBus: EventBus;

  constructor() {
    this.eventBus = getEventBus();
    this.setupHandlers();
  }

  private setupHandlers() {
    // Instance status changes
    this.eventBus.subscribe('instance.status_changed', this.handleInstanceStatusChanged.bind(this));

    // Deployment events
    this.eventBus.subscribe('deployment.started', this.handleDeploymentStarted.bind(this));
    this.eventBus.subscribe('deployment.progress', this.handleDeploymentProgress.bind(this));
    this.eventBus.subscribe('deployment.completed', this.handleDeploymentCompleted.bind(this));
    this.eventBus.subscribe('deployment.failed', this.handleDeploymentFailed.bind(this));

    // Metrics events
    this.eventBus.subscribe('metrics.updated', this.handleMetricsUpdated.bind(this));

    logger.info('Deployment event handlers initialized');
  }

  private async handleInstanceStatusChanged(event: InstanceStatusChangedEvent) {
    try {
      // Update instance status in database
      await prisma.instance.update({
        where: { id: event.instanceId },
        data: { 
          status: event.newStatus,
          updatedAt: new Date(event.timestamp),
        },
      });

      // Log status change
      logger.info('Instance status changed', {
        instanceId: event.instanceId,
        oldStatus: event.oldStatus,
        newStatus: event.newStatus,
      });

      // Trigger additional actions based on status
      await this.handleStatusChangeActions(event);

    } catch (error) {
      logger.error('Failed to handle instance status change', {
        instanceId: event.instanceId,
        error,
      });
    }
  }

  private async handleStatusChangeActions(event: InstanceStatusChangedEvent) {
    const { instanceId, newStatus } = event;

    switch (newStatus) {
      case 'running':
        // Update last deployed timestamp
        await prisma.instance.update({
          where: { id: instanceId },
          data: { lastDeployedAt: new Date() },
        });
        
        // Start metrics collection
        await this.startMetricsCollection(instanceId);
        break;

      case 'failed':
        // Create incident record or alert
        await this.handleInstanceFailure(instanceId);
        break;

      case 'stopped':
        // Stop metrics collection
        await this.stopMetricsCollection(instanceId);
        break;
    }
  }

  private async handleDeploymentStarted(event: { deploymentId: string; instanceId: string; type: string }) {
    try {
      logger.info('Deployment started', event);

      // Update deployment status
      await prisma.deployment.update({
        where: { id: event.deploymentId },
        data: { 
          status: 'in_progress',
          currentStep: 'Initializing deployment',
        },
      });

    } catch (error) {
      logger.error('Failed to handle deployment started', { event, error });
    }
  }

  private async handleDeploymentProgress(event: DeploymentProgressEvent) {
    try {
      // Update deployment progress
      await prisma.deployment.update({
        where: { id: event.deploymentId },
        data: {
          currentStep: event.progress.currentStep,
          completedSteps: event.progress.completedSteps,
          progressPercentage: event.progress.percentage,
        },
      });

      // Log progress milestone
      if (event.progress.percentage % 25 === 0) {
        logger.info('Deployment progress milestone', {
          deploymentId: event.deploymentId,
          progress: event.progress.percentage,
          step: event.progress.currentStep,
        });
      }

    } catch (error) {
      logger.error('Failed to handle deployment progress', { event, error });
    }
  }

  private async handleDeploymentCompleted(event: DeploymentCompletedEvent) {
    try {
      // Update deployment as completed
      await prisma.deployment.update({
        where: { id: event.deploymentId },
        data: {
          status: event.status,
          completedAt: new Date(event.timestamp),
          duration: event.duration,
          progressPercentage: 100,
        },
      });

      // Update instance status if deployment was successful
      if (event.status === 'success') {
        await prisma.instance.update({
          where: { id: event.instanceId },
          data: {
            status: 'running',
            lastDeployedAt: new Date(event.timestamp),
          },
        });
      }

      logger.info('Deployment completed', {
        deploymentId: event.deploymentId,
        instanceId: event.instanceId,
        status: event.status,
        duration: event.duration,
      });

    } catch (error) {
      logger.error('Failed to handle deployment completed', { event, error });
    }
  }

  private async handleDeploymentFailed(event: { deploymentId: string; instanceId: string; error: string }) {
    try {
      // Update deployment as failed
      await prisma.deployment.update({
        where: { id: event.deploymentId },
        data: {
          status: 'failed',
          completedAt: new Date(),
          errorMessage: event.error,
        },
      });

      // Update instance status
      await prisma.instance.update({
        where: { id: event.instanceId },
        data: { status: 'failed' },
      });

      logger.error('Deployment failed', event);

      // TODO: Send notification to user
      await this.notifyDeploymentFailure(event);

    } catch (error) {
      logger.error('Failed to handle deployment failure', { event, error });
    }
  }

  private async handleMetricsUpdated(event: MetricsUpdatedEvent) {
    try {
      // Store metrics in database
      await prisma.instanceMetric.create({
        data: {
          instanceId: event.instanceId,
          recordedAt: new Date(event.timestamp),
          cpuUsage: event.metrics.usage.cpu.current,
          memoryUsage: this.parseMemoryToBytes(event.metrics.usage.memory.current),
          responseTime: event.metrics.performance.responseTime.current,
          // Add other metrics as needed
        },
      });

      // Update cached metrics on instance
      await prisma.instance.update({
        where: { id: event.instanceId },
        data: {
          currentCpuUsage: event.metrics.usage.cpu.current,
          currentMemoryUsage: event.metrics.usage.memory.current,
        },
      });

    } catch (error) {
      logger.error('Failed to handle metrics update', { event, error });
    }
  }

  // Helper methods

  private async startMetricsCollection(instanceId: string) {
    // This would typically start a background job to collect metrics
    logger.info('Starting metrics collection', { instanceId });
  }

  private async stopMetricsCollection(instanceId: string) {
    // This would stop the metrics collection background job
    logger.info('Stopping metrics collection', { instanceId });
  }

  private async handleInstanceFailure(instanceId: string) {
    // Create incident record or send alerts
    logger.warn('Instance failure detected', { instanceId });
    
    // TODO: Implement alerting system
    // await this.sendAlert('instance_failure', { instanceId });
  }

  private async notifyDeploymentFailure(event: { deploymentId: string; instanceId: string; error: string }) {
    // TODO: Send notification to user about deployment failure
    logger.info('Should notify user about deployment failure', event);
  }

  private parseMemoryToBytes(memoryStr: string): number {
    const match = memoryStr.match(/^(\d+(?:\.\d+)?)(MB|GB)$/i);
    if (!match) return 0;

    const value = parseFloat(match[1]);
    const unit = match[2].toUpperCase();

    switch (unit) {
      case 'MB':
        return Math.round(value * 1024 * 1024);
      case 'GB':
        return Math.round(value * 1024 * 1024 * 1024);
      default:
        return 0;
    }
  }
}

// Initialize event handlers
export function initializeDeploymentEventHandlers(): DeploymentEventHandlers {
  return new DeploymentEventHandlers();
}

// Export the singleton event bus
export { getEventBus };
export type { EventBus };