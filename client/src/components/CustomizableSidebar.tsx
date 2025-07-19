import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { 
  Hash, 
  Lock, 
  Plus, 
  MessageSquare, 
  Settings, 
  Crown,
  Shield,
  User,
  Star,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Zap,
  Users,
  Bell,
  Calendar as CalendarIcon,
  CheckSquare,
  Upload,
  FileText,
  BookOpen,
  Tag,
  Trophy,
  Palette,
  Settings2,
  Eye,
  EyeOff,
  GripVertical,
  Minimize2,
  Maximize2,
  Edit3,
  Grid
} from "lucide-react";

interface SidebarSection {
  id: string;
  title: string;
  icon: any;
  isVisible: boolean;
  isCollapsed: boolean;
  height: number;
  order: number;
  items: any[];
}

interface WorkspaceTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  sidebar: string;
  header: string;
}

interface CustomizableSidebarProps {
  workspaces: any[];
  selectedWorkspace: string;
  setSelectedWorkspace: (id: string) => void;
  channels: any[];
  selectedChannel: string;
  setSelectedChannel: (channel: string) => void;
  directMessages: any[];
  files: any[];
  integrations: any[];
  currentTheme: WorkspaceTheme;
  sidebarWidth: number;
  setSidebarWidth: (width: number) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  showDescriptions: boolean;
  setShowDescriptions: (show: boolean) => void;
  onSectionToggle: (sectionId: string) => void;
  onSectionReorder: (sections: SidebarSection[]) => void;
  onThemeChange: (theme: WorkspaceTheme) => void;
}

export function CustomizableSidebar({
  workspaces,
  selectedWorkspace,
  setSelectedWorkspace,
  channels,
  selectedChannel,
  setSelectedChannel,
  directMessages,
  files,
  integrations,
  currentTheme,
  sidebarWidth,
  setSidebarWidth,
  isCollapsed,
  setIsCollapsed,
  showDescriptions,
  setShowDescriptions,
  onSectionToggle,
  onSectionReorder,
  onThemeChange
}: CustomizableSidebarProps) {
  const [sections, setSections] = useState<SidebarSection[]>([
    {
      id: 'threads',
      title: 'Threads',
      icon: MessageSquare,
      isVisible: true,
      isCollapsed: false,
      height: 200,
      order: 0,
      items: []
    },
    {
      id: 'channels',
      title: 'Channels',
      icon: Hash,
      isVisible: true,
      isCollapsed: false,
      height: 300,
      order: 1,
      items: channels
    },
    {
      id: 'directMessages',
      title: 'Direct Messages',
      icon: Users,
      isVisible: true,
      isCollapsed: false,
      height: 200,
      order: 2,
      items: directMessages
    },
    {
      id: 'files',
      title: 'Files',
      icon: FileText,
      isVisible: true,
      isCollapsed: false,
      height: 150,
      order: 3,
      items: files
    },
    {
      id: 'integrations',
      title: 'Integrations',
      icon: Grid,
      isVisible: true,
      isCollapsed: false,
      height: 100,
      order: 4,
      items: integrations
    }
  ]);

  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const { toast } = useToast();

  // Save sidebar configuration to localStorage
  const saveSidebarConfig = () => {
    const config = {
      sections,
      sidebarWidth,
      isCollapsed,
      showDescriptions,
      showQuickActions,
      theme: currentTheme
    };
    localStorage.setItem(`sidebar-config-${selectedWorkspace}`, JSON.stringify(config));
  };

  // Load sidebar configuration from localStorage
  const loadSidebarConfig = () => {
    const saved = localStorage.getItem(`sidebar-config-${selectedWorkspace}`);
    if (saved) {
      try {
        const config = JSON.parse(saved);
        if (config.sections) setSections(config.sections);
        if (config.sidebarWidth) setSidebarWidth(config.sidebarWidth);
        if (config.showDescriptions !== undefined) setShowDescriptions(config.showDescriptions);
        if (config.showQuickActions !== undefined) setShowQuickActions(config.showQuickActions);
        if (config.theme) onThemeChange(config.theme);
      } catch (error) {
        console.error('Failed to load sidebar config:', error);
      }
    }
  };

  // Load config when workspace changes
  useEffect(() => {
    if (selectedWorkspace) {
      loadSidebarConfig();
    }
  }, [selectedWorkspace]);

  // Auto-save config when sections change
  useEffect(() => {
    if (selectedWorkspace) {
      saveSidebarConfig();
    }
  }, [sections, sidebarWidth, isCollapsed, showDescriptions, showQuickActions, currentTheme]);

  const toggleSectionCollapse = (sectionId: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, isCollapsed: !section.isCollapsed }
        : section
    ));
  };

  const toggleSectionVisibility = (sectionId: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, isVisible: !section.isVisible }
        : section
    ));
    onSectionToggle(sectionId);
  };

  const updateSectionHeight = (sectionId: string, newHeight: number) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, height: newHeight }
        : section
    ));
  };

  const moveSectionUp = (sectionId: string) => {
    setSections(prev => {
      const sectionIndex = prev.findIndex(s => s.id === sectionId);
      if (sectionIndex > 0) {
        const newSections = [...prev];
        [newSections[sectionIndex], newSections[sectionIndex - 1]] = 
        [newSections[sectionIndex - 1], newSections[sectionIndex]];
        newSections.forEach((section, index) => section.order = index);
        onSectionReorder(newSections);
        return newSections;
      }
      return prev;
    });
  };

  const moveSectionDown = (sectionId: string) => {
    setSections(prev => {
      const sectionIndex = prev.findIndex(s => s.id === sectionId);
      if (sectionIndex < prev.length - 1) {
        const newSections = [...prev];
        [newSections[sectionIndex], newSections[sectionIndex + 1]] = 
        [newSections[sectionIndex + 1], newSections[sectionIndex]];
        newSections.forEach((section, index) => section.order = index);
        onSectionReorder(newSections);
        return newSections;
      }
      return prev;
    });
  };

  const getUnreadCount = (sectionId: string) => {
    switch (sectionId) {
      case 'channels':
        return channels.filter(c => c.unreadCount > 0).length;
      case 'directMessages':
        return directMessages.filter(dm => dm.unreadCount > 0).length;
      default:
        return 0;
    }
  };

  const renderSectionContent = (section: SidebarSection) => {
    switch (section.id) {
      case 'threads':
        return (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">No active threads</div>
          </div>
        );

      case 'channels':
        return (
          <ScrollArea style={{ height: `${section.height}px` }}>
            <div className="space-y-1">
              {channels.map((channel) => (
                <Button
                  key={channel.id}
                  variant={selectedChannel === channel.name ? "default" : "ghost"}
                  className="w-full justify-start text-left h-auto py-2"
                  onClick={() => setSelectedChannel(channel.name)}
                >
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    {channel.isPrivate ? <Lock className="h-4 w-4" /> : <Hash className="h-4 w-4" />}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{channel.name}</div>
                      {showDescriptions && channel.description && (
                        <div className="text-xs text-muted-foreground truncate">
                          {channel.description}
                        </div>
                      )}
                    </div>
                    {channel.unreadCount > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {channel.unreadCount}
                      </Badge>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        );

      case 'directMessages':
        return (
          <ScrollArea style={{ height: `${section.height}px` }}>
            <div className="space-y-1">
              {directMessages.map((dm) => (
                <Button
                  key={dm.id}
                  variant="ghost"
                  className="w-full justify-start text-left h-auto py-2"
                >
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {dm.name[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{dm.name}</div>
                      {showDescriptions && dm.lastMessage && (
                        <div className="text-xs text-muted-foreground truncate">
                          {dm.lastMessage}
                        </div>
                      )}
                    </div>
                    {dm.unreadCount > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {dm.unreadCount}
                      </Badge>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        );

      case 'files':
        return (
          <ScrollArea style={{ height: `${section.height}px` }}>
            <div className="space-y-1">
              {files.slice(0, 5).map((file, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start text-left h-auto py-2"
                >
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <FileText className="h-4 w-4" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{file.name}</div>
                      {showDescriptions && (
                        <div className="text-xs text-muted-foreground">
                          {file.size} • {file.type}
                        </div>
                      )}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        );

      case 'integrations':
        return (
          <ScrollArea style={{ height: `${section.height}px` }}>
            <div className="space-y-1">
              {integrations.slice(0, 3).map((integration, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start text-left h-auto py-2"
                >
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <Grid className="h-4 w-4" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{integration.name}</div>
                      {showDescriptions && (
                        <div className="text-xs text-muted-foreground">
                          {integration.status}
                        </div>
                      )}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        );

      default:
        return null;
    }
  };

  if (isCollapsed) {
    return (
      <div className="w-16 h-full border-r bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="p-2 space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full p-2"
            onClick={() => setIsCollapsed(false)}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          
          {sections
            .filter(section => section.isVisible)
            .sort((a, b) => a.order - b.order)
            .map((section) => {
              const IconComponent = section.icon;
              const unreadCount = getUnreadCount(section.id);
              
              return (
                <Button
                  key={section.id}
                  variant="ghost"
                  size="sm"
                  className="w-full p-2 relative"
                  title={section.title}
                >
                  <IconComponent className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
                    </div>
                  )}
                </Button>
              );
            })}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="h-full border-r bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm"
      style={{ 
        width: `${sidebarWidth}px`,
        backgroundColor: currentTheme.sidebar 
      }}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h2 className="font-semibold text-lg">Workspace</h2>
              <Badge variant="outline" className="text-xs">
                {workspaces.find(w => w.id === selectedWorkspace)?.name || 'Demo'}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-1">
              <Dialog open={isCustomizeOpen} onOpenChange={setIsCustomizeOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings2 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Customize Sidebar</DialogTitle>
                    <DialogDescription>
                      Personalize your sidebar layout and appearance
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    {/* General Settings */}
                    <div>
                      <h4 className="font-medium mb-3">General Settings</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm">Show Descriptions</label>
                          <Switch 
                            checked={showDescriptions} 
                            onCheckedChange={setShowDescriptions}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <label className="text-sm">Show Quick Actions</label>
                          <Switch 
                            checked={showQuickActions} 
                            onCheckedChange={setShowQuickActions}
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm">Sidebar Width</label>
                          <div className="mt-2">
                            <Slider
                              value={[sidebarWidth]}
                              onValueChange={([value]) => setSidebarWidth(value)}
                              min={200}
                              max={400}
                              step={10}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                              <span>200px</span>
                              <span>{sidebarWidth}px</span>
                              <span>400px</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Section Management */}
                    <div>
                      <h4 className="font-medium mb-3">Section Management</h4>
                      <div className="space-y-2">
                        {sections
                          .sort((a, b) => a.order - b.order)
                          .map((section, index) => {
                            const IconComponent = section.icon;
                            return (
                              <div key={section.id} className="flex items-center justify-between p-3 border rounded">
                                <div className="flex items-center space-x-3">
                                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                                  <IconComponent className="h-4 w-4" />
                                  <span className="font-medium">{section.title}</span>
                                  <Badge variant={section.isVisible ? "default" : "secondary"}>
                                    {section.isVisible ? "Visible" : "Hidden"}
                                  </Badge>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => moveSectionUp(section.id)}
                                    disabled={index === 0}
                                  >
                                    <ChevronUp className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => moveSectionDown(section.id)}
                                    disabled={index === sections.length - 1}
                                  >
                                    <ChevronDown className="h-4 w-4" />
                                  </Button>
                                  <Switch
                                    checked={section.isVisible}
                                    onCheckedChange={() => toggleSectionVisibility(section.id)}
                                  />
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsCollapsed(true)}
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {showQuickActions && (
          <div className="p-4 border-b">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="text-xs">
                <Plus className="h-3 w-3 mr-1" />
                Channel
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <MessageSquare className="h-3 w-3 mr-1" />
                DM
              </Button>
            </div>
          </div>
        )}

        {/* Sections */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {sections
              .filter(section => section.isVisible)
              .sort((a, b) => a.order - b.order)
              .map((section) => {
                const IconComponent = section.icon;
                const unreadCount = getUnreadCount(section.id);
                
                return (
                  <Collapsible 
                    key={section.id}
                    open={!section.isCollapsed}
                    onOpenChange={() => toggleSectionCollapse(section.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-between h-8 font-medium text-sm"
                      >
                        <div className="flex items-center space-x-2">
                          <IconComponent className="h-4 w-4" />
                          <span>{section.title}</span>
                          {unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs h-4">
                              {unreadCount}
                            </Badge>
                          )}
                        </div>
                        {section.isCollapsed ? (
                          <ChevronRight className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="pl-2 pt-2">
                      {renderSectionContent(section)}
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}