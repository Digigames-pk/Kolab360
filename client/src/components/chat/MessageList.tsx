import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { formatDistanceToNow } from "date-fns";
import { 
  Smile, 
  Reply, 
  Share, 
  MoreVertical, 
  Edit2, 
  Trash2,
  Brain,
  CheckCircle2
} from "lucide-react";

interface Message {
  id: string;
  content: string;
  authorId: string;
  channelId: string | null;
  recipientId: string | null;
  threadId: string | null;
  messageType: string;
  metadata: any;
  editedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
    createdAt: string;
    updatedAt: string;
  };
}

interface MessageListProps {
  channelId: string | null;
  recipientId: string | null;
  typingUsers: string[];
}

export default function MessageList({ channelId, recipientId, typingUsers }: MessageListProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const { data: messages, isLoading } = useQuery({
    queryKey: channelId 
      ? ["/api/channels", channelId, "messages"]
      : recipientId 
      ? ["/api/messages/direct", recipientId]
      : [],
    enabled: !!(channelId || recipientId),
  });

  const updateMessageMutation = useMutation({
    mutationFn: async ({ messageId, content }: { messageId: string; content: string }) => {
      const response = await apiRequest("PUT", `/api/messages/${messageId}`, { content });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: channelId 
          ? ["/api/channels", channelId, "messages"]
          : ["/api/messages/direct", recipientId]
      });
      setEditingMessageId(null);
      setEditContent("");
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
        description: "Failed to update message.",
        variant: "destructive",
      });
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const response = await apiRequest("DELETE", `/api/messages/${messageId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: channelId 
          ? ["/api/channels", channelId, "messages"]
          : ["/api/messages/direct", recipientId]
      });
      toast({
        title: "Success",
        description: "Message deleted successfully.",
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
        description: "Failed to delete message.",
        variant: "destructive",
      });
    },
  });

  const addReactionMutation = useMutation({
    mutationFn: async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      const response = await apiRequest("POST", `/api/messages/${messageId}/reactions`, { emoji });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: channelId 
          ? ["/api/channels", channelId, "messages"]
          : ["/api/messages/direct", recipientId]
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
    },
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getUserDisplayName = (author: Message["author"]) => {
    return author.firstName && author.lastName 
      ? `${author.firstName} ${author.lastName}`
      : author.firstName || author.email;
  };

  const getUserInitials = (author: Message["author"]) => {
    if (author.firstName && author.lastName) {
      return `${author.firstName[0]}${author.lastName[0]}`.toUpperCase();
    }
    if (author.firstName) {
      return author.firstName[0].toUpperCase();
    }
    return author.email[0].toUpperCase();
  };

  const handleEditMessage = (message: Message) => {
    setEditingMessageId(message.id);
    setEditContent(message.content);
  };

  const handleSaveEdit = () => {
    if (editingMessageId && editContent.trim()) {
      updateMessageMutation.mutate({
        messageId: editingMessageId,
        content: editContent.trim(),
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditContent("");
  };

  const handleDeleteMessage = (messageId: string) => {
    if (confirm("Are you sure you want to delete this message?")) {
      deleteMessageMutation.mutate(messageId);
    }
  };

  const handleAddReaction = (messageId: string, emoji: string) => {
    addReactionMutation.mutate({ messageId, emoji });
  };

  const renderMessage = (message: Message) => {
    const isOwnMessage = message.authorId === user?.id;
    const isAiMessage = message.messageType === "ai_response";
    const isEditing = editingMessageId === message.id;

    return (
      <div key={message.id} className="flex items-start space-x-3 group hover:bg-gray-700/20 p-3 rounded-lg transition-colors">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {isAiMessage ? (
            <div className="w-10 h-10 gradient-bg rounded-full flex items-center justify-center">
              <Brain className="text-white h-5 w-5" />
            </div>
          ) : message.author.profileImageUrl ? (
            <img
              src={message.author.profileImageUrl}
              alt={getUserDisplayName(message.author)}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {getUserInitials(message.author)}
              </span>
            </div>
          )}
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-white font-semibold">
              {isAiMessage ? "AI Assistant" : getUserDisplayName(message.author)}
            </span>
            {isAiMessage && (
              <span className="bg-accent text-white text-xs px-2 py-1 rounded-full">BOT</span>
            )}
            <span className="text-gray-400 text-sm">
              {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
            </span>
            {message.editedAt && (
              <span className="text-gray-400 text-xs">(edited)</span>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-gray-700/50 text-white rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                rows={3}
                autoFocus
              />
              <div className="flex items-center space-x-2">
                <Button size="sm" onClick={handleSaveEdit} disabled={updateMessageMutation.isPending}>
                  {updateMessageMutation.isPending ? (
                    <LoadingSpinner size="sm" className="mr-1" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                  )}
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className={`chat-bubble ${
              isAiMessage 
                ? "bg-gradient-to-r from-primary/20 to-secondary/20 border-primary/30" 
                : "bg-gray-700/50 border-gray-600/50"
            } text-gray-100`}>
              <div className="whitespace-pre-wrap break-words">
                {message.content}
              </div>
            </div>
          )}

          {/* Message Actions */}
          {!isEditing && (
            <div className="flex items-center space-x-4 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-1 h-auto">
                <Smile className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-1 h-auto">
                <Reply className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-1 h-auto">
                <Share className="h-4 w-4" />
              </Button>
              {isOwnMessage && !isAiMessage && (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-400 hover:text-white p-1 h-auto"
                    onClick={() => handleEditMessage(message)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-400 hover:text-red-400 p-1 h-auto"
                    onClick={() => handleDeleteMessage(message.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-1 h-auto">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Quick Reactions */}
          {!isEditing && (
            <div className="flex items-center space-x-1 mt-2">
              {["👍", "❤️", "😄", "🎉"].map((emoji) => (
                <Button
                  key={emoji}
                  variant="ghost"
                  size="sm"
                  className="text-sm h-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-600"
                  onClick={() => handleAddReaction(message.id, emoji)}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner className="text-white" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {messages && messages.length > 0 ? (
        <>
          {messages.map(renderMessage)}
          
          {/* Typing Indicators */}
          {typingUsers.length > 0 && (
            <div className="flex items-center space-x-3 p-3">
              <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">👤</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="typing-indicator"></div>
                <div className="typing-indicator"></div>
                <div className="typing-indicator"></div>
                <span className="text-gray-400 text-sm ml-2">
                  {typingUsers.length === 1 
                    ? `Someone is typing...` 
                    : `${typingUsers.length} people are typing...`
                  }
                </span>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              {channelId ? <Hash className="h-8 w-8" /> : <Brain className="h-8 w-8" />}
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {channelId ? "Welcome to the channel!" : "Start your conversation"}
            </h3>
            <p className="text-sm">
              {channelId 
                ? "This is the beginning of your conversation in this channel."
                : "Send a message to start your direct conversation."
              }
            </p>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
