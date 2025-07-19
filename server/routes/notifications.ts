import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { notificationService } from '../services/NotificationService';
import { emailService } from '../services/EmailService';
import { eq, desc, and } from 'drizzle-orm';
import { inAppNotifications, notificationPreferences, emailNotifications } from '../../shared/schema';

const router = Router();

// Get user's notification preferences
router.get('/preferences', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const preferences = await storage.getUserNotificationPreferences(req.user.id);
    res.json(preferences);
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({ error: 'Failed to fetch notification preferences' });
  }
});

// Update user's notification preferences
router.put('/preferences', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const updateSchema = z.object({
      email: z.boolean().optional(),
      mentions: z.boolean().optional(),
      tasks: z.boolean().optional(),
      calendar: z.boolean().optional(),
      directMessages: z.boolean().optional(),
      workspaceUpdates: z.boolean().optional(),
      dailyDigest: z.boolean().optional(),
      weeklyReport: z.boolean().optional(),
    });

    const data = updateSchema.parse(req.body);
    const preferences = await storage.updateUserNotificationPreferences(req.user.id, data);
    
    res.json(preferences);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ error: 'Failed to update notification preferences' });
  }
});

// Get user's in-app notifications
router.get('/in-app', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const unreadOnly = req.query.unread === 'true';

    const notifications = await storage.getUserInAppNotifications(req.user.id, {
      limit,
      offset,
      unreadOnly
    });

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching in-app notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.put('/in-app/:id/read', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const notificationId = req.params.id;
    await storage.markNotificationAsRead(notificationId, req.user.id);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.put('/in-app/mark-all-read', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await storage.markAllNotificationsAsRead(req.user.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// Send test notification (for testing purposes)
router.post('/test', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const testSchema = z.object({
      type: z.enum(['welcome', 'mention', 'task_assigned', 'calendar_invite', 'password_reset']),
      title: z.string().optional(),
      message: z.string().optional(),
    });

    const { type, title, message } = testSchema.parse(req.body);

    // Send test notification
    await notificationService.sendNotification({
      type,
      recipient: req.user,
      data: {
        message: message || 'This is a test notification',
        taskTitle: 'Test Task',
        taskId: '123',
        priority: 'medium'
      },
      channel: 'general',
      priority: 'low'
    });

    res.json({ success: true, message: 'Test notification sent' });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    console.error('Error sending test notification:', error);
    res.status(500).json({ error: 'Failed to send test notification' });
  }
});

// Get email notification history
router.get('/email-history', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const emailHistory = await storage.getUserEmailHistory(req.user.id, { limit, offset });
    res.json(emailHistory);
  } catch (error) {
    console.error('Error fetching email history:', error);
    res.status(500).json({ error: 'Failed to fetch email history' });
  }
});

// Send bulk notification (admin only)
router.post('/bulk', async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const bulkSchema = z.object({
      userIds: z.array(z.number()),
      type: z.string(),
      title: z.string(),
      message: z.string(),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
      sendEmail: z.boolean().default(false)
    });

    const data = bulkSchema.parse(req.body);
    
    // Get users
    const users = await storage.getUsersByIds(data.userIds);
    
    // Send notifications to all users
    const results = await Promise.allSettled(
      users.map(user => 
        notificationService.sendNotification({
          type: data.type as any,
          recipient: user,
          data: { message: data.message },
          priority: data.priority
        })
      )
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    res.json({
      success: true,
      sent: successful,
      failed,
      total: users.length
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    console.error('Error sending bulk notifications:', error);
    res.status(500).json({ error: 'Failed to send bulk notifications' });
  }
});

export default router;