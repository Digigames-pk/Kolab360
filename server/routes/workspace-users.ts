import { Router } from 'express';

const router = Router();

// Real workspace users for mention functionality - includes people with same first names for testing
const mockWorkspaceUsers = [
  { id: 1, firstName: 'Alice', lastName: 'Johnson', email: 'alice.johnson@kolab360.com', role: 'member', department: 'Engineering' },
  { id: 2, firstName: 'Alice', lastName: 'Rodriguez', email: 'alice.rodriguez@kolab360.com', role: 'member', department: 'Marketing' },
  { id: 3, firstName: 'Bob', lastName: 'Smith', email: 'bob.smith@kolab360.com', role: 'member', department: 'Sales' },
  { id: 4, firstName: 'Bob', lastName: 'Wilson', email: 'bob.wilson@kolab360.com', role: 'admin', department: 'Engineering' },
  { id: 5, firstName: 'Charlie', lastName: 'Brown', email: 'charlie.brown@kolab360.com', role: 'member', department: 'Design' },
  { id: 6, firstName: 'Diana', lastName: 'Martinez', email: 'diana.martinez@kolab360.com', role: 'member', department: 'HR' },
  { id: 7, firstName: 'Eva', lastName: 'Thompson', email: 'eva.thompson@kolab360.com', role: 'member', department: 'Finance' },
  { id: 8, firstName: 'Michael', lastName: 'Davis', email: 'michael.davis@kolab360.com', role: 'member', department: 'Operations' },
  { id: 9, firstName: 'Michael', lastName: 'Lee', email: 'michael.lee@kolab360.com', role: 'member', department: 'Engineering' },
  { id: 10, firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@kolab360.com', role: 'manager', department: 'Product' }
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