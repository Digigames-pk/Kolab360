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
  type User,
  type UpsertUser,
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

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Workspace operations
  createWorkspace(workspace: InsertWorkspace): Promise<Workspace>;
  getWorkspace(id: string): Promise<Workspace | undefined>;
  getUserWorkspaces(userId: string): Promise<Workspace[]>;
  joinWorkspaceByCode(userId: string, inviteCode: string): Promise<Workspace | null>;
  getWorkspaceMembers(workspaceId: string): Promise<(WorkspaceMember & { user: User })[]>;
  
  // Channel operations
  createChannel(channel: InsertChannel): Promise<Channel>;
  getWorkspaceChannels(workspaceId: string): Promise<Channel[]>;
  getChannel(id: string): Promise<Channel | undefined>;
  joinChannel(channelId: string, userId: string): Promise<void>;
  getChannelMembers(channelId: string): Promise<(ChannelMember & { user: User })[]>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getChannelMessages(channelId: string, limit?: number): Promise<(Message & { author: User })[]>;
  getDirectMessages(userId1: string, userId2: string, limit?: number): Promise<(Message & { author: User })[]>;
  updateMessage(messageId: string, content: string): Promise<Message | undefined>;
  deleteMessage(messageId: string): Promise<boolean>;
  
  // Task operations
  createTask(task: InsertTask): Promise<Task>;
  getWorkspaceTasks(workspaceId: string): Promise<(Task & { assignedUser?: User; creator: User })[]>;
  updateTask(taskId: string, updates: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(taskId: string): Promise<boolean>;
  
  // File operations
  createFile(file: InsertFile): Promise<File>;
  getWorkspaceFiles(workspaceId: string): Promise<(File & { uploader: User })[]>;
  
  // Reaction operations
  addReaction(messageId: string, userId: string, emoji: string): Promise<Reaction>;
  removeReaction(messageId: string, userId: string, emoji: string): Promise<boolean>;
  getMessageReactions(messageId: string): Promise<Reaction[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations - mandatory for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Workspace operations
  async createWorkspace(workspaceData: InsertWorkspace): Promise<Workspace> {
    const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    const [workspace] = await db
      .insert(workspaces)
      .values({ ...workspaceData, inviteCode })
      .returning();

    // Add creator as owner
    await db.insert(workspaceMembers).values({
      workspaceId: workspace.id,
      userId: workspace.ownerId,
      role: "owner",
    });

    return workspace;
  }

  async getWorkspace(id: string): Promise<Workspace | undefined> {
    const [workspace] = await db.select().from(workspaces).where(eq(workspaces.id, id));
    return workspace;
  }

  async getUserWorkspaces(userId: string): Promise<Workspace[]> {
    const result = await db
      .select({
        id: workspaces.id,
        name: workspaces.name,
        description: workspaces.description,
        ownerId: workspaces.ownerId,
        inviteCode: workspaces.inviteCode,
        createdAt: workspaces.createdAt,
        updatedAt: workspaces.updatedAt,
      })
      .from(workspaces)
      .innerJoin(workspaceMembers, eq(workspaces.id, workspaceMembers.workspaceId))
      .where(eq(workspaceMembers.userId, userId))
      .orderBy(asc(workspaces.name));

    return result;
  }

  async joinWorkspaceByCode(userId: string, inviteCode: string): Promise<Workspace | null> {
    const [workspace] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.inviteCode, inviteCode));

    if (!workspace) return null;

    // Check if user is already a member
    const [existingMember] = await db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspace.id),
          eq(workspaceMembers.userId, userId)
        )
      );

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
  async createChannel(channelData: InsertChannel): Promise<Channel> {
    const [channel] = await db.insert(channels).values(channelData).returning();

    // Add creator to channel
    await db.insert(channelMembers).values({
      channelId: channel.id,
      userId: channel.createdBy,
    });

    return channel;
  }

  async getWorkspaceChannels(workspaceId: string): Promise<Channel[]> {
    return await db
      .select()
      .from(channels)
      .where(eq(channels.workspaceId, workspaceId))
      .orderBy(asc(channels.name));
  }

  async getChannel(id: string): Promise<Channel | undefined> {
    const [channel] = await db.select().from(channels).where(eq(channels.id, id));
    return channel;
  }

  async joinChannel(channelId: string, userId: string): Promise<void> {
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
  async createMessage(messageData: InsertMessage): Promise<Message> {
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

  async getDirectMessages(userId1: string, userId2: string, limit = 50): Promise<(Message & { author: User })[]> {
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
  async createTask(taskData: InsertTask): Promise<Task> {
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
        assignedUser: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
      })
      .from(tasks)
      .innerJoin(users, eq(tasks.createdBy, users.id))
      .leftJoin(users, eq(tasks.assignedTo, users.id))
      .where(eq(tasks.workspaceId, workspaceId))
      .orderBy(desc(tasks.createdAt));

    return result;
  }

  async updateTask(taskId: string, updates: Partial<InsertTask>): Promise<Task | undefined> {
    const [task] = await db
      .update(tasks)
      .set({ ...updates, updatedAt: new Date() })
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
        messageId: files.messageId,
        workspaceId: files.workspaceId,
        createdAt: files.createdAt,
        uploader: users,
      })
      .from(files)
      .innerJoin(users, eq(files.uploadedBy, users.id))
      .where(eq(files.workspaceId, workspaceId))
      .orderBy(desc(files.createdAt));

    return result;
  }

  // Reaction operations
  async addReaction(messageId: string, userId: string, emoji: string): Promise<Reaction> {
    const [reaction] = await db
      .insert(reactions)
      .values({ messageId, userId, emoji })
      .returning();
    return reaction;
  }

  async removeReaction(messageId: string, userId: string, emoji: string): Promise<boolean> {
    const result = await db
      .delete(reactions)
      .where(
        and(
          eq(reactions.messageId, messageId),
          eq(reactions.userId, userId),
          eq(reactions.emoji, emoji)
        )
      );
    return result.rowCount > 0;
  }

  async getMessageReactions(messageId: string): Promise<Reaction[]> {
    return await db
      .select()
      .from(reactions)
      .where(eq(reactions.messageId, messageId));
  }
}

export const storage = new DatabaseStorage();
