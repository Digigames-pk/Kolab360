import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { useLocation } from "wouter";
import { TaskBoard } from "@/components/TaskBoard";
import { Calendar } from "@/components/Calendar";
import { SimpleThemeSelector } from "@/components/SimpleThemeSelector";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  CheckSquare
} from "lucide-react";

export default function Home() {
  const { user, logoutMutation } = useAuth();
  const [location, setLocation] = useLocation();
  const [activeView, setActiveView] = useState("chat");
  const [selectedChannel, setSelectedChannel] = useState("general");
  const [selectedDM, setSelectedDM] = useState(null);

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

  const workspaces = [
    { id: 1, name: "CollabSpace Demo", initial: "CD" },
    { id: 2, name: "Development Team", initial: "DT" },
  ];

  const channels = [
    { name: "general", unread: 0, type: "public" },
    { name: "random", unread: 3, type: "public" },
    { name: "announcements", unread: 1, type: "public" },
    { name: "dev-team", unread: 0, type: "private" },
    { name: "admin-only", unread: 2, type: "private", adminOnly: true },
  ];

  const directMessages = [
    { name: "John Doe", status: "online", unread: 2 },
    { name: "Jane Smith", status: "away", unread: 0 },
    { name: "AI Assistant", status: "online", unread: 1 },
  ];

  const filteredChannels = channels.filter(channel => 
    !channel.adminOnly || user.role === 'admin' || user.role === 'super_admin'
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Workspace Switcher Sidebar */}
      <div className="w-16 bg-slate-900 flex flex-col items-center py-3 space-y-2">
        {workspaces.map((workspace) => (
          <div
            key={workspace.id}
            className="w-10 h-10 bg-slate-600 hover:bg-slate-500 rounded-lg flex items-center justify-center text-white font-medium text-sm cursor-pointer transition-colors"
          >
            {workspace.initial}
          </div>
        ))}
        <div className="w-10 h-10 border-2 border-dashed border-slate-600 hover:border-slate-400 rounded-lg flex items-center justify-center text-slate-400 cursor-pointer transition-colors">
          <Plus className="h-5 w-5" />
        </div>
      </div>

      {/* Main Sidebar */}
      <div className="w-64 bg-slate-800 text-slate-100 flex flex-col">
        {/* Workspace Header */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-lg text-white">Kolab360 Demo</h2>
              <div className="flex items-center space-x-2 text-sm text-slate-300">
                {getRoleIcon(user.role)}
                <span>{user.firstName} {user.lastName}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeSelector />
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="px-4 py-3 space-y-1">
          <div 
            className="flex items-center space-x-3 px-2 py-1 rounded hover:bg-slate-700 cursor-pointer"
            onClick={() => setActiveView("threads")}
          >
            <MessageSquare className="h-4 w-4" />
            <span className="text-sm">Threads</span>
          </div>
          <div 
            className="flex items-center space-x-3 px-2 py-1 rounded hover:bg-slate-700 cursor-pointer"
            onClick={() => setActiveView("mentions")}
          >
            <Bell className="h-4 w-4" />
            <span className="text-sm">Mentions & reactions</span>
          </div>
          <div 
            className="flex items-center space-x-3 px-2 py-1 rounded hover:bg-slate-700 cursor-pointer"
            onClick={() => setActiveView("saved")}
          >
            <Star className="h-4 w-4" />
            <span className="text-sm">Saved items</span>
          </div>
          <div 
            className="flex items-center space-x-3 px-2 py-1 rounded hover:bg-slate-700 cursor-pointer"
            onClick={() => setActiveView("people")}
          >
            <Users className="h-4 w-4" />
            <span className="text-sm">People & user groups</span>
          </div>
          <div 
            className="flex items-center space-x-3 px-2 py-1 rounded hover:bg-slate-700 cursor-pointer"
            onClick={() => setActiveView("ai")}
          >
            <Zap className="h-4 w-4 text-purple-400" />
            <span className="text-sm">AI Assistant</span>
          </div>
          {(user.role === 'admin' || user.role === 'super_admin') && (
            <div 
              className="flex items-center space-x-3 px-2 py-1 rounded hover:bg-slate-700 cursor-pointer"
              onClick={() => setLocation("/email-test")}
            >
              <Mail className="h-4 w-4 text-blue-400" />
              <span className="text-sm">Email Templates</span>
            </div>
          )}
        </div>

        <Separator className="bg-slate-700" />

        {/* Channels */}
        <div className="flex-1 px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-300">Channels</span>
            <Plus 
              className="h-4 w-4 text-slate-400 hover:text-white cursor-pointer" 
              onClick={() => {
                const channelName = prompt("Enter channel name:");
                if (channelName) {
                  alert(`Channel #${channelName} would be created`);
                }
              }}
            />
          </div>
          
          <ScrollArea className="h-32">
            <div className="space-y-1">
              {filteredChannels.map((channel) => (
                <div
                  key={channel.name}
                  className={`flex items-center justify-between px-2 py-1 rounded hover:bg-slate-700 cursor-pointer group ${selectedChannel === channel.name ? 'bg-slate-700' : ''}`}
                  onClick={() => {
                    setActiveView("chat");
                    setSelectedChannel(channel.name);
                    setSelectedDM(null);
                  }}
                >
                  <div className="flex items-center space-x-2">
                    {channel.type === "public" ? (
                      <Hash className="h-4 w-4 text-slate-400" />
                    ) : (
                      <Lock className="h-4 w-4 text-slate-400" />
                    )}
                    <span className="text-sm">{channel.name}</span>
                  </div>
                  {channel.unread > 0 && (
                    <Badge variant="destructive" className="h-5 text-xs px-1.5">
                      {channel.unread}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          <Separator className="bg-slate-700 my-3" />

          {/* Direct Messages */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-300">Direct messages</span>
            <Plus 
              className="h-4 w-4 text-slate-400 hover:text-white cursor-pointer"
              onClick={() => {
                const userName = prompt("Enter username to start a conversation:");
                if (userName) {
                  alert(`Direct message with ${userName} would be started`);
                }
              }}
            />
          </div>
          
          <ScrollArea className="h-24">
            <div className="space-y-1">
              {directMessages.map((dm) => (
                <div
                  key={dm.name}
                  className={`flex items-center justify-between px-2 py-1 rounded hover:bg-slate-700 cursor-pointer ${selectedDM === dm.name ? 'bg-slate-700' : ''}`}
                  onClick={() => {
                    setActiveView("chat");
                    setSelectedDM(dm.name);
                    setSelectedChannel(null);
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <div className="relative">
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
                    <span className="text-sm">{dm.name}</span>
                  </div>
                  {dm.unread > 0 && (
                    <Badge variant="destructive" className="h-5 text-xs px-1.5">
                      {dm.unread}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
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
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Channel Header with Navigation */}
        <div className="h-14 bg-white dark:bg-slate-900 border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <Hash className="h-5 w-5 text-muted-foreground" />
              <h1 className="font-semibold text-lg">general</h1>
              <Star className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer" />
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
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <SimpleThemeSelector />
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Video className="h-4 w-4" />
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
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4 max-w-md">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Hash className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Welcome to #{selectedChannel}</h2>
                  <p className="text-muted-foreground">
                    {selectedDM ? 
                      `This is your conversation with ${selectedDM}. Start chatting!` :
                      `This is the beginning of the #${selectedChannel} channel. Start a conversation or check out some channels and direct messages.`
                    }
                  </p>
                </div>
                <div className="flex flex-col space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    data-theme-target="primary"
                    onClick={() => setActiveView("ai")}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Try AI Assistant
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setActiveView("people")}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Invite teammates
                  </Button>
                </div>
              </div>
            </div>
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

          {activeView === "ai" && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="p-4 bg-purple-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                  <Zap className="h-8 w-8 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">AI Assistant</h3>
                  <p className="text-muted-foreground">Chat with AI for help and insights</p>
                </div>
              </div>
            </div>
          )}

          {activeView === "tasks" && (
            <TaskBoard />
          )}

          {activeView === "calendar" && (
            <Calendar />
          )}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-border">
          <div className="relative">
            <div className="min-h-[44px] max-h-32 px-3 py-2 border border-border rounded-lg focus-within:border-primary bg-background">
              <div className="flex items-start space-x-2">
                <div className="flex-1">
                  <div 
                    contentEditable
                    className="outline-none text-sm placeholder:text-muted-foreground min-h-[24px]"
                    data-placeholder="Message #general"
                    style={{
                      caretColor: 'currentColor'
                    }}
                  />
                </div>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground">
                    <Zap className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}