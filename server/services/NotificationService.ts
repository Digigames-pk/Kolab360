import { EmailService } from './EmailService';

interface NotificationOptions {
  userId: string;
  userEmail: string;
  userName: string;
  type: 'mention' | 'task' | 'calendar' | 'welcome' | 'workspace_invite' | 'password_reset' | 'daily_digest';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  channel?: string;
  sender?: string;
  actionUrl?: string;
  emailOnly?: boolean; // If true, only send email, no in-app notification
  inAppOnly?: boolean; // If true, only send in-app notification, no email
}

interface UserNotificationSettings {
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

interface InAppNotification {
  id: string;
  userId: string;
  type: NotificationOptions['type'];
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: NotificationOptions['priority'];
  channel?: string;
  sender?: string;
  actionUrl?: string;
}

export class NotificationService {
  private emailService: EmailService;
  private inAppNotifications: Map<string, InAppNotification[]> = new Map(); // userId -> notifications
  private userSettings: Map<string, UserNotificationSettings> = new Map(); // userId -> settings

  constructor() {
    this.emailService = new EmailService();
    this.initializeDefaultSettings();
  }

  private initializeDefaultSettings() {
    // Mock default settings for demo users
    const defaultSettings: UserNotificationSettings = {
      userId: 'default',
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
    };

    this.userSettings.set('default', defaultSettings);
  }

  private getUserSettings(userId: string): UserNotificationSettings {
    return this.userSettings.get(userId) || this.userSettings.get('default')!;
  }

  private isQuietTime(settings: UserNotificationSettings): boolean {
    if (!settings.quietHours.enabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = settings.quietHours.start.split(':').map(Number);
    const [endHour, endMin] = settings.quietHours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    
    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  async sendNotification(options: NotificationOptions): Promise<{
    emailSent: boolean;
    inAppCreated: boolean;
    error?: string;
  }> {
    try {
      const settings = this.getUserSettings(options.userId);
      const isQuietTime = this.isQuietTime(settings);
      
      let emailSent = false;
      let inAppCreated = false;

      // Send email notification if enabled and not in quiet hours (unless it's urgent)
      if (!options.inAppOnly && this.shouldSendEmailNotification(options.type, settings, isQuietTime, options.priority)) {
        try {
          await this.sendEmailNotification(options);
          emailSent = true;
        } catch (emailError) {
          console.error('Failed to send email notification:', emailError);
        }
      }

      // Create in-app notification if enabled
      if (!options.emailOnly && this.shouldCreateInAppNotification(options.type, settings)) {
        this.createInAppNotification(options);
        inAppCreated = true;
      }

      return { emailSent, inAppCreated };
    } catch (error) {
      console.error('Notification service error:', error);
      return { 
        emailSent: false, 
        inAppCreated: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  private shouldSendEmailNotification(type: NotificationOptions['type'], settings: UserNotificationSettings, isQuietTime: boolean, priority: string): boolean {
    if (settings.doNotDisturb && priority !== 'high') return false;
    if (isQuietTime && priority !== 'high') return false;

    switch (type) {
      case 'mention': return settings.emailNotifications.mentions;
      case 'task': return settings.emailNotifications.tasks;
      case 'calendar': return settings.emailNotifications.calendar;
      case 'welcome': return settings.emailNotifications.welcome;
      case 'workspace_invite': return settings.emailNotifications.workspaceInvites;
      case 'password_reset': return settings.emailNotifications.passwordReset;
      case 'daily_digest': return settings.emailNotifications.dailyDigest;
      default: return false;
    }
  }

  private shouldCreateInAppNotification(type: NotificationOptions['type'], settings: UserNotificationSettings): boolean {
    switch (type) {
      case 'mention': return settings.inAppNotifications.mentions;
      case 'task': return settings.inAppNotifications.tasks;
      case 'calendar': return settings.inAppNotifications.calendar;
      case 'welcome': return settings.inAppNotifications.welcome;
      case 'workspace_invite': return settings.inAppNotifications.workspaceInvites;
      case 'password_reset': return settings.inAppNotifications.passwordReset;
      case 'daily_digest': return settings.inAppNotifications.dailyDigest;
      default: return false;
    }
  }

  private async sendEmailNotification(options: NotificationOptions): Promise<void> {
    switch (options.type) {
      case 'mention':
        if (options.channel && options.sender) {
          await this.emailService.sendMentionEmail(
            options.userEmail,
            options.userName,
            options.sender,
            options.channel,
            options.message
          );
        }
        break;

      case 'task':
        if (options.sender) {
          await this.emailService.sendTaskAssignedEmail(
            options.userEmail,
            options.userName,
            options.title,
            options.sender,
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default 7 days from now
            options.priority
          );
        }
        break;

      case 'calendar':
        const startDate = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration
        await this.emailService.sendCalendarInviteEmail(
          options.userEmail,
          options.userName,
          options.title,
          startDate.toISOString(),
          endDate.toISOString(),
          'Conference Room A',
          options.message
        );
        break;

      case 'welcome':
        await this.emailService.sendWelcomeEmail(
          options.userEmail,
          options.userName,
          'Kolab360 Workspace'
        );
        break;

      case 'workspace_invite':
        if (options.sender) {
          await this.emailService.sendWorkspaceInviteEmail(
            options.userEmail,
            options.userName,
            options.sender,
            'Kolab360 Team',
            'INVITE2025'
          );
        }
        break;

      case 'password_reset':
        await this.emailService.sendPasswordResetEmail(
          options.userEmail,
          options.userName,
          'reset_token_' + Date.now()
        );
        break;

      case 'daily_digest':
        await this.emailService.sendDailyDigestEmail(
          options.userEmail,
          options.userName,
          {
            newMessages: Math.floor(Math.random() * 50),
            completedTasks: Math.floor(Math.random() * 10),
            upcomingEvents: Math.floor(Math.random() * 5),
            activeUsers: Math.floor(Math.random() * 20),
            topChannel: options.channel || 'general',
            topContributor: options.sender || 'Team Member',
            filesShared: Math.floor(Math.random() * 15)
          }
        );
        break;
    }
  }

  private createInAppNotification(options: NotificationOptions): void {
    const notification: InAppNotification = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      userId: options.userId,
      type: options.type,
      title: options.title,
      message: options.message,
      timestamp: new Date(),
      read: false,
      priority: options.priority,
      channel: options.channel,
      sender: options.sender,
      actionUrl: options.actionUrl
    };

    const userNotifications = this.inAppNotifications.get(options.userId) || [];
    userNotifications.unshift(notification);
    
    // Keep only the last 100 notifications per user
    if (userNotifications.length > 100) {
      userNotifications.splice(100);
    }
    
    this.inAppNotifications.set(options.userId, userNotifications);
  }

  // API methods for frontend
  getNotifications(userId: string, limit: number = 50): InAppNotification[] {
    const notifications = this.inAppNotifications.get(userId) || [];
    return notifications.slice(0, limit);
  }

  markAsRead(userId: string, notificationId: string): boolean {
    const notifications = this.inAppNotifications.get(userId);
    if (!notifications) return false;

    const notification = notifications.find(n => n.id === notificationId);
    if (!notification) return false;

    notification.read = true;
    return true;
  }

  markAllAsRead(userId: string): boolean {
    const notifications = this.inAppNotifications.get(userId);
    if (!notifications) {
      console.log(`[NotificationService] No notifications found for user ${userId} when marking all as read`);
      return false;
    }

    const unreadCount = notifications.filter(n => !n.read).length;
    notifications.forEach(n => n.read = true);
    console.log(`[NotificationService] Marked ${unreadCount} notifications as read for user ${userId}`);
    return true;
  }

  deleteNotification(userId: string, notificationId: string): boolean {
    const notifications = this.inAppNotifications.get(userId);
    if (!notifications) return false;

    const index = notifications.findIndex(n => n.id === notificationId);
    if (index === -1) return false;

    notifications.splice(index, 1);
    return true;
  }

  clearAllNotifications(userId: string): boolean {
    this.inAppNotifications.set(userId, []);
    return true;
  }

  getUnreadCount(userId: string): number {
    const notifications = this.inAppNotifications.get(userId) || [];
    const count = notifications.filter(n => !n.read).length;
    console.log(`[NotificationService] Getting unread count for user ${userId}: ${count} notifications`);
    return count;
  }

  updateUserSettings(userId: string, settings: Partial<UserNotificationSettings>): void {
    const currentSettings = this.getUserSettings(userId);
    const updatedSettings = { ...currentSettings, ...settings, userId };
    this.userSettings.set(userId, updatedSettings);
  }

  getUserNotificationSettings(userId: string): UserNotificationSettings {
    return this.getUserSettings(userId);
  }

  // Convenience methods for specific notification types
  async sendMentionNotification(userId: string, userEmail: string, userName: string, mentionedBy: string, channel: string, message: string): Promise<void> {
    await this.sendNotification({
      userId,
      userEmail,
      userName,
      type: 'mention',
      title: `New mention in #${channel}`,
      message: `${mentionedBy} mentioned you: "${message}"`,
      priority: 'high',
      channel,
      sender: mentionedBy,
      inAppOnly: true // Only in-app notification for mentions, email is handled separately
    });
  }

  async sendTaskNotification(userId: string, userEmail: string, userName: string, taskTitle: string, assignedBy: string): Promise<void> {
    await this.sendNotification({
      userId,
      userEmail,
      userName,
      type: 'task',
      title: `Task assigned: ${taskTitle}`,
      message: `${assignedBy} assigned you a new task`,
      priority: 'high',
      sender: assignedBy
    });
  }

  async sendCalendarNotification(userId: string, userEmail: string, userName: string, eventTitle: string): Promise<void> {
    await this.sendNotification({
      userId,
      userEmail,
      userName,
      type: 'calendar',
      title: `Meeting reminder: ${eventTitle}`,
      message: 'Your meeting starts soon',
      priority: 'medium'
    });
  }
}

export const notificationService = new NotificationService();