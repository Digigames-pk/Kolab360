import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useQuery } from "@tanstack/react-query";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { Hash, Lock, Users, Search, Info, Settings } from "lucide-react";

interface Channel {
  id: string;
  name: string;
  description: string;
  isPrivate: boolean;
  workspaceId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface Member {
  id: string;
  workspaceId: string;
  userId: string;
  role: string;
  joinedAt: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
    createdAt: string;
    updatedAt: string;
  };
}

interface ChatAreaProps {
  workspaceId: string;
  channelId: string | null;
  recipientId: string | null;
  channels: Channel[];
  members: Member[];
  sendMessage: (message: any) => void;
  isConnected: boolean;
}

export default function ChatArea({
  workspaceId,
  channelId,
  recipientId,
  channels,
  members,
  sendMessage,
  isConnected
}: ChatAreaProps) {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const currentChannel = channelId ? channels.find(c => c.id === channelId) : null;
  const currentRecipient = recipientId ? members.find(m => m.userId === recipientId)?.user : null;

  const { data: channelMembers, isLoading: membersLoading } = useQuery({
    queryKey: ["/api/channels", channelId, "members"],
    enabled: !!channelId,
  });

  const getUserDisplayName = (user: Member["user"]) => {
    return user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || user.email;
  };

  useEffect(() => {
    // Clear typing users when channel changes
    setTypingUsers([]);
  }, [channelId, recipientId]);

  const handleSendMessage = (content: string, messageType = "text", metadata = null) => {
    if (channelId) {
      sendMessage({
        type: "message",
        content,
        channelId,
        messageType,
        metadata,
      });
    } else if (recipientId) {
      sendMessage({
        type: "message",
        content,
        recipientId,
        messageType,
        metadata,
      });
    }
  };

  const handleTyping = (isTyping: boolean) => {
    if (channelId) {
      sendMessage({
        type: "typing",
        channelId,
        isTyping,
      });
    }
  };

  if (!channelId && !recipientId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-800/30">
        <div className="text-center text-gray-400">
          <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">Welcome to your workspace!</h3>
          <p>Select a channel or start a direct message to begin collaborating.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700/50 bg-gray-800/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {currentChannel ? (
              <div className="flex items-center space-x-2">
                {currentChannel.isPrivate ? (
                  <Lock className="h-5 w-5 text-gray-400" />
                ) : (
                  <Hash className="h-5 w-5 text-gray-400" />
                )}
                <h2 className="text-white font-semibold text-lg">{currentChannel.name}</h2>
                {currentChannel.description && (
                  <span className="text-gray-400 text-sm">| {currentChannel.description}</span>
                )}
              </div>
            ) : currentRecipient ? (
              <div className="flex items-center space-x-3">
                {currentRecipient.profileImageUrl ? (
                  <img
                    src={currentRecipient.profileImageUrl}
                    alt={getUserDisplayName(currentRecipient)}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {currentRecipient.firstName?.[0] || currentRecipient.email[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <h2 className="text-white font-semibold text-lg">
                  {getUserDisplayName(currentRecipient)}
                </h2>
                <Badge variant="outline" className="border-gray-600 text-gray-300">
                  Direct Message
                </Badge>
              </div>
            ) : null}
            
            {currentChannel && channelMembers && (
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <Users className="h-4 w-4" />
                <span>{channelMembers.length} members</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            {!isConnected && (
              <Badge variant="destructive" className="text-xs">
                Disconnected
              </Badge>
            )}
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
              <Info className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col min-h-0">
        <MessageList
          channelId={channelId}
          recipientId={recipientId}
          typingUsers={typingUsers}
        />
        
        {/* Message Input */}
        <div className="border-t border-gray-700/50 bg-gray-800/50 backdrop-blur-sm">
          <MessageInput
            placeholder={
              currentChannel 
                ? `Message #${currentChannel.name}` 
                : `Message ${getUserDisplayName(currentRecipient!)}`
            }
            onSendMessage={handleSendMessage}
            onTyping={handleTyping}
            workspaceId={workspaceId}
          />
        </div>
      </div>
    </div>
  );
}
