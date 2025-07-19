import { pgTable, text, integer, timestamp, boolean, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Pinned items table
export const pinnedItems = pgTable("pinned_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: integer("user_id").notNull(),
  workspaceId: text("workspace_id").notNull(),
  itemType: text("item_type").notNull(), // 'message', 'task', 'calendar_event', 'channel', 'file', 'category'
  itemId: text("item_id").notNull(),
  itemData: text("item_data"), // JSON string with item details for quick access
  position: integer("position").default(0), // For ordering pinned items
  isPinned: boolean("is_pinned").default(true),
  pinnedAt: timestamp("pinned_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Pin categories for organizing pinned items
export const pinCategories = pgTable("pin_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: integer("user_id").notNull(),
  workspaceId: text("workspace_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").default("#3B82F6"),
  position: integer("position").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Pin collections for grouping related pinned items
export const pinCollections = pgTable("pin_collections", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: integer("user_id").notNull(),
  workspaceId: text("workspace_id").notNull(),
  categoryId: uuid("category_id"),
  name: text("name").notNull(),
  description: text("description"),
  isShared: boolean("is_shared").default(false),
  sharedWith: text("shared_with"), // JSON array of user IDs
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Collection items (many-to-many relationship between collections and pinned items)
export const collectionItems = pgTable("collection_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  collectionId: uuid("collection_id").notNull(),
  pinnedItemId: uuid("pinned_item_id").notNull(),
  position: integer("position").default(0),
  addedAt: timestamp("added_at").defaultNow(),
});

// Insert schemas
export const insertPinnedItemSchema = createInsertSchema(pinnedItems);
export const insertPinCategorySchema = createInsertSchema(pinCategories);
export const insertPinCollectionSchema = createInsertSchema(pinCollections);
export const insertCollectionItemSchema = createInsertSchema(collectionItems);

// Types
export type PinnedItem = typeof pinnedItems.$inferSelect;
export type InsertPinnedItem = z.infer<typeof insertPinnedItemSchema>;
export type PinCategory = typeof pinCategories.$inferSelect;
export type InsertPinCategory = z.infer<typeof insertPinCategorySchema>;
export type PinCollection = typeof pinCollections.$inferSelect;
export type InsertPinCollection = z.infer<typeof insertPinCollectionSchema>;
export type CollectionItem = typeof collectionItems.$inferSelect;
export type InsertCollectionItem = z.infer<typeof insertCollectionItemSchema>;

// Pinnable item types
export const PINNABLE_TYPES = {
  MESSAGE: 'message',
  TASK: 'task',
  CALENDAR_EVENT: 'calendar_event',
  CHANNEL: 'channel',
  PRIVATE_CHANNEL: 'private_channel',
  FILE: 'file',
  TASK_CATEGORY: 'task_category',
  DOCUMENT: 'document',
  INTEGRATION: 'integration',
  SEARCH_QUERY: 'search_query',
  USER: 'user'
} as const;

export type PinnableType = typeof PINNABLE_TYPES[keyof typeof PINNABLE_TYPES];