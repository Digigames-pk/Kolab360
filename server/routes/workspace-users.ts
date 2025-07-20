import { Router } from 'express';

const router = Router();

// Mock workspace users for mention functionality
const mockWorkspaceUsers = [
  { id: 1, name: 'Sarah Wilson', username: 'sarah' },
  { id: 2, name: 'Alex Johnson', username: 'alex' },
  { id: 3, name: 'Mike Chen', username: 'mike' },
  { id: 4, name: 'Lisa Rodriguez', username: 'lisa' },
  { id: 5, name: 'Emma Davis', username: 'emma' },
  { id: 6, name: 'Tom Anderson', username: 'tom' },
  { id: 7, name: 'John Doe', username: 'john' }
];

// GET /api/workspace/users - Get all workspace users for mentions
router.get('/', async (req, res) => {
  try {
    // In a real app, filter by workspace and user permissions
    res.json(mockWorkspaceUsers);
  } catch (error) {
    console.error('Error fetching workspace users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;