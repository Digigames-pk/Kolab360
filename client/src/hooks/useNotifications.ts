import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Notification {
  id: string;
  userId: string;
  type: 'mention' | 'task' | 'calendar' | 'welcome' | 'workspace_invite' | 'password_reset' | 'daily_digest';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  channel?: string;
  sender?: string;
  actionUrl?: string;
}

interface NotificationSettings {
  userId: string;
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

export function useNotifications() {
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['/api/notifications'],
    queryFn: async (): Promise<Notification[]> => {
      const response = await fetch('/api/notifications');
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch unread count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['/api/notifications/unread-count'],
    queryFn: async (): Promise<number> => {
      const response = await fetch('/api/notifications/unread-count');
      if (!response.ok) {
        throw new Error('Failed to fetch unread count');
      }
      const data = await response.json();
      return data.count;
    },
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  // Fetch notification settings
  const { data: settings } = useQuery({
    queryKey: ['/api/notifications/settings'],
    queryFn: async (): Promise<NotificationSettings> => {
      const response = await fetch('/api/notifications/settings');
      if (!response.ok) {
        throw new Error('Failed to fetch notification settings');
      }
      return response.json();
    },
  });

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    },
  });

  // Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/notifications/read-all', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    },
  });

  // Delete notification
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    },
  });

  // Clear all notifications
  const clearAllMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/notifications', {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to clear all notifications');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    },
  });

  // Update settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<NotificationSettings>) => {
      const response = await fetch('/api/notifications/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings),
      });
      if (!response.ok) {
        throw new Error('Failed to update notification settings');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/settings'] });
    },
  });

  // Test notification
  const sendTestNotificationMutation = useMutation({
    mutationFn: async (type: string) => {
      const response = await fetch(`/api/notifications/test/${type}`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to send test notification');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    },
  });

  return {
    notifications,
    unreadCount,
    settings,
    isLoading,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
    clearAll: clearAllMutation.mutate,
    updateSettings: updateSettingsMutation.mutate,
    sendTestNotification: sendTestNotificationMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    isDeletingNotification: deleteNotificationMutation.isPending,
  };
}