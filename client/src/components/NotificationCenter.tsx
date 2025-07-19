import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Settings, Mail, MessageSquare, Calendar, User, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

interface InAppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  createdAt: string;
}

interface NotificationPreferences {
  email: boolean;
  mentions: boolean;
  tasks: boolean;
  calendar: boolean;
  directMessages: boolean;
  workspaceUpdates: boolean;
  dailyDigest: boolean;
  weeklyReport: boolean;
}

const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications = [], isLoading: notificationsLoading } = useQuery({
    queryKey: ['/api/notifications/in-app'],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch preferences
  const { data: preferences, isLoading: preferencesLoading } = useQuery({
    queryKey: ['/api/notifications/preferences'],
  });

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications/in-app/${notificationId}/read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to mark as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/in-app'] });
    },
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (newPreferences: Partial<NotificationPreferences>) => {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPreferences)
      });
      if (!response.ok) throw new Error('Failed to update preferences');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/preferences'] });
      toast({
        title: "Preferences Updated",
        description: "Your notification preferences have been saved.",
      });
    },
  });

  const unreadCount = notifications.filter((n: InAppNotification) => !n.read).length;

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  };

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: boolean) => {
    updatePreferencesMutation.mutate({ [key]: value });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'mention':
        return <MessageSquare className="h-4 w-4" />;
      case 'task_assigned':
      case 'task_completed':
        return <FileText className="h-4 w-4" />;
      case 'calendar_invite':
      case 'calendar_reminder':
        return <Calendar className="h-4 w-4" />;
      case 'direct_message':
        return <Mail className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-blue-500';
      case 'low':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Center
          </DialogTitle>
          <DialogDescription>
            Manage your notifications and communication preferences
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="notifications" className="h-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="notifications">
              Notifications
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="h-full">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Recent Notifications</CardTitle>
                  {unreadCount > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        notifications
                          .filter((n: InAppNotification) => !n.read)
                          .forEach((n: InAppNotification) => handleMarkAsRead(n.id));
                      }}
                    >
                      Mark all read
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-96">
                  {notificationsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-sm text-gray-500 mt-2">Loading notifications...</p>
                      </div>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Bell className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                      <p className="text-sm text-gray-500">You're all caught up!</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {notifications.map((notification: InAppNotification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-l-4 hover:bg-gray-50 transition-colors ${
                            notification.read ? 'bg-white border-l-gray-200' : 'bg-blue-50 border-l-blue-500'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                              <div className={`p-2 rounded-full ${getPriorityColor(notification.priority)} text-white`}>
                                {getNotificationIcon(notification.type)}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h4 className={`text-sm font-medium ${
                                    notification.read ? 'text-gray-700' : 'text-gray-900'
                                  }`}>
                                    {notification.title}
                                  </h4>
                                  <span className="text-xs text-gray-500">
                                    {formatTimeAgo(notification.createdAt)}
                                  </span>
                                </div>
                                <p className={`text-sm mt-1 ${
                                  notification.read ? 'text-gray-500' : 'text-gray-700'
                                }`}>
                                  {notification.message}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 ml-4">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                              {notification.actionUrl && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    // Navigate to the action URL
                                    window.location.href = notification.actionUrl!;
                                    handleMarkAsRead(notification.id);
                                  }}
                                >
                                  View
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="h-full">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notification Preferences</CardTitle>
                <p className="text-sm text-gray-600">
                  Choose how you want to be notified about different types of activity
                </p>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  {preferencesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-900">Real-time Notifications</h3>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <MessageSquare className="h-5 w-5 text-gray-500" />
                            <div>
                              <Label htmlFor="mentions" className="text-sm font-medium">
                                Mentions & Replies
                              </Label>
                              <p className="text-xs text-gray-500">When someone mentions you or replies to your message</p>
                            </div>
                          </div>
                          <Switch
                            id="mentions"
                            checked={preferences?.mentions ?? true}
                            onCheckedChange={(checked) => handlePreferenceChange('mentions', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-gray-500" />
                            <div>
                              <Label htmlFor="tasks" className="text-sm font-medium">
                                Tasks & Assignments
                              </Label>
                              <p className="text-xs text-gray-500">Task assignments, completions, and deadlines</p>
                            </div>
                          </div>
                          <Switch
                            id="tasks"
                            checked={preferences?.tasks ?? true}
                            onCheckedChange={(checked) => handlePreferenceChange('tasks', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Calendar className="h-5 w-5 text-gray-500" />
                            <div>
                              <Label htmlFor="calendar" className="text-sm font-medium">
                                Calendar Events
                              </Label>
                              <p className="text-xs text-gray-500">Meeting invites, reminders, and updates</p>
                            </div>
                          </div>
                          <Switch
                            id="calendar"
                            checked={preferences?.calendar ?? true}
                            onCheckedChange={(checked) => handlePreferenceChange('calendar', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Mail className="h-5 w-5 text-gray-500" />
                            <div>
                              <Label htmlFor="directMessages" className="text-sm font-medium">
                                Direct Messages
                              </Label>
                              <p className="text-xs text-gray-500">Private messages and conversations</p>
                            </div>
                          </div>
                          <Switch
                            id="directMessages"
                            checked={preferences?.directMessages ?? true}
                            onCheckedChange={(checked) => handlePreferenceChange('directMessages', checked)}
                          />
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Mail className="h-5 w-5 text-gray-500" />
                            <div>
                              <Label htmlFor="email" className="text-sm font-medium">
                                Email Notifications
                              </Label>
                              <p className="text-xs text-gray-500">Receive notifications via email</p>
                            </div>
                          </div>
                          <Switch
                            id="email"
                            checked={preferences?.email ?? true}
                            onCheckedChange={(checked) => handlePreferenceChange('email', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <User className="h-5 w-5 text-gray-500" />
                            <div>
                              <Label htmlFor="workspaceUpdates" className="text-sm font-medium">
                                Workspace Updates
                              </Label>
                              <p className="text-xs text-gray-500">New members, channels, and announcements</p>
                            </div>
                          </div>
                          <Switch
                            id="workspaceUpdates"
                            checked={preferences?.workspaceUpdates ?? true}
                            onCheckedChange={(checked) => handlePreferenceChange('workspaceUpdates', checked)}
                          />
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-900">Digest & Reports</h3>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <AlertCircle className="h-5 w-5 text-gray-500" />
                            <div>
                              <Label htmlFor="dailyDigest" className="text-sm font-medium">
                                Daily Digest
                              </Label>
                              <p className="text-xs text-gray-500">Summary of daily activity and updates</p>
                            </div>
                          </div>
                          <Switch
                            id="dailyDigest"
                            checked={preferences?.dailyDigest ?? false}
                            onCheckedChange={(checked) => handlePreferenceChange('dailyDigest', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Calendar className="h-5 w-5 text-gray-500" />
                            <div>
                              <Label htmlFor="weeklyReport" className="text-sm font-medium">
                                Weekly Report
                              </Label>
                              <p className="text-xs text-gray-500">Weekly summary of team progress and metrics</p>
                            </div>
                          </div>
                          <Switch
                            id="weeklyReport"
                            checked={preferences?.weeklyReport ?? false}
                            onCheckedChange={(checked) => handlePreferenceChange('weeklyReport', checked)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationCenter;