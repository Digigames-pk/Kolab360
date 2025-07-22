import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Settings, Users, Database, Zap, Shield, Headphones, Brain, Check, X, Crown, Sparkles } from 'lucide-react';
import type { PricingPlan, FeaturePermissions } from '@shared/schema';

interface PricingPlanManagerProps {
  onClose?: () => void;
}

const formatPrice = (cents: number): string => {
  return `$${(cents / 100).toFixed(2)}`;
};

const formatStorage = (mb: number): string => {
  if (mb === -1) return 'Unlimited';
  if (mb >= 1024) return `${(mb / 1024).toFixed(0)}GB`;
  return `${mb}MB`;
};

const formatLimit = (limit: number): string => {
  return limit === -1 ? 'Unlimited' : limit.toString();
};

export function PricingPlanManager({ onClose }: PricingPlanManagerProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch pricing plans
  const { data: plans, isLoading } = useQuery({
    queryKey: ['/api/pricing-plans'],
    queryFn: async () => {
      const response = await fetch('/api/pricing-plans', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch pricing plans');
      }
      return response.json() as Promise<PricingPlan[]>;
    },
  });

  // Initialize default plans mutation
  const initializeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/pricing-plans/initialize', {
        method: 'POST',
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to initialize pricing plans');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pricing-plans'] });
      toast({ title: "Success", description: "Default pricing plans initialized!" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to initialize pricing plans",
        variant: "destructive" 
      });
    }
  });

  // Delete plan mutation
  const deleteMutation = useMutation({
    mutationFn: async (planId: number) => {
      const response = await fetch(`/api/pricing-plans/${planId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to delete pricing plan');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pricing-plans'] });
      toast({ title: "Success", description: "Pricing plan deleted successfully!" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to delete pricing plan",
        variant: "destructive" 
      });
    }
  });

  const handleEdit = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (plan: PricingPlan) => {
    if (window.confirm(`Are you sure you want to delete the "${plan.displayName}" plan?`)) {
      deleteMutation.mutate(plan.id);
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free': return <Zap className="h-5 w-5 text-green-500" />;
      case 'starter': return <Users className="h-5 w-5 text-blue-500" />;
      case 'pro': return <Crown className="h-5 w-5 text-purple-500" />;
      case 'business': return <Database className="h-5 w-5 text-orange-500" />;
      case 'enterprise': return <Sparkles className="h-5 w-5 text-red-500" />;
      default: return <Settings className="h-5 w-5 text-gray-500" />;
    }
  };

  const getFeatureSummary = (features: any) => {
    if (!features || typeof features !== 'object') return 0;
    
    let enabledCount = 0;
    const countFeatures = (obj: any) => {
      for (const key in obj) {
        if (typeof obj[key] === 'boolean' && obj[key] === true) {
          enabledCount++;
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          countFeatures(obj[key]);
        }
      }
    };
    countFeatures(features);
    return enabledCount;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pricing Plan Management</h1>
          <p className="text-muted-foreground">Manage subscription plans and feature permissions</p>
        </div>
        <div className="flex gap-3">
          {(!plans || (plans as PricingPlan[]).length === 0) && (
            <Button
              onClick={() => initializeMutation.mutate()}
              disabled={initializeMutation.isPending}
              variant="outline"
            >
              <Settings className="h-4 w-4 mr-2" />
              Initialize Default Plans
            </Button>
          )}
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle>Create New Pricing Plan</DialogTitle>
                <DialogDescription>
                  Configure a new subscription plan with custom features and limits
                </DialogDescription>
              </DialogHeader>
              <PricingPlanForm 
                onSuccess={() => {
                  setIsCreateModalOpen(false);
                  queryClient.invalidateQueries({ queryKey: ['/api/pricing-plans'] });
                }} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Plans Grid */}
      {plans && (plans as PricingPlan[]).length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(plans as PricingPlan[]).map((plan) => (
            <Card key={plan.id} className="relative overflow-hidden">
              {plan.name === 'enterprise' && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-600 to-pink-600 text-white px-3 py-1 text-xs font-semibold rounded-bl-lg">
                  POPULAR
                </div>
              )}
              
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getPlanIcon(plan.name)}
                    <CardTitle className="text-xl">{plan.displayName}</CardTitle>
                  </div>
                  <Badge variant={plan.isActive ? 'default' : 'secondary'}>
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{formatPrice(plan.price)}</span>
                  <span className="text-muted-foreground">/{plan.billingPeriod}</span>
                </div>
                <CardDescription className="text-sm">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Key Limits */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Users:</span>
                    <span className="ml-1 font-medium">{formatLimit(plan.maxUsers || 0)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Storage:</span>
                    <span className="ml-1 font-medium">{formatStorage(plan.maxStorage || 0)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Workspaces:</span>
                    <span className="ml-1 font-medium">{formatLimit(plan.maxWorkspaces || 0)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Features:</span>
                    <span className="ml-1 font-medium">{getFeatureSummary(plan.features)} enabled</span>
                  </div>
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(plan)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(plan)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
            <Settings className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Pricing Plans Found</h3>
          <p className="text-muted-foreground mb-4">
            Initialize default plans or create your first custom pricing plan.
          </p>
          <Button
            onClick={() => initializeMutation.mutate()}
            disabled={initializeMutation.isPending}
          >
            <Settings className="h-4 w-4 mr-2" />
            Initialize Default Plans
          </Button>
        </Card>
      )}

      {/* Edit Plan Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Edit Pricing Plan</DialogTitle>
            <DialogDescription>
              Modify plan settings, features, and limits
            </DialogDescription>
          </DialogHeader>
          {selectedPlan && (
            <PricingPlanForm 
              plan={selectedPlan}
              onSuccess={() => {
                setIsEditModalOpen(false);
                setSelectedPlan(null);
                queryClient.invalidateQueries({ queryKey: ['/api/pricing-plans'] });
              }} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface PricingPlanFormProps {
  plan?: PricingPlan;
  onSuccess: () => void;
}

function PricingPlanForm({ plan, onSuccess }: PricingPlanFormProps) {
  const [formData, setFormData] = useState({
    name: plan?.name || '',
    displayName: plan?.displayName || '',
    description: plan?.description || '',
    price: plan?.price || 0,
    billingPeriod: plan?.billingPeriod || 'monthly',
    maxUsers: plan?.maxUsers || -1,
    maxStorage: plan?.maxStorage || 1024,
    maxWorkspaces: plan?.maxWorkspaces || 1,
    maxChannelsPerWorkspace: plan?.maxChannelsPerWorkspace || 10,
    maxFileSize: plan?.maxFileSize || 10,
    maxAPICallsPerMonth: plan?.maxAPICallsPerMonth || 1000,
    messageHistoryDays: plan?.messageHistoryDays || 30,
    maxVideoCallDuration: plan?.maxVideoCallDuration || 60,
    isActive: plan?.isActive ?? true,
    isCustom: plan?.isCustom ?? true,
    sortOrder: plan?.sortOrder || 0
  });

  const [features, setFeatures] = useState<FeaturePermissions>({
    messaging: true,
    directMessages: true,
    fileSharing: true,
    voiceCalls: false,
    videoCalls: false,
    screenSharing: false,
    channels: {
      enabled: true,
      maxChannels: 5,
      privateChannels: false,
    },
    workspaces: {
      enabled: true,
      maxWorkspaces: 1,
      customBranding: false,
    },
    tasks: {
      enabled: true,
      kanbanView: true,
      calendar: false,
      timeTracking: false,
      customFields: false,
    },
    integrations: {
      enabled: false,
      maxIntegrations: 0,
      customIntegrations: false,
    },
    analytics: {
      enabled: false,
      basicReports: false,
      advancedReports: false,
      exportData: false,
      realTimeAnalytics: false,
    },
    security: {
      twoFactorAuth: false,
      singleSignOn: false,
      auditLogs: false,
      dataRetentionControls: false,
      complianceReporting: false,
    },
    support: {
      emailSupport: true,
      chatSupport: false,
      phoneSupport: false,
      prioritySupport: false,
      dedicatedAccountManager: false,
    },
    ai: {
      enabled: false,
      smartSuggestions: false,
      sentimentAnalysis: false,
      autoSummarization: false,
      languageTranslation: false,
      customAIModels: false,
    }
  });

  const { toast } = useToast();

  useEffect(() => {
    if (plan?.features) {
      try {
        const planFeatures = typeof plan.features === 'string' 
          ? JSON.parse(plan.features) 
          : plan.features;
        setFeatures({ ...features, ...planFeatures });
      } catch (error) {
        console.error('Error parsing plan features:', error);
      }
    }
  }, [plan]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = plan ? `/api/pricing-plans/${plan.id}` : '/api/pricing-plans';
      const method = plan ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...data,
          features: features
        })
      });
      if (!response.ok) {
        throw new Error(`Failed to ${plan ? 'update' : 'create'} pricing plan`);
      }
      return response.json();
    },
    onSuccess: () => {
      toast({ 
        title: "Success", 
        description: `Pricing plan ${plan ? 'updated' : 'created'} successfully!` 
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || `Failed to ${plan ? 'update' : 'create'} pricing plan`,
        variant: "destructive" 
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <ScrollArea className="max-h-[70vh] pr-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="limits">Limits</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Plan Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., pro"
                  required
                />
              </div>
              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                  placeholder="e.g., Professional"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Brief description of the plan..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price (cents)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: parseInt(e.target.value) || 0})}
                  placeholder="1500 for $15.00"
                />
              </div>
              <div>
                <Label htmlFor="billingPeriod">Billing Period</Label>
                <select
                  id="billingPeriod"
                  value={formData.billingPeriod}
                  onChange={(e) => setFormData({...formData, billingPeriod: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="limits" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxUsers">Max Users (-1 = unlimited)</Label>
                <Input
                  id="maxUsers"
                  type="number"
                  value={formData.maxUsers}
                  onChange={(e) => setFormData({...formData, maxUsers: parseInt(e.target.value) || -1})}
                />
              </div>
              <div>
                <Label htmlFor="maxStorage">Max Storage (MB)</Label>
                <Input
                  id="maxStorage"
                  type="number"
                  value={formData.maxStorage}
                  onChange={(e) => setFormData({...formData, maxStorage: parseInt(e.target.value) || 1024})}
                />
              </div>
              <div>
                <Label htmlFor="maxWorkspaces">Max Workspaces</Label>
                <Input
                  id="maxWorkspaces"
                  type="number"
                  value={formData.maxWorkspaces}
                  onChange={(e) => setFormData({...formData, maxWorkspaces: parseInt(e.target.value) || 1})}
                />
              </div>
              <div>
                <Label htmlFor="maxChannelsPerWorkspace">Max Channels per Workspace</Label>
                <Input
                  id="maxChannelsPerWorkspace"
                  type="number"
                  value={formData.maxChannelsPerWorkspace}
                  onChange={(e) => setFormData({...formData, maxChannelsPerWorkspace: parseInt(e.target.value) || 10})}
                />
              </div>
              <div>
                <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                <Input
                  id="maxFileSize"
                  type="number"
                  value={formData.maxFileSize}
                  onChange={(e) => setFormData({...formData, maxFileSize: parseInt(e.target.value) || 10})}
                />
              </div>
              <div>
                <Label htmlFor="maxAPICallsPerMonth">Max API Calls per Month</Label>
                <Input
                  id="maxAPICallsPerMonth"
                  type="number"
                  value={formData.maxAPICallsPerMonth}
                  onChange={(e) => setFormData({...formData, maxAPICallsPerMonth: parseInt(e.target.value) || 1000})}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            {/* Core Communication Features */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Communication Features
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {['messaging', 'directMessages', 'fileSharing', 'voiceCalls', 'videoCalls', 'screenSharing'].map((feature) => (
                  <div key={feature} className="flex items-center justify-between">
                    <Label htmlFor={feature} className="text-sm">
                      {feature.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                    </Label>
                    <Switch
                      id={feature}
                      checked={features[feature as keyof FeaturePermissions] as boolean}
                      onCheckedChange={(checked) => 
                        setFeatures({...features, [feature]: checked})
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Analytics Features */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Database className="h-4 w-4" />
                Analytics Features
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(features.analytics).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label htmlFor={`analytics-${key}`} className="text-sm">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                    </Label>
                    <Switch
                      id={`analytics-${key}`}
                      checked={value as boolean}
                      onCheckedChange={(checked) => 
                        setFeatures({
                          ...features, 
                          analytics: { ...features.analytics, [key]: checked }
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Security Features */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security Features
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(features.security).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label htmlFor={`security-${key}`} className="text-sm">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                    </Label>
                    <Switch
                      id={`security-${key}`}
                      checked={value as boolean}
                      onCheckedChange={(checked) => 
                        setFeatures({
                          ...features, 
                          security: { ...features.security, [key]: checked }
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* AI Features */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Brain className="h-4 w-4" />
                AI Features
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(features.ai).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label htmlFor={`ai-${key}`} className="text-sm">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                    </Label>
                    <Switch
                      id={`ai-${key}`}
                      checked={value as boolean}
                      onCheckedChange={(checked) => 
                        setFeatures({
                          ...features, 
                          ai: { ...features.ai, [key]: checked }
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({...formData, sortOrder: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="isActive">Plan Active</Label>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="isCustom">Custom Plan</Label>
                  <Switch
                    id="isCustom"
                    checked={formData.isCustom}
                    onCheckedChange={(checked) => setFormData({...formData, isCustom: checked})}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onSuccess}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? 'Saving...' : (plan ? 'Update Plan' : 'Create Plan')}
          </Button>
        </div>
      </form>
    </ScrollArea>
  );
}