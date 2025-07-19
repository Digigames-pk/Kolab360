import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Settings, 
  Calendar, 
  Video, 
  Zap, 
  FileText, 
  Cloud, 
  Users, 
  Monitor,
  Globe,
  GitBranch,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  Plus,
  Trash2,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Integration {
  id: string;
  service: string;
  serviceName: string;
  isEnabled: boolean;
  config: any;
  lastSyncAt: string | null;
  createdAt: string;
}

interface ServiceDefinition {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: "calendar" | "video" | "automation" | "productivity" | "storage" | "communication";
  features: string[];
  authType: "oauth" | "api_key" | "webhook";
  configFields: Array<{
    key: string;
    label: string;
    type: "text" | "password" | "url" | "select" | "textarea";
    required: boolean;
    options?: string[];
    placeholder?: string;
  }>;
}

const services: ServiceDefinition[] = [
  {
    id: "google_calendar",
    name: "Google Calendar",
    description: "Sync events and meetings with Google Calendar",
    icon: <Calendar className="h-6 w-6 text-blue-600" />,
    category: "calendar",
    features: ["Two-way sync", "Event creation", "Meeting notifications"],
    authType: "oauth",
    configFields: [
      { key: "sync_direction", label: "Sync Direction", type: "select", required: true, options: ["bidirectional", "import_only", "export_only"] },
      { key: "calendar_id", label: "Calendar ID", type: "text", required: false, placeholder: "Primary calendar" }
    ]
  },
  {
    id: "apple_calendar",
    name: "Apple Calendar",
    description: "Integrate with Apple Calendar and iCloud",
    icon: <Calendar className="h-6 w-6 text-gray-800" />,
    category: "calendar",
    features: ["Event sync", "Reminder integration", "iCloud sync"],
    authType: "api_key",
    configFields: [
      { key: "icloud_username", label: "iCloud Username", type: "text", required: true },
      { key: "app_password", label: "App-Specific Password", type: "password", required: true }
    ]
  },
  {
    id: "zoom",
    name: "Zoom",
    description: "Create and manage Zoom meetings directly",
    icon: <Video className="h-6 w-6 text-blue-500" />,
    category: "video",
    features: ["Meeting creation", "Automatic scheduling", "Recording management"],
    authType: "oauth",
    configFields: [
      { key: "default_duration", label: "Default Meeting Duration (minutes)", type: "text", required: false, placeholder: "60" },
      { key: "auto_record", label: "Auto-record meetings", type: "select", required: false, options: ["none", "local", "cloud"] }
    ]
  },
  {
    id: "microsoft_teams",
    name: "Microsoft Teams",
    description: "Integrate with Microsoft Teams for meetings and chat",
    icon: <Users className="h-6 w-6 text-purple-600" />,
    category: "video",
    features: ["Teams meetings", "Chat integration", "File sharing"],
    authType: "oauth",
    configFields: [
      { key: "team_id", label: "Default Team ID", type: "text", required: false },
      { key: "channel_prefix", label: "Channel Name Prefix", type: "text", required: false, placeholder: "kolab-" }
    ]
  },
  {
    id: "google_meet",
    name: "Google Meet",
    description: "Schedule Google Meet video conferences",
    icon: <Video className="h-6 w-6 text-green-600" />,
    category: "video",
    features: ["Meet creation", "Calendar integration", "Recording access"],
    authType: "oauth",
    configFields: [
      { key: "default_duration", label: "Default Duration (minutes)", type: "text", required: false, placeholder: "60" }
    ]
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Automate workflows with 5000+ apps",
    icon: <Zap className="h-6 w-6 text-orange-500" />,
    category: "automation",
    features: ["Workflow automation", "Trigger events", "Multi-app integration"],
    authType: "webhook",
    configFields: [
      { key: "webhook_url", label: "Zapier Webhook URL", type: "url", required: true },
      { key: "auth_token", label: "Authentication Token", type: "password", required: true }
    ]
  },
  {
    id: "trello",
    name: "Trello",
    description: "Sync tasks and boards with Trello",
    icon: <FileText className="h-6 w-6 text-blue-700" />,
    category: "productivity",
    features: ["Board sync", "Card creation", "Task management"],
    authType: "api_key",
    configFields: [
      { key: "api_key", label: "Trello API Key", type: "password", required: true },
      { key: "token", label: "Trello Token", type: "password", required: true },
      { key: "board_id", label: "Default Board ID", type: "text", required: false }
    ]
  },
  {
    id: "asana",
    name: "Asana",
    description: "Synchronize projects and tasks with Asana",
    icon: <CheckCircle className="h-6 w-6 text-red-500" />,
    category: "productivity",
    features: ["Project sync", "Task assignment", "Timeline integration"],
    authType: "oauth",
    configFields: [
      { key: "workspace_id", label: "Asana Workspace ID", type: "text", required: true },
      { key: "default_project", label: "Default Project ID", type: "text", required: false }
    ]
  },
  {
    id: "google_drive",
    name: "Google Drive",
    description: "Store and share files via Google Drive",
    icon: <Cloud className="h-6 w-6 text-blue-500" />,
    category: "storage",
    features: ["File backup", "Real-time collaboration", "Version control"],
    authType: "oauth",
    configFields: [
      { key: "folder_id", label: "Default Folder ID", type: "text", required: false },
      { key: "auto_backup", label: "Auto-backup uploads", type: "select", required: false, options: ["disabled", "daily", "weekly"] }
    ]
  },
  {
    id: "onedrive",
    name: "OneDrive",
    description: "Microsoft OneDrive file storage and sharing",
    icon: <Cloud className="h-6 w-6 text-blue-600" />,
    category: "storage",
    features: ["File synchronization", "Office integration", "Shared folders"],
    authType: "oauth",
    configFields: [
      { key: "folder_path", label: "Default Folder Path", type: "text", required: false, placeholder: "/Kolab360" }
    ]
  },
  {
    id: "loom",
    name: "Loom",
    description: "Record and share video messages",
    icon: <Monitor className="h-6 w-6 text-purple-500" />,
    category: "video",
    features: ["Screen recording", "Video messaging", "Automatic sharing"],
    authType: "api_key",
    configFields: [
      { key: "api_token", label: "Loom API Token", type: "password", required: true },
      { key: "workspace_id", label: "Workspace ID", type: "text", required: false }
    ]
  }
];

export function IntegrationCenter() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceDefinition | null>(null);
  const [configData, setConfigData] = useState<Record<string, string>>({});

  // Fetch existing integrations
  const { data: integrations = [], isLoading } = useQuery({
    queryKey: ["/api/integrations"],
    enabled: !!user,
  });

  // Create/Update integration mutation
  const createIntegrationMutation = useMutation({
    mutationFn: async (data: { service: string; serviceName: string; config: any }) => {
      const response = await apiRequest("POST", "/api/integrations", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      setConfigDialogOpen(false);
      setConfigData({});
    },
  });

  // Toggle integration mutation
  const toggleIntegrationMutation = useMutation({
    mutationFn: async ({ id, isEnabled }: { id: string; isEnabled: boolean }) => {
      const response = await apiRequest("PATCH", `/api/integrations/${id}`, { isEnabled });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
    },
  });

  // Delete integration mutation
  const deleteIntegrationMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/integrations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
    },
  });

  // Sync integration mutation
  const syncIntegrationMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("POST", `/api/integrations/${id}/sync`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
    },
  });

  const getIntegrationForService = (serviceId: string) => {
    return integrations.find((int: Integration) => int.service === serviceId);
  };

  const handleConfigureService = (service: ServiceDefinition) => {
    setSelectedService(service);
    const existing = getIntegrationForService(service.id);
    if (existing) {
      setConfigData(existing.config || {});
    } else {
      setConfigData({});
    }
    setConfigDialogOpen(true);
  };

  const handleSaveConfiguration = () => {
    if (!selectedService) return;

    createIntegrationMutation.mutate({
      service: selectedService.id,
      serviceName: selectedService.name,
      config: configData,
    });
  };

  const categories = [
    { id: "all", name: "All Services", icon: <Settings className="h-4 w-4" /> },
    { id: "calendar", name: "Calendar", icon: <Calendar className="h-4 w-4" /> },
    { id: "video", name: "Video", icon: <Video className="h-4 w-4" /> },
    { id: "automation", name: "Automation", icon: <Zap className="h-4 w-4" /> },
    { id: "productivity", name: "Productivity", icon: <FileText className="h-4 w-4" /> },
    { id: "storage", name: "Storage", icon: <Cloud className="h-4 w-4" /> },
    { id: "communication", name: "Communication", icon: <MessageSquare className="h-4 w-4" /> },
  ];

  const filteredServices = selectedCategory === "all" 
    ? services 
    : services.filter(service => service.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Integration Center</h2>
          <p className="text-muted-foreground">
            Connect and manage external services to enhance your workspace
          </p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          {integrations.length} Connected
        </Badge>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid grid-cols-7 w-full">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="flex items-center space-x-2">
              {category.icon}
              <span className="hidden sm:inline">{category.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => {
              const integration = getIntegrationForService(service.id);
              const isConnected = !!integration;
              const isEnabled = integration?.isEnabled ?? false;

              return (
                <Card key={service.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        {service.icon}
                        <div>
                          <CardTitle className="text-lg">{service.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {service.description}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        {isConnected ? (
                          <Badge variant={isEnabled ? "default" : "secondary"} className="text-xs">
                            {isEnabled ? "Active" : "Disabled"}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">Not Connected</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Features</h4>
                      <div className="flex flex-wrap gap-1">
                        {service.features.map((feature) => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {isConnected && integration && (
                      <div className="space-y-2 text-xs text-muted-foreground">
                        <div className="flex items-center justify-between">
                          <span>Last synced:</span>
                          <span>{integration.lastSyncAt ? new Date(integration.lastSyncAt).toLocaleDateString() : "Never"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Connected:</span>
                          <span>{new Date(integration.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t">
                      {isConnected ? (
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={isEnabled}
                            onCheckedChange={(checked) => {
                              toggleIntegrationMutation.mutate({
                                id: integration!.id,
                                isEnabled: checked,
                              });
                            }}
                            disabled={toggleIntegrationMutation.isPending}
                          />
                          <span className="text-sm">Enable</span>
                        </div>
                      ) : (
                        <div />
                      )}

                      <div className="flex items-center space-x-2">
                        {isConnected && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => syncIntegrationMutation.mutate(integration!.id)}
                              disabled={syncIntegrationMutation.isPending || !isEnabled}
                            >
                              <RefreshCw className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteIntegrationMutation.mutate(integration!.id)}
                              disabled={deleteIntegrationMutation.isPending}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          onClick={() => handleConfigureService(service)}
                          disabled={createIntegrationMutation.isPending}
                        >
                          {isConnected ? <Settings className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                          <span className="ml-1">{isConnected ? "Configure" : "Connect"}</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Configuration Dialog */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {selectedService?.icon}
              <span>Configure {selectedService?.name}</span>
            </DialogTitle>
            <DialogDescription>
              Set up the connection and configuration for {selectedService?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedService?.configFields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key} className="text-sm font-medium">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {field.type === "select" ? (
                  <Select
                    value={configData[field.key] || ""}
                    onValueChange={(value) => setConfigData(prev => ({ ...prev, [field.key]: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${field.label}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field.type === "textarea" ? (
                  <Textarea
                    id={field.key}
                    value={configData[field.key] || ""}
                    onChange={(e) => setConfigData(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    rows={3}
                  />
                ) : (
                  <Input
                    id={field.key}
                    type={field.type === "password" ? "password" : "text"}
                    value={configData[field.key] || ""}
                    onChange={(e) => setConfigData(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                  />
                )}
              </div>
            ))}

            <div className="flex items-center justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveConfiguration}
                disabled={createIntegrationMutation.isPending}
              >
                {createIntegrationMutation.isPending ? "Saving..." : "Save Configuration"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}