import { Router } from "express";

const router = Router();

// Mock task data
let mockTasks = [
  {
    id: "1",
    title: "Setup Project",
    description: "Initialize the new project repository and basic structure",
    status: "todo",
    priority: "high",
    assignee: "John Doe",
    dueDate: "2025-01-25",
    tags: ["setup", "initialization"],
    subtasks: [
      { id: "1-1", title: "Create repository", completed: true },
      { id: "1-2", title: "Setup CI/CD", completed: false }
    ],
    comments: 3,
    attachments: 1,
    createdAt: "2025-01-18T00:00:00Z",
    channelId: "general",
    categoryId: "development"
  },
  {
    id: "2", 
    title: "Design System Review",
    description: "Review and update the design system components",
    status: "in-progress",
    priority: "medium",
    assignee: "Jane Smith",
    dueDate: "2025-01-30",
    tags: ["design", "review"],
    subtasks: [
      { id: "2-1", title: "Audit current components", completed: true },
      { id: "2-2", title: "Update documentation", completed: false }
    ],
    comments: 5,
    attachments: 2,
    createdAt: "2025-01-17T00:00:00Z",
    channelId: "general",
    categoryId: "design"
  },
  {
    id: "3",
    title: "Testing Framework",
    description: "Implement comprehensive testing framework",
    status: "review",
    priority: "urgent",
    assignee: "Mike Chen",
    dueDate: "2025-01-22",
    tags: ["testing", "framework"],
    subtasks: [],
    comments: 2,
    attachments: 0,
    createdAt: "2025-01-16T00:00:00Z",
    channelId: "general", 
    categoryId: "testing"
  },
  {
    id: "4",
    title: "Documentation Update",
    description: "Update project documentation",
    status: "done",
    priority: "low",
    assignee: "Sarah Wilson",
    dueDate: "2025-01-20",
    tags: ["documentation"],
    subtasks: [
      { id: "4-1", title: "Update README", completed: true },
      { id: "4-2", title: "API documentation", completed: true }
    ],
    comments: 1,
    attachments: 0,
    createdAt: "2025-01-15T00:00:00Z",
    channelId: "general",
    categoryId: "documentation"
  }
];

// Mock categories
let mockCategories = [
  { id: "development", name: "Development", color: "bg-blue-100 border-blue-300", order: 0 },
  { id: "design", name: "Design", color: "bg-purple-100 border-purple-300", order: 1 },
  { id: "testing", name: "Testing", color: "bg-green-100 border-green-300", order: 2 },
  { id: "documentation", name: "Documentation", color: "bg-yellow-100 border-yellow-300", order: 3 }
];

// Get all tasks
router.get("/", async (req, res) => {
  try {
    const { channelId, categoryId, status, priority } = req.query;
    
    let filteredTasks = [...mockTasks];
    
    // Apply filters
    if (channelId) {
      filteredTasks = filteredTasks.filter(task => task.channelId === channelId);
    }
    
    if (categoryId) {
      filteredTasks = filteredTasks.filter(task => task.categoryId === categoryId);
    }
    
    if (status) {
      filteredTasks = filteredTasks.filter(task => task.status === status);
    }
    
    if (priority) {
      filteredTasks = filteredTasks.filter(task => task.priority === priority);
    }

    res.json({ tasks: filteredTasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// Create new task
router.post("/", async (req, res) => {
  try {
    const taskData = req.body;
    
    const newTask = {
      id: Date.now().toString(),
      title: taskData.title,
      description: taskData.description || "",
      status: taskData.status || "todo",
      priority: taskData.priority || "medium",
      assignee: taskData.assignee || "",
      dueDate: taskData.dueDate || "",
      tags: taskData.tags || [],
      subtasks: taskData.subtasks || [],
      comments: 0,
      attachments: 0,
      createdAt: new Date().toISOString(),
      channelId: taskData.channelId || "general",
      categoryId: taskData.categoryId || "development"
    };
    
    mockTasks.push(newTask);
    
    res.json({ success: true, task: newTask });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Failed to create task" });
  }
});

// Update task
router.put("/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;
    const updates = req.body;
    
    const taskIndex = mockTasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) {
      return res.status(404).json({ error: "Task not found" });
    }
    
    mockTasks[taskIndex] = { ...mockTasks[taskIndex], ...updates };
    
    res.json({ success: true, task: mockTasks[taskIndex] });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Failed to update task" });
  }
});

// Delete task
router.delete("/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const taskIndex = mockTasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) {
      return res.status(404).json({ error: "Task not found" });
    }
    
    mockTasks.splice(taskIndex, 1);
    
    res.json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

// Get categories
router.get("/categories", async (req, res) => {
  try {
    const { channelId } = req.query;
    res.json({ categories: mockCategories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// Update categories
router.put("/categories", async (req, res) => {
  try {
    const { categories } = req.body;
    mockCategories = categories;
    res.json({ success: true, categories: mockCategories });
  } catch (error) {
    console.error("Error updating categories:", error);
    res.status(500).json({ error: "Failed to update categories" });
  }
});

export default router;