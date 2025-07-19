import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Save, X, Plus, Trash2 } from 'lucide-react';

interface Document {
  id: string;
  title: string;
  description?: string;
  content: string;
  category: string;
  tags: string[];
  author: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  size: number;
  fileType: 'document' | 'image' | 'video' | 'audio' | 'folder';
  isStarred: boolean;
  isPublic: boolean;
  downloadCount: number;
  version: number;
}

interface DocumentEditModalProps {
  isOpen: boolean;
  document?: Document | null;
  onClose: () => void;
  onSave: (doc: Partial<Document>) => void;
  categories: string[];
}

export function DocumentEditModal({ isOpen, document, onClose, onSave, categories }: DocumentEditModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category: '',
    tags: [] as string[],
    isPublic: false
  });
  const [newTag, setNewTag] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (document) {
      setFormData({
        title: document.title,
        description: document.description || '',
        content: document.content,
        category: document.category,
        tags: document.tags,
        isPublic: document.isPublic
      });
    } else {
      setFormData({
        title: '',
        description: '',
        content: '',
        category: categories[0] || '',
        tags: [],
        isPublic: false
      });
    }
  }, [document, categories]);

  const handleSave = () => {
    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Document title is required",
        variant: "destructive"
      });
      return;
    }

    if (!formData.content.trim()) {
      toast({
        title: "Validation Error", 
        description: "Document content is required",
        variant: "destructive"
      });
      return;
    }

    const docData = {
      ...formData,
      id: document?.id || Date.now().toString(),
      updatedAt: new Date().toISOString(),
      version: (document?.version || 0) + 1,
      size: new Blob([formData.content]).size
    };

    onSave(docData);
    toast({
      title: document ? "Document Updated" : "Document Created",
      description: `${formData.title} has been ${document ? 'updated' : 'created'} successfully`
    });
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>{document ? 'Edit Document' : 'Create New Document'}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter document title"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the document"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                  <span>{tag}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-red-100"
                    onClick={() => removeTag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex space-x-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button variant="outline" onClick={addTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Enter document content..."
              className="min-h-[300px] font-mono text-sm"
            />
            <div className="text-xs text-gray-500">
              Characters: {formData.content.length} | Words: {formData.content.split(/\s+/).filter(w => w).length}
            </div>
          </div>

          {/* Settings */}
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm">Make document public</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-500">
              {document && `Version ${document.version} • Last updated ${new Date(document.updatedAt).toLocaleDateString()}`}
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                {document ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}