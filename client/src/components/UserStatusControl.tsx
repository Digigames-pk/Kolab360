import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel 
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Circle, 
  Moon, 
  Clock, 
  XCircle, 
  Volume2, 
  VolumeX,
  Settings
} from 'lucide-react';
import { notificationSounds, UserStatus } from '@/utils/notificationSounds';

interface UserStatusControlProps {
  className?: string;
}

export function UserStatusControl({ className }: UserStatusControlProps) {
  const [preferences, setPreferences] = useState(notificationSounds.getPreferences());

  useEffect(() => {
    // Sync with notification manager
    setPreferences(notificationSounds.getPreferences());
  }, []);

  const updateStatus = (status: UserStatus) => {
    notificationSounds.setUserStatus(status);
    setPreferences(notificationSounds.getPreferences());
  };

  const toggleSounds = (enabled: boolean) => {
    notificationSounds.setSoundEnabled(enabled);
    setPreferences(notificationSounds.getPreferences());
  };

  const toggleQuietHours = (enabled: boolean) => {
    notificationSounds.setQuietHours(enabled);
    setPreferences(notificationSounds.getPreferences());
  };

  const getStatusIcon = (status: UserStatus) => {
    switch (status) {
      case 'available': return <Circle className="w-3 h-3 fill-green-500 text-green-500" />;
      case 'away': return <Clock className="w-3 h-3 text-yellow-500" />;
      case 'busy': return <Moon className="w-3 h-3 text-red-500" />;
      case 'do_not_disturb': return <XCircle className="w-3 h-3 text-red-600" />;
    }
  };

  const getStatusLabel = (status: UserStatus) => {
    switch (status) {
      case 'available': return 'Available';
      case 'away': return 'Away';
      case 'busy': return 'Busy';
      case 'do_not_disturb': return 'Do Not Disturb';
    }
  };

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      case 'do_not_disturb': return 'bg-red-600';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={`flex items-center gap-2 ${className}`}>
          {getStatusIcon(preferences.status)}
          <span className="text-sm">{getStatusLabel(preferences.status)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Status & Notifications
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Status Options */}
        <DropdownMenuItem onClick={() => updateStatus('available')}>
          <Circle className="w-3 h-3 fill-green-500 text-green-500 mr-2" />
          Available
          {preferences.status === 'available' && <Badge variant="secondary" className="ml-auto">Active</Badge>}
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => updateStatus('away')}>
          <Clock className="w-3 h-3 text-yellow-500 mr-2" />
          Away
          {preferences.status === 'away' && <Badge variant="secondary" className="ml-auto">Active</Badge>}
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => updateStatus('busy')}>
          <Moon className="w-3 h-3 text-red-500 mr-2" />
          Busy
          {preferences.status === 'busy' && <Badge variant="secondary" className="ml-auto">Active</Badge>}
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => updateStatus('do_not_disturb')}>
          <XCircle className="w-3 h-3 text-red-600 mr-2" />
          Do Not Disturb
          {preferences.status === 'do_not_disturb' && <Badge variant="secondary" className="ml-auto">Active</Badge>}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Sound Controls */}
        <div className="px-2 py-1">
          <div className="flex items-center justify-between">
            <Label htmlFor="sound-toggle" className="flex items-center gap-2 text-sm">
              {preferences.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              Notification Sounds
            </Label>
            <Switch
              id="sound-toggle"
              checked={preferences.soundEnabled}
              onCheckedChange={toggleSounds}
            />
          </div>
        </div>
        
        <div className="px-2 py-1">
          <div className="flex items-center justify-between">
            <Label htmlFor="quiet-hours-toggle" className="text-sm">
              Quiet Hours (10PM-8AM)
            </Label>
            <Switch
              id="quiet-hours-toggle"
              checked={preferences.quietHours.enabled}
              onCheckedChange={toggleQuietHours}
            />
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        {/* Status Info */}
        <div className="px-2 py-1 text-xs text-muted-foreground">
          {preferences.status === 'busy' || preferences.status === 'do_not_disturb' 
            ? "🔇 Sounds are muted while busy/DND" 
            : preferences.quietHours.enabled 
            ? "🌙 Quiet hours: 10PM - 8AM" 
            : "🔊 Notifications enabled"}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}