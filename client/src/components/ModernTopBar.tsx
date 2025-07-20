import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { 
  Search,
  Star,
  MoreHorizontal,
  Users,
  Settings,
  Info,
  Pin,
  Archive,
  Bell,
  Hash,
  Lock,
  Phone,
  Video,
  UserPlus,
  Shield,
  MessageSquare,
  CheckSquare,
  Calendar as CalendarIcon,
  Upload,
  Zap,
  FileText
} from 'lucide-react';

interface ModernTopBarProps {
  selectedChannel: string;
  currentView: string;
  onShowSearch: () => void;
  onShowNotifications: () => void;
  onViewChange?: (view: string) => void;
  onStartCall?: (type: 'voice' | 'video') => void;
  onInviteUsers?: () => void;
  onShowChannelInfo?: () => void;
  onShowSettings?: () => void;
  onShowPinned?: () => void;
  unreadNotificationCount?: number;
}

export function ModernTopBar({
  selectedChannel,
  currentView,
  onShowSearch,
  onShowNotifications,
  onViewChange,
  onStartCall,
  onInviteUsers,
  onShowChannelInfo,
  onShowSettings,
  onShowPinned,
  unreadNotificationCount = 0
}: ModernTopBarProps) {
  const getChannelInfo = () => {
    const channels = {
      'general': { name: 'general', description: 'Company-wide announcements and general discussion', members: 42, isPrivate: false },
      'random': { name: 'random', description: 'Random chat and off-topic discussions', members: 38, isPrivate: false },
      'dev-team': { name: 'dev-team', description: 'Development team coordination', members: 8, isPrivate: true },
      'design': { name: 'design', description: 'Design discussions and feedback', members: 12, isPrivate: false },
      'marketing': { name: 'marketing', description: 'Marketing campaigns and strategy', members: 15, isPrivate: true }
    };
    return channels[selectedChannel] || channels['general'];
  };

  const channelInfo = getChannelInfo();

  const getViewTitle = () => {
    switch (currentView) {
      case 'chat': return 'Messages';
      case 'tasks': return 'Task Board';
      case 'calendar': return 'Calendar';
      case 'files': return 'Files';
      default: return 'Messages';
    }
  };

  return (
    <div className="border-b border-gray-200 bg-white">
      {/* Main Header */}
      <div className="h-16 flex items-center justify-between px-6">
        {/* Left side - Channel info */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {channelInfo.isPrivate ? (
              <Lock className="h-5 w-5 text-gray-500" />
            ) : (
              <Hash className="h-5 w-5 text-gray-500" />
            )}
            <h1 className="text-xl font-bold text-gray-900">
              {channelInfo.name}
            </h1>
            <Star className="h-4 w-4 text-gray-400 hover:text-yellow-500 cursor-pointer transition-colors" />
          </div>
          
          <div className="hidden md:flex items-center space-x-4 text-sm text-gray-500">
            <span>{channelInfo.description}</span>
            <Badge variant="secondary" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              {channelInfo.members}
            </Badge>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={() => onStartCall?.('voice')}>
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onStartCall?.('video')}>
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onInviteUsers}>
            <UserPlus className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="sm" onClick={onShowSearch}>
            <Search className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="sm" onClick={onShowNotifications} className="relative">
            <Bell className="h-4 w-4" />
            {unreadNotificationCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-4 w-4 text-xs p-0 flex items-center justify-center"
              >
                {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
              </Badge>
            )}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {currentView === 'chat' && (
                <>
                  <DropdownMenuItem onClick={() => onShowPinned && onShowPinned()}>
                    <Pin className="h-4 w-4 mr-2" />
                    View pinned items
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onShowChannelInfo}>
                    <Info className="h-4 w-4 mr-2" />
                    Channel details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onInviteUsers}>
                    <Users className="h-4 w-4 mr-2" />
                    Manage members
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => alert('Archiving channel...')}>
                    <Archive className="h-4 w-4 mr-2" />
                    Archive channel
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem onClick={onShowSettings}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Channel Navigation Tabs */}
      <div className="px-6 py-2 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center space-x-1">
          <Button
            variant={currentView === 'chat' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange && onViewChange('chat')}
            className="h-8"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Messages
          </Button>
          
          <Button
            variant={currentView === 'tasks' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange && onViewChange('tasks')}
            className="h-8"
          >
            <CheckSquare className="h-4 w-4 mr-2" />
            Tasks
          </Button>
          
          <Button
            variant={currentView === 'calendar' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange && onViewChange('calendar')}
            className="h-8"
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Calendar
          </Button>
          
          <Button
            variant={currentView === 'files' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange && onViewChange('files')}
            className="h-8"
          >
            <Upload className="h-4 w-4 mr-2" />
            Files
          </Button>

          <Button
            variant={currentView === 'documents' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange && onViewChange('documents')}
            className="h-8"
          >
            <FileText className="h-4 w-4 mr-2" />
            Docs
          </Button>
          
          <Button
            variant={currentView === 'ai' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange && onViewChange('ai')}
            className="h-8"
          >
            <Zap className="h-4 w-4 mr-2 text-purple-500" />
            AI Assistant
          </Button>

          {/* Superadmin Debug Button */}
          {import.meta.env.DEV && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewChange && onViewChange('test')}
              className="h-8 ml-4 border-red-200 text-red-600"
            >
              Debug Test
            </Button>
          )}

          {/* Test Notification Button - Dev Only */}
          {import.meta.env.DEV && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Call a test function passed from parent
                if ((window as any).testNotifications) {
                  (window as any).testNotifications();
                }
              }}
              className="h-8 ml-2 border-green-200 text-green-600"
            >
              Test Notifications
            </Button>
          )}

        </div>
      </div>
    </div>
  );
}