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
  getWorkspaceFiles(workspaceId: string): Promise<(File & { uploader: User })[]>;
  
  // Reaction operations
  addReaction(messageId: string, userId: number, emoji: string): Promise<Reaction>;
  getMessageReactions(messageId: string): Promise<(Reaction & { user: User })[]>;
  
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
}

export const storage = new DatabaseStorage();