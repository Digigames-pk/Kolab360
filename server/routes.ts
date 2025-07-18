import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, requireAuth, requireRole } from "./auth";
import { generateAIResponse, analyzeSentiment, summarizeMessages, generateTasks, autoCompleteMessage } from "./openai";
import { emailService } from "./email";
import { 
  insertWorkspaceSchema, 
  insertChannelSchema, 
  insertMessageSchema, 
  insertTaskSchema 
} from "@shared/schema";
import multer from "multer";
import path from "path";
import { z } from "zod";

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
  app.get('/api/channels/:id/messages', requireAuth, async (req: any, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const messages = await storage.getChannelMessages(req.params.id, limit);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/channels/:id/messages', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const messageData = insertMessageSchema.parse({
        ...req.body,
        channelId: req.params.id,
      });
      
      const message = await storage.createMessage({
        ...messageData,
        authorId: userId,
      });

      // Broadcast to WebSocket connections
      const messageWithAuthor = {
        ...message,
        author: req.user,
      };

      connections.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN && ws.channelId === req.params.id) {
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
  app.get('/api/users/:userId/messages', requireAuth, async (req: any, res) => {
    try {
      const currentUserId = req.user.id;
      const otherUserId = parseInt(req.params.userId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      
      const messages = await storage.getDirectMessages(currentUserId, otherUserId, limit);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching direct messages:", error);
      res.status(500).json({ message: "Failed to fetch direct messages" });
    }
  });

  app.post('/api/users/:userId/messages', requireAuth, async (req: any, res) => {
    try {
      const currentUserId = req.user.id;
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
      const messageWithAuthor = {
        ...message,
        author: req.user,
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
            ws.channelId = message.channelId;
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