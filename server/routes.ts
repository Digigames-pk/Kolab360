import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import passport from 'passport';
import { setupAuth, requireAuth } from "./auth";
import { generateAIResponse, analyzeSentiment, summarizeMessages, generateTasks, autoCompleteMessage } from "./openai";
import { emailService } from "./email";
import { notificationService } from "./services/NotificationService";

import { 
  insertWorkspaceSchema, 
  insertChannelSchema, 
  insertMessageSchema, 
  insertTaskSchema,
  insertIntegrationSchema,
  insertOrganizationSchema,
  insertOrganizationSettingsSchema,
  insertOrganizationUserSchema,
  updateUserRoleSchema,
  changePasswordSchema,
  insertPricingPlanSchema,
  updatePricingPlanSchema
} from "@shared/schema";
import multer from "multer";
import path from "path";
import { z } from "zod";
import filesRoutes from "./routes/files";
import simpleFilesRoutes from "./routes/simple-files";
import simpleTasksRoutes from "./routes/simple-tasks";
import workspaceUsersRoutes from './routes/workspace-users';
import moodBoardRoutes from './routes/mood-boards';
import integrationsRouter from './integrations';
import { uploadFileToWasabi } from "./wasabi";
import { nanoid } from 'nanoid';
import { scrypt, randomBytes, randomUUID } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

// Helper functions for password generation and hashing
function generateRandomPassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

// Use same hashing method as auth.ts for consistency
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Configure multer for memory storage - files will be uploaded to Wasabi
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for cloud storage
});

interface WebSocketConnection extends WebSocket {
  userId?: number;
  workspaceId?: string;
  channelId?: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupAuth(app);
  
  // Auto-authenticate super admin on server startup for development
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 [DEV] Setting up auto-authentication for super admin');
  }

  // Initialize default pricing plans on startup
  try {
    await storage.initializeDefaultPricingPlans();
  } catch (error) {
    console.error('Error initializing default pricing plans:', error);
  }

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
  app.post('/api/channels', async (req: any, res) => {
    try {
      const userId = req.user?.id || 3; // Default to user ID 3 for development
      const { name, workspaceId = 1 } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: "Channel name is required" });
      }
      
      // Get or create a default workspace for this user
      let userWorkspaces = await storage.getUserWorkspaces(userId);
      let defaultWorkspace = userWorkspaces[0];
      
      if (!defaultWorkspace) {
        // Create a default workspace for the user
        defaultWorkspace = await storage.createWorkspace({
          name: "Default Workspace",
          description: "Your main workspace",
          ownerId: userId,
          inviteCode: nanoid(8),
        });
        
        // Add user as workspace member
        await storage.joinWorkspace(defaultWorkspace.id, userId);
      }
      
      const channelData = {
        id: randomUUID(),
        name,
        workspaceId: defaultWorkspace.id,
        isPrivate: false,
        description: `Channel for ${name}`,
        createdBy: userId,
      };
      
      const channel = await storage.createChannel(channelData);
      console.log('✅ Channel created:', channel.name);
      res.json(channel);
    } catch (error) {
      console.error("Error creating channel:", error);
      res.status(500).json({ message: "Failed to create channel" });
    }
  });

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
      
      // Extract file metadata from message metadata for frontend compatibility
      const processedMessages = messages.map(message => {
        const processedMessage = { ...message } as any;
        
        // If message has file metadata, extract it to top level for frontend compatibility
        if (message.metadata && message.messageType === 'file') {
          const metadata = message.metadata as any;
          processedMessage.fileUrl = metadata.fileUrl;
          processedMessage.fileName = metadata.fileName;
          processedMessage.fileType = metadata.fileType;
          processedMessage.fileSize = metadata.fileSize;
        }
        
        return processedMessage;
      });
      
      res.json(processedMessages);
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
      
      // Extract file metadata if present
      const { fileUrl, fileName, fileType, fileSize, ...bodyData } = req.body;
      
      console.log('📨 Message creation request:', {
        fileUrl, fileName, fileType, fileSize,
        hasFileData: !!(fileUrl || fileName || fileType)
      });
      
      const messageData = insertMessageSchema.parse({
        ...bodyData,
        channelId: channelId,
      });
      
      // Add file metadata if present
      const messageToCreate = {
        ...messageData,
        authorId: userId,
      };
      
      if (fileUrl || fileName || fileType) {
        messageToCreate.messageType = 'file';
        messageToCreate.metadata = {
          fileUrl,
          fileName,
          fileType,
          fileSize
        };
        console.log('📎 Creating file message with metadata:', messageToCreate.metadata);
      } else {
        console.log('💬 Creating text message');
      }
      
      const message = await storage.createMessage(messageToCreate);

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

  // File upload routes - ALL uploads go to Wasabi cloud storage
  app.post('/api/workspaces/:workspaceId/files', requireAuth, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const userId = req.user.id;
      const user = req.user;
      
      // Upload to Wasabi cloud storage
      const uploadResult = await uploadFileToWasabi(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        {
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
          uploadedBy: `${user.firstName} ${user.lastName}`,
          workspace: req.params.workspaceId,
          channel: req.body.channelId || undefined,
          category: req.file.mimetype.startsWith('image/') ? 'image' :
                   req.file.mimetype.startsWith('video/') ? 'video' :
                   req.file.mimetype.startsWith('audio/') ? 'audio' : 'document'
        }
      );

      // Store file metadata in database with Wasabi URL
      const fileData = {
        filename: uploadResult.key, // Use Wasabi key as filename
        originalName: req.file.originalname,
        category: req.file.mimetype.startsWith('image/') ? 'image' :
                 req.file.mimetype.startsWith('video/') ? 'video' :
                 req.file.mimetype.startsWith('audio/') ? 'audio' : 'document',
        size: req.file.size,
        uploadedBy: userId,
        wasabiKey: uploadResult.key,
        wasabiUrl: uploadResult.url,
        mimeType: req.file.mimetype,
        workspaceId: req.params.workspaceId,
        channelId: req.body.channelId || null,
        messageId: req.body.messageId || null,
      };

      const file = await storage.createFile(fileData);
      res.json({
        ...file,
        wasabiUrl: uploadResult.url,
        cloudKey: uploadResult.key
      });
    } catch (error) {
      console.error("Error uploading file to Wasabi:", error);
      res.status(500).json({ message: "Failed to upload file to cloud storage" });
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

  // User search routes for DM functionality
  app.get('/api/users/search', async (req: any, res) => {
    try {
      const { name } = req.query;
      if (!name) {
        return res.status(400).json({ message: "Name parameter is required" });
      }
      
      // Mock users for development - replace with real user search
      const mockUsers = [
        { id: 1, firstName: "Super", lastName: "Admin", email: "superadmin@test.com" },
        { id: 2, firstName: "Marty", lastName: "McFly", email: "marty@24flix.com" },
        { id: 3, firstName: "Regular", lastName: "User", email: "user@test.com" }
      ];
      
      const results = mockUsers.filter(user => 
        user.firstName.toLowerCase().includes(name.toLowerCase()) ||
        user.lastName.toLowerCase().includes(name.toLowerCase()) ||
        user.email.toLowerCase().includes(name.toLowerCase())
      );
      
      console.log('🔍 User search for:', name, 'Results:', results.length);
      res.json(results);
    } catch (error) {
      console.error("Error searching users:", error);
      res.status(500).json({ message: "Failed to search users" });
    }
  });

  app.get('/api/workspace/users', async (req: any, res) => {
    try {
      // Mock workspace users for development - replace with real user query
      const mockUsers = [
        { 
          id: 1, 
          firstName: "Super", 
          lastName: "Admin", 
          email: "superadmin@test.com",
          role: "super_admin",
          department: "Administration"
        },
        { 
          id: 2, 
          firstName: "Marty", 
          lastName: "McFly", 
          email: "marty@24flix.com",
          role: "admin", 
          department: "Management"
        },
        { 
          id: 3, 
          firstName: "Regular", 
          lastName: "User", 
          email: "user@test.com",
          role: "user",
          department: "Development"
        }
      ];
      
      console.log('👥 Workspace users requested, returning:', mockUsers.length, 'users');
      res.json(mockUsers);
    } catch (error) {
      console.error("Error fetching workspace users:", error);
      res.status(500).json({ message: "Failed to fetch workspace users" });
    }
  });

  // Admin routes (Super Admin only)
  app.get('/api/admin/users', requireAuth, async (req: any, res) => {
    try {
      // This would need to be implemented in storage
      res.json({ message: "Admin users endpoint - to be implemented" });
    } catch (error) {
      console.error("Error fetching admin users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/admin/analytics', requireAuth, async (req: any, res: any) => {
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
        lastSyncAt: new Date(),
      });
      
      res.json({ success: true, message: "Sync completed" });
    } catch (error) {
      console.error("Error syncing integration:", error);
      res.status(500).json({ error: "Failed to sync integration" });
    }
  });

  // Admin integration routes
  app.get('/api/admin/integrations/stats', requireAuth, async (req: any, res) => {
    try {
      const stats = await storage.getIntegrationStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching integration stats:", error);
      res.status(500).json({ error: "Failed to fetch integration stats" });
    }
  });

  app.get('/api/admin/integrations', requireAuth, async (req: any, res) => {
    try {
      const integrations = await storage.getAllIntegrationsForAdmin();
      res.json(integrations);
    } catch (error) {
      console.error("Error fetching admin integrations:", error);
      res.status(500).json({ error: "Failed to fetch integrations" });
    }
  });

  app.patch('/api/admin/integrations/:id', requireAuth, async (req: any, res) => {
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

  app.delete('/api/admin/integrations/:id', requireAuth, async (req: any, res) => {
    try {
      const integrationId = req.params.id;
      
      await storage.adminDeleteIntegration(integrationId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting integration:", error);
      res.status(500).json({ error: "Failed to delete integration" });
    }
  });

  app.post('/api/admin/integrations/:id/force-sync', requireAuth, async (req: any, res) => {
    try {
      const integrationId = req.params.id;
      
      await storage.adminUpdateIntegration(integrationId, {
        lastSyncAt: new Date(),
      });
      
      res.json({ success: true, message: "Force sync completed" });
    } catch (error) {
      console.error("Error force syncing integration:", error);
      res.status(500).json({ error: "Failed to force sync integration" });
    }
  });

  app.get('/api/admin/integrations/export', requireAuth, async (req: any, res) => {
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

  // Auth routes
  app.post('/api/auth/logout', (req: any, res) => {
    req.logout((err: any) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ error: 'Failed to logout' });
      }
      
      // Destroy the session
      req.session.destroy((err: any) => {
        if (err) {
          console.error('Session destroy error:', err);
          return res.status(500).json({ error: 'Failed to destroy session' });
        }
        
        // Clear the session cookie
        res.clearCookie('connect.sid');
        
        // Send success response
        res.json({ success: true, message: 'Logged out successfully' });
      });
    });
  });

  // Keep GET route for direct access
  app.get('/api/auth/logout', (req: any, res) => {
    req.logout((err: any) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ error: 'Failed to logout' });
      }
      
      // Destroy the session
      req.session.destroy((err: any) => {
        if (err) {
          console.error('Session destroy error:', err);
          return res.status(500).json({ error: 'Failed to destroy session' });
        }
        
        // Clear the session cookie
        res.clearCookie('connect.sid');
        
        // Redirect to the root which will show login if not authenticated
        res.redirect('/');
      });
    });
  });

  // Add login route
  app.post('/api/auth/login', (req: any, res, next) => {
    console.log('📧 Login attempt received:', req.body);
    passport.authenticate('local', (err: any, user: any, info: any) => {
      console.log('🔐 Passport authenticate callback:', { err, user: user ? user.email : null, info });
      if (err) {
        console.error('🚫 Authentication error:', err);
        return res.status(500).json({ error: 'Authentication error' });
      }
      if (!user) {
        console.log('❌ No user returned from authentication');
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      req.logIn(user, (err: any) => {
        if (err) {
          console.error('🚫 Login error:', err);
          return res.status(500).json({ error: 'Login failed' });
        }
        console.log('✅ Login successful for:', user.email);
        return res.json({ user, message: 'Login successful' });
      });
    })(req, res, next);
  });

  // Add auth check endpoint
  app.get('/api/auth/me', async (req: any, res) => {
    console.log('🔍 [DEBUG] GET /api/auth/me - Request received');
    console.log('🔍 [DEBUG] req.isAuthenticated():', req.isAuthenticated());
    console.log('🔍 [DEBUG] req.user:', req.user);
    console.log('🔍 [DEBUG] req.session:', req.session);
    
    if (req.isAuthenticated() && req.user) {
      try {
        // Get ALL organizations for the user
        const user = req.user;
        let organizations = [];
        
        // Get all organizations this user belongs to
        console.log('🔍 [DEBUG] Looking up ALL organizations for user:', user.email);
        const userOrgs = await storage.getAllOrganizationsByUserEmail(user.email);
        console.log('🔍 [DEBUG] User organizations result:', userOrgs.length, 'organizations found');
        
        organizations = userOrgs.map(userOrg => ({
          ...userOrg.organization,
          userRole: userOrg.role,
          userStatus: userOrg.status
        }));
        
        // For backward compatibility, also include the primary organization
        const primaryOrganization = organizations[0] || null;
        
        const userWithOrgs = {
          ...user,
          organization: primaryOrganization, // For backward compatibility
          organizations // All organizations
        };
        
        console.log('✅ [DEBUG] User with organizations data:', userWithOrgs.email, 'Organizations:', organizations.map(o => o.name).join(', '));
        res.json(userWithOrgs);
      } catch (error) {
        console.error('❌ [DEBUG] Error fetching user organization:', error);
        res.json(req.user);
      }
    } else {
      console.log('❌ [DEBUG] User not authenticated');
      
      // Auto-authenticate super admin in development environment
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 [DEBUG] Development mode: Auto-authenticating super admin');
        try {
          const superAdmin = await storage.getUserByEmail('superadmin@test.com');
          if (superAdmin) {
            req.login(superAdmin, (err: any) => {
              if (err) {
                console.error('❌ [DEBUG] Auto-login failed:', err);
                return res.status(401).json({ error: 'Not authenticated' });
              }
              console.log('✅ [DEBUG] Auto-login successful for super admin');
              res.json(superAdmin);
            });
            return;
          }
        } catch (error) {
          console.error('❌ [DEBUG] Error during auto-authentication:', error);
        }
      }
      
      res.status(401).json({ error: 'Not authenticated' });
    }
  });

  // Files routes - mount the simple files router
  app.use('/api/files', simpleFilesRoutes);
  app.use('/api/simple-files', simpleFilesRoutes);
  
  // Tasks routes - mount the simple tasks router  
  app.use('/api/tasks', simpleTasksRoutes);

  // Workspace users routes
  app.use('/api/workspace', workspaceUsersRoutes);
  
  // Mood board routes
  app.use('/api/mood-boards', moodBoardRoutes);
  
  // Integrations routes
  app.use('/api/integrations', integrationsRouter);

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
  const channelUnreadCounts = new Map<string, number>();
  const dmUnreadCounts = new Map<string, number>();

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

  // =================== ORGANIZATION MANAGEMENT API ===================
  
  // Get all organizations (Super Admin only)
  app.get('/api/organizations', requireAuth, async (req: any, res) => {
    try {
      console.log('🔍 [DEBUG] GET /api/organizations - Request received');
      console.log('🔍 [DEBUG] User from req.user:', req.user);
      console.log('🔍 [DEBUG] User role:', req.user?.role);
      console.log('🔍 [DEBUG] Is authenticated:', req.isAuthenticated());
      
      const user = req.user;
      if (!user) {
        console.log('❌ [DEBUG] No user found in request');
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      if (user.role !== 'super_admin') {
        console.log('❌ [DEBUG] User role not super_admin:', user.role);
        return res.status(403).json({ error: 'Super admin access required' });
      }
      
      console.log('✅ [DEBUG] User is super admin, fetching organizations');
      const organizations = await storage.getAllOrganizations();
      console.log('✅ [DEBUG] Organizations fetched:', organizations.length);
      res.json(organizations);
    } catch (error) {
      console.error('❌ [DEBUG] Error fetching organizations:', error);
      res.status(500).json({ error: 'Failed to fetch organizations' });
    }
  });

  // Create new organization
  app.post('/api/organizations', requireAuth, async (req: any, res) => {
    try {
      console.log('🔍 [DEBUG] POST /api/organizations - Request received');
      console.log('🔍 [DEBUG] Request body:', JSON.stringify(req.body, null, 2));
      console.log('🔍 [DEBUG] User from req.user:', req.user);
      console.log('🔍 [DEBUG] User role:', req.user?.role);
      console.log('🔍 [DEBUG] Is authenticated:', req.isAuthenticated());
      
      const user = req.user;
      if (!user) {
        console.log('❌ [DEBUG] No user found in request');
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      if (user.role !== 'super_admin') {
        console.log('❌ [DEBUG] User role not super_admin:', user.role);
        return res.status(403).json({ error: 'Super admin access required' });
      }

      console.log('🔍 [DEBUG] Validating organization data with schema');
      const orgData = insertOrganizationSchema.parse(req.body);
      console.log('✅ [DEBUG] Schema validation passed, creating organization');
      
      const organization = await storage.createOrganization(orgData);
      console.log('✅ [DEBUG] Organization created successfully:', organization.name, 'ID:', organization.id);
      
      res.status(201).json(organization);
    } catch (error) {
      console.error('❌ [DEBUG] Error creating organization:', error);
      console.error('❌ [DEBUG] Error stack:', error.stack);
      if (error.name === 'ZodError') {
        console.error('❌ [DEBUG] Zod validation errors:', error.errors);
        return res.status(400).json({ 
          error: 'Invalid organization data', 
          details: error.errors 
        });
      }
      res.status(500).json({ error: 'Failed to create organization' });
    }
  });

  // Get specific organization
  app.get('/api/organizations/:id', requireAuth, async (req: any, res) => {
    try {
      const user = req.user;
      if (user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Super admin access required' });
      }

      const organizationId = parseInt(req.params.id);
      const organization = await storage.getOrganization(organizationId);
      
      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }
      
      res.json(organization);
    } catch (error) {
      console.error('Error fetching organization:', error);
      res.status(500).json({ error: 'Failed to fetch organization' });
    }
  });

  // Update organization
  app.put('/api/organizations/:id', requireAuth, async (req: any, res) => {
    try {
      const user = req.user;
      if (user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Super admin access required' });
      }

      const organizationId = parseInt(req.params.id);
      const updates = req.body;
      
      const organization = await storage.updateOrganization(organizationId, updates);
      
      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }
      
      console.log('✅ Organization updated:', organization.name);
      res.json(organization);
    } catch (error) {
      console.error('Error updating organization:', error);
      res.status(500).json({ error: 'Failed to update organization' });
    }
  });

  // Delete organization
  app.delete('/api/organizations/:id', requireAuth, async (req: any, res) => {
    try {
      const user = req.user;
      if (user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Super admin access required' });
      }

      const organizationId = parseInt(req.params.id);
      const success = await storage.deleteOrganization(organizationId);
      
      if (!success) {
        return res.status(404).json({ error: 'Organization not found' });
      }
      
      console.log('✅ Organization deleted:', organizationId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting organization:', error);
      res.status(500).json({ error: 'Failed to delete organization' });
    }
  });

  // Suspend organization
  app.post('/api/organizations/:id/suspend', requireAuth, async (req: any, res) => {
    try {
      const user = req.user;
      if (user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Super admin access required' });
      }

      const organizationId = parseInt(req.params.id);
      const organization = await storage.suspendOrganization(organizationId);
      
      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }
      
      console.log('✅ Organization suspended:', organization.name);
      res.json(organization);
    } catch (error) {
      console.error('Error suspending organization:', error);
      res.status(500).json({ error: 'Failed to suspend organization' });
    }
  });

  // Reactivate organization
  app.post('/api/organizations/:id/reactivate', requireAuth, async (req: any, res) => {
    try {
      const user = req.user;
      if (user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Super admin access required' });
      }

      const organizationId = parseInt(req.params.id);
      const organization = await storage.reactivateOrganization(organizationId);
      
      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }
      
      console.log('✅ Organization reactivated:', organization.name);
      res.json(organization);
    } catch (error) {
      console.error('Error reactivating organization:', error);
      res.status(500).json({ error: 'Failed to reactivate organization' });
    }
  });

  // Get organization settings
  app.get('/api/organizations/:id/settings', requireAuth, async (req: any, res) => {
    try {
      const user = req.user;
      if (user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Super admin access required' });
      }

      const organizationId = parseInt(req.params.id);
      const settings = await storage.getOrganizationSettings(organizationId);
      
      if (!settings) {
        // Create default settings if none exist
        const defaultSettings = await storage.createOrganizationSettings(organizationId, {
          organizationId,
          fileSharing: true,
          externalIntegrations: true,
          guestAccess: false,
          messageHistory: true,
          twoFactorAuth: false,
          passwordPolicy: false,
          sessionTimeout: false,
          ipRestrictions: false,
          screenSharing: true,
          recordingSessions: false,
          adminOverride: true,
        });
        return res.json(defaultSettings);
      }
      
      res.json(settings);
    } catch (error) {
      console.error('Error fetching organization settings:', error);
      res.status(500).json({ error: 'Failed to fetch organization settings' });
    }
  });

  // Update organization settings
  app.put('/api/organizations/:id/settings', requireAuth, async (req: any, res) => {
    try {
      const user = req.user;
      if (user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Super admin access required' });
      }

      const organizationId = parseInt(req.params.id);
      const settingsData = insertOrganizationSettingsSchema.parse(req.body);
      
      // Check if settings exist
      let settings = await storage.getOrganizationSettings(organizationId);
      
      if (!settings) {
        // Create new settings
        settings = await storage.createOrganizationSettings(organizationId, {
          organizationId,
          ...settingsData,
        });
      } else {
        // Update existing settings
        settings = await storage.updateOrganizationSettings(organizationId, settingsData);
      }
      
      console.log('✅ Organization settings updated for organization:', organizationId);
      res.json(settings);
    } catch (error) {
      console.error('Error updating organization settings:', error);
      res.status(500).json({ error: 'Failed to update organization settings' });
    }
  });

  // Get organization users
  app.get('/api/organizations/:id/users', requireAuth, async (req: any, res) => {
    try {
      const user = req.user;
      if (user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Super admin access required' });
      }

      const organizationId = parseInt(req.params.id);
      const users = await storage.getOrganizationUsers(organizationId);
      
      res.json(users);
    } catch (error) {
      console.error('Error fetching organization users:', error);
      res.status(500).json({ error: 'Failed to fetch organization users' });
    }
  });

  // Create organization user
  app.post('/api/organizations/:id/users', requireAuth, async (req: any, res) => {
    try {
      const user = req.user;
      if (user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Super admin access required' });
      }

      const organizationId = parseInt(req.params.id);
      const userData = insertOrganizationUserSchema.parse(req.body);
      
      // Use provided password or generate a temporary password
      const userPassword = userData.password || generateRandomPassword();
      
      // Hash the password using the same method as auth
      const hashedPassword = await hashPassword(userPassword);
      
      const newUser = await storage.createOrganizationUser({
        organizationId,
        ...userData,
        password: hashedPassword, // Include the hashed password
      });
      
      // Send welcome email with login credentials
      try {
        await emailService.sendWelcomeEmailWithCredentials(
          newUser.email,
          `${newUser.firstName} ${newUser.lastName}`,
          newUser.email,
          userPassword,
          newUser.role
        );
        console.log('✅ Welcome email sent to:', newUser.email);
      } catch (emailError) {
        console.error('❌ Failed to send welcome email:', emailError);
        // Continue with user creation even if email fails
      }
      
      console.log('✅ Organization user created:', newUser.email);
      
      // Don't send the password in the response
      const { password, ...userResponse } = newUser;
      res.status(201).json({
        ...userResponse,
        temporaryPasswordSent: true,
        message: 'User created successfully. Welcome email sent with login credentials.'
      });
    } catch (error) {
      console.error('Error creating organization user:', error);
      res.status(500).json({ error: 'Failed to create organization user' });
    }
  });

  // Add existing user to organization endpoint
  app.post('/api/organizations/:id/add-existing-user', requireAuth, async (req: any, res) => {
    try {
      const user = req.user;
      if (user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Super admin access required' });
      }

      const organizationId = parseInt(req.params.id);
      const { email, role = 'member' } = req.body;
      
      // Check if user exists in any organization
      const existingUser = await storage.getOrganizationUserByEmail(email);
      if (!existingUser) {
        return res.status(404).json({ error: 'User not found in any organization' });
      }
      
      // Check if user is already in this organization
      const existingMembership = await storage.getOrganizationUsers(organizationId);
      const alreadyMember = existingMembership.find(member => member.email === email);
      if (alreadyMember) {
        return res.status(400).json({ error: 'User is already a member of this organization' });
      }
      
      // Add user to new organization using existing user data
      const newMembership = await storage.createOrganizationUser({
        organizationId,
        email: existingUser.email,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        role,
        status: 'active',
        password: existingUser.password, // Copy existing password hash
      });
      
      console.log('✅ Existing user added to organization:', email, 'Organization ID:', organizationId);
      res.json({
        ...newMembership,
        message: 'User successfully added to organization'
      });
    } catch (error) {
      console.error('Error adding existing user to organization:', error);
      res.status(500).json({ error: 'Failed to add user to organization' });
    }
  });

  // Get all users across all organizations (for super admin)
  app.get('/api/admin/all-users', requireAuth, async (req: any, res) => {
    try {
      const user = req.user;
      if (user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Super admin access required' });
      }

      const allOrganizations = await storage.getAllOrganizations();
      const allUsers = new Map();
      
      // Collect all unique users across organizations
      for (const org of allOrganizations) {
        const orgUsers = await storage.getOrganizationUsers(org.id);
        for (const orgUser of orgUsers) {
          if (!allUsers.has(orgUser.email)) {
            allUsers.set(orgUser.email, {
              email: orgUser.email,
              firstName: orgUser.firstName,
              lastName: orgUser.lastName,
              organizations: []
            });
          }
          allUsers.get(orgUser.email).organizations.push({
            id: org.id,
            name: org.name,
            role: orgUser.role,
            status: orgUser.status
          });
        }
      }
      
      res.json(Array.from(allUsers.values()));
    } catch (error) {
      console.error('Error fetching all users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  // Update organization user role
  app.put('/api/organizations/:id/users/:userId/role', requireAuth, async (req: any, res) => {
    try {
      const user = req.user;
      if (user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Super admin access required' });
      }

      const userId = parseInt(req.params.userId);
      const roleData = updateUserRoleSchema.parse(req.body);
      
      const updatedUser = await storage.updateOrganizationUser(userId, roleData);
      
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      console.log('✅ User role updated:', updatedUser.email, 'to', updatedUser.role);
      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user role:', error);
      res.status(500).json({ error: 'Failed to update user role' });
    }
  });

  // Update organization user status/info
  app.patch('/api/organizations/:id/users/:userId', requireAuth, async (req: any, res) => {
    try {
      const user = req.user;
      if (user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Super admin access required' });
      }

      const userId = parseInt(req.params.userId);
      const updateData = req.body;
      
      const updatedUser = await storage.updateOrganizationUser(userId, updateData);
      
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      console.log('✅ User updated:', updatedUser.email, updateData);
      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  });

  // Change organization user password
  app.put('/api/organizations/:id/users/:userId/password', requireAuth, async (req: any, res) => {
    try {
      const user = req.user;
      if (user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Super admin access required' });
      }

      const userId = parseInt(req.params.userId);
      const passwordData = changePasswordSchema.parse(req.body);
      
      // Hash the new password using the same method as user creation
      const hashedPassword = await hashPassword(passwordData.newPassword);
      
      const updatedUser = await storage.updateOrganizationUserPassword(userId, hashedPassword);
      
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      console.log('✅ User password changed for:', updatedUser.email);
      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Error changing user password:', error);
      res.status(500).json({ error: 'Failed to change user password' });
    }
  });

  // Delete organization user
  app.delete('/api/organizations/:id/users/:userId', requireAuth, async (req: any, res) => {
    try {
      const user = req.user;
      if (user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Super admin access required' });
      }

      const userId = parseInt(req.params.userId);
      const success = await storage.deleteOrganizationUser(userId);
      
      if (!success) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      console.log('✅ Organization user deleted:', userId);
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting organization user:', error);
      res.status(500).json({ error: 'Failed to delete organization user' });
    }
  });

  // =================== EMAIL TESTING API ===================
  
  // Direct email test (no auth required for testing)
  app.post('/api/test-email-direct', async (req: any, res) => {
    try {
      // Test with simple template without any domain references
      const result = await emailService.sendEmail({
        to: 'marty@24flix.com',
        subject: 'Test Email from Team Platform',
        html: '<h1>Hello!</h1><p>This is a test email from your team collaboration platform.</p>',
        text: 'Hello! This is a test email from your team collaboration platform.'
      });
      
      console.log('🧪 Direct email test result:', result);
      res.json({ success: true, result });
    } catch (error) {
      console.error('❌ Direct email test failed:', error);
      res.status(500).json({ error: 'Failed to send test email' });
    }
  });

  // Test email endpoint
  app.post('/api/test-email', requireAuth, async (req: any, res) => {
    try {
      const user = req.user;
      if (user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Super admin access required' });
      }

      const { to, type } = req.body;
      
      let result;
      switch (type) {
        case 'welcome':
          result = await emailService.sendWelcomeEmail(to, 'Test User', 'User', to, 'test123');
          break;
        case 'mention':
          result = await emailService.sendMentionNotification(to, 'Test User', 'This is a test mention', '#general', 'Test Channel');
          break;
        default:
          return res.status(400).json({ error: 'Invalid email type' });
      }
      
      console.log('🧪 Test email result:', result);
      res.json({ success: true, result });
    } catch (error) {
      console.error('❌ Test email failed:', error);
      res.status(500).json({ error: 'Failed to send test email' });
    }
  });

  // =================== PRICING PLAN MANAGEMENT API ===================

  // Get all pricing plans (public endpoint for marketing website)
  app.get('/api/pricing-plans', async (req: any, res) => {
    try {
      const plans = await storage.getPricingPlans();
      res.json(plans);
    } catch (error) {
      console.error('Error fetching pricing plans:', error);
      res.status(500).json({ error: 'Failed to fetch pricing plans' });
    }
  });

  // Get single pricing plan
  app.get('/api/pricing-plans/:id', requireAuth, async (req: any, res) => {
    try {
      const user = req.user;
      if (user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Super admin access required' });
      }

      const planId = parseInt(req.params.id);
      const plan = await storage.getPricingPlan(planId);
      
      if (!plan) {
        return res.status(404).json({ error: 'Pricing plan not found' });
      }
      
      res.json(plan);
    } catch (error) {
      console.error('Error fetching pricing plan:', error);
      res.status(500).json({ error: 'Failed to fetch pricing plan' });
    }
  });

  // Create pricing plan
  app.post('/api/pricing-plans', requireAuth, async (req: any, res) => {
    try {
      const user = req.user;
      if (user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Super admin access required' });
      }

      const planData = insertPricingPlanSchema.parse(req.body);
      const newPlan = await storage.createPricingPlan(planData);
      
      console.log('✅ Pricing plan created:', newPlan.name);
      res.status(201).json(newPlan);
    } catch (error) {
      console.error('Error creating pricing plan:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          error: 'Invalid pricing plan data', 
          details: error.errors 
        });
      }
      res.status(500).json({ error: 'Failed to create pricing plan' });
    }
  });

  // Update pricing plan
  app.put('/api/pricing-plans/:id', requireAuth, async (req: any, res) => {
    try {
      const user = req.user;
      if (user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Super admin access required' });
      }

      const planId = parseInt(req.params.id);
      const updates = updatePricingPlanSchema.parse(req.body);
      
      const updatedPlan = await storage.updatePricingPlan(planId, updates);
      
      if (!updatedPlan) {
        return res.status(404).json({ error: 'Pricing plan not found' });
      }
      
      console.log('✅ Pricing plan updated:', updatedPlan.name);
      res.json(updatedPlan);
    } catch (error) {
      console.error('Error updating pricing plan:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          error: 'Invalid pricing plan data', 
          details: error.errors 
        });
      }
      res.status(500).json({ error: 'Failed to update pricing plan' });
    }
  });

  // Delete pricing plan
  app.delete('/api/pricing-plans/:id', requireAuth, async (req: any, res) => {
    try {
      const user = req.user;
      if (user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Super admin access required' });
      }

      const planId = parseInt(req.params.id);
      const success = await storage.deletePricingPlan(planId);
      
      if (!success) {
        return res.status(404).json({ error: 'Pricing plan not found' });
      }
      
      console.log('✅ Pricing plan deleted:', planId);
      res.json({ message: 'Pricing plan deleted successfully' });
    } catch (error) {
      console.error('Error deleting pricing plan:', error);
      res.status(500).json({ error: 'Failed to delete pricing plan' });
    }
  });

  // Initialize default pricing plans
  app.post('/api/pricing-plans/initialize', requireAuth, async (req: any, res) => {
    try {
      const user = req.user;
      if (user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Super admin access required' });
      }

      await storage.initializeDefaultPricingPlans();
      res.json({ message: 'Default pricing plans initialized successfully' });
    } catch (error) {
      console.error('Error initializing pricing plans:', error);
      res.status(500).json({ error: 'Failed to initialize pricing plans' });
    }
  });

  // Get plan features and limits by plan name (for validation)
  app.get('/api/pricing-plans/name/:planName/features', async (req: any, res) => {
    try {
      const planName = req.params.planName;
      const plan = await storage.getPricingPlanByName(planName);
      
      if (!plan) {
        return res.status(404).json({ error: 'Pricing plan not found' });
      }
      
      res.json({
        planName: plan.name,
        displayName: plan.displayName,
        features: plan.features,
        limits: {
          maxUsers: plan.maxUsers,
          maxStorage: plan.maxStorage,
          maxWorkspaces: plan.maxWorkspaces,
          maxChannelsPerWorkspace: plan.maxChannelsPerWorkspace,
          maxFileSize: plan.maxFileSize,
          maxAPICallsPerMonth: plan.maxAPICallsPerMonth,
          messageHistoryDays: plan.messageHistoryDays,
          maxVideoCallDuration: plan.maxVideoCallDuration
        }
      });
    } catch (error) {
      console.error('Error fetching plan features:', error);
      res.status(500).json({ error: 'Failed to fetch plan features' });
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