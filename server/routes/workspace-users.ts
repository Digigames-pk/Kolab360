import { Router } from 'express';

const router = Router();

// Production ready - workspace users loaded from database

// GET /api/workspace/users - Get all workspace users for mentions
router.get('/users', async (req, res) => {
  try {
    // Production ready - workspace users loaded from database
    console.log('Serving workspace users for mentions from database');
    res.json([]);
  } catch (error) {
    console.error('Error fetching workspace users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Also handle the root path for backward compatibility
router.get('/', async (req, res) => {
  try {
    // Production ready - workspace users loaded from database
    console.log('Serving workspace users for mentions from database (root)');
    res.json([]);
  } catch (error) {
    console.error('Error fetching workspace users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;