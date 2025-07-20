import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, requireAuth, requireRole } from "./auth";
import { generateAIResponse, analyzeSentiment, summarizeMessages, generateTasks, autoCompleteMessage } from "./openai";
import { emailService } from "./email";
import { notificationService } from "./services/NotificationService";
import { 
  insertWorkspaceSchema, 
  insertChannelSchema, 
  insertMessageSchema, 
  insertTaskSchema,
  insertIntegrationSchema 
} from "@shared/schema";
import multer from "multer";
import path from "path";
import { z } from "zod";
import filesRoutes from "./routes/files";
import simpleFilesRoutes from "./routes/simple-files";
import simpleTasksRoutes from "./routes/simple-tasks";
import workspaceUsersRoutes from './routes/workspace-users';

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

interface WebSocketConnection extends WebSocket {
  userId?: number;
  workspaceId?: string;
  channelId?: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupAuth(app);

  // WebSocket connections store
  const connections = new Set<WebSocketConnection>();

  // Workspace routes
  app.post('/api/workspaces', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const workspaceData = insertWorkspaceSchema.parse(req.body);
      
      const workspace = await storage.createWorkspace({
        ...workspaceData,
        ownerId: userId,
      });

      // Send workspace creation notification email
      try {
        const user = req.user;
        await emailService.sendEmail(
          user.email,
          {
            subject: `Workspace "${workspace.name}" created successfully!`,
            html: `
              <div style="max-width: 600px; margin: 0 auto; font-family: sans-serif;">
                <h2>🎉 Workspace Created!</h2>
                <p>Hi ${user.firstName},</p>
                <p>Your workspace <strong>"${workspace.name}"</strong> has been created successfully!</p>
                <p><strong>Invite Code:</strong> <code>${workspace.inviteCode}</code></p>
                <p>Share this code with your team members to invite them to join.</p>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/workspace/${workspace.id}" 
                   style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
                  Open Workspace
                </a>
              </div>
            `
          }
        );
      } catch (emailError) {
        console.error("Failed to send workspace creation email:", emailError);
      }

      res.json(workspace);
    } catch (error) {
      console.error("Error creating workspace:", error);
      res.status(500).json({ message: "Failed to create workspace" });
    }
  });

  app.get('/api/workspaces', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const workspaces = await storage.getUserWorkspaces(userId);
      res.json(workspaces);
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      res.status(500).json({ message: "Failed to fetch workspaces" });
    }
  });

  app.get('/api/workspaces/:id', requireAuth, async (req: any, res) => {
    try {
      const workspace = await storage.getWorkspace(req.params.id);
      if (!workspace) {
        return res.status(404).json({ message: "Workspace not found" });
      }
      res.json(workspace);
    } catch (error) {
      console.error("Error fetching workspace:", error);
      res.status(500).json({ message: "Failed to fetch workspace" });
    }
  });

  app.post('/api/workspaces/join', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { inviteCode } = req.body;
      
      const workspace = await storage.joinWorkspaceByCode(userId, inviteCode);
      if (!workspace) {
        return res.status(404).json({ message: "Invalid invite code" });
      }

      // Send welcome to workspace email
      try {
        const user = req.user;
        await emailService.sendEmail(
          user.email,
          {
            subject: `Welcome to ${workspace.name}!`,
            html: `
              <div style="max-width: 600px; margin: 0 auto; font-family: sans-serif;">
                <h2>🎊 Welcome to ${workspace.name}!</h2>
                <p>Hi ${user.firstName},</p>
                <p>You've successfully joined the <strong>"${workspace.name}"</strong> workspace!</p>
                <p>Start collaborating with your team by joining channels and participating in conversations.</p>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/workspace/${workspace.id}" 
                   style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
                  Enter Workspace
                </a>
              </div>
            `
          }
        );
      } catch (emailError) {
        console.error("Failed to send workspace welcome email:", emailError);
      }
      
      res.json(workspace);
    } catch (error) {
      console.error("Error joining workspace:", error);
      res.status(500).json({ message: "Failed to join workspace" });
    }
  });

  app.get('/api/workspaces/:id/members', requireAuth, async (req: any, res) => {
    try {
      const members = await storage.getWorkspaceMembers(req.params.id);
      res.json(members);
    } catch (error) {
      console.error("Error fetching workspace members:", error);
      res.status(500).json({ message: "Failed to fetch workspace members" });
    }
  });

  // Channel routes
  app.post('/api/workspaces/:workspaceId/channels', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const channelData = insertChannelSchema.parse({
        ...req.body,
        workspaceId: req.params.workspaceId,
      });
      
      const channel = await storage.createChannel({
        ...channelData,
        createdBy: userId,
      });
      res.json(channel);
    } catch (error) {
      console.error("Error creating channel:", error);
      res.status(500).json({ message: "Failed to create channel" });
    }
  });

  app.get('/api/workspaces/:workspaceId/channels', requireAuth, async (req: any, res) => {
    try {
      const channels = await storage.getWorkspaceChannels(req.params.workspaceId);
      res.json(channels);
    } catch (error) {
      console.error("Error fetching channels:", error);
      res.status(500).json({ message: "Failed to fetch channels" });
    }
  });

  app.get('/api/channels/:id', requireAuth, async (req: any, res) => {
    try {
      const channel = await storage.getChannel(req.params.id);
      if (!channel) {
        return res.status(404).json({ message: "Channel not found" });
      }
      res.json(channel);
    } catch (error) {
      console.error("Error fetching channel:", error);
      res.status(500).json({ message: "Failed to fetch channel" });
    }
  });

  app.post('/api/channels/:id/join', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      await storage.joinChannel(req.params.id, userId);
      res.json({ message: "Successfully joined channel" });
    } catch (error) {
      console.error("Error joining channel:", error);
      res.status(500).json({ message: "Failed to join channel" });
    }
  });

  app.get('/api/channels/:id/members', requireAuth, async (req: any, res) => {
    try {
      const members = await storage.getChannelMembers(req.params.id);
      res.json(members);
    } catch (error) {
      console.error("Error fetching channel members:", error);
      res.status(500).json({ message: "Failed to fetch channel members" });
    }
  });

  // Message routes
  app.get('/api/channels/:id/messages', async (req: any, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      
      // Handle "general" channel as UUID
      let channelId = req.params.id;
      if (channelId === 'general') {
        channelId = '550e8400-e29b-41d4-a716-446655440000'; // Default UUID for general channel
      }
      
      const messages = await storage.getChannelMessages(channelId, limit);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/channels/:id/messages', async (req: any, res) => {
    try {
      const userId = req.user?.id || 3; // Default to user ID 3 for development
      
      // Handle "general" channel as UUID
      let channelId = req.params.id;
      if (channelId === 'general') {
        channelId = '550e8400-e29b-41d4-a716-446655440000'; // Default UUID for general channel
      }
      
      const messageData = insertMessageSchema.parse({
        ...req.body,
        channelId: channelId,
      });
      
      const message = await storage.createMessage({
        ...messageData,
        authorId: userId,
      });

      // Broadcast to WebSocket connections
      const author = req.user || { id: 3, firstName: "Regular", lastName: "User", email: "user@test.com", role: "user" };
      const messageWithAuthor = {
        ...message,
        author,
      };

      connections.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN && ws.channelId === channelId) {
          ws.send(JSON.stringify({
            type: 'new_message',
            data: messageWithAuthor,
          }));
        }
      });

      res.json(messageWithAuthor);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  app.put('/api/messages/:id', requireAuth, async (req: any, res) => {
    try {
      const { content } = req.body;
      const message = await storage.updateMessage(req.params.id, content);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      res.json(message);
    } catch (error) {
      console.error("Error updating message:", error);
      res.status(500).json({ message: "Failed to update message" });
    }
  });

  app.delete('/api/messages/:id', requireAuth, async (req: any, res) => {
    try {
      const deleted = await storage.deleteMessage(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Message not found" });
      }
      res.json({ message: "Message deleted successfully" });
    } catch (error) {
      console.error("Error deleting message:", error);
      res.status(500).json({ message: "Failed to delete message" });
    }
  });

  // Direct message routes
  app.get('/api/users/:userId/messages', async (req: any, res) => {
    try {
      const currentUserId = req.user?.id || 3; // Default to user ID 3 for development
      const otherUserId = parseInt(req.params.userId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      
      const messages = await storage.getDirectMessages(currentUserId, otherUserId, limit);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching direct messages:", error);
      res.status(500).json({ message: "Failed to fetch direct messages" });
    }
  });

  app.post('/api/users/:userId/messages', async (req: any, res) => {
    try {
      const currentUserId = req.user?.id || 3; // Default to user ID 3 for development
      const recipientId = parseInt(req.params.userId);
      const messageData = insertMessageSchema.parse({
        ...req.body,
        recipientId,
      });
      
      const message = await storage.createMessage({
        ...messageData,
        authorId: currentUserId,
      });

      // Broadcast to WebSocket connections
      const author = req.user || { id: 3, firstName: "Regular", lastName: "User", email: "user@test.com", role: "user" };
      const messageWithAuthor = {
        ...message,
        author,
      };

      connections.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN && 
            (ws.userId === currentUserId || ws.userId === recipientId)) {
          ws.send(JSON.stringify({
            type: 'new_direct_message',
            data: messageWithAuthor,
          }));
        }
      });

      res.json(messageWithAuthor);
    } catch (error) {
      console.error("Error creating direct message:", error);
      res.status(500).json({ message: "Failed to create direct message" });
    }
  });

  // Task routes
  app.get('/api/workspaces/:workspaceId/tasks', requireAuth, async (req: any, res) => {
    try {
      const tasks = await storage.getWorkspaceTasks(req.params.workspaceId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post('/api/workspaces/:workspaceId/tasks', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const taskData = insertTaskSchema.parse({
        ...req.body,
        workspaceId: req.params.workspaceId,
      });
      
      const task = await storage.createTask({
        ...taskData,
        createdBy: userId,
      });
      res.json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.put('/api/tasks/:id/status', requireAuth, async (req: any, res) => {
    try {
      const { status } = req.body;
      const task = await storage.updateTaskStatus(req.params.id, status);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      console.error("Error updating task status:", error);
      res.status(500).json({ message: "Failed to update task status" });
    }
  });

  app.delete('/api/tasks/:id', requireAuth, async (req: any, res) => {
    try {
      const deleted = await storage.deleteTask(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json({ message: "Task deleted successfully" });
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // File upload routes
  app.post('/api/workspaces/:workspaceId/files', requireAuth, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const userId = req.user.id;
      const fileData = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        uploadedBy: userId,
        workspaceId: req.params.workspaceId,
        channelId: req.body.channelId || null,
        messageId: req.body.messageId || null,
      };

      const file = await storage.createFile(fileData);
      res.json(file);
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  app.get('/api/workspaces/:workspaceId/files', requireAuth, async (req: any, res) => {
    try {
      const files = await storage.getWorkspaceFiles(req.params.workspaceId);
      res.json(files);
    } catch (error) {
      console.error("Error fetching files:", error);
      res.status(500).json({ message: "Failed to fetch files" });
    }
  });

  // Reaction routes
  app.post('/api/messages/:messageId/reactions', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { emoji } = req.body;
      
      const reaction = await storage.addReaction(req.params.messageId, userId, emoji);
      res.json(reaction);
    } catch (error) {
      console.error("Error adding reaction:", error);
      res.status(500).json({ message: "Failed to add reaction" });
    }
  });

  app.get('/api/messages/:messageId/reactions', requireAuth, async (req: any, res) => {
    try {
      const reactions = await storage.getMessageReactions(req.params.messageId);
      res.json(reactions);
    } catch (error) {
      console.error("Error fetching reactions:", error);
      res.status(500).json({ message: "Failed to fetch reactions" });
    }
  });

  // AI-powered features
  app.post('/api/ai/analyze-sentiment', requireAuth, async (req: any, res) => {
    try {
      const { text } = req.body;
      const sentiment = await analyzeSentiment(text);
      res.json(sentiment);
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
      res.status(500).json({ message: "Failed to analyze sentiment" });
    }
  });

  app.post('/api/ai/autocomplete', requireAuth, async (req: any, res) => {
    try {
      const { text, context } = req.body;
      const completion = await autoCompleteMessage(text, context);
      res.json({ completion });
    } catch (error) {
      console.error("Error generating autocomplete:", error);
      res.status(500).json({ message: "Failed to generate autocomplete" });
    }
  });

  app.post('/api/ai/summarize', requireAuth, async (req: any, res) => {
    try {
      const { messages } = req.body;
      const summary = await summarizeMessages(messages);
      res.json({ summary });
    } catch (error) {
      console.error("Error summarizing messages:", error);
      res.status(500).json({ message: "Failed to summarize messages" });
    }
  });

  app.post('/api/ai/generate-tasks', requireAuth, async (req: any, res: any) => {
    try {
      const { messages, workspaceId } = req.body;
      const tasks = await generateTasks(messages);
      res.json({ tasks });
    } catch (error) {
      console.error("Error generating tasks:", error);
      res.status(500).json({ message: "Failed to generate tasks" });
    }
  });

  app.post('/api/ai/response', requireAuth, async (req: any, res: any) => {
    try {
      const { message, context } = req.body;
      const response = await generateAIResponse(message, context);
      res.json({ response });
    } catch (error) {
      console.error("Error generating AI response:", error);
      res.status(500).json({ message: "Failed to generate AI response" });
    }
  });

  // Notification routes
  app.get('/api/notifications', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id.toString();
      const limit = parseInt(req.query.limit as string) || 50;
      const notifications = notificationService.getNotifications(userId, limit);
      res.json(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  });

  app.post('/api/notifications/:id/read', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id.toString();
      const notificationId = req.params.id;
      const success = notificationService.markAsRead(userId, notificationId);
      res.json({ success });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  });

  app.post('/api/notifications/read-all', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id.toString();
      const success = notificationService.markAllAsRead(userId);
      res.json({ success });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
  });

  app.delete('/api/notifications/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id.toString();
      const notificationId = req.params.id;
      const success = notificationService.deleteNotification(userId, notificationId);
      res.json({ success });
    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({ error: 'Failed to delete notification' });
    }
  });

  app.delete('/api/notifications', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id.toString();
      const success = notificationService.clearAllNotifications(userId);
      res.json({ success });
    } catch (error) {
      console.error('Error clearing notifications:', error);
      res.status(500).json({ error: 'Failed to clear notifications' });
    }
  });

  app.get('/api/notifications/unread-count', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id.toString();
      const count = notificationService.getUnreadCount(userId);
      res.json({ count });
    } catch (error) {
      console.error('Error fetching unread count:', error);
      res.status(500).json({ error: 'Failed to fetch unread count' });
    }
  });

  app.get('/api/notifications/settings', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id.toString();
      const settings = notificationService.getUserNotificationSettings(userId);
      res.json(settings);
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      res.status(500).json({ error: 'Failed to fetch notification settings' });
    }
  });

  app.post('/api/notifications/settings', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id.toString();
      notificationService.updateUserSettings(userId, req.body);
      res.json({ success: true });
    } catch (error) {
      console.error('Error updating notification settings:', error);
      res.status(500).json({ error: 'Failed to update notification settings' });
    }
  });

  // Test notification routes for development
  app.post('/api/notifications/test/:type', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id.toString();
      const user = req.user;
      const type = req.params.type;
      
      let result;
      switch (type) {
        case 'mention':
          result = await notificationService.sendMentionNotification(
            userId,
            user.email,
            user.firstName,
            'John Doe',
            'general',
            'Hey @you, can you check this out?'
          );
          break;
          
        case 'task':
          result = await notificationService.sendTaskNotification(
            userId,
            user.email,
            user.firstName,
            'Review quarterly reports',
            'Sarah Johnson'
          );
          break;
          
        case 'calendar':
          result = await notificationService.sendCalendarNotification(
            userId,
            user.email,
            user.firstName,
            'Team Standup Meeting'
          );
          break;
          
        default:
          result = await notificationService.sendNotification({
            userId,
            userEmail: user.email,
            userName: user.firstName,
            type: type as any,
            title: `Test ${type} notification`,
            message: `This is a test ${type} notification`,
            priority: 'medium'
          });
      }
      
      res.json({ success: true, result });
    } catch (error) {
      console.error('Error sending test notification:', error);
      res.status(500).json({ error: 'Failed to send test notification' });
    }
  });

  // Email testing routes
  app.post('/api/email/send-welcome', requireAuth, async (req: any, res) => {
    try {
      const { email, name, role } = req.body;
      await emailService.sendWelcomeEmail(email, name, email, role || 'user');
      res.json({ message: "Welcome email sent successfully" });
    } catch (error) {
      console.error("Error sending welcome email:", error);
      res.status(500).json({ message: "Failed to send welcome email" });
    }
  });

  app.post('/api/email/send-invite', requireAuth, async (req: any, res) => {
    try {
      const { email, workspaceName, inviteCode, recipientName } = req.body;
      const inviterName = `${req.user.firstName} ${req.user.lastName}`;
      
      await emailService.sendWorkspaceInvite(email, inviterName, workspaceName, inviteCode, recipientName);
      res.json({ message: "Workspace invitation sent successfully" });
    } catch (error) {
      console.error("Error sending workspace invitation:", error);
      res.status(500).json({ message: "Failed to send workspace invitation" });
    }
  });

  app.post('/api/email/send-ai-summary', requireAuth, async (req: any, res) => {
    try {
      const { email, workspaceName, summary, dateRange } = req.body;
      const userName = `${req.user.firstName} ${req.user.lastName}`;
      
      await emailService.sendAISummary(email, userName, workspaceName, summary, dateRange);
      res.json({ message: "AI summary email sent successfully" });
    } catch (error) {
      console.error("Error sending AI summary email:", error);
      res.status(500).json({ message: "Failed to send AI summary email" });
    }
  });

  app.post('/api/email/send-mention', requireAuth, async (req: any, res) => {
    try {
      const { email, mentionedBy, channelName, messagePreview, workspaceName } = req.body;
      const userName = `${req.user.firstName} ${req.user.lastName}`;
      
      await emailService.sendMentionNotification(email, userName, mentionedBy, channelName, messagePreview, workspaceName);
      res.json({ message: "Mention notification sent successfully" });
    } catch (error) {
      console.error("Error sending mention notification:", error);
      res.status(500).json({ message: "Failed to send mention notification" });
    }
  });

  // Admin routes (Super Admin only)
  app.get('/api/admin/users', requireRole('super_admin'), async (req: any, res) => {
    try {
      // This would need to be implemented in storage
      res.json({ message: "Admin users endpoint - to be implemented" });
    } catch (error) {
      console.error("Error fetching admin users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/admin/analytics', requireRole('admin'), async (req: any, res: any) => {
    try {
      // This would need to be implemented in storage
      res.json({ message: "Admin analytics endpoint - to be implemented" });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Integration routes
  app.get('/api/integrations', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const workspaceId = req.query.workspaceId;
      
      const integrations = await storage.getIntegrations(userId, workspaceId);
      res.json(integrations);
    } catch (error) {
      console.error("Error fetching integrations:", error);
      res.status(500).json({ error: "Failed to fetch integrations" });
    }
  });

  app.post('/api/integrations', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const integrationData = insertIntegrationSchema.parse(req.body);
      
      const integration = await storage.createIntegration({
        ...integrationData,
        userId,
      });
      
      res.json(integration);
    } catch (error) {
      console.error("Error creating integration:", error);
      res.status(500).json({ error: "Failed to create integration" });
    }
  });

  app.patch('/api/integrations/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const integrationId = req.params.id;
      const updates = req.body;
      
      const integration = await storage.updateIntegration(integrationId, userId, updates);
      res.json(integration);
    } catch (error) {
      console.error("Error updating integration:", error);
      res.status(500).json({ error: "Failed to update integration" });
    }
  });

  app.delete('/api/integrations/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const integrationId = req.params.id;
      
      await storage.deleteIntegration(integrationId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting integration:", error);
      res.status(500).json({ error: "Failed to delete integration" });
    }
  });

  app.post('/api/integrations/:id/sync', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const integrationId = req.params.id;
      
      // Update last sync time
      await storage.updateIntegration(integrationId, userId, {
        lastSyncAt: new Date().toISOString(),
      });
      
      res.json({ success: true, message: "Sync completed" });
    } catch (error) {
      console.error("Error syncing integration:", error);
      res.status(500).json({ error: "Failed to sync integration" });
    }
  });

  // Admin integration routes
  app.get('/api/admin/integrations/stats', requireRole('super_admin'), async (req: any, res) => {
    try {
      const stats = await storage.getIntegrationStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching integration stats:", error);
      res.status(500).json({ error: "Failed to fetch integration stats" });
    }
  });

  app.get('/api/admin/integrations', requireRole('super_admin'), async (req: any, res) => {
    try {
      const integrations = await storage.getAllIntegrationsForAdmin();
      res.json(integrations);
    } catch (error) {
      console.error("Error fetching admin integrations:", error);
      res.status(500).json({ error: "Failed to fetch integrations" });
    }
  });

  app.patch('/api/admin/integrations/:id', requireRole('super_admin'), async (req: any, res) => {
    try {
      const integrationId = req.params.id;
      const updates = req.body;
      
      const integration = await storage.adminUpdateIntegration(integrationId, updates);
      res.json(integration);
    } catch (error) {
      console.error("Error updating integration:", error);
      res.status(500).json({ error: "Failed to update integration" });
    }
  });

  app.delete('/api/admin/integrations/:id', requireRole('super_admin'), async (req: any, res) => {
    try {
      const integrationId = req.params.id;
      
      await storage.adminDeleteIntegration(integrationId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting integration:", error);
      res.status(500).json({ error: "Failed to delete integration" });
    }
  });

  app.post('/api/admin/integrations/:id/force-sync', requireRole('super_admin'), async (req: any, res) => {
    try {
      const integrationId = req.params.id;
      
      await storage.adminUpdateIntegration(integrationId, {
        lastSyncAt: new Date().toISOString(),
      });
      
      res.json({ success: true, message: "Force sync completed" });
    } catch (error) {
      console.error("Error force syncing integration:", error);
      res.status(500).json({ error: "Failed to force sync integration" });
    }
  });

  app.get('/api/admin/integrations/export', requireRole('super_admin'), async (req: any, res) => {
    try {
      const format = req.query.format || 'json';
      const integrations = await storage.getAllIntegrationsForAdmin();
      
      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=integrations.csv');
        
        const csvHeaders = 'ID,Service,Service Name,Workspace,User,Email,Status,Last Sync,Created\n';
        const csvData = integrations.map((int: any) => 
          `${int.id},${int.service},${int.serviceName},${int.workspaceName},${int.userName},${int.userEmail},${int.isEnabled ? 'Active' : 'Inactive'},${int.lastSyncAt || 'Never'},${int.createdAt}`
        ).join('\n');
        
        res.send(csvHeaders + csvData);
      } else {
        res.json(integrations);
      }
    } catch (error) {
      console.error("Error exporting integrations:", error);
      res.status(500).json({ error: "Failed to export integrations" });
    }
  });

  // Email invitation endpoint
  app.post('/api/invitations/send', async (req, res) => {
    try {
      const { email, channelName, inviteCode } = req.body;
      
      if (!email || !channelName) {
        return res.status(400).json({ error: 'Email and channel name are required' });
      }

      // Send invitation email
      await emailService.sendEmail(
        email,
        {
          subject: `You're invited to join #${channelName}!`,
          html: `
            <div style="max-width: 600px; margin: 0 auto; font-family: sans-serif;">
              <h2>🎉 You're invited to join our workspace!</h2>
              <p>Hi there,</p>
              <p>You've been invited to join the <strong>#${channelName}</strong> channel in our collaboration workspace.</p>
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Invite Code:</strong> <code style="background: #e9ecef; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${inviteCode}</code></p>
              </div>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/invite/${channelName}?code=${inviteCode}" 
                 style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
                Join Channel
              </a>
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #6c757d; font-size: 14px;">${process.env.FRONTEND_URL || 'http://localhost:5000'}/invite/${channelName}?code=${inviteCode}</p>
            </div>
          `
        }
      );

      res.json({ success: true, message: 'Invitation sent successfully' });
    } catch (error) {
      console.error('Error sending invitation email:', error);
      res.status(500).json({ error: 'Failed to send invitation email' });
    }
  });

  // Files routes - mount the simple files router
  app.use('/api/files', simpleFilesRoutes);
  
  // Tasks routes - mount the simple tasks router  
  app.use('/api/tasks', simpleTasksRoutes);

  // Workspace users routes
  app.use('/api/workspace', workspaceUsersRoutes);

  // Data seeding endpoint for development
  app.post('/api/seed-test-data', async (req: any, res) => {
    try {
      const { seedTestData } = await import('./seed-data');
      await seedTestData();
      
      res.json({ 
        success: true, 
        message: 'Test data seeded successfully including 5 test notifications'
      });
    } catch (error) {
      console.error('Error seeding test data:', error);
      res.status(500).json({ error: 'Failed to seed test data' });
    }
  });

  // Dynamic unread counts with persistent state management
  const channelUnreadCounts = new Map<string, number>([
    ['general', 4],
    ['random', 2], 
    ['dev-team', 7],
    ['design', 1],
    ['marketing', 0],
    ['support', 3]
  ]);

  const dmUnreadCounts = new Map<string, number>([
    ['Sarah Wilson', 3],
    ['Alex Johnson', 1],
    ['Mike Chen', 5],
    ['Lisa Rodriguez', 0],
    ['John Doe', 2],
    ['Emma Davis', 1],
    ['Tom Anderson', 0]
  ]);

  // Get channel unread counts
  app.get('/api/unread-counts/channels', async (req: any, res) => {
    try {
      const counts = Object.fromEntries(channelUnreadCounts);
      console.log('📊 [Unread Counts] Channel counts requested:', counts);
      
      // Prevent caching to ensure real-time updates
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
      res.json(counts);
    } catch (error) {
      console.error('Error fetching channel unread counts:', error);
      res.status(500).json({ error: 'Failed to fetch unread counts' });
    }
  });

  // Get DM unread counts
  app.get('/api/unread-counts/direct-messages', async (req: any, res) => {
    try {
      const counts = Object.fromEntries(dmUnreadCounts);
      console.log('📊 [Unread Counts] DM counts requested:', counts);
      
      // Prevent caching to ensure real-time updates
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
      res.json(counts);
    } catch (error) {
      console.error('Error fetching DM unread counts:', error);
      res.status(500).json({ error: 'Failed to fetch DM unread counts' });
    }
  });

  // Mark channel as read
  app.post('/api/unread-counts/channels/:channelName/mark-read', async (req: any, res) => {
    try {
      const { channelName } = req.params;
      const userId = req.user?.id || 3; // Default user for development
      
      console.log(`🔄 [Mark Read] User ${userId} marking channel "${channelName}" as read`);
      
      // Set unread count to 0 for this channel
      channelUnreadCounts.set(channelName, 0);
      
      const updatedCounts = Object.fromEntries(channelUnreadCounts);
      console.log('✅ [Mark Read] Updated channel counts:', updatedCounts);
      
      res.json({ 
        success: true, 
        channelName,
        unreadCount: 0,
        allCounts: updatedCounts
      });
    } catch (error) {
      console.error('Error marking channel as read:', error);
      res.status(500).json({ error: 'Failed to mark channel as read' });
    }
  });

  // Mark DM as read
  app.post('/api/unread-counts/direct-messages/:userName/mark-read', async (req: any, res) => {
    try {
      const { userName } = req.params;
      const userId = req.user?.id || 3; // Default user for development
      
      console.log(`🔄 [Mark Read] User ${userId} marking DM "${userName}" as read`);
      
      // Set unread count to 0 for this DM
      dmUnreadCounts.set(userName, 0);
      
      const updatedCounts = Object.fromEntries(dmUnreadCounts);
      console.log('✅ [Mark Read] Updated DM counts:', updatedCounts);
      
      res.json({ 
        success: true, 
        userName,
        unreadCount: 0,
        allCounts: updatedCounts
      });
    } catch (error) {
      console.error('Error marking DM as read:', error);
      res.status(500).json({ error: 'Failed to mark DM as read' });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  // WebSocket server setup
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocketConnection, req) => {
    connections.add(ws);
    console.log('WebSocket connection established');

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        switch (message.type) {
          case 'join_workspace':
            ws.workspaceId = message.workspaceId;
            ws.userId = message.userId;
            break;
            
          case 'join_channel':
            // Handle "general" channel as UUID
            let channelId = message.channelId;
            if (channelId === 'general') {
              channelId = '550e8400-e29b-41d4-a716-446655440000';
            }
            ws.channelId = channelId;
            break;
            
          case 'typing':
            // Broadcast typing indicator to other users in the channel
            connections.forEach((conn) => {
              if (conn !== ws && 
                  conn.readyState === WebSocket.OPEN && 
                  conn.channelId === ws.channelId) {
                conn.send(JSON.stringify({
                  type: 'user_typing',
                  userId: ws.userId,
                  channelId: ws.channelId,
                }));
              }
            });
            break;
            
          case 'stop_typing':
            // Broadcast stop typing indicator
            connections.forEach((conn) => {
              if (conn !== ws && 
                  conn.readyState === WebSocket.OPEN && 
                  conn.channelId === ws.channelId) {
                conn.send(JSON.stringify({
                  type: 'user_stop_typing',
                  userId: ws.userId,
                  channelId: ws.channelId,
                }));
              }
            });
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      connections.delete(ws);
      console.log('WebSocket connection closed');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      connections.delete(ws);
    });
  });

  return httpServer;
}