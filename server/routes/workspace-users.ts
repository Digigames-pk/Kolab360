import { Router } from 'express';
import { storage } from '../storage';

const router = Router();

// Production ready - workspace users loaded from database

// GET /api/workspace/users - Get all workspace users for mentions
router.get('/users', async (req, res) => {
  try {
    // Fetch workspace members from database
    const members = await storage.getWorkspaceMembers(req.params.workspaceId);
    const users = members.map(m => m.user);
    res.json(users);
  } catch (error) {
    console.error('Error fetching workspace users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Also handle the root path for backward compatibility
router.get('/', async (req, res) => {
  try {
    // Return current user as a basic user list 
    const currentUser = (req as any).user;
    res.json(currentUser ? [currentUser] : []);
  } catch (error) {
    console.error('Error fetching workspace users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;