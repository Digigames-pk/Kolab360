import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  Shield,
  Users,
  Settings,
  Activity,
  BarChart3,
  UserCheck,
  UserX,
  Crown,
  Lock,
  Unlock,
  Ban,
  MessageSquare,
  FileText,
  Download,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Trash2,
  Edit,
  MoreHorizontal,
  Eye,
  EyeOff,
  Bell,
  BellOff
} from 'lucide-react';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  status: 'active' | 'suspended' | 'inactive';
  lastActive: string;
  joinDate: string;
  messageCount: number;
  filesShared: number;
  department?: string;
  avatar?: string;
}

interface WorkspaceStats {
  totalUsers: number;
  activeUsers: number;
  totalMessages: number;
  totalFiles: number;
  storageUsed: number;
  storageLimit: number;
  channels: number;
  integrations: number;
}

interface AuditLog {
  id: string;
  action: string;
  user: string;
  target?: string;
  timestamp: string;
  details: string;
  severity: 'low' | 'medium' | 'high';
}

export function SuperAdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<WorkspaceStats | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  // Mock data - in production this would come from API
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: 1,
        firstName: 'Sarah',
        lastName: 'Wilson',
        email: 'sarah@company.com',
        role: 'admin',
        status: 'active',
        lastActive: '5 minutes ago',
        joinDate: '2024-01-15',
        messageCount: 2847,
        filesShared: 156,
        department: 'Engineering'
      },
      {
        id: 2,
        firstName: 'Alex',
        lastName: 'Johnson',
        email: 'alex@company.com',
        role: 'user',
        status: 'active',
        lastActive: '2 hours ago',
        joinDate: '2024-02-01',
        messageCount: 1923,
        filesShared: 89,
        department: 'Product'
      },
      {
        id: 3,
        firstName: 'Mike',
        lastName: 'Chen',
        email: 'mike@company.com',
        role: 'user',
        status: 'inactive',
        lastActive: '3 days ago',
        joinDate: '2024-01-20',
        messageCount: 756,
        filesShared: 34,
        department: 'Design'
      },
      {
        id: 4,
        firstName: 'Lisa',
        lastName: 'Rodriguez',
        email: 'lisa@company.com',
        role: 'user',
        status: 'suspended',
        lastActive: '1 week ago',
        joinDate: '2024-03-01',
        messageCount: 234,
        filesShared: 12,
        department: 'Marketing'
      }
    ];

    const mockStats: WorkspaceStats = {
      totalUsers: 124,
      activeUsers: 89,
      totalMessages: 45782,
      totalFiles: 1247,
      storageUsed: 8.4,
      storageLimit: 50,
      channels: 23,
      integrations: 8
    };

    const mockAuditLogs: AuditLog[] = [
      {
        id: '1',
        action: 'User suspended',
        user: 'Admin',
        target: 'lisa@company.com',
        timestamp: '2025-01-20 14:30:22',
        details: 'Suspended user for policy violation',
        severity: 'high'
      },
      {
        id: '2',
        action: 'Channel created',
        user: 'sarah@company.com',
        target: '#project-alpha',
        timestamp: '2025-01-20 12:15:45',
        details: 'Created new private channel',
        severity: 'low'
      },
      {
        id: '3',
        action: 'Role changed',
        user: 'Admin',
        target: 'alex@company.com',
        timestamp: '2025-01-20 09:22:17',
        details: 'Changed role from user to admin',
        severity: 'medium'
      }
    ];

    setTimeout(() => {
      setUsers(mockUsers);
      setStats(mockStats);
      setAuditLogs(mockAuditLogs);
      setLoading(false);
    }, 1000);
  }, []);

  const handleUserAction = async (userId: number, action: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    try {
      switch (action) {
        case 'suspend':
          setUsers(prev => prev.map(u => 
            u.id === userId ? { ...u, status: 'suspended' as const } : u
          ));
          toast({
            title: "User suspended",
            description: `${user.firstName} ${user.lastName} has been suspended`,
          });
          break;
        case 'activate':
          setUsers(prev => prev.map(u => 
            u.id === userId ? { ...u, status: 'active' as const } : u
          ));
          toast({
            title: "User activated",
            description: `${user.firstName} ${user.lastName} has been activated`,
          });
          break;
        case 'promote':
          setUsers(prev => prev.map(u => 
            u.id === userId ? { ...u, role: 'admin' as const } : u
          ));
          toast({
            title: "User promoted",
            description: `${user.firstName} ${user.lastName} is now an admin`,
          });
          break;
        case 'demote':
          setUsers(prev => prev.map(u => 
            u.id === userId ? { ...u, role: 'user' as const } : u
          ));
          toast({
            title: "User demoted",
            description: `${user.firstName} ${user.lastName} is now a regular user`,
          });
          break;
      }
    } catch (error) {
      toast({
        title: "Action failed",
        description: "Failed to perform user action. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = `${user.firstName} ${user.lastName} ${user.email}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusBadge = (status: User['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Inactive</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getRoleBadge = (role: User['role']) => {
    switch (role) {
      case 'admin':
        return <Badge variant="default" className="bg-blue-600"><Crown className="h-3 w-3 mr-1" />Admin</Badge>;
      case 'user':
        return <Badge variant="secondary">User</Badge>;
      case 'guest':
        return <Badge variant="outline">Guest</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg">Loading admin dashboard...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Shield className="h-8 w-8 mr-3 text-blue-600" />
              Super Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Manage users, monitor activity, and control workspace settings</p>
          </div>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <Users className="h-4 w-4 mr-2 text-blue-600" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers}</div>
              <p className="text-sm text-gray-600">{stats?.activeUsers} active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <MessageSquare className="h-4 w-4 mr-2 text-green-600" />
                Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalMessages.toLocaleString()}</div>
              <p className="text-sm text-gray-600">+1,234 this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <FileText className="h-4 w-4 mr-2 text-purple-600" />
                Files
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalFiles}</div>
              <p className="text-sm text-gray-600">{stats?.storageUsed}GB / {stats?.storageLimit}GB</p>
              <Progress value={(stats?.storageUsed || 0) / (stats?.storageLimit || 1) * 100} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <Activity className="h-4 w-4 mr-2 text-orange-600" />
                Channels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.channels}</div>
              <p className="text-sm text-gray-600">{stats?.integrations} integrations</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          </TabsList>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="guest">Guest</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {filteredUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg bg-white">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.firstName[0]}{user.lastName[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium">{user.firstName} {user.lastName}</h3>
                              {getRoleBadge(user.role)}
                              {getStatusBadge(user.status)}
                            </div>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <p className="text-xs text-gray-500">
                              {user.department} • Last active: {user.lastActive}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="text-right text-xs text-gray-500">
                            <div>{user.messageCount} messages</div>
                            <div>{user.filesShared} files shared</div>
                          </div>
                          
                          {user.status === 'suspended' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUserAction(user.id, 'activate')}
                              className="border-green-200 text-green-600 hover:bg-green-50"
                            >
                              <UserCheck className="h-4 w-4 mr-1" />
                              Activate
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUserAction(user.id, 'suspend')}
                              className="border-red-200 text-red-600 hover:bg-red-50"
                            >
                              <UserX className="h-4 w-4 mr-1" />
                              Suspend
                            </Button>
                          )}
                          
                          {user.role === 'user' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUserAction(user.id, 'promote')}
                              className="border-blue-200 text-blue-600 hover:bg-blue-50"
                            >
                              <Crown className="h-4 w-4 mr-1" />
                              Promote
                            </Button>
                          ) : user.role === 'admin' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUserAction(user.id, 'demote')}
                              className="border-orange-200 text-orange-600 hover:bg-orange-50"
                            >
                              <Users className="h-4 w-4 mr-1" />
                              Demote
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Workspace Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
                  <p className="text-gray-600">Detailed analytics and reporting features coming soon.</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Track user engagement, message patterns, file usage, and workspace growth metrics.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Workspace Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Settings className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Settings</h3>
                  <p className="text-gray-600">Comprehensive workspace configuration panel coming soon.</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Configure security policies, integration settings, data retention, and organizational controls.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="audit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Audit Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-full ${
                            log.severity === 'high' ? 'bg-red-100 text-red-600' :
                            log.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-green-100 text-green-600'
                          }`}>
                            {log.severity === 'high' ? <AlertTriangle className="h-4 w-4" /> :
                             log.severity === 'medium' ? <Clock className="h-4 w-4" /> :
                             <CheckCircle className="h-4 w-4" />}
                          </div>
                          <div>
                            <h3 className="font-medium">{log.action}</h3>
                            <p className="text-sm text-gray-600">
                              {log.user} {log.target && `→ ${log.target}`}
                            </p>
                            <p className="text-xs text-gray-500">{log.details}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">{log.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}