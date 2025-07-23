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
  organizationSettings,
  organizationUsers,
  pricingPlans,
  workspaceMoodBoards,
  moodBoardVotes,
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
  type OrganizationSettings,
  type InsertOrganizationSettings,
  type OrganizationUser,
  type InsertOrganizationUser,
  type PricingPlan,
  type InsertPricingPlan,
  type UpdatePricingPlan,
  type WorkspaceMoodBoard,
  type InsertWorkspaceMoodBoard,
  type MoodBoardVote,
  type InsertMoodBoardVote,
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
  updateUserPassword(id: number, newPassword: string): Promise<User | undefined>;
  updateUserRole(id: number, role: string): Promise<User | undefined>;
  
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
  
  // Organization Settings operations
  getOrganizationSettings(orgId: number): Promise<OrganizationSettings | undefined>;
  updateOrganizationSettings(orgId: number, settings: Partial<OrganizationSettings>): Promise<OrganizationSettings>;
  createOrganizationSettings(orgId: number, settings: InsertOrganizationSettings): Promise<OrganizationSettings>;
  
  // Organization User operations
  getOrganizationUsers(orgId: number): Promise<OrganizationUser[]>;
  getOrganizationUserByEmail(email: string): Promise<OrganizationUser | undefined>;
  getOrganizationUserById(id: number): Promise<OrganizationUser | undefined>;
  createOrganizationUser(userData: InsertOrganizationUser): Promise<OrganizationUser>;
  updateOrganizationUser(id: number, updates: Partial<OrganizationUser>): Promise<OrganizationUser | undefined>;
  deleteOrganizationUser(id: number): Promise<boolean>;
  updateOrganizationUserPassword(id: number, hashedPassword: string): Promise<OrganizationUser | undefined>;
  
  // Pricing Plan operations
  getPricingPlans(): Promise<PricingPlan[]>;
  getPricingPlan(id: number): Promise<PricingPlan | undefined>;
  getPricingPlanByName(name: string): Promise<PricingPlan | undefined>;
  createPricingPlan(planData: InsertPricingPlan): Promise<PricingPlan>;
  updatePricingPlan(id: number, updates: UpdatePricingPlan): Promise<PricingPlan | undefined>;
  deletePricingPlan(id: number): Promise<boolean>;
  initializeDefaultPricingPlans(): Promise<void>;
  
  // Mood Board operations
  getWorkspaceMoodBoards(workspaceId: string): Promise<WorkspaceMoodBoard[]>;
  getWorkspaceMoodBoard(id: number): Promise<WorkspaceMoodBoard | undefined>;
  createWorkspaceMoodBoard(moodBoardData: InsertWorkspaceMoodBoard & { createdBy: number }): Promise<WorkspaceMoodBoard>;
  updateWorkspaceMoodBoard(id: number, updates: Partial<WorkspaceMoodBoard>): Promise<WorkspaceMoodBoard | undefined>;
  deleteWorkspaceMoodBoard(id: number): Promise<boolean>;
  activateWorkspaceMoodBoard(workspaceId: string, moodBoardId: number): Promise<WorkspaceMoodBoard | undefined>;
  voteMoodBoard(voteData: InsertMoodBoardVote): Promise<MoodBoardVote>;
  getMoodBoardVotes(moodBoardId: number): Promise<MoodBoardVote[]>;
  initializeDefaultMoodBoards(): Promise<void>;
  
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

  async updateUserPassword(id: number, newPassword: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ password: newPassword, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserRole(id: number, role: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
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

  // Organization Settings operations
  async getOrganizationSettings(orgId: number): Promise<OrganizationSettings | undefined> {
    const [settings] = await db.select().from(organizationSettings).where(eq(organizationSettings.organizationId, orgId));
    return settings;
  }

  async updateOrganizationSettings(orgId: number, settingsData: Partial<OrganizationSettings>): Promise<OrganizationSettings> {
    const [settings] = await db
      .update(organizationSettings)
      .set({ ...settingsData, updatedAt: new Date() })
      .where(eq(organizationSettings.organizationId, orgId))
      .returning();
    return settings;
  }

  async createOrganizationSettings(orgId: number, settingsData: InsertOrganizationSettings): Promise<OrganizationSettings> {
    const [settings] = await db.insert(organizationSettings).values({
      organizationId: orgId,
      ...settingsData,
    }).returning();
    return settings;
  }

  // Organization User operations
  async getOrganizationUsers(orgId: number): Promise<OrganizationUser[]> {
    return await db.select().from(organizationUsers).where(eq(organizationUsers.organizationId, orgId));
  }

  async getOrganizationUserByEmail(email: string): Promise<OrganizationUser | undefined> {
    // Get all users with this email, ordered by most recent update first
    const users = await db.select().from(organizationUsers)
      .where(eq(organizationUsers.email, email))
      .orderBy(desc(organizationUsers.updatedAt));
    
    // Prefer users with non-null passwords, and among those, take the most recent
    const usersWithPassword = users.filter(user => user.password !== null && user.password !== '');
    return usersWithPassword[0] || users[0];
  }

  async getOrganizationUserById(id: number): Promise<OrganizationUser | undefined> {
    return await db.select().from(organizationUsers)
      .where(eq(organizationUsers.id, id))
      .then(users => users[0]);
  }

  async createOrganizationUser(userData: InsertOrganizationUser): Promise<OrganizationUser> {
    const [user] = await db.insert(organizationUsers).values(userData).returning();
    return user;
  }

  async updateOrganizationUser(id: number, updates: Partial<OrganizationUser>): Promise<OrganizationUser | undefined> {
    const [user] = await db
      .update(organizationUsers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(organizationUsers.id, id))
      .returning();
    return user;
  }

  async deleteOrganizationUser(id: number): Promise<boolean> {
    try {
      await db.delete(organizationUsers).where(eq(organizationUsers.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting organization user:", error);
      return false;
    }
  }

  async updateOrganizationUserPassword(id: number, hashedPassword: string): Promise<OrganizationUser | undefined> {
    const [user] = await db
      .update(organizationUsers)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(organizationUsers.id, id))
      .returning();
    return user;
  }

  // Pricing Plan operations
  async getPricingPlans(): Promise<PricingPlan[]> {
    return await db
      .select()
      .from(pricingPlans)
      .where(eq(pricingPlans.isActive, true))
      .orderBy(asc(pricingPlans.sortOrder), asc(pricingPlans.price));
  }

  async getPricingPlan(id: number): Promise<PricingPlan | undefined> {
    const [plan] = await db
      .select()
      .from(pricingPlans)
      .where(eq(pricingPlans.id, id));
    return plan;
  }

  async getPricingPlanByName(name: string): Promise<PricingPlan | undefined> {
    const [plan] = await db
      .select()
      .from(pricingPlans)
      .where(eq(pricingPlans.name, name));
    return plan;
  }

  async createPricingPlan(planData: InsertPricingPlan): Promise<PricingPlan> {
    const [plan] = await db
      .insert(pricingPlans)
      .values({
        ...planData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return plan;
  }

  async updatePricingPlan(id: number, updates: UpdatePricingPlan): Promise<PricingPlan | undefined> {
    const [plan] = await db
      .update(pricingPlans)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(pricingPlans.id, id))
      .returning();
    return plan;
  }

  async deletePricingPlan(id: number): Promise<boolean> {
    const [plan] = await db
      .update(pricingPlans)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(pricingPlans.id, id))
      .returning();
    return !!plan;
  }

  async initializeDefaultPricingPlans(): Promise<void> {
    // Check if plans already exist
    const existingPlans = await db.select().from(pricingPlans).limit(1);
    if (existingPlans.length > 0) {
      console.log('📦 [PLANS] Default pricing plans already exist');
      return;
    }

    console.log('📦 [PLANS] Initializing default pricing plans...');

    const defaultPlans = [
      {
        name: 'free',
        displayName: 'Free',
        description: 'Perfect for small teams getting started',
        price: 0,
        billingPeriod: 'monthly',
        maxUsers: 5,
        maxStorage: 1024, // 1GB
        maxWorkspaces: 1,
        maxChannelsPerWorkspace: 5,
        maxFileSize: 10,
        maxAPICallsPerMonth: 1000,
        messageHistoryDays: 30,
        maxVideoCallDuration: 45,
        sortOrder: 1,
        features: {
          messaging: true,
          directMessages: true,
          fileSharing: true,
          voiceCalls: false,
          videoCalls: false,
          screenSharing: false,
          channels: { enabled: true, maxChannels: 5, privateChannels: false },
          workspaces: { enabled: true, maxWorkspaces: 1, customBranding: false },
          tasks: { enabled: true, kanbanView: true, calendar: false, timeTracking: false, customFields: false },
          integrations: { enabled: false, maxIntegrations: 0, customIntegrations: false },
          analytics: { enabled: false, basicReports: false, advancedReports: false, exportData: false, realTimeAnalytics: false },
          security: { twoFactorAuth: false, singleSignOn: false, auditLogs: false, dataRetentionControls: false, complianceReporting: false },
          support: { emailSupport: true, chatSupport: false, phoneSupport: false, prioritySupport: false, dedicatedAccountManager: false },
          ai: { enabled: false, smartSuggestions: false, sentimentAnalysis: false, autoSummarization: false, languageTranslation: false, customAIModels: false }
        }
      },
      {
        name: 'starter',
        displayName: 'Starter',
        description: 'Great for growing teams with basic needs',
        price: 800, // $8/month
        billingPeriod: 'monthly',
        maxUsers: 25,
        maxStorage: 5120, // 5GB
        maxWorkspaces: 3,
        maxChannelsPerWorkspace: 20,
        maxFileSize: 50,
        maxAPICallsPerMonth: 5000,
        messageHistoryDays: 90,
        maxVideoCallDuration: 60,
        sortOrder: 2,
        features: {
          messaging: true,
          directMessages: true,
          fileSharing: true,
          voiceCalls: true,
          videoCalls: true,
          screenSharing: true,
          channels: { enabled: true, maxChannels: 20, privateChannels: true },
          workspaces: { enabled: true, maxWorkspaces: 3, customBranding: false },
          tasks: { enabled: true, kanbanView: true, calendar: true, timeTracking: false, customFields: false },
          integrations: { enabled: true, maxIntegrations: 5, customIntegrations: false },
          analytics: { enabled: true, basicReports: true, advancedReports: false, exportData: true, realTimeAnalytics: false },
          security: { twoFactorAuth: true, singleSignOn: false, auditLogs: false, dataRetentionControls: false, complianceReporting: false },
          support: { emailSupport: true, chatSupport: true, phoneSupport: false, prioritySupport: false, dedicatedAccountManager: false },
          ai: { enabled: true, smartSuggestions: true, sentimentAnalysis: false, autoSummarization: false, languageTranslation: false, customAIModels: false }
        }
      },
      {
        name: 'pro',
        displayName: 'Professional',
        description: 'Advanced features for productive teams',
        price: 1500, // $15/month
        billingPeriod: 'monthly',
        maxUsers: 100,
        maxStorage: 20480, // 20GB
        maxWorkspaces: 10,
        maxChannelsPerWorkspace: 100,
        maxFileSize: 100,
        maxAPICallsPerMonth: 25000,
        messageHistoryDays: 180,
        maxVideoCallDuration: 120,
        sortOrder: 3,
        features: {
          messaging: true,
          directMessages: true,
          fileSharing: true,
          voiceCalls: true,
          videoCalls: true,
          screenSharing: true,
          channels: { enabled: true, maxChannels: 100, privateChannels: true },
          workspaces: { enabled: true, maxWorkspaces: 10, customBranding: true },
          tasks: { enabled: true, kanbanView: true, calendar: true, timeTracking: true, customFields: true },
          integrations: { enabled: true, maxIntegrations: 25, customIntegrations: true },
          analytics: { enabled: true, basicReports: true, advancedReports: true, exportData: true, realTimeAnalytics: true },
          security: { twoFactorAuth: true, singleSignOn: true, auditLogs: true, dataRetentionControls: true, complianceReporting: false },
          support: { emailSupport: true, chatSupport: true, phoneSupport: true, prioritySupport: true, dedicatedAccountManager: false },
          ai: { enabled: true, smartSuggestions: true, sentimentAnalysis: true, autoSummarization: true, languageTranslation: false, customAIModels: false }
        }
      },
      {
        name: 'business',
        displayName: 'Business',
        description: 'Comprehensive solution for large teams',
        price: 2500, // $25/month
        billingPeriod: 'monthly',
        maxUsers: 500,
        maxStorage: 102400, // 100GB
        maxWorkspaces: 50,
        maxChannelsPerWorkspace: 500,
        maxFileSize: 500,
        maxAPICallsPerMonth: 100000,
        messageHistoryDays: 365,
        maxVideoCallDuration: 240,
        sortOrder: 4,
        features: {
          messaging: true,
          directMessages: true,
          fileSharing: true,
          voiceCalls: true,
          videoCalls: true,
          screenSharing: true,
          channels: { enabled: true, maxChannels: 500, privateChannels: true },
          workspaces: { enabled: true, maxWorkspaces: 50, customBranding: true },
          tasks: { enabled: true, kanbanView: true, calendar: true, timeTracking: true, customFields: true },
          integrations: { enabled: true, maxIntegrations: 100, customIntegrations: true },
          analytics: { enabled: true, basicReports: true, advancedReports: true, exportData: true, realTimeAnalytics: true },
          security: { twoFactorAuth: true, singleSignOn: true, auditLogs: true, dataRetentionControls: true, complianceReporting: true },
          support: { emailSupport: true, chatSupport: true, phoneSupport: true, prioritySupport: true, dedicatedAccountManager: true },
          ai: { enabled: true, smartSuggestions: true, sentimentAnalysis: true, autoSummarization: true, languageTranslation: true, customAIModels: false }
        }
      },
      {
        name: 'enterprise',
        displayName: 'Enterprise',
        description: 'Ultimate solution with unlimited features',
        price: 5000, // $50/month
        billingPeriod: 'monthly',
        maxUsers: -1, // Unlimited
        maxStorage: -1, // Unlimited
        maxWorkspaces: -1, // Unlimited
        maxChannelsPerWorkspace: -1, // Unlimited
        maxFileSize: 1000,
        maxAPICallsPerMonth: -1, // Unlimited
        messageHistoryDays: -1, // Unlimited
        maxVideoCallDuration: -1, // Unlimited
        sortOrder: 5,
        features: {
          messaging: true,
          directMessages: true,
          fileSharing: true,
          voiceCalls: true,
          videoCalls: true,
          screenSharing: true,
          channels: { enabled: true, maxChannels: -1, privateChannels: true },
          workspaces: { enabled: true, maxWorkspaces: -1, customBranding: true },
          tasks: { enabled: true, kanbanView: true, calendar: true, timeTracking: true, customFields: true },
          integrations: { enabled: true, maxIntegrations: -1, customIntegrations: true },
          analytics: { enabled: true, basicReports: true, advancedReports: true, exportData: true, realTimeAnalytics: true },
          security: { twoFactorAuth: true, singleSignOn: true, auditLogs: true, dataRetentionControls: true, complianceReporting: true },
          support: { emailSupport: true, chatSupport: true, phoneSupport: true, prioritySupport: true, dedicatedAccountManager: true },
          ai: { enabled: true, smartSuggestions: true, sentimentAnalysis: true, autoSummarization: true, languageTranslation: true, customAIModels: true }
        }
      }
    ];

    for (const planData of defaultPlans) {
      await db.insert(pricingPlans).values({
        ...planData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    console.log('✅ [PLANS] Default pricing plans initialized successfully');
  }

  async getIntegrationStats(): Promise<any> {
    const result = await db.select().from(integrations);
    return {
      total: result.length,
      active: result.filter(i => i.isEnabled).length,
      services: [...new Set(result.map(i => i.service))].length,
    };
  }

  // Mood Board operations
  async getWorkspaceMoodBoards(workspaceId: string): Promise<WorkspaceMoodBoard[]> {
    return await db.select({
      id: workspaceMoodBoards.id,
      workspaceId: workspaceMoodBoards.workspaceId,
      name: workspaceMoodBoards.name,
      description: workspaceMoodBoards.description,
      primaryColor: workspaceMoodBoards.primaryColor,
      secondaryColor: workspaceMoodBoards.secondaryColor,
      accentColor: workspaceMoodBoards.accentColor,
      backgroundColor: workspaceMoodBoards.backgroundColor,
      textColor: workspaceMoodBoards.textColor,
      moodCategory: workspaceMoodBoards.moodCategory,
      psychologyInsights: workspaceMoodBoards.psychologyInsights,
      colorPalette: workspaceMoodBoards.colorPalette,
      isActive: workspaceMoodBoards.isActive,
      createdBy: workspaceMoodBoards.createdBy,
      teamRating: workspaceMoodBoards.teamRating,
      createdAt: workspaceMoodBoards.createdAt,
      updatedAt: workspaceMoodBoards.updatedAt
    })
      .from(workspaceMoodBoards)
      .where(eq(workspaceMoodBoards.workspaceId, workspaceId))
      .orderBy(desc(workspaceMoodBoards.isActive), desc(workspaceMoodBoards.teamRating));
  }

  async getWorkspaceMoodBoard(id: number): Promise<WorkspaceMoodBoard | undefined> {
    const [moodBoard] = await db.select()
      .from(workspaceMoodBoards)
      .where(eq(workspaceMoodBoards.id, id));
    return moodBoard;
  }

  async createWorkspaceMoodBoard(moodBoardData: InsertWorkspaceMoodBoard & { createdBy: number }): Promise<WorkspaceMoodBoard> {
    const [moodBoard] = await db.insert(workspaceMoodBoards)
      .values(moodBoardData)
      .returning();
    return moodBoard;
  }

  async updateWorkspaceMoodBoard(id: number, updates: Partial<WorkspaceMoodBoard>): Promise<WorkspaceMoodBoard | undefined> {
    const [moodBoard] = await db.update(workspaceMoodBoards)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(workspaceMoodBoards.id, id))
      .returning();
    return moodBoard;
  }

  async deleteWorkspaceMoodBoard(id: number): Promise<boolean> {
    const result = await db.delete(workspaceMoodBoards)
      .where(eq(workspaceMoodBoards.id, id));
    return result.rowCount > 0;
  }

  async activateWorkspaceMoodBoard(workspaceId: string, moodBoardId: number): Promise<WorkspaceMoodBoard | undefined> {
    // Deactivate all existing mood boards for this workspace
    await db.update(workspaceMoodBoards)
      .set({ isActive: false })
      .where(eq(workspaceMoodBoards.workspaceId, workspaceId));
      
    // Activate the selected mood board
    const [moodBoard] = await db.update(workspaceMoodBoards)
      .set({ isActive: true, updatedAt: new Date() })
      .where(eq(workspaceMoodBoards.id, moodBoardId))
      .returning();
    return moodBoard;
  }

  async voteMoodBoard(voteData: InsertMoodBoardVote): Promise<MoodBoardVote> {
    // Delete existing vote if present
    await db.delete(moodBoardVotes)
      .where(and(
        eq(moodBoardVotes.moodBoardId, voteData.moodBoardId),
        eq(moodBoardVotes.userId, voteData.userId)
      ));
      
    // Insert new vote
    const [vote] = await db.insert(moodBoardVotes)
      .values(voteData)
      .returning();
      
    // Update mood board average rating
    await this.updateMoodBoardRating(voteData.moodBoardId);
    
    return vote;
  }

  async getMoodBoardVotes(moodBoardId: number): Promise<MoodBoardVote[]> {
    return await db.select()
      .from(moodBoardVotes)
      .where(eq(moodBoardVotes.moodBoardId, moodBoardId))
      .orderBy(desc(moodBoardVotes.createdAt));
  }

  private async updateMoodBoardRating(moodBoardId: number): Promise<void> {
    const votes = await this.getMoodBoardVotes(moodBoardId);
    const averageRating = votes.length > 0 
      ? Math.round(votes.reduce((sum, vote) => sum + vote.rating, 0) / votes.length)
      : 0;
      
    await db.update(workspaceMoodBoards)
      .set({ teamRating: averageRating })
      .where(eq(workspaceMoodBoards.id, moodBoardId));
  }

  async initializeDefaultMoodBoards(): Promise<void> {
    // Check if mood boards already exist
    const existing = await db.select().from(workspaceMoodBoards).limit(1);
    if (existing.length > 0) {
      console.log('📋 [MOOD] Default mood boards already exist');
      return;
    }

    // Create default mood boards for demo workspace
    const defaultMoodBoards: (InsertWorkspaceMoodBoard & { createdBy: number })[] = [
      {
        workspaceId: '1',
        name: 'Energizing Orange',
        description: 'Boost energy and enthusiasm for high-intensity work sessions',
        primaryColor: '#FF6B35',
        secondaryColor: '#F7931E',
        accentColor: '#FFB800',
        backgroundColor: '#FFF8F0',
        textColor: '#2D1B04',
        moodCategory: 'energizing',
        psychologyInsights: {
          mood: 'energizing',
          effects: ['Increases motivation', 'Stimulates creativity', 'Promotes enthusiasm', 'Enhances confidence'],
          bestFor: ['Brainstorming sessions', 'Product launches', 'Team building', 'Marketing campaigns'],
          productivity: { focus: 4, energy: 5, creativity: 5, collaboration: 4 },
          tips: ['Use during morning meetings', 'Great for kickoff sessions', 'Pair with upbeat music', 'Limit to 2-hour sessions to avoid overstimulation']
        },
        colorPalette: {
          name: 'Sunset Energy',
          colors: [
            { name: 'Primary Orange', hex: '#FF6B35', role: 'primary' },
            { name: 'Golden Yellow', hex: '#F7931E', role: 'secondary' },
            { name: 'Bright Amber', hex: '#FFB800', role: 'accent' },
            { name: 'Cream White', hex: '#FFF8F0', role: 'background' },
            { name: 'Deep Brown', hex: '#2D1B04', role: 'text' }
          ],
          description: 'Warm energizing palette inspired by sunset colors'
        },
        isActive: false,
        createdBy: 1
      },
      {
        workspaceId: '1',
        name: 'Calming Blue',
        description: 'Reduce stress and promote focus for concentrated work',
        primaryColor: '#4A90E2',
        secondaryColor: '#7BB3F0',
        accentColor: '#5DADE2',
        backgroundColor: '#F8FBFF',
        textColor: '#1A365D',
        moodCategory: 'calming',
        psychologyInsights: {
          mood: 'calming',
          effects: ['Reduces stress', 'Improves focus', 'Lowers blood pressure', 'Promotes trust'],
          bestFor: ['Deep work sessions', 'Client presentations', 'Problem solving', 'Strategic planning'],
          productivity: { focus: 5, energy: 3, creativity: 3, collaboration: 4 },
          tips: ['Perfect for afternoon work', 'Use during high-pressure periods', 'Combine with natural lighting', 'Great for client-facing work']
        },
        colorPalette: {
          name: 'Ocean Calm',
          colors: [
            { name: 'Ocean Blue', hex: '#4A90E2', role: 'primary' },
            { name: 'Sky Blue', hex: '#7BB3F0', role: 'secondary' },
            { name: 'Azure', hex: '#5DADE2', role: 'accent' },
            { name: 'Cloud White', hex: '#F8FBFF', role: 'background' },
            { name: 'Navy Blue', hex: '#1A365D', role: 'text' }
          ],
          description: 'Serene palette inspired by ocean and sky'
        },
        isActive: true,
        createdBy: 1
      },
      {
        workspaceId: '1',
        name: 'Creative Purple',
        description: 'Stimulate imagination and innovative thinking',
        primaryColor: '#8B5CF6',
        secondaryColor: '#A78BFA',
        accentColor: '#C084FC',
        backgroundColor: '#FAF7FF',
        textColor: '#3C1A78',
        moodCategory: 'creative',
        psychologyInsights: {
          mood: 'creative',
          effects: ['Stimulates imagination', 'Encourages innovation', 'Promotes artistic thinking', 'Inspires originality'],
          bestFor: ['Design work', 'Creative writing', 'Art projects', 'Innovation workshops'],
          productivity: { focus: 3, energy: 4, creativity: 5, collaboration: 3 },
          tips: ['Use during creative blocks', 'Perfect for design sessions', 'Combine with inspirational quotes', 'Great for solo creative work']
        },
        colorPalette: {
          name: 'Mystic Purple',
          colors: [
            { name: 'Royal Purple', hex: '#8B5CF6', role: 'primary' },
            { name: 'Lavender', hex: '#A78BFA', role: 'secondary' },
            { name: 'Amethyst', hex: '#C084FC', role: 'accent' },
            { name: 'Lilac White', hex: '#FAF7FF', role: 'background' },
            { name: 'Deep Violet', hex: '#3C1A78', role: 'text' }
          ],
          description: 'Mystical palette to unlock creative potential'
        },
        isActive: false,
        createdBy: 1
      },
      {
        workspaceId: '1',
        name: 'Nature Green',
        description: 'Connect with nature for balanced and sustainable productivity',
        primaryColor: '#10B981',
        secondaryColor: '#34D399',
        accentColor: '#6EE7B7',
        backgroundColor: '#F0FDF4',
        textColor: '#064E3B',
        moodCategory: 'focused',
        psychologyInsights: {
          mood: 'focused',
          effects: ['Reduces eye strain', 'Promotes growth mindset', 'Increases harmony', 'Balances emotions'],
          bestFor: ['All-day work', 'Team collaboration', 'Learning sessions', 'Sustainable productivity'],
          productivity: { focus: 4, energy: 4, creativity: 4, collaboration: 5 },
          tips: ['Ideal for extended work sessions', 'Great for team spaces', 'Pair with plants', 'Perfect for learning environments']
        },
        colorPalette: {
          name: 'Forest Fresh',
          colors: [
            { name: 'Emerald Green', hex: '#10B981', role: 'primary' },
            { name: 'Mint Green', hex: '#34D399', role: 'secondary' },
            { name: 'Sage Green', hex: '#6EE7B7', role: 'accent' },
            { name: 'Ivory', hex: '#F0FDF4', role: 'background' },
            { name: 'Forest Green', hex: '#064E3B', role: 'text' }
          ],
          description: 'Natural palette for balanced productivity'
        },
        isActive: false,
        createdBy: 1
      }
    ];

    for (const moodBoard of defaultMoodBoards) {
      await this.createWorkspaceMoodBoard(moodBoard);
    }

    console.log('✅ [MOOD] Default mood boards created successfully');
  }

  async getAllIntegrationsForAdmin(): Promise<any[]> {
    return await db.select().from(integrations);
  }
}

// Memory storage for immediate messaging functionality
class MemoryStorage implements IStorage {
  sessionStore: any = null;
  private mockMessages: (Message & { author: User })[] = [];

  // Stub implementations for required interface methods
  async getUser(id: number): Promise<User | undefined> {
    const mockUsers = [
      { id: 1, email: "superadmin@test.com", firstName: "Super", lastName: "Admin", role: "super_admin" as const, createdAt: new Date(), lastLoginAt: null, password: "e25d883467ba11901ebf37792170a5087dbb721547f4a52c825f91731a84f30f7b42970105905ed9d4e7001425b00a48aabdc3a55f7cb4e03fcb21f8d7785dd8.0676a4c0e76c62b064d9164aef1ec932", isActive: true, profileImageUrl: null, updatedAt: new Date() },
      { id: 2, email: "marty@onlinechannel.tv", firstName: "Marty", lastName: "Admin", role: "super_admin" as const, createdAt: new Date(), lastLoginAt: null, password: "b6c30e7ce2639badc50ea15ca47238f1a1c8da663ba9bab91f045a291a0d125e25b958a31dc272690c2593c2a46790040e0f35d620a1b887519a14a83a0edebd.96f9b0526549d154c5ae02218e050689", isActive: true, profileImageUrl: null, updatedAt: new Date() }
    ];
    return mockUsers.find(u => u.id === id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const mockUsers = [
      { id: 1, email: "superadmin@test.com", firstName: "Super", lastName: "Admin", role: "super_admin" as const, createdAt: new Date(), lastLoginAt: null, password: "e25d883467ba11901ebf37792170a5087dbb721547f4a52c825f91731a84f30f7b42970105905ed9d4e7001425b00a48aabdc3a55f7cb4e03fcb21f8d7785dd8.0676a4c0e76c62b064d9164aef1ec932", isActive: true, profileImageUrl: null, updatedAt: new Date() },
      { id: 2, email: "marty@onlinechannel.tv", firstName: "Marty", lastName: "Admin", role: "super_admin" as const, createdAt: new Date(), lastLoginAt: null, password: "b6c30e7ce2639badc50ea15ca47238f1a1c8da663ba9bab91f045a291a0d125e25b958a31dc272690c2593c2a46790040e0f35d620a1b887519a14a83a0edebd.96f9b0526549d154c5ae02218e050689", isActive: true, profileImageUrl: null, updatedAt: new Date() }
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

  // Stub implementations for missing interface methods
  async updateUserPassword(id: number, newPassword: string): Promise<User | undefined> {
    throw new Error("Method not implemented for memory storage");
  }

  async updateUserRole(id: number, role: string): Promise<User | undefined> {
    throw new Error("Method not implemented for memory storage");
  }

  async getOrganizationSettings(orgId: number): Promise<OrganizationSettings | undefined> {
    return undefined;
  }

  async updateOrganizationSettings(orgId: number, settings: Partial<OrganizationSettings>): Promise<OrganizationSettings> {
    throw new Error("Method not implemented for memory storage");
  }

  async createOrganizationSettings(orgId: number, settings: InsertOrganizationSettings): Promise<OrganizationSettings> {
    throw new Error("Method not implemented for memory storage");
  }

  async getOrganizationUsers(orgId: number): Promise<OrganizationUser[]> {
    return [];
  }

  async getOrganizationUserByEmail(email: string): Promise<OrganizationUser | undefined> {
    return undefined;
  }

  async getOrganizationUserById(id: number): Promise<OrganizationUser | undefined> {
    return undefined;
  }

  async createOrganizationUser(userData: InsertOrganizationUser): Promise<OrganizationUser> {
    throw new Error("Method not implemented for memory storage");
  }

  async updateOrganizationUser(id: number, updates: Partial<OrganizationUser>): Promise<OrganizationUser | undefined> {
    throw new Error("Method not implemented for memory storage");
  }

  async deleteOrganizationUser(id: number): Promise<boolean> {
    return false;
  }

  async updateOrganizationUserPassword(id: number, hashedPassword: string): Promise<OrganizationUser | undefined> {
    throw new Error("Method not implemented for memory storage");
  }

  // Pricing Plan operations (Memory Storage)
  async getPricingPlans(): Promise<PricingPlan[]> {
    throw new Error("Method not implemented for memory storage");
  }

  async getPricingPlan(id: number): Promise<PricingPlan | undefined> {
    throw new Error("Method not implemented for memory storage");
  }

  async getPricingPlanByName(name: string): Promise<PricingPlan | undefined> {
    throw new Error("Method not implemented for memory storage");
  }

  async createPricingPlan(planData: InsertPricingPlan): Promise<PricingPlan> {
    throw new Error("Method not implemented for memory storage");
  }

  async updatePricingPlan(id: number, updates: UpdatePricingPlan): Promise<PricingPlan | undefined> {
    throw new Error("Method not implemented for memory storage");
  }

  async deletePricingPlan(id: number): Promise<boolean> {
    throw new Error("Method not implemented for memory storage");
  }

  async initializeDefaultPricingPlans(): Promise<void> {
    // No-op for memory storage
  }

  async getIntegrationStats(): Promise<any> {
    return { total: 0, active: 0, services: 0 };
  }

  async getAllIntegrationsForAdmin(): Promise<any[]> {
    return [];
  }
}

// Use database storage for persistence - organizations need to survive server restarts
export const storage = new DatabaseStorage();