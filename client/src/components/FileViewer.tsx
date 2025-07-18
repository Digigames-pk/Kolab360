import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Eye, FileText, Image, Video, Music, Archive, File, X, Share, Edit3 } from "lucide-react";

interface FileItem {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: Date;
  uploadedBy: string;
  url: string;
  thumbnail?: string;
  category: "image" | "video" | "audio" | "document" | "archive" | "other";
}

interface FileViewerProps {
  file: FileItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function FileViewer({ file, isOpen, onClose }: FileViewerProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!file) return null;

  const getFileIcon = (category: string) => {
    switch (category) {
      case "image": return <Image className="h-5 w-5" />;
      case "video": return <Video className="h-5 w-5" />;
      case "audio": return <Music className="h-5 w-5" />;
      case "document": return <FileText className="h-5 w-5" />;
      case "archive": return <Archive className="h-5 w-5" />;
      default: return <File className="h-5 w-5" />;
    }
  };

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      // Simulate download
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderFilePreview = () => {
    switch (file.category) {
      case "image":
        return (
          <div className="flex justify-center bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <img 
              src={file.thumbnail || file.url} 
              alt={file.name}
              className="max-w-full max-h-96 object-contain rounded-lg"
            />
          </div>
        );
      
      case "video":
        return (
          <div className="flex justify-center bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <video 
              controls 
              className="max-w-full max-h-96 rounded-lg"
              poster={file.thumbnail}
            >
              <source src={file.url} type={file.type} />
              Your browser does not support video playback.
            </video>
          </div>
        );
      
      case "audio":
        return (
          <div className="flex justify-center bg-gray-50 dark:bg-gray-800 rounded-lg p-8">
            <div className="text-center">
              <Music className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <audio controls className="w-full max-w-md">
                <source src={file.url} type={file.type} />
                Your browser does not support audio playback.
              </audio>
            </div>
          </div>
        );
      
      case "document":
        if (file.type === "application/pdf") {
          return (
            <div className="h-96 border rounded-lg">
              <iframe 
                src={`${file.url}#toolbar=0`} 
                className="w-full h-full rounded-lg"
                title={file.name}
              />
            </div>
          );
        }
        return (
          <div className="flex justify-center bg-gray-50 dark:bg-gray-800 rounded-lg p-8">
            <div className="text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Preview not available for this document type</p>
              <Button onClick={handleDownload} className="mt-4">
                <Download className="h-4 w-4 mr-2" />
                Download to view
              </Button>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="flex justify-center bg-gray-50 dark:bg-gray-800 rounded-lg p-8">
            <div className="text-center">
              {getFileIcon(file.category)}
              <p className="text-muted-foreground mt-4">Preview not available for this file type</p>
              <Button onClick={handleDownload} className="mt-4">
                <Download className="h-4 w-4 mr-2" />
                Download file
              </Button>
            </div>
          </div>
        );
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "image": return "bg-green-500";
      case "video": return "bg-red-500";
      case "audio": return "bg-purple-500";
      case "document": return "bg-blue-500";
      case "archive": return "bg-orange-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${getCategoryColor(file.category)} text-white`}>
                {getFileIcon(file.category)}
              </div>
              <div>
                <DialogTitle className="text-lg">{file.name}</DialogTitle>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Badge variant="outline" className="text-xs">
                    {file.type}
                  </Badge>
                  <span>{file.size}</span>
                  <span>•</span>
                  <span>Uploaded by {file.uploadedBy}</span>
                  <span>•</span>
                  <span>{file.uploadedAt.toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4 mr-1" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Edit3 className="h-4 w-4 mr-1" />
                Rename
              </Button>
              <Button 
                onClick={handleDownload} 
                size="sm"
                disabled={isLoading}
              >
                <Download className="h-4 w-4 mr-1" />
                {isLoading ? "Downloading..." : "Download"}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-6">
          {renderFilePreview()}
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
          <div>
            <label className="font-medium">File Size</label>
            <p className="text-muted-foreground">{file.size}</p>
          </div>
          <div>
            <label className="font-medium">File Type</label>
            <p className="text-muted-foreground">{file.type}</p>
          </div>
          <div>
            <label className="font-medium">Category</label>
            <Badge className={`${getCategoryColor(file.category)} text-white`}>
              {file.category}
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}