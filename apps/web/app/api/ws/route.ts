import { NextRequest, NextResponse } from 'next/server';
import { WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import { getUserId } from '@/lib/auth-mock';

// WebSocket server instance
let wss: WebSocketServer | null = null;

// Connection tracking
const connections = new Map<string, Set<any>>();
const userConnections = new Map<string, string>(); // ws -> userId

export async function GET(request: NextRequest) {
  // This is for HTTP upgrade to WebSocket
  return NextResponse.json({ error: 'WebSocket upgrade required' }, { status: 426 });
}

// Initialize WebSocket server (called from Next.js server)
export function initWebSocketServer(server: any) {
  if (wss) return wss;
  
  wss = new WebSocketServer({ 
    server,
    path: '/api/ws'
  });

  wss.on('connection', async (ws: any, req: IncomingMessage) => {
    console.log('New WebSocket connection');
    
    ws.on('message', async (message: Buffer) => {
      try {
        const data = JSON.parse(message.toString());
        await handleWebSocketMessage(ws, data);
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({ error: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      // Clean up connections
      const userId = userConnections.get(ws);
      if (userId) {
        const userWs = connections.get(userId);
        if (userWs) {
          userWs.delete(ws);
          if (userWs.size === 0) {
            connections.delete(userId);
          }
        }
        userConnections.delete(ws);
      }
      console.log('WebSocket connection closed');
    });

    ws.on('error', (error: Error) => {
      console.error('WebSocket error:', error);
    });
  });

  return wss;
}

async function handleWebSocketMessage(ws: any, data: any) {
  const { type, payload } = data;

  switch (type) {
    case 'auth':
      await handleAuth(ws, payload);
      break;
    
    case 'join_workspace':
      await handleJoinWorkspace(ws, payload);
      break;
    
    case 'leave_workspace':
      await handleLeaveWorkspace(ws, payload);
      break;
    
    case 'heartbeat':
      ws.send(JSON.stringify({ type: 'heartbeat', timestamp: Date.now() }));
      break;
    
    default:
      ws.send(JSON.stringify({ error: `Unknown message type: ${type}` }));
  }
}

async function handleAuth(ws: any, payload: any) {
  try {
    const { token, userId } = payload;
    
    // For now, use mock auth - in production, validate the token
    if (!userId) {
      ws.send(JSON.stringify({ error: 'Authentication failed' }));
      return;
    }

    // Track user connection
    userConnections.set(ws, userId);
    
    if (!connections.has(userId)) {
      connections.set(userId, new Set());
    }
    connections.get(userId)!.add(ws);

    ws.send(JSON.stringify({ 
      type: 'auth_success', 
      userId,
      timestamp: Date.now()
    }));
    
    console.log(`User ${userId} authenticated via WebSocket`);
  } catch (error) {
    console.error('Auth error:', error);
    ws.send(JSON.stringify({ error: 'Authentication failed' }));
  }
}

async function handleJoinWorkspace(ws: any, payload: any) {
  const userId = userConnections.get(ws);
  if (!userId) {
    ws.send(JSON.stringify({ error: 'Not authenticated' }));
    return;
  }

  const { workspaceId } = payload;
  
  // Subscribe to workspace updates
  ws.workspaceId = workspaceId;
  
  ws.send(JSON.stringify({ 
    type: 'workspace_joined', 
    workspaceId,
    timestamp: Date.now()
  }));
  
  // Send initial workspace state
  broadcastToWorkspace(workspaceId, {
    type: 'user_joined',
    userId,
    timestamp: Date.now()
  }, userId);
}

async function handleLeaveWorkspace(ws: any, payload: any) {
  const userId = userConnections.get(ws);
  const { workspaceId } = payload;
  
  if (ws.workspaceId === workspaceId) {
    ws.workspaceId = null;
    
    broadcastToWorkspace(workspaceId, {
      type: 'user_left',
      userId,
      timestamp: Date.now()
    }, userId);
  }
}

// Broadcast message to all users in a workspace
export function broadcastToWorkspace(workspaceId: string, message: any, excludeUserId?: string) {
  if (!wss) return;
  
  wss.clients.forEach((ws: any) => {
    if (ws.readyState === ws.OPEN && ws.workspaceId === workspaceId) {
      const userId = userConnections.get(ws);
      if (!excludeUserId || userId !== excludeUserId) {
        ws.send(JSON.stringify(message));
      }
    }
  });
}

// Broadcast message to specific user
export function broadcastToUser(userId: string, message: any) {
  const userWs = connections.get(userId);
  if (userWs) {
    userWs.forEach((ws) => {
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });
  }
}

// Broadcast system-wide notifications
export function broadcastSystemNotification(message: any) {
  if (!wss) return;
  
  wss.clients.forEach((ws: any) => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({
        type: 'system_notification',
        ...message,
        timestamp: Date.now()
      }));
    }
  });
}

// Export connection status
export function getConnectionStats() {
  return {
    totalConnections: wss ? wss.clients.size : 0,
    userConnections: connections.size,
    workspaceConnections: Array.from(wss?.clients || [])
      .reduce((acc: any, ws: any) => {
        if (ws.workspaceId) {
          acc[ws.workspaceId] = (acc[ws.workspaceId] || 0) + 1;
        }
        return acc;
      }, {})
  };
}