import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSocketIO } from '../hooks/useSocketIO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Send,
  Smile,
  Paperclip,
  Plus,
  MoreHorizontal,
  Reply,
  Edit3,
  Trash2,
  Copy,
  Quote,
  Heart,
  ThumbsUp,
  Laugh,
  Clock,
  Check,
  CheckCheck,
  Phone,
  Video,
  Users,
  Upload,
  Pin
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  authorId: number;
  channelId?: string;
  recipientId?: number;
  createdAt: string;
  updatedAt?: string;
  isEdited?: boolean;
  author: {
    id: number;
    firstName: string;
    lastName: string;
    email?: string;
  };
  reactions?: Reaction[];
  replyTo?: Message;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
}

interface Reaction {
  emoji: string;
  count: number;
  users: number[];
}

interface TypingUser {
  userId: number;
  userName: string;
  timestamp: number;
}

interface RealTimeChatProps {
  channelId?: string;
  recipientId?: number;
  recipientName?: string;
  className?: string;
}

export function RealTimeChat({ channelId, recipientId, recipientName, className }: RealTimeChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showCallOptions, setShowCallOptions] = useState(false);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // WebSocket connection with enhanced reconnection handling
  const { isConnected, sendMessage, error: wsError } = useSocketIO({
    onMessage: handleWebSocketMessage,
    onConnect: () => {
      console.log('✅ WebSocket connected, joining workspace and channel');
      if (user) {
        sendMessage({ type: 'join_workspace', workspaceId: 1, userId: user.id });
      }
      if (channelId) {
        sendMessage({ type: 'join_channel', channelId });
      }
    },
    onDisconnect: () => {
      console.log('❌ WebSocket disconnected');
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
    }
  });

  function handleWebSocketMessage(message: any) {
    console.log('📨 WebSocket message received in RealTimeChat:', message);
    
    switch (message.type) {
      case 'new_message':
        if (message.data.channelId === channelId) {
          console.log('✅ Adding new message to current channel:', message.data);
          setMessages(prev => {
            // Avoid duplicates
            const exists = prev.some(m => m.id === message.data.id);
            return exists ? prev : [...prev, message.data];
          });
          
          // Mark channel as read if user is actively viewing it
          if (channelId) {
            markChannelAsRead(channelId);
          }
        }
        break;
        
      case 'new_direct_message':
        if ((message.data.authorId === user?.id && message.data.recipientId === recipientId) ||
            (message.data.authorId === recipientId && message.data.recipientId === user?.id)) {
          console.log('✅ Adding new direct message:', message.data);
          setMessages(prev => {
            // Avoid duplicates
            const exists = prev.some(m => m.id === message.data.id);
            return exists ? prev : [...prev, message.data];
          });
          
          // Mark DM as read if user is actively viewing it
          if (recipientId) {
            markDMAsRead(recipientId);
          }
        }
        break;
        
      case 'unread_count_update':
        console.log('📊 Unread count update:', message.data);
        // This will be handled by the sidebar component
        break;
        
      case 'dm_unread_count_update':
        console.log('📧 DM unread count update:', message.data);
        // This will be handled by the sidebar component
        break;
        
      case 'user_typing':
        if (message.channelId === channelId && message.userId !== user?.id) {
          setTypingUsers(prev => {
            const filtered = prev.filter(t => t.userId !== message.userId);
            return [...filtered, {
              userId: message.userId,
              userName: `User ${message.userId}`,
              timestamp: Date.now()
            }];
          });
        }
        break;
        
      case 'user_stop_typing':
        setTypingUsers(prev => prev.filter(t => t.userId !== message.userId));
        break;
    }
  }
  
  // Mark channel as read
  const markChannelAsRead = async (channelId: string) => {
    try {
      await fetch(`/api/unread-counts/channels/${channelId}/mark-read`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error marking channel as read:', error);
    }
  };
  
  // Mark DM as read
  const markDMAsRead = async (userId: number) => {
    try {
      await fetch(`/api/unread-counts/direct-messages/${userId}/mark-read`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error marking DM as read:', error);
    }
  };
  
  // Pin message functionality 
  const pinMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/pins/messages/${messageId}`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        console.log('✅ Message pinned successfully:', messageId);
        // Show success toast or update UI
      }
    } catch (error) {
      console.error('Error pinning message:', error);
    }
  };
  
  // Unpin message functionality
  const unpinMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/pins/messages/${messageId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        console.log('✅ Message unpinned successfully:', messageId);
      }
    } catch (error) {
      console.error('Error unpinning message:', error);
    }
  };

  // Load messages
  useEffect(() => {
    loadMessages();
  }, [channelId, recipientId]);

  const loadMessages = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const endpoint = channelId 
        ? `/api/channels/${channelId}/messages`
        : `/api/users/${recipientId}/messages`;
        
      const response = await fetch(endpoint, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      if (response.ok) {
        const data = await response.json();
        const messagesData = data.messages || data || [];
        console.log('📥 Messages loaded from API:', messagesData);
        console.log('🔍 File metadata check:', messagesData.map(m => ({
          id: m.id,
          hasFileUrl: !!m.fileUrl,
          fileType: m.fileType,
          messageType: m.messageType
        })));
        setMessages(messagesData);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Clean up typing indicators
  useEffect(() => {
    const interval = setInterval(() => {
      setTypingUsers(prev => prev.filter(t => Date.now() - t.timestamp < 5000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendChatMessage = async () => {
    if (!messageText.trim() || !user) return;

    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      content: messageText.trim(),
      authorId: user.id,
      channelId: channelId,
      recipientId: recipientId,
      createdAt: new Date().toISOString(),
      author: {
        id: user.id,
        firstName: user.firstName || 'You',
        lastName: user.lastName || ''
      }
    };

    // Optimistically add message to UI immediately
    setMessages(prev => [...prev, optimisticMessage]);
    const currentMessage = messageText;
    setMessageText('');

    // Send to WebSocket for real-time updates
    if (isConnected) {
      sendMessage({
        type: channelId ? 'send_message' : 'send_direct_message',
        channelId,
        recipientId,
        content: currentMessage,
        authorId: user.id
      });
    }

    try {
      const endpoint = channelId 
        ? `/api/channels/${channelId}/messages`
        : `/api/users/${recipientId}/messages`;
        
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: currentMessage,
          authorId: user.id,
          channelId: channelId,
          recipientId: recipientId
        })
      });

      if (response.ok) {
        const newMessage = await response.json();
        
        // Replace optimistic message with real message
        setMessages(prev => 
          prev.map(msg => 
            msg.id === optimisticMessage.id ? newMessage : msg
          )
        );
      } else {
        // Remove optimistic message on failure
        setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
        setMessageText(currentMessage); // Restore text
      }
      
      // Stop typing indicator
      if (isConnected) {
        sendMessage({ type: 'user_stop_typing', channelId, userId: user.id });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
      setMessageText(currentMessage); // Restore text
    }
  };

  const handleTyping = () => {
    if (channelId && isConnected && user) {
      sendMessage({ type: 'user_typing', channelId, userId: user.id });
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        sendMessage({ type: 'user_stop_typing', channelId, userId: user.id });
      }, 2000);
    }
  };

  // Real user data for @ mentions from API
  const [availableUsers, setAvailableUsers] = useState<Array<{ id: number; firstName: string; lastName: string; email: string; role?: string; department?: string }>>([]);

  // Fetch real users for mentions from API
  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/workspace/users');
        if (response.ok) {
          const users = await response.json();
          setAvailableUsers(users);
        } else {
          console.warn('Failed to fetch users from API, no fallback data used');
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
        setAvailableUsers([]);
      }
    };

    fetchUsers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setMessageText(text);
    
    // Check for @ mentions
    const lastAtIndex = text.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const query = text.slice(lastAtIndex + 1);
      console.log('User typing @mention:', text);
      
      if (query.length >= 0) {
        setMentionQuery(query);
        setShowMentionDropdown(true);
        
        // Calculate position for dropdown
        if (inputRef.current) {
          const rect = inputRef.current.getBoundingClientRect();
          setMentionPosition({
            top: rect.top - 150,
            left: rect.left
          });
        }
      }
    } else {
      setShowMentionDropdown(false);
    }
    
    handleTyping();
  };

  const insertMention = (user: any) => {
    const lastAtIndex = messageText.lastIndexOf('@');
    // Use full name for better clarity, especially when multiple people share first names
    const mentionText = `${user.firstName} ${user.lastName}`;
    const newText = messageText.slice(0, lastAtIndex) + `@${mentionText} `;
    setMessageText(newText);
    setShowMentionDropdown(false);
    inputRef.current?.focus();
  };

  const editMessage = async (messageId: string, newContent: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent }),
      });

      if (response.ok) {
        const updatedMessage = await response.json();
        setMessages(prev => prev.map(m => m.id === messageId ? updatedMessage : m));
        setEditingMessageId(null);
        setEditingText('');
      }
    } catch (error) {
      console.error('Failed to edit message:', error);
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessages(prev => prev.filter(m => m.id !== messageId));
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  }



  // Emoji functions
  const addEmoji = (emoji: string) => {
    setMessageText(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  // File upload functions
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('channelId', channelId || '');
    formData.append('recipientId', recipientId?.toString() || '');

    try {
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      console.log('📤 Upload response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed:', errorText);
        throw new Error(`Upload failed: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('Non-JSON response:', responseText);
        throw new Error('Server returned non-JSON response');
      }

      const fileData = await response.json();
      console.log('📤 File data received:', fileData);
      
      // Create message with file attachment using the actual file data
      const endpoint = channelId 
        ? `/api/channels/${channelId}/messages`
        : `/api/messages/direct/${recipientId}`;
      
      const messagePayload = {
        content: `📎 Shared file: ${fileData.originalName}`,
        fileUrl: fileData.url,
        fileName: fileData.originalName,
        fileType: fileData.mimetype,
        fileSize: fileData.size
      };
      
      console.log('🔄 Creating file message with payload:', messagePayload);
        
      const messageResponse = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(messagePayload)
      });
      
      console.log('📬 Message response status:', messageResponse.status);
      
      if (messageResponse.ok) {
        const newMessage = await messageResponse.json();
        console.log('🆕 New message from API:', newMessage);
        
        // Add file metadata to the message if not already present
        const messageWithFile = {
          ...newMessage,
          fileUrl: newMessage.fileUrl || fileData.url,
          fileName: newMessage.fileName || fileData.originalName,
          fileType: newMessage.fileType || fileData.mimetype,
          fileSize: newMessage.fileSize || fileData.size
        };
        
        console.log('🎯 Final message with file data:', messageWithFile);
        setMessages(prev => [...prev, messageWithFile]);
        console.log('✅ File message created successfully');
        
        // Refetch messages immediately to show the new message
        await loadMessages();
      } else {
        const errorText = await messageResponse.text();
        console.error('❌ Failed to create message for file. Status:', messageResponse.status, 'Error:', errorText);
      }
    } catch (error) {
      console.error('Failed to upload file:', error);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Drag and drop functions
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('channelId', channelId || '');
      formData.append('recipientId', recipientId?.toString() || '');

      try {
        const response = await fetch('/api/files/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const responseText = await response.text();
          console.error('Non-JSON response:', responseText);
          throw new Error('Server returned non-JSON response');
        }

        const fileData = await response.json();
        console.log('📤 Drag-drop file data received:', fileData);
        
        // Create message with file attachment
        const endpoint = channelId 
          ? `/api/channels/${channelId}/messages`
          : `/api/messages/direct`;
          
        const messageResponse = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `📎 Shared file: ${fileData.originalName}`,
            authorId: user?.id || 3,
            channelId: channelId,
            recipientId: recipientId,
            fileUrl: fileData.url,
            fileName: fileData.originalName,
            fileType: fileData.mimetype,
            fileSize: fileData.size
          })
        });
        
        if (messageResponse.ok) {
          const newMessage = await messageResponse.json();
          const messageWithFile = {
            ...newMessage,
            fileUrl: fileData.url,
            fileName: fileData.originalName,
            fileType: fileData.mimetype,
            fileSize: fileData.size
          };
          setMessages(prev => [...prev, messageWithFile]);
          console.log('✅ Drag-drop file message created successfully');
        }
      } catch (error) {
        console.error('Failed to upload file:', error);
      }
    }
  };

  // Call functions
  const startVoiceCall = () => {
    if (recipientId) {
      // Simulate starting voice call
      const callMessage = `📞 Started voice call with ${recipientName}`;
      setMessageText(callMessage);
      sendChatMessage();
    } else {
      // Channel voice call
      const callMessage = `📞 Started voice call in #${channelId}`;
      setMessageText(callMessage);
      sendChatMessage();
    }
    setShowCallOptions(false);
  };

  const startVideoCall = () => {
    if (recipientId) {
      const callMessage = `📹 Started video call with ${recipientName}`;
      setMessageText(callMessage);
      sendChatMessage();
    } else {
      const callMessage = `📹 Started video call in #${channelId}`;
      setMessageText(callMessage);
      sendChatMessage();
    }
    setShowCallOptions(false);
  };

  const inviteUsers = () => {
    if (channelId) {
      const inviteMessage = `👥 Invited users to join #${channelId}`;
      setMessageText(inviteMessage);
      sendChatMessage();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return date.toLocaleDateString();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (editingMessageId) {
        editMessage(editingMessageId, editingText);
      } else {
        sendChatMessage();
      }
    }
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [date: string]: Message[] } = {};
    
    messages.forEach(message => {
      const date = new Date(message.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return Object.entries(groups).sort(([a], [b]) => 
      new Date(a).getTime() - new Date(b).getTime()
    );
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className={cn("flex-1 flex flex-col h-full", className)}>
      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4">
        <div 
          className={cn(
            "space-y-4 py-4 relative",
            isDragging && "bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Drag overlay */}
          {isDragging && (
            <div className="absolute inset-0 flex items-center justify-center bg-blue-50/80 dark:bg-blue-900/40 backdrop-blur-sm z-50 rounded-lg">
              <div className="text-center p-8">
                <Upload className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                <p className="text-lg font-medium text-blue-700 dark:text-blue-300">
                  Drop files here to upload
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                  Images, videos, documents, and more
                </p>
              </div>
            </div>
          )}
          {messageGroups.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-12">
              <div className="text-center space-y-2">
                <p className="text-lg font-medium">
                  {channelId ? `Welcome to #${channelId}` : recipientName ? `Welcome to your chat with ${recipientName}` : 'Select a channel or start a conversation'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Start the conversation by sending a message below.
                </p>
              </div>
            </div>
          ) : (
            messageGroups.map(([date, dateMessages]) => (
              <div key={date}>
                <div className="flex items-center justify-center py-2">
                  <div className="flex items-center space-x-4">
                    <Separator className="flex-1 max-w-12" />
                    <Badge variant="secondary" className="text-xs">
                      {formatDate(date)}
                    </Badge>
                    <Separator className="flex-1 max-w-12" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  {dateMessages.map((message, index) => {
                    const prevMessage = index > 0 ? dateMessages[index - 1] : null;
                    const isSequential = prevMessage && 
                      prevMessage.authorId === message.authorId &&
                      new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime() < 5 * 60 * 1000;

                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "group flex items-start space-x-3 hover:bg-muted/50 px-2 py-1 rounded-lg transition-colors",
                          isSequential && "mt-1"
                        )}
                      >
                        {!isSequential ? (
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {message.author.firstName?.[0]}{message.author.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="w-10 flex justify-center">
                            <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                              {formatTime(message.createdAt)}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          {!isSequential && (
                            <div className="flex items-baseline space-x-2 mb-1">
                              <span className="font-semibold text-sm">
                                {message.author.firstName} {message.author.lastName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatTime(message.createdAt)}
                              </span>
                              {message.isEdited && (
                                <span className="text-xs text-muted-foreground">(edited)</span>
                              )}
                            </div>
                          )}
                          
                          {message.replyTo && (
                            <div className="mb-2 pl-3 border-l-2 border-muted">
                              <p className="text-xs text-muted-foreground">
                                Replying to {message.replyTo.author.firstName}
                              </p>
                              <p className="text-sm text-muted-foreground truncate">
                                {message.replyTo.content}
                              </p>
                            </div>
                          )}
                          
                          {editingMessageId === message.id ? (
                            <div className="space-y-2">
                              <Input
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="text-sm"
                                autoFocus
                              />
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() => editMessage(message.id, editingText)}
                                >
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingMessageId(null);
                                    setEditingText('');
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <p className="text-sm break-words">{message.content}</p>
                              {/* File Preview */}
                              {message.fileUrl && (
                                <div className="mt-2">
                                  {message.fileType?.startsWith('image/') ? (
                                    <div className="max-w-xs">
                                      <img 
                                        src={message.fileUrl} 
                                        alt={message.fileName || 'Shared image'}
                                        className="rounded-lg border max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                                        onClick={() => window.open(message.fileUrl, '_blank')}
                                      />
                                      <p className="text-xs text-gray-500 mt-1">{message.fileName}</p>
                                    </div>
                                  ) : message.fileType?.startsWith('video/') ? (
                                    <div className="max-w-md">
                                      <video 
                                        controls 
                                        className="rounded-lg border max-w-full h-auto"
                                        preload="metadata"
                                      >
                                        <source src={message.fileUrl} type={message.fileType} />
                                        Your browser does not support the video tag.
                                      </video>
                                      <p className="text-xs text-gray-500 mt-1">{message.fileName}</p>
                                    </div>
                                  ) : message.fileType?.startsWith('audio/') ? (
                                    <div className="max-w-sm">
                                      <audio 
                                        controls 
                                        className="w-full"
                                        preload="metadata"
                                      >
                                        <source src={message.fileUrl} type={message.fileType} />
                                        Your browser does not support the audio tag.
                                      </audio>
                                      <p className="text-xs text-gray-500 mt-1">{message.fileName}</p>
                                    </div>
                                  ) : message.fileUrl ? (
                                    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border max-w-sm">
                                      <div className="flex-shrink-0">
                                        <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{message.fileName}</p>
                                        <p className="text-xs text-gray-500">
                                          {message.fileSize ? `${(message.fileSize / 1024).toFixed(1)} KB` : 'Unknown size'}
                                        </p>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => window.open(message.fileUrl, '_blank')}
                                        className="flex-shrink-0"
                                      >
                                        Download
                                      </Button>
                                    </div>
                                  ) : null}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {message.authorId === user?.id && editingMessageId !== message.id && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setReplyingTo(message)}>
                                  <Reply className="h-4 w-4 mr-2" />
                                  Reply
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => pinMessage(message.id)}>
                                  <Pin className="h-4 w-4 mr-2" />
                                  Pin Message
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingMessageId(message.id);
                                    setEditingText(message.content);
                                  }}
                                >
                                  <Edit3 className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(message.content)}>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Copy
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => deleteMessage(message.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
          
          {/* Typing Indicators */}
          {typingUsers.length > 0 && (
            <div className="flex items-center space-x-2 px-2 py-1">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}} />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
              </div>
              <span className="text-sm text-muted-foreground">
                {typingUsers.length === 1 
                  ? `${typingUsers[0].userName} is typing...`
                  : `${typingUsers.length} people are typing...`
                }
              </span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Reply Preview */}
      {replyingTo && (
        <div className="px-4 py-2 bg-muted/50 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Reply className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Replying to {replyingTo.author.firstName}
              </span>
              <span className="text-sm text-muted-foreground truncate max-w-xs">
                {replyingTo.content}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>
              ✕
            </Button>
          </div>
        </div>
      )}

      {/* @ Mention Dropdown */}
      {showMentionDropdown && (
        <div 
          className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-40 overflow-y-auto"
          style={{
            top: `${mentionPosition.top}px`,
            left: `${mentionPosition.left}px`,
            minWidth: '200px'
          }}
        >
          {availableUsers
            .filter(user => 
              user.firstName.toLowerCase().includes(mentionQuery.toLowerCase()) ||
              user.lastName.toLowerCase().includes(mentionQuery.toLowerCase()) ||
              user.email.toLowerCase().includes(mentionQuery.toLowerCase())
            )
            .map(user => (
              <div
                key={user.id}
                className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center space-x-2"
                onClick={() => insertMention(user)}
              >
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.firstName} {user.lastName}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    @{user.email.split('@')[0]} • {(user as any).department || 'Team Member'}
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 border-t bg-background">
        <div className="flex items-end space-x-2">
          {/* Enhanced Action Buttons */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-blue-50">
                <Plus className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </DropdownMenuItem>
              <DropdownMenuItem onClick={startVoiceCall}>
                <Phone className="h-4 w-4 mr-2" />
                Voice Call
              </DropdownMenuItem>
              <DropdownMenuItem onClick={startVideoCall}>
                <Video className="h-4 w-4 mr-2" />
                Video Call
              </DropdownMenuItem>
              {channelId && (
                <DropdownMenuItem onClick={inviteUsers}>
                  <Users className="h-4 w-4 mr-2" />
                  Invite Users
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              placeholder={channelId ? `Message #${channelId}` : recipientName ? `Message ${recipientName}` : 'Type a message...'}
              value={messageText}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="pr-20 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
              {/* Working Emoji Picker */}
              <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-gray-100">
                    <Smile className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-4" align="end">
                  <div className="grid grid-cols-8 gap-2">
                    {['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
                      '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
                      '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜',
                      '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏',
                      '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
                      '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠',
                      '👍', '👎', '👏', '🙌', '🤝', '👋', '✋', '🖐️',
                      '❤️', '💙', '💚', '💛', '🧡', '💜', '🖤', '🤍'].map((emoji) => (
                      <Button
                        key={emoji}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-lg hover:bg-gray-100"
                        onClick={() => addEmoji(emoji)}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              
              {/* Working File Upload */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 hover:bg-gray-100"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                hidden
                onChange={handleFileUpload}
                accept="*/*"
              />
            </div>
          </div>
          
          <Button 
            onClick={sendChatMessage}
            disabled={!messageText.trim()}
            className="h-9 transition-all duration-200 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Enhanced typing indicators and connection status */}
        {typingUsers.length > 0 && (
          <div className="mt-2 text-xs text-muted-foreground animate-pulse">
            <div className="flex items-center space-x-1">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span>{typingUsers.map(u => u.userName).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...</span>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <div className="flex items-center space-x-2">
            <span>Press Enter to send</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>{isConnected ? 'Real-time' : (wsError ? 'Reconnecting...' : 'Disconnected')}</span>
            {channelId && (
              <span className="text-xs">• #{channelId}</span>
            )}
            {recipientName && (
              <span className="text-xs">• DM with {recipientName}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}