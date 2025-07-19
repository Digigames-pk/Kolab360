import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit3, Trash2, Save, X, Folder } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  documentCount: number;
  parentId?: string;
}

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onCategoriesChange: (categories: Category[]) => void;
}

const colorOptions = [
  'bg-blue-100 text-blue-800',
  'bg-green-100 text-green-800',
  'bg-purple-100 text-purple-800',
  'bg-orange-100 text-orange-800',
  'bg-pink-100 text-pink-800',
  'bg-red-100 text-red-800',
  'bg-yellow-100 text-yellow-800',
  'bg-indigo-100 text-indigo-800'
];

export function CategoryManagerModal({ isOpen, onClose, categories, onCategoriesChange }: CategoryManagerModalProps) {
  const [localCategories, setLocalCategories] = useState<Category[]>(categories);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
  const { toast } = useToast();

  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Validation Error",
        description: "Category name is required",
        variant: "destructive"
      });
      return;
    }

    const newCategory: Category = {
      id: Date.now().toString(),
      name: newCategoryName.trim(),
      description: newCategoryDescription.trim() || undefined,
      color: selectedColor,
      documentCount: 0
    };

    const updatedCategories = [...localCategories, newCategory];
    setLocalCategories(updatedCategories);
    setNewCategoryName('');
    setNewCategoryDescription('');
    setSelectedColor(colorOptions[0]);

    toast({
      title: "Category Added",
      description: `${newCategory.name} has been created successfully`
    });
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryDescription(category.description || '');
    setSelectedColor(category.color);
  };

  const handleUpdateCategory = () => {
    if (!editingCategory || !newCategoryName.trim()) return;

    const updatedCategories = localCategories.map(cat =>
      cat.id === editingCategory.id
        ? {
            ...cat,
            name: newCategoryName.trim(),
            description: newCategoryDescription.trim() || undefined,
            color: selectedColor
          }
        : cat
    );

    setLocalCategories(updatedCategories);
    setEditingCategory(null);
    setNewCategoryName('');
    setNewCategoryDescription('');
    setSelectedColor(colorOptions[0]);

    toast({
      title: "Category Updated",
      description: "Category has been updated successfully"
    });
  };

  const handleDeleteCategory = (categoryId: string) => {
    const category = localCategories.find(c => c.id === categoryId);
    if (!category) return;

    if (category.documentCount > 0) {
      toast({
        title: "Cannot Delete Category",
        description: "This category contains documents. Please move or delete them first.",
        variant: "destructive"
      });
      return;
    }

    const updatedCategories = localCategories.filter(c => c.id !== categoryId);
    setLocalCategories(updatedCategories);

    toast({
      title: "Category Deleted",
      description: `${category.name} has been deleted`
    });
  };

  const handleSave = () => {
    onCategoriesChange(localCategories);
    onClose();
    toast({
      title: "Categories Saved",
      description: "All category changes have been saved"
    });
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setNewCategoryName('');
    setNewCategoryDescription('');
    setSelectedColor(colorOptions[0]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Folder className="h-5 w-5" />
            <span>Manage Categories</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add/Edit Category Form */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-medium mb-4">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryName">Category Name *</Label>
                  <Input
                    id="categoryName"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Enter category name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="categoryDescription">Description</Label>
                  <Input
                    id="categoryDescription"
                    value={newCategoryDescription}
                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                    placeholder="Optional description"
                  />
                </div>
              </div>

              <div className="mt-4">
                <Label>Color Theme</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {colorOptions.map((color, index) => (
                    <button
                      key={index}
                      className={`px-3 py-1 rounded-full text-sm cursor-pointer border-2 transition-all ${
                        selectedColor === color 
                          ? 'border-gray-600 scale-110' 
                          : 'border-transparent hover:border-gray-300'
                      } ${color}`}
                      onClick={() => setSelectedColor(color)}
                    >
                      Sample
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2 mt-6">
                {editingCategory ? (
                  <>
                    <Button onClick={handleUpdateCategory}>
                      <Save className="h-4 w-4 mr-2" />
                      Update Category
                    </Button>
                    <Button variant="outline" onClick={cancelEdit}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleAddCategory}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Existing Categories */}
          <div>
            <h3 className="font-medium mb-4">Existing Categories ({localCategories.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {localCategories.map((category) => (
                <Card key={category.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={category.color}>
                        {category.name}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleEditCategory(category)}
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {category.description && (
                      <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{category.documentCount} documents</span>
                      <span>ID: {category.id}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {localCategories.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Folder className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No categories created yet</p>
                <p className="text-sm">Add your first category above</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-500">
              Changes will be applied when you save
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Categories
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}