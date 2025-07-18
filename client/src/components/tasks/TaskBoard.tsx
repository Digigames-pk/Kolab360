import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { formatDistanceToNow } from "date-fns";
import { 
  Plus, 
  Calendar, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  MoreVertical,
  Edit,
  Trash2,
  Users
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  assignedTo: string | null;
  createdBy: string;
  workspaceId: string;
  channelId: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  assignedUser?: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
  };
  creator: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
  };
}

interface Member {
  id: string;
  workspaceId: string;
  userId: string;
  role: string;
  joinedAt: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
    createdAt: string;
    updatedAt: string;
  };
}

interface TaskBoardProps {
  workspaceId: string;
  members: Member[];
}

export default function TaskBoard({ workspaceId, members }: TaskBoardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as Task["priority"],
    assignedTo: "",
    dueDate: "",
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["/api/workspaces", workspaceId, "tasks"],
    enabled: !!workspaceId,
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      const response = await apiRequest("POST", "/api/tasks", {
        ...taskData,
        workspaceId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workspaces", workspaceId, "tasks"] });
      setShowCreateTask(false);
      setNewTask({
        title: "",
        description: "",
        priority: "medium",
        assignedTo: "",
        dueDate: "",
      });
      toast({
        title: "Success",
        description: "Task created successfully!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: any }) => {
      const response = await apiRequest("PUT", `/api/tasks/${taskId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workspaces", workspaceId, "tasks"] });
      setEditingTask(null);
      toast({
        title: "Success",
        description: "Task updated successfully!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await apiRequest("DELETE", `/api/tasks/${taskId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workspaces", workspaceId, "tasks"] });
      toast({
        title: "Success",
        description: "Task deleted successfully!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getUserDisplayName = (user: any) => {
    return user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || user.email;
  };

  const getUserInitials = (user: any) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.firstName) {
      return user.firstName[0].toUpperCase();
    }
    return user.email[0].toUpperCase();
  };

  const handleCreateTask = () => {
    if (!newTask.title.trim()) {
      toast({
        title: "Error",
        description: "Task title is required.",
        variant: "destructive",
      });
      return;
    }

    createTaskMutation.mutate({
      title: newTask.title.trim(),
      description: newTask.description.trim() || null,
      priority: newTask.priority,
      status: "todo",
      assignedTo: newTask.assignedTo || null,
      dueDate: newTask.dueDate ? new Date(newTask.dueDate).toISOString() : null,
    });
  };

  const handleStatusChange = (task: Task, newStatus: Task["status"]) => {
    updateTaskMutation.mutate({
      taskId: task.id,
      updates: { status: newStatus },
    });
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate(taskId);
    }
  };

  const getTasksByStatus = (status: Task["status"]) => {
    return tasks?.filter((task: Task) => task.status === status) || [];
  };

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "border-red-500 text-red-400";
      case "medium":
        return "border-yellow-500 text-yellow-400";
      case "low":
        return "border-green-500 text-green-400";
      default:
        return "border-gray-500 text-gray-400";
    }
  };

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "todo":
        return <Clock className="h-4 w-4 text-gray-400" />;
      case "in_progress":
        return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      case "done":
        return <CheckCircle2 className="h-4 w-4 text-green-400" />;
    }
  };

  const getStatusTitle = (status: Task["status"]) => {
    switch (status) {
      case "todo":
        return "To Do";
      case "in_progress":
        return "In Progress";
      case "done":
        return "Done";
    }
  };

  const TaskCard = ({ task }: { task: Task }) => (
    <Card className="glassmorphism border-white/10 mb-3 hover:shadow-lg transition-all cursor-pointer group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h4 className="text-white font-medium text-sm leading-tight flex-1 pr-2">
            {task.title}
          </h4>
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-gray-400 hover:text-white"
              onClick={() => setEditingTask(task)}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-gray-400 hover:text-red-400"
              onClick={() => handleDeleteTask(task.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {task.description && (
          <p className="text-gray-400 text-xs mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex items-center justify-between mb-3">
          <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </Badge>
          
          {task.dueDate && (
            <div className="flex items-center space-x-1 text-gray-400 text-xs">
              <Calendar className="h-3 w-3" />
              <span>{formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {task.assignedUser ? (
              <div className="flex items-center space-x-1">
                {task.assignedUser.profileImageUrl ? (
                  <img
                    src={task.assignedUser.profileImageUrl}
                    alt={getUserDisplayName(task.assignedUser)}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {getUserInitials(task.assignedUser)}
                    </span>
                  </div>
                )}
                <span className="text-gray-400 text-xs">
                  {getUserDisplayName(task.assignedUser)}
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-gray-500">
                <User className="h-3 w-3" />
                <span className="text-xs">Unassigned</span>
              </div>
            )}
          </div>

          <div className="flex space-x-1">
            {task.status !== "todo" && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-gray-400 hover:text-white"
                onClick={() => handleStatusChange(task, "todo")}
              >
                To Do
              </Button>
            )}
            {task.status !== "in_progress" && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-gray-400 hover:text-white"
                onClick={() => handleStatusChange(task, "in_progress")}
              >
                In Progress
              </Button>
            )}
            {task.status !== "done" && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-gray-400 hover:text-white"
                onClick={() => handleStatusChange(task, "done")}
              >
                Done
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const StatusColumn = ({ status }: { status: Task["status"] }) => (
    <div className="flex-1 min-w-0">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getStatusIcon(status)}
          <h3 className="text-white font-semibold">{getStatusTitle(status)}</h3>
          <Badge variant="secondary" className="bg-gray-700 text-gray-300">
            {getTasksByStatus(status).length}
          </Badge>
        </div>
      </div>
      
      <div className="space-y-3">
        {getTasksByStatus(status).map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
        
        {getTasksByStatus(status).length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="w-12 h-12 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-2">
              {getStatusIcon(status)}
            </div>
            <p className="text-sm">No tasks yet</p>
          </div>
        )}
      </div>
    </div>
  );

  if (tasksLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner size="lg" className="text-white" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Task Board</h2>
            <p className="text-gray-400">Manage your team's tasks and track progress</p>
          </div>
          
          <Dialog open={showCreateTask} onOpenChange={setShowCreateTask}>
            <DialogTrigger asChild>
              <Button className="gradient-bg">
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="glassmorphism-dark border-white/10 max-w-md">
              <DialogHeader>
                <DialogTitle className="text-white">Create New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-gray-300">Title</Label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Enter task title"
                    className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="text-gray-300">Description</Label>
                  <Textarea
                    id="description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Enter task description"
                    className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority" className="text-gray-300">Priority</Label>
                    <Select value={newTask.priority} onValueChange={(value) => setNewTask({ ...newTask, priority: value as Task["priority"] })}>
                      <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="assignedTo" className="text-gray-300">Assign to</Label>
                    <Select value={newTask.assignedTo} onValueChange={(value) => setNewTask({ ...newTask, assignedTo: value })}>
                      <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                        <SelectValue placeholder="Select member" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="">Unassigned</SelectItem>
                        {members.map((member) => (
                          <SelectItem key={member.userId} value={member.userId}>
                            {getUserDisplayName(member.user)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="dueDate" className="text-gray-300">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="bg-gray-700/50 border-gray-600 text-white"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateTask(false)}
                    className="border-gray-600 text-gray-300 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateTask}
                    disabled={createTaskMutation.isPending}
                    className="gradient-bg"
                  >
                    {createTaskMutation.isPending ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : null}
                    Create Task
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Task Board */}
      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
          <StatusColumn status="todo" />
          <StatusColumn status="in_progress" />
          <StatusColumn status="done" />
        </div>
      </div>
    </div>
  );
}
