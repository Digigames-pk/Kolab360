import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  X, 
  Calendar as CalendarIcon, 
  Tag, 
  User, 
  Flag, 
  MessageSquare,
  Paperclip,
  Clock,
  AlertCircle,
  Circle,
  CheckCircle2,
  Edit3,
  Trash2,
  Send
} from 'lucide-react';
import { format } from 'date-fns';

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
  comments?: { id: string; author: string; content: string; timestamp: string }[];
  attachments?: { id: string; name: string; url: string; type: string }[];
  createdAt: string;
}

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  initialStatus?: Task['status'];
}

interface EditTaskModalProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onSubmit: (taskId: string, updates: Partial<Task>) => void;
  onDelete?: (taskId: string) => void;
}

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', icon: Circle, color: 'text-gray-500' },
  { value: 'medium', label: 'Medium', icon: Clock, color: 'text-blue-500' },
  { value: 'high', label: 'High', icon: AlertCircle, color: 'text-orange-500' },
  { value: 'urgent', label: 'Urgent', icon: Flag, color: 'text-red-500' }
];

const STATUS_OPTIONS = [
  { value: 'todo', label: 'To Do', color: 'bg-gray-100 text-gray-700' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  { value: 'review', label: 'Review', color: 'bg-orange-100 text-orange-700' },
  { value: 'done', label: 'Done', color: 'bg-green-100 text-green-700' }
];

const ASSIGNEE_OPTIONS = [
  'Sarah Chen',
  'Alex Rodriguez', 
  'Emma Davis',
  'Michael Kim',
  'Lisa Wang',
  'David Brown'
];

export function CreateTaskModal({ isOpen, onClose, onSubmit, initialStatus = 'todo' }: CreateTaskModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: initialStatus,
    priority: 'medium' as Task['priority'],
    assignee: '',
    dueDate: undefined as Date | undefined,
    tags: [] as string[]
  });
  const [newTag, setNewTag] = useState('');
  const [subtasks, setSubtasks] = useState<{ title: string; completed: boolean }[]>([]);
  const [newSubtask, setNewSubtask] = useState('');

  const handleSubmit = () => {
    if (!formData.title.trim()) return;

    const task: Omit<Task, 'id' | 'createdAt'> = {
      title: formData.title,
      description: formData.description || undefined,
      status: formData.status,
      priority: formData.priority,
      assignee: formData.assignee || undefined,
      dueDate: formData.dueDate ? format(formData.dueDate, 'yyyy-MM-dd') : undefined,
      tags: formData.tags,
      subtasks: subtasks.length > 0 ? subtasks.map((st, index) => ({
        id: `st-${index}`,
        title: st.title,
        completed: st.completed
      })) : undefined,
      comments: [],
      attachments: []
    };

    onSubmit(task);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      status: initialStatus,
      priority: 'medium',
      assignee: '',
      dueDate: undefined,
      tags: []
    });
    setSubtasks([]);
    setNewTag('');
    setNewSubtask('');
    onClose();
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks(prev => [...prev, { title: newSubtask.trim(), completed: false }]);
      setNewSubtask('');
    }
  };

  const removeSubtask = (index: number) => {
    setSubtasks(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5 text-blue-600" />
            <span>Create New Task</span>
          </DialogTitle>
          <DialogDescription>
            Add a new task to your board with all the details your team needs.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-sm font-medium">Task Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter task title..."
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the task in detail..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1 min-h-[80px]"
                />
              </div>
            </div>

            <Separator />

            {/* Status and Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: Task['status']) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        <div className="flex items-center space-x-2">
                          <Badge className={`text-xs ${status.color}`}>
                            {status.label}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Priority</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value: Task['priority']) => setFormData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((priority) => {
                      const Icon = priority.icon;
                      return (
                        <SelectItem key={priority.value} value={priority.value}>
                          <div className="flex items-center space-x-2">
                            <Icon className={`h-4 w-4 ${priority.color}`} />
                            <span>{priority.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Assignee and Due Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Assignee</Label>
                <Select 
                  value={formData.assignee} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, assignee: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select assignee..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSIGNEE_OPTIONS.map((assignee) => (
                      <SelectItem key={assignee} value={assignee}>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                            {assignee.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span>{assignee}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="mt-1 w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dueDate ? format(formData.dueDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.dueDate}
                      onSelect={(date) => setFormData(prev => ({ ...prev, dueDate: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <Separator />

            {/* Tags */}
            <div>
              <Label className="text-sm font-medium">Tags</Label>
              <div className="mt-2">
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                      <span>{tag}</span>
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add a tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button onClick={addTag} variant="outline" size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Subtasks */}
            <div>
              <Label className="text-sm font-medium">Subtasks</Label>
              <div className="mt-2 space-y-2">
                {subtasks.map((subtask, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                    <Circle className="h-4 w-4 text-gray-400" />
                    <span className="flex-1 text-sm">{subtask.title}</span>
                    <button
                      onClick={() => removeSubtask(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add a subtask..."
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSubtask()}
                  />
                  <Button onClick={addSubtask} variant="outline" size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.title.trim()}>
            Create Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function EditTaskModal({ isOpen, task, onClose, onSubmit, onDelete }: EditTaskModalProps) {
  const [formData, setFormData] = useState<Partial<Task>>({});
  const [newComment, setNewComment] = useState('');

  React.useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignee: task.assignee,
        dueDate: task.dueDate,
        tags: [...(task.tags || [])],
        subtasks: [...(task.subtasks || [])],
        comments: [...(task.comments || [])],
        attachments: [...(task.attachments || [])]
      });
    }
  }, [task]);

  const handleSubmit = () => {
    if (!task || !formData.title?.trim()) return;
    onSubmit(task.id, formData);
    onClose();
  };

  const addComment = () => {
    if (!newComment.trim()) return;
    
    const comment = {
      id: `comment-${Date.now()}`,
      author: 'Current User',
      content: newComment.trim(),
      timestamp: new Date().toISOString()
    };

    setFormData(prev => ({
      ...prev,
      comments: [...(prev.comments || []), comment]
    }));
    setNewComment('');
  };

  const toggleSubtask = (subtaskId: string) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks?.map(st => 
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
      )
    }));
  };

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Edit3 className="h-5 w-5 text-blue-600" />
              <span>Edit Task</span>
            </div>
            {onDelete && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onDelete(task.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="col-span-2 space-y-4">
            <div>
              <Label htmlFor="edit-title" className="text-sm font-medium">Task Title</Label>
              <Input
                id="edit-title"
                value={formData.title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="edit-description" className="text-sm font-medium">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1 min-h-[100px]"
              />
            </div>

            {/* Subtasks */}
            {formData.subtasks && formData.subtasks.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Subtasks</Label>
                <div className="mt-2 space-y-2">
                  {formData.subtasks.map((subtask) => (
                    <div key={subtask.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                      <button 
                        onClick={() => toggleSubtask(subtask.id)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {subtask.completed ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <Circle className="h-4 w-4" />
                        )}
                      </button>
                      <span className={`flex-1 text-sm ${subtask.completed ? 'line-through text-gray-500' : ''}`}>
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comments */}
            <div>
              <Label className="text-sm font-medium">Comments</Label>
              <div className="mt-2">
                <ScrollArea className="h-32 w-full border rounded p-3 mb-3">
                  {formData.comments && formData.comments.length > 0 ? (
                    <div className="space-y-3">
                      {formData.comments.map((comment) => (
                        <div key={comment.id} className="text-sm">
                          <div className="flex items-center space-x-2 mb-1">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                              {comment.author.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="font-medium">{comment.author}</span>
                            <span className="text-gray-500 text-xs">
                              {format(new Date(comment.timestamp), 'MMM d, HH:mm')}
                            </span>
                          </div>
                          <p className="ml-8 text-gray-700">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No comments yet</p>
                  )}
                </ScrollArea>
                
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addComment()}
                  />
                  <Button onClick={addComment} size="sm">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4 space-y-4">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value: Task['status']) => setFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          <Badge className={`text-xs ${status.color}`}>
                            {status.label}
                          </Badge>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Priority</Label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(value: Task['priority']) => setFormData(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_OPTIONS.map((priority) => {
                        const Icon = priority.icon;
                        return (
                          <SelectItem key={priority.value} value={priority.value}>
                            <div className="flex items-center space-x-2">
                              <Icon className={`h-4 w-4 ${priority.color}`} />
                              <span>{priority.label}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Assignee</Label>
                  <Select 
                    value={formData.assignee || ''} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, assignee: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select assignee..." />
                    </SelectTrigger>
                    <SelectContent>
                      {ASSIGNEE_OPTIONS.map((assignee) => (
                        <SelectItem key={assignee} value={assignee}>
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                              {assignee.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span>{assignee}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.dueDate && (
                  <div>
                    <Label className="text-sm font-medium">Due Date</Label>
                    <div className="mt-1 flex items-center space-x-2 text-sm text-gray-600">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{format(new Date(formData.dueDate), 'PPP')}</span>
                    </div>
                  </div>
                )}

                {formData.tags && formData.tags.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Tags</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {formData.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.title?.trim()}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}