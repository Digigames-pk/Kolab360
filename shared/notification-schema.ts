import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';

// Notification preferences schema
export const notificationPreferencesSchema = z.object({
  email: z.boolean().default(true),
  mentions: z.boolean().default(true),
  tasks: z.boolean().default(true),
  calendar: z.boolean().default(true),
  directMessages: z.boolean().default(true),
  workspaceUpdates: z.boolean().default(true),
  dailyDigest: z.boolean().default(false),
  weeklyReport: z.boolean().default(false)
});

export type NotificationPreferences = z.infer<typeof notificationPreferencesSchema>;

// In-app notification schema
export const inAppNotificationSchema = z.object({
  id: z.string(),
  userId: z.number(),
  type: z.enum([
    'mention',
    'task_assigned',
    'task_completed',
    'task_overdue',
    'calendar_invite',
    'calendar_reminder',
    'direct_message',
    'file_shared',
    'workspace_invite',
    'system_update',
    'deadline_reminder'
  ]),
  title: z.string(),
  message: z.string(),
  data: z.record(z.any()).optional(),
  read: z.boolean().default(false),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  actionUrl: z.string().optional(),
  createdAt: z.string(),
  readAt: z.string().optional()
});

export type InAppNotification = z.infer<typeof inAppNotificationSchema>;

// Email notification log schema
export const emailNotificationSchema = z.object({
  id: z.string(),
  userId: z.number(),
  email: z.string(),
  type: z.string(),
  subject: z.string(),
  status: z.enum(['sent', 'failed', 'bounced', 'delivered']),
  messageId: z.string().optional(),
  error: z.string().optional(),
  sentAt: z.string(),
  deliveredAt: z.string().optional()
});

export type EmailNotification = z.infer<typeof emailNotificationSchema>;

// Notification settings update schema
export const updateNotificationPreferencesSchema = z.object({
  email: z.boolean().optional(),
  mentions: z.boolean().optional(),
  tasks: z.boolean().optional(),
  calendar: z.boolean().optional(),
  directMessages: z.boolean().optional(),
  workspaceUpdates: z.boolean().optional(),
  dailyDigest: z.boolean().optional(),
  weeklyReport: z.boolean().optional()
});

export type UpdateNotificationPreferences = z.infer<typeof updateNotificationPreferencesSchema>;

// Bulk notification schema
export const bulkNotificationSchema = z.object({
  userIds: z.array(z.number()),
  type: z.string(),
  title: z.string(),
  message: z.string(),
  data: z.record(z.any()).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  sendEmail: z.boolean().default(false),
  actionUrl: z.string().optional()
});

export type BulkNotification = z.infer<typeof bulkNotificationSchema>;