import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Filter, 
  Search, 
  MoreVertical, 
  Calendar, 
  Users, 
  Paperclip, 
  MessageSquare,
  Flag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap,
  Tag,
  Eye,
  Edit,
  Trash2,
  ArrowRight,
  BarChart3,
  List,
  Grid3X3,
  Star
} from "lucide-react";
import { motion, AnimatePresence, Reorder } from "framer-motion";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "review" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  assignee?: {
    name: string;
    avatar?: string;
  };
  dueDate?: Date;
  tags: string[];
  subtasks: {
    id: string;
    title: string;
    completed: boolean;
  }[];
  attachments: number;
  comments: number;
  progress: number;
  createdAt: Date;
}

const mockTasks: Task[] = [
  {
    id: "1",
    title: "Redesign landing page",
    description: "Create a modern, responsive landing page with better conversion rates",
    status: "in-progress",
    priority: "high",
    assignee: { name: "Alice Johnson" },
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
    tags: ["design", "frontend", "urgent"],
    subtasks: [
      { id: "1-1", title: "Research competitor designs", completed: true },
      { id: "1-2", title: "Create wireframes", completed: true },
      { id: "1-3", title: "Design mockups", completed: false },
      { id: "1-4", title: "Implement responsive layout", completed: false }
    ],
    attachments: 3,
    comments: 8,
    progress: 65,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2)
  },
  {
    id: "2",
    title: "API documentation update",
    description: "Update API docs for new authentication endpoints",
    status: "todo",
    priority: "medium",
    assignee: { name: "Bob Smith" },
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    tags: ["backend", "documentation"],
    subtasks: [
      { id: "2-1", title: "List all new endpoints", completed: false },
      { id: "2-2", title: "Write endpoint descriptions", completed: false },
      { id: "2-3", title: "Add code examples", completed: false }
    ],
    attachments: 1,
    comments: 2,
    progress: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24)
  },
  {
    id: "3",
    title: "User feedback analysis",
    description: "Analyze user feedback from last quarter and create actionable insights",
    status: "review",
    priority: "low",
    assignee: { name: "Carol Davis" },
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
    tags: ["analytics", "research"],
    subtasks: [
      { id: "3-1", title: "Collect feedback data", completed: true },
      { id: "3-2", title: "Categorize feedback", completed: true },
      { id: "3-3", title: "Create insights report", completed: true },
      { id: "3-4", title: "Present to stakeholders", completed: false }
    ],
    attachments: 2,
    comments: 5,
    progress: 85,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5)
  },
  {
    id: "4",
    title: "Performance optimization",
    description: "Optimize app performance for better user experience",
    status: "done",
    priority: "urgent",
    assignee: { name: "David Wilson" },
    dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24),
    tags: ["performance", "optimization", "frontend"],
    subtasks: [
      { id: "4-1", title: "Audit current performance", completed: true },
      { id: "4-2", title: "Implement lazy loading", completed: true },
      { id: "4-3", title: "Optimize images", completed: true },
      { id: "4-4", title: "Test performance gains", completed: true }
    ],
    attachments: 4,
    comments: 12,
    progress: 100,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10)
  }
];

export function StunningTaskBoard({ 
  selectedChannel, 
  workspaceName, 
  onTaskClick 
}: {
  selectedChannel: string | null;
  workspaceName: string;
  onTaskClick: (task: Task) => void;
}) {
  const [tasks, setTasks] = useState(mockTasks);
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterAssignee, setFilterAssignee] = useState("all");

  const statusColumns = [
    { id: "todo", title: "To Do", color: "bg-gray-500", tasks: tasks.filter(t => t.status === "todo") },
    { id: "in-progress", title: "In Progress", color: "bg-blue-500", tasks: tasks.filter(t => t.status === "in-progress") },
    { id: "review", title: "Review", color: "bg-yellow-500", tasks: tasks.filter(t => t.status === "review") },
    { id: "done", title: "Done", color: "bg-green-500", tasks: tasks.filter(t => t.status === "done") }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "text-red-600 bg-red-100 border-red-200 dark:bg-red-900 dark:text-red-300";
      case "high": return "text-orange-600 bg-orange-100 border-orange-200 dark:bg-orange-900 dark:text-orange-300";
      case "medium": return "text-yellow-600 bg-yellow-100 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300";
      case "low": return "text-green-600 bg-green-100 border-green-200 dark:bg-green-900 dark:text-green-300";
      default: return "text-gray-600 bg-gray-100 border-gray-200 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent": return <Zap className="h-3 w-3" />;
      case "high": return <Flag className="h-3 w-3" />;
      case "medium": return <AlertCircle className="h-3 w-3" />;
      case "low": return <Clock className="h-3 w-3" />;
      default: return null;
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = searchTerm === "" || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesPriority = filterPriority === "all" || task.priority === filterPriority;
    const matchesAssignee = filterAssignee === "all" || task.assignee?.name === filterAssignee;
    
    return matchesSearch && matchesPriority && matchesAssignee;
  });

  const TaskCard = ({ task, isDragging = false }: { task: Task; isDragging?: boolean }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2, boxShadow: "0 8px 25px rgba(0,0,0,0.15)" }}
      className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 cursor-pointer transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600 ${isDragging ? 'rotate-3 scale-105' : ''}`}
      onClick={() => onTaskClick(task)}
    >
      {/* Priority and Status */}
      <div className="flex items-center justify-between mb-3">
        <Badge className={`${getPriorityColor(task.priority)} text-xs px-2 py-1 flex items-center space-x-1`}>
          {getPriorityIcon(task.priority)}
          <span className="capitalize">{task.priority}</span>
        </Badge>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600">
            <Star className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600">
            <MoreVertical className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Task Title */}
      <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2 line-clamp-2">
        {task.title}
      </h3>

      {/* Task Description */}
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
        {task.description}
      </p>

      {/* Progress Bar */}
      {task.progress > 0 && (
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-500">Progress</span>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{task.progress}%</span>
          </div>
          <Progress value={task.progress} className="h-2" />
        </div>
      )}

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5">
              {tag}
            </Badge>
          ))}
          {task.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs px-2 py-0.5">
              +{task.tags.length - 3}
            </Badge>
          )}
        </div>
      )}

      {/* Due Date */}
      {task.dueDate && (
        <div className="flex items-center space-x-1 mb-3">
          <Calendar className="h-3 w-3 text-gray-400" />
          <span className="text-xs text-gray-500">
            {task.dueDate.toLocaleDateString()}
          </span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {task.attachments > 0 && (
            <div className="flex items-center space-x-1">
              <Paperclip className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500">{task.attachments}</span>
            </div>
          )}
          {task.comments > 0 && (
            <div className="flex items-center space-x-1">
              <MessageSquare className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500">{task.comments}</span>
            </div>
          )}
        </div>
        
        {task.assignee && (
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs">
              {task.assignee.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </motion.div>
  );

  const KanbanView = () => (
    <div className="flex space-x-6 overflow-x-auto pb-6">
      {statusColumns.map((column) => (
        <div key={column.id} className="flex-shrink-0 w-80">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${column.color}`} />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {column.title}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {column.tasks.filter(t => filteredTasks.includes(t)).length}
                </Badge>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Tasks */}
            <ScrollArea className="h-[calc(100vh-300px)]">
              <Reorder.Group 
                axis="y" 
                values={column.tasks.filter(t => filteredTasks.includes(t))}
                onReorder={() => {}}
                className="space-y-3"
              >
                <AnimatePresence>
                  {column.tasks
                    .filter(t => filteredTasks.includes(t))
                    .map((task) => (
                      <Reorder.Item key={task.id} value={task}>
                        <TaskCard task={task} />
                      </Reorder.Item>
                    ))}
                </AnimatePresence>
              </Reorder.Group>
            </ScrollArea>
          </div>
        </div>
      ))}
    </div>
  );

  const ListView = () => (
    <div className="space-y-2">
      {filteredTasks.map((task, index) => (
        <motion.div
          key={task.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer transition-all duration-200"
          onClick={() => onTaskClick(task)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <Badge className={`${getPriorityColor(task.priority)} text-xs px-2 py-1 flex items-center space-x-1`}>
                  {getPriorityIcon(task.priority)}
                  <span className="capitalize">{task.priority}</span>
                </Badge>
                <Badge variant="outline" className="text-xs capitalize">
                  {task.status.replace('-', ' ')}
                </Badge>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                  {task.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {task.description}
                </p>
              </div>

              <div className="flex items-center space-x-4 text-xs text-gray-500">
                {task.progress > 0 && (
                  <div className="flex items-center space-x-2">
                    <Progress value={task.progress} className="h-2 w-16" />
                    <span>{task.progress}%</span>
                  </div>
                )}
                
                {task.dueDate && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{task.dueDate.toLocaleDateString()}</span>
                  </div>
                )}

                <div className="flex items-center space-x-3">
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

                {task.assignee && (
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {task.assignee.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>

            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="h-full bg-gradient-to-br from-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Task Board
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedChannel ? `#${selectedChannel}` : workspaceName} • {filteredTasks.length} tasks
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <Button
                  variant={viewMode === "kanban" ? "default" : "ghost"}
                  size="sm"
                  className="h-8 px-3"
                  onClick={() => setViewMode("kanban")}
                >
                  <Grid3X3 className="h-4 w-4 mr-1" />
                  Kanban
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  className="h-8 px-3"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4 mr-1" />
                  List
                </Button>
              </div>
              
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white dark:bg-gray-800"
              />
            </div>
            
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-32 bg-white dark:bg-gray-800">
                <SelectValue />
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
              <SelectTrigger className="w-40 bg-white dark:bg-gray-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignees</SelectItem>
                <SelectItem value="Alice Johnson">Alice Johnson</SelectItem>
                <SelectItem value="Bob Smith">Bob Smith</SelectItem>
                <SelectItem value="Carol Davis">Carol Davis</SelectItem>
                <SelectItem value="David Wilson">David Wilson</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" className="bg-white dark:bg-gray-800">
              <Filter className="h-4 w-4 mr-2" />
              More
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {viewMode === "kanban" ? <KanbanView /> : <ListView />}
      </div>
    </div>
  );
}