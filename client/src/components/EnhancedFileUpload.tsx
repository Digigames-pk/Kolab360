import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  File, 
  Image, 
  FileText, 
  Video, 
  Music, 
  Archive, 
  Download, 
  Eye, 
  X,
  Paperclip,
  Share2
} from "lucide-react";

interface FilePreview {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  preview?: string;
}

interface EnhancedFileUploadProps {
  onFileUpload?: (files: File[]) => void;
  onFileClick?: (file: FilePreview) => void;
  maxFileSize?: number;
  allowedTypes?: string[];
  channel?: string;
}

export function EnhancedFileUpload({ 
  onFileUpload, 
  onFileClick,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  allowedTypes = [],
  channel = "general"
}: EnhancedFileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [recentFiles, setRecentFiles] = useState<FilePreview[]>([]);

  // Fetch real files from API
  React.useEffect(() => {
    const fetchRecentFiles = async () => {
      try {
        const response = await fetch('/api/files');
        if (response.ok) {
          const files = await response.json();
          setRecentFiles(files);
        }
      } catch (error) {
        console.error('Failed to fetch recent files:', error);
        setRecentFiles([]); // Set empty array on error
      }
    };

    fetchRecentFiles();
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (type.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (type.startsWith('audio/')) return <Music className="h-4 w-4" />;
    if (type.includes('pdf')) return <FileText className="h-4 w-4" />;
    if (type.includes('zip') || type.includes('rar')) return <Archive className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const getFileTypeColor = (type: string) => {
    if (type.startsWith('image/')) return "bg-green-500";
    if (type.startsWith('video/')) return "bg-red-500";
    if (type.startsWith('audio/')) return "bg-purple-500";
    if (type.includes('pdf')) return "bg-blue-500";
    if (type.includes('zip') || type.includes('rar')) return "bg-orange-500";
    return "bg-gray-500";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      if (file.size > maxFileSize) {
        alert(`File ${file.name} is too large. Maximum size is ${formatFileSize(maxFileSize)}`);
        return false;
      }
      if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
        alert(`File type ${file.type} is not allowed`);
        return false;
      }
      return true;
    });

    setSelectedFiles(validFiles);
    
    if (validFiles.length > 0) {
      simulateUpload(validFiles);
    }
  };

  const simulateUpload = async (files: File[]) => {
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          
          // Add files to recent files
          const newFiles: FilePreview[] = files.map(file => ({
            id: Date.now().toString() + Math.random(),
            name: file.name,
            size: file.size,
            type: file.type,
            url: URL.createObjectURL(file),
            uploadedBy: "You",
            uploadedAt: new Date().toISOString(),
            preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
          }));
          
          setRecentFiles(prev => [...newFiles, ...prev]);
          setSelectedFiles([]);
          
          if (onFileUpload) {
            onFileUpload(files);
          }
          
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          dragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="flex justify-center">
            <Upload className="h-12 w-12 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Drop files here or click to upload</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Maximum file size: {formatFileSize(maxFileSize)}
            </p>
          </div>
          
          <div className="flex justify-center space-x-2">
            <Button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-gradient-to-r from-blue-500 to-purple-500"
            >
              <Paperclip className="h-4 w-4 mr-2" />
              Choose Files
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
              accept={allowedTypes.length > 0 ? allowedTypes.join(',') : undefined}
            />
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-muted-foreground">Uploading... {uploadProgress}%</p>
            </div>
          )}
        </div>
      </div>

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && !isUploading && (
        <div className="space-y-2">
          <h4 className="font-medium">Selected Files:</h4>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded ${getFileTypeColor(file.type)} text-white`}>
                    {getFileIcon(file.type)}
                  </div>
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Files */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Recent Files in #{channel}</h4>
          <Badge variant="secondary">{recentFiles.length} files</Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentFiles.slice(0, 9).map((file) => (
            <Card key={file.id} className="group hover:shadow-lg transition-all duration-200">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* File Preview */}
                  {file.preview ? (
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src={file.preview} 
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className={`aspect-video ${getFileTypeColor(file.type)} rounded-lg flex items-center justify-center`}>
                      <div className="text-white text-center">
                        {getFileIcon(file.type)}
                        <p className="text-xs mt-2 font-medium">
                          {file.name.split('.').pop()?.toUpperCase()}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* File Info */}
                  <div className="space-y-2">
                    <h5 className="font-medium text-sm truncate" title={file.name}>
                      {file.name}
                    </h5>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatFileSize(file.size)}</span>
                      <span>{formatDate(file.uploadedAt)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Uploaded by {file.uploadedBy}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => onFileClick?.(file)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = file.url;
                        link.download = file.name;
                        link.click();
                      }}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(file.url);
                        alert('File link copied!');
                      }}
                    >
                      <Share2 className="h-3 w-3" />
                    </Button>
                    {file.uploadedBy === "You" && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => {
                          if (confirm('Delete this file?')) {
                            setRecentFiles(prev => prev.filter(f => f.id !== file.id));
                          }
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {recentFiles.length > 9 && (
          <div className="text-center pt-4">
            <Button variant="outline">
              View all {recentFiles.length} files
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}