import { Request, Response } from 'express';
import { storage } from '../storage';

// Get unread counts for all channels user is member of
export async function getChannelUnreadCounts(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get all channels user is member of
    const userWorkspaces = await storage.getUserWorkspaces(userId);
    const channelUnreadCounts: Record<string, number> = {};

    for (const workspace of userWorkspaces) {
      const channels = await storage.getWorkspaceChannels(workspace.id);
      
      for (const channel of channels) {
        // Get channel messages and count unread ones
        const messages = await storage.getChannelMessages(channel.id, 50);
        // For now, return 0 - in real app you'd track read receipts
        channelUnreadCounts[channel.name] = 0;
      }
    }

    res.json(channelUnreadCounts);
  } catch (error) {
    console.error('Error fetching channel unread counts:', error);
    res.status(500).json({ error: 'Failed to fetch unread counts' });
  }
}

// Get unread counts for direct messages
export async function getDMUnreadCounts(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // For now return empty object - would implement DM unread tracking
    const dmUnreadCounts: Record<string, number> = {};
    
    res.json(dmUnreadCounts);
  } catch (error) {
    console.error('Error fetching DM unread counts:', error);
    res.status(500).json({ error: 'Failed to fetch DM unread counts' });
  }
}