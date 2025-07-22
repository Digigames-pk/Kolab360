import {
  users,
  workspaces,
  workspaceMembers,
  channels,
  channelMembers,
  messages,
  tasks,
  files,
  reactions,
  sessions,
  integrations,
  organizations,
  type User,
  type InsertUser,
  type Workspace,
  type InsertWorkspace,
  type Channel,
  type InsertChannel,
  type Message,
  type InsertMessage,
  type Task,
  type InsertTask,
  type File,
  type InsertFile,
  type WorkspaceMember,
  type ChannelMember,
  type Reaction,
  type Integration,
  type InsertIntegration,
  type Organization,
  type InsertOrganization,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, or, isNull } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLastLogin(id: number): Promise<void>;
  
  // Workspace operations
  createWorkspace(workspace: InsertWorkspace & { ownerId: number }): Promise<Workspace>;
  getWorkspace(id: string): Promise<Workspace | undefined>;
  getUserWorkspaces(userId: number): Promise<Workspace[]>;
  joinWorkspaceByCode(userId: number, inviteCode: string): Promise<Workspace | null>;
  getWorkspaceMembers(workspaceId: string): Promise<(WorkspaceMember & { user: User })[]>;
  
  // Channel operations
  createChannel(channel: InsertChannel & { createdBy: number }): Promise<Channel>;
  getWorkspaceChannels(workspaceId: string): Promise<Channel[]>;
  getChannel(id: string): Promise<Channel | undefined>;
  joinChannel(channelId: string, userId: number): Promise<void>;
  getChannelMembers(channelId: string): Promise<(ChannelMember & { user: User })[]>;
  
  // Message operations
  createMessage(messageData: InsertMessage & { authorId: number }): Promise<Message>;
  getChannelMessages(channelId: string, limit?: number): Promise<(Message & { author: User })[]>;
  getDirectMessages(userId1: number, userId2: number, limit?: number): Promise<(Message & { author: User })[]>;
  updateMessage(messageId: string, content: string): Promise<Message | undefined>;
  deleteMessage(messageId: string): Promise<boolean>;
  
  // Task operations
  createTask(taskData: InsertTask & { createdBy: number }): Promise<Task>;
  getWorkspaceTasks(workspaceId: string): Promise<(Task & { assignedUser?: User; creator: User })[]>;
  updateTaskStatus(taskId: string, status: string): Promise<Task | undefined>;
  deleteTask(taskId: string): Promise<boolean>;
  
  // File operations
  createFile(fileData: InsertFile): Promise<File>;
  getFile(fileId: string): Promise<File | undefined>;
  getWorkspaceFiles(workspaceId: string): Promise<(File & { uploader: User })[]>;
  deleteFile(fileId: string): Promise<boolean>;
  
  // Reaction operations
  addReaction(messageId: string, userId: number, emoji: string): Promise<Reaction>;
  getMessageReactions(messageId: string): Promise<(Reaction & { user: User })[]>;

  // Integration operations
  getIntegrations(userId: number, workspaceId?: string): Promise<Integration[]>;
  createIntegration(integrationData: InsertIntegration & { userId: number }): Promise<Integration>;
  updateIntegration(integrationId: string, userId: number, updates: Partial<Integration>): Promise<Integration>;
  deleteIntegration(integrationId: string, userId: number): Promise<void>;
  getIntegrationStats(): Promise<any>;
  getAllIntegrationsForAdmin(): Promise<any[]>;
  adminUpdateIntegration(integrationId: string, updates: Partial<Integration>): Promise<Integration>;
  adminDeleteIntegration(integrationId: string): Promise<void>;

  // Organization operations
  createOrganization(orgData: InsertOrganization): Promise<Organization>;
  getOrganization(id: number): Promise<Organization | undefined>;
  getAllOrganizations(): Promise<Organization[]>;
  updateOrganization(id: number, updates: Partial<Organization>): Promise<Organization | undefined>;
  deleteOrganization(id: number): Promise<boolean>;
  suspendOrganization(id: number): Promise<Organization | undefined>;
  reactivateOrganization(id: number): Promise<Organization | undefined>;
  
  // Session store
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true 
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUserLastLogin(id: number): Promise<void> {
    await db.update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, id));
  }

  // Workspace operations
  async createWorkspace(workspaceData: InsertWorkspace & { ownerId: number }): Promise<Workspace> {
    const inviteCode = Math.random().toString(36).substring(2, 10);
    const [workspace] = await db.insert(workspaces).values({
      ...workspaceData,
      inviteCode,
    }).returning();

    // Add owner as member
    await db.insert(workspaceMembers).values({
      workspaceId: workspace.id,
      userId: workspaceData.ownerId,
      role: "owner",
    });

    return workspace;
  }

  async getWorkspace(id: string): Promise<Workspace | undefined> {
    const [workspace] = await db.select().from(workspaces).where(eq(workspaces.id, id));
    return workspace;
  }

  async getUserWorkspaces(userId: number): Promise<Workspace[]> {
    const result = await db
      .select({
        id: workspaces.id,
        name: workspaces.name,
        description: workspaces.description,
        ownerId: workspaces.ownerId,
        inviteCode: workspaces.inviteCode,
        isActive: workspaces.isActive,
        createdAt: workspaces.createdAt,
        updatedAt: workspaces.updatedAt,
      })
      .from(workspaces)
      .innerJoin(workspaceMembers, eq(workspaceMembers.workspaceId, workspaces.id))
      .where(eq(workspaceMembers.userId, userId));

    return result;
  }

  async joinWorkspaceByCode(userId: number, inviteCode: string): Promise<Workspace | null> {
    const [workspace] = await db.select().from(workspaces).where(eq(workspaces.inviteCode, inviteCode));
    
    if (!workspace) return null;

    // Check if user is already a member
    const [existingMember] = await db
      .select()
      .from(workspaceMembers)
      .where(and(
        eq(workspaceMembers.workspaceId, workspace.id),
        eq(workspaceMembers.userId, userId)
      ));

    if (!existingMember) {
      await db.insert(workspaceMembers).values({
        workspaceId: workspace.id,
        userId,
        role: "member",
      });
    }

    return workspace;
  }

  async getWorkspaceMembers(workspaceId: string): Promise<(WorkspaceMember & { user: User })[]> {
    const result = await db
      .select({
        id: workspaceMembers.id,
        workspaceId: workspaceMembers.workspaceId,
        userId: workspaceMembers.userId,
        role: workspaceMembers.role,
        joinedAt: workspaceMembers.joinedAt,
        user: users,
      })
      .from(workspaceMembers)
      .innerJoin(users, eq(workspaceMembers.userId, users.id))
      .where(eq(workspaceMembers.workspaceId, workspaceId));

    return result;
  }

  // Channel operations
  async createChannel(channelData: InsertChannel & { createdBy: number }): Promise<Channel> {
    const [channel] = await db.insert(channels).values(channelData).returning();
    
    // Add creator as member
    await db.insert(channelMembers).values({
      channelId: channel.id,
      userId: channelData.createdBy,
    });

    return channel;
  }

  async getWorkspaceChannels(workspaceId: string): Promise<Channel[]> {
    return await db.select().from(channels).where(eq(channels.workspaceId, workspaceId));
  }

  async getChannel(id: string): Promise<Channel | undefined> {
    const [channel] = await db.select().from(channels).where(eq(channels.id, id));
    return channel;
  }

  async joinChannel(channelId: string, userId: number): Promise<void> {
    await db.insert(channelMembers).values({
      channelId,
      userId,
    });
  }

  async getChannelMembers(channelId: string): Promise<(ChannelMember & { user: User })[]> {
    const result = await db
      .select({
        id: channelMembers.id,
        channelId: channelMembers.channelId,
        userId: channelMembers.userId,
        joinedAt: channelMembers.joinedAt,
        user: users,
      })
      .from(channelMembers)
      .innerJoin(users, eq(channelMembers.userId, users.id))
      .where(eq(channelMembers.channelId, channelId));

    return result;
  }

  // Message operations
  async createMessage(messageData: InsertMessage & { authorId: number }): Promise<Message> {
    const [message] = await db.insert(messages).values(messageData).returning();
    return message;
  }

  async getChannelMessages(channelId: string, limit = 50): Promise<(Message & { author: User })[]> {
    const result = await db
      .select({
        id: messages.id,
        content: messages.content,
        authorId: messages.authorId,
        channelId: messages.channelId,
        recipientId: messages.recipientId,
        threadId: messages.threadId,
        messageType: messages.messageType,
        metadata: messages.metadata,
        editedAt: messages.editedAt,
        createdAt: messages.createdAt,
        updatedAt: messages.updatedAt,
        author: users,
      })
      .from(messages)
      .innerJoin(users, eq(messages.authorId, users.id))
      .where(eq(messages.channelId, channelId))
      .orderBy(desc(messages.createdAt))
      .limit(limit);

    return result.reverse();
  }

  async getDirectMessages(userId1: number, userId2: number, limit = 50): Promise<(Message & { author: User })[]> {
    const result = await db
      .select({
        id: messages.id,
        content: messages.content,
        authorId: messages.authorId,
        channelId: messages.channelId,
        recipientId: messages.recipientId,
        threadId: messages.threadId,
        messageType: messages.messageType,
        metadata: messages.metadata,
        editedAt: messages.editedAt,
        createdAt: messages.createdAt,
        updatedAt: messages.updatedAt,
        author: users,
      })
      .from(messages)
      .innerJoin(users, eq(messages.authorId, users.id))
      .where(
        and(
          isNull(messages.channelId),
          or(
            and(eq(messages.authorId, userId1), eq(messages.recipientId, userId2)),
            and(eq(messages.authorId, userId2), eq(messages.recipientId, userId1))
          )
        )
      )
      .orderBy(desc(messages.createdAt))
      .limit(limit);

    return result.reverse();
  }

  async updateMessage(messageId: string, content: string): Promise<Message | undefined> {
    const [message] = await db
      .update(messages)
      .set({ content, editedAt: new Date() })
      .where(eq(messages.id, messageId))
      .returning();
    return message;
  }

  async deleteMessage(messageId: string): Promise<boolean> {
    const result = await db.delete(messages).where(eq(messages.id, messageId));
    return result.rowCount > 0;
  }

  // Task operations
  async createTask(taskData: InsertTask & { createdBy: number }): Promise<Task> {
    const [task] = await db.insert(tasks).values(taskData).returning();
    return task;
  }

  async getWorkspaceTasks(workspaceId: string): Promise<(Task & { assignedUser?: User; creator: User })[]> {
    const result = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        priority: tasks.priority,
        assignedTo: tasks.assignedTo,
        createdBy: tasks.createdBy,
        workspaceId: tasks.workspaceId,
        channelId: tasks.channelId,
        dueDate: tasks.dueDate,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
        creator: users,
        assignedUser: users,
      })
      .from(tasks)
      .innerJoin(users, eq(tasks.createdBy, users.id))
      .leftJoin(users, eq(tasks.assignedTo, users.id))
      .where(eq(tasks.workspaceId, workspaceId));

    return result as any;
  }

  async updateTaskStatus(taskId: string, status: string): Promise<Task | undefined> {
    const [task] = await db
      .update(tasks)
      .set({ status, updatedAt: new Date() })
      .where(eq(tasks.id, taskId))
      .returning();
    return task;
  }

  async deleteTask(taskId: string): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, taskId));
    return result.rowCount > 0;
  }

  // File operations
  async createFile(fileData: InsertFile): Promise<File> {
    const [file] = await db.insert(files).values(fileData).returning();
    return file;
  }

  async getFile(fileId: string): Promise<File | undefined> {
    return await db.query.files.findFirst({
      where: eq(files.id, fileId),
    });
  }

  async getWorkspaceFiles(workspaceId: string): Promise<(File & { uploader: User })[]> {
    const result = await db
      .select({
        id: files.id,
        filename: files.filename,
        originalName: files.originalName,
        mimeType: files.mimeType,
        size: files.size,
        uploadedBy: files.uploadedBy,
        workspaceId: files.workspaceId,
        channelId: files.channelId,
        messageId: files.messageId,
        createdAt: files.createdAt,
        uploader: users,
      })
      .from(files)
      .innerJoin(users, eq(files.uploadedBy, users.id))
      .where(eq(files.workspaceId, workspaceId));

    return result;
  }

  async deleteFile(fileId: string): Promise<boolean> {
    try {
      await db.update(files)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(files.id, fileId));
      return true;
    } catch (error) {
      console.error("Error deleting file:", error);
      return false;
    }
  }

  // Reaction operations
  async addReaction(messageId: string, userId: number, emoji: string): Promise<Reaction> {
    const [reaction] = await db.insert(reactions).values({
      messageId,
      userId,
      emoji,
    }).returning();
    return reaction;
  }

  async getMessageReactions(messageId: string): Promise<(Reaction & { user: User })[]> {
    const result = await db
      .select({
        id: reactions.id,
        messageId: reactions.messageId,
        userId: reactions.userId,
        emoji: reactions.emoji,
        createdAt: reactions.createdAt,
        user: users,
      })
      .from(reactions)
      .innerJoin(users, eq(reactions.userId, users.id))
      .where(eq(reactions.messageId, messageId));

    return result;
  }

  // Integration operations
  async getIntegrations(userId: number, workspaceId?: string): Promise<Integration[]> {
    let query = db.select().from(integrations).where(eq(integrations.userId, userId));
    
    if (workspaceId) {
      query = query.where(eq(integrations.workspaceId, workspaceId));
    }
    
    return await query;
  }

  async createIntegration(integrationData: InsertIntegration & { userId: number }): Promise<Integration> {
    const [integration] = await db.insert(integrations).values(integrationData).returning();
    return integration;
  }

  async updateIntegration(integrationId: string, userId: number, updates: Partial<Integration>): Promise<Integration> {
    const [integration] = await db
      .update(integrations)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(integrations.id, integrationId), eq(integrations.userId, userId)))
      .returning();
    return integration;
  }

  async deleteIntegration(integrationId: string, userId: number): Promise<void> {
    await db
      .delete(integrations)
      .where(and(eq(integrations.id, integrationId), eq(integrations.userId, userId)));
  }

  async getIntegrationStats(): Promise<any> {
    const total = await db.select().from(integrations);
    const active = total.filter(i => i.isEnabled);
    const inactive = total.filter(i => !i.isEnabled);
    const failed = total.filter(i => i.isEnabled && (!i.lastSyncAt || 
      new Date().getTime() - new Date(i.lastSyncAt).getTime() > 7 * 24 * 60 * 60 * 1000));
    
    const byService: Record<string, number> = {};
    const byWorkspace: Record<string, number> = {};
    
    for (const integration of total) {
      byService[integration.service] = (byService[integration.service] || 0) + 1;
      // We would need to join with workspaces to get workspace names
      byWorkspace[integration.workspaceId] = (byWorkspace[integration.workspaceId] || 0) + 1;
    }
    
    return {
      total: total.length,
      active: active.length,
      inactive: inactive.length,
      failed: failed.length,
      byService,
      byWorkspace,
      recentActivity: [] // Could be implemented with an activity log table
    };
  }

  async getAllIntegrationsForAdmin(): Promise<any[]> {
    const result = await db
      .select({
        id: integrations.id,
        service: integrations.service,
        serviceName: integrations.serviceName,
        isEnabled: integrations.isEnabled,
        config: integrations.config,
        workspaceId: integrations.workspaceId,
        workspaceName: workspaces.name,
        userId: integrations.userId,
        userName: users.firstName,
        userEmail: users.email,
        lastSyncAt: integrations.lastSyncAt,
        createdAt: integrations.createdAt,
        updatedAt: integrations.updatedAt,
      })
      .from(integrations)
      .innerJoin(users, eq(integrations.userId, users.id))
      .innerJoin(workspaces, eq(integrations.workspaceId, workspaces.id));
    
    return result;
  }

  async adminUpdateIntegration(integrationId: string, updates: Partial<Integration>): Promise<Integration> {
    const [integration] = await db
      .update(integrations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(integrations.id, integrationId))
      .returning();
    return integration;
  }

  async adminDeleteIntegration(integrationId: string): Promise<void> {
    await db.delete(integrations).where(eq(integrations.id, integrationId));
  }

  // Organization operations
  async createOrganization(orgData: InsertOrganization): Promise<Organization> {
    const [organization] = await db.insert(organizations).values(orgData).returning();
    return organization;
  }

  async getOrganization(id: number): Promise<Organization | undefined> {
    const [organization] = await db.select().from(organizations).where(eq(organizations.id, id));
    return organization;
  }

  async getAllOrganizations(): Promise<Organization[]> {
    return await db.select().from(organizations).orderBy(desc(organizations.createdAt));
  }

  async updateOrganization(id: number, updates: Partial<Organization>): Promise<Organization | undefined> {
    const [organization] = await db
      .update(organizations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(organizations.id, id))
      .returning();
    return organization;
  }

  async deleteOrganization(id: number): Promise<boolean> {
    try {
      await db.delete(organizations).where(eq(organizations.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting organization:", error);
      return false;
    }
  }

  async suspendOrganization(id: number): Promise<Organization | undefined> {
    const [organization] = await db
      .update(organizations)
      .set({ status: 'suspended', updatedAt: new Date() })
      .where(eq(organizations.id, id))
      .returning();
    return organization;
  }

  async reactivateOrganization(id: number): Promise<Organization | undefined> {
    const [organization] = await db
      .update(organizations)
      .set({ status: 'active', updatedAt: new Date() })
      .where(eq(organizations.id, id))
      .returning();
    return organization;
  }
}

// Memory storage for immediate messaging functionality
class MemoryStorage implements IStorage {
  private mockMessages: (Message & { author: User })[] = [];

  // Stub implementations for required interface methods
  async getUser(id: number): Promise<User | undefined> {
    const mockUsers = [
      { id: 1, email: "superadmin@test.com", firstName: "Super", lastName: "Admin", role: "super_admin" as const, createdAt: new Date(), lastLoginAt: null, password: "e25d883467ba11901ebf37792170a5087dbb721547f4a52c825f91731a84f30f7b42970105905ed9d4e7001425b00a48aabdc3a55f7cb4e03fcb21f8d7785dd8.0676a4c0e76c62b064d9164aef1ec932", isActive: true, profileImageUrl: null, updatedAt: new Date() },
      { id: 2, email: "marty@onlinechannel.tv", firstName: "Marty", lastName: "Admin", role: "super_admin" as const, createdAt: new Date(), lastLoginAt: null, password: "868c3aab6b6da8a7ffeabea8dccdcb979ac02140202c61baf74adf354950709cb39b78e2537833e2805226bb024c2990dce597ea5498d6e3fea161d48783390f.de40c536d496db6e61469290bfbc6984", isActive: true, profileImageUrl: null, updatedAt: new Date() }
    ];
    return mockUsers.find(u => u.id === id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const mockUsers = [
      { id: 1, email: "superadmin@test.com", firstName: "Super", lastName: "Admin", role: "super_admin" as const, createdAt: new Date(), lastLoginAt: null, password: "e25d883467ba11901ebf37792170a5087dbb721547f4a52c825f91731a84f30f7b42970105905ed9d4e7001425b00a48aabdc3a55f7cb4e03fcb21f8d7785dd8.0676a4c0e76c62b064d9164aef1ec932", isActive: true, profileImageUrl: null, updatedAt: new Date() },
      { id: 2, email: "marty@onlinechannel.tv", firstName: "Marty", lastName: "Admin", role: "super_admin" as const, createdAt: new Date(), lastLoginAt: null, password: "868c3aab6b6da8a7ffeabea8dccdcb979ac02140202c61baf74adf354950709cb39b78e2537833e2805226bb024c2990dce597ea5498d6e3fea161d48783390f.de40c536d496db6e61469290bfbc6984", isActive: true, profileImageUrl: null, updatedAt: new Date() }
    ];
    return mockUsers.find(u => u.email === email);
  }

  async createUser(user: InsertUser): Promise<User> {
    throw new Error("Method not implemented for memory storage");
  }

  async updateUserLastLogin(id: number): Promise<void> {
    // No-op for memory storage
  }

  async createWorkspace(workspace: InsertWorkspace & { ownerId: number }): Promise<Workspace> {
    throw new Error("Method not implemented for memory storage");
  }

  async getWorkspace(id: string): Promise<Workspace | undefined> {
    return undefined;
  }

  async getUserWorkspaces(userId: number): Promise<Workspace[]> {
    return [];
  }

  async joinWorkspaceByCode(userId: number, inviteCode: string): Promise<Workspace | null> {
    return null;
  }

  async getWorkspaceMembers(workspaceId: string): Promise<(WorkspaceMember & { user: User })[]> {
    return [];
  }

  async createChannel(channel: InsertChannel & { createdBy: number }): Promise<Channel> {
    throw new Error("Method not implemented for memory storage");
  }

  async getWorkspaceChannels(workspaceId: string): Promise<Channel[]> {
    return [];
  }

  async getChannel(id: string): Promise<Channel | undefined> {
    return undefined;
  }

  async joinChannel(channelId: string, userId: number): Promise<void> {
    // No-op for memory storage
  }

  async getChannelMembers(channelId: string): Promise<(ChannelMember & { user: User })[]> {
    return [];
  }

  async createMessage(messageData: InsertMessage & { authorId: number }): Promise<Message> {
    const newMessage: Message = {
      id: (this.mockMessages.length + 1).toString(),
      content: messageData.content,
      authorId: messageData.authorId,
      channelId: messageData.channelId || null,
      recipientId: messageData.recipientId || null,
      threadId: messageData.threadId || null,
      messageType: messageData.messageType || "text",
      metadata: messageData.metadata || null,
      editedAt: null,
      createdAt: new Date()
    };
    
    // Add to mock messages with author info
    const author = await this.getUser(messageData.authorId);
    if (author) {
      this.mockMessages.push({ ...newMessage, author });
    }
    
    return newMessage;
  }

  async getChannelMessages(channelId: string, limit = 50): Promise<(Message & { author: User })[]> {
    return this.mockMessages
      .filter(m => m.channelId === channelId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .slice(-limit);
  }

  async getDirectMessages(userId1: number, userId2: number, limit = 50): Promise<(Message & { author: User })[]> {
    return this.mockMessages
      .filter(m => 
        (m.authorId === userId1 && m.recipientId === userId2) ||
        (m.authorId === userId2 && m.recipientId === userId1)
      )
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .slice(-limit);
  }

  async updateMessage(messageId: string, content: string): Promise<Message | undefined> {
    const messageIndex = this.mockMessages.findIndex(m => m.id === messageId);
    if (messageIndex >= 0) {
      this.mockMessages[messageIndex].content = content;
      this.mockMessages[messageIndex].editedAt = new Date();
      return this.mockMessages[messageIndex];
    }
    return undefined;
  }

  async deleteMessage(messageId: string): Promise<boolean> {
    const messageIndex = this.mockMessages.findIndex(m => m.id === messageId);
    if (messageIndex >= 0) {
      this.mockMessages.splice(messageIndex, 1);
      return true;
    }
    return false;
  }

  // Stub implementations for other required methods
  async createTask(taskData: InsertTask & { createdBy: number }): Promise<Task> { throw new Error("Not implemented"); }
  async getWorkspaceTasks(workspaceId: string): Promise<(Task & { assignedUser?: User; creator: User })[]> { return []; }
  async updateTaskStatus(taskId: string, status: string): Promise<Task | undefined> { return undefined; }
  async deleteTask(taskId: string): Promise<boolean> { return false; }
  async createFile(fileData: InsertFile): Promise<File> { throw new Error("Not implemented"); }
  async getFile(fileId: string): Promise<File | undefined> { return undefined; }
  async getWorkspaceFiles(workspaceId: string): Promise<(File & { uploader: User })[]> { return []; }
  async deleteFile(fileId: string): Promise<boolean> { return false; }
  async addReaction(messageId: string, userId: number, emoji: string): Promise<Reaction> { throw new Error("Not implemented"); }
  async getMessageReactions(messageId: string): Promise<(Reaction & { user: User })[]> { return []; }
  async getIntegrations(userId: number, workspaceId?: string): Promise<Integration[]> { return []; }
  async createIntegration(integrationData: InsertIntegration & { userId: number }): Promise<Integration> { throw new Error("Not implemented"); }
  async updateIntegration(integrationId: string, userId: number, updates: Partial<Integration>): Promise<Integration> { throw new Error("Not implemented"); }
  async deleteIntegration(integrationId: string, userId: number): Promise<void> { }
  async adminGetAllIntegrations(): Promise<(Integration & { user: User; workspace: Workspace })[]> { return []; }
  async adminUpdateIntegration(integrationId: string, updates: Partial<Integration>): Promise<Integration> { throw new Error("Not implemented"); }
  async adminDeleteIntegration(integrationId: string): Promise<void> { }

  // Organization operations - In-memory implementation
  private organizations: Organization[] = [];

  async createOrganization(orgData: InsertOrganization): Promise<Organization> {
    const newOrg: Organization = {
      id: this.organizations.length + 1,
      ...orgData,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.organizations.push(newOrg);
    return newOrg;
  }

  async getOrganization(id: number): Promise<Organization | undefined> {
    return this.organizations.find(org => org.id === id);
  }

  async getAllOrganizations(): Promise<Organization[]> {
    return [...this.organizations].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateOrganization(id: number, updates: Partial<Organization>): Promise<Organization | undefined> {
    const index = this.organizations.findIndex(org => org.id === id);
    if (index >= 0) {
      this.organizations[index] = { 
        ...this.organizations[index], 
        ...updates, 
        updatedAt: new Date() 
      };
      return this.organizations[index];
    }
    return undefined;
  }

  async deleteOrganization(id: number): Promise<boolean> {
    const index = this.organizations.findIndex(org => org.id === id);
    if (index >= 0) {
      this.organizations.splice(index, 1);
      return true;
    }
    return false;
  }

  async suspendOrganization(id: number): Promise<Organization | undefined> {
    return this.updateOrganization(id, { status: 'suspended' });
  }

  async reactivateOrganization(id: number): Promise<Organization | undefined> {
    return this.updateOrganization(id, { status: 'active' });
  }
}

// Use memory storage for immediate messaging functionality  
export const storage = process.env.NODE_ENV === 'development' ? new MemoryStorage() : new DatabaseStorage();