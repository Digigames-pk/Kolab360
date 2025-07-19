import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import {
  Palette,
  Layout,
  Eye,
  EyeOff,
  Settings,
  Monitor,
  Smartphone,
  Tablet,
  Move,
  RotateCcw,
  Save,
  Paintbrush,
  Grid,
  List,
  Sidebar,
  PanelTop,
  PanelBottom,
  PanelLeft,
  PanelRight,
  Hash,
  Users,
  MessageSquare,
  Calendar,
  FolderOpen,
  Archive,
  Star,
  ChevronUp,
  ChevronDown,
  GripVertical
} from "lucide-react";

interface WorkspaceTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  sidebar: string;
  header: string;
}

interface SectionVisibility {
  threads: boolean;
  channels: boolean;
  directMessages: boolean;
  files: boolean;
  integrations: boolean;
  quickActions: boolean;
}

interface LayoutSettings {
  sidebarWidth: number;
  collapsedSidebar: boolean;
  compactMode: boolean;
  showDescriptions: boolean;
  sectionHeights: {
    threads: number;
    channels: number;
    directMessages: number;
    files: number;
    integrations: number;
  };
  sectionOrder: string[];
}

interface WorkspaceCustomizerProps {
  workspaceId: string;
  currentTheme: WorkspaceTheme;
  currentLayout: LayoutSettings;
  currentVisibility: SectionVisibility;
  onThemeChange: (theme: WorkspaceTheme) => void;
  onLayoutChange: (layout: LayoutSettings) => void;
  onVisibilityChange: (visibility: SectionVisibility) => void;
  onSave: () => void;
}

const predefinedThemes = [
  {
    name: "Ocean Blue",
    theme: {
      primary: "#0066cc",
      secondary: "#004499",
      accent: "#00aaff",
      background: "#f0f8ff",
      sidebar: "#e6f3ff",
      header: "#cce7ff"
    }
  },
  {
    name: "Forest Green",
    theme: {
      primary: "#228b22",
      secondary: "#006400",
      accent: "#32cd32",
      background: "#f0fff0",
      sidebar: "#e6ffe6",
      header: "#ccffcc"
    }
  },
  {
    name: "Sunset Orange",
    theme: {
      primary: "#ff6600",
      secondary: "#cc4400",
      accent: "#ff9933",
      background: "#fff8f0",
      sidebar: "#ffe6cc",
      header: "#ffddaa"
    }
  },
  {
    name: "Purple Dream",
    theme: {
      primary: "#8b00ff",
      secondary: "#6600cc",
      accent: "#aa33ff",
      background: "#faf0ff",
      sidebar: "#f0e6ff",
      header: "#e6ccff"
    }
  },
  {
    name: "Rose Gold",
    theme: {
      primary: "#e91e63",
      secondary: "#c2185b",
      accent: "#f06292",
      background: "#fdf2f8",
      sidebar: "#fce7f3",
      header: "#fbcfe8"
    }
  },
  {
    name: "Dark Mode",
    theme: {
      primary: "#3b82f6",
      secondary: "#1e40af",
      accent: "#60a5fa",
      background: "#111827",
      sidebar: "#1f2937",
      header: "#374151"
    }
  }
];

const sectionIcons = {
  threads: MessageSquare,
  channels: Hash,
  directMessages: Users,
  files: FolderOpen,
  integrations: Grid,
  quickActions: Star
};

const sectionLabels = {
  threads: "Threads",
  channels: "Channels", 
  directMessages: "Direct Messages",
  files: "Files",
  integrations: "Integrations",
  quickActions: "Quick Actions"
};

export function WorkspaceCustomizer({
  workspaceId,
  currentTheme,
  currentLayout,
  currentVisibility,
  onThemeChange,
  onLayoutChange,
  onVisibilityChange,
  onSave
}: WorkspaceCustomizerProps) {
  const [theme, setTheme] = useState<WorkspaceTheme>(currentTheme);
  const [layout, setLayout] = useState<LayoutSettings>(currentLayout);
  const [visibility, setVisibility] = useState<SectionVisibility>(currentVisibility);
  const [activeTab, setActiveTab] = useState("theme");
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const { toast } = useToast();

  // Update local state when props change
  useEffect(() => {
    setTheme(currentTheme);
    setLayout(currentLayout);
    setVisibility(currentVisibility);
  }, [currentTheme, currentLayout, currentVisibility]);

  // Apply theme changes immediately for preview
  useEffect(() => {
    onThemeChange(theme);
  }, [theme, onThemeChange]);

  // Apply layout changes immediately for preview
  useEffect(() => {
    onLayoutChange(layout);
  }, [layout, onLayoutChange]);

  // Apply visibility changes immediately for preview
  useEffect(() => {
    onVisibilityChange(visibility);
  }, [visibility, onVisibilityChange]);

  const applyPredefinedTheme = (predefinedTheme: WorkspaceTheme) => {
    setTheme(predefinedTheme);
  };

  const updateThemeColor = (colorKey: keyof WorkspaceTheme, color: string) => {
    setTheme(prev => ({
      ...prev,
      [colorKey]: color
    }));
  };

  const updateLayoutSetting = (key: keyof LayoutSettings, value: any) => {
    setLayout(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateSectionHeight = (section: string, height: number) => {
    setLayout(prev => ({
      ...prev,
      sectionHeights: {
        ...prev.sectionHeights,
        [section]: height
      }
    }));
  };

  const toggleSectionVisibility = (section: keyof SectionVisibility) => {
    setVisibility(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const resetToDefaults = () => {
    const defaultTheme = predefinedThemes[0].theme;
    const defaultLayout: LayoutSettings = {
      sidebarWidth: 280,
      collapsedSidebar: false,
      compactMode: false,
      showDescriptions: true,
      sectionHeights: {
        threads: 200,
        channels: 300,
        directMessages: 200,
        files: 150,
        integrations: 100
      },
      sectionOrder: ['threads', 'channels', 'directMessages', 'files', 'integrations']
    };
    const defaultVisibility: SectionVisibility = {
      threads: true,
      channels: true,
      directMessages: true,
      files: true,
      integrations: true,
      quickActions: true
    };

    setTheme(defaultTheme);
    setLayout(defaultLayout);
    setVisibility(defaultVisibility);
    
    toast({
      title: "Settings reset",
      description: "All customization settings have been reset to defaults"
    });
  };

  const handleSave = () => {
    onSave();
    toast({
      title: "Settings saved",
      description: "Your workspace customization has been saved successfully"
    });
  };

  const moveSectionUp = (sectionIndex: number) => {
    if (sectionIndex > 0) {
      const newOrder = [...layout.sectionOrder];
      [newOrder[sectionIndex], newOrder[sectionIndex - 1]] = [newOrder[sectionIndex - 1], newOrder[sectionIndex]];
      updateLayoutSetting('sectionOrder', newOrder);
    }
  };

  const moveSectionDown = (sectionIndex: number) => {
    if (sectionIndex < layout.sectionOrder.length - 1) {
      const newOrder = [...layout.sectionOrder];
      [newOrder[sectionIndex], newOrder[sectionIndex + 1]] = [newOrder[sectionIndex + 1], newOrder[sectionIndex]];
      updateLayoutSetting('sectionOrder', newOrder);
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-6 h-full">
        <div className="flex flex-col h-full space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Workspace Customization
              </h1>
              <p className="text-muted-foreground">
                Personalize your workspace appearance and layout
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {/* Preview Mode Toggle */}
              <div className="flex items-center space-x-2">
                <Button
                  variant={previewMode === 'mobile' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewMode('mobile')}
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
                <Button
                  variant={previewMode === 'tablet' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewMode('tablet')}
                >
                  <Tablet className="h-4 w-4" />
                </Button>
                <Button
                  variant={previewMode === 'desktop' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewMode('desktop')}
                >
                  <Monitor className="h-4 w-4" />
                </Button>
              </div>

              <Button variant="outline" onClick={resetToDefaults}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              
              <Button onClick={handleSave} className="bg-gradient-to-r from-purple-500 to-blue-500">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="theme" className="flex items-center space-x-2">
                  <Palette className="h-4 w-4" />
                  <span>Colors & Theme</span>
                </TabsTrigger>
                <TabsTrigger value="layout" className="flex items-center space-x-2">
                  <Layout className="h-4 w-4" />
                  <span>Layout</span>
                </TabsTrigger>
                <TabsTrigger value="sections" className="flex items-center space-x-2">
                  <Sidebar className="h-4 w-4" />
                  <span>Sections</span>
                </TabsTrigger>
                <TabsTrigger value="visibility" className="flex items-center space-x-2">
                  <Eye className="h-4 w-4" />
                  <span>Visibility</span>
                </TabsTrigger>
              </TabsList>

              {/* Theme Tab */}
              <TabsContent value="theme" className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Predefined Themes */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Paintbrush className="h-5 w-5" />
                        <span>Predefined Themes</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3">
                        {predefinedThemes.map((predefined, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            className="h-20 flex flex-col items-center justify-center space-y-2"
                            onClick={() => applyPredefinedTheme(predefined.theme)}
                          >
                            <div className="flex space-x-1">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: predefined.theme.primary }}
                              />
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: predefined.theme.secondary }}
                              />
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: predefined.theme.accent }}
                              />
                            </div>
                            <span className="text-xs font-medium">{predefined.name}</span>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Custom Colors */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Custom Colors</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {Object.entries(theme).map(([key, color]) => (
                        <div key={key} className="flex items-center justify-between">
                          <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-8 h-8 rounded border"
                              style={{ backgroundColor: color }}
                            />
                            <Input
                              type="color"
                              value={color}
                              onChange={(e) => updateThemeColor(key as keyof WorkspaceTheme, e.target.value)}
                              className="w-16 h-8 p-0 border-0"
                            />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Layout Tab */}
              <TabsContent value="layout" className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* General Layout */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Layout className="h-5 w-5" />
                        <span>General Layout</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <Label>Sidebar Width</Label>
                        <div className="mt-2">
                          <Slider
                            value={[layout.sidebarWidth]}
                            onValueChange={([value]) => updateLayoutSetting('sidebarWidth', value)}
                            min={200}
                            max={400}
                            step={10}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>200px</span>
                            <span>{layout.sidebarWidth}px</span>
                            <span>400px</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>Collapsed Sidebar</Label>
                        <Switch
                          checked={layout.collapsedSidebar}
                          onCheckedChange={(checked) => updateLayoutSetting('collapsedSidebar', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>Compact Mode</Label>
                        <Switch
                          checked={layout.compactMode}
                          onCheckedChange={(checked) => updateLayoutSetting('compactMode', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>Show Descriptions</Label>
                        <Switch
                          checked={layout.showDescriptions}
                          onCheckedChange={(checked) => updateLayoutSetting('showDescriptions', checked)}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Section Heights */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Section Heights</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {Object.entries(layout.sectionHeights).map(([section, height]) => (
                        <div key={section}>
                          <Label className="capitalize">{sectionLabels[section as keyof typeof sectionLabels]}</Label>
                          <div className="mt-2">
                            <Slider
                              value={[height]}
                              onValueChange={([value]) => updateSectionHeight(section, value)}
                              min={50}
                              max={500}
                              step={25}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                              <span>50px</span>
                              <span>{height}px</span>
                              <span>500px</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Sections Tab */}
              <TabsContent value="sections" className="flex-1 overflow-y-auto">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Move className="h-5 w-5" />
                      <span>Section Order & Management</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {layout.sectionOrder.map((sectionKey, index) => {
                        const IconComponent = sectionIcons[sectionKey as keyof typeof sectionIcons];
                        const sectionLabel = sectionLabels[sectionKey as keyof typeof sectionLabels];
                        const isVisible = visibility[sectionKey as keyof SectionVisibility];
                        
                        return (
                          <div key={sectionKey} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                              <IconComponent className="h-4 w-4" />
                              <span className="font-medium">{sectionLabel}</span>
                              <Badge variant={isVisible ? "default" : "secondary"}>
                                {isVisible ? "Visible" : "Hidden"}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => moveSectionUp(index)}
                                disabled={index === 0}
                              >
                                <ChevronUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => moveSectionDown(index)}
                                disabled={index === layout.sectionOrder.length - 1}
                              >
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                              <Switch
                                checked={isVisible}
                                onCheckedChange={() => toggleSectionVisibility(sectionKey as keyof SectionVisibility)}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Visibility Tab */}
              <TabsContent value="visibility" className="flex-1 overflow-y-auto">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Eye className="h-5 w-5" />
                      <span>Show/Hide Elements</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(visibility).map(([key, isVisible]) => {
                        const IconComponent = sectionIcons[key as keyof typeof sectionIcons];
                        const sectionLabel = sectionLabels[key as keyof typeof sectionLabels];
                        
                        return (
                          <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <IconComponent className="h-5 w-5" />
                              <div>
                                <span className="font-medium">{sectionLabel}</span>
                                <p className="text-xs text-muted-foreground">
                                  {isVisible ? "Currently visible" : "Currently hidden"}
                                </p>
                              </div>
                            </div>
                            <Switch
                              checked={isVisible}
                              onCheckedChange={() => toggleSectionVisibility(key as keyof SectionVisibility)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}