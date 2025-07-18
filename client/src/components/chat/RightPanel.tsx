import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  BarChart3, 
  Users, 
  Zap, 
  Brain, 
  CheckSquare, 
  Calendar,
  TrendingUp,
  MessageCircle,
  Target,
  Clock
} from "lucide-react";

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

interface RightPanelProps {
  workspaceId: string;
  channelId: string | null;
  members: Member[];
}

export default function RightPanel({ workspaceId, channelId, members }: RightPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [sentiment, setSentiment] = useState({ rating: 4.6, confidence: 0.92 });
  const [activityLevel, setActivityLevel] = useState(85);

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["/api/workspaces", workspaceId, "tasks"],
    enabled: !!workspaceId,
  });

  const generateTasksMutation = useMutation({
    mutationFn: async () => {
      // Get recent messages for context
      const messagesResponse = channelId 
        ? await apiRequest("GET", `/api/channels/${channelId}/messages?limit=20`)
        : null;
      
      if (!messagesResponse) return [];
      
      const messages = await messagesResponse.json();
      const conversationText = messages.map((m: any) => m.content).join("\n");
      
      const response = await apiRequest("POST", "/api/ai/tasks", {
        conversationText,
        workspaceId,
        channelId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workspaces", workspaceId, "tasks"] });
      toast({
        title: "Success",
        description: "AI-generated tasks created successfully!",
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
        description: "Failed to generate tasks. Please try again.",
        variant: "destructive",
      });
    },
  });

  const chatWithAiMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await apiRequest("POST", "/api/ai/chat", {
        prompt,
        context: "workspace collaboration",
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "AI Assistant",
        description: data.response,
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
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    },
  });

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

  const getOnlineStatus = () => {
    // Simulate online status
    return Math.random() > 0.3 ? "online" : "away";
  };

  const handleAskAI = () => {
    const prompt = prompt("What would you like to ask the AI assistant?");
    if (prompt) {
      chatWithAiMutation.mutate(prompt);
    }
  };

  const handleGenerateTasks = () => {
    if (!channelId) {
      toast({
        title: "Error",
        description: "Please select a channel to generate tasks from conversation.",
        variant: "destructive",
      });
      return;
    }
    generateTasksMutation.mutate();
  };

  const getTaskStats = () => {
    if (!tasks) return { total: 0, completed: 0, inProgress: 0 };
    
    const total = tasks.length;
    const completed = tasks.filter((t: any) => t.status === "done").length;
    const inProgress = tasks.filter((t: any) => t.status === "in_progress").length;
    
    return { total, completed, inProgress };
  };

  const taskStats = getTaskStats();

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6">
      {/* AI Insights Panel */}
      <Card className="glassmorphism border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-white">
            <BarChart3 className="text-primary h-4 w-4" />
            <span>AI Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Team Sentiment</span>
              <span className="text-sm text-accent font-semibold">{Math.round(sentiment.rating * 20)}% Positive</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-accent to-green-400 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${sentiment.rating * 20}%` }}
              />
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Activity Level</span>
              <span className="text-sm text-orange-400 font-semibold">
                {activityLevel > 80 ? "High" : activityLevel > 50 ? "Medium" : "Low"}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-orange-400 to-red-400 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${activityLevel}%` }}
              />
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Task Progress</span>
              <span className="text-sm text-blue-400 font-semibold">
                {taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-400 to-cyan-400 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="glassmorphism border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-white">
            <TrendingUp className="text-primary h-4 w-4" />
            <span>Quick Stats</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <MessageCircle className="h-6 w-6 text-blue-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-white">324</div>
              <div className="text-xs text-gray-400">Messages</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <Target className="h-6 w-6 text-green-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-white">{taskStats.total}</div>
              <div className="text-xs text-gray-400">Tasks</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <Users className="h-6 w-6 text-purple-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-white">{members.length}</div>
              <div className="text-xs text-gray-400">Members</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <Clock className="h-6 w-6 text-orange-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-white">2.4h</div>
              <div className="text-xs text-gray-400">Avg Response</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Members */}
      <Card className="glassmorphism border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-white">
            <Users className="text-primary h-4 w-4" />
            <span>Active Members</span>
            <Badge variant="secondary" className="bg-accent text-white text-xs">
              {members.filter(() => getOnlineStatus() === "online").length} online
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {members.slice(0, 8).map((member) => {
            const isOnline = getOnlineStatus() === "online";
            
            return (
              <div key={member.userId} className="flex items-center space-x-3">
                <div className="relative">
                  {member.user.profileImageUrl ? (
                    <img
                      src={member.user.profileImageUrl}
                      alt={getUserDisplayName(member.user)}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {getUserInitials(member.user)}
                      </span>
                    </div>
                  )}
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-900 ${
                    isOnline ? "bg-green-400" : "bg-yellow-400"
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-white text-sm font-medium truncate">
                      {getUserDisplayName(member.user)}
                    </span>
                    {member.role === "owner" && (
                      <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-500">
                        Owner
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 capitalize">{member.role}</span>
                </div>
              </div>
            );
          })}
          
          {members.length > 8 && (
            <div className="text-center pt-2">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white text-xs">
                View all {members.length} members
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="glassmorphism border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-white">
            <Zap className="text-primary h-4 w-4" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button 
            className="w-full gradient-bg justify-start hover:shadow-lg transition-all"
            onClick={handleAskAI}
            disabled={chatWithAiMutation.isPending}
          >
            {chatWithAiMutation.isPending ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <Brain className="h-4 w-4 mr-2" />
            )}
            Ask AI Assistant
          </Button>
          
          <Button 
            className="w-full bg-gray-700/50 justify-start hover:bg-gray-700/70 transition-all text-white"
            variant="outline"
            onClick={handleGenerateTasks}
            disabled={generateTasksMutation.isPending || !channelId}
          >
            {generateTasksMutation.isPending ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <CheckSquare className="h-4 w-4 mr-2" />
            )}
            Generate Tasks
          </Button>
          
          <Button 
            className="w-full bg-gray-700/50 justify-start hover:bg-gray-700/70 transition-all text-white"
            variant="outline"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Meeting
          </Button>
        </CardContent>
      </Card>

      {/* Recent Tasks */}
      {tasksLoading ? (
        <Card className="glassmorphism border-white/10">
          <CardContent className="p-6 text-center">
            <LoadingSpinner className="text-white mx-auto" />
          </CardContent>
        </Card>
      ) : tasks && tasks.length > 0 ? (
        <Card className="glassmorphism border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-white">
              <CheckSquare className="text-primary h-4 w-4" />
              <span>Recent Tasks</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {tasks.slice(0, 5).map((task: any) => (
              <div key={task.id} className="bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${
                    task.status === "done" ? "bg-green-400" :
                    task.status === "in_progress" ? "bg-yellow-400" : "bg-gray-400"
                  }`} />
                  <span className="text-white text-sm font-medium truncate flex-1">
                    {task.title}
                  </span>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      task.priority === "high" ? "border-red-500 text-red-400" :
                      task.priority === "medium" ? "border-yellow-500 text-yellow-400" :
                      "border-gray-500 text-gray-400"
                    }`}
                  >
                    {task.priority}
                  </Badge>
                </div>
                {task.description && (
                  <p className="text-xs text-gray-400 truncate">{task.description}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
