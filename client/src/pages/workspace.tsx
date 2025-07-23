import { useParams } from "wouter";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/chat/Sidebar";
import ChatArea from "@/components/chat/ChatArea";
import RightPanel from "@/components/chat/RightPanel";
import { useSocketIO } from "../hooks/useSocketIO";

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

export default function Workspace() {
  const { workspaceId } = useParams();
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data: workspace, isLoading: workspaceLoading } = useQuery({
    queryKey: ["/api/workspaces", workspaceId],
    enabled: isAuthenticated && !!workspaceId,
  });

  const { data: channels, isLoading: channelsLoading, refetch: refetchChannels } = useQuery({
    queryKey: ["/api/workspaces", workspaceId, "channels"],
    enabled: isAuthenticated && !!workspaceId,
    refetchInterval: 5000, // Auto-refresh every 5 seconds to catch new channels
  });

  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ["/api/workspaces", workspaceId, "members"],
    enabled: isAuthenticated && !!workspaceId,
  });

  // WebSocket connection
  const { sendMessage, isConnected } = useSocketIO({
    onConnect: () => {
      console.log("Connected to WebSocket");
      if (user?.id && workspaceId) {
        sendMessage({
          type: "auth",
          userId: user.id,
          workspaceId: workspaceId,
          channelId: selectedChannelId,
        });
      }
    },
    onMessage: (message) => {
      console.log("WebSocket message received:", message);
      
      // Handle channel updates
      if (message.type === 'channel_created' || message.type === 'new_channel') {
        console.log("🆕 New channel detected, refreshing channel list");
        refetchChannels();
      }
      
      // Handle other messages, typing indicators, etc.
    },
    onError: (error) => {
      console.error("WebSocket error:", error);
      toast({
        title: "Connection Error",
        description: "Lost connection to the server. Trying to reconnect...",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  useEffect(() => {
    // Auto-select first channel if available
    if (channels && channels.length > 0 && !selectedChannelId) {
      setSelectedChannelId(channels[0].id);
    }
  }, [channels, selectedChannelId]);

  useEffect(() => {
    // Update WebSocket channel subscription when channel changes
    if (isConnected && selectedChannelId) {
      sendMessage({
        type: "join_channel",
        channelId: selectedChannelId,
      });
    }
  }, [selectedChannelId, isConnected, sendMessage]);

  if (isLoading || workspaceLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <LoadingSpinner size="lg" className="text-white" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Workspace not found</h2>
          <p className="text-gray-300">The workspace you're looking for doesn't exist or you don't have access to it.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900/90 backdrop-blur-sm border-r border-gray-700/50">
        <Sidebar
          workspace={workspace}
          channels={channels || []}
          members={members || []}
          selectedChannelId={selectedChannelId}
          selectedUserId={selectedUserId}
          onChannelSelect={setSelectedChannelId}
          onUserSelect={setSelectedUserId}
          isLoading={channelsLoading || membersLoading}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <ChatArea
          workspaceId={workspaceId!}
          channelId={selectedChannelId}
          recipientId={selectedUserId}
          channels={channels || []}
          members={members || []}
          sendMessage={sendMessage}
          isConnected={isConnected}
        />
      </div>

      {/* Right Panel */}
      <div className="w-80 bg-gray-900/90 backdrop-blur-sm border-l border-gray-700/50">
        <RightPanel
          workspaceId={workspaceId!}
          channelId={selectedChannelId}
          members={members || []}
        />
      </div>
    </div>
  );
}
