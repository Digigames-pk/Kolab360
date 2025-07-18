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
  const [activeTab, setActiveTab] = useState("welcome");

  const [welcomeData, setWelcomeData] = useState({
    email: user?.email || "",
    name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
    role: "user"
  });

  const [inviteData, setInviteData] = useState({
    email: "",
    workspaceName: "Kolab360 Demo Team",
    inviteCode: "DEMO123",
    recipientName: ""
  });

  const [summaryData, setSummaryData] = useState({
    email: user?.email || "",
    workspaceName: "Kolab360 Demo Team",
    dateRange: "January 18, 2025",
    summary: "Today your team had 15 new messages across 3 channels. Key highlights:\n\n• New project proposal discussed in #general\n• Bug fixes completed in #dev-team\n• Weekly standup scheduled for tomorrow\n\nThe AI detected positive sentiment overall with productive discussions about upcoming milestones."
  });

  const [mentionData, setMentionData] = useState({
    email: user?.email || "",
    mentionedBy: "John Doe",
    channelName: "general",
    messagePreview: "Hey @everyone, don't forget about the meeting tomorrow at 2 PM!",
    workspaceName: "Kolab360 Demo Team"
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
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Email Templates
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Test Kolab360's professional email templates powered by Resend.com
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Template Navigation */}
        <div className="flex space-x-1 bg-muted/50 rounded-xl p-1 mb-8 max-w-2xl">
          <button
            onClick={() => setActiveTab("welcome")}
            className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === "welcome" 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <UserPlus className="h-4 w-4" />
            <span>Welcome</span>
          </button>
          <button
            onClick={() => setActiveTab("invite")}
            className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === "invite" 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Send className="h-4 w-4" />
            <span>Workspace Invite</span>
          </button>
          <button
            onClick={() => setActiveTab("summary")}
            className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === "summary" 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>AI Summary</span>
          </button>
          <button
            onClick={() => setActiveTab("mention")}
            className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === "mention" 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Bell className="h-4 w-4" />
            <span>Mention Alert</span>
          </button>
        </div>

        {/* Template Forms */}
        <div className="space-y-8">
          {activeTab === "welcome" && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <UserPlus className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">Welcome Email Template</h2>
                  <p className="text-muted-foreground">Test the welcome email sent to new users when they register</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-background to-muted/20 rounded-2xl p-8 border border-border/50 space-y-6">
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
                  className="w-full h-12 text-lg font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  {loading ? "Sending..." : "Send Welcome Email"}
                </Button>
              </div>
            </div>
          )}

          {activeTab === "invite" && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Send className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">Workspace Invitation Email</h2>
                  <p className="text-muted-foreground">Test the invitation email sent when inviting users to workspaces</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-background to-muted/20 rounded-2xl p-8 border border-border/50 space-y-6">
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
                  className="w-full h-12 text-lg font-medium bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                >
                  {loading ? "Sending..." : "Send Workspace Invitation"}
                </Button>
              </div>
            </div>
          )}

          {activeTab === "summary" && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">AI Summary Email</h2>
                  <p className="text-muted-foreground">Test the AI-generated daily summary email sent to users</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-background to-muted/20 rounded-2xl p-8 border border-border/50 space-y-6">
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
                  className="w-full h-12 text-lg font-medium bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                >
                  {loading ? "Sending..." : "Send AI Summary"}
                </Button>
              </div>
            </div>
          )}

          {activeTab === "mention" && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Bell className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">Mention Notification Email</h2>
                  <p className="text-muted-foreground">Test the notification email sent when users are mentioned in messages</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-background to-muted/20 rounded-2xl p-8 border border-border/50 space-y-6">
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
                  className="w-full h-12 text-lg font-medium bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                >
                  {loading ? "Sending..." : "Send Mention Notification"}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-12 p-8 bg-gradient-to-r from-muted/30 to-muted/10 rounded-2xl border border-border/30">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <FileText className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">Email Testing Instructions</h3>
              <div className="grid grid-cols-2 gap-4 text-muted-foreground">
                <div className="space-y-2">
                  <p>• All emails are sent using Resend.com with modern HTML templates</p>
                  <p>• Templates include responsive design and professional styling</p>
                  <p>• Emails are sent from noreply@kolab360.com</p>
                </div>
                <div className="space-y-2">
                  <p>• Check your email inbox (including spam folder) after testing</p>
                  <p>• Templates are optimized for both desktop and mobile clients</p>
                  <p>• Each template includes proper Kolab360 branding</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}