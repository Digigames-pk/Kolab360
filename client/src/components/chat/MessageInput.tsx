import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Paperclip, 
  Send, 
  Smile, 
  AtSign, 
  Brain,
  Mic,
  Image,
  FileText
} from "lucide-react";

interface MessageInputProps {
  placeholder: string;
  onSendMessage: (content: string, messageType?: string, metadata?: any) => void;
  onTyping: (isTyping: boolean) => void;
  workspaceId: string;
  channelId?: string;
  selectedUserId?: string;
}

export default function MessageInput({ 
  placeholder, 
  onSendMessage, 
  onTyping, 
  workspaceId,
  channelId,
  selectedUserId
}: MessageInputProps) {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showAiSuggestion, setShowAiSuggestion] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const autoCompleteMutation = useMutation({
    mutationFn: async (partialMessage: string) => {
      const response = await apiRequest("POST", "/api/ai/autocomplete", {
        partialMessage,
        context: "chat message",
      });
      return response.json();
    },
    onSuccess: (data) => {
      setAiSuggestion(data.completion);
      setShowAiSuggestion(true);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      console.error("Auto-complete error:", error);
    },
  });

  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("workspaceId", workspaceId);
      
      const response = await fetch("/api/files", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Upload failed");
      }
      
      return response.json();
    },
    onSuccess: (fileData) => {
      onSendMessage(
        `📎 ${fileData.originalName}`,
        "file",
        { fileId: fileData.id, fileName: fileData.originalName, fileSize: fileData.size }
      );
      toast({
        title: "Success",
        description: "File uploaded successfully!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Handle typing indicator
    if (!isTyping && value.length > 0) {
      setIsTyping(true);
      onTyping(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTyping(false);
    }, 2000);

    // Trigger AI auto-complete for longer messages
    if (value.length > 10 && value.length % 20 === 0) {
      autoCompleteMutation.mutate(value);
    } else if (value.length < 10) {
      setShowAiSuggestion(false);
    }

    // Auto-resize textarea
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const trimmedMessage = message.trim();
    
    try {
      // Send the message via API
      const endpoint = selectedUserId ? '/api/messages/direct' : `/api/channels/${channelId}/messages`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: trimmedMessage,
          recipientId: selectedUserId,
          channelId: channelId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Also call the parent handler
      onSendMessage(trimmedMessage);
      
      // Clear the input
      setMessage("");
      setShowAiSuggestion(false);
      setIsTyping(false);
      onTyping(false);
      
      if (inputRef.current) {
        inputRef.current.style.height = "auto";
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    } else if (e.key === "Tab" && showAiSuggestion) {
      e.preventDefault();
      setMessage(aiSuggestion);
      setShowAiSuggestion(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size must be less than 10MB.",
          variant: "destructive",
        });
        return;
      }
      
      uploadFileMutation.mutate(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleEmojiClick = () => {
    // In a real app, this would open an emoji picker
    const emojis = ["😀", "😍", "🎉", "👍", "❤️", "🔥", "💯", "🚀"];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    setMessage(prev => prev + randomEmoji);
    inputRef.current?.focus();
  };

  const handleMentionClick = () => {
    setMessage(prev => prev + "@");
    inputRef.current?.focus();
  };

  const acceptAiSuggestion = () => {
    setMessage(aiSuggestion);
    setShowAiSuggestion(false);
    inputRef.current?.focus();
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* AI Suggestion */}
        {showAiSuggestion && (
          <div className="glassmorphism rounded-lg p-3 border border-primary/30">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 gradient-bg rounded-full flex items-center justify-center flex-shrink-0">
                <Brain className="text-white h-3 w-3" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-primary text-sm font-medium">AI Suggestion</span>
                  <span className="text-gray-400 text-xs">Press Tab to accept</span>
                </div>
                <p className="text-gray-300 text-sm">{aiSuggestion}</p>
              </div>
              <Button 
                type="button"
                size="sm" 
                variant="outline"
                onClick={acceptAiSuggestion}
                className="border-primary/50 text-primary hover:bg-primary/10"
              >
                Accept
              </Button>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="relative">
          <div className="flex items-end space-x-3">
            {/* File Upload */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,application/pdf,.doc,.docx,.txt,.zip,.rar"
            />
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={triggerFileUpload}
              disabled={uploadFileMutation.isPending}
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700/50"
            >
              {uploadFileMutation.isPending ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Paperclip className="h-5 w-5" />
              )}
            </Button>

            {/* Message Input */}
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={message}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                className="w-full bg-gray-700/50 text-white placeholder-gray-400 rounded-lg px-4 py-3 pr-24 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all min-h-[44px] max-h-[120px]"
                rows={1}
              />
              
              {/* Input Actions */}
              <div className="absolute right-3 bottom-3 flex items-center space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleEmojiClick}
                  className="text-gray-400 hover:text-white p-1 h-auto"
                >
                  <Smile className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleMentionClick}
                  className="text-gray-400 hover:text-white p-1 h-auto"
                >
                  <AtSign className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Send Button */}
            <Button
              type="submit"
              disabled={!message.trim()}
              className="gradient-bg hover:shadow-lg transition-all p-3"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>

          {/* Bottom Info */}
          <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <Brain className="h-3 w-3" />
                <span>AI Auto-complete: ON</span>
              </span>
              <span>Translation: Enabled</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>Press @ to mention</span>
              <span>•</span>
              <span>Press / for commands</span>
              <span>•</span>
              <span>Shift+Enter for new line</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
