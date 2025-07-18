import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, BookOpen, Tag, Download, Edit3, Plus, Search, Filter, Share, Trash2, Star, Clock, User, Save, X, FolderPlus, Folder } from "lucide-react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface Document {
  id: number;
  title: string;
  content: string;
  category: string;
  tags: string[];
  lastModified: string;
  author: string;
  isStarred: boolean;
  isPublic: boolean;
  collaborators: string[];
  version: number;
  wordCount: number;
  folder?: string;
}

interface EnhancedDocumentSystemProps {
  workspaceName: string;
  documents: Document[];
  onDocumentsChange: (documents: Document[]) => void;
}

export function EnhancedDocumentSystem({ workspaceName, documents, onDocumentsChange }: EnhancedDocumentSystemProps) {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [documentSearchTerm, setDocumentSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedFolder, setSelectedFolder] = useState("All");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  
  // New document form
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocCategory, setNewDocCategory] = useState("");
  const [newDocFolder, setNewDocFolder] = useState("");
  const [newDocTags, setNewDocTags] = useState("");
  const [newFolderName, setNewFolderName] = useState("");

  const categories = ["General", "Technical", "Meetings", "Planning", "Legal", "Marketing", "Research", "Training"];
  const folders = [...new Set(documents.map(doc => doc.folder).filter(Boolean)), "General", "Archive"];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(documentSearchTerm.toLowerCase()) ||
                         doc.content.toLowerCase().includes(documentSearchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(documentSearchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || doc.category === selectedCategory;
    const matchesFolder = selectedFolder === "All" || doc.folder === selectedFolder;
    return matchesSearch && matchesCategory && matchesFolder;
  });

  const handleCreateDocument = () => {
    if (newDocTitle.trim()) {
      const newDoc: Document = {
        id: Date.now(),
        title: newDocTitle,
        content: "<p>Start writing your document here...</p>",
        category: newDocCategory || "General",
        tags: newDocTags.split(',').map(tag => tag.trim()).filter(tag => tag),
        lastModified: new Date().toISOString().split('T')[0],
        author: "Current User",
        isStarred: false,
        isPublic: false,
        collaborators: [],
        version: 1,
        wordCount: 0,
        folder: newDocFolder || undefined
      };
      
      onDocumentsChange([...documents, newDoc]);
      setSelectedDocument(newDoc);
      setIsEditing(true);
      setEditingDocument(newDoc);
      setShowCreateDialog(false);
      setNewDocTitle("");
      setNewDocCategory("");
      setNewDocFolder("");
      setNewDocTags("");
    }
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      // In a real app, you'd create the folder in the backend
      console.log('Creating folder:', newFolderName);
      setShowFolderDialog(false);
      setNewFolderName("");
    }
  };

  const handleEditDocument = (doc: Document) => {
    setEditingDocument({ ...doc });
    setIsEditing(true);
  };

  const handleSaveDocument = () => {
    if (editingDocument) {
      const wordCount = editingDocument.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
      const updatedDoc = {
        ...editingDocument,
        lastModified: new Date().toISOString().split('T')[0],
        wordCount,
        version: editingDocument.version + 1
      };
      
      onDocumentsChange(documents.map(d => d.id === updatedDoc.id ? updatedDoc : d));
      setSelectedDocument(updatedDoc);
      setIsEditing(false);
      setEditingDocument(null);
    }
  };

  const handleDeleteDocument = (docId: number) => {
    onDocumentsChange(documents.filter(d => d.id !== docId));
    if (selectedDocument?.id === docId) {
      setSelectedDocument(null);
    }
  };

  const handleStarDocument = (docId: number) => {
    onDocumentsChange(documents.map(d => 
      d.id === docId ? { ...d, isStarred: !d.isStarred } : d
    ));
  };

  const exportDocument = (doc: Document) => {
    const element = document.createElement("a");
    const file = new Blob([doc.content.replace(/<[^>]*>/g, '')], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${doc.title}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'bullet', 'indent',
    'link', 'image', 'video'
  ];

  return (
    <div className="flex-1 flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <FileText className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Documents</h2>
            <p className="text-muted-foreground">{workspaceName} workspace • {documents.length} documents</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={showFolderDialog} onOpenChange={setShowFolderDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <FolderPlus className="h-4 w-4 mr-1" />
                New Folder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="folderName">Folder Name</Label>
                  <Input
                    id="folderName"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Enter folder name..."
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowFolderDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateFolder}>
                    Create Folder
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Document</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Document Title</Label>
                  <Input
                    id="title"
                    value={newDocTitle}
                    onChange={(e) => setNewDocTitle(e.target.value)}
                    placeholder="Enter document title..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={newDocCategory} onValueChange={setNewDocCategory}>
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
                  <div>
                    <Label htmlFor="folder">Folder</Label>
                    <Select value={newDocFolder} onValueChange={setNewDocFolder}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select folder" />
                      </SelectTrigger>
                      <SelectContent>
                        {folders.map((folder) => (
                          <SelectItem key={folder} value={folder}>
                            {folder}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={newDocTags}
                    onChange={(e) => setNewDocTags(e.target.value)}
                    placeholder="tag1, tag2, tag3..."
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateDocument}>
                    Create Document
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex-1 flex gap-6">
        {/* Document List */}
        <div className="w-80">
          {/* Search and Filters */}
          <div className="space-y-3 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={documentSearchTerm}
                onChange={(e) => setDocumentSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Folders</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder} value={folder}>
                      <Folder className="h-3 w-3 mr-1 inline" />
                      {folder}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <ScrollArea className="h-[600px]">
            <div className="space-y-2">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className={`p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedDocument?.id === doc.id ? 'bg-muted border-blue-500' : ''
                  }`}
                  onClick={() => setSelectedDocument(doc)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate flex items-center">
                        {doc.isStarred && <Star className="h-3 w-3 text-yellow-500 mr-1 fill-current" />}
                        {doc.title}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {doc.category}
                        </Badge>
                        {doc.folder && (
                          <Badge variant="secondary" className="text-xs">
                            <Folder className="h-3 w-3 mr-1" />
                            {doc.folder}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStarDocument(doc.id);
                      }}
                    >
                      <Star className={`h-3 w-3 ${doc.isStarred ? 'text-yellow-500 fill-current' : 'text-muted-foreground'}`} />
                    </Button>
                  </div>
                  
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {doc.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                  </p>
                  
                  {doc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {doc.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {doc.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{doc.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>{doc.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{doc.lastModified}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Document Editor */}
        <div className="flex-1">
          {selectedDocument ? (
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4 pb-3 border-b">
                <div className="flex-1">
                  {isEditing ? (
                    <Input
                      value={editingDocument?.title || ''}
                      onChange={(e) => setEditingDocument(prev => prev ? { ...prev, title: e.target.value } : null)}
                      className="text-lg font-semibold border-0 p-0 focus-visible:ring-0"
                    />
                  ) : (
                    <h3 className="text-lg font-semibold">{selectedDocument.title}</h3>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                    <span>v{selectedDocument.version}</span>
                    <span>{selectedDocument.wordCount} words</span>
                    <span>Last modified: {selectedDocument.lastModified}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {isEditing ? (
                    <>
                      <Button onClick={handleSaveDocument} size="sm">
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" onClick={() => exportDocument(selectedDocument)}>
                        <Download className="h-4 w-4 mr-1" />
                        Export
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEditDocument(selectedDocument)}>
                        <Edit3 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteDocument(selectedDocument.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex-1 border rounded-lg overflow-hidden">
                {isEditing ? (
                  <ReactQuill
                    value={editingDocument?.content || ''}
                    onChange={(content) => setEditingDocument(prev => prev ? { ...prev, content } : null)}
                    modules={quillModules}
                    formats={quillFormats}
                    style={{ height: 'calc(100% - 42px)' }}
                    theme="snow"
                  />
                ) : (
                  <div 
                    className="w-full h-full p-4 overflow-y-auto prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedDocument.content }}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Select a document to view or edit</p>
                <p className="text-sm mt-1">Or create a new document to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}