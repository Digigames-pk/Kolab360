import { useState, useEffect, useCallback } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Calendar, 
  User, 
  Tag, 
  Clock, 
  CheckCircle, 
  Circle, 
  AlertCircle,
  ChevronDown,
  Search,
  Filter,
  MoreHorizontal,
  Kanban,
  List,
  Save,
  X,
  Users,
  Flag,
  MessageSquare,
  Paperclip,
  Eye,
  Archive
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TaskModals } from "./TaskModals";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdBy: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  subtasks?: Subtask[];
  comments?: Comment[];
  attachments?: Attachment[];
}

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface Comment {
  id: string;
  content: string;
  author: {
    id: number;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

interface Column {
  id: string;
  title: string;
  status: string;
  color: string;
  tasks: Task[];
  limit?: number;
}

const defaultColumns: Column[] = [
  {
    id: 'todo',
    title: 'To Do',
    status: 'todo',
    color: 'bg-gradient-to-br from-gray-400 to-gray-600',
    tasks: []
  },
  {
    id: 'in_progress',
    title: 'In Progress',
    status: 'in_progress',
    color: 'bg-gradient-to-br from-blue-400 to-blue-600',
    tasks: [],
    limit: 5
  },
  {
    id: 'review',
    title: 'Review',
    status: 'review',
    color: 'bg-gradient-to-br from-yellow-400 to-orange-500',
    tasks: [],
    limit: 3
  },
  {
    id: 'done',
    title: 'Done',
    status: 'done',
    color: 'bg-gradient-to-br from-green-400 to-green-600',
    tasks: []
  }
];

interface RobustTaskBoardProps {
  selectedChannel?: string;
  workspaceId?: string;
}

export function RobustTaskBoard({ selectedChannel, workspaceId }: RobustTaskBoardProps) {
  const [columns, setColumns] = useState<Column[]>(defaultColumns);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch tasks
  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['/api/tasks', workspaceId, selectedChannel],
    enabled: !!workspaceId,
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: (taskData: any) => fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      setIsCreateModalOpen(false);
      toast({ title: "Task created successfully" });
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, updates }: { taskId: string; updates: any }) => 
      fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      setIsEditModalOpen(false);
      toast({ title: "Task updated successfully" });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => 
      fetch(`/api/tasks/${taskId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({ title: "Task deleted successfully" });
    },
  });

  // Update columns when tasks data changes
  useEffect(() => {
    if (tasksData?.tasks) {
      const updatedColumns = defaultColumns.map(column => ({
        ...column,
        tasks: tasksData.tasks.filter((task: Task) => task.status === column.status)
      }));
      setColumns(updatedColumns);
    }
  }, [tasksData]);

  // Handle drag and drop
  const handleDragEnd = useCallback((result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const sourceColumn = columns.find(col => col.id === source.droppableId);
    const destColumn = columns.find(col => col.id === destination.droppableId);
    
    if (!sourceColumn || !destColumn) return;

    const task = sourceColumn.tasks.find(task => task.id === draggableId);
    if (!task) return;

    // Check column limits
    if (destColumn.limit && destColumn.tasks.length >= destColumn.limit && sourceColumn.id !== destColumn.id) {
      toast({
        title: "Column limit reached",
        description: `${destColumn.title} can only have ${destColumn.limit} tasks`,
        variant: "destructive"
      });
      return;
    }

    // Update task status if moving to different column
    if (sourceColumn.id !== destColumn.id) {
      updateTaskMutation.mutate({
        taskId: task.id,
        updates: { status: destColumn.status }
      });
    }
  }, [columns, updateTaskMutation, toast]);

  // Filter tasks based on search and filters
  const filteredTasks = useCallback((tasks: Task[]) => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      const matchesAssignee = filterAssignee === 'all' || 
                             task.assignedTo?.id.toString() === filterAssignee;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
    });
  }, [searchTerm, filterStatus, filterPriority, filterAssignee]);

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  // Get priority icon
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertCircle className="h-4 w-4" />;
      case 'high': return <Flag className="h-4 w-4" />;
      case 'medium': return <Circle className="h-4 w-4" />;
      case 'low': return <Circle className="h-4 w-4" />;
      default: return <Circle className="h-4 w-4" />;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Check if task is overdue
  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && new Date().toDateString() !== new Date(dueDate).toDateString();
  };

  // Task card component
  const TaskCard = ({ task, index }: { task: Task; index: number }) => (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`mb-3 ${snapshot.isDragging ? 'rotate-2 shadow-xl' : ''}`}
        >
          <Card className="cursor-pointer hover:shadow-md transition-all duration-200 group border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTask(task);
                        setIsViewModalOpen(true);
                      }}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTask(task);
                        setIsEditModalOpen(true);
                      }}
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Tags */}
                {task.tags && task.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {task.tags.slice(0, 2).map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs px-2 py-0">
                        {tag}
                      </Badge>
                    ))}
                    {task.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs px-2 py-0">
                        +{task.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Progress for subtasks */}
                {task.subtasks && task.subtasks.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}
                      </span>
                    </div>
                    <Progress 
                      value={(task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100}
                      className="h-1.5"
                    />
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    {/* Priority */}
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-white ${getPriorityColor(task.priority)}`}>
                      {getPriorityIcon(task.priority)}
                      <span className="capitalize font-medium">{task.priority}</span>
                    </div>

                    {/* Assignee */}
                    {task.assignedTo && (
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-xs bg-gradient-to-br from-purple-400 to-blue-500 text-white">
                          {task.assignedTo.firstName[0]}{task.assignedTo.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 text-muted-foreground">
                    {/* Comments count */}
                    {task.comments && task.comments.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>{task.comments.length}</span>
                      </div>
                    )}

                    {/* Attachments count */}
                    {task.attachments && task.attachments.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <Paperclip className="h-3 w-3" />
                        <span>{task.attachments.length}</span>
                      </div>
                    )}

                    {/* Due date */}
                    {task.dueDate && (
                      <div className={`flex items-center space-x-1 ${isOverdue(task.dueDate) ? 'text-red-500 font-medium' : ''}`}>
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(task.dueDate)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );

  // Column component
  const Column = ({ column }: { column: Column }) => (
    <div className="flex-1 min-w-80">
      <Card className="h-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-0 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${column.color}`} />
              <CardTitle className="text-lg font-bold">{column.title}</CardTitle>
              <Badge variant="secondary" className="bg-white/50 dark:bg-gray-800/50">
                {filteredTasks(column.tasks).length}
                {column.limit && `/${column.limit}`}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="h-8 w-8 p-0 hover:bg-white/80 dark:hover:bg-gray-800/80"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 pt-0">
          <Droppable droppableId={column.id}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`min-h-32 transition-colors rounded-lg p-2 ${
                  snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                {filteredTasks(column.tasks).map((task, index) => (
                  <TaskCard key={task.id} task={task} index={index} />
                ))}
                {provided.placeholder}
                {filteredTasks(column.tasks).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="text-4xl mb-2">📋</div>
                    <p className="text-sm">No tasks yet</p>
                    <p className="text-xs">Drag tasks here or create new ones</p>
                  </div>
                )}
              </div>
            )}
          </Droppable>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-6 h-full">
        <div className="flex flex-col h-full space-y-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Task Management
              </h1>
              <p className="text-muted-foreground">
                {selectedChannel ? `Channel: #${selectedChannel}` : 'All Tasks'} • 
                {columns.reduce((acc, col) => acc + col.tasks.length, 0)} total tasks
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              {/* View Mode Toggle */}
              <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                <TabsList>
                  <TabsTrigger value="kanban" className="flex items-center space-x-2">
                    <Kanban className="h-4 w-4" />
                    <span>Board</span>
                  </TabsTrigger>
                  <TabsTrigger value="list" className="flex items-center space-x-2">
                    <List className="h-4 w-4" />
                    <span>List</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <Button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card className="p-4 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex flex-col lg:flex-row space-y-3 lg:space-y-0 lg:space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/80 dark:bg-gray-800/80"
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-32 bg-white/80 dark:bg-gray-800/80">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-full sm:w-32 bg-white/80 dark:bg-gray-800/80">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterAssignee} onValueChange={setFilterAssignee}>
                  <SelectTrigger className="w-full sm:w-32 bg-white/80 dark:bg-gray-800/80">
                    <SelectValue placeholder="Assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    {/* Add dynamic assignee options based on workspace members */}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {viewMode === 'kanban' ? (
              <DragDropContext onDragEnd={handleDragEnd}>
                <div className="flex space-x-6 h-full overflow-x-auto pb-4">
                  {columns.map(column => (
                    <Column key={column.id} column={column} />
                  ))}
                </div>
              </DragDropContext>
            ) : (
              <Card className="h-full bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <List className="h-5 w-5" />
                    <span>Task List</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-96">
                    <div className="divide-y">
                      {columns.flatMap(column => 
                        filteredTasks(column.tasks).map(task => (
                          <div key={task.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                                  <h4 className="font-semibold truncate">{task.title}</h4>
                                  <Badge variant="outline" className="text-xs">
                                    {columns.find(c => c.status === task.status)?.title}
                                  </Badge>
                                </div>
                                {task.description && (
                                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                    {task.description}
                                  </p>
                                )}
                                <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                                  {task.assignedTo && (
                                    <div className="flex items-center space-x-1">
                                      <User className="h-3 w-3" />
                                      <span>{task.assignedTo.firstName} {task.assignedTo.lastName}</span>
                                    </div>
                                  )}
                                  {task.dueDate && (
                                    <div className="flex items-center space-x-1">
                                      <Calendar className="h-3 w-3" />
                                      <span>{formatDate(task.dueDate)}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedTask(task);
                                    setIsViewModalOpen(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingTask(task);
                                    setIsEditModalOpen(true);
                                  }}
                                >
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteTaskMutation.mutate(task.id)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Task Modals */}
      <TaskModals
        isCreateOpen={isCreateModalOpen}
        setIsCreateOpen={setIsCreateModalOpen}
        isEditOpen={isEditModalOpen}
        setIsEditOpen={setIsEditModalOpen}
        isViewOpen={isViewModalOpen}
        setIsViewOpen={setIsViewModalOpen}
        editingTask={editingTask}
        selectedTask={selectedTask}
        onCreateTask={(taskData) => createTaskMutation.mutate({ ...taskData, workspaceId, channelId: selectedChannel })}
        onUpdateTask={(taskId, updates) => updateTaskMutation.mutate({ taskId, updates })}
        onDeleteTask={(taskId) => deleteTaskMutation.mutate(taskId)}
        workspaceMembers={[]} // Add actual workspace members here
      />
    </div>
  );
}