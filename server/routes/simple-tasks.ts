import { Router } from 'express';

const router = Router();

// Clean tasks data - no mock content
const mockTasks = [];

// GET /api/tasks - Get all tasks
router.get('/', async (req, res) => {
  try {
    const workspaceId = req.query.workspaceId || '1';
    const filteredTasks = mockTasks.filter(task => task.workspaceId === workspaceId);
    
    // Return tasks without dummy user data
    const tasksWithUsers = filteredTasks;
    
    res.json(tasksWithUsers);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
});

// POST /api/tasks - Create a new task
router.post('/', async (req, res) => {
  try {
    const { title, description, priority = 'medium', category = 'General', workspaceId = '1', assignedUserId = 3 } = req.body;
    
    const newTask = {
      id: (mockTasks.length + 1).toString(),
      title,
      description,
      status: 'todo',
      priority,
      assignedUserId,
      createdBy: 1, // Mock user ID
      createdAt: new Date(),
      updatedAt: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      workspaceId,
      category
    };
    
    mockTasks.push(newTask);
    
    const taskWithUsers = {
      ...newTask,
      creator: { id: 1, firstName: 'System', lastName: 'Admin', email: 'admin@demo.com' },
      assignedUser: { id: 3, firstName: 'Regular', lastName: 'User', email: 'user@test.com' }
    };
    
    res.status(201).json(taskWithUsers);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Failed to create task' });
  }
});

// PUT /api/tasks/:id - Update a task
router.put('/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    const updates = req.body;
    
    const taskIndex = mockTasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    mockTasks[taskIndex] = {
      ...mockTasks[taskIndex],
      ...updates,
      updatedAt: new Date()
    };
    
    const updatedTaskWithUsers = {
      ...mockTasks[taskIndex],
      creator: { id: 1, firstName: 'System', lastName: 'Admin', email: 'admin@demo.com' },
      assignedUser: { id: 3, firstName: 'Regular', lastName: 'User', email: 'user@test.com' }
    };
    
    res.json(updatedTaskWithUsers);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Failed to update task' });
  }
});

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    const taskIndex = mockTasks.findIndex(task => task.id === taskId);
    
    if (taskIndex === -1) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    mockTasks.splice(taskIndex, 1);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Failed to delete task' });
  }
});

export default router;