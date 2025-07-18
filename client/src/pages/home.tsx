import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Link } from "wouter";
import { 
  Plus, 
  Users, 
  MessageSquare, 
  Brain,
  ArrowRight,
  Sparkles
} from "lucide-react";

interface Workspace {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  inviteCode: string;
  createdAt: string;
  updatedAt: string;
}

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();

  const { data: workspaces, isLoading: workspacesLoading } = useQuery({
    queryKey: ["/api/workspaces"],
    enabled: isAuthenticated,
  });

  const createWorkspaceMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const response = await apiRequest("POST", "/api/workspaces", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workspaces"] });
      toast({
        title: "Success",
        description: "Workspace created successfully!",
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
        description: "Failed to create workspace. Please try again.",
        variant: "destructive",
      });
    },
  });

  const joinWorkspaceMutation = useMutation({
    mutationFn: async (inviteCode: string) => {
      const response = await apiRequest("POST", "/api/workspaces/join", { inviteCode });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workspaces"] });
      toast({
        title: "Success",
        description: "Joined workspace successfully!",
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
        description: "Failed to join workspace. Please check the invite code.",
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

  const handleCreateWorkspace = () => {
    const name = prompt("Enter workspace name:");
    if (name) {
      const description = prompt("Enter workspace description (optional):");
      createWorkspaceMutation.mutate({ name, description: description || undefined });
    }
  };

  const handleJoinWorkspace = () => {
    const inviteCode = prompt("Enter invite code:");
    if (inviteCode) {
      joinWorkspaceMutation.mutate(inviteCode);
    }
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <LoadingSpinner size="lg" className="text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="glassmorphism-dark border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
                  <Brain className="text-white text-lg" />
                </div>
                <span className="text-xl font-bold text-white">CollabAI</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-300">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
                  </span>
                </div>
                <span className="hidden md:block">
                  {user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : user?.email}
                </span>
              </div>
              <Button variant="outline" onClick={handleLogout} className="border-white/20 text-gray-300 hover:text-white">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-gray-300">
            Choose a workspace to continue collaborating with your team.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card 
            className="glassmorphism border-white/10 cursor-pointer hover:scale-105 transition-transform duration-300"
            onClick={handleCreateWorkspace}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 gradient-bg rounded-lg flex items-center justify-center mx-auto mb-4">
                <Plus className="text-white h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Create Workspace</h3>
              <p className="text-gray-300 text-sm">
                Start a new workspace for your team
              </p>
            </CardContent>
          </Card>

          <Card 
            className="glassmorphism border-white/10 cursor-pointer hover:scale-105 transition-transform duration-300"
            onClick={handleJoinWorkspace}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="text-white h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Join Workspace</h3>
              <p className="text-gray-300 text-sm">
                Join an existing workspace with an invite code
              </p>
            </CardContent>
          </Card>

          <Card className="glassmorphism border-white/10">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Sparkles className="text-white h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">AI Features</h3>
              <p className="text-gray-300 text-sm">
                Discover powerful AI-driven collaboration tools
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Workspaces List */}
        <Card className="glassmorphism-dark border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Your Workspaces</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {workspacesLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner className="text-white" />
              </div>
            ) : !workspaces || workspaces.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No workspaces yet</h3>
                <p className="text-gray-300 mb-4">
                  Create your first workspace or join an existing one to get started.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={handleCreateWorkspace} className="gradient-bg">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Workspace
                  </Button>
                  <Button variant="outline" onClick={handleJoinWorkspace} className="border-white/20 text-gray-300 hover:text-white">
                    <Users className="h-4 w-4 mr-2" />
                    Join Workspace
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workspaces.map((workspace: Workspace) => (
                  <Link key={workspace.id} href={`/workspace/${workspace.id}`}>
                    <Card className="glassmorphism border-white/10 cursor-pointer hover:scale-105 transition-transform duration-300 h-full">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-10 h-10 gradient-bg rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold">
                              {workspace.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                            Active
                          </Badge>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">{workspace.name}</h3>
                        {workspace.description && (
                          <p className="text-gray-300 text-sm mb-4">{workspace.description}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1 text-gray-400 text-sm">
                            <Users className="h-4 w-4" />
                            <span>Team workspace</span>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
