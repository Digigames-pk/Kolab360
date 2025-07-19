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
  Save,
  X,
  CheckCircle2,
  ArrowLeft,
  Settings2
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

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

const COLOR_OPTIONS = [
  { name: 'Blue', value: 'blue', bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500' },
  { name: 'Green', value: 'green', bg: 'bg-green-500', text: 'text-green-500', border: 'border-green-500' },
  { name: 'Orange', value: 'orange', bg: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-500' },
  { name: 'Red', value: 'red', bg: 'bg-red-500', text: 'text-red-500', border: 'border-red-500' },
  { name: 'Purple', value: 'purple', bg: 'bg-purple-500', text: 'text-purple-500', border: 'border-purple-500' },
  { name: 'Pink', value: 'pink', bg: 'bg-pink-500', text: 'text-pink-500', border: 'border-pink-500' },
  { name: 'Indigo', value: 'indigo', bg: 'bg-indigo-500', text: 'text-indigo-500', border: 'border-indigo-500' },
  { name: 'Slate', value: 'slate', bg: 'bg-slate-500', text: 'text-slate-500', border: 'border-slate-500' },
];

const INITIAL_CATEGORIES: TaskCategory[] = [
  {
    id: 'todo',
    name: 'To Do',
    color: 'slate',
    description: 'Tasks that need to be started',
    visible: true,
    order: 0,
    taskCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'in-progress',
    name: 'In Progress',
    color: 'blue',
    description: 'Tasks currently being worked on',
    visible: true,
    order: 1,
    taskCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'review',
    name: 'Review',
    color: 'orange',
    description: 'Tasks pending review',
    visible: true,
    order: 2,
    taskCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'done',
    name: 'Done',
    color: 'green',
    description: 'Completed tasks',
    visible: true,
    order: 3,
    taskCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'development',
    name: 'Development',
    color: 'blue',
    description: 'Software development tasks',
    visible: true,
    order: 4,
    taskCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'design',
    name: 'Design',
    color: 'purple',
    description: 'UI/UX design tasks',
    visible: true,
    order: 5,
    taskCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'testing',
    name: 'Testing',
    color: 'green',
    description: 'QA and testing tasks',
    visible: true,
    order: 6,
    taskCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'documentation',
    name: 'Documentation',
    color: 'orange',
    description: 'Documentation tasks',
    visible: true,
    order: 7,
    taskCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'bug-fixes',
    name: 'Bug Fixes',
    color: 'red',
    description: 'Bug reports and fixes',
    visible: true,
    order: 8,
    taskCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'research',
    name: 'Research',
    color: 'indigo',
    description: 'Research and investigation',
    visible: true,
    order: 9,
    taskCount: 0,
    createdAt: new Date().toISOString()
  }
];

interface EnhancedTaskCategoryManagerProps {
  channelId: string;
  onCategoriesChange?: (categories: TaskCategory[]) => void;
  onBack?: () => void;
}

export function EnhancedTaskCategoryManager({ 
  channelId, 
  onCategoriesChange, 
  onBack 
}: EnhancedTaskCategoryManagerProps) {
  const [categories, setCategories] = useState<TaskCategory[]>(INITIAL_CATEGORIES);
  const [editingCategory, setEditingCategory] = useState<TaskCategory | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: 'blue'
  });
  const { toast } = useToast();

  useEffect(() => {
    // Load categories from localStorage
    const savedCategories = localStorage.getItem(`enhanced-categories-${channelId}`);
    if (savedCategories) {
      try {
        const parsed = JSON.parse(savedCategories);
        setCategories(parsed);
      } catch (error) {
        console.error('Error loading categories:', error);
        setCategories(INITIAL_CATEGORIES);
      }
    }
  }, [channelId]);

  useEffect(() => {
    // Save categories to localStorage
    localStorage.setItem(`enhanced-categories-${channelId}`, JSON.stringify(categories));
    onCategoriesChange?.(categories);
  }, [categories, channelId, onCategoriesChange]);

  // Handle drag and drop for categories
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
    toast({
      title: "Categories reordered",
      description: "Category order has been updated successfully",
    });
  };

  // Add new category
  const handleCreateCategory = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive",
      });
      return;
    }

    const newCategory: TaskCategory = {
      id: Date.now().toString(),
      name: formData.name,
      color: formData.color,
      description: formData.description || undefined,
      visible: true,
      order: categories.length,
      taskCount: 0,
      createdAt: new Date().toISOString()
    };

    setCategories(prev => [...prev, newCategory]);
    setFormData({ name: '', description: '', color: 'blue' });
    setShowCreateDialog(false);
    toast({
      title: "Category created",
      description: `"${newCategory.name}" has been added successfully`,
    });
  };

  // Edit category
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
    toast({
      title: "Category updated",
      description: `"${formData.name}" has been updated successfully`,
    });
  };

  // Delete category
  const handleDeleteCategory = (categoryId: string) => {
    const categoryToDelete = categories.find(cat => cat.id === categoryId);
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    setShowDeleteDialog(null);
    
    toast({
      title: "Category deleted",
      description: `"${categoryToDelete?.name}" has been removed`,
    });
  };

  // Toggle category visibility
  const toggleCategoryVisibility = (categoryId: string) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId ? { ...cat, visible: !cat.visible } : cat
    ));
  };

  const getColorClasses = (color: string) => {
    const colorOption = COLOR_OPTIONS.find(c => c.value === color);
    return colorOption || COLOR_OPTIONS[0];
  };

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-6 h-full">
        <div className="flex flex-col h-full space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {onBack && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onBack}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Board</span>
                </Button>
              )}
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Task Categories
                </h1>
                <p className="text-muted-foreground">
                  Organize your workflow with custom categories • {categories.length} categories
                </p>
              </div>
            </div>
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>

          {/* Categories List */}
          <div className="flex-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings2 className="h-5 w-5" />
                  <span>Manage Categories</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="categories">
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`space-y-2 min-h-[200px] p-4 rounded-lg border-2 border-dashed transition-colors ${
                          snapshot.isDraggingOver 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        {categories.map((category, index) => {
                          const colorClasses = getColorClasses(category.color);
                          return (
                            <Draggable 
                              key={category.id} 
                              draggableId={category.id} 
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`p-4 bg-white dark:bg-slate-800 rounded-lg border shadow-sm transition-all ${
                                    snapshot.isDragging 
                                      ? 'shadow-lg rotate-2 scale-105' 
                                      : 'hover:shadow-md'
                                  } ${colorClasses.border} border-l-4`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <div
                                        {...provided.dragHandleProps}
                                        className="cursor-grab active:cursor-grabbing"
                                      >
                                        <GripVertical className="h-5 w-5 text-gray-400" />
                                      </div>
                                      
                                      <div className={`w-3 h-3 rounded-full ${colorClasses.bg}`} />
                                      
                                      <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                          {category.name}
                                        </h3>
                                        {category.description && (
                                          <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {category.description}
                                          </p>
                                        )}
                                      </div>
                                      
                                      <Badge variant="secondary" className="ml-2">
                                        {category.taskCount} tasks
                                      </Badge>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleCategoryVisibility(category.id)}
                                        className="text-gray-400 hover:text-gray-600"
                                      >
                                        {category.visible ? (
                                          <Eye className="h-4 w-4" />
                                        ) : (
                                          <EyeOff className="h-4 w-4" />
                                        )}
                                      </Button>
                                      
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditCategory(category)}
                                        className="text-gray-400 hover:text-blue-600"
                                      >
                                        <Edit3 className="h-4 w-4" />
                                      </Button>
                                      
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowDeleteDialog(category.id)}
                                        className="text-gray-400 hover:text-red-600"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                        
                        {categories.length === 0 && (
                          <div className="text-center py-12">
                            <div className="text-gray-400 mb-4">
                              <Settings2 className="h-12 w-12 mx-auto mb-2" />
                              <p>No categories yet</p>
                              <p className="text-sm">Create your first category to get started</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Create Category Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>
              Add a new category to organize your tasks
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Development, Design, Testing"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of this category"
              />
            </div>
            
            <div>
              <Label htmlFor="color">Color</Label>
              <Select 
                value={formData.color} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COLOR_OPTIONS.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center space-x-2">
                        <div className={`w-4 h-4 rounded-full ${color.bg}`} />
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
            <Button onClick={handleCreateCategory}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Create Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Modify the category details
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="editName">Category Name</Label>
              <Input
                id="editName"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Category name"
              />
            </div>
            
            <div>
              <Label htmlFor="editDescription">Description</Label>
              <Input
                id="editDescription"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description"
              />
            </div>
            
            <div>
              <Label htmlFor="editColor">Color</Label>
              <Select 
                value={formData.color} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COLOR_OPTIONS.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center space-x-2">
                        <div className={`w-4 h-4 rounded-full ${color.bg}`} />
                        <span>{color.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCategory(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
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
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}