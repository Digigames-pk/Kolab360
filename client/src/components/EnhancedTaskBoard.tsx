import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Calendar, 
  CheckSquare, 
  Clock, 
  Plus, 
  User, 
  MoreHorizontal, 
  Flag, 
  MessageSquare, 
  Paperclip,
  AlertCircle,
  CheckCircle,
  Circle,
  Timer,
  Edit3,
  Trash2,
  Eye,
  Target,
  TrendingUp
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "review" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  assignee: string;
  reporter: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  attachments: number;
  comments: number;
  subtasks: { id: string; title: string; completed: boolean }[];
  channel: string;
}

interface TaskBoardProps {
  selectedChannel?: string;
  workspaceName?: string;
  onTaskClick?: (task: Task) => void;
}

export function EnhancedTaskBoard({ selectedChannel = "general", workspaceName = "Demo", onTaskClick }: TaskBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Fix authentication system vulnerability",
      description: "Implement proper session management and fix security vulnerabilities in the login system. This is a critical security issue that needs immediate attention.",
      status: "todo",
      priority: "urgent",
      assignee: "Sarah Wilson",
      reporter: "John Doe",
      createdAt: "2024-01-15",
      updatedAt: "2024-01-16",
      tags: ["security", "backend", "urgent"],
      attachments: 2,
      comments: 5,
      subtasks: [
        { id: "1a", title: "Review security audit report", completed: true },
        { id: "1b", title: "Implement session timeout", completed: false },
        { id: "1c", title: "Add rate limiting", completed: false }
      ],
      channel: selectedChannel
    },
    {
      id: "2", 
      title: "Design new dashboard interface",
      description: "Create modern, responsive dashboard with improved UX/UI. Focus on data visualization and user engagement.",
      status: "in-progress",
      priority: "high",
      assignee: "Alex Johnson",
      reporter: "Jane Smith",
      dueDate: "2024-01-28",
      createdAt: "2024-01-14",
      updatedAt: "2024-01-17",
      tags: ["design", "frontend", "dashboard"],
      attachments: 8,
      comments: 12,
      subtasks: [
        { id: "2a", title: "Create wireframes", completed: true },
        { id: "2b", title: "Design system components", completed: true },
        { id: "2c", title: "Build responsive layouts", completed: false }
      ],
      channel: selectedChannel
    },
    {
      id: "3",
      title: "API documentation update",
      description: "Comprehensive review and update of all API endpoints documentation with examples and best practices.",
      status: "review", 
      priority: "medium",
      assignee: "Mike Chen",
      reporter: "Sarah Wilson",
      dueDate: "2024-01-25",
      createdAt: "2024-01-13",
      updatedAt: "2024-01-17",
      tags: ["documentation", "api", "backend"],
      attachments: 3,
      comments: 7,
      subtasks: [
        { id: "3a", title: "Review existing docs", completed: true },
        { id: "3b", title: "Add code examples", completed: true },
        { id: "3c", title: "Test all endpoints", completed: false }
      ],
      channel: selectedChannel
    },
    {
      id: "4",
      title: "Mobile app performance optimization",
      description: "Optimize app performance for better user experience on mobile devices.",
      status: "done",
      priority: "medium",
      assignee: "Lisa Rodriguez",
      reporter: "Alex Johnson",
      createdAt: "2024-01-10",
      updatedAt: "2024-01-16",
      tags: ["mobile", "performance", "optimization"],
      attachments: 1,
      comments: 3,
      subtasks: [
        { id: "4a", title: "Profile app performance", completed: true },
        { id: "4b", title: "Optimize image loading", completed: true },
        { id: "4c", title: "Reduce bundle size", completed: true }
      ],
      channel: selectedChannel
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedTaskForActions, setSelectedTaskForActions] = useState<Task | null>(null);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as const,
    assignee: "",
    dueDate: "",
    tags: ""
  });
  const [taskColumns, setTaskColumns] = useState([
    { id: "todo", title: "To Do", icon: <Circle className="h-4 w-4" />, color: "bg-slate-500", bgColor: "bg-gradient-to-br from-slate-50 to-slate-100", borderColor: "border-slate-200" },
    { id: "in-progress", title: "In Progress", icon: <Timer className="h-4 w-4" />, color: "bg-blue-500", bgColor: "bg-gradient-to-br from-blue-50 to-blue-100", borderColor: "border-blue-200" },
    { id: "review", title: "Review", icon: <Eye className="h-4 w-4" />, color: "bg-amber-500", bgColor: "bg-gradient-to-br from-amber-50 to-amber-100", borderColor: "border-amber-200" },
    { id: "done", title: "Done", icon: <CheckCircle className="h-4 w-4" />, color: "bg-green-500", bgColor: "bg-gradient-to-br from-green-50 to-green-100", borderColor: "border-green-200" }
  ]);

  const columns = taskColumns.map(col => ({
    ...col,
    tasks: tasks.filter(t => t.status === col.id)
  }));

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-500 text-white border-red-500";
      case "high": return "bg-orange-500 text-white border-orange-500";
      case "medium": return "bg-yellow-500 text-white border-yellow-500";
      case "low": return "bg-green-500 text-white border-green-500";
      default: return "bg-gray-500 text-white border-gray-500";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent": return <AlertCircle className="h-3 w-3" />;
      case "high": return <Flag className="h-3 w-3" />;
      case "medium": return <Target className="h-3 w-3" />;
      case "low": return <TrendingUp className="h-3 w-3" />;
      default: return <Circle className="h-3 w-3" />;
    }
  };

  const addTask = () => {
    if (!newTask.title.trim()) return;
    
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      status: "todo",
      priority: newTask.priority,
      assignee: newTask.assignee,
      reporter: "Current User",
      dueDate: newTask.dueDate || undefined,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      tags: newTask.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      attachments: 0,
      comments: 0,
      subtasks: [],
      channel: selectedChannel
    };

    setTasks([...tasks, task]);
    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      assignee: "",
      dueDate: "",
      tags: ""
    });
    setIsDialogOpen(false);
  };

  const getSubtaskProgress = (subtasks: Task['subtasks']) => {
    if (subtasks.length === 0) return 0;
    const completed = subtasks.filter(st => st.completed).length;
    return Math.round((completed / subtasks.length) * 100);
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "done").length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="p-6 bg-white/90 backdrop-blur-md border-b shadow-sm">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Task Board
            </h1>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>Channel: <span className="font-semibold text-blue-600">#{selectedChannel}</span></span>
              <span>•</span>
              <span>{totalTasks} total tasks</span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <span>{progressPercentage}% complete</span>
                <div className="w-16 h-2 bg-gray-200 rounded-full ml-2">
                  <div 
                    className="h-2 bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All assignees</SelectItem>
                <SelectItem value="sarah">Sarah Wilson</SelectItem>
                <SelectItem value="alex">Alex Johnson</SelectItem>
                <SelectItem value="mike">Mike Chen</SelectItem>
                <SelectItem value="lisa">Lisa Rodriguez</SelectItem>
              </SelectContent>
            </Select>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-lg">
                  <Plus className="h-4 w-4 mr-2" />
                  New Task
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">Create New Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter task title..."
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the task in detail..."
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="assignee">Assignee</Label>
                      <Input
                        id="assignee"
                        placeholder="Assign to..."
                        value={newTask.assignee}
                        onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={newTask.priority} onValueChange={(value: any) => setNewTask({ ...newTask, priority: value })}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={newTask.dueDate}
                        onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tags">Tags (comma separated)</Label>
                      <Input
                        id="tags"
                        placeholder="frontend, urgent, bug..."
                        value={newTask.tags}
                        onChange={(e) => setNewTask({ ...newTask, tags: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={addTask} className="bg-gradient-to-r from-purple-500 to-blue-500">
                      Create Task
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Task Columns */}
      <div className="flex-1 p-6 overflow-hidden">
        <div className="grid grid-cols-4 gap-6 h-full">
          {columns.map((column) => (
            <div 
              key={column.id} 
              className={`${column.bgColor} rounded-2xl p-5 border-2 ${column.borderColor} shadow-lg h-full flex flex-col`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`${column.color} rounded-lg p-2 text-white`}>
                    {column.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{column.title}</h3>
                    <p className="text-sm text-gray-600">{column.tasks.length} tasks</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-white/80 text-gray-700 font-semibold">
                  {column.tasks.length}
                </Badge>
              </div>
              
              <div className="space-y-4 flex-1 overflow-y-auto">
                {column.tasks.map((task) => (
                  <Card 
                    key={task.id} 
                    className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer bg-white/95 backdrop-blur-sm border-l-4 hover:border-l-8"
                    style={{ 
                      borderLeftColor: column.color.includes('slate') ? '#64748b' : 
                                      column.color.includes('blue') ? '#3b82f6' :
                                      column.color.includes('amber') ? '#f59e0b' : '#10b981'
                    }}
                    onClick={() => onTaskClick?.(task)}
                  >
                    <CardContent className="p-5 space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <h4 className="font-bold text-base leading-tight line-clamp-2 text-gray-800">
                          {task.title}
                        </h4>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0 hover:bg-blue-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              onTaskClick?.(task);
                            }}
                          >
                            <Edit3 className="h-3 w-3 text-blue-600" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0 hover:bg-green-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              onTaskClick?.(task);
                            }}
                          >
                            <Eye className="h-3 w-3 text-green-600" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0 hover:bg-purple-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTaskForActions(task);
                              setShowActionsMenu(true);
                            }}
                            title="More actions"
                          >
                            <MoreHorizontal className="h-3 w-3 text-gray-600" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Description */}
                      {task.description && (
                        <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                          {task.description}
                        </p>
                      )}
                      
                      {/* Tags */}
                      {task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {task.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs h-6 bg-blue-50 text-blue-700 border-blue-200">
                              {tag}
                            </Badge>
                          ))}
                          {task.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs h-6 bg-gray-50 text-gray-700">
                              +{task.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      {/* Subtasks Progress */}
                      {task.subtasks.length > 0 && (
                        <div className="space-y-2 bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 font-medium">Subtasks</span>
                            <span className="font-bold text-gray-800">
                              {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${getSubtaskProgress(task.subtasks)}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Priority and Due Date */}
                      <div className="flex items-center justify-between">
                        <Badge className={`text-xs h-6 border ${getPriorityColor(task.priority)}`}>
                          {getPriorityIcon(task.priority)}
                          <span className="ml-1 font-semibold">{task.priority.toUpperCase()}</span>
                        </Badge>
                        
                        {task.dueDate && (
                          <div className="flex items-center space-x-1 text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-md">
                            <Clock className="h-3 w-3" />
                            <span className="font-medium">{new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Activity indicators */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center space-x-3">
                          {task.attachments > 0 && (
                            <div className="flex items-center space-x-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                              <Paperclip className="h-3 w-3" />
                              <span>{task.attachments}</span>
                            </div>
                          )}
                          {task.comments > 0 && (
                            <div className="flex items-center space-x-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                              <MessageSquare className="h-3 w-3" />
                              <span>{task.comments}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Assignee */}
                        {task.assignee && (
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-7 w-7 border-2 border-white shadow-sm">
                              <AvatarFallback className="text-xs bg-gradient-to-br from-purple-400 to-blue-500 text-white font-bold">
                                {task.assignee.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="text-xs">
                              <p className="font-medium text-gray-800">{task.assignee.split(' ')[0]}</p>
                              <p className="text-gray-500">{task.updatedAt}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {/* Add task button for each column */}
                <Button 
                  variant="outline" 
                  className="w-full border-dashed border-2 h-12 text-gray-500 hover:text-gray-700 hover:border-gray-400"
                  onClick={() => setIsDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add task
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task Actions Menu */}
      <Dialog open={showActionsMenu} onOpenChange={setShowActionsMenu}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Task Actions</DialogTitle>
          </DialogHeader>
          {selectedTaskForActions && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">{selectedTaskForActions.title}</h4>
                <p className="text-sm text-muted-foreground">Choose an action for this task:</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  className="h-12"
                  onClick={() => {
                    onTaskClick?.(selectedTaskForActions);
                    setShowActionsMenu(false);
                  }}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  className="h-12"
                  onClick={() => {
                    setShowActionsMenu(false);
                  }}
                >
                  <Flag className="h-4 w-4 mr-2" />
                  Favorite
                </Button>
                <Button 
                  variant="outline" 
                  className="h-12"
                  onClick={() => {
                    const newTask = {
                      ...selectedTaskForActions,
                      id: Date.now().toString(),
                      title: `${selectedTaskForActions.title} (Copy)`,
                      createdAt: new Date().toISOString().split('T')[0],
                      updatedAt: new Date().toISOString().split('T')[0]
                    };
                    setTasks(prev => [...prev, newTask]);
                    setShowActionsMenu(false);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Duplicate
                </Button>
                <Button 
                  variant="outline" 
                  className="h-12 text-red-600 hover:bg-red-50"
                  onClick={() => {
                    if (confirm('Delete this task?')) {
                      setTasks(prev => prev.filter(t => t.id !== selectedTaskForActions.id));
                      setShowActionsMenu(false);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Category Manager Button */}
      <div className="fixed bottom-6 right-6">
        <Button 
          onClick={() => setShowCategoryManager(true)}
          className="rounded-full h-12 w-12 p-0 bg-gradient-to-r from-purple-500 to-blue-500 shadow-lg"
          title="Manage Categories"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      {/* Category Manager Dialog */}
      <Dialog open={showCategoryManager} onOpenChange={setShowCategoryManager}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Task Categories</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium">Current Categories</h4>
              <div className="space-y-2">
                {taskColumns.map((column, index) => (
                  <div key={column.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`${column.color} rounded p-2 text-white`}>
                        {column.icon}
                      </div>
                      <span className="font-medium">{column.title}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      {taskColumns.length > 2 && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            if (confirm('Delete this category? Tasks will be moved to "To Do".')) {
                              setTasks(prev => prev.map(task => 
                                task.status === column.id ? {...task, status: "todo"} : task
                              ));
                              setTaskColumns(prev => prev.filter((_, i) => i !== index));
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}