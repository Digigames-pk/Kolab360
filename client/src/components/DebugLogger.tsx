import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bug, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  component: string;
  message: string;
  data?: any;
}

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private listeners: ((logs: LogEntry[]) => void)[] = [];

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public log(level: 'info' | 'warn' | 'error' | 'success', component: string, message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      component,
      message,
      data
    };
    
    this.logs.push(entry);
    console.log(`[${level.toUpperCase()}] ${component}: ${message}`, data || '');
    
    // Notify all listeners
    this.listeners.forEach(listener => listener([...this.logs]));
  }

  public subscribe(listener: (logs: LogEntry[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public getLogs() {
    return [...this.logs];
  }

  public clear() {
    this.logs = [];
    this.listeners.forEach(listener => listener([]));
  }
}

export const logger = Logger.getInstance();

export function DebugLogger() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = logger.subscribe(setLogs);
    return unsubscribe;
  }, []);

  const getIcon = (level: string) => {
    switch (level) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warn': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default: return <Bug className="h-4 w-4 text-blue-500" />;
    }
  };

  const getBadgeVariant = (level: string) => {
    switch (level) {
      case 'success': return 'default';
      case 'error': return 'destructive';
      case 'warn': return 'secondary';
      default: return 'outline';
    }
  };

  if (!isVisible) {
    return (
      <Button
        className="fixed bottom-4 right-4 z-50"
        onClick={() => setIsVisible(true)}
        variant="outline"
        size="sm"
      >
        <Bug className="h-4 w-4 mr-2" />
        Debug ({logs.length})
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-80 z-50 bg-white shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Debug Console</CardTitle>
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" onClick={() => logger.clear()}>
              Clear
            </Button>
            <Button size="sm" variant="outline" onClick={() => setIsVisible(false)}>
              ×
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2">
        <ScrollArea className="h-60">
          <div className="space-y-1">
            {logs.slice(-50).map((log, index) => (
              <div key={index} className="flex items-start space-x-2 p-2 rounded border text-xs">
                {getIcon(log.level)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <Badge variant={getBadgeVariant(log.level)} className="text-xs">
                      {log.component}
                    </Badge>
                    <span className="text-gray-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="mt-1 text-gray-900 break-words">{log.message}</p>
                  {log.data && (
                    <pre className="mt-1 text-gray-600 text-xs bg-gray-100 p-1 rounded overflow-x-auto">
                      {JSON.stringify(log.data, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}