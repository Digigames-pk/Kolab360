import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Mail, Send, Sparkles, UserPlus, Bell, FileText } from "lucide-react";

export default function EmailTest() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [welcomeData, setWelcomeData] = useState({
    email: user?.email || "",
    name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
    role: "user"
  });

  const [inviteData, setInviteData] = useState({
    email: "",
    workspaceName: "CollabSpace Demo",
    inviteCode: "DEMO123",
    recipientName: ""
  });

  const [summaryData, setSummaryData] = useState({
    email: user?.email || "",
    workspaceName: "CollabSpace Demo",
    dateRange: "January 18, 2025",
    summary: "Today your team had 15 new messages across 3 channels. Key highlights:\n\n• New project proposal discussed in #general\n• Bug fixes completed in #dev-team\n• Weekly standup scheduled for tomorrow\n\nThe AI detected positive sentiment overall with productive discussions about upcoming milestones."
  });

  const [mentionData, setMentionData] = useState({
    email: user?.email || "",
    mentionedBy: "John Doe",
    channelName: "general",
    messagePreview: "Hey @everyone, don't forget about the meeting tomorrow at 2 PM!",
    workspaceName: "CollabSpace Demo"
  });

  const sendTestEmail = async (type: string, data: any) => {
    setLoading(true);
    try {
      const response = await apiRequest("POST", `/api/email/send-${type}`, data);
      toast({
        title: "Email sent!",
        description: `Test ${type} email has been sent successfully.`,
      });
    } catch (error) {
      toast({
        title: "Email failed",
        description: `Failed to send ${type} email. Check console for details.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Email Template Testing</h1>
              <p className="text-muted-foreground">Test Resend.com integration with modern email templates</p>
            </div>
          </div>
        </div>

        {/* Email Templates Testing */}
        <Tabs defaultValue="welcome" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="welcome" className="flex items-center space-x-2">
              <UserPlus className="h-4 w-4" />
              <span>Welcome</span>
            </TabsTrigger>
            <TabsTrigger value="invite" className="flex items-center space-x-2">
              <Send className="h-4 w-4" />
              <span>Invite</span>
            </TabsTrigger>
            <TabsTrigger value="summary" className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4" />
              <span>AI Summary</span>
            </TabsTrigger>
            <TabsTrigger value="mention" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span>Mention</span>
            </TabsTrigger>
          </TabsList>

          {/* Welcome Email */}
          <TabsContent value="welcome">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserPlus className="h-5 w-5 text-blue-500" />
                  <span>Welcome Email Template</span>
                </CardTitle>
                <CardDescription>
                  Test the welcome email sent to new users when they register
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="welcome-email">Email Address</Label>
                    <Input
                      id="welcome-email"
                      value={welcomeData.email}
                      onChange={(e) => setWelcomeData({ ...welcomeData, email: e.target.value })}
                      placeholder="user@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="welcome-name">Full Name</Label>
                    <Input
                      id="welcome-name"
                      value={welcomeData.name}
                      onChange={(e) => setWelcomeData({ ...welcomeData, name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="welcome-role">User Role</Label>
                  <Select value={welcomeData.role} onValueChange={(value) => setWelcomeData({ ...welcomeData, role: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={() => sendTestEmail("welcome", welcomeData)}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Sending..." : "Send Welcome Email"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workspace Invite Email */}
          <TabsContent value="invite">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Send className="h-5 w-5 text-green-500" />
                  <span>Workspace Invitation Email</span>
                </CardTitle>
                <CardDescription>
                  Test the invitation email sent when inviting users to workspaces
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invite-email">Recipient Email</Label>
                    <Input
                      id="invite-email"
                      value={inviteData.email}
                      onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                      placeholder="colleague@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invite-name">Recipient Name (Optional)</Label>
                    <Input
                      id="invite-name"
                      value={inviteData.recipientName}
                      onChange={(e) => setInviteData({ ...inviteData, recipientName: e.target.value })}
                      placeholder="Jane Smith"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="workspace-name">Workspace Name</Label>
                    <Input
                      id="workspace-name"
                      value={inviteData.workspaceName}
                      onChange={(e) => setInviteData({ ...inviteData, workspaceName: e.target.value })}
                      placeholder="My Awesome Team"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invite-code">Invite Code</Label>
                    <Input
                      id="invite-code"
                      value={inviteData.inviteCode}
                      onChange={(e) => setInviteData({ ...inviteData, inviteCode: e.target.value })}
                      placeholder="ABC123"
                    />
                  </div>
                </div>
                <Button 
                  onClick={() => sendTestEmail("invite", inviteData)}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Sending..." : "Send Workspace Invitation"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Summary Email */}
          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  <span>AI Summary Email</span>
                </CardTitle>
                <CardDescription>
                  Test the AI-generated daily summary email sent to users
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="summary-email">Email Address</Label>
                    <Input
                      id="summary-email"
                      value={summaryData.email}
                      onChange={(e) => setSummaryData({ ...summaryData, email: e.target.value })}
                      placeholder="user@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="summary-workspace">Workspace Name</Label>
                    <Input
                      id="summary-workspace"
                      value={summaryData.workspaceName}
                      onChange={(e) => setSummaryData({ ...summaryData, workspaceName: e.target.value })}
                      placeholder="Development Team"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date-range">Date Range</Label>
                  <Input
                    id="date-range"
                    value={summaryData.dateRange}
                    onChange={(e) => setSummaryData({ ...summaryData, dateRange: e.target.value })}
                    placeholder="January 18, 2025"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="summary-content">AI Summary Content</Label>
                  <Textarea
                    id="summary-content"
                    value={summaryData.summary}
                    onChange={(e) => setSummaryData({ ...summaryData, summary: e.target.value })}
                    placeholder="Enter the AI-generated summary content..."
                    rows={6}
                  />
                </div>
                <Button 
                  onClick={() => sendTestEmail("ai-summary", summaryData)}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Sending..." : "Send AI Summary"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mention Notification Email */}
          <TabsContent value="mention">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-orange-500" />
                  <span>Mention Notification Email</span>
                </CardTitle>
                <CardDescription>
                  Test the notification email sent when users are mentioned in messages
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mention-email">Email Address</Label>
                    <Input
                      id="mention-email"
                      value={mentionData.email}
                      onChange={(e) => setMentionData({ ...mentionData, email: e.target.value })}
                      placeholder="user@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mentioned-by">Mentioned By</Label>
                    <Input
                      id="mentioned-by"
                      value={mentionData.mentionedBy}
                      onChange={(e) => setMentionData({ ...mentionData, mentionedBy: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="channel-name">Channel Name</Label>
                    <Input
                      id="channel-name"
                      value={mentionData.channelName}
                      onChange={(e) => setMentionData({ ...mentionData, channelName: e.target.value })}
                      placeholder="general"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mention-workspace">Workspace Name</Label>
                    <Input
                      id="mention-workspace"
                      value={mentionData.workspaceName}
                      onChange={(e) => setMentionData({ ...mentionData, workspaceName: e.target.value })}
                      placeholder="Development Team"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message-preview">Message Preview</Label>
                  <Textarea
                    id="message-preview"
                    value={mentionData.messagePreview}
                    onChange={(e) => setMentionData({ ...mentionData, messagePreview: e.target.value })}
                    placeholder="Hey @john, can you review this PR when you get a chance?"
                    rows={3}
                  />
                </div>
                <Button 
                  onClick={() => sendTestEmail("mention", mentionData)}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Sending..." : "Send Mention Notification"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Info Card */}
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <span>Email Testing Instructions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>• All emails are sent using Resend.com with modern HTML templates</p>
              <p>• Templates include responsive design, gradient backgrounds, and professional styling</p>
              <p>• Check your email inbox (including spam folder) after sending test emails</p>
              <p>• Templates are optimized for both desktop and mobile email clients</p>
              <p>• Each template includes proper branding and call-to-action buttons</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}