import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { 
  Shield, 
  Bug, 
  Users, 
  Hash, 
  MessageSquare, 
  Activity,
  RefreshCw,
  Eye,
  EyeOff,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface ChannelStats {
  id: string;
  name: string;
  memberCount: number;
  activeMembers: number;
  lastActivity: string;
  messageCount: number;
  type: 'public' | 'private';
}

interface DMStats {
  id: string;
  name: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: string;
  unreadCount: number;
  totalMessages: number;
}

interface SuperAdminDebuggerProps {
  userRole: string;
  onUpdateChannelStats: (stats: ChannelStats[]) => void;
  onUpdateDMStats: (stats: DMStats[]) => void;
  currentChannelStats: ChannelStats[];
  currentDMStats: DMStats[];
}

export function SuperAdminDebugger({ 
  userRole, 
  onUpdateChannelStats, 
  onUpdateDMStats,
  currentChannelStats,
  currentDMStats 
}: SuperAdminDebuggerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [simulationMode, setSimulationMode] = useState(true);

  // Only show for super admin
  if (userRole !== 'super_admin') {
    return null;
  }

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        simulateRealTimeUpdates();
        addDebugLog('Auto-refresh: Updated member counts');
      }, refreshInterval * 1000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    setDebugLogs(prev => [logEntry, ...prev].slice(0, 100)); // Keep last 100 logs
  };

  const simulateRealTimeUpdates = () => {
    // Simulate realistic member count changes
    const updatedChannels = currentChannelStats.map(channel => ({
      ...channel,
      memberCount: Math.max(1, channel.memberCount + Math.floor(Math.random() * 3 - 1)), // -1, 0, or +1
      activeMembers: Math.max(0, Math.floor(channel.memberCount * (0.3 + Math.random() * 0.5))),
      lastActivity: new Date().toISOString(),
      messageCount: channel.messageCount + Math.floor(Math.random() * 5)
    }));

    const updatedDMs = currentDMStats.map(dm => ({
      ...dm,
      status: Math.random() > 0.8 ? 
        (['online', 'away', 'offline'] as const)[Math.floor(Math.random() * 3)] : 
        dm.status,
      unreadCount: Math.max(0, dm.unreadCount + Math.floor(Math.random() * 3 - 1)),
      totalMessages: dm.totalMessages + Math.floor(Math.random() * 2),
      lastSeen: Math.random() > 0.7 ? new Date().toISOString() : dm.lastSeen
    }));

    onUpdateChannelStats(updatedChannels);
    onUpdateDMStats(updatedDMs);
  };

  const resetAllCounts = () => {
    const resetChannels = currentChannelStats.map(channel => ({
      ...channel,
      memberCount: Math.floor(Math.random() * 20) + 1,
      activeMembers: Math.floor(Math.random() * 10),
      messageCount: 0,
      lastActivity: new Date().toISOString()
    }));

    const resetDMs = currentDMStats.map(dm => ({
      ...dm,
      unreadCount: Math.floor(Math.random() * 5),
      totalMessages: Math.floor(Math.random() * 100),
      status: (['online', 'away', 'offline'] as const)[Math.floor(Math.random() * 3)],
      lastSeen: new Date().toISOString()
    }));

    onUpdateChannelStats(resetChannels);
    onUpdateDMStats(resetDMs);
    addDebugLog('Reset all member counts and stats');
  };

  const manualRefresh = () => {
    simulateRealTimeUpdates();
    addDebugLog('Manual refresh triggered');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'away': return 'text-yellow-500';
      case 'offline': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
        >
          <Shield className="h-4 w-4 mr-2" />
          Super Admin Debug
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-4 z-50 bg-black/20 flex items-center justify-center">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white border-2 border-red-200">
        <CardHeader className="bg-red-50 border-b border-red-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-600">Super Admin Debugger</CardTitle>
              <Badge variant="destructive" className="text-xs">RESTRICTED ACCESS</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setIsVisible(false)}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:bg-red-100"
              >
                <EyeOff className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <Tabs defaultValue="channels" className="h-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-50">
              <TabsTrigger value="channels" className="flex items-center space-x-2">
                <Hash className="h-4 w-4" />
                <span>Channels</span>
              </TabsTrigger>
              <TabsTrigger value="dms" className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                <span>Direct Messages</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </TabsTrigger>
              <TabsTrigger value="logs" className="flex items-center space-x-2">
                <Bug className="h-4 w-4" />
                <span>Debug Logs</span>
              </TabsTrigger>
            </TabsList>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <TabsContent value="channels" className="mt-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Channel Member Counts</h3>
                    <div className="flex space-x-2">
                      <Button onClick={manualRefresh} variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                      </Button>
                      <Button onClick={resetAllCounts} variant="outline" size="sm">
                        Reset All
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid gap-4">
                    {currentChannelStats.map((channel) => (
                      <Card key={channel.id} className="border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {channel.type === 'private' ? (
                                <Lock className="h-4 w-4 text-gray-500" />
                              ) : (
                                <Hash className="h-4 w-4 text-gray-500" />
                              )}
                              <div>
                                <h4 className="font-semibold">#{channel.name}</h4>
                                <p className="text-sm text-gray-500">
                                  Last activity: {new Date(channel.lastActivity).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right space-y-1">
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                {channel.memberCount} members
                              </Badge>
                              <br />
                              <Badge variant="outline" className="bg-green-100 text-green-800">
                                {channel.activeMembers} active
                              </Badge>
                              <br />
                              <span className="text-xs text-gray-500">
                                {channel.messageCount} messages
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="dms" className="mt-0">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Direct Message Status</h3>
                  
                  <div className="grid gap-4">
                    {currentDMStats.map((dm) => (
                      <Card key={dm.id} className="border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${
                                dm.status === 'online' ? 'bg-green-500' :
                                dm.status === 'away' ? 'bg-yellow-500' : 
                                'bg-gray-400'
                              }`} />
                              <div>
                                <h4 className="font-semibold">{dm.name}</h4>
                                <p className="text-sm text-gray-500">
                                  Last seen: {new Date(dm.lastSeen).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right space-y-1">
                              <Badge 
                                variant={dm.unreadCount > 0 ? "destructive" : "secondary"}
                                className={dm.unreadCount > 0 ? "" : "bg-gray-100 text-gray-600"}
                              >
                                {dm.unreadCount} unread
                              </Badge>
                              <br />
                              <span className="text-xs text-gray-500">
                                {dm.totalMessages} total messages
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="mt-0">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Debug Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-refresh" className="flex flex-col space-y-1">
                        <span>Auto Refresh</span>
                        <span className="text-sm text-gray-500">Automatically update counts</span>
                      </Label>
                      <Switch
                        id="auto-refresh"
                        checked={autoRefresh}
                        onCheckedChange={setAutoRefresh}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="refresh-interval" className="flex flex-col space-y-1">
                        <span>Refresh Interval</span>
                        <span className="text-sm text-gray-500">Seconds between updates</span>
                      </Label>
                      <Input
                        id="refresh-interval"
                        type="number"
                        value={refreshInterval}
                        onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
                        className="w-20"
                        min="5"
                        max="300"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="simulation-mode" className="flex flex-col space-y-1">
                        <span>Simulation Mode</span>
                        <span className="text-sm text-gray-500">Use realistic fake data</span>
                      </Label>
                      <Switch
                        id="simulation-mode"
                        checked={simulationMode}
                        onCheckedChange={setSimulationMode}
                      />
                    </div>
                  </div>
                  
                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-yellow-800">Debug Mode Active</h4>
                          <p className="text-sm text-yellow-700">
                            This debugger is only visible to super admin users. Regular users cannot see or access these controls.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="logs" className="mt-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Debug Logs</h3>
                    <Button
                      onClick={() => setDebugLogs([])}
                      variant="outline"
                      size="sm"
                    >
                      Clear Logs
                    </Button>
                  </div>
                  
                  <ScrollArea className="h-96 border rounded-md p-4 bg-gray-50">
                    <div className="space-y-2 font-mono text-sm">
                      {debugLogs.length === 0 ? (
                        <p className="text-gray-500 italic">No debug logs yet...</p>
                      ) : (
                        debugLogs.map((log, index) => (
                          <div key={index} className="text-gray-700">
                            {log}
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}