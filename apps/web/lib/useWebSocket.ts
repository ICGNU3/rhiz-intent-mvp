import { useEffect, useRef, useState, useCallback } from 'react';
import { useUser } from './useUser';
import { useWorkspace } from './useWorkspace';

export interface WebSocketMessage {
  type: string;
  payload?: any;
  timestamp?: number;
}

export interface WebSocketOptions {
  autoConnect?: boolean;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  heartbeatInterval?: number;
}

export function useWebSocket(options: WebSocketOptions = {}) {
  const {
    autoConnect = true,
    reconnectAttempts = 5,
    reconnectInterval = 3000,
    heartbeatInterval = 30000
  } = options;

  const { userId } = useUser();
  const { workspaceId } = useWorkspace();
  
  const ws = useRef<WebSocket | null>(null);
  const reconnectCount = useRef(0);
  const heartbeatTimer = useRef<NodeJS.Timeout>();
  
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [messageHistory, setMessageHistory] = useState<WebSocketMessage[]>([]);

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return;
    
    setConnectionState('connecting');
    
    try {
      // Use wss in production, ws in development
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/ws`;
      
      ws.current = new WebSocket(wsUrl);
      
      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setConnectionState('connected');
        reconnectCount.current = 0;
        
        // Authenticate
        if (userId) {
          sendMessage({
            type: 'auth',
            payload: { userId, token: 'mock-token' }
          });
        }
        
        // Join workspace
        if (workspaceId) {
          sendMessage({
            type: 'join_workspace',
            payload: { workspaceId }
          });
        }
        
        // Start heartbeat
        startHeartbeat();
      };
      
      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          setMessageHistory(prev => [...prev, message].slice(-100)); // Keep last 100 messages
          
          // Handle system messages
          if (message.type === 'auth_success') {
            console.log('WebSocket authentication successful');
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
      
      ws.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setConnectionState('disconnected');
        stopHeartbeat();
        
        // Attempt reconnection
        if (reconnectCount.current < reconnectAttempts && autoConnect) {
          reconnectCount.current++;
          console.log(`Attempting to reconnect (${reconnectCount.current}/${reconnectAttempts})...`);
          setTimeout(connect, reconnectInterval);
        }
      };
      
      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionState('error');
      };
      
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionState('error');
    }
  }, [userId, workspaceId, autoConnect, reconnectAttempts, reconnectInterval]);

  const disconnect = useCallback(() => {
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    stopHeartbeat();
    setConnectionState('disconnected');
  }, []);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected. Message not sent:', message);
    }
  }, []);

  const startHeartbeat = useCallback(() => {
    if (heartbeatTimer.current) {
      clearInterval(heartbeatTimer.current);
    }
    
    heartbeatTimer.current = setInterval(() => {
      sendMessage({ type: 'heartbeat' });
    }, heartbeatInterval);
  }, [sendMessage, heartbeatInterval]);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatTimer.current) {
      clearInterval(heartbeatTimer.current);
      heartbeatTimer.current = undefined;
    }
  }, []);

  // Subscribe to specific message types
  const subscribe = useCallback((messageType: string, callback: (payload: any) => void) => {
    const unsubscribe = () => {
      // Remove listener logic would go here
      // For now, we'll use the messageHistory approach
    };
    
    return unsubscribe;
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && userId) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [autoConnect, userId, connect, disconnect]);

  // Handle workspace changes
  useEffect(() => {
    if (ws.current?.readyState === WebSocket.OPEN && workspaceId) {
      sendMessage({
        type: 'join_workspace',
        payload: { workspaceId }
      });
    }
  }, [workspaceId, sendMessage]);

  // Broadcast real-time updates
  const broadcastUpdate = useCallback((type: string, payload: any) => {
    sendMessage({
      type: 'broadcast',
      payload: {
        type,
        ...payload,
        workspaceId,
        userId,
        timestamp: Date.now()
      }
    });
  }, [sendMessage, workspaceId, userId]);

  // Convenience methods for common operations
  const notifyNewSuggestion = useCallback((suggestion: any) => {
    broadcastUpdate('new_suggestion', { suggestion });
  }, [broadcastUpdate]);

  const notifyGoalUpdate = useCallback((goal: any) => {
    broadcastUpdate('goal_update', { goal });
  }, [broadcastUpdate]);

  const notifyPersonAdded = useCallback((person: any) => {
    broadcastUpdate('person_added', { person });
  }, [broadcastUpdate]);

  const notifyIntroAccepted = useCallback((suggestionId: string) => {
    broadcastUpdate('intro_accepted', { suggestionId });
  }, [broadcastUpdate]);

  return {
    // Connection state
    connectionState,
    isConnected: connectionState === 'connected',
    isConnecting: connectionState === 'connecting',
    
    // Connection management
    connect,
    disconnect,
    sendMessage,
    
    // Message handling
    lastMessage,
    messageHistory,
    subscribe,
    
    // Real-time updates
    broadcastUpdate,
    notifyNewSuggestion,
    notifyGoalUpdate,
    notifyPersonAdded,
    notifyIntroAccepted,
    
    // Stats
    reconnectCount: reconnectCount.current
  };
}