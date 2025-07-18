import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { useLocation } from "wouter";
import { EnhancedTaskBoard } from "@/components/EnhancedTaskBoard";
import { EnhancedCalendar } from "@/components/EnhancedCalendar";
import { SimpleThemeSelector } from "@/components/SimpleThemeSelector";
import { EnhancedFileUpload } from "@/components/EnhancedFileUpload";
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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Send
} from "lucide-react";

export default function Home() {
  const { user, logoutMutation } = useAuth();
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
    { name: "general", unread: 0, type: "public", description: "Company-wide announcements and discussion" },
    { name: "random", unread: 3, type: "public", description: "Non-work banter and water cooler conversation" },
    { name: "announcements", unread: 1, type: "public", description: "Important company announcements" },
    { name: "dev-team", unread: 0, type: "private", description: "Development team discussions" },
    { name: "design-reviews", unread: 5, type: "public", description: "Design feedback and UI/UX discussions" },
    { name: "admin-only", unread: 2, type: "private", adminOnly: true, description: "Administrative discussions" },
  ];

  const directMessages = [
    { name: "John Doe", status: "online", unread: 2, lastMessage: "Thanks for the code review!" },
    { name: "Jane Smith", status: "away", unread: 0, lastMessage: "See you in the meeting" },
    { name: "AI Assistant", status: "online", unread: 1, lastMessage: "I can help you with that task" },
    { name: "Mike Chen", status: "offline", unread: 0, lastMessage: "API docs are updated" },
    { name: "Sarah Wilson", status: "online", unread: 3, lastMessage: "Can you review the mockups?" },
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
              <SimpleThemeSelector />
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
              onClick={() => setShowCreateChannel(true)}
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
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    {channel.type === "public" ? (
                      <Hash className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    ) : (
                      <Lock className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{channel.name}</div>
                      <div className="text-xs text-slate-500 truncate">{channel.description}</div>
                    </div>
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
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{dm.name}</div>
                      <div className="text-xs text-slate-500 truncate">{dm.lastMessage}</div>
                    </div>
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
                  <Badge variant="outline" className="text-xs">Direct Message</Badge>
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
                  <Badge variant="outline" className="text-xs">
                    {channels.find(c => c.name === selectedChannel)?.type === "private" ? "Private" : "Public"} Channel
                  </Badge>
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
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-green-600 hover:text-green-700">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700">
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
                  {!selectedDM && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setActiveView("people")}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Invite teammates
                    </Button>
                  )}
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
            <EnhancedTaskBoard selectedChannel={selectedChannel} />
          )}

          {activeView === "calendar" && (
            <EnhancedCalendar selectedChannel={selectedChannel} />
          )}

          {activeView === "files" && (
            <div className="flex-1 p-6">
              <EnhancedFileUpload 
                channel={selectedChannel}
                onFileUpload={(files) => {
                  console.log('Files uploaded:', files);
                  // Handle file upload logic here
                }}
              />
            </div>
          )}

          {activeView === "search" && (
            <div className="flex-1">
              <AdvancedSearch />
            </div>
          )}
        </div>

        {/* Enhanced Message Input */}
        {(activeView === "chat" || !activeView) && (
          <div className="p-4 border-t border-border bg-white dark:bg-slate-900">
            <div className="relative">
              <div className="min-h-[44px] max-h-32 px-3 py-2 border-2 border-border rounded-lg focus-within:border-blue-500 bg-background transition-all">
                <div className="flex items-start space-x-2">
                  <div className="flex-1">
                    <Input
                      placeholder={selectedDM ? `Message ${selectedDM}` : `Message #${selectedChannel}`}
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="border-0 bg-transparent p-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (messageText.trim()) {
                            // Handle message send
                            console.log('Sending message:', messageText);
                            setMessageText("");
                          }
                        }
                      }}
                    />
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                      title="Attach file"
                      onClick={() => setActiveView("files")}
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                      title="Add emoji"
                    >
                      <Smile className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                      title="Mention someone"
                    >
                      <AtSign className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-purple-500 hover:text-purple-600"
                      title="AI Assistant"
                    >
                      <Zap className="h-4 w-4" />
                    </Button>
                    {messageText.trim() && (
                      <Button 
                        size="sm" 
                        className="h-8 px-3 bg-blue-500 hover:bg-blue-600 text-white"
                        onClick={() => {
                          if (messageText.trim()) {
                            console.log('Sending message:', messageText);
                            setMessageText("");
                          }
                        }}
                      >
                        <Send className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Message formatting help */}
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <div className="flex items-center space-x-4">
                  <span><code>@username</code> to mention</span>
                  <span><code>#channel</code> to link channel</span>
                  <span><code>**bold**</code> for emphasis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>Press Enter to send</span>
                  <span>•</span>
                  <span>Shift+Enter for new line</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

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
    </div>
  );
}