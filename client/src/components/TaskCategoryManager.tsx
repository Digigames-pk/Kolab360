import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  GripVertical, 
  Palette, 
  Eye, 
  EyeOff,
  MoreHorizontal,
  Save,
  X,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface TaskCategory {
  id: string;
  name: string;
  color: string;
  description?: string;
  visible: boolean;
  order: number;
  taskCount: number;
  createdAt: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  categoryId: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: string;
  dueDate?: string;
  tags: string[];
  createdAt: string;
}

const COLOR_OPTIONS = [
  { name: 'Slate', value: 'slate', bg: 'bg-slate-500', text: 'text-slate-500' },
  { name: 'Blue', value: 'blue', bg: 'bg-blue-500', text: 'text-blue-500' },
  { name: 'Green', value: 'green', bg: 'bg-green-500', text: 'text-green-500' },
  { name: 'Orange', value: 'orange', bg: 'bg-orange-500', text: 'text-orange-500' },
  { name: 'Red', value: 'red', bg: 'bg-red-500', text: 'text-red-500' },
  { name: 'Purple', value: 'purple', bg: 'bg-purple-500', text: 'text-purple-500' },
  { name: 'Pink', value: 'pink', bg: 'bg-pink-500', text: 'text-pink-500' },
  { name: 'Indigo', value: 'indigo', bg: 'bg-indigo-500', text: 'text-indigo-500' },
];

interface TaskCategoryManagerProps {
  channelId: string;
  onCategoriesChange?: (categories: TaskCategory[]) => void;
}

export function TaskCategoryManager({ channelId, onCategoriesChange }: TaskCategoryManagerProps) {
  const [categories, setCategories] = useState<TaskCategory[]>([
    {
      id: 'todo',
      name: 'To Do',
      color: 'slate',
      description: 'Tasks that need to be started',
      visible: true,
      order: 0,
      taskCount: 3,
      createdAt: '2024-01-01'
    },
    {
      id: 'in-progress',
      name: 'In Progress',
      color: 'blue',
      description: 'Tasks currently being worked on',
      visible: true,
      order: 1,
      taskCount: 2,
      createdAt: '2024-01-01'
    },
    {
      id: 'review',
      name: 'Review',
      color: 'orange',
      description: 'Tasks pending review',
      visible: true,
      order: 2,
      taskCount: 1,
      createdAt: '2024-01-01'
    },
    {
      id: 'done',
      name: 'Done',
      color: 'green',
      description: 'Completed tasks',
      visible: true,
      order: 3,
      taskCount: 5,
      createdAt: '2024-01-01'
    }
  ]);

  const [editingCategory, setEditingCategory] = useState<TaskCategory | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: 'blue'
  });

  useEffect(() => {
    // Load categories from localStorage
    const savedCategories = localStorage.getItem(`categories-${channelId}`);
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }
  }, [channelId]);

  useEffect(() => {
    // Save categories to localStorage
    localStorage.setItem(`categories-${channelId}`, JSON.stringify(categories));
    onCategoriesChange?.(categories);
  }, [categories, channelId, onCategoriesChange]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newCategories = Array.from(categories);
    const [reorderedItem] = newCategories.splice(result.source.index, 1);
    newCategories.splice(result.destination.index, 0, reorderedItem);

    // Update order property
    const updatedCategories = newCategories.map((cat, index) => ({
      ...cat,
      order: index
    }));

    setCategories(updatedCategories);
  };

  const handleCreateCategory = () => {
    if (!formData.name.trim()) return;

    const newCategory: TaskCategory = {
      id: Date.now().toString(),
      name: formData.name,
      color: formData.color,
      description: formData.description || undefined,
      visible: true,
      order: categories.length,
      taskCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setCategories(prev => [...prev, newCategory]);
    setFormData({ name: '', description: '', color: 'blue' });
    setShowCreateDialog(false);
  };

  const handleEditCategory = (category: TaskCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color
    });
  };

  const handleSaveEdit = () => {
    if (!editingCategory || !formData.name.trim()) return;

    setCategories(prev => prev.map(cat => 
      cat.id === editingCategory.id 
        ? {
            ...cat,
            name: formData.name,
            description: formData.description || undefined,
            color: formData.color
          }
        : cat
    ));

    setEditingCategory(null);
    setFormData({ name: '', description: '', color: 'blue' });
  };

  const handleDeleteCategory = (categoryId: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    setShowDeleteDialog(null);
  };

  const toggleCategoryVisibility = (categoryId: string) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId ? { ...cat, visible: !cat.visible } : cat
    ));
  };

  const getColorClasses = (color: string, type: 'bg' | 'text' | 'border') => {
    const colorOption = COLOR_OPTIONS.find(c => c.value === color);
    if (!colorOption) return '';
    
    switch (type) {
      case 'bg':
        return colorOption.bg;
      case 'text':
        return colorOption.text;
      case 'border':
        return `border-${color}-200`;
      default:
        return '';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Task Categories</h1>
            <p className="text-gray-500">Organize your workflow with custom categories</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Category
          </Button>
        </div>
      </div>

      {/* Categories List */}
      <div className="flex-1 p-6">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="categories">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {categories
                  .sort((a, b) => a.order - b.order)
                  .map((category, index) => (
                  <Draggable key={category.id} draggableId={category.id} index={index}>
                    {(provided, snapshot) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`transition-all duration-200 ${
                          snapshot.isDragging ? 'shadow-lg rotate-1' : 'hover:shadow-md'
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab hover:cursor-grabbing text-gray-400"
                              >
                                <GripVertical className="h-5 w-5" />
                              </div>
                              
                              <div className={`w-4 h-4 rounded-full ${getColorClasses(category.color, 'bg')}`} />
                              
                              <div className="flex-1">
                                {editingCategory?.id === category.id ? (
                                  <div className="space-y-2">
                                    <Input
                                      value={formData.name}
                                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                      placeholder="Category name"
                                      className="font-medium"
                                    />
                                    <Input
                                      value={formData.description}
                                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                      placeholder="Description (optional)"
                                      className="text-sm"
                                    />
                                    <Select 
                                      value={formData.color} 
                                      onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}
                                    >
                                      <SelectTrigger className="w-32">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {COLOR_OPTIONS.map((color) => (
                                          <SelectItem key={color.value} value={color.value}>
                                            <div className="flex items-center space-x-2">
                                              <div className={`w-3 h-3 rounded-full ${color.bg}`} />
                                              <span>{color.name}</span>
                                            </div>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                ) : (
                                  <div>
                                    <h3 className="font-medium text-gray-900 flex items-center space-x-2">
                                      <span>{category.name}</span>
                                      {!category.visible && (
                                        <Badge variant="outline" className="text-xs">Hidden</Badge>
                                      )}
                                    </h3>
                                    {category.description && (
                                      <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                                    )}
                                  </div>
                                )}
                              </div>
                              
                              <Badge variant="secondary" className="ml-auto">
                                {category.taskCount} task{category.taskCount !== 1 ? 's' : ''}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {editingCategory?.id === category.id ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditingCategory(null)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" onClick={handleSaveEdit}>
                                    <Save className="h-4 w-4" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => toggleCategoryVisibility(category.id)}
                                  >
                                    {category.visible ? (
                                      <Eye className="h-4 w-4" />
                                    ) : (
                                      <EyeOff className="h-4 w-4" />
                                    )}
                                  </Button>
                                  
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button size="sm" variant="ghost">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                                        <Edit3 className="h-4 w-4 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        onClick={() => setShowDeleteDialog(category.id)}
                                        className="text-red-600"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {categories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <CheckCircle2 className="h-12 w-12 mb-4" />
            <h3 className="text-lg font-medium mb-2">No categories yet</h3>
            <p className="text-sm mb-4">Create your first category to organize tasks</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Category
            </Button>
          </div>
        )}
      </div>

      {/* Create Category Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>
              Add a new category to organize your tasks better.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Category Name *</Label>
              <Input
                id="name"
                placeholder="Enter category name..."
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="What tasks belong in this category?"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="color">Color</Label>
              <Select value={formData.color} onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COLOR_OPTIONS.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${color.bg}`} />
                        <span>{color.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCategory} disabled={!formData.name.trim()}>
              Create Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!showDeleteDialog} onOpenChange={() => setShowDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? This action cannot be undone.
              All tasks in this category will need to be moved to another category.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => showDeleteDialog && handleDeleteCategory(showDeleteDialog)}
            >
              Delete Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}