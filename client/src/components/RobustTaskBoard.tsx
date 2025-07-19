import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Tag, 
  MoreHorizontal,
  Clock,
  Flag,
  MessageSquare,
  Paperclip,
  Edit3,
  Trash2,
  Grid3X3,
  List,
  CheckCircle2,
  Circle,
  AlertCircle,
  Users,
  Settings2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CreateTaskModal, EditTaskModal } from './TaskModals';
import { EnhancedTaskCategoryManager } from './EnhancedTaskCategoryManager';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: string;
  dueDate?: string;
  tags: string[];
  subtasks?: { id: string; title: string; completed: boolean }[];
  comments?: number;
  attachments?: number;
  createdAt: string;
}

interface TaskColumn {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
}

interface RobustTaskBoardProps {
  selectedChannel?: string;
  workspaceId: number;
}

const INITIAL_COLUMNS: TaskColumn[] = [
  {
    id: 'todo',
    title: 'To Do',
    color: 'bg-slate-100 border-slate-200',
    tasks: [
      {
        id: '1',
        title: 'Design new user interface',
        description: 'Create wireframes and mockups for the new dashboard',
        status: 'todo',
        priority: 'high',
        assignee: 'Sarah Chen',
        dueDate: '2024-01-20',
        tags: ['UI/UX', 'Design'],
        subtasks: [
          { id: 's1', title: 'Research user requirements', completed: true },
          { id: 's2', title: 'Create wireframes', completed: false }
        ],
        comments: 3,
        attachments: 2,
        createdAt: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        title: 'Setup development environment',
        description: 'Configure local development environment for new team members',
        status: 'todo',
        priority: 'medium',
        assignee: 'Alex Rodriguez',
        dueDate: '2024-01-18',
        tags: ['DevOps', 'Setup'],
        subtasks: [],
        comments: 1,
        attachments: 0,
        createdAt: '2024-01-14T14:20:00Z'
      }
    ]
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    color: 'bg-blue-50 border-blue-200',
    tasks: [
      {
        id: '3',
        title: 'Implement authentication system',
        description: 'Build secure login and registration functionality',
        status: 'in-progress',
        priority: 'urgent',
        assignee: 'Emma Davis',
        dueDate: '2024-01-22',
        tags: ['Backend', 'Security'],
        subtasks: [
          { id: 's3', title: 'Setup JWT tokens', completed: true },
          { id: 's4', title: 'Create login API', completed: true },
          { id: 's5', title: 'Add password reset', completed: false }
        ],
        comments: 5,
        attachments: 1,
        createdAt: '2024-01-13T09:15:00Z'
      }
    ]
  },
  {
    id: 'review',
    title: 'Review',
    color: 'bg-orange-50 border-orange-200',
    tasks: [
      {
        id: '4',
        title: 'Code review for dashboard component',
        description: 'Review the new dashboard React component implementation',
        status: 'review',
        priority: 'medium',
        assignee: 'Michael Kim',
        dueDate: '2024-01-19',
        tags: ['Frontend', 'Review'],
        subtasks: [],
        comments: 2,
        attachments: 0,
        createdAt: '2024-01-12T16:45:00Z'
      }
    ]
  },
  {
    id: 'done',
    title: 'Done',
    color: 'bg-green-50 border-green-200',
    tasks: [
      {
        id: '5',
        title: 'Database schema design',
        description: 'Design and implement the initial database schema',
        status: 'done',
        priority: 'high',
        assignee: 'David Park',
        dueDate: '2024-01-16',
        tags: ['Database', 'Backend'],
        subtasks: [
          { id: 's6', title: 'Design ER diagram', completed: true },
          { id: 's7', title: 'Create migration scripts', completed: true },
          { id: 's8', title: 'Test with sample data', completed: true }
        ],
        comments: 4,
        attachments: 3,
        createdAt: '2024-01-10T11:20:00Z'
      },
      {
        id: '6',
        title: 'Project documentation',
        description: 'Create comprehensive project documentation',
        status: 'done',
        priority: 'low',
        assignee: 'Lisa Wong',
        dueDate: '2024-01-15',
        tags: ['Documentation'],
        subtasks: [],
        comments: 1,
        attachments: 2,
        createdAt: '2024-01-08T13:30:00Z'
      }
    ]
  }
];

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-600 border-gray-200',
  medium: 'bg-blue-100 text-blue-600 border-blue-200',
  high: 'bg-orange-100 text-orange-600 border-orange-200',
  urgent: 'bg-red-100 text-red-600 border-red-200'
};

const PRIORITY_ICONS = {
  low: Circle,
  medium: Clock,
  high: AlertCircle,
  urgent: Flag
};

export function RobustTaskBoard({ selectedChannel, workspaceId }: RobustTaskBoardProps) {
  const channelId = selectedChannel || 'general';
  const [columns, setColumns] = useState<TaskColumn[]>(INITIAL_COLUMNS);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<string>('todo');
  const [showEditTask, setShowEditTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeView, setActiveView] = useState<'board' | 'categories'>('board');

  // API functions
  const loadTasks = async () => {
    try {
      const response = await fetch(`/api/simple-tasks?workspaceId=${workspaceId}`);
      if (response.ok) {
        const tasks = await response.json();
        
        // Convert API tasks to our format and organize by status
        const tasksByStatus = {
          'todo': [],
          'in-progress': [],
          'review': [],
          'done': []
        };
        
        tasks.forEach(task => {
          const formattedTask = {
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            assignee: task.assignedUser ? `${task.assignedUser.firstName} ${task.assignedUser.lastName}` : '',
            dueDate: task.dueDate,
            tags: [task.category],
            createdAt: task.createdAt
          };
          
          if (tasksByStatus[task.status]) {
            tasksByStatus[task.status].push(formattedTask);
          }
        });
        
        // Update columns with real data
        setColumns(INITIAL_COLUMNS.map(col => ({
          ...col,
          tasks: tasksByStatus[col.id] || []
        })));
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const onTaskCreate = async (task: Partial<Task>) => {
    try {
      const response = await fetch('/api/simple-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          priority: task.priority || 'medium',
          category: task.tags?.[0] || 'General',
          workspaceId: workspaceId.toString()
        }),
      });
      
      if (response.ok) {
        loadTasks();
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };
  
  const onTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    try {
      const response = await fetch(`/api/simple-tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (response.ok) {
        loadTasks();
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };
  
  const onTaskDelete = async (taskId: string) => {
    try {
      const response = await fetch(`/api/simple-tasks/${taskId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        loadTasks();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // Load tasks on component mount
  useEffect(() => {
    loadTasks();
  }, [workspaceId]);

  // Filter tasks based on search and filters
  const getFilteredTasks = (tasks: Task[]) => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      const matchesAssignee = filterAssignee === 'all' || task.assignee === filterAssignee;
      
      return matchesSearch && matchesPriority && matchesAssignee;
    });
  };

  // Get all unique assignees
  const getAllAssignees = () => {
    const assignees = new Set<string>();
    columns.forEach(column => {
      column.tasks.forEach(task => {
        if (task.assignee) assignees.add(task.assignee);
      });
    });
    return Array.from(assignees);
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const start = columns.find(col => col.id === source.droppableId);
    const finish = columns.find(col => col.id === destination.droppableId);

    if (!start || !finish) return;

    if (start === finish) {
      // Moving within the same column
      const newTasks = Array.from(start.tasks);
      const task = newTasks.find(t => t.id === draggableId);
      if (!task) return;

      newTasks.splice(source.index, 1);
      newTasks.splice(destination.index, 0, task);

      const newColumn = {
        ...start,
        tasks: newTasks,
      };

      setColumns(prev => prev.map(col => col.id === newColumn.id ? newColumn : col));
    } else {
      // Moving to a different column
      const startTasks = Array.from(start.tasks);
      const task = startTasks.find(t => t.id === draggableId);
      if (!task) return;

      startTasks.splice(source.index, 1);
      const updatedTask = { ...task, status: finish.id as Task['status'] };
      
      const finishTasks = Array.from(finish.tasks);
      finishTasks.splice(destination.index, 0, updatedTask);

      setColumns(prev => prev.map(col => {
        if (col.id === start.id) {
          return { ...col, tasks: startTasks };
        }
        if (col.id === finish.id) {
          return { ...col, tasks: finishTasks };
        }
        return col;
      }));

      // Task updated successfully in drag and drop
    }
  };

  const TaskCard = ({ task, index }: { task: Task; index: number }) => {
    const PriorityIcon = PRIORITY_ICONS[task.priority];
    const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0;
    const totalSubtasks = task.subtasks?.length || 0;
    const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

    return (
      <Draggable draggableId={task.id} index={index}>
        {(provided, snapshot) => (
          <Card
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`mb-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
              snapshot.isDragging ? 'shadow-lg rotate-2' : ''
            }`}
          >
            <CardContent className="p-4">
              {/* Priority and Actions */}
              <div className="flex items-start justify-between mb-2">
                <Badge className={`text-xs ${PRIORITY_COLORS[task.priority]}`}>
                  <PriorityIcon className="h-3 w-3 mr-1" />
                  {task.priority}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {
                      setSelectedTask(task);
                      setShowEditTask(true);
                    }}>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => {
                        // Delete task from columns
                        setColumns(prev => prev.map(col => ({
                          ...col,
                          tasks: col.tasks.filter(t => t.id !== task.id)
                        })));
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Task Title */}
              <h3 className="font-medium text-sm mb-2 line-clamp-2">{task.title}</h3>

              {/* Task Description */}
              {task.description && (
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{task.description}</p>
              )}

              {/* Subtasks Progress */}
              {totalSubtasks > 0 && (
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">Subtasks</span>
                    <span className="text-xs text-gray-500">{completedSubtasks}/{totalSubtasks}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Tags */}
              {task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {task.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs px-1.5 py-0.5">
                      {tag}
                    </Badge>
                  ))}
                  {task.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                      +{task.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {task.assignee && (
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {task.assignee.split(' ').map(n => n[0]).join('')}
                      </div>
                    </div>
                  )}
                  {task.dueDate && (
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  {task.comments && task.comments > 0 && (
                    <div className="flex items-center">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      {task.comments}
                    </div>
                  )}
                  {task.attachments && task.attachments > 0 && (
                    <div className="flex items-center">
                      <Paperclip className="h-3 w-3 mr-1" />
                      {task.attachments}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </Draggable>
    );
  };

  const KanbanView = () => (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex space-x-6 overflow-x-auto pb-6">
        {columns.map((column) => {
          const filteredTasks = getFilteredTasks(column.tasks);
          
          return (
            <div key={column.id} className="flex-shrink-0 w-80">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-700 flex items-center">
                    {column.title}
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {filteredTasks.length}
                    </Badge>
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedColumn(column.id);
                      setShowCreateTask(true);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[200px] p-3 rounded-lg border-2 border-dashed transition-colors ${
                        snapshot.isDraggingOver 
                          ? 'border-blue-400 bg-blue-50' 
                          : `${column.color}`
                      }`}
                    >
                      {filteredTasks.map((task, index) => (
                        <TaskCard key={task.id} task={task} index={index} />
                      ))}
                      {provided.placeholder}
                      
                      {filteredTasks.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                          <CheckCircle2 className="h-8 w-8 mb-2" />
                          <p className="text-sm">No tasks</p>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );

  const ListView = () => {
    const allTasks = columns.flatMap(column => 
      getFilteredTasks(column.tasks).map(task => ({ ...task, columnTitle: column.title }))
    );

    return (
      <div className="space-y-2">
        {allTasks.map((task) => {
          const PriorityIcon = PRIORITY_ICONS[task.priority];
          
          return (
            <Card key={task.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <Badge className={`text-xs ${PRIORITY_COLORS[task.priority]}`}>
                        <PriorityIcon className="h-3 w-3 mr-1" />
                        {task.priority}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {task.columnTitle}
                      </Badge>
                      <h3 className="font-medium text-sm truncate">{task.title}</h3>
                    </div>
                    {task.description && (
                      <p className="text-xs text-gray-500 mt-1 truncate">{task.description}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {task.assignee && (
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {task.assignee.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="ml-2 text-xs text-gray-500">{task.assignee}</span>
                      </div>
                    )}
                    
                    {task.dueDate && (
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setSelectedTask(task);
                          setShowEditTask(true);
                        }}>
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => {
                            // Delete task from columns
                            setColumns(prev => prev.map(col => ({
                              ...col,
                              tasks: col.tasks.filter(t => t.id !== task.id)
                            })));
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {allTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <CheckCircle2 className="h-12 w-12 mb-4" />
            <h3 className="text-lg font-medium mb-2">No tasks found</h3>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    );
  };

  if (activeView === 'categories') {
    return (
      <TaskCategoryManager 
        channelId={channelId}
        onCategoriesChange={(categories) => {
          console.log('Categories updated:', categories);
        }}
      />
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            {activeView === 'categories' && (
              <div className="flex items-center space-x-2 mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveView('board')}
                  className="text-gray-500 hover:text-gray-900"
                >
                  ← Back to Board
                </Button>
              </div>
            )}
            <h1 className="text-2xl font-bold text-gray-900">
              {activeView === 'categories' ? 'Task Categories' : 'Task Board'}
            </h1>
            <p className="text-gray-500">
              {activeView === 'categories' 
                ? 'Organize your workflow with custom categories' 
                : 'Manage your team\'s tasks and workflow'
              }
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('kanban')}
              >
                <Grid3X3 className="h-4 w-4 mr-2" />
                Kanban
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4 mr-2" />
                List
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setActiveView('categories')}
              >
                <Settings2 className="h-4 w-4 mr-2" />
                Manage Categories
              </Button>
              <Button onClick={() => setShowCreateTask(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterAssignee} onValueChange={setFilterAssignee}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignees</SelectItem>
              {getAllAssignees().map((assignee) => (
                <SelectItem key={assignee} value={assignee}>
                  {assignee}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Task Board Content */}
      <div className="flex-1 overflow-hidden">
        {activeView === 'categories' ? (
          <EnhancedTaskCategoryManager 
            channelId={selectedChannel || 'general'}
            onCategoriesChange={(cats) => {
              // Update categories and refresh tasks
              loadTasks();
            }}
            onBack={() => setActiveView('board')}
          />
        ) : (
          <ScrollArea className="h-full">
            <div className="p-6">
              {viewMode === 'kanban' ? <KanbanView /> : <ListView />}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Modals */}
      <CreateTaskModal
        isOpen={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        onSubmit={(task) => {
          const newTask = {
            ...task,
            id: Date.now().toString(),
            createdAt: new Date().toISOString().split('T')[0]
          };
          
          setColumns(prev => prev.map(col => 
            col.id === selectedColumn 
              ? { ...col, tasks: [...col.tasks, newTask] }
              : col
          ));
          
          onTaskCreate(task);
        }}
        initialStatus={selectedColumn as Task['status']}
      />

      <EditTaskModal
        isOpen={showEditTask}
        task={selectedTask}
        onClose={() => {
          setShowEditTask(false);
          setSelectedTask(null);
        }}
        onSubmit={(taskId, updates) => {
          setColumns(prev => prev.map(col => ({
            ...col,
            tasks: col.tasks.map(task => 
              task.id === taskId ? { ...task, ...updates } : task
            )
          })));
          
          onTaskUpdate(taskId, updates);
        }}
        onDelete={(taskId) => {
          setColumns(prev => prev.map(col => ({
            ...col,
            tasks: col.tasks.filter(task => task.id !== taskId)
          })));
          
          onTaskDelete(taskId);
          setShowEditTask(false);
          setSelectedTask(null);
        }}
      />
    </div>
  );
}