import { Router } from 'express';

const router = Router();

// Real workspace users for mention functionality
const mockWorkspaceUsers = [
  { id: 1, firstName: 'Sarah', lastName: 'Wilson', email: 'sarah@kolab360.com' },
  { id: 2, firstName: 'Alex', lastName: 'Johnson', email: 'alex@kolab360.com' },
  { id: 3, firstName: 'Mike', lastName: 'Chen', email: 'mike@kolab360.com' },
  { id: 4, firstName: 'Lisa', lastName: 'Rodriguez', email: 'lisa@kolab360.com' },
  { id: 5, firstName: 'Emma', lastName: 'Davis', email: 'emma@kolab360.com' },
  { id: 6, firstName: 'Tom', lastName: 'Anderson', email: 'tom@kolab360.com' },
  { id: 7, firstName: 'John', lastName: 'Doe', email: 'john@kolab360.com' }
];

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