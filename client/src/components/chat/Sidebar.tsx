import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { ChannelInviteModal } from "@/components/ChannelInviteModal";
import { 
  Home, 
  MessageSquare, 
  Brain, 
  Hash, 
  Lock, 
  Plus, 
  ChevronDown,
  Users,
  Settings,
  LogOut,
  Send
} from "lucide-react";

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

interface Workspace {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  inviteCode: string;
  createdAt: string;
  updatedAt: string;
}

interface SidebarProps {
  workspace: Workspace;
  channels: Channel[];
  members: Member[];
  selectedChannelId: string | null;
  selectedUserId: string | null;
  onChannelSelect: (channelId: string) => void;
  onUserSelect: (userId: string) => void;
  isLoading: boolean;
}

export default function Sidebar({
  workspace,
  channels,
  members,
  selectedChannelId,
  selectedUserId,
  onChannelSelect,
  onUserSelect,
  isLoading
}: SidebarProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [channelDescription, setChannelDescription] = useState("");
  const [isPrivateChannel, setIsPrivateChannel] = useState(false);

  const createChannelMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string; isPrivate: boolean }) => {
      const response = await apiRequest("POST", "/api/channels", {
        ...data,
        workspaceId: workspace.id,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workspaces", workspace.id, "channels"] });
      setShowCreateChannel(false);
      setChannelName("");
      setChannelDescription("");
      setIsPrivateChannel(false);
      toast({
        title: "Success",
        description: "Channel created successfully!",
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
        description: "Failed to create channel. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateChannel = () => {
    if (!channelName.trim()) {
      toast({
        title: "Error",
        description: "Channel name is required.",
        variant: "destructive",
      });
      return;
    }
    
    createChannelMutation.mutate({
      name: channelName.trim(),
      description: channelDescription.trim() || undefined,
      isPrivate: isPrivateChannel,
    });
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const getOnlineStatus = (userId: string) => {
    // In a real app, this would be based on WebSocket presence
    return Math.random() > 0.5 ? "online" : "away";
  };

  const getUserDisplayName = (user: Member["user"]) => {
    return user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || user.email;
  };

  const getUserInitials = (user: Member["user"]) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.firstName) {
      return user.firstName[0].toUpperCase();
    }
    return user.email[0].toUpperCase();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Workspace Header */}
      <div className="p-4 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {workspace.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">{workspace.name}</h3>
              <p className="text-gray-400 text-xs">{members.length} members</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {/* Navigation Items */}
          <div className="sidebar-item p-3 rounded-lg cursor-pointer bg-primary/20 text-primary">
            <div className="flex items-center space-x-3">
              <Home className="h-4 w-4" />
              <span className="font-medium">Home</span>
            </div>
          </div>
          
          <div className="sidebar-item p-3 rounded-lg cursor-pointer text-gray-300 hover:text-white">
            <div className="flex items-center space-x-3">
              <MessageSquare className="h-4 w-4" />
              <span className="font-medium">DMs</span>
            </div>
          </div>
          
          <div className="sidebar-item p-3 rounded-lg cursor-pointer text-gray-300 hover:text-white">
            <div className="flex items-center space-x-3">
              <Brain className="h-4 w-4" />
              <span className="font-medium">AI Assistant</span>
              <Badge variant="secondary" className="bg-accent text-white text-xs">NEW</Badge>
            </div>
          </div>

          {/* Channels Section */}
          <div className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-gray-400 text-sm font-semibold uppercase tracking-wide">Channels</h4>
              <div className="flex items-center space-x-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-400 hover:text-white h-6 w-6 p-0"
                  onClick={() => setShowInviteModal(true)}
                  title="Invite to workspace"
                >
                  <Send className="h-4 w-4" />
                </Button>
                <Dialog open={showCreateChannel} onOpenChange={setShowCreateChannel}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white h-6 w-6 p-0">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                <DialogContent className="glassmorphism-dark border-white/10">
                  <DialogHeader>
                    <DialogTitle className="text-white">Create Channel</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="channelName" className="text-gray-300">Channel Name</Label>
                      <Input
                        id="channelName"
                        value={channelName}
                        onChange={(e) => setChannelName(e.target.value)}
                        placeholder="e.g. general, design, development"
                        className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="channelDescription" className="text-gray-300">Description (optional)</Label>
                      <Textarea
                        id="channelDescription"
                        value={channelDescription}
                        onChange={(e) => setChannelDescription(e.target.value)}
                        placeholder="What's this channel about?"
                        className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="private"
                        checked={isPrivateChannel}
                        onCheckedChange={setIsPrivateChannel}
                      />
                      <Label htmlFor="private" className="text-gray-300">Make private</Label>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowCreateChannel(false)}
                        className="border-gray-600 text-gray-300 hover:text-white"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleCreateChannel}
                        disabled={createChannelMutation.isPending}
                        className="gradient-bg"
                      >
                        {createChannelMutation.isPending ? (
                          <LoadingSpinner size="sm" className="mr-2" />
                        ) : null}
                        Create Channel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
                </Dialog>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-4">
                <LoadingSpinner size="sm" className="text-gray-400" />
              </div>
            ) : (
              <div className="space-y-1">
                {channels.map((channel) => (
                  <div
                    key={channel.id}
                    className={`sidebar-item p-2 rounded-lg cursor-pointer transition-all ${
                      selectedChannelId === channel.id
                        ? "bg-primary/20 text-primary"
                        : "text-gray-300 hover:text-white"
                    }`}
                    onClick={() => onChannelSelect(channel.id)}
                  >
                    <div className="flex items-center space-x-3">
                      {channel.isPrivate ? (
                        <Lock className="h-4 w-4" />
                      ) : (
                        <Hash className="h-4 w-4" />
                      )}
                      <span className="text-sm truncate flex-1">{channel.name || 'Unnamed Channel'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Direct Messages */}
          <div className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-gray-400 text-sm font-semibold uppercase tracking-wide">Direct Messages</h4>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white h-6 w-6 p-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-4">
                <LoadingSpinner size="sm" className="text-gray-400" />
              </div>
            ) : (
              <div className="space-y-1">
                {members.slice(0, 5).map((member) => {
                  const isOnline = getOnlineStatus(member.userId) === "online";
                  const isSelected = selectedUserId === member.userId;
                  
                  return (
                    <div
                      key={member.userId}
                      className={`sidebar-item p-2 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? "bg-primary/20 text-primary"
                          : "text-gray-300 hover:text-white"
                      }`}
                      onClick={() => onUserSelect(member.userId)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          {member.user.profileImageUrl ? (
                            <img
                              src={member.user.profileImageUrl}
                              alt={getUserDisplayName(member.user)}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">
                                {getUserInitials(member.user)}
                              </span>
                            </div>
                          )}
                          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-900 ${
                            isOnline ? "bg-green-400" : "bg-yellow-400"
                          }`} />
                        </div>
                        <span className="text-sm truncate">
                          {getUserDisplayName(member.user)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-700/50 space-y-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-gray-300 hover:text-white"
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start text-gray-300 hover:text-white"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>

      {/* Channel Invite Modal */}
      <ChannelInviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        channelName={selectedChannelId ? channels.find(c => c.id === selectedChannelId)?.name || 'general' : 'general'}
        workspaceName={workspace.name}
        inviteCode={workspace.inviteCode}
      />
    </div>
  );
}
