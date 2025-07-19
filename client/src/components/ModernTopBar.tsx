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
  Shield
} from 'lucide-react';

interface ModernTopBarProps {
  selectedChannel: string;
  currentView: string;
  onShowSearch: () => void;
  onShowNotifications: () => void;
}

export function ModernTopBar({
  selectedChannel,
  currentView,
  onShowSearch,
  onShowNotifications
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
    <div className="h-16 border-b border-gray-200 bg-white">
      <div className="h-full flex items-center justify-between px-6">
        {/* Left side - Channel/View info */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {currentView === 'chat' ? (
              <>
                {channelInfo.isPrivate ? (
                  <Lock className="h-5 w-5 text-gray-500" />
                ) : (
                  <Hash className="h-5 w-5 text-gray-500" />
                )}
                <h1 className="text-xl font-bold text-gray-900">
                  {channelInfo.name}
                </h1>
              </>
            ) : (
              <h1 className="text-xl font-bold text-gray-900">
                {getViewTitle()}
              </h1>
            )}
            <Star className="h-4 w-4 text-gray-400 hover:text-yellow-500 cursor-pointer transition-colors" />
          </div>
          
          {currentView === 'chat' && (
            <div className="hidden md:flex items-center space-x-4 text-sm text-gray-500">
              <span>{channelInfo.description}</span>
              <Badge variant="secondary" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                {channelInfo.members}
              </Badge>
            </div>
          )}
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-2">
          {currentView === 'chat' && (
            <>
              <Button variant="ghost" size="sm">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Video className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <UserPlus className="h-4 w-4" />
              </Button>
            </>
          )}
          
          <Button variant="ghost" size="sm" onClick={onShowSearch}>
            <Search className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="sm" onClick={onShowNotifications}>
            <Bell className="h-4 w-4" />
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
                  <DropdownMenuItem>
                    <Pin className="h-4 w-4 mr-2" />
                    View pinned messages
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Info className="h-4 w-4 mr-2" />
                    Channel details
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Users className="h-4 w-4 mr-2" />
                    Manage members
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Archive className="h-4 w-4 mr-2" />
                    Archive channel
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}