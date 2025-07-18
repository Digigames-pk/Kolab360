import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, MoreHorizontal, User, Calendar, Flag, CheckCircle2, Circle, Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "review" | "done";
  priority: "low" | "medium" | "high";
  assignee?: string;
  dueDate?: string;
  createdAt: string;
}

const statusConfig = {
  todo: { label: "To Do", icon: Circle, color: "bg-gray-500" },
  "in-progress": { label: "In Progress", icon: Clock, color: "bg-blue-500" },
  review: { label: "Review", icon: CheckCircle2, color: "bg-yellow-500" },
  done: { label: "Done", icon: CheckCircle2, color: "bg-green-500" }
};

const priorityColors = {
  low: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200", 
  high: "bg-red-100 text-red-800 border-red-200"
};

export function TaskBoard({ channelId }: { channelId: string }) {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Design new homepage layout",
      description: "Create wireframes and mockups for the updated homepage",
      status: "in-progress",
      priority: "high",
      assignee: "John Doe",
      dueDate: "2025-01-25",
      createdAt: "2025-01-18"
    },
    {
      id: "2", 
      title: "Fix login validation bug",
      status: "todo",
      priority: "medium",
      assignee: "Jane Smith",
      createdAt: "2025-01-18"
    },
    {
      id: "3",
      title: "Update documentation",
      description: "Review and update API documentation",
      status: "review",
      priority: "low",
      createdAt: "2025-01-17"
    }
  ]);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as const,
    assignee: "",
    dueDate: ""
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const addTask = () => {
    if (newTask.title.trim()) {
      const task: Task = {
        id: Date.now().toString(),
        title: newTask.title,
        description: newTask.description || undefined,
        status: "todo",
        priority: newTask.priority,
        assignee: newTask.assignee || undefined,
        dueDate: newTask.dueDate || undefined,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setTasks([...tasks, task]);
      setNewTask({ title: "", description: "", priority: "medium", assignee: "", dueDate: "" });
      setIsDialogOpen(false);
    }
  };

  const updateTaskStatus = (taskId: string, status: Task['status']) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status } : task
    ));
  };

  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter(task => task.status === status);
  };

  const TaskCard = ({ task }: { task: Task }) => {
    const StatusIcon = statusConfig[task.status].icon;
    
    return (
      <div className="bg-background border border-border rounded-lg p-4 space-y-3 hover:shadow-sm transition-shadow">
        <div className="flex items-start justify-between">
          <h4 className="font-medium text-sm leading-tight">{task.title}</h4>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-1" align="start">
              <div className="space-y-1">
                {Object.entries(statusConfig).map(([status, config]) => (
                  <Button
                    key={status}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-8"
                    onClick={() => updateTaskStatus(task.id, status as Task['status'])}
                  >
                    <config.icon className="h-3 w-3 mr-2" />
                    {config.label}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        {task.description && (
          <p className="text-xs text-muted-foreground">{task.description}</p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className={`text-xs ${priorityColors[task.priority]}`}>
              <Flag className="h-2 w-2 mr-1" />
              {task.priority}
            </Badge>
            {task.assignee && (
              <Badge variant="outline" className="text-xs">
                <User className="h-2 w-2 mr-1" />
                {task.assignee.split(' ')[0]}
              </Badge>
            )}
          </div>
          {task.dueDate && (
            <Badge variant="outline" className="text-xs">
              <Calendar className="h-2 w-2 mr-1" />
              {new Date(task.dueDate).toLocaleDateString()}
            </Badge>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold text-lg">Task Board</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Task title"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Optional description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select value={newTask.priority} onValueChange={(value: any) => setNewTask({ ...newTask, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Due Date</label>
                  <Input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Assignee</label>
                <Input
                  value={newTask.assignee}
                  onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                  placeholder="Assign to team member"
                />
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={addTask} className="flex-1">
                  Create Task
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 p-4">
        <div className="grid grid-cols-4 gap-4 h-full">
          {Object.entries(statusConfig).map(([status, config]) => {
            const statusTasks = getTasksByStatus(status as Task['status']);
            return (
              <div key={status} className="flex flex-col space-y-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${config.color}`} />
                  <h4 className="font-medium text-sm">{config.label}</h4>
                  <Badge variant="secondary" className="text-xs">
                    {statusTasks.length}
                  </Badge>
                </div>
                <div className="space-y-3 flex-1">
                  {statusTasks.map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}