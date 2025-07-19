import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
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
  Archive,
  Bookmark,
  HeadphonesIcon,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Circle,
  Edit3
} from 'lucide-react';

interface ModernSlackSidebarProps {
  selectedChannel: string;
  onChannelSelect: (channel: string) => void;
  onViewChange: (view: string) => void;
  currentView: string;
  onShowThemeCustomizer: () => void;
  onShowSearch: () => void;
  onShowNotifications: () => void;
  workspaces: any[];
  selectedWorkspace: number;
  onWorkspaceSelect: (id: number) => void;
}

export function ModernSlackSidebar({
  selectedChannel,
  onChannelSelect,
  onViewChange,
  currentView,
  onShowThemeCustomizer,
  onShowSearch,
  onShowNotifications,
  workspaces,
  selectedWorkspace,
  onWorkspaceSelect
}: ModernSlackSidebarProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);

  const channels = [
    { id: 'general', name: 'general', type: 'public', unread: 3 },
    { id: 'random', name: 'random', type: 'public', unread: 0 },
    { id: 'dev-team', name: 'dev-team', type: 'private', unread: 12 },
    { id: 'design', name: 'design', type: 'public', unread: 0 },
    { id: 'marketing', name: 'marketing', type: 'private', unread: 5 }
  ];

  const directMessages = [
    { id: 'john-doe', name: 'John Doe', status: 'online', unread: 2 },
    { id: 'jane-smith', name: 'Jane Smith', status: 'away', unread: 0 },
    { id: 'mike-johnson', name: 'Mike Johnson', status: 'offline', unread: 1 }
  ];

  const getCurrentWorkspace = () => workspaces.find(w => w.id === selectedWorkspace);
  const currentWorkspace = getCurrentWorkspace();

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Workspace Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-2 h-auto">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                  {currentWorkspace?.name?.charAt(0) || 'W'}
                </div>
                <div className="text-left">
                  <h2 className="font-bold text-gray-900 text-lg">
                    {currentWorkspace?.name || 'Workspace'}
                  </h2>
                  <p className="text-sm text-gray-500">3 members online</p>
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            {workspaces.map((workspace) => (
              <DropdownMenuItem
                key={workspace.id}
                onClick={() => onWorkspaceSelect(workspace.id)}
                className={workspace.id === selectedWorkspace ? 'bg-purple-50' : ''}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-md flex items-center justify-center text-white font-bold">
                    {workspace.name.charAt(0)}
                  </div>
                  <span>{workspace.name}</span>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Plus className="h-4 w-4 mr-2" />
              Create workspace
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Navigation Icons */}
      <div className="px-4 py-3 space-y-1">
        <Button
          variant={currentView === 'chat' ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => onViewChange('chat')}
        >
          <MessageSquare className="h-4 w-4 mr-3" />
          Messages
          <Badge variant="secondary" className="ml-auto">12</Badge>
        </Button>
        
        <Button
          variant={currentView === 'tasks' ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => onViewChange('tasks')}
        >
          <CheckSquare className="h-4 w-4 mr-3" />
          Tasks
        </Button>
        
        <Button
          variant={currentView === 'calendar' ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => onViewChange('calendar')}
        >
          <CalendarIcon className="h-4 w-4 mr-3" />
          Calendar
        </Button>
        
        <Button
          variant={currentView === 'files' ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => onViewChange('files')}
        >
          <Upload className="h-4 w-4 mr-3" />
          Files
        </Button>
        
        <Button
          variant={currentView === 'ai' ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => onViewChange('ai')}
        >
          <Zap className="h-4 w-4 mr-3 text-purple-500" />
          AI Assistant
        </Button>
        
        <Button
          variant={currentView === 'integrations' ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => onViewChange('integrations')}
        >
          <Archive className="h-4 w-4 mr-3" />
          Integrations
        </Button>
      </div>

      <Separator />

      {/* Quick Actions */}
      <div className="px-4 py-3 space-y-1">
        <Button 
          variant={currentView === 'search' ? 'default' : 'ghost'} 
          className="w-full justify-start" 
          onClick={() => onViewChange('search')}
        >
          <Search className="h-4 w-4 mr-3" />
          Advanced Search
        </Button>
        
        <Button variant="ghost" className="w-full justify-start" onClick={onShowNotifications}>
          <Bell className="h-4 w-4 mr-3" />
          Notifications
          <Badge variant="destructive" className="ml-auto">3</Badge>
        </Button>
        
        <Button 
          variant={currentView === 'saved' ? 'default' : 'ghost'} 
          className="w-full justify-start"
          onClick={() => onViewChange('saved')}
        >
          <Star className="h-4 w-4 mr-3" />
          Saved Items
        </Button>
        
        <Button 
          variant={currentView === 'threads' ? 'default' : 'ghost'} 
          className="w-full justify-start"
          onClick={() => onViewChange('threads')}
        >
          <MessageSquare className="h-4 w-4 mr-3" />
          Threads
        </Button>
        
        <Button 
          variant={currentView === 'mentions' ? 'default' : 'ghost'} 
          className="w-full justify-start"
          onClick={() => onViewChange('mentions')}
        >
          <Bell className="h-4 w-4 mr-3" />
          Mentions
        </Button>
        
        <Button 
          variant={currentView === 'people' ? 'default' : 'ghost'} 
          className="w-full justify-start"
          onClick={() => onViewChange('people')}
        >
          <Users className="h-4 w-4 mr-3" />
          People
        </Button>
      </div>

      <Separator />

      {/* Channels Section */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700">Channels</h3>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="space-y-1">
              {channels.map((channel) => (
                <Button
                  key={channel.id}
                  variant={selectedChannel === channel.id ? 'secondary' : 'ghost'}
                  className="w-full justify-start px-2 py-1 h-8"
                  onClick={() => onChannelSelect(channel.id)}
                >
                  {channel.type === 'private' ? (
                    <Lock className="h-3 w-3 mr-2 text-gray-500" />
                  ) : (
                    <Hash className="h-3 w-3 mr-2 text-gray-500" />
                  )}
                  <span className="text-sm truncate">{channel.name}</span>
                  {channel.unread > 0 && (
                    <Badge variant="destructive" className="ml-auto text-xs h-5 min-w-5">
                      {channel.unread}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Direct Messages Section */}
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700">Direct messages</h3>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="space-y-1">
              {directMessages.map((dm) => (
                <Button
                  key={dm.id}
                  variant="ghost"
                  className="w-full justify-start px-2 py-1 h-8"
                >
                  <div className="flex items-center mr-2">
                    <Circle 
                      className={`h-2 w-2 mr-1 ${
                        dm.status === 'online' ? 'text-green-500 fill-current' :
                        dm.status === 'away' ? 'text-yellow-500 fill-current' :
                        'text-gray-400'
                      }`} 
                    />
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-xs">
                        {dm.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <span className="text-sm truncate">{dm.name}</span>
                  {dm.unread > 0 && (
                    <Badge variant="destructive" className="ml-auto text-xs h-5 min-w-5">
                      {dm.unread}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* User Profile Footer */}
      <div className="border-t border-gray-200 p-4 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-purple-600 text-white">RU</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-gray-900">Regular User</p>
              <p className="text-xs text-gray-500">Online</p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <User className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onShowThemeCustomizer}>
                <Edit3 className="h-4 w-4 mr-2" />
                Customize theme
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Voice Controls */}
        <div className="flex items-center justify-center space-x-2 mt-3">
          <Button
            variant={isMuted ? "destructive" : "ghost"}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
          </Button>
          
          <Button
            variant={isDeafened ? "destructive" : "ghost"}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setIsDeafened(!isDeafened)}
          >
            {isDeafened ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
          </Button>
          
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Settings className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}