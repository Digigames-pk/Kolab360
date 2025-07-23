import { z } from 'zod';

// Unread count schema
export const unreadCountSchema = z.object({
  channelId: z.string(),
  channelName: z.string(),
  unreadCount: z.number().int().min(0),
  lastMessageAt: z.string().datetime().optional(),
  lastMessagePreview: z.string().optional(),
});

export const directMessageUnreadSchema = z.object({
  userId: z.number().int(),
  userName: z.string(),
  unreadCount: z.number().int().min(0),
  lastMessageAt: z.string().datetime().optional(),
  lastMessagePreview: z.string().optional(),
});

// Pin schema
export const pinMessageSchema = z.object({
  messageId: z.string(),
  channelId: z.string().optional(),
  userId: z.number().int(),
  pinnedAt: z.string().datetime(),
  pinnedBy: z.number().int(),
});

export const pinChannelSchema = z.object({
  channelId: z.string(),
  channelName: z.string(),
  userId: z.number().int(),
  pinnedAt: z.string().datetime(),
  pinnedBy: z.number().int(),
});

export type UnreadCount = z.infer<typeof unreadCountSchema>;
export type DirectMessageUnread = z.infer<typeof directMessageUnreadSchema>;
export type PinMessage = z.infer<typeof pinMessageSchema>;
export type PinChannel = z.infer<typeof pinChannelSchema>;