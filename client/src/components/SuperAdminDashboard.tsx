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
  BellOff,
  Building2,
  DollarSign,
  Key,
  Zap,
  Globe,
  Database,
  ExternalLink,
  Archive,
  Plus,
  Minus,
  UserPlus,
  Building,
  CreditCard,
  ShieldCheck,
  Network,
  Workflow,
  TrendingUp,
  PieChart,
  BarChart2,
  X,
  Upload,
  MessageCircle,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();
  
  // Organization management state
  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false);
  const [showEditOrgModal, setShowEditOrgModal] = useState(false);
  const [showOrgLimitsModal, setShowOrgLimitsModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);
  const [showOrgControlsModal, setShowOrgControlsModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [showOrgManagementModal, setShowOrgManagementModal] = useState(false);
  const [selectedOrgForManagement, setSelectedOrgForManagement] = useState<any>(null);
  const [showAppManagementModal, setShowAppManagementModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [showAppStoreModal, setShowAppStoreModal] = useState(false);
  const [customRoles, setCustomRoles] = useState([
    { id: 1, name: 'Super Admin', users: 2, permissions: ['Full Access', 'User Management', 'System Control'], color: 'bg-red-500' },
    { id: 2, name: 'Organization Admin', users: 12, permissions: ['Org Management', 'User Control', 'Settings'], color: 'bg-purple-500' },
    { id: 3, name: 'Workspace Admin', users: 45, permissions: ['Workspace Control', 'Channel Management'], color: 'bg-blue-500' },
    { id: 4, name: 'Channel Moderator', users: 23, permissions: ['Channel Management', 'Message Control'], color: 'bg-green-500' },
    { id: 5, name: 'Member', users: 1847, permissions: ['Basic Access', 'Message Send'], color: 'bg-gray-500' }
  ]);
  
  const [pricingPlans, setPricingPlans] = useState([
    {
      id: 1,
      name: 'Free',
      price: '$0',
      billingPeriod: 'Forever',
      description: 'Perfect for small teams getting started',
      isCurrent: false,
      isPopular: false,
      isCore: true,
      organizationCount: 15420,
      limits: {
        maxUsers: '10',
        storage: '10GB total',
        apiCalls: '1,000',
        fileSize: '25MB'
      },
      features: {
        core: ['Basic messaging', 'File sharing', 'Search history (10K messages)', 'Two-factor auth'],
        advanced: [],
        enterprise: []
      }
    },
    {
      id: 2,
      name: 'Pro',
      price: '$6.67',
      billingPeriod: 'Per user/month (billed annually)',
      description: 'Enhanced productivity for growing teams',
      isCurrent: false,
      isPopular: true,
      isCore: true,
      organizationCount: 8934,
      limits: {
        maxUsers: 'Unlimited',
        storage: '20GB per user',
        apiCalls: '10,000',
        fileSize: '100MB'
      },
      features: {
        core: ['Everything in Free', 'Unlimited message history', 'Guest access', 'Voice & video calls'],
        advanced: ['Screen sharing', 'Unlimited integrations', 'Workflow automation', 'Advanced search'],
        enterprise: []
      }
    },
    {
      id: 3,
      name: 'Business+',
      price: '$12.50',
      billingPeriod: 'Per user/month (billed annually)',
      description: 'Advanced features for larger organizations',
      isCurrent: false,
      isPopular: false,
      isCore: true,
      organizationCount: 2156,
      limits: {
        maxUsers: 'Unlimited',
        storage: 'Unlimited',
        apiCalls: '50,000',
        fileSize: '1GB'
      },
      features: {
        core: ['Everything in Pro', 'SSO (SAML)', 'Data exports', 'Custom user groups'],
        advanced: ['Advanced identity management', 'Real-time activity monitoring', 'Custom retention policies', 'Advanced compliance tools'],
        enterprise: []
      }
    },
    {
      id: 4,
      name: 'Enterprise Grid',
      price: '$21',
      billingPeriod: 'Per user/month (billed annually)',
      description: 'Complete enterprise-grade workspace management',
      isCurrent: true,
      isPopular: false,
      isCore: true,
      organizationCount: 347,
      limits: {
        maxUsers: 'Unlimited',
        storage: 'Unlimited',
        apiCalls: 'Unlimited',
        fileSize: '20GB'
      },
      features: {
        core: ['Everything in Business+', 'Unlimited workspaces', 'Cross-workspace discovery', 'Enterprise security'],
        advanced: ['SCIM provisioning', 'Advanced DLP', 'Legal hold & eDiscovery', 'Enterprise key management'],
        enterprise: ['24/7 premium support', 'Dedicated success manager', 'Custom SLA', 'Advanced analytics', 'Multi-region deployment']
      }
    }
  ]);
  const [newOrgData, setNewOrgData] = useState({
    name: '',
    domain: '',
    plan: 'Business',
    adminEmail: '',
    memberLimit: 100,
    storageLimit: 1000,
    apiRateLimit: 1000,
    features: {
      sso: false,
      multiFactorAuth: false,
      customBranding: false,
      advancedAnalytics: false,
      apiAccess: true,
      webhooks: true,
      customIntegrations: false,
      prioritySupport: false,
      dataExport: true,
      auditLogs: true,
      guestAccess: true,
      fileSharing: true,
      videoConferencing: true,
      screenSharing: true,
      customEmojis: true,
      appDirectory: true
    }
  });

  // Mock organizations data
  const [organizations, setOrganizations] = useState([
    {
      id: 1,
      name: 'Kolab360 Enterprise',
      domain: 'kolab360.com',
      plan: 'Enterprise',
      status: 'active',
      members: 124,
      memberLimit: 500,
      storageUsed: 847,
      storageLimit: 2000,
      adminName: 'John Doe',
      adminEmail: 'admin@kolab360.com',
      createdAt: '2024-01-15',
      features: {
        sso: true,
        multiFactorAuth: true,
        customBranding: true,
        advancedAnalytics: true,
        apiAccess: true,
        webhooks: true,
        customIntegrations: true,
        prioritySupport: true,
        dataExport: true,
        auditLogs: true,
        guestAccess: true,
        fileSharing: true,
        videoConferencing: true,
        screenSharing: true,
        customEmojis: true,
        appDirectory: true
      }
    },
    {
      id: 2,
      name: 'DevTeam Hub',
      domain: 'devteam.kolab360.com',
      plan: 'Business+',
      status: 'active',
      members: 45,
      memberLimit: 100,
      storageUsed: 234,
      storageLimit: 500,
      adminName: 'Sarah Wilson',
      adminEmail: 'sarah@devteam.kolab360.com',
      createdAt: '2024-02-20',
      features: {
        sso: false,
        multiFactorAuth: true,
        customBranding: false,
        advancedAnalytics: true,
        apiAccess: true,
        webhooks: true,
        customIntegrations: false,
        prioritySupport: false,
        dataExport: true,
        auditLogs: true,
        guestAccess: true,
        fileSharing: true,
        videoConferencing: true,
        screenSharing: true,
        customEmojis: true,
        appDirectory: true
      }
    },
    {
      id: 3,
      name: 'Marketing Central',
      domain: 'marketing.kolab360.com',
      plan: 'Business',
      status: 'suspended',
      members: 23,
      memberLimit: 50,
      storageUsed: 89,
      storageLimit: 200,
      adminName: 'Mike Chen',
      adminEmail: 'mike@marketing.kolab360.com',
      createdAt: '2024-03-10',
      features: {
        sso: false,
        multiFactorAuth: false,
        customBranding: false,
        advancedAnalytics: false,
        apiAccess: true,
        webhooks: false,
        customIntegrations: false,
        prioritySupport: false,
        dataExport: false,
        auditLogs: false,
        guestAccess: true,
        fileSharing: true,
        videoConferencing: true,
        screenSharing: false,
        customEmojis: false,
        appDirectory: true
      }
    }
  ]);

  const handleCreateOrg = () => {
    const newOrg = {
      id: organizations.length + 1,
      ...newOrgData,
      status: 'active',
      members: 0,
      storageUsed: 0,
      adminName: 'New Admin',
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setOrganizations([...organizations, newOrg]);
    setShowCreateOrgModal(false);
    setNewOrgData({
      name: '',
      domain: '',
      plan: 'Business',
      adminEmail: '',
      memberLimit: 100,
      storageLimit: 1000,
      apiRateLimit: 1000,
      features: {
        sso: false,
        multiFactorAuth: false,
        customBranding: false,
        advancedAnalytics: false,
        apiAccess: true,
        webhooks: true,
        customIntegrations: false,
        prioritySupport: false,
        dataExport: true,
        auditLogs: true,
        guestAccess: true,
        fileSharing: true,
        videoConferencing: true,
        screenSharing: true,
        customEmojis: true,
        appDirectory: true
      }
    });
    
    toast({
      title: "Organization Created",
      description: `${newOrg.name} has been created successfully.`
    });
  };

  const handleSuspendOrg = (orgId: number) => {
    setOrganizations(organizations.map(org => 
      org.id === orgId 
        ? { ...org, status: org.status === 'suspended' ? 'active' : 'suspended' }
        : org
    ));
    
    const org = organizations.find(o => o.id === orgId);
    toast({
      title: org?.status === 'suspended' ? "Organization Reactivated" : "Organization Suspended",
      description: `${org?.name} has been ${org?.status === 'suspended' ? 'reactivated' : 'suspended'}.`
    });
  };

  const handleDeleteOrg = (orgId: number) => {
    if (confirm('Are you sure you want to delete this organization? This action cannot be undone.')) {
      const orgName = organizations.find(org => org.id === orgId)?.name;
      setOrganizations(organizations.filter(org => org.id !== orgId));
      toast({
        title: "Organization Deleted",
        description: `${orgName} has been permanently deleted.`,
        variant: "destructive"
      });
    }
  };

  // Enhanced role management functions
  const handleEditRole = (role: any) => {
    setSelectedRole(role);
    setShowCreateRoleModal(true);
  };

  const handleDeleteRole = (roleId: number) => {
    if (confirm('Are you sure you want to delete this role? Users with this role will be moved to Member role.')) {
      setCustomRoles(customRoles.filter(role => role.id !== roleId));
      toast({
        title: "Role Deleted",
        description: "Custom role has been deleted successfully.",
        variant: "destructive"
      });
    }
  };

  // Enhanced pricing plan management functions
  const handleEditPlan = (plan: any) => {
    setSelectedPlan(plan);
    setShowCreatePlanModal(true);
  };

  const handleDeletePlan = (planId: number) => {
    if (confirm('Are you sure you want to delete this pricing plan? Organizations using this plan will be moved to Free plan.')) {
      setPricingPlans(pricingPlans.filter(plan => plan.id !== planId));
      toast({
        title: "Pricing Plan Deleted",
        description: "Custom pricing plan has been deleted successfully.",
        variant: "destructive"
      });
    }
  };

  // User management functions  
  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setShowEditUserModal(true);
  };

  const handleDeleteUser = (userId: number) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setUsers(users.filter(user => user.id !== userId));
      toast({
        title: "User Deleted",
        description: "User has been permanently deleted.",
        variant: "destructive"
      });
    }
  };

  // Organization management functions
  const handleManageOrganization = (org: any) => {
    setSelectedOrgForManagement(org);
    setShowOrgManagementModal(true);
  };

  // App management functions
  const handleManageApp = (app: any) => {
    setSelectedApp(app);
    setShowAppManagementModal(true);
  };

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
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="workspaces">Workspaces</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="apps">Apps</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
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
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditUser(user)}
                            className="border-gray-200 text-gray-600 hover:bg-gray-50"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteUser(user.id)}
                            className="border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workspaces Tab */}
          <TabsContent value="workspaces" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">Organization Management</h2>
                <p className="text-gray-600">Manage workspaces, plans, and organizational controls</p>
              </div>
              <Button onClick={() => setShowCreateOrgModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Organization
              </Button>
            </div>

            {/* Organization Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {organizations.map((org) => (
                <Card key={org.id} className={`border-2 ${org.status === 'suspended' ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className={`${org.status === 'suspended' ? 'bg-red-500' : 'bg-blue-600'} text-white font-bold`}>
                            {org.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-bold text-lg">{org.name}</h3>
                          <p className="text-sm text-gray-600">{org.domain}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          {/* Organization Management */}
                          <DropdownMenuItem onClick={() => {
                            setSelectedOrgForManagement(org);
                            setShowOrgManagementModal(true);
                          }}>
                            <Crown className="h-4 w-4 mr-2" />
                            Manage Admins & Users
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem onClick={() => {
                            setSelectedOrg(org);
                            setShowEditOrgModal(true);
                          }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Organization
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem onClick={() => {
                            setSelectedOrg(org);
                            setShowOrgLimitsModal(true);
                          }}>
                            <Settings className="h-4 w-4 mr-2" />
                            Configure Limits
                          </DropdownMenuItem>
                          
                          {/* Security & Compliance */}
                          <DropdownMenuItem onClick={() => {
                            setSelectedOrg(org);
                            setShowSecurityModal(true);
                          }}>
                            <Shield className="h-4 w-4 mr-2" />
                            Security Settings
                          </DropdownMenuItem>
                          
                          {/* Billing & Plans */}
                          <DropdownMenuItem onClick={() => {
                            setSelectedOrg(org);
                            setShowBillingModal(true);
                          }}>
                            <DollarSign className="h-4 w-4 mr-2" />
                            Billing & Plans
                          </DropdownMenuItem>
                          
                          {/* App Management */}
                          <DropdownMenuItem onClick={() => {
                            setSelectedApp(org);
                            setShowAppManagementModal(true);
                          }}>
                            <Zap className="h-4 w-4 mr-2" />
                            App Permissions
                          </DropdownMenuItem>
                          
                          {/* Data & Analytics */}
                          <DropdownMenuItem>
                            <BarChart2 className="h-4 w-4 mr-2" />
                            View Analytics
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Export Data
                          </DropdownMenuItem>
                          
                          {/* Organization Actions */}
                          <DropdownMenuItem onClick={() => handleSuspendOrg(org.id)}>
                            {org.status === 'suspended' ? (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Reactivate Organization
                              </>
                            ) : (
                              <>
                                <Ban className="h-4 w-4 mr-2" />
                                Suspend Organization
                              </>
                            )}
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem 
                            onClick={() => handleDeleteOrg(org.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Organization
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Plan</span>
                      <Badge variant={org.plan === 'Enterprise' ? 'default' : 'secondary'}>
                        {org.plan}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <Badge variant={org.status === 'active' ? 'default' : 'destructive'}>
                        {org.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Members</span>
                      <span className="font-medium">{org.members}/{org.memberLimit}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Storage</span>
                      <span className="font-medium">{org.storageUsed}GB/{org.storageLimit}GB</span>
                    </div>
                    <Progress value={(org.storageUsed / org.storageLimit) * 100} className="h-2" />
                    
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Created: {new Date(org.createdAt).toLocaleDateString()}</span>
                        <span>Admin: {org.adminName}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Create Organization Modal */}
            {showCreateOrgModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">Create New Organization</h3>
                    <Button variant="ghost" size="sm" onClick={() => setShowCreateOrgModal(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Organization Name</label>
                        <Input 
                          value={newOrgData.name}
                          onChange={(e) => setNewOrgData({...newOrgData, name: e.target.value})}
                          placeholder="Acme Corporation"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Domain</label>
                        <Input 
                          value={newOrgData.domain}
                          onChange={(e) => setNewOrgData({...newOrgData, domain: e.target.value})}
                          placeholder="acme.com"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Plan</label>
                        <Select value={newOrgData.plan} onValueChange={(value) => setNewOrgData({...newOrgData, plan: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Free">Free</SelectItem>
                            <SelectItem value="Pro">Pro</SelectItem>
                            <SelectItem value="Business">Business</SelectItem>
                            <SelectItem value="Business+">Business+</SelectItem>
                            <SelectItem value="Enterprise">Enterprise</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Admin Email</label>
                        <Input 
                          value={newOrgData.adminEmail}
                          onChange={(e) => setNewOrgData({...newOrgData, adminEmail: e.target.value})}
                          placeholder="admin@acme.com"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Member Limit</label>
                        <Input 
                          type="number"
                          value={newOrgData.memberLimit}
                          onChange={(e) => setNewOrgData({...newOrgData, memberLimit: parseInt(e.target.value)})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Storage Limit (GB)</label>
                        <Input 
                          type="number"
                          value={newOrgData.storageLimit}
                          onChange={(e) => setNewOrgData({...newOrgData, storageLimit: parseInt(e.target.value)})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">API Rate Limit</label>
                        <Input 
                          type="number"
                          value={newOrgData.apiRateLimit}
                          onChange={(e) => setNewOrgData({...newOrgData, apiRateLimit: parseInt(e.target.value)})}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-medium">Feature Access</label>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(newOrgData.features).map(([feature, enabled]) => (
                          <div key={feature} className="flex items-center space-x-2">
                            <input 
                              type="checkbox" 
                              checked={enabled}
                              onChange={(e) => setNewOrgData({
                                ...newOrgData, 
                                features: {...newOrgData.features, [feature]: e.target.checked}
                              })}
                              className="rounded"
                            />
                            <label className="text-sm capitalize">{feature.replace(/([A-Z])/g, ' $1').trim()}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button variant="outline" onClick={() => setShowCreateOrgModal(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateOrg}>
                        Create Organization
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Organization Modal */}
            {showEditOrgModal && selectedOrg && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">Edit Organization: {selectedOrg.name}</h3>
                    <Button variant="ghost" size="sm" onClick={() => setShowEditOrgModal(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Organization Name</label>
                        <Input defaultValue={selectedOrg.name} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Domain</label>
                        <Input defaultValue={selectedOrg.domain} />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Plan</label>
                        <Select defaultValue={selectedOrg.plan}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Free">Free</SelectItem>
                            <SelectItem value="Pro">Pro</SelectItem>
                            <SelectItem value="Business">Business</SelectItem>
                            <SelectItem value="Business+">Business+</SelectItem>
                            <SelectItem value="Enterprise">Enterprise</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <Select defaultValue={selectedOrg.status}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button variant="outline" onClick={() => setShowEditOrgModal(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => {
                        setShowEditOrgModal(false);
                        toast({ title: "Organization updated successfully" });
                      }}>
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Organization Limits Modal */}
            {showOrgLimitsModal && selectedOrg && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">Configure Limits: {selectedOrg.name}</h3>
                    <Button variant="ghost" size="sm" onClick={() => setShowOrgLimitsModal(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Resource Limits */}
                    <div>
                      <h4 className="font-medium mb-3">Resource Limits</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Member Limit</label>
                          <Input type="number" defaultValue={selectedOrg.memberLimit} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Storage Limit (GB)</label>
                          <Input type="number" defaultValue={selectedOrg.storageLimit} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">API Rate Limit/min</label>
                          <Input type="number" defaultValue="1000" />
                        </div>
                      </div>
                    </div>

                    {/* Feature Controls */}
                    <div>
                      <h4 className="font-medium mb-3">Feature Access Controls</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          'sso', 'multiFactorAuth', 'customBranding', 'advancedAnalytics', 
                          'apiAccess', 'webhooks', 'customIntegrations', 'prioritySupport',
                          'dataExport', 'auditLogs', 'guestAccess', 'fileSharing',
                          'videoConferencing', 'screenSharing', 'customEmojis', 'appDirectory'
                        ].map(feature => (
                          <div key={feature} className="flex items-center space-x-2 p-2 border rounded">
                            <input type="checkbox" defaultChecked className="rounded" />
                            <label className="text-sm capitalize flex-1">
                              {feature.replace(/([A-Z])/g, ' $1').trim()}
                            </label>
                            {feature === 'sso' && <Badge variant="secondary">Enterprise</Badge>}
                            {feature === 'advancedAnalytics' && <Badge variant="secondary">Business+</Badge>}
                            {feature === 'prioritySupport' && <Badge variant="secondary">Pro+</Badge>}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Communication Limits */}
                    <div>
                      <h4 className="font-medium mb-3">Communication Limits</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Max Channels per Workspace</label>
                          <Input type="number" defaultValue="500" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Max Message History (days)</label>
                          <Input type="number" defaultValue="90" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Max File Size (MB)</label>
                          <Input type="number" defaultValue="100" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Max Video Call Duration (hours)</label>
                          <Input type="number" defaultValue="24" />
                        </div>
                      </div>
                    </div>

                    {/* Security Policies */}
                    <div>
                      <h4 className="font-medium mb-3">Security Policies</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <div className="font-medium">Require 2FA for all users</div>
                            <div className="text-sm text-gray-600">Force two-factor authentication</div>
                          </div>
                          <input type="checkbox" className="rounded" />
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <div className="font-medium">Restrict external integrations</div>
                            <div className="text-sm text-gray-600">Require admin approval for apps</div>
                          </div>
                          <input type="checkbox" defaultChecked className="rounded" />
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <div className="font-medium">Enable data loss prevention</div>
                            <div className="text-sm text-gray-600">Monitor sensitive data sharing</div>
                          </div>
                          <input type="checkbox" defaultChecked className="rounded" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button variant="outline" onClick={() => setShowOrgLimitsModal(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => {
                        setShowOrgLimitsModal(false);
                        toast({ title: "Organization limits updated successfully" });
                      }}>
                        Save Limits
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Security & Compliance Tab */}
          <TabsContent value="security" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <ShieldCheck className="h-5 w-5 mr-2" />
                      Security Policies
                    </div>
                    <Button size="sm" onClick={() => setShowSecurityModal(true)}>
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Single Sign-On (SSO)</h4>
                      <p className="text-sm text-gray-600">SAML 2.0 integration enabled</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
                      <Button variant="ghost" size="sm" onClick={() => setShowSecurityModal(true)}>
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-600">Required for all admin users</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">Enforced</Badge>
                      <Button variant="ghost" size="sm" onClick={() => setShowSecurityModal(true)}>
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">SCIM Provisioning</h4>
                      <p className="text-sm text-gray-600">Automated user management</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">Configured</Badge>
                      <Button variant="ghost" size="sm" onClick={() => setShowSecurityModal(true)}>
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Data Loss Prevention</h4>
                      <p className="text-sm text-gray-600">Monitor sensitive data sharing</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Monitoring</Badge>
                      <Button variant="ghost" size="sm" onClick={() => setShowSecurityModal(true)}>
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="h-5 w-5 mr-2" />
                    Compliance & Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Data Retention</h4>
                      <p className="text-sm text-gray-600">7 years for compliance</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">eDiscovery</h4>
                      <p className="text-sm text-gray-600">Legal hold capabilities</p>
                    </div>
                    <Button variant="outline" size="sm">Manage</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Data Export</h4>
                      <p className="text-sm text-gray-600">Compliance reporting</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">SIEM Integration</h4>
                      <p className="text-sm text-gray-600">Security monitoring</p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Connected</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Billing & Licensing Tab */}
          <TabsContent value="billing" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CreditCard className="h-5 w-5 mr-2" />
                      Subscription Overview
                    </div>
                    <Button size="sm" onClick={() => setShowBillingModal(true)}>
                      <Settings className="h-4 w-4 mr-2" />
                      Manage Billing
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">Enterprise Grid Plan</h3>
                        <p className="text-gray-600">Unlimited users • Advanced security • 24/7 support</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">$25/user/month</div>
                        <p className="text-sm text-gray-600">Billed annually</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">124</div>
                        <div className="text-sm text-gray-600">Active Users</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">$3,100</div>
                        <div className="text-sm text-gray-600">Monthly Cost</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">89%</div>
                        <div className="text-sm text-gray-600">Utilization</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Usage Alerts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Storage Usage</span>
                    <span className="font-medium">84%</span>
                  </div>
                  <Progress value={84} className="h-2" />
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>API Calls</span>
                    <span className="font-medium">67%</span>
                  </div>
                  <Progress value={67} className="h-2" />
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>Guest Users</span>
                    <span className="font-medium">23%</span>
                  </div>
                  <Progress value={23} className="h-2" />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { date: '2025-01-01', amount: '$3,100', status: 'paid', period: 'January 2025' },
                    { date: '2024-12-01', amount: '$2,950', status: 'paid', period: 'December 2024' },
                    { date: '2024-11-01', amount: '$2,875', status: 'paid', period: 'November 2024' }
                  ].map((invoice, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{invoice.period}</div>
                        <div className="text-sm text-gray-600">{invoice.date}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{invoice.amount}</div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {invoice.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Apps & Integrations Tab */}
          <TabsContent value="apps" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Zap className="h-5 w-5 mr-2" />
                    App Management
                  </div>
                  <Button size="sm" onClick={() => setShowAppStoreModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Browse Apps
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: 'Google Drive', status: 'approved', users: 89, category: 'File Storage' },
                    { name: 'Zoom', status: 'approved', users: 124, category: 'Video Conferencing' },
                    { name: 'Jira', status: 'pending', users: 45, category: 'Project Management' },
                    { name: 'GitHub', status: 'approved', users: 67, category: 'Development' },
                    { name: 'Salesforce', status: 'restricted', users: 23, category: 'CRM' },
                    { name: 'Custom Bot', status: 'review', users: 12, category: 'Automation' }
                  ].map((app, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{app.name}</h3>
                        <Badge variant={
                          app.status === 'approved' ? 'default' :
                          app.status === 'pending' ? 'secondary' :
                          app.status === 'restricted' ? 'destructive' : 'outline'
                        }>
                          {app.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{app.category}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{app.users} users</span>
                        <Button variant="ghost" size="sm" onClick={() => handleManageApp(app)}>
                          <Settings className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Policies Tab */}
          <TabsContent value="policies" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Network className="h-5 w-5 mr-2" />
                    Organization Policies
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Channel Creation</h4>
                        <p className="text-sm text-gray-600">Who can create channels</p>
                      </div>
                      <Select defaultValue="admins">
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="everyone">Everyone</SelectItem>
                          <SelectItem value="admins">Admins Only</SelectItem>
                          <SelectItem value="restricted">Restricted</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">External Invitations</h4>
                        <p className="text-sm text-gray-600">Guest user permissions</p>
                      </div>
                      <Select defaultValue="admins">
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="disabled">Disabled</SelectItem>
                          <SelectItem value="admins">Admins Only</SelectItem>
                          <SelectItem value="members">All Members</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">App Installation</h4>
                        <p className="text-sm text-gray-600">Third-party app permissions</p>
                      </div>
                      <Select defaultValue="approval">
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="disabled">Disabled</SelectItem>
                          <SelectItem value="approval">Requires Approval</SelectItem>
                          <SelectItem value="open">Open</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Workflow className="h-5 w-5 mr-2" />
                      Custom Roles
                    </div>
                    <Button size="sm" onClick={() => setShowCreateRoleModal(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Role
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {customRoles.slice(0, 4).map((role, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${role.color}`}></div>
                          <div>
                            <div className="font-medium">{role.name}</div>
                            <div className="text-sm text-gray-600">{role.permissions.slice(0, 2).join(', ')}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-right">
                            <div className="text-sm font-medium">{role.users} users</div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => handleEditRole(role)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          {role.name !== 'Super Admin' && role.name !== 'Member' && (
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteRole(role.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4" onClick={() => setShowBillingModal(true)}>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Billing Management
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active Users Today</p>
                      <p className="text-2xl font-bold text-green-600">1,247</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">+12% from yesterday</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Messages Sent</p>
                      <p className="text-2xl font-bold text-blue-600">47,832</p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">+8% from last week</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Revenue (MRR)</p>
                      <p className="text-2xl font-bold text-green-600">$142,560</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">+15% from last month</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Organizations</p>
                      <p className="text-2xl font-bold text-purple-600">348</p>
                    </div>
                    <Building2 className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">12 new this month</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart2 className="h-5 w-5 mr-2" />
                    User Growth
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">This Month</span>
                      <span className="font-medium text-green-600">+2,347 users</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Last Month</span>
                      <span className="font-medium">+1,892 users</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Growth Rate</span>
                      <span className="font-medium text-green-600">+24.1%</span>
                    </div>
                    <Progress value={76} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    System Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Uptime</span>
                      <span className="font-medium text-green-600">99.98%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Response Time</span>
                      <span className="font-medium">127ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">API Success Rate</span>
                      <span className="font-medium text-green-600">99.94%</span>
                    </div>
                    <Progress value={99} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="h-5 w-5 mr-2" />
                    Geographic Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { region: 'North America', users: '45%', count: '12,847' },
                      { region: 'Europe', users: '32%', count: '9,123' },
                      { region: 'Asia Pacific', users: '18%', count: '5,134' },
                      { region: 'Other', users: '5%', count: '1,425' }
                    ].map((region, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{region.region}</span>
                        <div className="text-right">
                          <div className="text-sm font-medium">{region.users}</div>
                          <div className="text-xs text-gray-500">{region.count} users</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Channel Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: 'general', messages: 14247, users: 1847, trend: '+12%' },
                      { name: 'dev-team', messages: 8901, users: 234, trend: '+8%' },
                      { name: 'marketing', messages: 4567, users: 189, trend: '+15%' },
                      { name: 'support', messages: 2341, users: 67, trend: '-3%' },
                      { name: 'design', messages: 1892, users: 45, trend: '+5%' }
                    ].map((channel, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                          <div>
                            <span className="font-medium">#{channel.name}</span>
                            <div className="text-xs text-gray-500">{channel.users} members</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{channel.messages.toLocaleString()}</div>
                          <div className={`text-xs ${channel.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                            {channel.trend}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="h-5 w-5 mr-2" />
                    Integration Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: 'Slack Bot API', calls: 45672, status: 'active', success: 99.8 },
                      { name: 'GitHub Integration', calls: 23456, status: 'active', success: 98.9 },
                      { name: 'Jira Connector', calls: 12890, status: 'active', success: 99.2 },
                      { name: 'Google Drive', calls: 8934, status: 'warning', success: 95.1 },
                      { name: 'Zoom Meetings', calls: 5678, status: 'active', success: 99.9 }
                    ].map((integration, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{integration.name}</div>
                          <div className="text-xs text-gray-500">{integration.calls.toLocaleString()} API calls</div>
                        </div>
                        <div className="text-right">
                          <Badge variant={integration.status === 'active' ? 'default' : 'destructive'}>
                            {integration.success}% success
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
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

        {/* Enhanced Role Management */}
        {showCreateRoleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">
                  {selectedRole ? 'Edit Role' : 'Create Custom Role'}
                </h3>
                <Button variant="ghost" size="sm" onClick={() => {
                  setShowCreateRoleModal(false);
                  setSelectedRole(null);
                }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Role Name</label>
                  <Input 
                    placeholder="e.g., Project Manager" 
                    defaultValue={selectedRole?.name || ''} 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Input placeholder="Brief description of this role" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Permissions</label>
                  <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                    {[
                      'User Management', 'Channel Creation', 'Message Deletion', 'File Management',
                      'Integration Control', 'Analytics Access', 'Billing Access', 'Audit Logs',
                      'Security Settings', 'Workspace Settings', 'App Management', 'API Access',
                      'Role Management', 'Organization Control', 'Export Data', 'System Administration'
                    ].map((permission) => (
                      <label key={permission} className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          className="rounded"
                          defaultChecked={selectedRole?.permissions?.includes(permission)}
                        />
                        <span className="text-sm">{permission}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <Button onClick={() => {
                    setShowCreateRoleModal(false);
                    setSelectedRole(null);
                    toast({ 
                      title: selectedRole ? "Role Updated" : "Role Created", 
                      description: `Custom role has been ${selectedRole ? 'updated' : 'created'} successfully.` 
                    });
                  }}>
                    {selectedRole ? 'Update Role' : 'Create Role'}
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setShowCreateRoleModal(false);
                    setSelectedRole(null);
                  }}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Security Configuration Modal */}
        {showSecurityModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Security & Compliance Configuration</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowSecurityModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <Tabs defaultValue="sso" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="sso">SSO</TabsTrigger>
                  <TabsTrigger value="2fa">2FA</TabsTrigger>
                  <TabsTrigger value="scim">SCIM</TabsTrigger>
                  <TabsTrigger value="dlp">DLP</TabsTrigger>
                  <TabsTrigger value="compliance">Compliance</TabsTrigger>
                </TabsList>
                
                <TabsContent value="sso" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Single Sign-On Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Identity Provider</label>
                          <Select defaultValue="okta">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="okta">Okta</SelectItem>
                              <SelectItem value="azure">Azure AD</SelectItem>
                              <SelectItem value="google">Google Workspace</SelectItem>
                              <SelectItem value="saml">Custom SAML</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Domain</label>
                          <Input placeholder="company.com" defaultValue="kolab360.com" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">SSO URL</label>
                        <Input placeholder="https://your-domain.okta.com/..." defaultValue="https://kolab360.okta.com/app/slack" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Entity ID</label>
                        <Input placeholder="Entity identifier" defaultValue="https://kolab360.com/sso" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">X.509 Certificate</label>
                        <textarea 
                          className="w-full h-24 p-2 border rounded text-sm" 
                          placeholder="Paste X.509 certificate..."
                          defaultValue="-----BEGIN CERTIFICATE-----\nMIICXjCCAcegAwIBAgIJAK..."
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="sso-required" defaultChecked />
                          <label htmlFor="sso-required" className="text-sm">Require SSO for all users</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="just-in-time" defaultChecked />
                          <label htmlFor="just-in-time" className="text-sm">Enable Just-in-Time provisioning</label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="2fa" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Two-Factor Authentication</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <h4 className="font-medium">Require 2FA for Admins</h4>
                            <p className="text-sm text-gray-600">All admin users must enable 2FA</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">Enforced</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <h4 className="font-medium">Require 2FA for All Users</h4>
                            <p className="text-sm text-gray-600">All workspace members must enable 2FA</p>
                          </div>
                          <Button variant="outline" size="sm">
                            Enable
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <h4 className="font-medium">SMS Provider Configuration</h4>
                            <p className="text-sm text-gray-600">Configure SMS delivery for 2FA codes</p>
                          </div>
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-2" />
                            Configure
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <h4 className="font-medium">Backup Codes</h4>
                            <p className="text-sm text-gray-600">Allow users to generate backup codes</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="scim" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>SCIM Provisioning</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">SCIM Endpoint</label>
                          <Input value="https://api.kolab360.com/scim/v2" readOnly />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Bearer Token</label>
                          <div className="flex space-x-2">
                            <Input value="scim_••••••••••••••••••••••••" readOnly />
                            <Button variant="outline" size="sm">
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h4 className="font-medium">Provisioning Status</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center p-3 border rounded">
                            <div className="text-2xl font-bold text-green-600">1,247</div>
                            <div className="text-sm text-gray-600">Users Synced</div>
                          </div>
                          <div className="text-center p-3 border rounded">
                            <div className="text-2xl font-bold text-blue-600">2 min</div>
                            <div className="text-sm text-gray-600">Last Sync</div>
                          </div>
                          <div className="text-center p-3 border rounded">
                            <div className="text-2xl font-bold text-green-600">Active</div>
                            <div className="text-sm text-gray-600">Status</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="dlp" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Data Loss Prevention</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <h4 className="font-medium">Credit Card Detection</h4>
                            <p className="text-sm text-gray-600">Block messages containing credit card numbers</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <h4 className="font-medium">SSN Detection</h4>
                            <p className="text-sm text-gray-600">Block messages containing social security numbers</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <h4 className="font-medium">Custom Keywords</h4>
                            <p className="text-sm text-gray-600">Monitor for specific keywords or phrases</p>
                          </div>
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-2" />
                            Configure
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <h4 className="font-medium">File Content Scanning</h4>
                            <p className="text-sm text-gray-600">Scan uploaded files for sensitive content</p>
                          </div>
                          <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="compliance" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Compliance & Audit</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <h4 className="font-medium">Data Retention</h4>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Message Retention (years)</label>
                            <Input type="number" defaultValue="7" />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">File Retention (years)</label>
                            <Input type="number" defaultValue="7" />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h4 className="font-medium">Compliance Standards</h4>
                          <div className="space-y-2">
                            {['SOC 2 Type II', 'HIPAA', 'GDPR', 'CCPA', 'ISO 27001'].map((standard) => (
                              <label key={standard} className="flex items-center space-x-2">
                                <input type="checkbox" defaultChecked />
                                <span className="text-sm">{standard}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
              
              <div className="flex space-x-3 pt-6 border-t">
                <Button onClick={() => {
                  setShowSecurityModal(false);
                  toast({ title: "Security Configuration Saved", description: "All security settings have been updated successfully." });
                }}>
                  Save Configuration
                </Button>
                <Button variant="outline" onClick={() => setShowSecurityModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Billing Management Modal */}
        {showBillingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Enterprise Billing Management</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowBillingModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <Tabs defaultValue="plans" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="plans">Plans & Pricing</TabsTrigger>
                  <TabsTrigger value="usage">Usage & Limits</TabsTrigger>
                  <TabsTrigger value="invoicing">Invoicing</TabsTrigger>
                  <TabsTrigger value="reports">Reports</TabsTrigger>
                </TabsList>
                
                <TabsContent value="plans" className="space-y-4">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Pricing Tier Management</h3>
                    <Button onClick={() => setShowCreatePlanModal(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Custom Plan
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {pricingPlans.map((plan, index) => (
                      <Card key={index} className={plan.isCurrent ? 'border-2 border-blue-500' : 'border border-gray-200'}>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span>{plan.name}</span>
                              {plan.isCurrent && <Badge className="bg-blue-100 text-blue-800">Current</Badge>}
                              {plan.isPopular && <Badge className="bg-orange-100 text-orange-800">Popular</Badge>}
                            </div>
                            <div className="flex space-x-1">
                              <Button variant="ghost" size="sm" onClick={() => handleEditPlan(plan)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              {!plan.isCurrent && !plan.isCore && (
                                <Button variant="ghost" size="sm" onClick={() => handleDeletePlan(plan.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </CardTitle>
                          <div className="space-y-1">
                            <div className="text-3xl font-bold">{plan.price}</div>
                            <div className="text-sm text-gray-600">{plan.billingPeriod}</div>
                            <div className="text-xs text-gray-500">{plan.description}</div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <div className="text-sm font-medium">Resource Limits</div>
                            <div className="text-xs space-y-1">
                              <div className="flex justify-between">
                                <span>Max Users:</span>
                                <span className="font-medium">{plan.limits.maxUsers}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Storage:</span>
                                <span className="font-medium">{plan.limits.storage}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>API Calls/Hour:</span>
                                <span className="font-medium">{plan.limits.apiCalls}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>File Size:</span>
                                <span className="font-medium">{plan.limits.fileSize}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="text-sm font-medium">Core Features</div>
                            <div className="space-y-1">
                              {plan.features.core.map((feature, idx) => (
                                <div key={idx} className="flex items-center text-xs">
                                  <CheckCircle className="h-3 w-3 text-green-600 mr-2 flex-shrink-0" />
                                  <span>{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="text-sm font-medium">Advanced Features</div>
                            <div className="space-y-1">
                              {plan.features.advanced.map((feature, idx) => (
                                <div key={idx} className="flex items-center text-xs">
                                  {plan.features.advanced.length > 0 ? (
                                    <CheckCircle className="h-3 w-3 text-green-600 mr-2 flex-shrink-0" />
                                  ) : (
                                    <X className="h-3 w-3 text-gray-400 mr-2 flex-shrink-0" />
                                  )}
                                  <span className={plan.features.advanced.length > 0 ? '' : 'text-gray-400'}>{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="text-sm font-medium">Enterprise Features</div>
                            <div className="space-y-1">
                              {plan.features.enterprise.map((feature, idx) => (
                                <div key={idx} className="flex items-center text-xs">
                                  {plan.features.enterprise.length > 0 ? (
                                    <CheckCircle className="h-3 w-3 text-green-600 mr-2 flex-shrink-0" />
                                  ) : (
                                    <X className="h-3 w-3 text-gray-400 mr-2 flex-shrink-0" />
                                  )}
                                  <span className={plan.features.enterprise.length > 0 ? '' : 'text-gray-400'}>{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="pt-2 border-t">
                            <div className="flex items-center justify-between text-xs">
                              <span>Organizations using:</span>
                              <span className="font-medium">{plan.organizationCount}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="usage" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Usage Controls & Limits</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Storage Limit per Org (GB)</label>
                            <Input type="number" defaultValue="2000" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">API Rate Limit (requests/hour)</label>
                            <Input type="number" defaultValue="10000" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Max Users per Org</label>
                            <Input type="number" defaultValue="5000" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">File Size Limit (MB)</label>
                            <Input type="number" defaultValue="100" />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <h4 className="font-medium">Current Usage</h4>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Storage</span>
                                <span>847GB / 2000GB</span>
                              </div>
                              <Progress value={42} />
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>API Calls</span>
                                <span>6.7K / 10K per hour</span>
                              </div>
                              <Progress value={67} />
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Active Users</span>
                                <span>1,247 / 5,000</span>
                              </div>
                              <Progress value={25} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="invoicing" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Invoicing & Payment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="font-medium">Payment Information</h4>
                          <div className="flex items-center space-x-3 p-3 border rounded">
                            <CreditCard className="h-5 w-5" />
                            <div>
                              <div className="font-medium">•••• •••• •••• 4242</div>
                              <div className="text-sm text-gray-600">Expires 12/26</div>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Billing Cycle</label>
                            <Select defaultValue="annually">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="quarterly">Quarterly</SelectItem>
                                <SelectItem value="annually">Annually (10% discount)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="auto-billing" defaultChecked />
                            <label htmlFor="auto-billing" className="text-sm">Enable automatic billing</label>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <h4 className="font-medium">Recent Invoices</h4>
                          <div className="space-y-2">
                            {[
                              { date: '2025-01-01', amount: '$37,200', status: 'paid', period: 'January 2025' },
                              { date: '2024-12-01', amount: '$35,400', status: 'paid', period: 'December 2024' },
                              { date: '2024-11-01', amount: '$34,500', status: 'paid', period: 'November 2024' },
                              { date: '2024-10-01', amount: '$33,900', status: 'paid', period: 'October 2024' }
                            ].map((invoice, index) => (
                              <div key={index} className="flex items-center justify-between p-2 border rounded text-sm">
                                <div>
                                  <div className="font-medium">{invoice.period}</div>
                                  <div className="text-gray-600">{invoice.date}</div>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium">{invoice.amount}</div>
                                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                                    {invoice.status}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="reports" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Usage Reports & Analytics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="text-center p-4 border rounded">
                          <div className="text-2xl font-bold text-green-600">$142,560</div>
                          <div className="text-sm text-gray-600">Monthly Recurring Revenue</div>
                        </div>
                        <div className="text-center p-4 border rounded">
                          <div className="text-2xl font-bold text-blue-600">1,247</div>
                          <div className="text-sm text-gray-600">Active Paid Users</div>
                        </div>
                        <div className="text-center p-4 border rounded">
                          <div className="text-2xl font-bold text-purple-600">348</div>
                          <div className="text-sm text-gray-600">Paying Organizations</div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Button variant="outline" className="w-full">
                          <Download className="h-4 w-4 mr-2" />
                          Download Usage Report (PDF)
                        </Button>
                        <Button variant="outline" className="w-full">
                          <Download className="h-4 w-4 mr-2" />
                          Export Billing Data (CSV)
                        </Button>
                        <Button variant="outline" className="w-full">
                          <Download className="h-4 w-4 mr-2" />
                          Generate Invoice Summary
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
              
              <div className="flex space-x-3 pt-6 border-t">
                <Button onClick={() => {
                  setShowBillingModal(false);
                  toast({ title: "Billing Configuration Saved", description: "All billing settings have been updated successfully." });
                }}>
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setShowBillingModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Create/Edit Pricing Plan Modal */}
        {showCreatePlanModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">
                  {selectedPlan ? 'Edit Pricing Plan' : 'Create Custom Pricing Plan'}
                </h3>
                <Button variant="ghost" size="sm" onClick={() => {
                  setShowCreatePlanModal(false);
                  setSelectedPlan(null);
                }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Basic Information</h4>
                  <div>
                    <label className="block text-sm font-medium mb-1">Plan Name</label>
                    <Input placeholder="e.g., Team Pro" defaultValue={selectedPlan?.name || ''} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Price</label>
                    <div className="flex space-x-2">
                      <Select defaultValue="USD">
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">$</SelectItem>
                          <SelectItem value="EUR">€</SelectItem>
                          <SelectItem value="GBP">£</SelectItem>
                          <SelectItem value="JPY">¥</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="15.99" 
                        className="flex-1"
                        defaultValue={selectedPlan?.price?.replace(/[^0-9.]/g, '') || ''}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Billing Period</label>
                    <Select defaultValue={selectedPlan?.billingPeriod?.toLowerCase()?.includes('month') ? 'monthly' : selectedPlan?.billingPeriod?.toLowerCase()?.includes('year') ? 'yearly' : 'custom'}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly (per user/month)</SelectItem>
                        <SelectItem value="yearly">Yearly (per user/year)</SelectItem>
                        <SelectItem value="quarterly">Quarterly (per user/quarter)</SelectItem>
                        <SelectItem value="weekly">Weekly (per user/week)</SelectItem>
                        <SelectItem value="onetime">One-time payment</SelectItem>
                        <SelectItem value="custom">Custom billing period</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <Input placeholder="Brief plan description" defaultValue={selectedPlan?.description || ''} />
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked={selectedPlan?.isPopular} />
                      <span className="text-sm">Mark as Popular</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked={selectedPlan?.isCurrent} />
                      <span className="text-sm">Set as Current Plan</span>
                    </label>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Resource Limits</h4>
                  <div>
                    <label className="block text-sm font-medium mb-1">Max Users</label>
                    <div className="flex space-x-2">
                      <Input 
                        type="number" 
                        placeholder="Number of users" 
                        className="flex-1"
                        defaultValue={selectedPlan?.limits?.maxUsers?.replace(/[^0-9]/g, '') || ''}
                      />
                      <Select defaultValue="limit">
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="limit">Fixed Limit</SelectItem>
                          <SelectItem value="unlimited">Unlimited</SelectItem>
                          <SelectItem value="per-workspace">Per Workspace</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Maximum number of users allowed in the organization</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Storage Limit</label>
                    <div className="flex space-x-2">
                      <Input 
                        type="number" 
                        placeholder="Amount" 
                        className="flex-1"
                        defaultValue={selectedPlan?.limits?.storage?.replace(/[^0-9]/g, '') || ''}
                      />
                      <Select defaultValue="GB">
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MB">MB</SelectItem>
                          <SelectItem value="GB">GB</SelectItem>
                          <SelectItem value="TB">TB</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select defaultValue="total">
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="total">Total</SelectItem>
                          <SelectItem value="per-user">Per User</SelectItem>
                          <SelectItem value="unlimited">Unlimited</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">API Rate Limit</label>
                    <div className="flex space-x-2">
                      <Input 
                        type="number" 
                        placeholder="Requests" 
                        className="flex-1"
                        defaultValue={selectedPlan?.limits?.apiCalls?.replace(/[^0-9]/g, '') || ''}
                      />
                      <Select defaultValue="hour">
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minute">Per Min</SelectItem>
                          <SelectItem value="hour">Per Hour</SelectItem>
                          <SelectItem value="day">Per Day</SelectItem>
                          <SelectItem value="unlimited">Unlimited</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">API requests allowed per time period</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Max File Size</label>
                    <div className="flex space-x-2">
                      <Input 
                        type="number" 
                        placeholder="Size" 
                        className="flex-1"
                        defaultValue={selectedPlan?.limits?.fileSize?.replace(/[^0-9]/g, '') || ''}
                      />
                      <Select defaultValue="MB">
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="KB">KB</SelectItem>
                          <SelectItem value="MB">MB</SelectItem>
                          <SelectItem value="GB">GB</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Maximum size for individual file uploads</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Message History Retention</label>
                    <div className="flex space-x-2">
                      <Input 
                        type="number" 
                        placeholder="Duration" 
                        className="flex-1"
                        defaultValue="90"
                      />
                      <Select defaultValue="days">
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="days">Days</SelectItem>
                          <SelectItem value="months">Months</SelectItem>
                          <SelectItem value="years">Years</SelectItem>
                          <SelectItem value="unlimited">Unlimited</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">How long to keep message history</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Concurrent Video Calls</label>
                    <div className="flex space-x-2">
                      <Input 
                        type="number" 
                        placeholder="Max calls" 
                        className="flex-1"
                        defaultValue="10"
                      />
                      <Select defaultValue="simultaneous">
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="simultaneous">Simultaneous</SelectItem>
                          <SelectItem value="per-workspace">Per Workspace</SelectItem>
                          <SelectItem value="unlimited">Unlimited</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Maximum concurrent video calls allowed</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 space-y-4">
                <h4 className="font-medium">Feature Categories</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Core Features</label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {[
                        'Basic messaging', 'File sharing', 'Search history', 'Two-factor auth',
                        'Voice & video calls', 'Guest access', 'Mobile apps', 'Desktop apps'
                      ].map((feature) => (
                        <label key={feature} className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked={selectedPlan?.features?.core?.includes(feature)} />
                          <span className="text-sm">{feature}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Advanced Features</label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {[
                        'Screen sharing', 'Unlimited integrations', 'Workflow automation', 'Advanced search',
                        'Custom user groups', 'Advanced analytics', 'Data exports', 'Real-time monitoring'
                      ].map((feature) => (
                        <label key={feature} className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked={selectedPlan?.features?.advanced?.includes(feature)} />
                          <span className="text-sm">{feature}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Enterprise Features</label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {[
                        'SSO (SAML)', 'SCIM provisioning', 'Advanced DLP', 'Legal hold & eDiscovery',
                        '24/7 premium support', 'Dedicated success manager', 'Custom SLA', 'Multi-region deployment'
                      ].map((feature) => (
                        <label key={feature} className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked={selectedPlan?.features?.enterprise?.includes(feature)} />
                          <span className="text-sm">{feature}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 pt-6 border-t">
                <Button onClick={() => {
                  setShowCreatePlanModal(false);
                  setSelectedPlan(null);
                  toast({ 
                    title: selectedPlan ? "Pricing Plan Updated" : "Pricing Plan Created", 
                    description: `Pricing plan has been ${selectedPlan ? 'updated' : 'created'} successfully.` 
                  });
                }}>
                  {selectedPlan ? 'Update Plan' : 'Create Plan'}
                </Button>
                <Button variant="outline" onClick={() => {
                  setShowCreatePlanModal(false);
                  setSelectedPlan(null);
                }}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Organization Controls Modal */}
        {showOrgControlsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Organization Admin Controls</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowOrgControlsModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <Tabs defaultValue="employee" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="employee">Employee Management</TabsTrigger>
                  <TabsTrigger value="channels">Channel Controls</TabsTrigger>
                  <TabsTrigger value="permissions">Comment Permissions</TabsTrigger>
                  <TabsTrigger value="limits">Organization Limits</TabsTrigger>
                </TabsList>
                
                <TabsContent value="employee" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Employee User Management</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="font-medium">Employee Account Types</h4>
                          <div className="space-y-3">
                            {[
                              { name: 'Full Employee', users: 347, description: 'Complete access to all company channels', color: 'bg-green-500' },
                              { name: 'Department Employee', users: 156, description: 'Access to department-specific channels only', color: 'bg-blue-500' },
                              { name: 'Contractor', users: 89, description: 'Limited access with project-based permissions', color: 'bg-yellow-500' },
                              { name: 'Read-Only Employee', users: 45, description: 'View-only access, cannot post or comment', color: 'bg-gray-500' }
                            ].map((type, index) => (
                              <div key={index} className="flex items-center justify-between p-3 border rounded">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-3 h-3 rounded-full ${type.color}`}></div>
                                  <div>
                                    <div className="font-medium">{type.name}</div>
                                    <div className="text-sm text-gray-600">{type.description}</div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline">{type.users} users</Badge>
                                  <Button variant="ghost" size="sm">
                                    <Settings className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <h4 className="font-medium">Employee Onboarding</h4>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium mb-1">Default Employee Role</label>
                              <Select defaultValue="department">
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="full">Full Employee</SelectItem>
                                  <SelectItem value="department">Department Employee</SelectItem>
                                  <SelectItem value="contractor">Contractor</SelectItem>
                                  <SelectItem value="readonly">Read-Only Employee</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Auto-assign to Channels</label>
                              <div className="space-y-2">
                                {['#general', '#announcements', '#hr-updates', '#company-news'].map((channel) => (
                                  <label key={channel} className="flex items-center space-x-2">
                                    <input type="checkbox" defaultChecked />
                                    <span className="text-sm">{channel}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="channels" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Employee-Specific Channel Management</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="font-medium">Company Channels</h4>
                          <div className="space-y-3">
                            {[
                              { name: '#all-employees', members: 637, type: 'Company-wide', restricted: false },
                              { name: '#announcements', members: 637, type: 'Company-wide', restricted: true },
                              { name: '#hr-policies', members: 45, type: 'HR Department', restricted: true },
                              { name: '#employee-feedback', members: 423, type: 'Company-wide', restricted: false },
                              { name: '#benefits-info', members: 356, type: 'HR Department', restricted: true }
                            ].map((channel, index) => (
                              <div key={index} className="flex items-center justify-between p-3 border rounded">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-3 h-3 rounded-full ${channel.restricted ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                  <div>
                                    <div className="font-medium">{channel.name}</div>
                                    <div className="text-sm text-gray-600">{channel.type} • {channel.members} members</div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge variant={channel.restricted ? "destructive" : "secondary"}>
                                    {channel.restricted ? 'Admin Only' : 'Open'}
                                  </Badge>
                                  <Button variant="ghost" size="sm">
                                    <Settings className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                          <Button variant="outline" className="w-full">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Employee Channel
                          </Button>
                        </div>
                        
                        <div className="space-y-4">
                          <h4 className="font-medium">Channel Access Rules</h4>
                          <div className="space-y-3">
                            <div className="p-3 border rounded">
                              <div className="font-medium mb-2">Department Isolation</div>
                              <div className="text-sm text-gray-600 mb-2">Employees can only see channels within their department</div>
                              <div className="flex items-center space-x-2">
                                <input type="checkbox" defaultChecked />
                                <span className="text-sm">Enable department isolation</span>
                              </div>
                            </div>
                            <div className="p-3 border rounded">
                              <div className="font-medium mb-2">Cross-Department Collaboration</div>
                              <div className="text-sm text-gray-600 mb-2">Allow employees to join cross-department projects</div>
                              <div className="flex items-center space-x-2">
                                <input type="checkbox" defaultChecked />
                                <span className="text-sm">Allow cross-department access</span>
                              </div>
                            </div>
                            <div className="p-3 border rounded">
                              <div className="font-medium mb-2">Guest Channel Access</div>
                              <div className="text-sm text-gray-600 mb-2">Contractors can access specific project channels</div>
                              <div className="flex items-center space-x-2">
                                <input type="checkbox" />
                                <span className="text-sm">Enable guest channel access</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="permissions" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Comment & Posting Permissions by Account Type</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="font-medium">Permission Matrix</h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b">
                                  <th className="text-left p-2">Account Type</th>
                                  <th className="text-center p-2">Post</th>
                                  <th className="text-center p-2">Comment</th>
                                  <th className="text-center p-2">React</th>
                                  <th className="text-center p-2">File Upload</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="border-b">
                                  <td className="p-2 font-medium">Full Employee</td>
                                  <td className="text-center p-2"><CheckCircle className="h-4 w-4 text-green-600 mx-auto" /></td>
                                  <td className="text-center p-2"><CheckCircle className="h-4 w-4 text-green-600 mx-auto" /></td>
                                  <td className="text-center p-2"><CheckCircle className="h-4 w-4 text-green-600 mx-auto" /></td>
                                  <td className="text-center p-2"><CheckCircle className="h-4 w-4 text-green-600 mx-auto" /></td>
                                </tr>
                                <tr className="border-b">
                                  <td className="p-2 font-medium">Department Employee</td>
                                  <td className="text-center p-2"><CheckCircle className="h-4 w-4 text-green-600 mx-auto" /></td>
                                  <td className="text-center p-2"><CheckCircle className="h-4 w-4 text-green-600 mx-auto" /></td>
                                  <td className="text-center p-2"><CheckCircle className="h-4 w-4 text-green-600 mx-auto" /></td>
                                  <td className="text-center p-2"><CheckCircle className="h-4 w-4 text-orange-600 mx-auto" /></td>
                                </tr>
                                <tr className="border-b">
                                  <td className="p-2 font-medium">Contractor</td>
                                  <td className="text-center p-2"><CheckCircle className="h-4 w-4 text-orange-600 mx-auto" /></td>
                                  <td className="text-center p-2"><CheckCircle className="h-4 w-4 text-green-600 mx-auto" /></td>
                                  <td className="text-center p-2"><CheckCircle className="h-4 w-4 text-green-600 mx-auto" /></td>
                                  <td className="text-center p-2"><X className="h-4 w-4 text-red-600 mx-auto" /></td>
                                </tr>
                                <tr>
                                  <td className="p-2 font-medium">Read-Only Employee</td>
                                  <td className="text-center p-2"><X className="h-4 w-4 text-red-600 mx-auto" /></td>
                                  <td className="text-center p-2"><X className="h-4 w-4 text-red-600 mx-auto" /></td>
                                  <td className="text-center p-2"><CheckCircle className="h-4 w-4 text-green-600 mx-auto" /></td>
                                  <td className="text-center p-2"><X className="h-4 w-4 text-red-600 mx-auto" /></td>
                                </tr>
                              </tbody>
                            </table>
                            <div className="mt-2 text-xs text-gray-500">
                              <CheckCircle className="h-3 w-3 text-green-600 inline mr-1" />Full Access 
                              <CheckCircle className="h-3 w-3 text-orange-600 inline mr-1 ml-3" />Limited Access 
                              <X className="h-3 w-3 text-red-600 inline mr-1 ml-3" />No Access
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <h4 className="font-medium">Advanced Permission Controls</h4>
                          <div className="space-y-3">
                            <div className="p-3 border rounded">
                              <div className="font-medium mb-2">Time-based Restrictions</div>
                              <div className="space-y-2">
                                <label className="flex items-center space-x-2">
                                  <input type="checkbox" />
                                  <span className="text-sm">Restrict posting during non-business hours</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                  <input type="checkbox" />
                                  <span className="text-sm">Weekend posting restrictions</span>
                                </label>
                              </div>
                            </div>
                            <div className="p-3 border rounded">
                              <div className="font-medium mb-2">Content Moderation</div>
                              <div className="space-y-2">
                                <label className="flex items-center space-x-2">
                                  <input type="checkbox" defaultChecked />
                                  <span className="text-sm">Require approval for contractor posts</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                  <input type="checkbox" />
                                  <span className="text-sm">Auto-delete inappropriate content</span>
                                </label>
                              </div>
                            </div>
                            <div className="p-3 border rounded">
                              <div className="font-medium mb-2">Channel-Specific Rules</div>
                              <div className="space-y-2">
                                <label className="flex items-center space-x-2">
                                  <input type="checkbox" defaultChecked />
                                  <span className="text-sm">Admin-only posting in #announcements</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                  <input type="checkbox" />
                                  <span className="text-sm">Department leads can moderate their channels</span>
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="limits" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Organization Resource Limits</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="font-medium">User Limits</h4>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium mb-1">Total Employee Limit</label>
                              <Input type="number" defaultValue="1000" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Contractor Limit</label>
                              <Input type="number" defaultValue="200" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Department Admin Limit</label>
                              <Input type="number" defaultValue="50" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Guest User Limit</label>
                              <Input type="number" defaultValue="100" />
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <h4 className="font-medium">Current Usage</h4>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Total Users</span>
                                <span>637 / 1,000</span>
                              </div>
                              <Progress value={64} />
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Contractors</span>
                                <span>89 / 200</span>
                              </div>
                              <Progress value={45} />
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Department Admins</span>
                                <span>12 / 50</span>
                              </div>
                              <Progress value={24} />
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Guest Users</span>
                                <span>23 / 100</span>
                              </div>
                              <Progress value={23} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
              
              <div className="flex space-x-3 pt-6 border-t">
                <Button onClick={() => {
                  setShowOrgControlsModal(false);
                  toast({ title: "Organization Controls Updated", description: "Employee management settings have been saved successfully." });
                }}>
                  Save Configuration
                </Button>
                <Button variant="outline" onClick={() => setShowOrgControlsModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Edit User: {selectedUser.firstName} {selectedUser.lastName}</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowEditUserModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Personal Information</h4>
                  <div>
                    <label className="block text-sm font-medium mb-1">First Name</label>
                    <Input defaultValue={selectedUser.firstName} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Last Name</label>
                    <Input defaultValue={selectedUser.lastName} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <Input defaultValue={selectedUser.email} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Department</label>
                    <Select defaultValue={selectedUser.department}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Engineering">Engineering</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="HR">HR</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Support">Support</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Account Settings</h4>
                  <div>
                    <label className="block text-sm font-medium mb-1">Role</label>
                    <Select defaultValue={selectedUser.role}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="guest">Guest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <Select defaultValue={selectedUser.status}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-medium">Permissions</label>
                    <div className="space-y-2">
                      {[
                        'Create Channels',
                        'Delete Messages',
                        'Manage Users',
                        'Access Analytics',
                        'File Upload',
                        'External Integrations'
                      ].map((permission) => (
                        <label key={permission} className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked={Math.random() > 0.5} />
                          <span className="text-sm">{permission}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded">
                <h4 className="font-medium mb-3">Account Statistics</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Messages Sent:</span>
                    <span className="font-medium ml-2">{selectedUser.messageCount}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Files Shared:</span>
                    <span className="font-medium ml-2">{selectedUser.filesShared}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Last Active:</span>
                    <span className="font-medium ml-2">{selectedUser.lastActive}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Member Since:</span>
                    <span className="font-medium ml-2">{selectedUser.joinDate}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 pt-6 border-t">
                <Button onClick={() => {
                  setShowEditUserModal(false);
                  toast({ title: "User Updated", description: "User information has been saved successfully." });
                }}>
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setShowEditUserModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Comprehensive Organization Management Modal */}
        {showOrgManagementModal && selectedOrgForManagement && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Manage Organization: {selectedOrgForManagement.name}</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowOrgManagementModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="users">Users & Roles</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                  <TabsTrigger value="billing">Billing</TabsTrigger>
                  <TabsTrigger value="support">Support</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Organization Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Users:</span>
                          <span className="font-medium">{selectedOrgForManagement.users}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Active Users:</span>
                          <span className="font-medium">{Math.floor(selectedOrgForManagement.users * 0.85)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Plan:</span>
                          <span className="font-medium">{selectedOrgForManagement.plan}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Storage Used:</span>
                          <span className="font-medium">{selectedOrgForManagement.storage}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Created:</span>
                          <span className="font-medium">{selectedOrgForManagement.created}</span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button className="w-full" variant="outline">
                          <Users className="h-4 w-4 mr-2" />
                          Add Users Bulk
                        </Button>
                        <Button className="w-full" variant="outline">
                          <Settings className="h-4 w-4 mr-2" />
                          Reset Settings
                        </Button>
                        <Button className="w-full" variant="outline">
                          <FileText className="h-4 w-4 mr-2" />
                          Export Data
                        </Button>
                        <Button className="w-full" variant="outline">
                          <Shield className="h-4 w-4 mr-2" />
                          Security Audit
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Health Status</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">System Health:</span>
                          <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Security Score:</span>
                          <Badge className="bg-green-100 text-green-800">98/100</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Compliance:</span>
                          <Badge className="bg-green-100 text-green-800">Compliant</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Backup Status:</span>
                          <Badge className="bg-green-100 text-green-800">Current</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="users" className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-lg">Organization Admin & User Control</h4>
                    <div className="flex space-x-2">
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add User
                      </Button>
                      <Button size="sm" variant="outline">
                        <Upload className="h-4 w-4 mr-2" />
                        Bulk Import
                      </Button>
                    </div>
                  </div>
                  
                  {/* Organization Admins Section */}
                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader>
                      <CardTitle className="flex items-center text-blue-800">
                        <Crown className="h-5 w-5 mr-2" />
                        Organization Administrators
                      </CardTitle>
                      <p className="text-sm text-blue-600">Control who can manage this organization and its users</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { name: 'John Smith', email: 'john@acme.com', role: 'Primary Admin', permissions: 'Full Control', lastActive: '2 hours ago' },
                          { name: 'Sarah Johnson', email: 'sarah@acme.com', role: 'Secondary Admin', permissions: 'User Management', lastActive: '1 day ago' },
                          { name: 'Mike Chen', email: 'mike@acme.com', role: 'Security Admin', permissions: 'Security & Compliance', lastActive: '3 hours ago' }
                        ].map((admin, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarFallback className="bg-blue-600 text-white">{admin.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{admin.name}</div>
                                <div className="text-sm text-gray-600">{admin.email}</div>
                                <div className="text-xs text-gray-500">{admin.permissions} • Last active: {admin.lastActive}</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="default" className="bg-blue-600">{admin.role}</Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Permissions
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    Send Message
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">
                                    <UserX className="h-4 w-4 mr-2" />
                                    Remove Admin
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))}
                        <Button className="w-full" variant="outline" size="sm">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Promote User to Admin
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>User Statistics & Controls</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span>Organization Admins</span>
                            <div className="flex items-center space-x-2">
                              <Badge variant="default" className="bg-blue-600">3 users</Badge>
                              <Button size="sm" variant="ghost">
                                <Settings className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Regular Users</span>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">234 users</Badge>
                              <Button size="sm" variant="ghost">
                                <Settings className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Guest Users</span>
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary">45 users</Badge>
                              <Button size="sm" variant="ghost">
                                <Settings className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Suspended Users</span>
                            <div className="flex items-center space-x-2">
                              <Badge variant="destructive">3 users</Badge>
                              <Button size="sm" variant="ghost">
                                <Eye className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Admin Permissions Control</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <Button className="w-full" variant="outline">
                            <Shield className="h-4 w-4 mr-2" />
                            Create Admin Role
                          </Button>
                          <Button className="w-full" variant="outline">
                            <Users className="h-4 w-4 mr-2" />
                            Assign Bulk Roles
                          </Button>
                          <Button className="w-full" variant="outline">
                            <Settings className="h-4 w-4 mr-2" />
                            Permission Matrix
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="settings" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Organization Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Organization Name</label>
                          <Input defaultValue={selectedOrgForManagement.name} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Domain</label>
                          <Input defaultValue={selectedOrgForManagement.domain} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Time Zone</label>
                          <Select defaultValue="UTC">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="UTC">UTC</SelectItem>
                              <SelectItem value="EST">Eastern Time</SelectItem>
                              <SelectItem value="PST">Pacific Time</SelectItem>
                              <SelectItem value="GMT">Greenwich Mean Time</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Language</label>
                          <Select defaultValue="en">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="es">Spanish</SelectItem>
                              <SelectItem value="fr">French</SelectItem>
                              <SelectItem value="de">German</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Feature Controls</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span>Guest Access</span>
                          <input type="checkbox" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span>File Sharing</span>
                          <input type="checkbox" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span>External Integrations</span>
                          <input type="checkbox" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Voice & Video Calls</span>
                          <input type="checkbox" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Screen Sharing</span>
                          <input type="checkbox" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Custom Branding</span>
                          <input type="checkbox" defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="security" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Security Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="font-medium">Authentication Settings</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span>Two-Factor Authentication Required</span>
                              <input type="checkbox" defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                              <span>SSO Integration</span>
                              <input type="checkbox" defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Password Complexity</span>
                              <Badge className="bg-green-100 text-green-800">Strong</Badge>
                            </div>
                          </div>
                          
                          <h4 className="font-medium">Access Controls</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span>IP Whitelist</span>
                              <Button variant="outline" size="sm">Configure</Button>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Device Management</span>
                              <Button variant="outline" size="sm">Manage</Button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <h4 className="font-medium">Data Protection</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span>Data Encryption</span>
                              <Badge className="bg-green-100 text-green-800">AES-256</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Backup Encryption</span>
                              <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Data Retention</span>
                              <span className="text-sm">7 years</span>
                            </div>
                          </div>
                          
                          <h4 className="font-medium">Compliance</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span>GDPR Compliance</span>
                              <Badge className="bg-green-100 text-green-800">Active</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>SOC 2 Type II</span>
                              <Badge className="bg-green-100 text-green-800">Certified</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="billing" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Current Plan & Usage</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span>Current Plan:</span>
                          <Badge>{selectedOrgForManagement.plan}</Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Users ({selectedOrgForManagement.users}/1000)</span>
                            <span>{Math.floor(selectedOrgForManagement.users/10)}%</span>
                          </div>
                          <Progress value={Math.floor(selectedOrgForManagement.users/10)} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Storage ({selectedOrgForManagement.storage}/1TB)</span>
                            <span>67%</span>
                          </div>
                          <Progress value={67} className="h-2" />
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t">
                          <span className="font-medium">Monthly Cost:</span>
                          <span className="font-bold text-lg">$2,890</span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Billing Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button className="w-full" variant="outline">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Change Plan
                        </Button>
                        <Button className="w-full" variant="outline">
                          <FileText className="h-4 w-4 mr-2" />
                          Download Invoice
                        </Button>
                        <Button className="w-full" variant="outline">
                          <Settings className="h-4 w-4 mr-2" />
                          Payment Method
                        </Button>
                        <Button className="w-full" variant="outline">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Suspend Billing
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="support" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Support Tools</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button className="w-full" variant="outline">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Contact Organization Admin
                        </Button>
                        <Button className="w-full" variant="outline">
                          <Phone className="h-4 w-4 mr-2" />
                          Schedule Support Call
                        </Button>
                        <Button className="w-full" variant="outline">
                          <FileText className="h-4 w-4 mr-2" />
                          Generate Support Report
                        </Button>
                        <Button className="w-full" variant="outline">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Emergency Override
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Organization Health</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">User Satisfaction:</span>
                            <span className="font-medium">94%</span>
                          </div>
                          <Progress value={94} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">System Performance:</span>
                            <span className="font-medium">98%</span>
                          </div>
                          <Progress value={98} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Support Tickets:</span>
                            <span className="font-medium">2 open</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex space-x-3 pt-6 border-t">
                <Button onClick={() => {
                  setShowOrgManagementModal(false);
                  toast({ title: "Organization Updated", description: "Organization settings have been saved successfully." });
                }}>
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setShowOrgManagementModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* App Management Modal */}
        {showAppManagementModal && selectedApp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Manage App: {selectedApp.name}</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowAppManagementModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="permissions">Permissions</TabsTrigger>
                  <TabsTrigger value="users">Users</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>App Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">App Name:</span>
                          <span className="font-medium">{selectedApp.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Category:</span>
                          <span className="font-medium">{selectedApp.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <Badge variant={selectedApp.status === 'approved' ? 'default' : selectedApp.status === 'pending' ? 'secondary' : 'destructive'}>
                            {selectedApp.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Active Users:</span>
                          <span className="font-medium">{selectedApp.users}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Data Access:</span>
                          <span className="font-medium">Read & Write</span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>App Controls</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button className="w-full" variant={selectedApp.status === 'approved' ? 'destructive' : 'default'}>
                          {selectedApp.status === 'approved' ? 'Revoke Access' : 'Approve App'}
                        </Button>
                        <Button className="w-full" variant="outline">
                          <Settings className="h-4 w-4 mr-2" />
                          Configure Permissions
                        </Button>
                        <Button className="w-full" variant="outline">
                          <Users className="h-4 w-4 mr-2" />
                          Manage Users
                        </Button>
                        <Button className="w-full" variant="outline">
                          <FileText className="h-4 w-4 mr-2" />
                          View Audit Log
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="permissions" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>App Permissions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <h4 className="font-medium">Data Access Permissions</h4>
                        <div className="space-y-2">
                          {[
                            'Read user profiles',
                            'Read messages',
                            'Write messages',
                            'Access file storage',
                            'Manage channels',
                            'Send notifications'
                          ].map((permission) => (
                            <label key={permission} className="flex items-center space-x-2">
                              <input type="checkbox" defaultChecked={Math.random() > 0.3} />
                              <span className="text-sm">{permission}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium">API Rate Limits</h4>
                        <div>
                          <label className="block text-sm font-medium mb-1">Requests per Hour</label>
                          <Input type="number" defaultValue="1000" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Data Transfer Limit (MB/hour)</label>
                          <Input type="number" defaultValue="100" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="users" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>App Usage by Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span>Total Active Users:</span>
                          <Badge variant="outline">{selectedApp.users} users</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Daily Active Users:</span>
                          <Badge variant="outline">{Math.floor(selectedApp.users * 0.7)} users</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Admin Users:</span>
                          <Badge variant="outline">{Math.floor(selectedApp.users * 0.1)} users</Badge>
                        </div>
                        
                        <Button className="w-full mt-4" variant="outline">
                          <Users className="h-4 w-4 mr-2" />
                          Manage User Access
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="settings" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>App Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">App Status</label>
                        <Select defaultValue={selectedApp.status}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="pending">Pending Review</SelectItem>
                            <SelectItem value="restricted">Restricted</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium">Security Settings</h4>
                        <div className="space-y-2">
                          <label className="flex items-center space-x-2">
                            <input type="checkbox" defaultChecked />
                            <span className="text-sm">Require encryption for data transfer</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input type="checkbox" defaultChecked />
                            <span className="text-sm">Log all API calls</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input type="checkbox" />
                            <span className="text-sm">Restrict to specific IP addresses</span>
                          </label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
              
              <div className="flex space-x-3 pt-6 border-t">
                <Button onClick={() => {
                  setShowAppManagementModal(false);
                  toast({ title: "App Settings Updated", description: "App configuration has been saved successfully." });
                }}>
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setShowAppManagementModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Browse Apps Store Modal */}
        {showAppStoreModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Browse Apps & Integrations</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowAppStoreModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="mb-6">
                <div className="flex space-x-4 mb-4">
                  <Input placeholder="Search apps..." className="flex-1" />
                  <Select defaultValue="all">
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="productivity">Productivity</SelectItem>
                      <SelectItem value="communication">Communication</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="analytics">Analytics</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Slack Bot Pro', category: 'Communication', price: 'Free', rating: 4.8, users: '2.1M', description: 'Advanced automation for Slack workflows', installed: false },
                  { name: 'Google Workspace', category: 'Productivity', price: '$12/mo', rating: 4.9, users: '3.8M', description: 'Complete office suite integration', installed: true },
                  { name: 'Microsoft Teams', category: 'Communication', price: '$15/mo', rating: 4.6, users: '1.5M', description: 'Enterprise video conferencing', installed: false },
                  { name: 'Jira Integration', category: 'Development', price: 'Free', rating: 4.7, users: '980K', description: 'Project management and issue tracking', installed: true },
                  { name: 'GitHub Actions', category: 'Development', price: 'Free', rating: 4.5, users: '1.2M', description: 'CI/CD pipeline automation', installed: false },
                  { name: 'Salesforce CRM', category: 'Marketing', price: '$25/mo', rating: 4.4, users: '5.2M', description: 'Customer relationship management', installed: true },
                  { name: 'Zoom Meetings', category: 'Communication', price: '$14.99/mo', rating: 4.3, users: '4.7M', description: 'High-quality video conferences', installed: false },
                  { name: 'Trello Boards', category: 'Productivity', price: 'Free', rating: 4.6, users: '2.8M', description: 'Visual project management', installed: false },
                  { name: 'Google Analytics', category: 'Analytics', price: 'Free', rating: 4.8, users: '6.1M', description: 'Web traffic analysis and insights', installed: true }
                ].map((app, index) => (
                  <Card key={index} className={app.installed ? 'border-green-200 bg-green-50' : ''}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{app.name}</CardTitle>
                          <p className="text-sm text-gray-600">{app.category}</p>
                        </div>
                        <Badge variant={app.installed ? 'default' : 'outline'} className={app.installed ? 'bg-green-600' : ''}>
                          {app.installed ? 'Installed' : app.price}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-gray-700">{app.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>⭐ {app.rating} • {app.users} users</span>
                      </div>
                      <div className="flex space-x-2">
                        {app.installed ? (
                          <>
                            <Button size="sm" variant="outline" className="flex-1" onClick={() => handleManageApp(app)}>
                              <Settings className="h-3 w-3 mr-1" />
                              Manage
                            </Button>
                            <Button size="sm" variant="destructive" className="flex-1">
                              <Trash2 className="h-3 w-3 mr-1" />
                              Remove
                            </Button>
                          </>
                        ) : (
                          <Button size="sm" className="w-full" onClick={() => {
                            toast({ title: "App Installed", description: `${app.name} has been installed successfully.` });
                          }}>
                            <Plus className="h-3 w-3 mr-1" />
                            Install
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-end pt-6 border-t mt-6">
                <Button variant="outline" onClick={() => setShowAppStoreModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
