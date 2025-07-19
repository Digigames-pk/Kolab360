import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Shield, 
  Users, 
  Activity, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  Globe,
  Zap,
  Database,
  Eye,
  Trash2,
  RefreshCw,
  Download,
  Upload,
  Filter
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface AdminIntegrationData {
  id: string;
  service: string;
  serviceName: string;
  isEnabled: boolean;
  config: any;
  workspaceId: string;
  workspaceName: string;
  userId: number;
  userName: string;
  userEmail: string;
  lastSyncAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface IntegrationStats {
  total: number;
  active: number;
  inactive: number;
  failed: number;
  byService: Record<string, number>;
  byWorkspace: Record<string, number>;
  recentActivity: Array<{
    id: string;
    action: string;
    service: string;
    workspace: string;
    user: string;
    timestamp: string;
  }>;
}

export function AdminIntegrationPanel() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [filterService, setFilterService] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedIntegration, setSelectedIntegration] = useState<AdminIntegrationData | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Fetch integration statistics
  const { data: stats, isLoading: statsLoading } = useQuery<IntegrationStats>({
    queryKey: ["/api/admin/integrations/stats"],
    enabled: !!user && user.role === "super_admin",
  });

  // Fetch all integrations for admin view
  const { data: integrations = [], isLoading: integrationsLoading } = useQuery<AdminIntegrationData[]>({
    queryKey: ["/api/admin/integrations"],
    enabled: !!user && user.role === "super_admin",
  });

  // Global toggle integration mutation
  const globalToggleMutation = useMutation({
    mutationFn: async ({ id, isEnabled }: { id: string; isEnabled: boolean }) => {
      const response = await apiRequest("PATCH", `/api/admin/integrations/${id}`, { isEnabled });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/integrations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/integrations/stats"] });
    },
  });

  // Force sync integration mutation
  const forceSyncMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("POST", `/api/admin/integrations/${id}/force-sync`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/integrations"] });
    },
  });

  // Delete integration mutation
  const deleteIntegrationMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/integrations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/integrations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/integrations/stats"] });
    },
  });

  // Export data mutation
  const exportDataMutation = useMutation({
    mutationFn: async (format: "csv" | "json") => {
      const response = await apiRequest("GET", `/api/admin/integrations/export?format=${format}`);
      return response.blob();
    },
    onSuccess: (blob, format) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `integrations-${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    },
  });

  const filteredIntegrations = integrations.filter(integration => {
    const serviceMatch = filterService === "all" || integration.service === filterService;
    const statusMatch = filterStatus === "all" || 
      (filterStatus === "active" && integration.isEnabled) ||
      (filterStatus === "inactive" && !integration.isEnabled);
    return serviceMatch && statusMatch;
  });

  const uniqueServices = Array.from(new Set(integrations.map(i => i.service)));

  const getStatusBadge = (integration: AdminIntegrationData) => {
    if (!integration.isEnabled) {
      return <Badge variant="secondary">Disabled</Badge>;
    }
    if (!integration.lastSyncAt) {
      return <Badge variant="outline">Never Synced</Badge>;
    }
    const daysSinceSync = Math.floor((new Date().getTime() - new Date(integration.lastSyncAt).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceSync > 7) {
      return <Badge variant="destructive">Sync Failed</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  if (!user || user.role !== "super_admin") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Access Restricted</h3>
          <p className="text-muted-foreground">Super Admin access required to view this panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Integration Management</h2>
          <p className="text-muted-foreground">
            Monitor and manage all workspace integrations across the platform
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={() => exportDataMutation.mutate("csv")}
            disabled={exportDataMutation.isPending}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button 
            variant="outline" 
            onClick={() => exportDataMutation.mutate("json")}
            disabled={exportDataMutation.isPending}
          >
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="integrations">All Integrations</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
          <TabsTrigger value="settings">System Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Integrations</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Across all workspaces
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats?.active || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Currently enabled
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inactive</CardTitle>
                <XCircle className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats?.inactive || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Disabled integrations
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed Syncs</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats?.failed || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Need attention
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Service Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Integration by Service</CardTitle>
                <CardDescription>Distribution across different services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats?.byService || {}).map(([service, count]) => (
                    <div key={service} className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{service.replace(/_/g, ' ')}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${(count / (stats?.total || 1)) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-8">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Workspaces</CardTitle>
                <CardDescription>Most active integration usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats?.byWorkspace || {}).slice(0, 5).map(([workspace, count]) => (
                    <div key={workspace} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{workspace}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${(count / (stats?.total || 1)) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-8">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <Select value={filterService} onValueChange={setFilterService}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                {uniqueServices.map(service => (
                  <SelectItem key={service} value={service}>
                    {service.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Integrations Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Integrations ({filteredIntegrations.length})</CardTitle>
              <CardDescription>
                Complete list of integrations across all workspaces
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Workspace</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Sync</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIntegrations.map((integration) => (
                    <TableRow key={integration.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{integration.serviceName}</div>
                          <div className="text-sm text-muted-foreground">{integration.service}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{integration.workspaceName}</div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{integration.userName}</div>
                          <div className="text-sm text-muted-foreground">{integration.userEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(integration)}</TableCell>
                      <TableCell>
                        {integration.lastSyncAt ? (
                          <div>
                            <div className="text-sm">{new Date(integration.lastSyncAt).toLocaleDateString()}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(integration.lastSyncAt).toLocaleTimeString()}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{new Date(integration.createdAt).toLocaleDateString()}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedIntegration(integration);
                              setDetailsOpen(true);
                            }}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => forceSyncMutation.mutate(integration.id)}
                            disabled={forceSyncMutation.isPending || !integration.isEnabled}
                          >
                            <RefreshCw className="h-3 w-3" />
                          </Button>
                          <Switch
                            checked={integration.isEnabled}
                            onCheckedChange={(checked) => {
                              globalToggleMutation.mutate({
                                id: integration.id,
                                isEnabled: checked,
                              });
                            }}
                            disabled={globalToggleMutation.isPending}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest integration actions and events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recentActivity?.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{activity.action}</div>
                        <div className="text-sm text-muted-foreground">
                          {activity.service} in {activity.workspace} by {activity.user}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleString()}
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent activity to display
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Global Integration Settings</CardTitle>
              <CardDescription>
                System-wide configuration for integration management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Auto-sync Enabled</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically sync integrations on schedule
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Failed Sync Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Notify admins when integrations fail
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="space-y-2">
                  <Label>Sync Interval (minutes)</Label>
                  <Input type="number" defaultValue="60" className="w-32" />
                </div>

                <div className="space-y-2">
                  <Label>Max Retry Attempts</Label>
                  <Input type="number" defaultValue="3" className="w-32" />
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Integration Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Integration Details</DialogTitle>
            <DialogDescription>
              Detailed information about {selectedIntegration?.serviceName}
            </DialogDescription>
          </DialogHeader>

          {selectedIntegration && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Service</Label>
                  <p className="text-sm">{selectedIntegration.serviceName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedIntegration)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Workspace</Label>
                  <p className="text-sm">{selectedIntegration.workspaceName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">User</Label>
                  <p className="text-sm">{selectedIntegration.userName} ({selectedIntegration.userEmail})</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p className="text-sm">{new Date(selectedIntegration.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Last Sync</Label>
                  <p className="text-sm">
                    {selectedIntegration.lastSyncAt 
                      ? new Date(selectedIntegration.lastSyncAt).toLocaleString()
                      : "Never"
                    }
                  </p>
                </div>
              </div>

              {selectedIntegration.config && (
                <div>
                  <Label className="text-sm font-medium">Configuration</Label>
                  <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto max-h-40">
                    {JSON.stringify(selectedIntegration.config, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex items-center justify-end space-x-2">
                <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                  Close
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    deleteIntegrationMutation.mutate(selectedIntegration.id);
                    setDetailsOpen(false);
                  }}
                  disabled={deleteIntegrationMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Integration
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}