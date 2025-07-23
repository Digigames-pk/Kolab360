import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketMessage {
  type: string;
  data?: any;
  [key: string]: any;
}

interface UseSocketIOOptions {
  onMessage?: (message: SocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
}

export function useSocketIO(options: UseSocketIOOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize Socket.IO connection
    console.log("Socket.IO: Initializing connection...");
    
    const socket = io({
      path: '/ws',
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('✅ Socket.IO connected:', socket.id);
      setIsConnected(true);
      setError(null);
      options.onConnect?.();
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket.IO disconnected:', reason);
      setIsConnected(false);
      options.onDisconnect?.();
    });

    socket.on('connect_error', (err) => {
      console.error('⚠️ Socket.IO connection error:', err);
      setError(err.message);
      options.onError?.(err);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket.IO reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
      setError(null);
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('🔄 Socket.IO reconnection attempt', attemptNumber);
      setError(`Reconnecting... (attempt ${attemptNumber})`);
    });

    socket.on('reconnect_error', (err) => {
      console.error('❌ Socket.IO reconnection failed:', err);
      setError(`Reconnection failed: ${err.message}`);
    });

    socket.on('reconnect_failed', () => {
      console.error('💀 Socket.IO reconnection failed permanently');
      setError('Connection failed permanently. Please refresh the page.');
    });

    // Message handler for all custom events
    socket.onAny((eventName, ...args) => {
      if (['connect', 'disconnect', 'connect_error', 'reconnect', 'reconnect_attempt', 'reconnect_error', 'reconnect_failed'].includes(eventName)) {
        return; // Skip system events
      }
      
      console.log('📨 Socket.IO message received:', eventName, args);
      
      // Convert to our standard message format
      const message: SocketMessage = {
        type: eventName,
        data: args[0] || {},
        ...args[0]
      };
      
      options.onMessage?.(message);
    });

    // Cleanup
    return () => {
      console.log('🧹 Socket.IO cleanup');
      socket.disconnect();
    };
  }, []);

  const sendMessage = (message: SocketMessage) => {
    if (socketRef.current?.connected) {
      console.log('📤 Socket.IO sending:', message.type, message);
      socketRef.current.emit(message.type, message);
    } else {
      console.warn('⚠️ Socket.IO not connected. Message queued:', message);
      // Socket.IO will automatically queue messages and send when reconnected
      socketRef.current?.emit(message.type, message);
    }
  };

  const disconnect = () => {
    socketRef.current?.disconnect();
  };

  return {
    isConnected,
    error,
    sendMessage,
    disconnect,
    socket: socketRef.current
  };
}