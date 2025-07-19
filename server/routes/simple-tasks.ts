import { Router } from 'express';

const router = Router();

// Mock tasks data for development
const mockTasks = [
  {
    id: '1',
    title: 'Set up project structure',
    description: 'Initialize the basic project structure with components and routing',
    status: 'completed',
    priority: 'high',
    assignedUserId: 3,
    createdBy: 1,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    workspaceId: '1',
    category: 'Development'
  },
  {
    id: '2',
    title: 'Implement user authentication',
    description: 'Create login/logout functionality with session management',
    status: 'in-progress',
    priority: 'high',
    assignedUserId: 3,
    createdBy: 1,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    workspaceId: '1',
    category: 'Development'
  },
  {
    id: '3',
    title: 'Design task management interface',
    description: 'Create intuitive UI for task creation, editing, and tracking',
    status: 'todo',
    priority: 'medium',
    assignedUserId: 3,
    createdBy: 1,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    workspaceId: '1',
    category: 'Design'
  },
  {
    id: '4',
    title: 'Set up file upload system',
    description: 'Implement secure file upload with cloud storage integration',
    status: 'todo',
    priority: 'medium',
    assignedUserId: 3,
    createdBy: 1,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
    workspaceId: '1',
    category: 'Development'
  },
  {
    id: '5',
    title: 'Write documentation',
    description: 'Document API endpoints and component usage',
    status: 'todo',
    priority: 'low',
    assignedUserId: 3,
    createdBy: 1,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks from now
    workspaceId: '1',
    category: 'Documentation'
  }
];

// GET /api/tasks - Get all tasks
router.get('/', async (req, res) => {
  try {
    const workspaceId = req.query.workspaceId || '1';
    const filteredTasks = mockTasks.filter(task => task.workspaceId === workspaceId);
    
    // Add creator and assignee information
    const tasksWithUsers = filteredTasks.map(task => ({
      ...task,
      creator: { id: 1, firstName: 'System', lastName: 'Admin', email: 'admin@demo.com' },
      assignedUser: { id: 3, firstName: 'Regular', lastName: 'User', email: 'user@test.com' }
    }));
    
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