import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { EnhancedTaskBoard } from "@/components/EnhancedTaskBoard";
import { MobileTaskBoard } from "@/components/MobileTaskBoard";
import { RobustTaskBoard } from "@/components/RobustTaskBoard";
import { WorkspaceCustomizer } from "@/components/WorkspaceCustomizer";
import { CustomizableSidebar } from "@/components/CustomizableSidebar";
import { WorkspaceLayoutCustomizer } from "@/components/WorkspaceLayoutCustomizer";
import { EnhancedSearch } from "@/components/EnhancedSearch";
import { EnhancedAI } from "@/components/EnhancedAI";
import { RealTimeChat } from "@/components/RealTimeChat";
import { AdvancedThemeCustomizer } from "@/components/AdvancedThemeCustomizer";
import { IntegrationHub } from "@/components/IntegrationHub";
import { X } from "lucide-react";
import { TaskDetailModal } from "@/components/TaskDetailModal";
import { FileViewer } from "@/components/FileViewer";
import { EnhancedDocumentSystem } from "@/components/EnhancedDocumentSystem";
import { EnhancedCalendar } from "@/components/EnhancedCalendar";
import { SimpleThemeSelector } from "@/components/SimpleThemeSelector";
import { UnifiedThemeProvider } from "@/components/UnifiedThemeProvider";
import { IntegrationCenter } from "@/components/IntegrationCenter";
import { AdminIntegrationPanel } from "@/components/AdminIntegrationPanel";
import { StunningTaskBoard } from "@/components/StunningTaskBoard";
import { VoiceVideoCall } from "@/components/VoiceVideoCall";
import { InteractiveOnboarding } from "@/components/InteractiveOnboarding";
import { GamificationSystem } from "@/components/GamificationSystem";
import { WorkspaceThemeCustomizer } from "@/components/WorkspaceThemeCustomizer";
import { EnterpriseAdminPanel } from "@/components/EnterpriseAdminPanel";
import { EnhancedFileUpload } from "@/components/EnhancedFileUpload";
import { WasabiFileUpload } from "@/components/WasabiFileUpload";
import { AdvancedSearch } from "@/components/AdvancedSearch";
import { NotificationCenter } from "@/components/NotificationCenter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { 
  Hash, 
  Lock, 
  Plus, 
  MessageSquare, 
  Phone, 
  Video, 
  Settings, 
  LogOut,
  Crown,
  Shield,
  User,
  Search,
  Star,
  MoreHorizontal,
  ChevronDown,
  Zap,
  Users,
  Bell,
  Mail,
  Calendar as CalendarIcon,
  CheckSquare,
  Upload,
  Filter,
  Settings2,
  Headphones,
  AtSign,
  Paperclip,
  Smile,
  Send,
  Palette,
  Trophy,
  Rocket,
  FileText,
  BookOpen,
  Tag,
  Download,
  Edit3,
  FolderOpen
} from "lucide-react";

export default function Home() {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [activeView, setActiveView] = useState("chat");
  const [selectedChannel, setSelectedChannel] = useState("general");
  const [selectedDM, setSelectedDM] = useState(null);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelDescription, setNewChannelDescription] = useState("");
  const [newChannelType, setNewChannelType] = useState<"public" | "private">("public");
  const [selectedWorkspace, setSelectedWorkspace] = useState(1);
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [showDocuments, setShowDocuments] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentSearchTerm, setDocumentSearchTerm] = useState("");
  const [aiMessage, setAiMessage] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [showVoiceCall, setShowVoiceCall] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showGamification, setShowGamification] = useState(false);
  const [showThemeCustomizer, setShowThemeCustomizer] = useState(false);
  const [showEnterprisePanel, setShowEnterprisePanel] = useState(false);
  const [showLayoutCustomizer, setShowLayoutCustomizer] = useState(false);
  const [callType, setCallType] = useState<"voice" | "video">("voice");
  
  // Additional workspace customization state
  const [workspaceTheme, setWorkspaceTheme] = useState({
    primary: "#0066cc",
    secondary: "#004499", 
    accent: "#00aaff",
    background: "#f0f8ff",
    sidebar: "#e6f3ff",
    header: "#cce7ff"
  });
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showDescriptions, setShowDescriptions] = useState(true);
  const [showWorkspaceCustomizer, setShowWorkspaceCustomizer] = useState(false);
  const [sidebarVisibility, setSidebarVisibility] = useState({
    threads: true,
    channels: true,
    directMessages: true,
    files: true,
    integrations: true,
    quickActions: true
  });
  const [sidebarLayout, setSidebarLayout] = useState({
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
  });
  
  // Workspace customization persistence
  const [sidebarSizes, setSidebarSizes] = useState(() => {
    const saved = localStorage.getItem(`workspace-sidebar-${selectedWorkspace}`);
    return saved ? JSON.parse(saved) : [20, 80];
  });
  
  const [workspaceSettings, setWorkspaceSettings] = useState(() => {
    const saved = localStorage.getItem(`workspace-settings-${selectedWorkspace}`);
    return saved ? JSON.parse(saved) : {
      theme: 'dark-purple',
      sidebarSize: 20,
      channelSections: {
        'channels': { collapsed: false, order: 0 },
        'direct-messages': { collapsed: false, order: 1 },
        'starred': { collapsed: false, order: 2 }
      }
    };
  });

  // Save settings when they change
  useEffect(() => {
    localStorage.setItem(`workspace-settings-${selectedWorkspace}`, JSON.stringify(workspaceSettings));
  }, [workspaceSettings, selectedWorkspace]);

  // Save sidebar sizes when they change
  useEffect(() => {
    localStorage.setItem(`workspace-sidebar-${selectedWorkspace}`, JSON.stringify(sidebarSizes));
  }, [sidebarSizes, selectedWorkspace]);

  if (!user) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Crown className="h-3 w-3 text-yellow-500" />;
      case 'admin':
        return <Shield className="h-3 w-3 text-blue-500" />;
      default:
        return <User className="h-3 w-3 text-gray-500" />;
    }
  };

  const [workspaces, setWorkspaces] = useState([
    { id: 1, name: "CollabSpace Demo", initial: "CD" },
    { id: 2, name: "Development Team", initial: "DT" },
  ]);

  // Workspace-specific content
  const workspaceData = {
    1: { // CollabSpace Demo
      channels: [
        { name: "general", unread: 0, type: "public", description: "Company-wide announcements and discussion" },
        { name: "random", unread: 3, type: "public", description: "Non-work banter and water cooler conversation" },
        { name: "announcements", unread: 1, type: "public", description: "Important company announcements" },
        { name: "dev-team", unread: 0, type: "private", description: "Development team discussions" },
        { name: "design-reviews", unread: 5, type: "public", description: "Design feedback and UI/UX discussions" },
        { name: "admin-only", unread: 2, type: "private", adminOnly: true, description: "Administrative discussions" },
      ],
      directMessages: [
        { id: 1, name: "John Doe", status: "online", unread: 2, lastMessage: "Thanks for the code review!" },
        { id: 2, name: "Jane Smith", status: "away", unread: 0, lastMessage: "See you in the meeting" },
        { id: 3, name: "AI Assistant", status: "online", unread: 1, lastMessage: "I can help you with that task" },
        { id: 4, name: "Mike Chen", status: "offline", unread: 0, lastMessage: "API docs are updated" },
        { id: 5, name: "Sarah Wilson", status: "online", unread: 3, lastMessage: "Can you review the mockups?" },
      ],
      documents: [
        { id: 1, title: "Team Guidelines", content: "Welcome to our team guidelines...", category: "General", lastModified: "2024-01-15" },
        { id: 2, title: "API Documentation", content: "REST API endpoints and usage...", category: "Technical", lastModified: "2024-01-14" },
        { id: 3, title: "Meeting Notes", content: "Weekly standup meeting notes...", category: "Meetings", lastModified: "2024-01-13" }
      ]
    },
    2: { // Development Team
      channels: [
        { name: "standup", unread: 2, type: "public", description: "Daily standup meetings and updates" },
        { name: "backend", unread: 5, type: "private", description: "Backend development discussions" },
        { name: "frontend", unread: 1, type: "private", description: "Frontend development topics" },
        { name: "code-review", unread: 0, type: "public", description: "Code review requests and discussions" },
        { name: "deployment", unread: 3, type: "private", description: "Deployment and DevOps topics" },
      ],
      directMessages: [
        { id: 6, name: "Alex Rodriguez", status: "online", unread: 1, lastMessage: "Ready for code review" },
        { id: 7, name: "Emma Davis", status: "online", unread: 0, lastMessage: "Fixed the bug in PR #123" },
        { id: 8, name: "Tech Lead", status: "away", unread: 2, lastMessage: "Sprint planning tomorrow" },
        { id: 9, name: "DevOps Bot", status: "online", unread: 0, lastMessage: "Deployment successful" },
      ],
      documents: [
        { id: 4, title: "Architecture Overview", content: "System architecture documentation...", category: "Technical", lastModified: "2024-01-16" },
        { id: 5, title: "Sprint Planning", content: "Current sprint goals and tasks...", category: "Planning", lastModified: "2024-01-15" },
        { id: 6, title: "Code Standards", content: "Development coding standards...", category: "Technical", lastModified: "2024-01-14" }
      ]
    }
  };

  // Get current workspace data or defaults for new workspaces
  const currentWorkspaceData = workspaceData[selectedWorkspace] || {
    channels: [
      { name: "general", unread: 0, type: "public", description: "General discussion" }
    ],
    directMessages: [
      { name: "Welcome Bot", status: "online", unread: 1, lastMessage: "Welcome to your new workspace!" }
    ],
    documents: [
      { id: Date.now(), title: "Getting Started", content: "Welcome to your new workspace! Start by inviting team members and creating channels.", category: "General", lastModified: new Date().toISOString().split('T')[0] }
    ]
  };

  const channels = currentWorkspaceData.channels;
  const directMessages = currentWorkspaceData.directMessages;

  // Update documents when workspace changes
  useEffect(() => {
    setDocuments(currentWorkspaceData.documents);
    setSelectedDocument(null); // Clear selected document when switching workspaces
  }, [selectedWorkspace]);

  const filteredChannels = channels.filter(channel => 
    !channel.adminOnly || user.role === 'admin' || user.role === 'super_admin'
  );

  return (
    <UnifiedThemeProvider>
      <div className="flex h-screen bg-background">
      {/* Workspace Switcher Sidebar */}
      <div className="w-16 bg-slate-900 flex flex-col items-center py-3 space-y-2">
        {workspaces.map((workspace) => (
          <div
            key={workspace.id}
            className={`w-10 h-10 ${selectedWorkspace === workspace.id ? 'bg-blue-600' : 'bg-slate-600 hover:bg-slate-500'} rounded-lg flex items-center justify-center text-white font-medium text-sm cursor-pointer transition-colors`}
            onClick={() => setSelectedWorkspace(workspace.id)}
            title={workspace.name}
          >
            {workspace.initial}
          </div>
        ))}
        <div 
          className="w-10 h-10 border-2 border-dashed border-slate-600 hover:border-slate-400 rounded-lg flex items-center justify-center text-slate-400 cursor-pointer transition-colors"
          onClick={() => setShowCreateWorkspace(true)}
          title="Add workspace"
        >
          <Plus className="h-5 w-5" />
        </div>
      </div>

      {/* Main Content with Resizable Panels */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Enhanced Customizable Sidebar */}
        <ResizablePanel 
          defaultSize={sidebarSizes[0]} 
          minSize={15} 
          maxSize={40} 
          onResize={(size) => {
            setSidebarSizes([size, 100 - size]);
            setSidebarWidth(size * 15); // Approximate conversion
            
            // Track sidebar size for responsive behavior and save settings
            const isCollapsed = size < 25;
            const sidebar = document.querySelector('.sidebar-container');
            if (sidebar) {
              sidebar.style.setProperty('--sidebar-collapsed', isCollapsed ? '1' : '0');
            }
            
            // Update workspace settings
            setWorkspaceSettings(prev => ({
              ...prev,
              sidebarSize: size
            }));
          }}
        >
          <div className="h-full bg-slate-800 text-slate-100 flex flex-col sidebar-container">
        {/* Workspace Header */}
        <div className="p-4 border-b border-slate-700">
          <div className="workspace-header flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-lg text-white sidebar-text truncate">
                {workspaces.find(w => w.id === selectedWorkspace)?.name || "Kolab360 Demo"}
              </h2>
              <div className="flex items-center space-x-2 text-sm text-slate-300 sidebar-text">
                {getRoleIcon(user.role)}
                <span>{user.firstName} {user.lastName}</span>
              </div>
              <div className="sidebar-icon-only hidden">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-medium text-sm">
                  {workspaces.find(w => w.id === selectedWorkspace)?.initial}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1 sidebar-text">
              {/* Theme customization moved to settings dropdown */}
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="px-4 py-3 space-y-1">
        </div>

        {/* Core Navigation - Clean and Essential */}
        <div className="px-4 py-3 space-y-1">
          <div 
            className="nav-item flex items-center space-x-3 px-2 py-1 rounded hover:bg-slate-700 cursor-pointer"
            onClick={() => setActiveView("threads")}
          >
            <MessageSquare className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm sidebar-text">Threads</span>
          </div>
          <div 
            className="nav-item flex items-center space-x-3 px-2 py-1 rounded hover:bg-slate-700 cursor-pointer"
            onClick={() => setActiveView("mentions")}
          >
            <Bell className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm sidebar-text">Mentions & reactions</span>
          </div>
          <div 
            className="nav-item flex items-center space-x-3 px-2 py-1 rounded hover:bg-slate-700 cursor-pointer"
            onClick={() => setActiveView("saved")}
          >
            <Star className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm sidebar-text">Saved items</span>
          </div>
          <div 
            className="nav-item flex items-center space-x-3 px-2 py-1 rounded hover:bg-slate-700 cursor-pointer"
            onClick={() => setActiveView("files")}
          >
            <FolderOpen className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm sidebar-text">Browse all files</span>
          </div>
          <div 
            className="nav-item flex items-center space-x-3 px-2 py-1 rounded hover:bg-slate-700 cursor-pointer"
            onClick={() => setActiveView("ai")}
          >
            <Zap className="h-4 w-4 text-purple-400 flex-shrink-0" />
            <span className="text-sm sidebar-text">AI Assistant</span>
          </div>
        </div>

        <Separator className="bg-slate-700" />

        {/* Channels Section */}
        <div className="flex-1 px-4 py-3">
          <div className="flex items-center justify-between mb-2 cursor-pointer" onClick={() => {
            setWorkspaceSettings(prev => ({
              ...prev,
              channelSections: {
                ...prev.channelSections,
                channels: {
                  ...prev.channelSections.channels,
                  collapsed: !prev.channelSections.channels.collapsed
                }
              }
            }));
          }}>
            <span className="text-sm font-medium text-slate-300">
              {workspaceSettings.channelSections.channels.collapsed ? '▶' : '▼'} Channels
            </span>
            <Plus 
              className="h-4 w-4 text-slate-400 hover:text-white cursor-pointer" 
              onClick={(e) => {
                e.stopPropagation();
                setShowCreateChannel(true);
              }}
            />
          </div>
          
          {!workspaceSettings.channelSections.channels.collapsed && (
            <ScrollArea className="h-32">
              <div className="space-y-1">
                {filteredChannels.map((channel) => (
                <div
                  key={channel.name}
                  className={`channel-item flex items-center justify-between px-2 py-2 rounded hover:bg-slate-700 cursor-pointer group transition-all duration-200 ${selectedChannel === channel.name ? 'bg-slate-700' : ''}`}
                  onClick={() => {
                    setActiveView("chat");
                    setSelectedChannel(channel.name);
                    setSelectedDM(null);
                  }}
                  data-tooltip={`${channel.name} - ${channel.description}`}
                  title={`${channel.name} - ${channel.description}`}
                >
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    {channel.type === "public" ? (
                      <Hash className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    ) : (
                      <Lock className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0 channel-text">
                      <div className="text-sm font-medium truncate">{channel.name}</div>
                      <div className="text-xs text-slate-400 truncate">{channel.description}</div>
                    </div>
                    <div className="sidebar-icon-only hidden">
                      {channel.type === "public" ? (
                        <Hash className="h-4 w-4 text-slate-400" />
                      ) : (
                        <Lock className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </div>
                  {channel.unread > 0 && (
                    <Badge variant="destructive" className="h-5 text-xs px-1.5 channel-badge">
                      {channel.unread}
                    </Badge>
                  )}
                </div>
                ))}
              </div>
            </ScrollArea>
          )}

          <Separator className="bg-slate-700 my-3" />

          {/* Direct Messages */}
          <div className="flex items-center justify-between mb-2 cursor-pointer" onClick={() => {
            setWorkspaceSettings(prev => ({
              ...prev,
              channelSections: {
                ...prev.channelSections,
                'direct-messages': {
                  ...prev.channelSections['direct-messages'],
                  collapsed: !prev.channelSections['direct-messages'].collapsed
                }
              }
            }));
          }}>
            <span className="text-sm font-medium text-slate-300">
              {workspaceSettings.channelSections['direct-messages'].collapsed ? '▶' : '▼'} Direct messages
            </span>
            <Plus 
              className="h-4 w-4 text-slate-400 hover:text-white cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                const userName = prompt("Enter username to start a conversation:");
                if (userName) {
                  alert(`Direct message with ${userName} would be started`);
                }
              }}
            />
          </div>
          
          {!workspaceSettings.channelSections['direct-messages'].collapsed && (
            <ScrollArea className="h-24">
              <div className="space-y-1">
                {directMessages.map((dm) => (
                <div
                  key={dm.name}
                  className={`dm-item flex items-center justify-between px-2 py-2 rounded hover:bg-slate-700 cursor-pointer transition-all duration-200 ${selectedDM === dm.name ? 'bg-slate-700' : ''}`}
                  onClick={() => {
                    setActiveView("chat");
                    setSelectedDM(dm.name);
                    setSelectedChannel(null);
                  }}
                  data-tooltip={`${dm.name} - ${dm.lastMessage}`}
                  title={`${dm.name} - ${dm.lastMessage}`}
                >
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <div className="relative flex-shrink-0">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs bg-slate-600">
                          {dm.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-800 ${
                        dm.status === 'online' ? 'bg-green-500' : 
                        dm.status === 'away' ? 'bg-yellow-500' : 'bg-slate-500'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0 dm-text">
                      <div className="text-sm font-medium truncate">{dm.name}</div>
                      <div className="text-xs text-slate-400 truncate">{dm.lastMessage}</div>
                    </div>
                    <div className="sidebar-icon-only hidden">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs bg-slate-600">
                          {dm.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  {dm.unread > 0 && (
                    <Badge variant="destructive" className="h-5 text-xs px-1.5 dm-badge">
                      {dm.unread}
                    </Badge>
                  )}
                </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-slate-600">
                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-slate-800" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-white">{user.firstName} {user.lastName}</div>
                <div className="text-xs text-slate-400 flex items-center space-x-1">
                  {getRoleIcon(user.role)}
                  <span>{user.role.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700"
                onClick={() => setActiveView("people")}
                title="People & Teams"
              >
                <Users className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700"
                    title="Settings & More"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => setActiveView("integrations")}>
                    <Zap className="h-4 w-4 mr-2" />
                    Integrations
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => setShowThemeCustomizer(true)}>
                    <Settings2 className="h-4 w-4 mr-2" />
                    Workspace Themes
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowLayoutCustomizer(true)}>
                    <Settings2 className="h-4 w-4 mr-2" />
                    Workspace Layout
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowGamification(true)}>
                    <Trophy className="h-4 w-4 mr-2" />
                    Achievements
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowOnboarding(true)}>
                    <Rocket className="h-4 w-4 mr-2" />
                    Getting Started
                  </DropdownMenuItem>
                  {(user.role === 'admin' || user.role === 'super_admin') && (
                    <DropdownMenuItem onClick={() => setLocation("/email-test")}>
                      <Mail className="h-4 w-4 mr-2" />
                      Email Templates
                    </DropdownMenuItem>
                  )}
                  {user.role === 'super_admin' && (
                    <DropdownMenuItem onClick={() => setShowEnterprisePanel(true)}>
                      <Shield className="h-4 w-4 mr-2" />
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  <Separator />
                  <DropdownMenuItem 
                    onClick={() => logout()}
                    disabled={false}
                    className="text-red-600"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle className="w-2 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 transition-colors cursor-col-resize" />

        {/* Main Content Panel */}
        <ResizablePanel defaultSize={80} minSize={50}>
          <div className="flex-1 flex flex-col">
        {/* Enhanced Channel Header with Navigation */}
        <div className="h-14 bg-white dark:bg-slate-900 border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              {selectedDM ? (
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs bg-blue-500 text-white">
                        {selectedDM.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
                  </div>
                  <h1 className="font-semibold text-lg">{selectedDM}</h1>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  {channels.find(c => c.name === selectedChannel)?.type === "private" ? (
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Hash className="h-5 w-5 text-muted-foreground" />
                  )}
                  <h1 className="font-semibold text-lg">{selectedChannel}</h1>
                  <Star className="h-4 w-4 text-muted-foreground hover:text-yellow-500 cursor-pointer transition-colors" />
                </div>
              )}
            </div>
            
            {/* Navigation Tabs */}
            <div className="flex items-center space-x-1">
              <Button 
                variant={activeView === "chat" ? "default" : "ghost"} 
                size="sm"
                onClick={() => setActiveView("chat")}
                className="flex items-center space-x-2"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Chat</span>
              </Button>
              <Button 
                variant={activeView === "tasks" ? "default" : "ghost"} 
                size="sm"
                onClick={() => setActiveView("tasks")}
                className="flex items-center space-x-2"
              >
                <CheckSquare className="h-4 w-4" />
                <span>Tasks</span>
              </Button>
              <Button 
                variant={activeView === "calendar" ? "default" : "ghost"} 
                size="sm"
                onClick={() => setActiveView("calendar")}
                className="flex items-center space-x-2"
              >
                <CalendarIcon className="h-4 w-4" />
                <span>Calendar</span>
              </Button>
              <Button 
                variant={activeView === "files" ? "default" : "ghost"} 
                size="sm"
                onClick={() => setActiveView("files")}
                className="flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>Files</span>
              </Button>
              <Button 
                variant={activeView === "documents" ? "default" : "ghost"} 
                size="sm"
                onClick={() => setActiveView("documents")}
                className="flex items-center space-x-2"
              >
                <FileText className="h-4 w-4" />
                <span>Docs</span>
              </Button>
              <Button 
                variant={activeView === "search" ? "default" : "ghost"} 
                size="sm"
                onClick={() => setActiveView("search")}
                className="flex items-center space-x-2"
              >
                <Search className="h-4 w-4" />
                <span>Search</span>
              </Button>

            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <NotificationCenter />
            <SimpleThemeSelector />
            {selectedDM && (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                  onClick={() => {
                    setCallType("voice");
                    setShowVoiceCall(true);
                  }}
                >
                  <Phone className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                  onClick={() => {
                    setCallType("video");
                    setShowVoiceCall(true);
                  }}
                >
                  <Video className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Users className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content Area based on active view */}
        <div className="flex-1 bg-background">
          {activeView === "chat" && (
            <RealTimeChat
              channelId={selectedDM ? undefined : selectedChannel}
              recipientId={selectedDM ? directMessages.find(dm => dm.name === selectedDM)?.id : undefined}
              recipientName={selectedDM}
            />
          )}

          {activeView === "threads" && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="p-4 bg-muted/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                  <MessageSquare className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Threads</h3>
                  <p className="text-muted-foreground">View and manage message threads</p>
                </div>
              </div>
            </div>
          )}

          {activeView === "mentions" && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="p-4 bg-muted/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                  <Bell className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Mentions & Reactions</h3>
                  <p className="text-muted-foreground">View all your mentions and reactions</p>
                </div>
              </div>
            </div>
          )}

          {activeView === "saved" && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="p-4 bg-muted/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                  <Star className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Saved Items</h3>
                  <p className="text-muted-foreground">Access your saved messages and files</p>
                </div>
              </div>
            </div>
          )}

          {activeView === "people" && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="p-4 bg-muted/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">People & User Groups</h3>
                  <p className="text-muted-foreground">Manage team members and user groups</p>
                </div>
              </div>
            </div>
          )}

          {activeView === "ai" && <EnhancedAI />}

          {activeView === "tasks" && (
            <RobustTaskBoard 
              selectedChannel={selectedChannel === 'general' ? '550e8400-e29b-41d4-a716-446655440000' : selectedChannel}
              workspaceId={selectedWorkspace}
            />
          )}

          {activeView === "calendar" && (
            <EnhancedCalendar selectedChannel={selectedChannel} />
          )}

          {activeView === "search" && <EnhancedSearch />}

          {activeView === "integrations" && (
            <div className="p-6">
              <IntegrationHub 
                onIntegrationToggle={(integrationId, isConnected) => {
                  console.log(`Integration ${integrationId} ${isConnected ? 'connected' : 'disconnected'}`);
                }}
              />
            </div>
          )}

          {activeView === "files" && (
            <div className="h-full">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold mb-2">Files & Storage</h2>
                <p className="text-gray-600">Upload, manage, and share files with your team</p>
              </div>
              <div className="flex-1">
                <WasabiFileUpload 
                  channelId={selectedChannel === 'general' ? '550e8400-e29b-41d4-a716-446655440000' : selectedChannel}
                  workspaceId={selectedWorkspace.toString()}
                />
              </div>
            </div>
          )}

          {activeView === "documents" && (
            <EnhancedDocumentSystem 
              workspaceName={workspaces.find(w => w.id === selectedWorkspace)?.name || "Demo"}
              documents={documents}
              onDocumentsChange={setDocuments}
            />
          )}


        </div>


          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Create Channel Dialog */}
      <Dialog open={showCreateChannel} onOpenChange={setShowCreateChannel}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create a channel</DialogTitle>
            <DialogDescription>
              Channels are where your team communicates. They're best when organized around a topic — #marketing, for example.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="channel-name">Name</Label>
              <div className="flex items-center space-x-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="channel-name"
                  placeholder="e.g. plan-budget"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="channel-description">Description (optional)</Label>
              <Input
                id="channel-description"
                placeholder="What's this channel about?"
                value={newChannelDescription}
                onChange={(e) => setNewChannelDescription(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Privacy</Label>
              <Select value={newChannelType} onValueChange={(value: "public" | "private") => setNewChannelType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    <div className="flex items-center space-x-2">
                      <Hash className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Public</div>
                        <div className="text-xs text-muted-foreground">Anyone in the workspace can join</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="private">
                    <div className="flex items-center space-x-2">
                      <Lock className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Private</div>
                        <div className="text-xs text-muted-foreground">Only specific people can be added</div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => {
              setShowCreateChannel(false);
              setNewChannelName("");
              setNewChannelDescription("");
              setNewChannelType("public");
            }}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (newChannelName.trim()) {
                  // Here you would typically make an API call to create the channel
                  console.log('Creating channel:', {
                    name: newChannelName,
                    description: newChannelDescription,
                    type: newChannelType
                  });
                  alert(`Channel #${newChannelName} created successfully!`);
                  setShowCreateChannel(false);
                  setNewChannelName("");
                  setNewChannelDescription("");
                  setNewChannelType("public");
                  setSelectedChannel(newChannelName);
                  setActiveView("chat");
                }
              }}
              disabled={!newChannelName.trim()}
            >
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Workspace Dialog */}
      <Dialog open={showCreateWorkspace} onOpenChange={setShowCreateWorkspace}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create a workspace</DialogTitle>
            <DialogDescription>
              Workspaces are where your teams collaborate. Create a new workspace to organize different teams or projects.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="workspace-name">Workspace name</Label>
              <Input
                id="workspace-name"
                placeholder="e.g. Marketing Team"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => {
              setShowCreateWorkspace(false);
              setNewWorkspaceName("");
            }}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (newWorkspaceName.trim()) {
                  // Create new workspace object
                  const newWorkspace = {
                    id: Date.now(),
                    name: newWorkspaceName,
                    initial: newWorkspaceName.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
                  };
                  
                  // Add workspace to the list
                  setWorkspaces(prev => [...prev, newWorkspace]);
                  console.log('Creating workspace:', newWorkspace);
                  alert(`Workspace "${newWorkspaceName}" created successfully!`);
                  setShowCreateWorkspace(false);
                  setNewWorkspaceName("");
                  setSelectedWorkspace(newWorkspace.id);
                }
              }}
              disabled={!newWorkspaceName.trim()}
            >
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false);
          setSelectedTask(null);
        }}
        onUpdate={(updatedTask) => {
          console.log('Task updated:', updatedTask);
          // Handle task update logic here
        }}
      />

      {/* File Viewer Modal */}
      <FileViewer
        file={selectedFile}
        isOpen={showFileModal}
        onClose={() => {
          setShowFileModal(false);
          setSelectedFile(null);
        }}
      />

      {/* Voice/Video Call Modal */}
      <VoiceVideoCall
        isOpen={showVoiceCall}
        onClose={() => setShowVoiceCall(false)}
        callType={callType}
        initialParticipants={selectedDM ? [selectedDM] : []}
      />

      {/* Interactive Onboarding */}
      <InteractiveOnboarding
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={() => {
          setShowOnboarding(false);
          // Could trigger achievement unlock here
        }}
      />

      {/* Gamification System */}
      <GamificationSystem
        isOpen={showGamification}
        onClose={() => setShowGamification(false)}
      />


      {/* Enterprise Admin Panel */}
      {user.role === 'super_admin' && (
        <EnterpriseAdminPanel
          isOpen={showEnterprisePanel}
          onClose={() => setShowEnterprisePanel(false)}
        />
      )}

      {/* Workspace Customizer Modal */}
      {showWorkspaceCustomizer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-6xl max-h-[95vh] overflow-hidden relative">
            <button
              onClick={() => setShowWorkspaceCustomizer(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10 bg-white dark:bg-gray-800 rounded-full p-2"
            >
              <X className="h-5 w-5" />
            </button>
            <WorkspaceCustomizer
              workspaceId={selectedWorkspace.toString()}
              currentTheme={workspaceTheme}
              currentLayout={sidebarLayout}
              currentVisibility={sidebarVisibility}
              onThemeChange={setWorkspaceTheme}
              onLayoutChange={setSidebarLayout}
              onVisibilityChange={setSidebarVisibility}
              onSave={() => {
                const config = {
                  theme: workspaceTheme,
                  layout: sidebarLayout,
                  visibility: sidebarVisibility
                };
                localStorage.setItem(`workspace-customization-${selectedWorkspace}`, JSON.stringify(config));
                setShowWorkspaceCustomizer(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Layout Customizer Modal */}
      {showLayoutCustomizer && (
        <WorkspaceLayoutCustomizer onClose={() => setShowLayoutCustomizer(false)} />
      )}

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false);
          setSelectedTask(null);
        }}
        onUpdate={(updatedTask) => {
          console.log('Task updated:', updatedTask);
          // Handle task update logic here
        }}
      />

      {/* File Viewer Modal */}
      <FileViewer
        file={selectedFile}
        isOpen={showFileModal}
        onClose={() => {
          setShowFileModal(false);
          setSelectedFile(null);
        }}
      />

      {/* Voice/Video Call Modal */}
      <VoiceVideoCall
        isOpen={showVoiceCall}
        onClose={() => setShowVoiceCall(false)}
        callType={callType}
        initialParticipants={selectedDM ? [selectedDM] : []}
      />

      {/* Interactive Onboarding */}
      <InteractiveOnboarding
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={() => {
          setShowOnboarding(false);
          // Could trigger achievement unlock here
        }}
      />

      {/* Gamification System */}
      <GamificationSystem
        isOpen={showGamification}
        onClose={() => setShowGamification(false)}
      />

      {/* Workspace Theme Customizer */}
      <WorkspaceThemeCustomizer
        isOpen={showThemeCustomizer}
        onClose={() => setShowThemeCustomizer(false)}
        onThemeChange={(theme) => {
          setWorkspaceTheme(theme);
          // Apply workspace-specific theme immediately
          document.documentElement.style.setProperty('--workspace-primary', theme.primary);
          document.documentElement.style.setProperty('--workspace-secondary', theme.secondary);
          document.documentElement.style.setProperty('--workspace-accent', theme.accent);
          document.documentElement.style.setProperty('--workspace-background', theme.background);
          document.documentElement.style.setProperty('--workspace-sidebar', theme.sidebar);
          document.documentElement.style.setProperty('--workspace-text', theme.text);
        }}
        workspaceId={selectedWorkspace}
      />

      {/* Enterprise Admin Panel */}
      {user.role === 'super_admin' && (
        <EnterpriseAdminPanel
          isOpen={showEnterprisePanel}
          onClose={() => setShowEnterprisePanel(false)}
        />
      )}
    </div>
    </UnifiedThemeProvider>
  );
}