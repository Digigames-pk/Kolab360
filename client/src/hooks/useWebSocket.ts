import { useEffect, useRef, useState } from "react";

interface WebSocketMessage {
  type: string;
  data?: any;
  [key: string]: any;
}

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;

  const connect = () => {
    // Always use real WebSocket connection, but handle localhost properly
    console.log("WebSocket: Connecting to server...");

    try {
      // Use appropriate protocol and host for the environment
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      console.log('WebSocket: Attempting connection to:', wsUrl);
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
        options.onConnect?.();
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          // Handle special system messages
          if (message.type === 'connection_established') {
            console.log('✅ WebSocket connection confirmed:', message.connectionId);
            setIsConnected(true);
            setError(null);
            reconnectAttemptsRef.current = 0;
            return;
          }
          
          if (message.type === 'heartbeat') {
            // Respond to heartbeat to maintain connection
            console.log('💓 WebSocket heartbeat received');
            return;
          }
          
          // Pass other messages to the handler
          options.onMessage?.(message);
        } catch (err) {
          console.error("Failed to parse WebSocket message:", err);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log(`WebSocket: Connection closed. Code: ${event.code}, Reason: ${event.reason}`);
        setIsConnected(false);
        options.onDisconnect?.();
        
        // Always attempt to reconnect for both development and production
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.log(`WebSocket: Reconnection attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts} in ${reconnectDelay/1000}s`);
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`WebSocket: Attempting reconnection ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`);
            connect();
          }, reconnectDelay);
        } else {
          setError("Failed to connect after multiple attempts. Please refresh the page.");
          console.error("WebSocket: Max reconnection attempts reached");
        }
      };

      wsRef.current.onerror = (event) => {
        console.error("WebSocket: Connection error occurred", event);
        setError("WebSocket connection error");
        options.onError?.(event);
        
        // If connection fails immediately, try reconnecting
        if (!isConnected && reconnectAttemptsRef.current < maxReconnectAttempts) {
          console.log("WebSocket: Error occurred, will attempt reconnection");
        }
      };
    } catch (err) {
      setError("Failed to establish WebSocket connection");
      console.error("WebSocket connection error:", err);
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
  };

  const sendMessage = (message: WebSocketMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket is not connected. Message not sent:", message);
      // Attempt to reconnect if connection is lost
      if (!isConnected && reconnectAttemptsRef.current < maxReconnectAttempts) {
        connect();
      }
    }
  };

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, []);

  return {
    isConnected,
    error,
    sendMessage,
    connect,
    disconnect,
  };
}
