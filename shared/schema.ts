import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  integer,
  boolean,
  uuid,
  serial,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User table with role-based authentication
export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  role: varchar("role", { length: 50 }).default("user").notNull(), // super_admin, admin, user
  isActive: boolean("is_active").default(true).notNull(),
  profileImageUrl: varchar("profile_image_url"),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const workspaces = pgTable("workspaces", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  ownerId: integer("owner_id").references(() => users.id).notNull(),
  inviteCode: varchar("invite_code", { length: 8 }).unique().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const workspaceMembers = pgTable("workspace_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("member"), // owner, admin, member
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const channels = pgTable("channels", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  isPrivate: boolean("is_private").default(false),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const channelMembers = pgTable("channel_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  channelId: uuid("channel_id").references(() => channels.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  content: text("content").notNull(),
  authorId: integer("author_id").references(() => users.id).notNull(),
  channelId: uuid("channel_id").references(() => channels.id),
  recipientId: integer("recipient_id").references(() => users.id),
  threadId: uuid("thread_id"),
  messageType: varchar("message_type", { length: 50 }).default("text"), // text, file, image, ai_response
  metadata: jsonb("metadata"), // for file info, AI data, etc.
  editedAt: timestamp("edited_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reactions = pgTable("reactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  messageId: uuid("message_id").references(() => messages.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  emoji: varchar("emoji", { length: 10 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).default("todo"), // todo, in_progress, done
  priority: varchar("priority", { length: 50 }).default("medium"), // low, medium, high
  assignedTo: integer("assigned_to").references(() => users.id),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id).notNull(),
  channelId: uuid("channel_id").references(() => channels.id),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const files = pgTable("files", {
  id: uuid("id").primaryKey().defaultRandom(),
  filename: varchar("filename", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  wasabiKey: varchar("wasabi_key", { length: 500 }).notNull().unique(),
  wasabiUrl: varchar("wasabi_url", { length: 500 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(), // document, image, video, audio, other
  size: integer("size").notNull(),
  uploadedBy: integer("uploaded_by").references(() => users.id).notNull(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id),
  channelId: uuid("channel_id").references(() => channels.id),
  messageId: uuid("message_id").references(() => messages.id),
  isActive: boolean("is_active").default(true).notNull(),
  downloadCount: integer("download_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Integration management for external services
export const integrations = pgTable("integrations", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  service: varchar("service", { length: 100 }).notNull(), // google_calendar, zoom, slack, etc.
  serviceName: varchar("service_name", { length: 255 }).notNull(),
  isEnabled: boolean("is_enabled").default(true).notNull(),
  config: jsonb("config"), // Service-specific configuration
  accessToken: text("access_token"), // Encrypted access token
  refreshToken: text("refresh_token"), // Encrypted refresh token
  expiresAt: timestamp("expires_at"),
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Notification preferences table
export const notificationPreferences = pgTable("notification_preferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  email: boolean("email").default(true),
  mentions: boolean("mentions").default(true),
  tasks: boolean("tasks").default(true),
  calendar: boolean("calendar").default(true),
  directMessages: boolean("direct_messages").default(true),
  workspaceUpdates: boolean("workspace_updates").default(true),
  dailyDigest: boolean("daily_digest").default(false),
  weeklyReport: boolean("weekly_report").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// In-app notifications table
export const inAppNotifications = pgTable("in_app_notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  data: jsonb("data"),
  read: boolean("read").default(false),
  priority: varchar("priority", { length: 20 }).default("medium"),
  actionUrl: text("action_url"),
  createdAt: timestamp("created_at").defaultNow(),
  readAt: timestamp("read_at"),
});

// Email notification log table
export const emailNotifications = pgTable("email_notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: integer("user_id").references(() => users.id).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  subject: varchar("subject", { length: 500 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("sent"),
  messageId: varchar("message_id", { length: 255 }),
  error: text("error"),
  sentAt: timestamp("sent_at").defaultNow(),
  deliveredAt: timestamp("delivered_at"),
});

// Organizations table for Super Admin Dashboard
export const organizations = pgTable("organizations", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  domain: varchar("domain", { length: 255 }).notNull().unique(),
  plan: varchar("plan", { length: 50 }).notNull().default("free"), // free, pro, business, enterprise
  status: varchar("status", { length: 20 }).notNull().default("active"), // active, suspended, inactive
  members: integer("members").notNull().default(0),
  memberLimit: integer("member_limit").notNull().default(10),
  storageUsed: integer("storage_used").notNull().default(0), // in GB
  storageLimit: integer("storage_limit").notNull().default(10), // in GB
  adminName: varchar("admin_name", { length: 255 }),
  adminEmail: varchar("admin_email", { length: 255 }).notNull(),
  adminFirstName: varchar("admin_first_name", { length: 100 }),
  adminLastName: varchar("admin_last_name", { length: 100 }),
  features: jsonb("features"), // JSON array of enabled features
  billingEmail: varchar("billing_email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Organization Settings table for persistent configuration
export const organizationSettings = pgTable("organization_settings", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  organizationId: integer("organization_id").references(() => organizations.id).notNull(),
  fileSharing: boolean("file_sharing").default(true).notNull(),
  externalIntegrations: boolean("external_integrations").default(true).notNull(),
  guestAccess: boolean("guest_access").default(false).notNull(),
  messageHistory: boolean("message_history").default(true).notNull(),
  twoFactorAuth: boolean("two_factor_auth").default(false).notNull(),
  passwordPolicy: boolean("password_policy").default(false).notNull(),
  sessionTimeout: boolean("session_timeout").default(false).notNull(),
  ipRestrictions: boolean("ip_restrictions").default(false).notNull(),
  screenSharing: boolean("screen_sharing").default(true).notNull(),
  recordingSessions: boolean("recording_sessions").default(false).notNull(),
  adminOverride: boolean("admin_override").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Pricing Plans table for dynamic plan management
export const pricingPlans = pgTable("pricing_plans", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  name: varchar("name", { length: 100 }).notNull().unique(), // free, starter, pro, business, enterprise
  displayName: varchar("display_name", { length: 100 }).notNull(), // Free Plan, Starter, Pro, Business, Enterprise
  description: text("description"),
  price: integer("price").notNull().default(0), // Price in cents per user per month
  billingPeriod: varchar("billing_period", { length: 20 }).default("monthly"), // monthly, yearly
  
  // User and Storage Limits
  maxUsers: integer("max_users").default(-1), // -1 = unlimited
  maxStorage: integer("max_storage").default(1024), // in MB
  maxWorkspaces: integer("max_workspaces").default(1),
  maxChannelsPerWorkspace: integer("max_channels_per_workspace").default(10),
  maxFileSize: integer("max_file_size").default(10), // in MB
  maxAPICallsPerMonth: integer("max_api_calls_per_month").default(1000),
  messageHistoryDays: integer("message_history_days").default(30), // -1 = unlimited
  maxVideoCallDuration: integer("max_video_call_duration").default(60), // in minutes
  
  // Core Features
  features: jsonb("features").notNull().default('{}'), // Dynamic feature permissions object
  
  // Plan Settings
  isActive: boolean("is_active").default(true).notNull(),
  isCustom: boolean("is_custom").default(false).notNull(),
  sortOrder: integer("sort_order").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Roles table for organization members
export const organizationUsers = pgTable("organization_users", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  organizationId: integer("organization_id").references(() => organizations.id).notNull(),
  userId: integer("user_id").references(() => users.id),
  email: varchar("email", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  role: varchar("role", { length: 50 }).default("member").notNull(), // admin, member, guest
  status: varchar("status", { length: 20 }).default("active").notNull(), // active, inactive, suspended
  password: varchar("password", { length: 255 }), // Hashed password
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Workspace Mood Board System
export const workspaceMoodBoards = pgTable("workspace_mood_boards", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  primaryColor: varchar("primary_color", { length: 7 }).notNull(), // Hex color
  secondaryColor: varchar("secondary_color", { length: 7 }).notNull(),
  accentColor: varchar("accent_color", { length: 7 }).notNull(),
  backgroundColor: varchar("background_color", { length: 7 }).notNull(),
  textColor: varchar("text_color", { length: 7 }).notNull(),
  moodCategory: varchar("mood_category", { length: 50 }).notNull(), // energizing, calming, focused, creative, collaborative
  psychologyInsights: jsonb("psychology_insights").notNull(),
  colorPalette: jsonb("color_palette").notNull(), // Array of color objects with names and hex values
  isActive: boolean("is_active").default(false).notNull(),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  teamRating: integer("team_rating").default(0), // Average team rating 1-5
  usageStats: jsonb("usage_stats").default({}), // Track adoption metrics
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const moodBoardVotes = pgTable("mood_board_votes", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id).notNull(),
  moodBoardId: integer("mood_board_id").references(() => workspaceMoodBoards.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  rating: integer("rating").notNull(), // 1-5 star rating
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  workspaces: many(workspaces),
  workspaceMembers: many(workspaceMembers),
  messages: many(messages),
  tasks: many(tasks),
  files: many(files),
  reactions: many(reactions),
}));

export const organizationsRelations = relations(organizations, ({ many, one }) => ({
  settings: one(organizationSettings, { 
    fields: [organizations.id], 
    references: [organizationSettings.organizationId] 
  }),
  users: many(organizationUsers),
  pricingPlan: one(pricingPlans, {
    fields: [organizations.plan],
    references: [pricingPlans.name]
  }),
}));

export const pricingPlansRelations = relations(pricingPlans, ({ many }) => ({
  organizations: many(organizations),
}));

export const organizationSettingsRelations = relations(organizationSettings, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationSettings.organizationId],
    references: [organizations.id]
  }),
}));

export const organizationUsersRelations = relations(organizationUsers, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationUsers.organizationId],
    references: [organizations.id]
  }),
  user: one(users, {
    fields: [organizationUsers.userId],
    references: [users.id]
  }),
}));

export const workspaceMoodBoardsRelations = relations(workspaceMoodBoards, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [workspaceMoodBoards.workspaceId],
    references: [workspaces.id]
  }),
  creator: one(users, {
    fields: [workspaceMoodBoards.createdBy],
    references: [users.id]
  }),
  votes: many(moodBoardVotes),
}));

export const moodBoardVotesRelations = relations(moodBoardVotes, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [moodBoardVotes.workspaceId],
    references: [workspaces.id]
  }),
  moodBoard: one(workspaceMoodBoards, {
    fields: [moodBoardVotes.moodBoardId],
    references: [workspaceMoodBoards.id]
  }),
  user: one(users, {
    fields: [moodBoardVotes.userId],
    references: [users.id]
  }),
}));

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  owner: one(users, { fields: [workspaces.ownerId], references: [users.id] }),
  members: many(workspaceMembers),
  channels: many(channels),
  tasks: many(tasks),
  moodBoards: many(workspaceMoodBoards),
}));

export const messagesRelations = relations(messages, ({ one, many }) => ({
  author: one(users, { fields: [messages.authorId], references: [users.id] }),
  channel: one(channels, { fields: [messages.channelId], references: [channels.id] }),
  reactions: many(reactions),
}));

// Schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
});

export const registerSchema = insertUserSchema.pick({
  email: true,
  password: true,
  firstName: true,
  lastName: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const insertWorkspaceSchema = createInsertSchema(workspaces).omit({
  id: true,
  ownerId: true,
  createdAt: true,
  updatedAt: true,
  inviteCode: true,
});

export const insertChannelSchema = createInsertSchema(channels).omit({
  id: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  authorId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
});

export const insertIntegrationSchema = createInsertSchema(integrations).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  adminName: true, // Remove adminName requirement since we have adminFirstName/adminLastName
});

export const insertFileSchema = createInsertSchema(files).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type LoginData = z.infer<typeof loginSchema>;

export type Workspace = typeof workspaces.$inferSelect;
export type InsertWorkspace = z.infer<typeof insertWorkspaceSchema>;

export type Channel = typeof channels.$inferSelect;
export type InsertChannel = z.infer<typeof insertChannelSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type File = typeof files.$inferSelect;
export type InsertFile = typeof files.$inferInsert;

export type WorkspaceMember = typeof workspaceMembers.$inferSelect;
export type ChannelMember = typeof channelMembers.$inferSelect;
export type Reaction = typeof reactions.$inferSelect;

export type Integration = typeof integrations.$inferSelect;
export type InsertIntegration = z.infer<typeof insertIntegrationSchema>;

export type NotificationPreferences = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreferences = typeof notificationPreferences.$inferInsert;

export type InAppNotification = typeof inAppNotifications.$inferSelect;
export type InsertInAppNotification = typeof inAppNotifications.$inferInsert;

export type EmailNotification = typeof emailNotifications.$inferSelect;
export type InsertEmailNotification = typeof emailNotifications.$inferInsert;

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;

export type OrganizationSettings = typeof organizationSettings.$inferSelect;
export type InsertOrganizationSettings = typeof organizationSettings.$inferInsert;

export type OrganizationUser = typeof organizationUsers.$inferSelect;
export type InsertOrganizationUser = typeof organizationUsers.$inferInsert;

export type WorkspaceMoodBoard = typeof workspaceMoodBoards.$inferSelect;
export type InsertWorkspaceMoodBoard = typeof workspaceMoodBoards.$inferInsert;

export type MoodBoardVote = typeof moodBoardVotes.$inferSelect;
export type InsertMoodBoardVote = typeof moodBoardVotes.$inferInsert;

// Validation schemas
export const insertOrganizationSettingsSchema = createInsertSchema(organizationSettings).omit({
  id: true,
  organizationId: true, // This will be provided from URL parameter
  createdAt: true,
  updatedAt: true,
});

export const insertOrganizationUserSchema = createInsertSchema(organizationUsers).omit({
  id: true,
  organizationId: true, // This will be provided from URL parameter
  userId: true, // Optional field, can be null
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
});

export const updateUserRoleSchema = z.object({
  role: z.enum(["admin", "member", "guest"]),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
});

export const changePasswordSchema = z.object({
  newPassword: z.string().min(6),
});

// Mood Board Schemas
export const insertWorkspaceMoodBoardSchema = createInsertSchema(workspaceMoodBoards).omit({
  id: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
  teamRating: true,
  usageStats: true,
});

export const updateWorkspaceMoodBoardSchema = insertWorkspaceMoodBoardSchema.partial();

export const insertMoodBoardVoteSchema = createInsertSchema(moodBoardVotes).omit({
  id: true,
  createdAt: true,
});

export const moodBoardColorPaletteSchema = z.object({
  name: z.string(),
  colors: z.array(z.object({
    name: z.string(),
    hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    role: z.enum(["primary", "secondary", "accent", "background", "text", "neutral"]),
  })),
  description: z.string(),
});

export const psychologyInsightsSchema = z.object({
  mood: z.enum(["energizing", "calming", "focused", "creative", "collaborative"]),
  effects: z.array(z.string()),
  bestFor: z.array(z.string()),
  productivity: z.object({
    focus: z.number().min(1).max(5),
    energy: z.number().min(1).max(5),
    creativity: z.number().min(1).max(5),
    collaboration: z.number().min(1).max(5),
  }),
  tips: z.array(z.string()),
});

// Pricing Plan Schemas
export const insertPricingPlanSchema = createInsertSchema(pricingPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updatePricingPlanSchema = insertPricingPlanSchema.partial();

// Feature Permissions Schema for dynamic validation
export const featurePermissionsSchema = z.object({
  // Core Communication Features
  messaging: z.boolean().default(true),
  directMessages: z.boolean().default(true),
  fileSharing: z.boolean().default(true),
  voiceCalls: z.boolean().default(false),
  videoCalls: z.boolean().default(false),
  screenSharing: z.boolean().default(false),
  
  // Collaboration Features
  channels: z.object({
    enabled: z.boolean().default(true),
    maxChannels: z.number().default(5),
    privateChannels: z.boolean().default(false),
  }),
  workspaces: z.object({
    enabled: z.boolean().default(true),
    maxWorkspaces: z.number().default(1),
    customBranding: z.boolean().default(false),
  }),
  tasks: z.object({
    enabled: z.boolean().default(true),
    kanbanView: z.boolean().default(true),
    calendar: z.boolean().default(false),
    timeTracking: z.boolean().default(false),
    customFields: z.boolean().default(false),
  }),
  
  // Advanced Features
  integrations: z.object({
    enabled: z.boolean().default(false),
    maxIntegrations: z.number().default(0),
    customIntegrations: z.boolean().default(false),
  }),
  analytics: z.object({
    enabled: z.boolean().default(false),
    basicReports: z.boolean().default(false),
    advancedReports: z.boolean().default(false),
    exportData: z.boolean().default(false),
    realTimeAnalytics: z.boolean().default(false),
  }),
  security: z.object({
    twoFactorAuth: z.boolean().default(false),
    singleSignOn: z.boolean().default(false),
    auditLogs: z.boolean().default(false),
    dataRetentionControls: z.boolean().default(false),
    complianceReporting: z.boolean().default(false),
  }),
  support: z.object({
    emailSupport: z.boolean().default(true),
    chatSupport: z.boolean().default(false),
    phoneSupport: z.boolean().default(false),
    prioritySupport: z.boolean().default(false),
    dedicatedAccountManager: z.boolean().default(false),
  }),
  
  // AI Features
  ai: z.object({
    enabled: z.boolean().default(false),
    smartSuggestions: z.boolean().default(false),
    sentimentAnalysis: z.boolean().default(false),
    autoSummarization: z.boolean().default(false),
    languageTranslation: z.boolean().default(false),
    customAIModels: z.boolean().default(false),
  }),
});

// Types
export type PricingPlan = typeof pricingPlans.$inferSelect;
export type InsertPricingPlan = z.infer<typeof insertPricingPlanSchema>;
export type UpdatePricingPlan = z.infer<typeof updatePricingPlanSchema>;
export type FeaturePermissions = z.infer<typeof featurePermissionsSchema>;