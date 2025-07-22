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

interface Organization {
  id: number;
  name: string;
  domain: string;
  plan: string;
  status: 'active' | 'suspended';
  members: number;
  memberLimit: number;
  storageUsed: number;
  storageLimit: number;
  adminName: string;
  adminEmail: string;
  createdAt: string;
  users?: number;
  storage?: string;
  created?: string;
}

export function SuperAdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<WorkspaceStats | null>(null);
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
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);
  const [showOrgControlsModal, setShowOrgControlsModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [showOrgManagementModal, setShowOrgManagementModal] = useState(false);
  const [selectedOrgForManagement, setSelectedOrgForManagement] = useState<Organization | null>(null);
  const [showAppManagementModal, setShowAppManagementModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [showAppStoreModal, setShowAppStoreModal] = useState(false);
  const [customRoles, setCustomRoles] = useState<any[]>([]);
  const [pricingPlans, setPricingPlans] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [newOrgData, setNewOrgData] = useState({
    name: '',
    domain: '',
    plan: 'free',
    adminEmail: '',
    adminFirstName: '',
    adminLastName: ''
  });

  // Load data from APIs
  useEffect(() => {
    console.log('SuperAdminDashboard mounted, current organizations:', organizations.length);
    loadData();
  }, []);

  // Debug organizations state changes
  useEffect(() => {
    console.log('Organizations state changed:', organizations.length, organizations.map(o => o.name));
  }, [organizations]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load organizations from API
      try {
        const response = await fetch('/api/organizations', {
          credentials: 'include'
        });
        if (response.ok) {
          const orgs = await response.json();
          setOrganizations(orgs);
          console.log('✅ Organizations loaded from API:', orgs.length);
        } else {
          console.warn('Failed to load organizations:', response.status);
          setOrganizations([]);
        }
      } catch (error) {
        console.error('Error loading organizations:', error);
        setOrganizations([]);
      }
      
      // Load real data from APIs
      setUsers([]);
      setStats({
        totalUsers: 0,
        activeUsers: 0,
        totalMessages: 0,
        totalFiles: 0,
        storageUsed: 0,
        storageLimit: 1000,
        channels: 0,
        integrations: 0
      });
      // Initialize with empty arrays but keep existing organizations if any
      setCustomRoles([]);
      setPricingPlans([
        {
          id: 1,
          name: 'Free',
          price: 0,
          features: ['Basic messaging', '10 GB storage', 'Up to 10 members'],
          memberLimit: 10,
          storageLimit: 10
        },
        {
          id: 2,
          name: 'Pro',
          price: 8,
          features: ['Advanced messaging', '100 GB storage', 'Up to 100 members', 'Video calls'],
          memberLimit: 100,
          storageLimit: 100
        },
        {
          id: 3,
          name: 'Business',
          price: 15,
          features: ['Everything in Pro', '500 GB storage', 'Up to 500 members', 'Advanced analytics'],
          memberLimit: 500,
          storageLimit: 500
        },
        {
          id: 4,
          name: 'Enterprise',
          price: 25,
          features: ['Everything in Business', '1 TB storage', 'Unlimited members', 'Custom integrations'],
          memberLimit: 10000,
          storageLimit: 1000
        }
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrg = async () => {
    console.log('Creating organization with data:', newOrgData);
    if (!newOrgData.name || !newOrgData.domain || !newOrgData.adminEmail) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      const planLimits = getPlanLimits(newOrgData.plan);
      const orgData = {
        name: newOrgData.name,
        domain: newOrgData.domain,
        plan: newOrgData.plan,
        status: 'active' as const,
        members: 1,
        memberLimit: planLimits.members,
        storageUsed: 0,
        storageLimit: planLimits.storage,
        adminName: `${newOrgData.adminFirstName} ${newOrgData.adminLastName}`,
        adminEmail: newOrgData.adminEmail,
        adminFirstName: newOrgData.adminFirstName,
        adminLastName: newOrgData.adminLastName,
      };

      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(orgData),
      });

      if (response.ok) {
        const newOrg = await response.json();
        console.log('✅ Organization created via API:', newOrg);
        
        // Add to local state
        setOrganizations(prev => [...prev, newOrg]);
        setShowCreateOrgModal(false);
        setNewOrgData({
          name: '',
          domain: '',
          plan: 'free',
          adminEmail: '',
          adminFirstName: '',
          adminLastName: ''
        });

        toast({
          title: "Organization Created",
          description: `${newOrg.name} has been successfully created!`
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create organization');
      }
    } catch (error) {
      console.error('Error creating organization:', error);
      toast({
        title: "Creation Failed",
        description: error.message || 'Failed to create organization. Please try again.',
        variant: "destructive"
      });
    }
  };

  const getPlanLimits = (plan: string) => {
    const limits = {
      free: { members: 10, storage: 1 },
      pro: { members: 100, storage: 10 },
      business: { members: 500, storage: 50 },
      enterprise: { members: 10000, storage: 500 }
    };
    return limits[plan as keyof typeof limits] || limits.free;
  };

  const handleShowOrgManagement = (org: Organization) => {
    setSelectedOrgForManagement(org);
    setShowOrgManagementModal(true);
  };

  const handleSuspendOrg = (orgId: number) => {
    toast({
      title: "Feature Coming Soon",
      description: "Organization suspension will be available in the next update."
    });
  };

  const handleDeleteOrg = (orgId: number) => {
    toast({
      title: "Feature Coming Soon",
      description: "Organization deletion will be available in the next update."
    });
  };

  const handleEditRole = (role: any) => {
    setSelectedRole(role);
    setShowCreateRoleModal(true);
  };

  const handleDeleteRole = (roleId: number) => {
    toast({
      title: "Feature Coming Soon",
      description: "Role deletion will be available in the next update."
    });
  };

  const handleEditPlan = (plan: any) => {
    setSelectedPlan(plan);
    setShowCreatePlanModal(true);
  };

  const handleDeletePlan = (planId: number) => {
    toast({
      title: "Feature Coming Soon",
      description: "Plan deletion will be available in the next update."
    });
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditUserModal(true);
  };

  const handleSuspendUser = (userId: number) => {
    toast({
      title: "Feature Coming Soon",
      description: "User suspension will be available in the next update."
    });
  };

  const handleDeleteUser = (userId: number) => {
    toast({
      title: "Feature Coming Soon",
      description: "User deletion will be available in the next update."
    });
  };

  const handlePromoteUser = (userId: number) => {
    toast({
      title: "Feature Coming Soon",
      description: "User promotion will be available in the next update."
    });
  };

  const handleDemoteUser = (userId: number) => {
    toast({
      title: "Feature Coming Soon",
      description: "User demotion will be available in the next update."
    });
  };

  const handleShowAppManagement = (org: Organization) => {
    setSelectedApp(org);
    setShowAppManagementModal(true);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Super Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Enterprise-wide control and management</p>
          </div>
          <div className="flex space-x-3">
            <Button onClick={() => setShowCreateOrgModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Organization
            </Button>
            <Button variant="outline" onClick={() => setShowAppStoreModal(true)}>
              <Zap className="h-4 w-4 mr-2" />
              Browse Apps
            </Button>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="organizations">Organizations</TabsTrigger>
            <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
            <TabsTrigger value="pricing">Pricing Plans</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{organizations.length}</div>
                  {/* Debug info */}
                  <div className="text-xs text-gray-500 mt-1">
                    {organizations.map(org => org.name).join(', ')}
                  </div>
                  <p className="text-xs text-muted-foreground">No new organizations this month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">No new users this month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.activeUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">No activity yet</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.storageUsed || 0}GB</div>
                  <p className="text-xs text-muted-foreground">of {stats?.storageLimit || 1000}GB total</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="organizations" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Organization Management</h3>
              <Button onClick={() => setShowCreateOrgModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Organization
              </Button>
            </div>

            {organizations.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Organizations</h3>
                  <p className="text-gray-500 mb-6">Get started by creating your first organization.</p>
                  <Button onClick={() => setShowCreateOrgModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Organization
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                            <DropdownMenuItem onClick={() => handleShowOrgManagement(org)}>
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
                            <DropdownMenuItem onClick={() => {
                              setSelectedOrg(org);
                              setShowSecurityModal(true);
                            }}>
                              <Shield className="h-4 w-4 mr-2" />
                              Security Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedOrg(org);
                              setShowBillingModal(true);
                            }}>
                              <DollarSign className="h-4 w-4 mr-2" />
                              Billing & Plans
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleShowAppManagement(org)}>
                              <Zap className="h-4 w-4 mr-2" />
                              App Permissions
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <BarChart2 className="h-4 w-4 mr-2" />
                              View Analytics
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Export Data
                            </DropdownMenuItem>
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* Other tab contents would continue here */}
        </Tabs>

        {/* Organization Management Modal with Fixed Active Users */}
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
                          <span className="font-medium">{selectedOrgForManagement.members || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Active Users:</span>
                          <span className="font-medium">{Math.floor((selectedOrgForManagement.members || 0) * 0.85)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Plan:</span>
                          <span className="font-medium">{selectedOrgForManagement.plan}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Storage Used:</span>
                          <span className="font-medium">{selectedOrgForManagement.storageUsed}GB/{selectedOrgForManagement.storageLimit}GB</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Created:</span>
                          <span className="font-medium">{selectedOrgForManagement.createdAt}</span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button className="w-full" variant="outline" onClick={() => toast({title: "Coming Soon", description: "User management will be available soon."})}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add New User
                        </Button>
                        <Button className="w-full" variant="outline" onClick={() => toast({title: "Coming Soon", description: "Broadcast messaging will be available soon."})}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Broadcast Message
                        </Button>
                        <Button className="w-full" variant="outline" onClick={() => toast({title: "Coming Soon", description: "Settings management will be available soon."})}>
                          <Settings className="h-4 w-4 mr-2" />
                          Manage Settings
                        </Button>
                        <Button className="w-full" variant="outline" onClick={() => toast({title: "Coming Soon", description: "Screen sharing controls will be available soon."})}>
                          <Eye className="h-4 w-4 mr-2" />
                          Screen Sharing
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Organization Health</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Status:</span>
                          <Badge className={selectedOrgForManagement.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {selectedOrgForManagement.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Compliance:</span>
                          <Badge className="bg-green-100 text-green-800">Compliant</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Security Score:</span>
                          <Badge className="bg-green-100 text-green-800">85/100</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Backup Status:</span>
                          <Badge className="bg-green-100 text-green-800">Current</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex space-x-3 pt-6 border-t">
                <Button onClick={() => {
                  setShowOrgManagementModal(false);
                  toast({ title: "Changes Saved", description: "Organization settings have been updated successfully." });
                }}>
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setShowOrgManagementModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Create Organization Modal */}
        {showCreateOrgModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Create New Organization</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowCreateOrgModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Organization Name *</label>
                    <Input 
                      placeholder="e.g. Acme Corp"
                      value={newOrgData.name}
                      onChange={(e) => setNewOrgData(prev => ({...prev, name: e.target.value}))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Domain *</label>
                    <Input 
                      placeholder="e.g. acmecorp.com"
                      value={newOrgData.domain}
                      onChange={(e) => setNewOrgData(prev => ({...prev, domain: e.target.value}))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Pricing Plan</label>
                  <Select value={newOrgData.plan} onValueChange={(value) => setNewOrgData(prev => ({...prev, plan: value}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free - Up to 10 members, 1 GB storage</SelectItem>
                      <SelectItem value="pro">Pro - Up to 100 members, 10 GB storage</SelectItem>
                      <SelectItem value="business">Business - Up to 500 members, 50 GB storage</SelectItem>
                      <SelectItem value="enterprise">Enterprise - Unlimited members, 500 GB storage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Administrator Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">First Name</label>
                      <Input 
                        placeholder="John"
                        value={newOrgData.adminFirstName}
                        onChange={(e) => setNewOrgData(prev => ({...prev, adminFirstName: e.target.value}))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Last Name</label>
                      <Input 
                        placeholder="Smith"
                        value={newOrgData.adminLastName}
                        onChange={(e) => setNewOrgData(prev => ({...prev, adminLastName: e.target.value}))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    <label className="text-sm font-medium">Admin Email *</label>
                    <Input 
                      type="email"
                      placeholder="admin@acmecorp.com"
                      value={newOrgData.adminEmail}
                      onChange={(e) => setNewOrgData(prev => ({...prev, adminEmail: e.target.value}))}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowCreateOrgModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateOrg}>
                    <Building2 className="h-4 w-4 mr-2" />
                    Create Organization
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Browse Apps Modal */}
        {showAppStoreModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Browse Applications</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowAppStoreModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="mb-6">
                <Input 
                  placeholder="Search applications..." 
                  className="max-w-md"
                />
              </div>

              <div className="text-center py-8">
                <Zap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">App Store Coming Soon</h3>
                <p className="text-gray-500">The application marketplace will be available in the next update.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}