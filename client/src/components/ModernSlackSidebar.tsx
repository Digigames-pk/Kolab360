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
  Edit3,
  Settings2
} from 'lucide-react';
import { SidebarCustomizer, SidebarSettings, useSidebarSettings } from './SidebarCustomizer';

interface ChannelStat {
  id: string;
  name: string;
  memberCount: number;
  activeMembers: number;
  lastActivity: string;
  messageCount: number;
  type: 'public' | 'private';
}

interface DMStat {
  id: string;
  name: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: string;
  unreadCount: number;
  totalMessages: number;
}

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
  onShowProfile?: () => void;
  onStartCall?: (type: 'voice' | 'video') => void;
  onShowSettings?: () => void;
  channelStats?: ChannelStat[];
  dmStats?: DMStat[];
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
  onWorkspaceSelect,
  onShowProfile,
  onStartCall,
  onShowSettings,
  channelStats = [],
  dmStats = []
}: ModernSlackSidebarProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [showSidebarCustomizer, setShowSidebarCustomizer] = useState(false);
  const { settings, updateSettings } = useSidebarSettings();

  // Always use dynamic stats from props
  const channels = channelStats.map(stat => ({
    id: stat.id,
    name: stat.name,
    type: stat.type,
    unread: Math.floor(Math.random() * 5), // Simulate unread messages
    memberCount: stat.memberCount,
    activeMembers: stat.activeMembers
  }));

  // Always use dynamic stats from props
  const directMessages = dmStats.map(stat => ({
    id: stat.id,
    name: stat.name,
    status: stat.status,
    unread: stat.unreadCount
  }));

  const getCurrentWorkspace = () => workspaces.find(w => w.id === selectedWorkspace);
  const currentWorkspace = getCurrentWorkspace();

  return (
    <>
    <div 
      className="h-full flex flex-col bg-white border-r border-gray-200" 
      style={{ width: `${settings.sidebarWidth}px` }}
    >
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
                  <p className="text-sm text-gray-500">
                    {channels.reduce((total, ch) => total + (ch.memberCount || 0), 0)} members, {channels.reduce((total, ch) => total + (ch.activeMembers || 0), 0)} online
                  </p>
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



      {/* Quick Actions */}
      {settings.sections.quickActions.visible && (
        <div 
          className={`px-4 py-3 space-y-1 ${settings.compactMode ? 'py-2' : 'py-3'}`}
          style={{ height: `${settings.sections.quickActions.height}px`, overflowY: 'auto' }}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">Quick Actions</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0"
              onClick={() => setShowSidebarCustomizer(true)}
            >
              <Settings2 className="h-3 w-3" />
            </Button>
          </div>
          
          <Button 
            variant={currentView === 'search' ? 'default' : 'ghost'} 
            className={`w-full justify-start ${settings.compactMode ? 'h-8 text-sm' : 'h-10'}`}
            onClick={() => onViewChange('search')}
          >
            <Search className={`${settings.compactMode ? 'h-3 w-3' : 'h-4 w-4'} mr-3`} />
            Advanced Search
          </Button>
          
          <Button 
            variant="ghost" 
            className={`w-full justify-start ${settings.compactMode ? 'h-8 text-sm' : 'h-10'}`}
            onClick={onShowNotifications}
          >
            <Bell className={`${settings.compactMode ? 'h-3 w-3' : 'h-4 w-4'} mr-3`} />
            Notifications
            {settings.showUnreadCounts && (
              <Badge variant="destructive" className="ml-auto">3</Badge>
            )}
          </Button>
          
          <Button 
            variant={currentView === 'saved' ? 'default' : 'ghost'} 
            className={`w-full justify-start ${settings.compactMode ? 'h-8 text-sm' : 'h-10'}`}
            onClick={() => onViewChange('saved')}
          >
            <Star className={`${settings.compactMode ? 'h-3 w-3' : 'h-4 w-4'} mr-3`} />
            Saved Items
          </Button>
          
          <Button 
            variant={currentView === 'threads' ? 'default' : 'ghost'} 
            className={`w-full justify-start ${settings.compactMode ? 'h-8 text-sm' : 'h-10'}`}
            onClick={() => onViewChange('threads')}
          >
            <MessageSquare className={`${settings.compactMode ? 'h-3 w-3' : 'h-4 w-4'} mr-3`} />
            Threads
          </Button>
          
          <Button 
            variant={currentView === 'mentions' ? 'default' : 'ghost'} 
            className={`w-full justify-start ${settings.compactMode ? 'h-8 text-sm' : 'h-10'}`}
            onClick={() => onViewChange('mentions')}
          >
            <Bell className={`${settings.compactMode ? 'h-3 w-3' : 'h-4 w-4'} mr-3`} />
            Mentions
          </Button>
          
          <Button 
            variant={currentView === 'people' ? 'default' : 'ghost'} 
            className={`w-full justify-start ${settings.compactMode ? 'h-8 text-sm' : 'h-10'}`}
            onClick={() => onViewChange('people')}
          >
            <Users className={`${settings.compactMode ? 'h-3 w-3' : 'h-4 w-4'} mr-3`} />
            People
          </Button>
        </div>
      )}

      {settings.sections.quickActions.visible && <Separator />}

      {/* Channels Section */}
      {settings.sections.channels.visible && (
        <div className="flex-1 overflow-hidden">
          <div 
            className="h-full overflow-y-auto"
            style={{ maxHeight: `${settings.sections.channels.height}px` }}
          >
            <div className={`px-4 ${settings.compactMode ? 'py-2' : 'py-3'}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700">Channels</h3>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              
              <div className={`space-y-1 ${settings.compactMode ? 'space-y-0' : 'space-y-1'}`}>
                {channels.map((channel) => (
                  <Button
                    key={channel.id}
                    variant={selectedChannel === channel.id ? 'secondary' : 'ghost'}
                    className={`w-full justify-start px-2 ${settings.compactMode ? 'py-0 h-6 text-xs' : 'py-1 h-8 text-sm'}`}
                    onClick={() => {
                      onChannelSelect(channel.id);
                      onViewChange('chat');
                    }}
                  >
                    {channel.type === 'private' ? (
                      <Lock className={`${settings.compactMode ? 'h-2 w-2' : 'h-3 w-3'} mr-2 text-gray-500`} />
                    ) : (
                      <Hash className={`${settings.compactMode ? 'h-2 w-2' : 'h-3 w-3'} mr-2 text-gray-500`} />
                    )}
                    <span className="truncate">{channel.name}</span>
                    <div className="ml-auto flex items-center space-x-1">
                      {/* Member count */}
                      <Badge 
                        variant="outline" 
                        className={`${settings.compactMode ? 'text-xs h-4 min-w-4 px-1' : 'text-xs h-5 min-w-5 px-1'} bg-blue-50 text-blue-600 border-blue-200`}
                      >
                        {channel.memberCount || 0}
                      </Badge>
                      {settings.showUnreadCounts && channel.unread > 0 && (
                        <Badge 
                          variant="destructive" 
                          className={`${settings.compactMode ? 'text-xs h-4 min-w-4' : 'text-xs h-5 min-w-5'}`}
                        >
                          {channel.unread}
                        </Badge>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Direct Messages Section */}
      {settings.sections.directMessages.visible && (
        <>
          <Separator />
          <div 
            className={`px-4 ${settings.compactMode ? 'py-2' : 'py-3'} overflow-y-auto`}
            style={{ maxHeight: `${settings.sections.directMessages.height}px` }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700">Direct messages</h3>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            
            <div className={`space-y-1 ${settings.compactMode ? 'space-y-0' : 'space-y-1'}`}>
              {directMessages.map((dm) => (
                <Button
                  key={dm.id}
                  variant="ghost"
                  className={`w-full justify-start px-2 ${settings.compactMode ? 'py-0 h-6 text-xs' : 'py-1 h-8 text-sm'}`}
                  onClick={() => {
                    onViewChange('chat');
                    console.log('Selected DM:', dm.name);
                  }}
                >
                  <div className="flex items-center mr-2">
                    {settings.showStatusIndicators && (
                      <Circle 
                        className={`${settings.compactMode ? 'h-1 w-1' : 'h-2 w-2'} mr-1 ${
                          dm.status === 'online' ? 'text-green-500 fill-current' :
                          dm.status === 'away' ? 'text-yellow-500 fill-current' :
                          'text-gray-400'
                        }`} 
                      />
                    )}
                    <Avatar className={settings.compactMode ? 'h-4 w-4' : 'h-5 w-5'}>
                      <AvatarFallback className={settings.compactMode ? 'text-xs' : 'text-xs'}>
                        {dm.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <span className="truncate">{dm.name}</span>
                  {settings.showUnreadCounts && dm.unread > 0 && (
                    <Badge 
                      variant="destructive" 
                      className={`ml-auto ${settings.compactMode ? 'text-xs h-4 min-w-4' : 'text-xs h-5 min-w-5'}`}
                    >
                      {dm.unread}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </>
      )}

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
              <DropdownMenuItem onClick={onShowProfile}>
                <User className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onShowThemeCustomizer}>
                <Edit3 className="h-4 w-4 mr-2" />
                Customize theme
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowSidebarCustomizer(true)}>
                <Settings2 className="h-4 w-4 mr-2" />
                Customize sidebar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewChange('integrations')}>
                <Archive className="h-4 w-4 mr-2" />
                Integrations
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => alert('Signing out...')}>
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
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Settings className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onShowSettings}>
                <Settings className="h-4 w-4 mr-2" />
                Audio Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStartCall?.('voice')}>
                <Phone className="h-4 w-4 mr-2" />
                Test Voice
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStartCall?.('video')}>
                <Video className="h-4 w-4 mr-2" />
                Test Video
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>

    {/* Sidebar Customizer Modal */}
    <SidebarCustomizer
      isOpen={showSidebarCustomizer}
      onClose={() => setShowSidebarCustomizer(false)}
      onSettingsChange={updateSettings}
      currentSettings={settings}
    />
    </>
  );
}