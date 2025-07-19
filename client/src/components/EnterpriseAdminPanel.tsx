import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  Users, 
  Settings, 
  BarChart3, 
  AlertTriangle, 
  Lock, 
  Key, 
  Database,
  Globe,
  Mail,
  Bell,
  Eye,
  Download,
  Upload,
  RefreshCw,
  Activity,
  Calendar,
  MessageSquare,
  FileText,
  Zap,
  Crown,
  Trash2,
  Edit,
  Plus,
  Search,
  Filter,
  UserX,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Server,
  Wifi,
  HardDrive
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

interface AdminMetrics {
  totalUsers: number;
  activeUsers: number;
  totalWorkspaces: number;
  totalMessages: number;
  totalFiles: number;
  storageUsed: number;
  storageLimit: number;
  monthlyActiveUsers: number;
  systemUptime: number;
}

interface UserManagement {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "super_admin" | "admin" | "user";
  status: "active" | "suspended" | "pending";
  lastLogin: Date;
  createdAt: Date;
  workspaces: number;
  messagesCount: number;
}

interface SystemAlert {
  id: string;
  type: "warning" | "error" | "info";
  title: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
}

const mockMetrics: AdminMetrics = {
  totalUsers: 1247,
  activeUsers: 892,
  totalWorkspaces: 156,
  totalMessages: 45892,
  totalFiles: 8947,
  storageUsed: 87.5,
  storageLimit: 500,
  monthlyActiveUsers: 1156,
  systemUptime: 99.98
};

const mockUsers: UserManagement[] = [
  {
    id: "1",
    email: "alice.johnson@company.com",
    firstName: "Alice",
    lastName: "Johnson",
    role: "admin",
    status: "active",
    lastLogin: new Date(Date.now() - 1000 * 60 * 30),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
    workspaces: 3,
    messagesCount: 1247
  },
  {
    id: "2",
    email: "bob.smith@company.com",
    firstName: "Bob",
    lastName: "Smith",
    role: "user",
    status: "active",
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 2),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45),
    workspaces: 2,
    messagesCount: 892
  },
  {
    id: "3",
    email: "carol.davis@company.com",
    firstName: "Carol",
    lastName: "Davis",
    role: "user",
    status: "suspended",
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60),
    workspaces: 1,
    messagesCount: 456
  }
];

const mockAlerts: SystemAlert[] = [
  {
    id: "1",
    type: "warning",
    title: "High Storage Usage",
    message: "Storage usage is approaching 90% capacity",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    resolved: false
  },
  {
    id: "2",
    type: "info",
    title: "System Maintenance Scheduled",
    message: "Routine maintenance scheduled for tomorrow at 2 AM UTC",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
    resolved: false
  },
  {
    id: "3",
    type: "error",
    title: "Failed Login Attempts",
    message: "Multiple failed login attempts detected from IP 192.168.1.100",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
    resolved: true
  }
];

export function EnterpriseAdminPanel({ 
  isOpen, 
  onClose 
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [metrics, setMetrics] = useState(mockMetrics);
  const [users, setUsers] = useState(mockUsers);
  const [alerts, setAlerts] = useState(mockAlerts);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-green-600 bg-green-100 dark:bg-green-900";
      case "suspended": return "text-red-600 bg-red-100 dark:bg-red-900";
      case "pending": return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900";
      default: return "text-gray-600 bg-gray-100 dark:bg-gray-900";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "super_admin": return <Crown className="h-4 w-4 text-yellow-500" />;
      case "admin": return <Shield className="h-4 w-4 text-blue-500" />;
      default: return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "error": return <XCircle className="h-4 w-4 text-red-500" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "info": return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
      default: return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === "" || 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Users</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{metrics.totalUsers.toLocaleString()}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  +12% this month
                </p>
              </div>
              <Users className="h-12 w-12 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Active Users</p>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100">{metrics.activeUsers.toLocaleString()}</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  <Activity className="h-3 w-3 inline mr-1" />
                  {Math.round((metrics.activeUsers / metrics.totalUsers) * 100)}% active
                </p>
              </div>
              <Activity className="h-12 w-12 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Workspaces</p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{metrics.totalWorkspaces}</p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                  <Globe className="h-3 w-3 inline mr-1" />
                  Across all teams
                </p>
              </div>
              <Globe className="h-12 w-12 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">System Uptime</p>
                <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">{metrics.systemUptime}%</p>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  <Server className="h-3 w-3 inline mr-1" />
                  Last 30 days
                </p>
              </div>
              <Server className="h-12 w-12 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Storage & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <HardDrive className="h-5 w-5" />
              <span>Storage Usage</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Used Storage</span>
                <span>{metrics.storageUsed} GB / {metrics.storageLimit} GB</span>
              </div>
              <Progress value={(metrics.storageUsed / metrics.storageLimit) * 100} className="h-3" />
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Files</p>
                  <p className="font-semibold">{metrics.totalFiles.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Messages</p>
                  <p className="font-semibold">{metrics.totalMessages.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Avg per User</p>
                  <p className="font-semibold">{Math.round(metrics.storageUsed / metrics.totalUsers * 1000)} MB</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>System Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.slice(0, 4).map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-start space-x-3 p-3 rounded-lg ${
                    alert.resolved ? 'bg-muted/30 opacity-60' : 'bg-muted/50'
                  }`}
                >
                  {getAlertIcon(alert.type)}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm">{alert.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {alert.timestamp.toLocaleString()}
                    </p>
                  </div>
                  {alert.resolved ? (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Resolved
                    </Badge>
                  ) : (
                    <Button size="sm" variant="outline">
                      Resolve
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <Plus className="h-6 w-6" />
              <span className="text-sm">Add User</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <Globe className="h-6 w-6" />
              <span className="text-sm">New Workspace</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <Download className="h-6 w-6" />
              <span className="text-sm">Export Data</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <Settings className="h-6 w-6" />
              <span className="text-sm">System Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const UserManagementTab = () => (
    <div className="space-y-6">
      {/* Filters & Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-2">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">User</th>
                  <th className="text-left p-3 font-medium">Role</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Last Login</th>
                  <th className="text-left p-3 font-medium">Workspaces</th>
                  <th className="text-left p-3 font-medium">Messages</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b hover:bg-muted/20"
                  >
                    <td className="p-3">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {user.firstName[0]}{user.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.firstName} {user.lastName}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(user.role)}
                        <span className="capitalize">{user.role.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm">
                      {user.lastLogin.toLocaleDateString()}
                    </td>
                    <td className="p-3 text-center">{user.workspaces}</td>
                    <td className="p-3 text-center">{user.messagesCount.toLocaleString()}</td>
                    <td className="p-3">
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const SystemSettingsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>System Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>User Registration</Label>
                  <p className="text-sm text-muted-foreground">Allow new user registration</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Verification</Label>
                  <p className="text-sm text-muted-foreground">Require email verification for new accounts</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Enforce 2FA for all users</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Guest Access</Label>
                  <p className="text-sm text-muted-foreground">Allow guest users in workspaces</p>
                </div>
                <Switch />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Maximum File Size (MB)</Label>
                <Input type="number" defaultValue="100" className="mt-1" />
              </div>

              <div>
                <Label>Session Timeout (minutes)</Label>
                <Input type="number" defaultValue="480" className="mt-1" />
              </div>

              <div>
                <Label>Default User Role</Label>
                <Select defaultValue="user">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Backup Frequency</Label>
                <Select defaultValue="daily">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Password Minimum Length</Label>
              <Input type="number" defaultValue="8" className="mt-1" />
            </div>
            <div>
              <Label>Login Attempt Limit</Label>
              <Input type="number" defaultValue="5" className="mt-1" />
            </div>
            <div>
              <Label>API Rate Limit (requests/minute)</Label>
              <Input type="number" defaultValue="100" className="mt-1" />
            </div>
            <div>
              <Label>Data Retention Period (days)</Label>
              <Input type="number" defaultValue="365" className="mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="outline">Reset to Defaults</Button>
        <Button>Save Changes</Button>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] overflow-hidden p-0">
        <DialogHeader className="p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-accent/5">
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <span>Enterprise Admin Panel</span>
          </DialogTitle>
          <DialogDescription>
            Complete system administration and user management
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="h-full">
            <div className="border-b border-border/50 px-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview" className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Overview</span>
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>User Management</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center space-x-2">
                  <Lock className="h-4 w-4" />
                  <span>Security</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>System Settings</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-12rem)]">
              <TabsContent value="overview" className="mt-0">
                <OverviewTab />
              </TabsContent>
              <TabsContent value="users" className="mt-0">
                <UserManagementTab />
              </TabsContent>
              <TabsContent value="security" className="mt-0">
                <div className="text-center py-12">
                  <Lock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Security Dashboard</h3>
                  <p className="text-muted-foreground">Advanced security monitoring and controls</p>
                </div>
              </TabsContent>
              <TabsContent value="settings" className="mt-0">
                <SystemSettingsTab />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}