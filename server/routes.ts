import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generateAIResponse, analyzeSentiment, summarizeMessages, generateTasks, autoCompleteMessage } from "./openai";
import { insertWorkspaceSchema, insertChannelSchema, insertMessageSchema, insertTaskSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import { z } from "zod";

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

interface WebSocketConnection extends WebSocket {
  userId?: string;
  workspaceId?: string;
  channelId?: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // WebSocket connections store
  const connections = new Set<WebSocketConnection>();

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Workspace routes
  app.post('/api/workspaces', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const workspaceData = insertWorkspaceSchema.parse({
        ...req.body,
        ownerId: userId,
      });
      
      const workspace = await storage.createWorkspace(workspaceData);
      res.json(workspace);
    } catch (error) {
      console.error("Error creating workspace:", error);
      res.status(500).json({ message: "Failed to create workspace" });
    }
  });

  app.get('/api/workspaces', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const workspaces = await storage.getUserWorkspaces(userId);
      res.json(workspaces);
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      res.status(500).json({ message: "Failed to fetch workspaces" });
    }
  });

  app.post('/api/workspaces/join', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { inviteCode } = req.body;
      
      const workspace = await storage.joinWorkspaceByCode(userId, inviteCode);
      if (!workspace) {
        return res.status(404).json({ message: "Invalid invite code" });
      }
      
      res.json(workspace);
    } catch (error) {
      console.error("Error joining workspace:", error);
      res.status(500).json({ message: "Failed to join workspace" });
    }
  });

  app.get('/api/workspaces/:id/members', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const members = await storage.getWorkspaceMembers(id);
      res.json(members);
    } catch (error) {
      console.error("Error fetching workspace members:", error);
      res.status(500).json({ message: "Failed to fetch workspace members" });
    }
  });

  // Channel routes
  app.post('/api/channels', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const channelData = insertChannelSchema.parse({
        ...req.body,
        createdBy: userId,
      });
      
      const channel = await storage.createChannel(channelData);
      res.json(channel);
    } catch (error) {
      console.error("Error creating channel:", error);
      res.status(500).json({ message: "Failed to create channel" });
    }
  });

  app.get('/api/workspaces/:workspaceId/channels', isAuthenticated, async (req, res) => {
    try {
      const { workspaceId } = req.params;
      const channels = await storage.getWorkspaceChannels(workspaceId);
      res.json(channels);
    } catch (error) {
      console.error("Error fetching channels:", error);
      res.status(500).json({ message: "Failed to fetch channels" });
    }
  });

  app.post('/api/channels/:channelId/join', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { channelId } = req.params;
      
      await storage.joinChannel(channelId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error joining channel:", error);
      res.status(500).json({ message: "Failed to join channel" });
    }
  });

  app.get('/api/channels/:channelId/members', isAuthenticated, async (req, res) => {
    try {
      const { channelId } = req.params;
      const members = await storage.getChannelMembers(channelId);
      res.json(members);
    } catch (error) {
      console.error("Error fetching channel members:", error);
      res.status(500).json({ message: "Failed to fetch channel members" });
    }
  });

  // Message routes
  app.get('/api/channels/:channelId/messages', isAuthenticated, async (req, res) => {
    try {
      const { channelId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const messages = await storage.getChannelMessages(channelId, limit);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.get('/api/messages/direct/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const { userId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      
      const messages = await storage.getDirectMessages(currentUserId, userId, limit);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching direct messages:", error);
      res.status(500).json({ message: "Failed to fetch direct messages" });
    }
  });

  app.put('/api/messages/:messageId', isAuthenticated, async (req: any, res) => {
    try {
      const { messageId } = req.params;
      const { content } = req.body;
      
      const message = await storage.updateMessage(messageId, content);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      res.json(message);
    } catch (error) {
      console.error("Error updating message:", error);
      res.status(500).json({ message: "Failed to update message" });
    }
  });

  app.delete('/api/messages/:messageId', isAuthenticated, async (req, res) => {
    try {
      const { messageId } = req.params;
      const success = await storage.deleteMessage(messageId);
      
      if (!success) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting message:", error);
      res.status(500).json({ message: "Failed to delete message" });
    }
  });

  // AI routes
  app.post('/api/ai/chat', isAuthenticated, async (req, res) => {
    try {
      const { prompt, context } = req.body;
      const response = await generateAIResponse(prompt, context);
      res.json({ response });
    } catch (error) {
      console.error("Error generating AI response:", error);
      res.status(500).json({ message: "Failed to generate AI response" });
    }
  });

  app.post('/api/ai/sentiment', isAuthenticated, async (req, res) => {
    try {
      const { text } = req.body;
      const sentiment = await analyzeSentiment(text);
      res.json(sentiment);
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
      res.status(500).json({ message: "Failed to analyze sentiment" });
    }
  });

  app.post('/api/ai/summarize', isAuthenticated, async (req, res) => {
    try {
      const { messages } = req.body;
      const summary = await summarizeMessages(messages);
      res.json({ summary });
    } catch (error) {
      console.error("Error generating summary:", error);
      res.status(500).json({ message: "Failed to generate summary" });
    }
  });

  app.post('/api/ai/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { conversationText, workspaceId, channelId } = req.body;
      
      const aiTasks = await generateTasks(conversationText);
      const createdTasks = [];
      
      for (const aiTask of aiTasks) {
        const task = await storage.createTask({
          title: aiTask.title,
          description: aiTask.description,
          priority: aiTask.priority,
          status: "todo",
          createdBy: userId,
          workspaceId,
          channelId: channelId || null,
        });
        createdTasks.push(task);
      }
      
      res.json(createdTasks);
    } catch (error) {
      console.error("Error generating tasks:", error);
      res.status(500).json({ message: "Failed to generate tasks" });
    }
  });

  app.post('/api/ai/autocomplete', isAuthenticated, async (req, res) => {
    try {
      const { partialMessage, context } = req.body;
      const completion = await autoCompleteMessage(partialMessage, context);
      res.json({ completion });
    } catch (error) {
      console.error("Error auto-completing message:", error);
      res.status(500).json({ message: "Failed to auto-complete message" });
    }
  });

  // Task routes
  app.post('/api/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const taskData = insertTaskSchema.parse({
        ...req.body,
        createdBy: userId,
      });
      
      const task = await storage.createTask(taskData);
      res.json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.get('/api/workspaces/:workspaceId/tasks', isAuthenticated, async (req, res) => {
    try {
      const { workspaceId } = req.params;
      const tasks = await storage.getWorkspaceTasks(workspaceId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.put('/api/tasks/:taskId', isAuthenticated, async (req, res) => {
    try {
      const { taskId } = req.params;
      const updates = req.body;
      
      const task = await storage.updateTask(taskId, updates);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.delete('/api/tasks/:taskId', isAuthenticated, async (req, res) => {
    try {
      const { taskId } = req.params;
      const success = await storage.deleteTask(taskId);
      
      if (!success) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // File upload routes
  app.post('/api/files', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const userId = req.user.claims.sub;
      const { workspaceId, messageId } = req.body;
      
      const file = await storage.createFile({
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        uploadedBy: userId,
        workspaceId,
        messageId: messageId || null,
      });
      
      res.json(file);
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  app.get('/api/workspaces/:workspaceId/files', isAuthenticated, async (req, res) => {
    try {
      const { workspaceId } = req.params;
      const files = await storage.getWorkspaceFiles(workspaceId);
      res.json(files);
    } catch (error) {
      console.error("Error fetching files:", error);
      res.status(500).json({ message: "Failed to fetch files" });
    }
  });

  // Reaction routes
  app.post('/api/messages/:messageId/reactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { messageId } = req.params;
      const { emoji } = req.body;
      
      const reaction = await storage.addReaction(messageId, userId, emoji);
      res.json(reaction);
    } catch (error) {
      console.error("Error adding reaction:", error);
      res.status(500).json({ message: "Failed to add reaction" });
    }
  });

  app.delete('/api/messages/:messageId/reactions/:emoji', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { messageId, emoji } = req.params;
      
      const success = await storage.removeReaction(messageId, userId, emoji);
      if (!success) {
        return res.status(404).json({ message: "Reaction not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing reaction:", error);
      res.status(500).json({ message: "Failed to remove reaction" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket setup
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocketConnection, req) => {
    console.log('New WebSocket connection');
    connections.add(ws);

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        switch (message.type) {
          case 'auth':
            ws.userId = message.userId;
            ws.workspaceId = message.workspaceId;
            ws.channelId = message.channelId;
            break;

          case 'message':
            if (ws.userId) {
              const messageData = insertMessageSchema.parse({
                content: message.content,
                authorId: ws.userId,
                channelId: message.channelId || null,
                recipientId: message.recipientId || null,
                messageType: message.messageType || 'text',
                metadata: message.metadata || null,
              });
              
              const newMessage = await storage.createMessage(messageData);
              const messageWithAuthor = {
                ...newMessage,
                author: await storage.getUser(ws.userId),
              };

              // Broadcast to all connections in the same channel/DM
              connections.forEach((conn) => {
                if (conn.readyState === WebSocket.OPEN) {
                  if (message.channelId && conn.channelId === message.channelId) {
                    conn.send(JSON.stringify({
                      type: 'message',
                      data: messageWithAuthor,
                    }));
                  } else if (message.recipientId && 
                           (conn.userId === message.recipientId || conn.userId === ws.userId)) {
                    conn.send(JSON.stringify({
                      type: 'directMessage',
                      data: messageWithAuthor,
                    }));
                  }
                }
              });
            }
            break;

          case 'typing':
            if (ws.userId) {
              connections.forEach((conn) => {
                if (conn.readyState === WebSocket.OPEN && 
                    conn.channelId === message.channelId && 
                    conn.userId !== ws.userId) {
                  conn.send(JSON.stringify({
                    type: 'typing',
                    userId: ws.userId,
                    channelId: message.channelId,
                    isTyping: message.isTyping,
                  }));
                }
              });
            }
            break;

          case 'join_channel':
            ws.channelId = message.channelId;
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format',
        }));
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
