import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  BellRing, 
  X, 
  Settings, 
  Mail, 
  MessageSquare, 
  CheckSquare, 
  Calendar, 
  Users, 
  Shield, 
  Activity,
  Clock,
  Eye,
  Trash2,
  VolumeX,
  Volume2
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'mention' | 'task' | 'calendar' | 'welcome' | 'workspace_invite' | 'password_reset' | 'daily_digest';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
  channel?: string;
  sender?: string;
}

interface NotificationSettings {
  emailNotifications: {
    mentions: boolean;
    tasks: boolean;
    calendar: boolean;
    welcome: boolean;
    workspaceInvites: boolean;
    passwordReset: boolean;
    dailyDigest: boolean;
  };
  inAppNotifications: {
    mentions: boolean;
    tasks: boolean;
    calendar: boolean;
    welcome: boolean;
    workspaceInvites: boolean;
    passwordReset: boolean;
    dailyDigest: boolean;
  };
  soundEnabled: boolean;
  desktopNotifications: boolean;
  doNotDisturb: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: string;
}

export function NotificationCenter({ isOpen, onClose, userRole }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Fetch notifications from API
  useEffect(() => {
    if (isOpen) {
      fetch('/api/notifications')
        .then(res => res.json())
        .then(data => {
          const formattedNotifications = data.map((n: any) => ({
            ...n,
            timestamp: new Date(n.timestamp)
          }));
          setNotifications(formattedNotifications);
        })
        .catch(err => console.error('Failed to fetch notifications:', err));
    }
  }, [isOpen]);

  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: {
      mentions: true,
      tasks: true,
      calendar: true,
      welcome: true,
      workspaceInvites: true,
      passwordReset: true,
      dailyDigest: true
    },
    inAppNotifications: {
      mentions: true,
      tasks: true,
      calendar: true,
      welcome: true,
      workspaceInvites: true,
      passwordReset: true,
      dailyDigest: true
    },
    soundEnabled: true,
    desktopNotifications: true,
    doNotDisturb: false,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  });

  const [activeTab, setActiveTab] = useState('notifications');

  const unreadCount = notifications.filter(n => !n.read).length;

  // Remove the mock notification generator since we're using real API data
  useEffect(() => {
    // Refresh notifications every 30 seconds while open
    if (isOpen) {
      const interval = setInterval(() => {
        fetch('/api/notifications')
          .then(res => res.json())
          .then(data => {
            const formattedNotifications = data.map((n: any) => ({
              ...n,
              timestamp: new Date(n.timestamp)
            }));
            setNotifications(formattedNotifications);
          })
          .catch(err => console.error('Failed to refresh notifications:', err));
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'POST' });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await fetch('/api/notifications/clear-all', { method: 'POST' });
      setNotifications([]);
    } catch (err) {
      console.error('Failed to clear all notifications:', err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'mention': return <MessageSquare className="h-4 w-4" />;
      case 'task': return <CheckSquare className="h-4 w-4" />;
      case 'calendar': return <Calendar className="h-4 w-4" />;
      case 'welcome': return <Users className="h-4 w-4" />;
      case 'workspace_invite': return <Mail className="h-4 w-4" />;
      case 'password_reset': return <Shield className="h-4 w-4" />;
      case 'daily_digest': return <Activity className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 border-red-200 text-red-800';
      case 'medium': return 'bg-yellow-100 border-yellow-200 text-yellow-800';
      case 'low': return 'bg-blue-100 border-blue-200 text-blue-800';
      default: return 'bg-gray-100 border-gray-200 text-gray-800';
    }
  };

  const updateEmailSetting = (type: keyof NotificationSettings['emailNotifications'], enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      emailNotifications: {
        ...prev.emailNotifications,
        [type]: enabled
      }
    }));
  };

  const updateInAppSetting = (type: keyof NotificationSettings['inAppNotifications'], enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      inAppNotifications: {
        ...prev.inAppNotifications,
        [type]: enabled
      }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white">
        <CardHeader className="bg-blue-50 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BellRing className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-blue-600">Notification Center</CardTitle>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount} unread
                </Badge>
              )}
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:bg-blue-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-50">
              <TabsTrigger value="notifications" className="flex items-center space-x-2">
                <Bell className="h-4 w-4" />
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs h-4 min-w-4">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </TabsTrigger>
            </TabsList>

            <div className="max-h-[70vh] overflow-y-auto">
              <TabsContent value="notifications" className="mt-0 p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Recent Notifications</h3>
                    <div className="flex space-x-2">
                      {unreadCount > 0 && (
                        <Button onClick={markAllAsRead} variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Mark All Read
                        </Button>
                      )}
                      <Button onClick={clearAllNotifications} variant="outline" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear All
                      </Button>
                    </div>
                  </div>
                  
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {notifications.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <Card 
                            key={notification.id} 
                            className={`border transition-colors ${
                              notification.read ? 'bg-gray-50' : 'bg-white border-blue-200'
                            }`}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3 flex-1">
                                  <div className={`p-2 rounded-full ${getPriorityColor(notification.priority)}`}>
                                    {getNotificationIcon(notification.type)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <h4 className={`font-semibold truncate ${
                                        notification.read ? 'text-gray-600' : 'text-gray-900'
                                      }`}>
                                        {notification.title}
                                      </h4>
                                      <Badge 
                                        variant="outline" 
                                        className={`text-xs ${getPriorityColor(notification.priority)}`}
                                      >
                                        {notification.priority}
                                      </Badge>
                                    </div>
                                    <p className={`text-sm truncate mb-2 ${
                                      notification.read ? 'text-gray-500' : 'text-gray-700'
                                    }`}>
                                      {notification.message}
                                    </p>
                                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                                      <div className="flex items-center space-x-1">
                                        <Clock className="h-3 w-3" />
                                        <span>{notification.timestamp.toLocaleTimeString()}</span>
                                      </div>
                                      {notification.channel && (
                                        <span>#{notification.channel}</span>
                                      )}
                                      {notification.sender && (
                                        <span>from {notification.sender}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex space-x-1 ml-2">
                                  {!notification.read && (
                                    <Button
                                      onClick={() => markAsRead(notification.id)}
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button
                                    onClick={() => deleteNotification(notification.id)}
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="mt-0 p-6">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Notification Settings</h3>
                  
                  {/* General Settings */}
                  <Card className="border-gray-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">General Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="flex flex-col space-y-1">
                          <span>Sound Notifications</span>
                          <span className="text-sm text-gray-500">Play sound for new notifications</span>
                        </Label>
                        <div className="flex items-center space-x-2">
                          {settings.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                          <Switch
                            checked={settings.soundEnabled}
                            onCheckedChange={(checked) => 
                              setSettings(prev => ({ ...prev, soundEnabled: checked }))
                            }
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label className="flex flex-col space-y-1">
                          <span>Desktop Notifications</span>
                          <span className="text-sm text-gray-500">Show browser notifications</span>
                        </Label>
                        <Switch
                          checked={settings.desktopNotifications}
                          onCheckedChange={(checked) => 
                            setSettings(prev => ({ ...prev, desktopNotifications: checked }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label className="flex flex-col space-y-1">
                          <span>Do Not Disturb</span>
                          <span className="text-sm text-gray-500">Temporarily disable all notifications</span>
                        </Label>
                        <Switch
                          checked={settings.doNotDisturb}
                          onCheckedChange={(checked) => 
                            setSettings(prev => ({ ...prev, doNotDisturb: checked }))
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Email Notifications */}
                  <Card className="border-gray-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span>Email Notifications</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {Object.entries(settings.emailNotifications).map(([key, enabled]) => (
                        <div key={key} className="flex items-center justify-between">
                          <Label className="capitalize">
                            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </Label>
                          <Switch
                            checked={enabled}
                            onCheckedChange={(checked) => 
                              updateEmailSetting(key as keyof NotificationSettings['emailNotifications'], checked)
                            }
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* In-App Notifications */}
                  <Card className="border-gray-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center space-x-2">
                        <Bell className="h-4 w-4" />
                        <span>In-App Notifications</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {Object.entries(settings.inAppNotifications).map(([key, enabled]) => (
                        <div key={key} className="flex items-center justify-between">
                          <Label className="capitalize">
                            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </Label>
                          <Switch
                            checked={enabled}
                            onCheckedChange={(checked) => 
                              updateInAppSetting(key as keyof NotificationSettings['inAppNotifications'], checked)
                            }
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}