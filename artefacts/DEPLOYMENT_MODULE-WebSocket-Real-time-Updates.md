// lib/websocket/DeploymentWebSocketHandler.ts
import { WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { parse } from 'url';
import jwt from 'jsonwebtoken';
import { logger } from '@/utils/logger';
import { EventBus } from '@/lib/events';
import type { DeploymentWebSocketEvents } from '@/types/deployment';

export interface WebSocketClient {
  id: string;
  userId: string;
  instanceId?: string;
  ws: WebSocket;
  subscriptions: Set<string>;
  lastPing: number;
  metadata: Record<string, any>;
}

export interface WebSocketMessage {
  type: string;
  payload?: any;
  requestId?: string;
}

export class DeploymentWebSocketHandler {
  private clients = new Map<string, WebSocketClient>();
  private eventBus: EventBus;
  private pingInterval: NodeJS.Timeout;
  private cleanupInterval: NodeJS.Timeout;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.setupEventListeners();
    this.startPingInterval();
    this.startCleanupInterval();
  }

  async handleConnection(ws: WebSocket, request: IncomingMessage) {
    try {
      const { query } = parse(request.url || '', true);
      const token = query.token as string;
      const instanceId = query.instanceId as string;

      if (!token) {
        ws.close(1008, 'Authentication token required');
        return;
      }

      // Verify JWT token
      const decoded = this.verifyToken(token);
      if (!decoded) {
        ws.close(1008, 'Invalid authentication token');
        return;
      }

      // Create client
      const client: WebSocketClient = {
        id: this.generateClientId(),
        userId: decoded.userId,
        instanceId,
        ws,
        subscriptions: new Set(),
        lastPing: Date.now(),
        metadata: {
          connectedAt: new Date().toISOString(),
          userAgent: request.headers['user-agent'],
          ip: this.getClientIP(request),
        },
      };

      this.clients.set(client.id, client);

      // Setup WebSocket event handlers
      this.setupClientHandlers(client);

      // Send welcome message
      this.sendToClient(client, {
        type: 'connected',
        payload: {
          clientId: client.id,
          serverTime: new Date().toISOString(),
        },
      });

      // Auto-subscribe to relevant events
      this.autoSubscribe(client);

      logger.info('WebSocket client connected', {
        clientId: client.id,
        userId: client.userId,
        instanceId: client.instanceId,
      });

    } catch (error) {
      logger.error('WebSocket connection error', { error });
      ws.close(1011, 'Internal server error');
    }
  }

  private setupClientHandlers(client: WebSocketClient) {
    const { ws } = client;

    ws.on('message', (data: Buffer) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());
        this.handleClientMessage(client, message);
      } catch (error) {
        logger.error('WebSocket message parse error', { 
          clientId: client.id, 
          error 
        });
        this.sendError(client, 'Invalid message format');
      }
    });

    ws.on('pong', () => {
      client.lastPing = Date.now();
    });

    ws.on('close', (code: number, reason: Buffer) => {
      this.handleClientDisconnect(client, code, reason.toString());
    });

    ws.on('error', (error: Error) => {
      logger.error('WebSocket client error', { 
        clientId: client.id, 
        error 
      });
    });
  }

  private handleClientMessage(client: WebSocketClient, message: WebSocketMessage) {
    switch (message.type) {
      case 'subscribe':
        this.handleSubscribe(client, message);
        break;
      case 'unsubscribe':
        this.handleUnsubscribe(client, message);
        break;
      case 'ping':
        this.handlePing(client, message);
        break;
      default:
        logger.warn('Unknown WebSocket message type', { 
          clientId: client.id, 
          type: message.type 
        });
        this.sendError(client, `Unknown message type: ${message.type}`);
    }
  }

  private handleSubscribe(client: WebSocketClient, message: WebSocketMessage) {
    const { events } = message.payload || {};
    
    if (!Array.isArray(events)) {
      this.sendError(client, 'Events must be an array');
      return;
    }

    for (const event of events) {
      if (this.canSubscribeToEvent(client, event)) {
        client.subscriptions.add(event);
      } else {
        logger.warn('Subscription denied', { 
          clientId: client.id, 
          event 
        });
      }
    }

    this.sendToClient(client, {
      type: 'subscribed',
      payload: {
        events: Array.from(client.subscriptions),
      },
      requestId: message.requestId,
    });
  }

  private handleUnsubscribe(client: WebSocketClient, message: WebSocketMessage) {
    const { events } = message.payload || {};
    
    if (!Array.isArray(events)) {
      this.sendError(client, 'Events must be an array');
      return;
    }

    for (const event of events) {
      client.subscriptions.delete(event);
    }

    this.sendToClient(client, {
      type: 'unsubscribed',
      payload: {
        events: Array.from(client.subscriptions),
      },
      requestId: message.requestId,
    });
  }

  private handlePing(client: WebSocketClient, message: WebSocketMessage) {
    client.lastPing = Date.now();
    this.sendToClient(client, {
      type: 'pong',
      payload: {
        timestamp: new Date().toISOString(),
      },
      requestId: message.requestId,
    });
  }

  private handleClientDisconnect(client: WebSocketClient, code: number, reason: string) {
    this.clients.delete(client.id);
    
    logger.info('WebSocket client disconnected', {
      clientId: client.id,
      userId: client.userId,
      code,
      reason,
      duration: Date.now() - new Date(client.metadata.connectedAt).getTime(),
    });
  }

  private autoSubscribe(client: WebSocketClient) {
    const autoSubscriptions = [
      'instance.status_changed',
      'deployment.started',
      'deployment.progress',
      'deployment.completed',
      'deployment.failed',
    ];

    // Add instance-specific subscriptions
    if (client.instanceId) {
      autoSubscriptions.push(
        'logs.new_entry',
        'metrics.updated'
      );
    }

    for (const event of autoSubscriptions) {
      if (this.canSubscribeToEvent(client, event)) {
        client.subscriptions.add(event);
      }
    }

    logger.info('Auto-subscribed client to events', {
      clientId: client.id,
      subscriptions: Array.from(client.subscriptions),
    });
  }

  private canSubscribeToEvent(client: WebSocketClient, event: string): boolean {
    // Instance-specific events require instanceId
    const instanceEvents = ['logs.new_entry', 'metrics.updated'];
    if (instanceEvents.includes(event) && !client.instanceId) {
      return false;
    }

    // Admin-only events
    const adminEvents = ['system.alerts', 'admin.notifications'];
    if (adminEvents.includes(event)) {
      // TODO: Check if user is admin when AUTH_MODULE is integrated
      return false;
    }

    return true;
  }

  private setupEventListeners() {
    // Listen to all deployment events
    const eventTypes: (keyof DeploymentWebSocketEvents)[] = [
      'instance.status_changed',
      'deployment.started',
      'deployment.progress',
      'deployment.completed',
      'deployment.failed',
      'logs.new_entry',
      'metrics.updated',
    ];

    for (const eventType of eventTypes) {
      this.eventBus.subscribe(eventType, async (payload) => {
        await this.broadcastEvent(eventType, payload);
      });
    }
  }

  private async broadcastEvent<T extends keyof DeploymentWebSocketEvents>(
    eventType: T,
    payload: DeploymentWebSocketEvents[T]
  ) {
    const message = {
      type: eventType,
      payload,
      timestamp: new Date().toISOString(),
    };

    let sentCount = 0;
    const subscribedClients = Array.from(this.clients.values()).filter(client => 
      client.subscriptions.has(eventType) && this.shouldReceiveEvent(client, eventType, payload)
    );

    for (const client of subscribedClients) {
      if (this.sendToClient(client, message)) {
        sentCount++;
      }
    }

    if (sentCount > 0) {
      logger.debug('Broadcasted event', {
        eventType,
        recipientCount: sentCount,
        totalClients: this.clients.size,
      });
    }
  }

  private shouldReceiveEvent(
    client: WebSocketClient,
    eventType: string,
    payload: any
  ): boolean {
    // Instance-specific filtering
    if ('instanceId' in payload) {
      // Client must be subscribed to this specific instance
      if (client.instanceId && client.instanceId !== payload.instanceId) {
        return false;
      }
      
      // TODO: Check if user owns this instance when AUTH_MODULE is integrated
      // For now, we assume instanceId filter is sufficient
    }

    // User-specific filtering
    if ('userId' in payload) {
      if (client.userId !== payload.userId) {
        return false;
      }
    }

    return true;
  }

  private sendToClient(client: WebSocketClient, message: WebSocketMessage): boolean {
    try {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
        return true;
      } else {
        // Remove dead connection
        this.clients.delete(client.id);
        return false;
      }
    } catch (error) {
      logger.error('Failed to send WebSocket message', {
        clientId: client.id,
        error,
      });
      this.clients.delete(client.id);
      return false;
    }
  }

  private sendError(client: WebSocketClient, message: string, requestId?: string) {
    this.sendToClient(client, {
      type: 'error',
      payload: {
        message,
        timestamp: new Date().toISOString(),
      },
      requestId,
    });
  }

  private startPingInterval() {
    this.pingInterval = setInterval(() => {
      for (const [clientId, client] of this.clients) {
        if (client.ws.readyState === WebSocket.OPEN) {
          client.ws.ping();
        } else {
          this.clients.delete(clientId);
        }
      }
    }, 30000); // Ping every 30 seconds
  }

  private startCleanupInterval() {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      const timeout = 60000; // 60 seconds

      for (const [clientId, client] of this.clients) {
        if (now - client.lastPing > timeout) {
          logger.info('Removing inactive WebSocket client', { clientId });
          client.ws.close(1000, 'Inactive connection');
          this.clients.delete(clientId);
        }
      }
    }, 30000); // Check every 30 seconds
  }

  private verifyToken(token: string): { userId: string } | null {
    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error('JWT_SECRET not configured');
      }

      const decoded = jwt.verify(token, secret) as any;
      return { userId: decoded.sub || decoded.userId };
    } catch (error) {
      logger.error('JWT verification failed', { error });
      return null;
    }
  }

  private generateClientId(): string {
    return `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getClientIP(request: IncomingMessage): string {
    const forwarded = request.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return request.socket.remoteAddress || 'unknown';
  }

  // Public methods for external use

  public getConnectedClients(): WebSocketClient[] {
    return Array.from(this.clients.values());
  }

  public getClientsByUserId(userId: string): WebSocketClient[] {
    return Array.from(this.clients.values()).filter(client => client.userId === userId);
  }

  public getClientsByInstanceId(instanceId: string): WebSocketClient[] {
    return Array.from(this.clients.values()).filter(client => client.instanceId === instanceId);
  }

  public disconnectClient(clientId: string, reason = 'Server initiated disconnect') {
    const client = this.clients.get(clientId);
    if (client) {
      client.ws.close(1000, reason);
      this.clients.delete(clientId);
    }
  }

  public disconnectUserClients(userId: string, reason = 'User session terminated') {
    const userClients = this.getClientsByUserId(userId);
    for (const client of userClients) {
      this.disconnectClient(client.id, reason);
    }
  }

  public getStats() {
    const clients = Array.from(this.clients.values());
    const instanceConnections = new Map<string, number>();
    
    for (const client of clients) {
      if (client.instanceId) {
        instanceConnections.set(
          client.instanceId,
          (instanceConnections.get(client.instanceId) || 0) + 1
        );
      }
    }

    return {
      totalConnections: clients.length,
      uniqueUsers: new Set(clients.map(c => c.userId)).size,
      instanceConnections: Object.fromEntries(instanceConnections),
      averageSubscriptions: clients.length > 0 
        ? clients.reduce((sum, c) => sum + c.subscriptions.size, 0) / clients.length 
        : 0,
    };
  }

  public async shutdown() {
    // Clear intervals
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    // Close all client connections
    for (const [clientId, client] of this.clients) {
      client.ws.close(1001, 'Server shutdown');
    }

    this.clients.clear();
    logger.info('WebSocket handler shutdown complete');
  }
}

// app/api/deployment/ws/route.ts
import { NextRequest } from 'next/server';
import { WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import { Socket } from 'net';
import { DeploymentWebSocketHandler } from '@/lib/websocket/DeploymentWebSocketHandler';
import { EventBus } from '@/lib/events';

let wsHandler: DeploymentWebSocketHandler | null = null;
let wss: WebSocketServer | null = null;

// Initialize WebSocket server (called once)
function initializeWebSocketServer() {
  if (wss) return wss;

  wss = new WebSocketServer({ noServer: true });
  const eventBus = new EventBus();
  wsHandler = new DeploymentWebSocketHandler(eventBus);

  wss.on('connection', (ws, request) => {
    wsHandler?.handleConnection(ws, request);
  });

  console.log('WebSocket server initialized');
  return wss;
}

// Handle HTTP Upgrade to WebSocket
export async function GET(request: NextRequest) {
  const { socket, response } = request as any;

  if (!socket?.writable) {
    return new Response('WebSocket upgrade failed', { status: 400 });
  }

  const wss = initializeWebSocketServer();

  // Handle the upgrade
  wss.handleUpgrade(request as any, socket, Buffer.alloc(0), (ws) => {
    wss.emit('connection', ws, request);
  });

  return new Response('WebSocket connection established', { status: 101 });
}

// Alternative WebSocket route for environments that support it
// pages/api/deployment/ws.ts (if using Pages Router)
import type { NextApiRequest, NextApiResponse } from 'next';
import { WebSocketServer } from 'ws';
import { parse } from 'url';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Check if this is a WebSocket upgrade request
  if (req.headers.upgrade !== 'websocket') {
    return res.status(400).json({ message: 'Expected WebSocket upgrade' });
  }

  const wss = initializeWebSocketServer();

  // Handle the upgrade
  wss.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws) => {
    wss.emit('connection', ws, req);
  });
}

// Client-side WebSocket utility
// utils/websocket/client.ts
export class DeploymentWebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;
  private handlers = new Map<string, Function[]>();

  constructor(
    private token: string,
    private instanceId?: string
  ) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = new URL(`${protocol}//${window.location.host}/api/deployment/ws`);
        wsUrl.searchParams.set('token', this.token);
        
        if (this.instanceId) {
          wsUrl.searchParams.set('instanceId', this.instanceId);
        }

        this.ws = new WebSocket(wsUrl.toString());

        this.ws.onopen = () => {
          this.reconnectAttempts = 0;
          console.log('WebSocket connected');
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  private handleMessage(message: any) {
    const handlers = this.handlers.get(message.type) || [];
    for (const handler of handlers) {
      try {
        handler(message.payload);
      } catch (error) {
        console.error('WebSocket message handler error:', error);
      }
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(() => {
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.connect().catch(console.error);
    }, delay);
  }

  subscribe(events: string[]) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'subscribe',
        payload: { events }
      }));
    }
  }

  unsubscribe(events: string[]) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'unsubscribe',
        payload: { events }
      }));
    }
  }

  on(eventType: string, handler: Function) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  off(eventType: string, handler: Function) {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export { DeploymentWebSocketHandler, DeploymentWebSocketClient };