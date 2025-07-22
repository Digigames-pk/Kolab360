import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
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
  MoreVertical,
  HelpCircle,
  Receipt,
  Video
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
  const [orgUsers, setOrgUsers] = useState<any[]>([]);
  const [orgSettings, setOrgSettings] = useState<any>(null);
  const [newUserForm, setNewUserForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'member' as 'admin' | 'member' | 'guest',
    status: 'active' as 'active' | 'suspended'
  });
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
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showManageSettingsModal, setShowManageSettingsModal] = useState(false);
  const [showScreenSharingModal, setShowScreenSharingModal] = useState(false);
  const [showUsersRolesModal, setShowUsersRolesModal] = useState(false);
  const [showOrgSettingsModal, setShowOrgSettingsModal] = useState(false);
  const [showSecuritySettingsModal, setShowSecuritySettingsModal] = useState(false);
  const [showBillingSettingsModal, setShowBillingSettingsModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
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
    console.log('📊 [STATE] Organizations state changed:', organizations.length, organizations.map(o => o.name));
    console.log('📊 [STATE] Full organizations array:', organizations);
  }, [organizations]);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔍 [DEBUG] loadData - Starting to load organizations...');
      
      // First check authentication
      console.log('🔍 [DEBUG] Checking authentication status...');
      const authResponse = await fetch('/api/auth/me', {
        credentials: 'include',
      });
      
      console.log('🔍 [DEBUG] Auth response status:', authResponse.status);
      
      if (!authResponse.ok) {
        console.log('❌ [DEBUG] Not authenticated, auth response:', authResponse.status);
        const errorText = await authResponse.text();
        console.log('❌ [DEBUG] Auth error text:', errorText);
        setOrganizations([]);
        return;
      }
      
      const authData = await authResponse.json();
      console.log('🔍 [DEBUG] Auth data:', authData);
      console.log('🔍 [DEBUG] User role:', authData.role);
      
      // Load organizations from API
      try {
        console.log('🔍 [DEBUG] Now loading organizations...');
        const response = await fetch('/api/organizations', {
          credentials: 'include'
        });
        
        console.log('🔍 [DEBUG] Organizations response status:', response.status);
        console.log('🔍 [DEBUG] Organizations response ok:', response.ok);
        
        if (response.ok) {
          const orgs = await response.json();
          console.log('📊 [DEBUG] Raw organizations from API:', orgs);
          console.log('📊 [DEBUG] Setting organizations state with:', orgs.length, 'items');
          setOrganizations(orgs);
          console.log('✅ [DEBUG] Organizations loaded from API:', orgs.length);
          console.log('✅ [DEBUG] Organizations data:', orgs);
        } else {
          const errorText = await response.text();
          console.log('❌ [DEBUG] Organizations request failed:', response.status, errorText);
          setOrganizations([]);
        }
      } catch (error) {
        console.error('❌ [DEBUG] Error loading organizations:', error);
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
      console.log('🔍 [DEBUG] Creating organization with form data:', newOrgData);
      
      // Set default admin names if empty
      const adminFirstName = newOrgData.adminFirstName?.trim() || 'Admin';
      const adminLastName = newOrgData.adminLastName?.trim() || 'User';
      console.log('🔍 [DEBUG] Using admin names:', { adminFirstName, adminLastName });
      
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
        adminName: `${adminFirstName} ${adminLastName}`,
        adminEmail: newOrgData.adminEmail,
        adminFirstName: adminFirstName,
        adminLastName: adminLastName,
      };
      
      console.log('🔍 [DEBUG] Prepared organization data for API:', orgData);

      console.log('🔍 [DEBUG] Sending POST request to /api/organizations');
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(orgData),
      });
      
      console.log('🔍 [DEBUG] Response status:', response.status);
      console.log('🔍 [DEBUG] Response ok:', response.ok);

      if (response.ok) {
        const newOrg = await response.json();
        console.log('✅ Organization created via API:', newOrg);
        
        // Add the new organization immediately to the state
        setOrganizations(prev => [...prev, newOrg]);
        
        // Also refresh data to ensure consistency
        setTimeout(() => loadData(), 100);
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
        description: (error as Error).message || 'Failed to create organization. Please try again.',
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

  const handleShowOrgManagement = async (org: Organization) => {
    setSelectedOrgForManagement(org);
    await loadOrgUsers(org.id);
    await loadOrgSettings(org.id);
    setShowOrgManagementModal(true);
  };

  const handleSuspendOrg = async (orgId: number) => {
    try {
      const org = organizations.find(o => o.id === orgId);
      const endpoint = org?.status === 'suspended' ? 'reactivate' : 'suspend';
      
      const response = await fetch(`/api/organizations/${orgId}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const updatedOrg = await response.json();
        setOrganizations(prev => prev.map(o => o.id === orgId ? updatedOrg : o));
        toast({
          title: `Organization ${org?.status === 'suspended' ? 'Reactivated' : 'Suspended'}`,
          description: `${org?.name} has been ${org?.status === 'suspended' ? 'reactivated' : 'suspended'} successfully.`
        });
        loadData(); // Refresh data
      } else {
        throw new Error('Failed to update organization status');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update organization status.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteOrg = async (orgId: number) => {
    const org = organizations.find(o => o.id === orgId);
    if (!org) return;
    
    if (confirm(`Are you sure you want to delete "${org.name}"? This action cannot be undone.`)) {
      try {
        const response = await fetch(`/api/organizations/${orgId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          setOrganizations(prev => prev.filter(o => o.id !== orgId));
          toast({
            title: "Organization Deleted",
            description: `${org.name} has been deleted successfully.`
          });
          loadData(); // Refresh data
        } else {
          throw new Error('Failed to delete organization');
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete organization.",
          variant: "destructive"
        });
      }
    }
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

  const handleSuspendUser = async (userId: number | string) => {
    try {
      if (selectedOrg || selectedOrgForManagement) {
        const orgId = selectedOrg?.id || selectedOrgForManagement?.id;
        if (!orgId) return;
        const response = await fetch(`/api/organizations/${orgId}/users/${userId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'suspended' })
        });

        if (response.ok) {
          await loadOrgUsers(orgId);
          toast({ title: "Success", description: "User has been suspended." });
        } else {
          throw new Error('Failed to suspend user');
        }
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to suspend user." });
    }
  };

  const handleDeleteUser = async (userId: number | string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        if (selectedOrg || selectedOrgForManagement) {
          const orgId = selectedOrg?.id || selectedOrgForManagement?.id;
          if (!orgId) return;
          const response = await fetch(`/api/organizations/${orgId}/users/${userId}`, {
            method: 'DELETE'
          });

          if (response.ok) {
            await loadOrgUsers(orgId);
            toast({ title: "Success", description: "User has been deleted." });
          } else {
            throw new Error('Failed to delete user');
          }
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete user." });
      }
    }
  };

  const handlePromoteUser = async (userId: number | string) => {
    try {
      if (selectedOrg || selectedOrgForManagement) {
        const orgId = selectedOrg?.id || selectedOrgForManagement?.id;
        const response = await fetch(`/api/organizations/${orgId}/users/${userId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: 'admin' })
        });

        if (response.ok) {
          await loadOrgUsers(orgId);
          toast({ title: "Success", description: "User has been promoted to admin." });
        } else {
          throw new Error('Failed to promote user');
        }
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to promote user." });
    }
  };

  const handleDemoteUser = async (userId: number | string) => {
    try {
      if (selectedOrg || selectedOrgForManagement) {
        const orgId = selectedOrg?.id || selectedOrgForManagement?.id;
        const response = await fetch(`/api/organizations/${orgId}/users/${userId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: 'member' })
        });

        if (response.ok) {
          await loadOrgUsers(orgId);
          toast({ title: "Success", description: "User has been demoted to member." });
        } else {
          throw new Error('Failed to demote user');
        }
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to demote user." });
    }
  };



  // API Functions for Organization Management
  const loadOrgUsers = async (orgId: number) => {
    try {
      const response = await fetch(`/api/organizations/${orgId}/users`);
      if (response.ok) {
        const users = await response.json();
        setOrgUsers(users);
      }
    } catch (error) {
      console.error('Failed to load organization users:', error);
    }
  };

  const loadOrgSettings = async (orgId: number) => {
    try {
      const response = await fetch(`/api/organizations/${orgId}/settings`);
      if (response.ok) {
        const settings = await response.json();
        setOrgSettings(settings);
      }
    } catch (error) {
      console.error('Failed to load organization settings:', error);
    }
  };

  const updateOrgSettings = async (orgId: number, settingsData: any) => {
    try {
      const response = await fetch(`/api/organizations/${orgId}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsData)
      });

      if (response.ok) {
        const updatedSettings = await response.json();
        setOrgSettings(updatedSettings);
        toast({ title: "Success", description: "Organization settings updated." });
        return updatedSettings;
      } else {
        throw new Error('Failed to update settings');
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update organization settings." });
      throw error;
    }
  };

  const handleAddUser = async () => {
    try {
      if (selectedOrgForManagement && newUserForm.email && newUserForm.firstName && newUserForm.lastName) {
        const response = await fetch(`/api/organizations/${selectedOrgForManagement.id}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUserForm)
        });

        if (response.ok) {
          await loadOrgUsers(selectedOrgForManagement.id);
          setShowAddUserModal(false);
          setNewUserForm({
            email: '',
            firstName: '',
            lastName: '',
            role: 'member',
            status: 'active'
          });
          toast({ title: "Success", description: "User has been added successfully." });
        } else {
          throw new Error('Failed to add user');
        }
      } else {
        toast({ title: "Error", description: "Please fill in all required fields." });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to add user." });
    }
  };




  const handleShowAppManagement = (org: Organization) => {
    setSelectedApp(org);
    setShowAppManagementModal(true);
  };

  const handleExportData = async (orgId: number) => {
    try {
      const response = await fetch(`/api/organizations/${orgId}/export`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `organization-${orgId}-export.json`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Export Started",
          description: "Organization data export has been downloaded."
        });
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      toast({
        title: "Export Available Soon",
        description: "Data export feature will be available in the next update."
      });
    }
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

            {(() => { console.log('🔍 [RENDER] Checking organizations.length:', organizations.length, 'organizations:', organizations); return null; })()}
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
                {(() => { console.log('🔍 [RENDER] About to render', organizations.length, 'organization cards'); return null; })()}
                {organizations.map((org) => {
                  console.log('🔍 [RENDER] Rendering organization:', org.name, 'ID:', org.id);
                  return (
                  <Card key={org.id} className={`border-2 ${org.status === 'suspended' ? 'border-red-200 bg-red-50' : 'border-blue-500 bg-blue-50'} min-h-[200px] shadow-lg hover:shadow-xl transition-shadow`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className={`${org.status === 'suspended' ? 'bg-red-500' : 'bg-blue-600'} text-white font-bold`}>
                              {org.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">{org.name}</h3>
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
                            <DropdownMenuItem onClick={() => {
                              console.log('🔧 [DROPDOWN] Manage Admins clicked for org:', org.name);
                              handleShowOrgManagement(org);
                            }}>
                              <Crown className="h-4 w-4 mr-2" />
                              Manage Admins & Users
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              console.log('🔧 [DROPDOWN] Edit Organization clicked for org:', org.name);
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
                              setShowAddUserModal(true);
                            }}>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Add New User
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedOrg(org);
                              setShowBroadcastModal(true);
                            }}>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Broadcast Message
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedOrg(org);
                              setShowManageSettingsModal(true);
                            }}>
                              <Settings className="h-4 w-4 mr-2" />
                              Manage Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedOrg(org);
                              setShowScreenSharingModal(true);
                            }}>
                              <Eye className="h-4 w-4 mr-2" />
                              Screen Sharing
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedOrg(org);
                              setShowUsersRolesModal(true);
                            }}>
                              <Users className="h-4 w-4 mr-2" />
                              Users and Roles
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedOrg(org);
                              setShowOrgSettingsModal(true);
                            }}>
                              <Building2 className="h-4 w-4 mr-2" />
                              Organization Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedOrg(org);
                              setShowSecuritySettingsModal(true);
                            }}>
                              <Shield className="h-4 w-4 mr-2" />
                              Security
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedOrg(org);
                              setShowBillingSettingsModal(true);
                            }}>
                              <DollarSign className="h-4 w-4 mr-2" />
                              Billing
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedOrg(org);
                              setShowSupportModal(true);
                            }}>
                              <HelpCircle className="h-4 w-4 mr-2" />
                              Support
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleShowAppManagement(org)}>
                              <Zap className="h-4 w-4 mr-2" />
                              App Permissions
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedOrg(org);
                              setShowAnalyticsModal(true);
                            }}>
                              <BarChart2 className="h-4 w-4 mr-2" />
                              View Analytics
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExportData(org.id)}>
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
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Placeholder content for other tabs */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">User Management</h3>
              <Button onClick={() => setShowAddUserModal(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>Manage all users across all organizations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>SA</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">Super Admin</div>
                        <div className="text-sm text-gray-600">superadmin@test.com</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge>Super Admin</Badge>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles" className="space-y-6">
            <div className="text-center py-8">
              <p className="text-gray-500">Roles & Permissions section - Coming Soon</p>
            </div>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Pricing Plans</h3>
              <Button onClick={() => setShowCreatePlanModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Plan
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Free</span>
                    <Badge variant="secondary">Basic</Badge>
                  </CardTitle>
                  <div className="text-3xl font-bold">$0<span className="text-sm font-normal">/month</span></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Up to 10 members
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      1 GB storage
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Basic messaging
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Pro</span>
                    <Badge>Popular</Badge>
                  </CardTitle>
                  <div className="text-3xl font-bold">$8<span className="text-sm font-normal">/user/month</span></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Up to 100 members
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      10 GB storage
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Video calls & screen sharing
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Business</span>
                    <Badge variant="secondary">Enterprise</Badge>
                  </CardTitle>
                  <div className="text-3xl font-bold">$15<span className="text-sm font-normal">/user/month</span></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Up to 500 members
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      50 GB storage
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Advanced analytics
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Enterprise</span>
                    <Badge className="bg-purple-100 text-purple-700">Custom</Badge>
                  </CardTitle>
                  <div className="text-3xl font-bold">$25<span className="text-sm font-normal">/user/month</span></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Unlimited members
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      500 GB storage
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Custom integrations
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Security Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      Authentication
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>Two-Factor Authentication</span>
                        <Badge variant="secondary">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Password Policy</span>
                        <Badge>Strong</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Session Timeout</span>
                        <span className="text-sm">24 hours</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Lock className="h-5 w-5 mr-2" />
                      Data Protection
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>Encryption at Rest</span>
                        <Badge>AES-256</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Encryption in Transit</span>
                        <Badge>TLS 1.3</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Backup Encryption</span>
                        <Badge variant="secondary">Enabled</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      Monitoring
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>Failed Login Attempts</span>
                        <span className="text-red-600 font-medium">3</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Security Alerts</span>
                        <span className="text-green-600 font-medium">0</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Last Security Scan</span>
                        <span className="text-sm">2 hours ago</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Platform Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-full mr-4">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{organizations.length}</div>
                        <div className="text-sm text-gray-600">Total Organizations</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-full mr-4">
                        <TrendingUp className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{organizations.filter(o => o.status === 'active').length}</div>
                        <div className="text-sm text-gray-600">Active Organizations</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-full mr-4">
                        <Database className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{organizations.reduce((sum, org) => sum + (org.members || 0), 0)}</div>
                        <div className="text-sm text-gray-600">Total Users</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-orange-100 rounded-full mr-4">
                        <DollarSign className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">$12.5k</div>
                        <div className="text-sm text-gray-600">Monthly Revenue</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Organization Growth</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>This Month</span>
                        <span className="font-medium text-green-600">+{Math.max(0, organizations.length - 2)} new</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>This Week</span>
                        <span className="font-medium text-green-600">+{Math.max(0, Math.floor(organizations.length / 4))} new</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Today</span>
                        <span className="font-medium text-green-600">+{Math.max(0, Math.floor(organizations.length / 7))} new</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Plan Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {['Free', 'Pro', 'Business', 'Enterprise'].map((plan) => {
                        const count = organizations.filter(org => org.plan?.toLowerCase() === plan.toLowerCase()).length;
                        const percentage = organizations.length > 0 ? Math.round((count / organizations.length) * 100) : 0;
                        return (
                          <div key={plan} className="flex items-center justify-between">
                            <span>{plan}</span>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{count}</span>
                              <span className="text-sm text-gray-500">({percentage}%)</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Audit Logs</h3>
                <div className="flex space-x-2">
                  <Select>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      <SelectItem value="login">User Login</SelectItem>
                      <SelectItem value="organization">Organization Changes</SelectItem>
                      <SelectItem value="security">Security Events</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>System-wide administrative actions and security events</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium">User Login</div>
                          <div className="text-sm text-gray-600">superadmin@test.com logged in successfully</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">2 minutes ago</div>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Building2 className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">Organization Created</div>
                          <div className="text-sm text-gray-600">New organization "Test Corp" was created</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">1 hour ago</div>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-orange-100 rounded-full">
                          <Shield className="h-4 w-4 text-orange-600" />
                        </div>
                        <div>
                          <div className="font-medium">Security Scan</div>
                          <div className="text-sm text-gray-600">Automated security scan completed - no issues found</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">2 hours ago</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
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
                        <Button className="w-full" variant="outline" onClick={() => {
                          setShowAddUserModal(true);
                          toast({title: "Add User", description: "Opening user creation form..."});
                        }}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add New User
                        </Button>
                        <Button className="w-full" variant="outline" onClick={() => {
                          setShowBroadcastModal(true);
                          toast({title: "Broadcast Message", description: "Opening broadcast composer..."});
                        }}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Broadcast Message
                        </Button>
                        <Button className="w-full" variant="outline" onClick={() => {
                          setShowManageSettingsModal(true);
                          toast({title: "Manage Settings", description: "Opening organization settings..."});
                        }}>
                          <Settings className="h-4 w-4 mr-2" />
                          Manage Settings
                        </Button>
                        <Button className="w-full" variant="outline" onClick={() => {
                          setShowScreenSharingModal(true);
                          toast({title: "Screen Sharing", description: "Opening screen sharing controls..."});
                        }}>
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
                
                <TabsContent value="users" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Users className="h-5 w-5 mr-2" />
                          Organization Users
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {orgUsers.length > 0 ? orgUsers.map((user) => (
                            <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center space-x-3">
                                <Avatar>
                                  <AvatarFallback className={`${user.role === 'admin' ? 'bg-blue-600' : 'bg-gray-500'} text-white`}>
                                    {user.firstName[0]}{user.lastName[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{user.firstName} {user.lastName}</div>
                                  <div className="text-sm text-gray-600">{user.email}</div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge className={user.role === 'admin' ? 'bg-blue-600' : ''}>{user.role}</Badge>
                                <Badge variant={user.status === 'active' ? 'secondary' : 'destructive'}>{user.status}</Badge>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit User
                                    </DropdownMenuItem>
                                    {user.role !== 'admin' && (
                                      <DropdownMenuItem onClick={() => handlePromoteUser(user.id)}>
                                        <Crown className="h-4 w-4 mr-2" />
                                        Promote to Admin
                                      </DropdownMenuItem>
                                    )}
                                    {user.role === 'admin' && (
                                      <DropdownMenuItem onClick={() => handleDemoteUser(user.id)}>
                                        <Minus className="h-4 w-4 mr-2" />
                                        Demote from Admin
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem onClick={() => handleSuspendUser(user.id)}>
                                      <Ban className="h-4 w-4 mr-2" />
                                      Suspend User
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDeleteUser(user.id)} className="text-red-600">
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete User
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          )) : (
                            <div className="text-center py-8">
                              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                              <h3 className="text-lg font-medium text-gray-900 mb-2">No Users</h3>
                              <p className="text-gray-500 mb-6">No users found in this organization.</p>
                              <Button onClick={() => setShowAddUserModal(true)}>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Add First User
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Shield className="h-5 w-5 mr-2" />
                          Role Permissions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">Admin</span>
                              <Badge>Full Access</Badge>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div>• Create and manage channels</div>
                              <div>• Invite and remove users</div>
                              <div>• Access all organization settings</div>
                              <div>• Manage billing and subscriptions</div>
                            </div>
                          </div>
                          <div className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">Member</span>
                              <Badge variant="secondary">Limited Access</Badge>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div>• Join and participate in channels</div>
                              <div>• Send messages and files</div>
                              <div>• View basic organization info</div>
                              <div>• Update personal profile</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="settings" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Building2 className="h-5 w-5 mr-2" />
                          Organization Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                          <Input value={selectedOrgForManagement.name} readOnly />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
                          <Input value={selectedOrgForManagement.domain} readOnly />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                          <Select value={selectedOrgForManagement.plan}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="free">Free</SelectItem>
                              <SelectItem value="pro">Pro</SelectItem>
                              <SelectItem value="business">Business</SelectItem>
                              <SelectItem value="enterprise">Enterprise</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                          <Select value={selectedOrgForManagement.status}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="suspended">Suspended</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Settings className="h-5 w-5 mr-2" />
                          Workspace Configuration
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">File Sharing</div>
                            <div className="text-sm text-gray-600">Allow members to upload files</div>
                          </div>
                          <Switch 
                            checked={orgSettings?.fileSharing ?? true} 
                            onCheckedChange={(checked) => {
                              if (selectedOrgForManagement) {
                                updateOrgSettings(selectedOrgForManagement.id, { fileSharing: checked });
                              }
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">External Integrations</div>
                            <div className="text-sm text-gray-600">Enable third-party app connections</div>
                          </div>
                          <Switch 
                            checked={orgSettings?.externalIntegrations ?? false} 
                            onCheckedChange={(checked) => {
                              if (selectedOrgForManagement) {
                                updateOrgSettings(selectedOrgForManagement.id, { externalIntegrations: checked });
                              }
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Guest Access</div>
                            <div className="text-sm text-gray-600">Allow external users to join channels</div>
                          </div>
                          <Switch 
                            checked={orgSettings?.guestAccess ?? false} 
                            onCheckedChange={(checked) => {
                              if (selectedOrgForManagement) {
                                updateOrgSettings(selectedOrgForManagement.id, { guestAccess: checked });
                              }
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Message History</div>
                            <div className="text-sm text-gray-600">Retain full message history</div>
                          </div>
                          <Switch 
                            checked={orgSettings?.messageHistory ?? true} 
                            onCheckedChange={(checked) => {
                              if (selectedOrgForManagement) {
                                updateOrgSettings(selectedOrgForManagement.id, { messageHistory: checked });
                              }
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Two-Factor Authentication</div>
                            <div className="text-sm text-gray-600">Require 2FA for all users</div>
                          </div>
                          <Switch 
                            checked={orgSettings?.twoFactorAuth ?? false} 
                            onCheckedChange={(checked) => {
                              if (selectedOrgForManagement) {
                                updateOrgSettings(selectedOrgForManagement.id, { twoFactorAuth: checked });
                              }
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="security" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Shield className="h-5 w-5 mr-2" />
                          Security Policies
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Two-Factor Authentication</div>
                            <div className="text-sm text-gray-600">Require 2FA for all members</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Password Policy</div>
                            <div className="text-sm text-gray-600">Enforce strong password requirements</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Session Timeout</div>
                            <div className="text-sm text-gray-600">Auto-logout after inactivity</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">IP Restrictions</div>
                            <div className="text-sm text-gray-600">Limit access to specific IP ranges</div>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Lock className="h-5 w-5 mr-2" />
                          Data Protection
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Encryption</span>
                            <Badge variant="secondary">AES-256</Badge>
                          </div>
                          <div className="text-sm text-gray-600">All data encrypted at rest and in transit</div>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Backup Frequency</span>
                            <Badge>Daily</Badge>
                          </div>
                          <div className="text-sm text-gray-600">Automated backups with 30-day retention</div>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Compliance</span>
                            <Badge variant="outline">GDPR</Badge>
                          </div>
                          <div className="text-sm text-gray-600">Full GDPR compliance with data portability</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="billing" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <CreditCard className="h-5 w-5 mr-2" />
                          Current Plan
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-center p-6 border rounded-lg">
                          <div className="text-2xl font-bold capitalize mb-2">{selectedOrgForManagement.plan} Plan</div>
                          <div className="text-3xl font-bold text-blue-600 mb-4">
                            ${selectedOrgForManagement.plan === 'free' ? '0' : selectedOrgForManagement.plan === 'pro' ? '8' : selectedOrgForManagement.plan === 'business' ? '15' : '25'}
                            <span className="text-sm font-normal text-gray-600">/user/month</span>
                          </div>
                          <Badge className="mb-4">{selectedOrgForManagement.status === 'active' ? 'Active' : 'Suspended'}</Badge>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span>Members</span>
                            <span>{selectedOrgForManagement.members}/{selectedOrgForManagement.memberLimit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Storage Used</span>
                            <span>{selectedOrgForManagement.storageUsed}GB/{selectedOrgForManagement.storageLimit}GB</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Next Billing</span>
                            <span>Dec 22, 2025</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Receipt className="h-5 w-5 mr-2" />
                          Billing History
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <div className="font-medium">Nov 2025</div>
                              <div className="text-sm text-gray-600">{selectedOrgForManagement.plan} Plan - {selectedOrgForManagement.members} users</div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">${((selectedOrgForManagement.plan === 'pro' ? 8 : selectedOrgForManagement.plan === 'business' ? 15 : selectedOrgForManagement.plan === 'enterprise' ? 25 : 0) * (selectedOrgForManagement.members || 1)).toFixed(2)}</div>
                              <div className="text-sm text-green-600">Paid</div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <div className="font-medium">Oct 2025</div>
                              <div className="text-sm text-gray-600">{selectedOrgForManagement.plan} Plan - {selectedOrgForManagement.members} users</div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">${((selectedOrgForManagement.plan === 'pro' ? 8 : selectedOrgForManagement.plan === 'business' ? 15 : selectedOrgForManagement.plan === 'enterprise' ? 25 : 0) * (selectedOrgForManagement.members || 1)).toFixed(2)}</div>
                              <div className="text-sm text-green-600">Paid</div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <div className="font-medium">Sep 2025</div>
                              <div className="text-sm text-gray-600">{selectedOrgForManagement.plan} Plan - {selectedOrgForManagement.members} users</div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">${((selectedOrgForManagement.plan === 'pro' ? 8 : selectedOrgForManagement.plan === 'business' ? 15 : selectedOrgForManagement.plan === 'enterprise' ? 25 : 0) * (selectedOrgForManagement.members || 1)).toFixed(2)}</div>
                              <div className="text-sm text-green-600">Paid</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="support" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <MessageSquare className="h-5 w-5 mr-2" />
                          Support Tickets
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium">Login Issues</div>
                              <Badge>Open</Badge>
                            </div>
                            <div className="text-sm text-gray-600 mb-1">Users unable to access workspace</div>
                            <div className="text-xs text-gray-500">Created 2 hours ago</div>
                          </div>
                          <div className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium">File Upload Problem</div>
                              <Badge variant="secondary">In Progress</Badge>
                            </div>
                            <div className="text-sm text-gray-600 mb-1">Large files failing to upload</div>
                            <div className="text-xs text-gray-500">Created 1 day ago</div>
                          </div>
                          <div className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium">Integration Request</div>
                              <Badge variant="outline">Resolved</Badge>
                            </div>
                            <div className="text-sm text-gray-600 mb-1">Need Slack integration setup</div>
                            <div className="text-xs text-gray-500">Created 3 days ago</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <HelpCircle className="h-5 w-5 mr-2" />
                          Support Resources
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Button className="w-full justify-start" variant="outline">
                          <Phone className="h-4 w-4 mr-2" />
                          Schedule Support Call
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                          <Mail className="h-4 w-4 mr-2" />
                          Email Support Team
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                          <FileText className="h-4 w-4 mr-2" />
                          Documentation Center
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                          <Video className="h-4 w-4 mr-2" />
                          Video Tutorials
                        </Button>
                        <div className="pt-4 border-t">
                          <div className="text-sm font-medium mb-2">Plan Support Level</div>
                          <div className="flex items-center space-x-2">
                            <Badge className="bg-green-100 text-green-700">
                              {selectedOrgForManagement.plan === 'enterprise' ? 'Priority' : selectedOrgForManagement.plan === 'business' ? 'Business' : selectedOrgForManagement.plan === 'pro' ? 'Standard' : 'Basic'}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              {selectedOrgForManagement.plan === 'enterprise' ? '24/7 phone & email' : selectedOrgForManagement.plan === 'business' ? 'Business hours support' : selectedOrgForManagement.plan === 'pro' ? 'Email support' : 'Community forum'}
                            </span>
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

        {/* Edit Organization Modal */}
        {showEditOrgModal && selectedOrg && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Edit Organization: {selectedOrg.name}</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowEditOrgModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Organization Name</label>
                    <Input defaultValue={selectedOrg.name} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Domain</label>
                    <Input defaultValue={selectedOrg.domain} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Plan</label>
                  <Select defaultValue={selectedOrg.plan}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowEditOrgModal(false)}>Cancel</Button>
                  <Button onClick={() => {
                    toast({ title: "Organization Updated", description: "Changes will be available soon." });
                    setShowEditOrgModal(false);
                  }}>Save Changes</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Configure Limits Modal */}
        {showOrgLimitsModal && selectedOrg && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Configure Limits: {selectedOrg.name}</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowOrgLimitsModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Member Limit</label>
                    <Input type="number" defaultValue={selectedOrg.memberLimit} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Storage Limit (GB)</label>
                    <Input type="number" defaultValue={selectedOrg.storageLimit} />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowOrgLimitsModal(false)}>Cancel</Button>
                  <Button onClick={() => {
                    toast({ title: "Limits Updated", description: "Organization limits updated successfully." });
                    setShowOrgLimitsModal(false);
                  }}>Save Changes</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Modal */}
        {showAnalyticsModal && selectedOrg && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Analytics: {selectedOrg.name}</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowAnalyticsModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">247</div>
                    <div className="text-sm text-gray-600">Total Users</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">189</div>
                    <div className="text-sm text-gray-600">Active Today</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">45.2GB</div>
                    <div className="text-sm text-gray-600">Storage Used</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">98.5%</div>
                    <div className="text-sm text-gray-600">Uptime</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Messages Sent</span>
                        <span className="font-medium">1,247</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Files Uploaded</span>
                        <span className="font-medium">89</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Channels Created</span>
                        <span className="font-medium">23</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Security Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Login Attempts</span>
                        <span className="font-medium">456</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Failed Logins</span>
                        <span className="font-medium text-red-600">3</span>
                      </div>
                      <div className="flex justify-between">
                        <span>2FA Enabled</span>
                        <span className="font-medium text-green-600">78%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Quick Action Modals */}
        {showAddUserModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Add New User</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowAddUserModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">First Name</label>
                    <Input 
                      placeholder="Enter first name" 
                      value={newUserForm.firstName}
                      onChange={(e) => setNewUserForm({...newUserForm, firstName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Last Name</label>
                    <Input 
                      placeholder="Enter last name" 
                      value={newUserForm.lastName}
                      onChange={(e) => setNewUserForm({...newUserForm, lastName: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input 
                    type="email" 
                    placeholder="Enter email address" 
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({...newUserForm, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <Select value={newUserForm.role} onValueChange={(value: 'admin' | 'member' | 'guest') => setNewUserForm({...newUserForm, role: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="guest">Guest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button onClick={handleAddUser}>Add User</Button>
                  <Button variant="outline" onClick={() => {
                    setShowAddUserModal(false);
                    setNewUserForm({ email: '', firstName: '', lastName: '', role: 'member', status: 'active' });
                  }}>Cancel</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showBroadcastModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Broadcast Message</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowBroadcastModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Subject</label>
                  <Input placeholder="Enter message subject" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Message</label>
                  <textarea
                    className="w-full border rounded-md p-3 h-32 resize-none"
                    placeholder="Enter your broadcast message here..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Send To</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipients" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="admins">Admins Only</SelectItem>
                      <SelectItem value="members">Members Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button onClick={() => {
                    setShowBroadcastModal(false);
                    toast({ title: "Message Sent", description: "Broadcast message has been sent successfully." });
                  }}>Send Message</Button>
                  <Button variant="outline" onClick={() => setShowBroadcastModal(false)}>Cancel</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showManageSettingsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Organization Settings</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowManageSettingsModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">General Settings</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">File Uploads</div>
                      <div className="text-sm text-gray-600">Allow file sharing</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">External Apps</div>
                      <div className="text-sm text-gray-600">Enable integrations</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">Security Settings</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Two-Factor Auth</div>
                      <div className="text-sm text-gray-600">Require 2FA</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Session Timeout</div>
                      <div className="text-sm text-gray-600">Auto logout</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
              <div className="flex space-x-3 pt-6">
                <Button onClick={() => {
                  setShowManageSettingsModal(false);
                  toast({ title: "Settings Saved", description: "Organization settings have been updated." });
                }}>Save Changes</Button>
                <Button variant="outline" onClick={() => setShowManageSettingsModal(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        )}

        {showScreenSharingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Screen Sharing Controls</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowScreenSharingModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div className="text-center py-4">
                  <Eye className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                  <h4 className="font-medium mb-2">Screen Sharing Management</h4>
                  <p className="text-sm text-gray-600 mb-4">Configure screen sharing permissions and settings</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Allow Screen Sharing</div>
                      <div className="text-sm text-gray-600">Enable for all users</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Recording</div>
                      <div className="text-sm text-gray-600">Allow session recording</div>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Admin Override</div>
                      <div className="text-sm text-gray-600">Admin can join any session</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button onClick={() => {
                    setShowScreenSharingModal(false);
                    toast({ title: "Settings Updated", description: "Screen sharing settings have been saved." });
                  }}>Save Settings</Button>
                  <Button variant="outline" onClick={() => setShowScreenSharingModal(false)}>Cancel</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
