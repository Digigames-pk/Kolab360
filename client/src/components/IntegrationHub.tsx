import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Zap, 
  Github, 
  Calendar, 
  Mail, 
  Database, 
  Folder, 
  Users, 
  Phone, 
  Video, 
  Image, 
  FileText, 
  Briefcase,
  Cloud,
  Settings,
  Plus,
  Check,
  Star,
  Download,
  Globe,
  MessageSquare,
  Palette,
  Bot,
  Camera,
  Mic,
  Clock,
  Heart,
  Target,
  Filter,
  Search,
  Link,
  Shield,
  Key,
  Workflow,
  AlertCircle,
  CheckCircle,
  Brain
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: 'productivity' | 'development' | 'communication' | 'storage' | 'design' | 'crm' | 'automation' | 'analytics' | 'ai';
  isConnected: boolean;
  isPremium: boolean;
  setupComplexity: 'easy' | 'medium' | 'advanced';
  features: string[];
  webhookUrl?: string;
  apiKey?: string;
  authUrl?: string;
  popular: boolean;
  rating: number;
  users: string;
  requiredSecrets?: string[];
  status?: 'connected' | 'disconnected' | 'partial';
}

const getBaseIntegrations = (): Integration[] => [
  // AI Services - Real integrations with working APIs
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'Advanced AI assistance with GPT models, image generation, and audio transcription',
    icon: Bot,
    category: 'ai',
    isConnected: false,
    isPremium: false,
    setupComplexity: 'easy',
    features: ['Text generation', 'Image generation', 'Audio transcription', 'Vision analysis', 'Embeddings'],
    requiredSecrets: ['OPENAI_API_KEY'],
    popular: true,
    rating: 4.9,
    users: '1.5M+'
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    description: 'Claude AI for advanced reasoning, analysis, and multimodal understanding',
    icon: Brain,
    category: 'ai',
    isConnected: false,
    isPremium: false,
    setupComplexity: 'easy',
    features: ['Text generation', 'Sentiment analysis', 'Image analysis', 'Code review'],
    requiredSecrets: ['ANTHROPIC_API_KEY'],
    popular: true,
    rating: 4.8,
    users: '800K+'
  },
  {
    id: 'google',
    name: 'Google Gemini',
    description: 'Google\'s multimodal AI for text generation, image analysis, and translation',
    icon: Zap,
    category: 'ai',
    isConnected: false,
    isPremium: false,
    setupComplexity: 'easy',
    features: ['Text generation', 'Image analysis', 'Translation', 'Summarization'],
    requiredSecrets: ['GEMINI_API_KEY'],
    popular: true,
    rating: 4.7,
    users: '600K+'
  },
  
  // Development & Version Control
  {
    id: 'github',
    name: 'GitHub',
    description: 'Connect repositories, track commits, and manage pull requests directly in your workspace',
    icon: Github,
    category: 'development',
    isConnected: false,
    isPremium: false,
    setupComplexity: 'easy',
    features: ['Repository sync', 'Commit tracking', 'PR notifications', 'Issue management', 'Webhooks'],
    requiredSecrets: ['GITHUB_TOKEN'],
    popular: true,
    rating: 4.9,
    users: '2.1M+'
  },
  
  // Communication & Team Tools
  {
    id: 'slack',
    name: 'Slack',
    description: 'Send notifications and messages to Slack channels from your workspace',
    icon: MessageSquare,
    category: 'communication',
    isConnected: false,
    isPremium: false,
    setupComplexity: 'easy',
    features: ['Send messages', 'Channel notifications', 'Rich message formatting', 'Bot integration'],
    requiredSecrets: ['SLACK_BOT_TOKEN', 'SLACK_CHANNEL_ID'],
    popular: true,
    rating: 4.8,
    users: '1.2M+'
  },
  
  // Productivity Tools
  {
    id: 'notion',
    name: 'Notion',
    description: 'Sync tasks, notes, and databases with your Notion workspace',
    icon: FileText,
    category: 'productivity',
    isConnected: false,
    isPremium: false,
    setupComplexity: 'medium',
    features: ['Database sync', 'Page creation', 'Task integration', 'Content management'],
    requiredSecrets: ['NOTION_INTEGRATION_SECRET', 'NOTION_PAGE_URL'],
    popular: true,
    rating: 4.6,
    users: '900K+'
  },
  
  // Payment Processing
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Process payments, manage subscriptions, and track customer data',
    icon: Database,
    category: 'automation',
    isConnected: false,
    isPremium: false,
    setupComplexity: 'medium',
    features: ['Payment processing', 'Subscription management', 'Customer tracking', 'Billing automation'],
    requiredSecrets: ['STRIPE_SECRET_KEY', 'VITE_STRIPE_PUBLIC_KEY'],
    popular: true,
    rating: 4.7,
    users: '800K+'
  },

  // Project Management & Productivity
  {
    id: 'monday',
    name: 'Monday.com',
    description: 'Sync tasks, projects, and team workflows with Monday.com boards',
    icon: Target,
    category: 'productivity',
    isConnected: false,
    isPremium: true,
    setupComplexity: 'medium',
    features: ['Task sync', 'Board integration', 'Status updates', 'Time tracking'],
    popular: true,
    rating: 4.6,
    users: '152K+'
  },
  {
    id: 'trello',
    name: 'Trello',
    description: 'Two-way sync with Trello boards and cards for seamless project management',
    icon: Briefcase,
    category: 'productivity',
    isConnected: false,
    isPremium: false,
    setupComplexity: 'easy',
    features: ['Board sync', 'Card updates', 'List management', 'Due date tracking'],
    popular: true,
    rating: 4.5,
    users: '420K+'
  },

  // Calendar & Scheduling
  {
    id: 'calendly',
    name: 'Calendly',
    description: 'Schedule meetings and sync calendar events with team availability',
    icon: Calendar,
    category: 'productivity',
    isConnected: false,
    isPremium: false,
    setupComplexity: 'easy',
    features: ['Meeting scheduling', 'Availability sync', 'Event notifications', 'Buffer time management'],
    popular: true,
    rating: 4.8,
    users: '320K+'
  },
  {
    id: 'outlook-calendar',
    name: 'Outlook Calendar',
    description: 'Sync Microsoft Outlook calendar events and meeting schedules',
    icon: Clock,
    category: 'productivity',
    isConnected: false,
    isPremium: false,
    setupComplexity: 'medium',
    features: ['Calendar sync', 'Meeting reminders', 'Event creation', 'Availability status'],
    popular: true,
    rating: 4.4,
    users: '1.2M+'
  },

  // CRM & Sales
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Connect customer data, leads, and sales pipeline with your team workspace',
    icon: Database,
    category: 'crm',
    isConnected: false,
    isPremium: true,
    setupComplexity: 'advanced',
    features: ['Lead management', 'Contact sync', 'Pipeline tracking', 'Opportunity updates'],
    popular: true,
    rating: 4.3,
    users: '180K+'
  },
  {
    id: 'zoho-crm',
    name: 'Zoho CRM',
    description: 'Integrate Zoho CRM contacts, deals, and sales activities',
    icon: Users,
    category: 'crm',
    isConnected: false,
    isPremium: true,
    setupComplexity: 'medium',
    features: ['Contact management', 'Deal tracking', 'Sales automation', 'Analytics'],
    popular: false,
    rating: 4.2,
    users: '65K+'
  },

  // Marketing & Email
  {
    id: 'active-campaign',
    name: 'ActiveCampaign',
    description: 'Sync email campaigns, automation workflows, and customer engagement data',
    icon: Mail,
    category: 'automation',
    isConnected: false,
    isPremium: true,
    setupComplexity: 'medium',
    features: ['Email campaigns', 'Automation triggers', 'Contact segmentation', 'Performance tracking'],
    popular: false,
    rating: 4.5,
    users: '95K+'
  },

  // Cloud Storage
  {
    id: 'dropbox',
    name: 'Dropbox',
    description: 'Access and share Dropbox files directly within your workspace channels',
    icon: Cloud,
    category: 'storage',
    isConnected: false,
    isPremium: false,
    setupComplexity: 'easy',
    features: ['File sync', 'Shared folders', 'Version history', 'Link sharing'],
    popular: true,
    rating: 4.6,
    users: '750K+'
  },
  {
    id: 'box',
    name: 'Box',
    description: 'Enterprise file storage and collaboration with advanced security features',
    icon: Folder,
    category: 'storage',
    isConnected: false,
    isPremium: true,
    setupComplexity: 'medium',
    features: ['Secure file sharing', 'Enterprise controls', 'Collaboration tools', 'Version management'],
    popular: false,
    rating: 4.1,
    users: '120K+'
  },

  // Communication & Video
  {
    id: 'teams-calls',
    name: 'Microsoft Teams',
    description: 'Start Teams video calls and sync meeting schedules with your workspace',
    icon: Video,
    category: 'communication',
    isConnected: false,
    isPremium: false,
    setupComplexity: 'easy',
    features: ['Video calling', 'Screen sharing', 'Meeting recording', 'Chat integration'],
    popular: true,
    rating: 4.3,
    users: '280K+'
  },

  // Design & Creative
  {
    id: 'figma',
    name: 'Figma',
    description: 'Share design files, prototypes, and collaborate on Figma projects',
    icon: Palette,
    category: 'design',
    isConnected: false,
    isPremium: false,
    setupComplexity: 'easy',
    features: ['Design file sharing', 'Prototype embedding', 'Version tracking', 'Comment sync'],
    popular: true,
    rating: 4.8,
    users: '190K+'
  },

  // Fun & Engagement
  {
    id: 'giphy',
    name: 'GIPHY',
    description: 'Add animated GIFs and stickers to your team conversations',
    icon: Image,
    category: 'communication',
    isConnected: false,
    isPremium: false,
    setupComplexity: 'easy',
    features: ['GIF search', 'Sticker library', 'Custom reactions', 'Trending content'],
    popular: true,
    rating: 4.7,
    users: '850K+'
  },
  {
    id: 'poly',
    name: 'Poly',
    description: '3D model library integration for creative and design projects',
    icon: Camera,
    category: 'design',
    isConnected: false,
    isPremium: true,
    setupComplexity: 'medium',
    features: ['3D model browser', 'Asset download', 'Preview integration', 'Search filters'],
    popular: false,
    rating: 4.0,
    users: '25K+'
  }
];

const categories = [
  { id: 'all', name: 'All Integrations', icon: Globe },
  { id: 'ai', name: 'AI & Machine Learning', icon: Bot },
  { id: 'productivity', name: 'Productivity', icon: Target },
  { id: 'development', name: 'Development', icon: Github },
  { id: 'communication', name: 'Communication', icon: MessageSquare },
  { id: 'storage', name: 'Storage', icon: Cloud },
  { id: 'design', name: 'Design', icon: Palette },
  { id: 'crm', name: 'CRM', icon: Users },
  { id: 'automation', name: 'Automation', icon: Workflow },
];

interface IntegrationHubProps {
  onIntegrationToggle?: (integrationId: string, isConnected: boolean) => void;
}

export function IntegrationHub({ onIntegrationToggle }: IntegrationHubProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [integrations, setIntegrations] = useState<Integration[]>(getBaseIntegrations());
  const [integrationStatus, setIntegrationStatus] = useState<any>({});
  const [showConfigDialog, setShowConfigDialog] = useState<string | null>(null);
  const [configData, setConfigData] = useState<{[key: string]: any}>({});
  const [loading, setLoading] = useState(true);

  // Fetch integration status from API
  useEffect(() => {
    const fetchIntegrationStatus = async () => {
      try {
        const response = await apiRequest('GET', '/api/integrations/status');
        setIntegrationStatus(response);
        
        // Update integration connection status
        setIntegrations(prev => prev.map(integration => ({
          ...integration,
          isConnected: getConnectionStatus(integration.id, response),
          status: getDetailedStatus(integration.id, response)
        })));
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch integration status:', error);
        setLoading(false);
      }
    };

    fetchIntegrationStatus();
  }, []);

  const getConnectionStatus = (integrationId: string, status: any): boolean => {
    switch (integrationId) {
      case 'openai':
        return status.openai?.connected || false;
      case 'anthropic':
        return status.anthropic?.connected || false;
      case 'google':
        return status.google?.geminiConnected || false;
      case 'github':
        return status.github?.connected || false;
      case 'slack':
        return status.slack?.connected && status.slack?.hasChannel || false;
      case 'notion':
        return status.notion?.connected && status.notion?.hasPageUrl || false;
      case 'stripe':
        return status.stripe?.connected && status.stripe?.hasPublicKey || false;
      default:
        return false;
    }
  };

  const getDetailedStatus = (integrationId: string, status: any): 'connected' | 'disconnected' | 'partial' => {
    switch (integrationId) {
      case 'slack':
        if (status.slack?.connected && status.slack?.hasChannel) return 'connected';
        if (status.slack?.connected && !status.slack?.hasChannel) return 'partial';
        return 'disconnected';
      case 'notion':
        if (status.notion?.connected && status.notion?.hasPageUrl) return 'connected';
        if (status.notion?.connected && !status.notion?.hasPageUrl) return 'partial';
        return 'disconnected';
      case 'stripe':
        if (status.stripe?.connected && status.stripe?.hasPublicKey) return 'connected';
        if (status.stripe?.connected && !status.stripe?.hasPublicKey) return 'partial';
        return 'disconnected';
      default:
        return getConnectionStatus(integrationId, status) ? 'connected' : 'disconnected';
    }
  };

  const filteredIntegrations = integrations.filter((integration) => {
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleConnect = (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId);
    if (!integration) return;

    // For real integrations, show configuration dialog to enter API keys
    if (integration.requiredSecrets && integration.requiredSecrets.length > 0) {
      setShowConfigDialog(integrationId);
    } else {
      // For non-API integrations, just toggle
      const isCurrentlyConnected = integration.isConnected;
      setIntegrations(prev => prev.map(int => 
        int.id === integrationId 
          ? { ...int, isConnected: !isCurrentlyConnected }
          : int
      ));
      onIntegrationToggle?.(integrationId, !isCurrentlyConnected);
    }
  };

  const handleConfigSave = () => {
    if (!showConfigDialog) return;
    
    // For now, just mark as connected - in a real app, you'd save the API keys
    setIntegrations(prev => prev.map(int => 
      int.id === showConfigDialog 
        ? { ...int, isConnected: true, status: 'connected' }
        : int
    ));
    onIntegrationToggle?.(showConfigDialog, true);
    setShowConfigDialog(null);
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const selectedIntegration = integrations.find(i => i.id === showConfigDialog);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Integration Hub</h2>
          <p className="text-muted-foreground">Connect your favorite tools and services</p>
        </div>
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          {integrations.filter(i => i.isConnected).length} Connected
        </Badge>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search integrations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                <div className="flex items-center gap-2">
                  <category.icon className="h-4 w-4" />
                  {category.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Popular Integrations */}
      {selectedCategory === 'all' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Popular Integrations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.filter(i => i.popular).slice(0, 6).map((integration) => (
              <Card key={integration.id} className="relative hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <integration.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{integration.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="text-xs text-muted-foreground">{integration.rating}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{integration.users}</span>
                        </div>
                      </div>
                    </div>
                    {integration.isPremium && (
                      <Badge variant="secondary" className="text-xs">Pro</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-4">{integration.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getComplexityColor(integration.setupComplexity)}`} />
                      <span className="text-xs text-muted-foreground capitalize">{integration.setupComplexity} setup</span>
                    </div>
                    <Button
                      size="sm"
                      variant={integration.isConnected ? "secondary" : "default"}
                      onClick={() => handleConnect(integration.id)}
                    >
                      {integration.isConnected ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Connected
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Connect
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Integrations */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          {selectedCategory === 'all' ? 'All Integrations' : 
           categories.find(c => c.id === selectedCategory)?.name}
          <span className="text-muted-foreground ml-2">({filteredIntegrations.length})</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredIntegrations.map((integration) => (
            <Card key={integration.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                    <integration.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{integration.name}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {categories.find(c => c.id === integration.category)?.name}
                          </Badge>
                          {integration.isPremium && (
                            <Badge variant="secondary" className="text-xs">Pro</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {integration.status === 'connected' && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        {integration.status === 'partial' && (
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                        )}
                        <Switch
                          checked={integration.isConnected}
                          onCheckedChange={() => handleConnect(integration.id)}
                        />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{integration.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {integration.features.slice(0, 3).map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {integration.features.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{integration.features.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Configuration Dialog */}
      <Dialog open={!!showConfigDialog} onOpenChange={() => setShowConfigDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedIntegration && <selectedIntegration.icon className="h-6 w-6 text-primary" />}
              Configure {selectedIntegration?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedIntegration && (
            <div className="space-y-6">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm">{selectedIntegration.description}</p>
              </div>

              <Tabs defaultValue="setup" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="setup">Setup</TabsTrigger>
                  <TabsTrigger value="features">Features</TabsTrigger>
                  <TabsTrigger value="permissions">Permissions</TabsTrigger>
                </TabsList>

                <TabsContent value="setup" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="api-key">API Key</Label>
                      <Input
                        id="api-key"
                        placeholder="Enter your API key"
                        value={configData.apiKey || ''}
                        onChange={(e) => setConfigData({...configData, apiKey: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="webhook-url">Webhook URL</Label>
                      <Input
                        id="webhook-url"
                        placeholder="https://your-app.com/webhooks"
                        value={configData.webhookUrl || ''}
                        onChange={(e) => setConfigData({...configData, webhookUrl: e.target.value})}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="features" className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Available Features</h4>
                    {selectedIntegration.features.map((feature, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{feature}</span>
                        <Switch defaultChecked />
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="permissions" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Read access to workspace data</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">Write access to channels and messages</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Admin access to workspace settings</span>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex items-center justify-between pt-4 border-t">
                <Button variant="outline" onClick={() => setShowConfigDialog(null)}>
                  Cancel
                </Button>
                <Button onClick={handleConfigSave}>
                  <Key className="h-4 w-4 mr-2" />
                  Connect Integration
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}