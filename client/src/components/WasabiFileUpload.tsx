import React, { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  File, 
  Image, 
  Video, 
  FileText, 
  Download,
  Trash2,
  Search,
  Filter,
  X,
  Paperclip,
  FolderOpen,
  Calendar,
  User,
  FileImage,
  FileVideo,
  FileAudio,
  Music
} from "lucide-react";

interface FileData {
  id: string;
  filename: string;
  originalName: string;
  downloadUrl: string;
  mimeType: string;
  category: 'document' | 'image' | 'video' | 'audio' | 'other';
  size: number;
  downloadCount: number;
  uploadedBy: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  uploadedAt: string;
}

interface WasabiFileUploadProps {
  channelId?: string;
  workspaceId?: string;
  onFileUpload?: (files: FileData[]) => void;
  onFileClick?: (file: FileData) => void;
  maxFiles?: number;
  allowedTypes?: string[];
  maxSizeMB?: number;
}

export function WasabiFileUpload({ 
  channelId, 
  workspaceId, 
  onFileUpload, 
  onFileClick,
  maxFiles = 10,
  allowedTypes,
  maxSizeMB = 100
}: WasabiFileUploadProps) {
  const [files, setFiles] = useState<FileData[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Load files on component mount
  useEffect(() => {
    loadFiles();
  }, [channelId, workspaceId, selectedCategory]);

  const loadFiles = async () => {
    try {
      const params = new URLSearchParams();
      if (workspaceId) params.append('workspaceId', workspaceId);
      if (channelId) params.append('channelId', channelId);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);

      const response = await fetch(`/api/simple-files?${params}`);
      if (response.ok) {
        const data = await response.json();
        setFiles(data || []);
      }
    } catch (error) {
      console.error('Failed to load files:', error);
    }
  };

  const uploadFiles = async (fileList: FileList) => {
    if (!fileList.length) return;

    if (fileList.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} files allowed`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      const validFiles: File[] = [];

      // Validate files
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        
        // Check file size
        if (file.size > maxSizeMB * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} exceeds ${maxSizeMB}MB limit`,
            variant: "destructive",
          });
          continue;
        }

        // Check file type
        if (allowedTypes && !allowedTypes.some(type => 
          type.endsWith('/*') ? file.type.startsWith(type.slice(0, -1)) : file.type === type
        )) {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not an allowed file type`,
            variant: "destructive",
          });
          continue;
        }

        validFiles.push(file);
      }

      if (validFiles.length === 0) {
        setUploading(false);
        return;
      }

      // Upload files
      if (validFiles.length === 1) {
        formData.append('file', validFiles[0]);
        if (workspaceId) formData.append('workspaceId', workspaceId);
        if (channelId) formData.append('channelId', channelId);

        const response = await fetch('/api/simple-files/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          const newFiles = [data.file];
          setFiles(prev => [data.file, ...prev]);
          onFileUpload?.(newFiles);
          toast({
            title: "File uploaded",
            description: `${data.file.originalName} uploaded successfully`,
          });
        } else {
          throw new Error('Upload failed');
        }
      } else {
        // Upload files one by one to the simple-files endpoint
        const uploadedFiles = [];
        for (const file of validFiles) {
          const singleFormData = new FormData();
          singleFormData.append('file', file);
          if (workspaceId) singleFormData.append('workspaceId', workspaceId);
          if (channelId) singleFormData.append('channelId', channelId);

          const response = await fetch('/api/simple-files/upload', {
            method: 'POST',
            body: singleFormData,
          });

          if (response.ok) {
            const fileData = await response.json();
            uploadedFiles.push(fileData);
          } else {
            console.error(`Failed to upload ${file.name}`);
          }
        }

        if (uploadedFiles.length > 0) {
          setFiles(prev => [...uploadedFiles, ...prev]);
          onFileUpload?.(uploadedFiles);
          toast({
            title: "Files uploaded",
            description: `${uploadedFiles.length} of ${validFiles.length} files uploaded successfully`,
          });
        } else {
          throw new Error('All uploads failed');
        }
      }

      setUploadProgress(100);
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      uploadFiles(e.target.files);
    }
  };

  const deleteFile = async (fileId: string) => {
    try {
      const response = await fetch(`/api/simple-files/${fileId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFiles(prev => prev.filter(f => f.id !== fileId));
        toast({
          title: "File deleted",
          description: "File deleted successfully",
        });
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete file",
        variant: "destructive",
      });
    }
  };

  const getFileIcon = (mimeType: string, category: string) => {
    if (category === 'image') return <FileImage className="h-5 w-5 text-blue-500" />;
    if (category === 'video') return <FileVideo className="h-5 w-5 text-purple-500" />;
    if (category === 'audio') return <FileAudio className="h-5 w-5 text-green-500" />;
    if (category === 'document') return <FileText className="h-5 w-5 text-orange-500" />;
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.uploadedBy.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.uploadedBy.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryCount = (category: string) => {
    return files.filter(f => f.category === category).length;
  };

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-6 h-full">
        <div className="flex flex-col h-full space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                File Management
              </h1>
              <p className="text-muted-foreground">
                {channelId ? `Channel: #${channelId}` : workspaceId ? 'Workspace Files' : 'All Files'} • {files.length} total files
              </p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload Files</TabsTrigger>
              <TabsTrigger value="browse">Browse Files</TabsTrigger>
            </TabsList>

            {/* Upload Tab */}
            <TabsContent value="upload" className="flex-1">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Upload className="h-5 w-5" />
                    <span>Upload Files</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragActive 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileInput}
                      className="hidden"
                      accept={allowedTypes?.join(',')}
                    />
                    
                    <div className="space-y-4">
                      <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full flex items-center justify-center">
                        <Upload className="h-8 w-8 text-purple-600" />
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold">Drop files here or click to browse</h3>
                        <p className="text-muted-foreground">
                          Maximum {maxFiles} files, {maxSizeMB}MB each
                        </p>
                        {allowedTypes && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Allowed: {allowedTypes.join(', ')}
                          </p>
                        )}
                      </div>
                      
                      <Button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="bg-gradient-to-r from-purple-500 to-blue-500"
                      >
                        <Paperclip className="h-4 w-4 mr-2" />
                        Choose Files
                      </Button>
                    </div>

                    {uploading && (
                      <div className="absolute inset-0 bg-white/80 dark:bg-black/80 rounded-lg flex items-center justify-center">
                        <div className="text-center space-y-2">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                          <p className="text-sm font-medium">Uploading...</p>
                          <Progress value={uploadProgress} className="w-32" />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Browse Tab */}
            <TabsContent value="browse" className="flex-1 flex flex-col space-y-4">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('all')}
                  >
                    All ({files.length})
                  </Button>
                  <Button
                    variant={selectedCategory === 'document' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('document')}
                  >
                    Docs ({getCategoryCount('document')})
                  </Button>
                  <Button
                    variant={selectedCategory === 'image' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('image')}
                  >
                    Images ({getCategoryCount('image')})
                  </Button>
                  <Button
                    variant={selectedCategory === 'video' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('video')}
                  >
                    Videos ({getCategoryCount('video')})
                  </Button>
                </div>
              </div>

              {/* Files Grid */}
              <ScrollArea className="flex-1">
                {filteredFiles.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredFiles.map((file) => (
                      <Card 
                        key={file.id} 
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => onFileClick?.(file)}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center space-x-2 flex-1 min-w-0">
                                {getFileIcon(file.mimeType, file.category)}
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate text-sm">
                                    {file.originalName}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatFileSize(file.size)}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteFile(file.id);
                                }}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs bg-gradient-to-br from-purple-400 to-blue-500 text-white">
                                  {file.uploadedBy.firstName[0]}{file.uploadedBy.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground truncate">
                                  {file.uploadedBy.firstName} {file.uploadedBy.lastName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(file.uploadedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary" className="text-xs">
                                {file.category}
                              </Badge>
                              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                <Download className="h-3 w-3" />
                                <span>{file.downloadCount}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center space-y-2">
                      <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto" />
                      <p className="text-muted-foreground">
                        {searchTerm || selectedCategory !== 'all' ? 'No files match your search' : 'No files uploaded yet'}
                      </p>
                    </div>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}