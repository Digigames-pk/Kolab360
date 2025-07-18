import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  Settings, 
  LogOut,
  Crown,
  Shield,
  User,
  BarChart3,
  Zap
} from "lucide-react";

export default function Home() {
  const { user, logoutMutation } = useAuth();

  if (!user) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'default' as const;
      case 'admin':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  const formatRole = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const dashboardFeatures = [
    {
      title: "Workspaces",
      description: "Manage your team workspaces",
      icon: Users,
      count: "3 Active",
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950"
    },
    {
      title: "Messages",
      description: "Recent conversations",
      icon: MessageSquare,
      count: "12 Unread",
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950"
    },
    {
      title: "Tasks",
      description: "Your assigned tasks",
      icon: Calendar,
      count: "5 Pending",
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-950"
    },
    {
      title: "AI Assistant",
      description: "Smart productivity features",
      icon: Zap,
      count: "Available",
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950"
    }
  ];

  const adminFeatures = user.role === 'super_admin' || user.role === 'admin' ? [
    {
      title: "Analytics",
      description: "Platform insights and metrics",
      icon: BarChart3,
      color: "text-indigo-500",
      bgColor: "bg-indigo-50 dark:bg-indigo-950"
    },
    {
      title: "User Management",
      description: "Manage platform users",
      icon: Settings,
      color: "text-gray-500",
      bgColor: "bg-gray-50 dark:bg-gray-950"
    }
  ] : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-primary rounded-lg p-2">
              <MessageSquare className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">CollabSpace</h1>
              <p className="text-sm text-muted-foreground">Modern team collaboration</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback>
                  {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <p className="font-medium">{user.firstName} {user.lastName}</p>
                  {getRoleIcon(user.role)}
                </div>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                    {formatRole(user.role)}
                  </Badge>
                </div>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">
              Welcome back, {user.firstName}!
            </h2>
            <p className="text-muted-foreground">
              Here's what's happening in your workspace today
            </p>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dashboardFeatures.map((feature) => (
              <Card key={feature.title} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`${feature.bgColor} rounded-lg p-2`}>
                      <feature.icon className={`h-5 w-5 ${feature.color}`} />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      {feature.count}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg mb-1">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Admin Features */}
          {adminFeatures.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blue-500" />
                <h3 className="text-xl font-semibold">Administration</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {adminFeatures.map((feature) => (
                  <Card key={feature.title} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className={`${feature.bgColor} rounded-lg p-2 w-fit`}>
                        <feature.icon className={`h-5 w-5 ${feature.color}`} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardTitle className="text-lg mb-1">{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Get started with these common tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="h-auto flex-col space-y-2 p-6" variant="outline">
                  <Users className="h-6 w-6" />
                  <span>Create Workspace</span>
                </Button>
                <Button className="h-auto flex-col space-y-2 p-6" variant="outline">
                  <MessageSquare className="h-6 w-6" />
                  <span>Start Conversation</span>
                </Button>
                <Button className="h-auto flex-col space-y-2 p-6" variant="outline">
                  <Calendar className="h-6 w-6" />
                  <span>Create Task</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Demo Information */}
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <span>Demo Platform</span>
              </CardTitle>
              <CardDescription>
                You are currently using the demo version of CollabSpace with role-based authentication
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Your Role:</span>
                  <div className="flex items-center space-x-2">
                    {getRoleIcon(user.role)}
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {formatRole(user.role)}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {user.role === 'super_admin' && "You have full administrative access to all features and settings."}
                  {user.role === 'admin' && "You have administrative access to user management and analytics."}
                  {user.role === 'user' && "You have standard user access to workspaces, channels, and messaging."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}