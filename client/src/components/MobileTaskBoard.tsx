import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
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
  ChevronDown,
  Filter,
  ArrowUp,
  ArrowDown,
  GripVertical
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
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

interface TaskColumn {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  order: number;
}

interface MobileTaskBoardProps {
  selectedChannel?: string;
  workspaceName?: string;
  onTaskClick?: (task: Task) => void;
}

export function MobileTaskBoard({ selectedChannel = "general", workspaceName = "Demo", onTaskClick }: MobileTaskBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Implement proper session management",
      description: "Fix security vulnerabilities in the login system. This is a critical security issue that needs immediate attention.",
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
      title: "Create modern, responsive dashboard",
      description: "Design new dashboard interface with improved UX/UI. Focus on data visualization and user engagement.",
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
    }
  ]);

  const [taskColumns, setTaskColumns] = useState<TaskColumn[]>([
    { id: "todo", title: "To Do", icon: <Circle className="h-4 w-4" />, color: "bg-slate-500", bgColor: "bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900", borderColor: "border-slate-200 dark:border-slate-700", order: 0 },
    { id: "in-progress", title: "In Progress", icon: <Timer className="h-4 w-4" />, color: "bg-blue-500", bgColor: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30", borderColor: "border-blue-200 dark:border-blue-700", order: 1 },
    { id: "review", title: "Review", icon: <Eye className="h-4 w-4" />, color: "bg-amber-500", bgColor: "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30", borderColor: "border-amber-200 dark:border-amber-700", order: 2 },
    { id: "done", title: "Done", icon: <CheckCircle className="h-4 w-4" />, color: "bg-green-500", bgColor: "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30", borderColor: "border-green-200 dark:border-green-700", order: 3 }
  ]);

  // Load saved column order from localStorage
  useEffect(() => {
    const savedColumns = localStorage.getItem(`taskColumns-${selectedChannel}`);
    if (savedColumns) {
      setTaskColumns(JSON.parse(savedColumns));
    }
  }, [selectedChannel]);

  // Save column order to localStorage
  const saveColumns = (columns: TaskColumn[]) => {
    localStorage.setItem(`taskColumns-${selectedChannel}`, JSON.stringify(columns));
    setTaskColumns(columns);
  };

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [activeTab, setActiveTab] = useState("kanban");
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as const,
    assignee: "",
    status: "todo"
  });

  const sortedColumns = [...taskColumns].sort((a, b) => a.order - b.order);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-500 text-white border-red-500";
      case "high": return "bg-orange-500 text-white border-orange-500";
      case "medium": return "bg-yellow-500 text-white border-yellow-500";
      case "low": return "bg-green-500 text-white border-green-500";
      default: return "bg-gray-500 text-white border-gray-500";
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowTaskDetail(true);
    onTaskClick?.(task);
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination, type } = result;

    if (type === "column") {
      // Reorder columns
      const newColumns = Array.from(sortedColumns);
      const [removed] = newColumns.splice(source.index, 1);
      newColumns.splice(destination.index, 0, removed);
      
      const updatedColumns = newColumns.map((col, index) => ({
        ...col,
        order: index
      }));
      
      saveColumns(updatedColumns);
    } else if (type === "task") {
      // Move task between columns
      const sourceColumn = source.droppableId;
      const destColumn = destination.droppableId;
      
      if (sourceColumn !== destColumn) {
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === result.draggableId 
              ? { ...task, status: destColumn }
              : task
          )
        );
      }
    }
  };

  const createTask = () => {
    if (!newTask.title.trim()) return;
    
    const task: Task = {
      id: Date.now().toString(),
      ...newTask,
      reporter: "Current User",
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      tags: [],
      attachments: 0,
      comments: 0,
      subtasks: [],
      channel: selectedChannel
    };
    
    setTasks(prev => [...prev, task]);
    setNewTask({ title: "", description: "", priority: "medium", assignee: "", status: "todo" });
    setShowNewTaskModal(false);
  };

  // Mobile-optimized task card component
  const TaskCard = ({ task }: { task: Task }) => (
    <Card 
      className={`mb-3 cursor-pointer transition-all duration-200 hover:shadow-md border-l-4 ${
        sortedColumns.find(col => col.id === task.status)?.borderColor || 'border-slate-200'
      }`}
      onClick={() => handleTaskClick(task)}
    >
      <CardContent className="p-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h4 className="font-medium text-sm leading-tight pr-2">{task.title}</h4>
            <Badge className={`text-xs px-2 py-1 ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </Badge>
          </div>
          
          <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 text-xs text-muted-foreground">
              {task.attachments > 0 && (
                <div className="flex items-center space-x-1">
                  <Paperclip className="h-3 w-3" />
                  <span>{task.attachments}</span>
                </div>
              )}
              {task.comments > 0 && (
                <div className="flex items-center space-x-1">
                  <MessageSquare className="h-3 w-3" />
                  <span>{task.comments}</span>
                </div>
              )}
            </div>
            
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs bg-gradient-to-br from-purple-400 to-blue-500 text-white font-bold">
                {task.assignee.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          </div>
          
          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                  {tag}
                </Badge>
              ))}
              {task.tags.length > 3 && (
                <Badge variant="outline" className="text-xs px-1 py-0">
                  +{task.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-4 h-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Task Board
            </h1>
            <p className="text-muted-foreground">Channel: #{selectedChannel} • {tasks.length} total tasks</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCategoryManager(true)}
              className="flex items-center space-x-2"
            >
              <GripVertical className="h-4 w-4" />
              <span>Manage Categories</span>
            </Button>
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-purple-500 to-blue-500"
              onClick={() => setShowNewTaskModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </div>
        </div>

        {/* Mobile Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="kanban">Kanban View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>

          {/* Kanban View */}
          <TabsContent value="kanban" className="h-full">
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="board" type="column" direction="horizontal">
                {(provided) => (
                  <div 
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full overflow-auto"
                  >
                    {sortedColumns.map((column, columnIndex) => {
                      const columnTasks = tasks.filter(t => t.status === column.id);
                      return (
                        <Draggable key={column.id} draggableId={column.id} index={columnIndex}>
                          {(provided, snapshot) => (
                            <div 
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`min-h-0 ${snapshot.isDragging ? 'opacity-50' : ''}`}
                            >
                              <Card className={`h-full ${column.bgColor} ${column.borderColor} border-2 shadow-sm`}>
                                <CardHeader className="pb-3">
                                  <div 
                                    {...provided.dragHandleProps}
                                    className="flex items-center justify-between cursor-move"
                                  >
                                    <div className="flex items-center space-x-2">
                                      <div className={`${column.color} rounded p-1.5 text-white`}>
                                        {column.icon}
                                      </div>
                                      <div>
                                        <h3 className="font-semibold text-sm">{column.title}</h3>
                                        <p className="text-xs text-muted-foreground">{columnTasks.length} tasks</p>
                                      </div>
                                    </div>
                                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                  <Droppable droppableId={column.id} type="task">
                                    {(provided, snapshot) => (
                                      <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={`min-h-[100px] ${snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                      >
                                        <ScrollArea className="h-96">
                                          <div className="space-y-2">
                                            {columnTasks.map((task, taskIndex) => (
                                              <Draggable key={task.id} draggableId={task.id} index={taskIndex}>
                                                {(provided, snapshot) => (
                                                  <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className={snapshot.isDragging ? 'opacity-50 rotate-2' : ''}
                                                  >
                                                    <TaskCard task={task} />
                                                  </div>
                                                )}
                                              </Draggable>
                                            ))}
                                            {provided.placeholder}
                                            {columnTasks.length === 0 && (
                                              <div className="text-center py-8 text-muted-foreground">
                                                <p className="text-sm">No tasks</p>
                                              </div>
                                            )}
                                          </div>
                                        </ScrollArea>
                                        {provided.placeholder}
                                      </div>
                                    )}
                                  </Droppable>
                                </CardContent>
                              </Card>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </TabsContent>

          {/* List View */}
          <TabsContent value="list" className="h-full">
            <ScrollArea className="h-full">
              <div className="space-y-3">
                {tasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Mobile-Optimized Task Detail Modal */}
        <Dialog open={showTaskDetail} onOpenChange={setShowTaskDetail}>
          <DialogContent className="max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg">{selectedTask?.title}</DialogTitle>
            </DialogHeader>
            {selectedTask && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge className={`${getPriorityColor(selectedTask.priority)}`}>
                    {selectedTask.priority}
                  </Badge>
                  <Badge variant="outline">{selectedTask.status}</Badge>
                </div>
                
                <p className="text-sm text-muted-foreground">{selectedTask.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="font-medium">Assignee</Label>
                    <p>{selectedTask.assignee}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Reporter</Label>
                    <p>{selectedTask.reporter}</p>
                  </div>
                </div>
                
                {selectedTask.tags.length > 0 && (
                  <div>
                    <Label className="font-medium">Tags</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedTask.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-4">
                  <Button variant="outline" size="sm">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Comments ({selectedTask.comments})
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* New Task Modal */}
        <Dialog open={showNewTaskModal} onOpenChange={setShowNewTaskModal}>
          <DialogContent className="max-w-lg mx-4">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter task title..."
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter task description..."
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newTask.priority} onValueChange={(value: any) => setNewTask(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
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
                
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={newTask.status} onValueChange={(value) => setNewTask(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {taskColumns.map(col => (
                        <SelectItem key={col.id} value={col.id}>{col.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="assignee">Assignee</Label>
                <Input
                  id="assignee"
                  value={newTask.assignee}
                  onChange={(e) => setNewTask(prev => ({ ...prev, assignee: e.target.value }))}
                  placeholder="Enter assignee name..."
                />
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setShowNewTaskModal(false)} className="w-full">
                  Cancel
                </Button>
                <Button onClick={createTask} className="w-full bg-gradient-to-r from-purple-500 to-blue-500">
                  Create Task
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Category Management Modal */}
        <Dialog open={showCategoryManager} onOpenChange={setShowCategoryManager}>
          <DialogContent className="max-w-md mx-4">
            <DialogHeader>
              <DialogTitle>Manage Categories</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Drag categories to reorder them. Changes are saved automatically.
              </p>
              
              <DragDropContext onDragEnd={(result) => {
                if (!result.destination) return;
                
                const newColumns = Array.from(sortedColumns);
                const [removed] = newColumns.splice(result.source.index, 1);
                newColumns.splice(result.destination.index, 0, removed);
                
                const updatedColumns = newColumns.map((col, index) => ({
                  ...col,
                  order: index
                }));
                
                saveColumns(updatedColumns);
              }}>
                <Droppable droppableId="categories">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                      {sortedColumns.map((column, index) => (
                        <Draggable key={column.id} draggableId={column.id} index={index}>
                          {(provided, snapshot) => (
                            <div 
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`flex items-center justify-between p-3 border rounded-lg cursor-move transition-all ${
                                snapshot.isDragging ? 'opacity-50 bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-muted/50'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
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
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
              
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}