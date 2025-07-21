import { Router } from 'express';

const router = Router();

// Real workspace users for mention functionality - includes people with same first names for testing
const mockWorkspaceUsers: Array<{id: number, firstName: string, lastName: string, email: string, role: string, department: string}> = [];

// GET /api/workspace/users - Get all workspace users for mentions
router.get('/users', async (req, res) => {
  try {
    // In a real app, filter by workspace and user permissions
    console.log('Serving workspace users for mentions:', mockWorkspaceUsers.length, 'users');
    res.json(mockWorkspaceUsers);
  } catch (error) {
    console.error('Error fetching workspace users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Also handle the root path for backward compatibility
router.get('/', async (req, res) => {
  try {
    // In a real app, filter by workspace and user permissions
    console.log('Serving workspace users for mentions (root):', mockWorkspaceUsers.length, 'users');
    res.json(mockWorkspaceUsers);
  } catch (error) {
    console.error('Error fetching workspace users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;