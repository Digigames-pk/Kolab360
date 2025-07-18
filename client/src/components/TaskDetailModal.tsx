import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, User, Clock, Tag, Paperclip, MessageCircle, X, Edit3, Save, Plus } from "lucide-react";
import { format } from "date-fns";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  assignee: string;
  dueDate: Date | null;
  tags: string[];
  attachments: string[];
  comments: Array<{ id: string; author: string; content: string; timestamp: Date }>;
  subtasks: Array<{ id: string; title: string; completed: boolean }>;
}

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (task: Task) => void;
}

export function TaskDetailModal({ task, isOpen, onClose, onUpdate }: TaskDetailModalProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [newSubtask, setNewSubtask] = useState("");

  if (!task) return null;

  const currentTask = editingTask || task;

  const handleEdit = () => {
    setEditingTask({ ...task });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editingTask) {
      onUpdate(editingTask);
      setIsEditing(false);
      setEditingTask(null);
    }
  };

  const handleCancel = () => {
    setEditingTask(null);
    setIsEditing(false);
  };

  const addComment = () => {
    if (newComment.trim() && editingTask) {
      const comment = {
        id: Date.now().toString(),
        author: "Current User",
        content: newComment,
        timestamp: new Date()
      };
      setEditingTask({
        ...editingTask,
        comments: [...editingTask.comments, comment]
      });
      setNewComment("");
    }
  };

  const addSubtask = () => {
    if (newSubtask.trim() && editingTask) {
      const subtask = {
        id: Date.now().toString(),
        title: newSubtask,
        completed: false
      };
      setEditingTask({
        ...editingTask,
        subtasks: [...editingTask.subtasks, subtask]
      });
      setNewSubtask("");
    }
  };

  const toggleSubtask = (subtaskId: string) => {
    if (editingTask) {
      setEditingTask({
        ...editingTask,
        subtasks: editingTask.subtasks.map(st => 
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        )
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo": return "bg-gray-500";
      case "in-progress": return "bg-blue-500";
      case "done": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">
              {isEditing ? (
                <Input
                  value={currentTask.title}
                  onChange={(e) => setEditingTask(prev => prev ? { ...prev, title: e.target.value } : null)}
                  className="text-xl font-semibold border-0 p-0 focus-visible:ring-0"
                />
              ) : (
                currentTask.title
              )}
            </DialogTitle>
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} size="sm">
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button onClick={handleCancel} variant="outline" size="sm">
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={handleEdit} variant="outline" size="sm">
                  <Edit3 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="col-span-2 space-y-6">
            {/* Description */}
            <div>
              <h3 className="font-medium mb-2">Description</h3>
              {isEditing ? (
                <Textarea
                  value={currentTask.description}
                  onChange={(e) => setEditingTask(prev => prev ? { ...prev, description: e.target.value } : null)}
                  rows={4}
                  placeholder="Add a description..."
                />
              ) : (
                <p className="text-muted-foreground">{currentTask.description || "No description provided"}</p>
              )}
            </div>

            {/* Subtasks */}
            <div>
              <h3 className="font-medium mb-2">Subtasks ({currentTask.subtasks.filter(st => st.completed).length}/{currentTask.subtasks.length})</h3>
              <div className="space-y-2">
                {currentTask.subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={subtask.completed}
                      onChange={() => toggleSubtask(subtask.id)}
                      className="rounded"
                      disabled={!isEditing}
                    />
                    <span className={subtask.completed ? "line-through text-muted-foreground" : ""}>
                      {subtask.title}
                    </span>
                  </div>
                ))}
                {isEditing && (
                  <div className="flex items-center space-x-2">
                    <Input
                      value={newSubtask}
                      onChange={(e) => setNewSubtask(e.target.value)}
                      placeholder="Add subtask..."
                      onKeyPress={(e) => e.key === 'Enter' && addSubtask()}
                    />
                    <Button onClick={addSubtask} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Comments */}
            <div>
              <h3 className="font-medium mb-2">Comments ({currentTask.comments.length})</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {currentTask.comments.map((comment) => (
                  <div key={comment.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {comment.author.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{comment.author}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(comment.timestamp, "MMM d, h:mm a")}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                ))}
              </div>
              {isEditing && (
                <div className="flex items-center space-x-2 mt-3">
                  <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    onKeyPress={(e) => e.key === 'Enter' && addComment()}
                  />
                  <Button onClick={addComment} size="sm">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Status */}
            <div>
              <label className="text-sm font-medium">Status</label>
              {isEditing ? (
                <Select
                  value={currentTask.status}
                  onValueChange={(value: "todo" | "in-progress" | "done") => 
                    setEditingTask(prev => prev ? { ...prev, status: value } : null)
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge className={`mt-1 ${getStatusColor(currentTask.status)} text-white`}>
                  {currentTask.status.replace('-', ' ')}
                </Badge>
              )}
            </div>

            {/* Priority */}
            <div>
              <label className="text-sm font-medium">Priority</label>
              {isEditing ? (
                <Select
                  value={currentTask.priority}
                  onValueChange={(value: "low" | "medium" | "high") => 
                    setEditingTask(prev => prev ? { ...prev, priority: value } : null)
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge className={`mt-1 ${getPriorityColor(currentTask.priority)} text-white`}>
                  {currentTask.priority}
                </Badge>
              )}
            </div>

            {/* Assignee */}
            <div>
              <label className="text-sm font-medium">Assignee</label>
              <div className="flex items-center space-x-2 mt-1">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {currentTask.assignee.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{currentTask.assignee}</span>
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="text-sm font-medium">Due Date</label>
              {isEditing ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full mt-1 justify-start">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {currentTask.dueDate ? format(currentTask.dueDate, "PPP") : "Set due date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={currentTask.dueDate || undefined}
                      onSelect={(date) => setEditingTask(prev => prev ? { ...prev, dueDate: date || null } : null)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              ) : (
                <div className="flex items-center space-x-2 mt-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {currentTask.dueDate ? format(currentTask.dueDate, "PPP") : "No due date"}
                  </span>
                </div>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="text-sm font-medium">Tags</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {currentTask.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Attachments */}
            <div>
              <label className="text-sm font-medium">Attachments</label>
              <div className="space-y-1 mt-1">
                {currentTask.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                    <span className="text-blue-600 hover:underline cursor-pointer">{attachment}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}