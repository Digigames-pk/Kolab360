import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Folder, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Edit3, 
  Trash2, 
  Upload, 
  Tag, 
  Calendar,
  User,
  Star,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  Eye,
  Share2,
  BookOpen,
  FileImage,
  FileVideo,
  FileAudio,
  Archive
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

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

interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  documentCount: number;
  parentId?: string;
}

interface DocumentManagerProps {
  channelId?: string;
  workspaceId?: string;
}

const mockCategories: Category[] = [
  { id: '1', name: 'Project Documentation', color: 'bg-blue-100 text-blue-800', documentCount: 12 },
  { id: '2', name: 'Team Policies', color: 'bg-green-100 text-green-800', documentCount: 8 },
  { id: '3', name: 'Technical Specs', color: 'bg-purple-100 text-purple-800', documentCount: 15 },
  { id: '4', name: 'Meeting Notes', color: 'bg-orange-100 text-orange-800', documentCount: 25 },
  { id: '5', name: 'Templates', color: 'bg-pink-100 text-pink-800', documentCount: 6 },
];

const mockDocuments: Document[] = [
  {
    id: '1',
    title: 'API Design Guidelines',
    description: 'Comprehensive guide for designing RESTful APIs',
    content: 'This document outlines the best practices for API design...',
    category: 'Technical Specs',
    tags: ['API', 'Guidelines', 'REST'],
    author: { id: '1', name: 'John Doe', email: 'john@company.com' },
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-18T14:22:00Z',
    size: 25600,
    fileType: 'document',
    isStarred: true,
    isPublic: true,
    downloadCount: 45,
    version: 3
  },
  {
    id: '2',
    title: 'Team Onboarding Checklist',
    description: 'Step-by-step guide for new team members',
    content: 'Welcome to the team! This checklist will guide you...',
    category: 'Team Policies',
    tags: ['Onboarding', 'Checklist', 'HR'],
    author: { id: '2', name: 'Sarah Wilson', email: 'sarah@company.com' },
    createdAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-16T11:30:00Z',
    size: 18400,
    fileType: 'document',
    isStarred: false,
    isPublic: true,
    downloadCount: 78,
    version: 2
  },
  {
    id: '3',
    title: 'Q1 Planning Meeting Notes',
    description: 'Key decisions and action items from Q1 planning',
    content: 'Meeting Date: January 15, 2024\nAttendees: John, Sarah, Mike...',
    category: 'Meeting Notes',
    tags: ['Q1', 'Planning', 'Meeting'],
    author: { id: '3', name: 'Mike Chen', email: 'mike@company.com' },
    createdAt: '2024-01-15T15:45:00Z',
    updatedAt: '2024-01-15T16:30:00Z',
    size: 12800,
    fileType: 'document',
    isStarred: true,
    isPublic: false,
    downloadCount: 23,
    version: 1
  }
];

export function DocumentManager({ channelId, workspaceId }: DocumentManagerProps) {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'downloads'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [showCreateDoc, setShowCreateDoc] = useState(false);
  const { toast } = useToast();

  const filteredDocuments = documents.filter(doc => {
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    let compareValue = 0;
    switch (sortBy) {
      case 'name':
        compareValue = a.title.localeCompare(b.title);
        break;
      case 'date':
        compareValue = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
      case 'size':
        compareValue = a.size - b.size;
        break;
      case 'downloads':
        compareValue = a.downloadCount - b.downloadCount;
        break;
    }
    return sortOrder === 'asc' ? compareValue : -compareValue;
  });

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image': return FileImage;
      case 'video': return FileVideo;
      case 'audio': return FileAudio;
      case 'folder': return Folder;
      default: return FileText;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const DocumentCard = ({ doc }: { doc: Document }) => {
    const FileIcon = getFileIcon(doc.fileType);
    
    return (
      <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer" 
            onClick={() => setSelectedDoc(doc)}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <FileIcon className="h-5 w-5 text-blue-600" />
              <div className="flex items-center space-x-1">
                <h3 className="font-medium text-sm line-clamp-1">{doc.title}</h3>
                {doc.isStarred && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
                  <span className="sr-only">Options</span>
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={e => e.stopPropagation()}>
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={e => e.stopPropagation()}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={e => e.stopPropagation()}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem onClick={e => e.stopPropagation()}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <Separator />
                <DropdownMenuItem className="text-red-600" onClick={e => e.stopPropagation()}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-gray-600 line-clamp-2 mb-3">{doc.description}</p>
          <div className="flex flex-wrap gap-1 mb-3">
            {doc.tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs px-1.5 py-0.5">
                {tag}
              </Badge>
            ))}
            {doc.tags.length > 2 && (
              <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                +{doc.tags.length - 2}
              </Badge>
            )}
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-2">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-xs">
                  {doc.author.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span>{doc.author.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>{formatFileSize(doc.size)}</span>
              <span>•</span>
              <span>{formatDate(doc.updatedAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-semibold">Document Library</h2>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowCreateDoc(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Document
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="size">Size</SelectItem>
              <SelectItem value="downloads">Downloads</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
          </Button>

          <div className="flex border rounded-md">
            <Button 
              variant={viewMode === 'grid' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Categories */}
        <div className="w-64 border-r border-gray-200 p-4">
          <h3 className="font-medium mb-3">Categories</h3>
          <ScrollArea className="h-full">
            <div className="space-y-2">
              <Button 
                variant={selectedCategory === 'all' ? 'secondary' : 'ghost'} 
                className="w-full justify-start h-8"
                onClick={() => setSelectedCategory('all')}
              >
                <Archive className="h-4 w-4 mr-2" />
                All Documents
                <span className="ml-auto text-xs">{documents.length}</span>
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.name ? 'secondary' : 'ghost'}
                  className="w-full justify-start h-8"
                  onClick={() => setSelectedCategory(category.name)}
                >
                  <Folder className="h-4 w-4 mr-2" />
                  {category.name}
                  <span className="ml-auto text-xs">{category.documentCount}</span>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredDocuments.map((doc) => (
                <DocumentCard key={doc.id} doc={doc} />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDocuments.map((doc) => {
                const FileIcon = getFileIcon(doc.fileType);
                return (
                  <Card key={doc.id} className="hover:shadow-md transition-shadow cursor-pointer p-4"
                        onClick={() => setSelectedDoc(doc)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <FileIcon className="h-5 w-5 text-blue-600" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium truncate">{doc.title}</h3>
                            {doc.isStarred && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                          </div>
                          <p className="text-sm text-gray-600 truncate">{doc.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{doc.author.name}</span>
                        <span>{formatFileSize(doc.size)}</span>
                        <span>{formatDate(doc.updatedAt)}</span>
                        <span>{doc.downloadCount} downloads</span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Document Viewer Dialog */}
      {selectedDoc && (
        <Dialog open={!!selectedDoc} onOpenChange={() => setSelectedDoc(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>{selectedDoc.title}</span>
                {selectedDoc.isStarred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarFallback>
                      {selectedDoc.author.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedDoc.author.name}</p>
                    <p className="text-sm text-gray-600">
                      Updated {formatDate(selectedDoc.updatedAt)} • Version {selectedDoc.version}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {selectedDoc.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <Separator />
              
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{selectedDoc.content}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}