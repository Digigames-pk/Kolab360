import React, { useState } from 'react';
import { Mail, Send, CheckCircle, AlertCircle, User, Calendar, FileText, Key, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';

interface EmailTestCenterProps {
  className?: string;
}

const EmailTestCenter: React.FC<EmailTestCenterProps> = ({ className }) => {
  const [selectedEmailType, setSelectedEmailType] = useState<string>('');
  const [recipientEmail, setRecipientEmail] = useState<string>('');
  const [isTestingEmail, setIsTestingEmail] = useState(false);

  const emailTypes = [
    {
      id: 'welcome',
      name: 'Welcome Email',
      description: 'New user onboarding email with setup instructions',
      icon: <User className="h-5 w-5" />,
      category: 'Authentication'
    },
    {
      id: 'mention',
      name: 'Mention Notification',
      description: 'Alert when user is mentioned in a message',
      icon: <Mail className="h-5 w-5" />,
      category: 'Communication'
    },
    {
      id: 'task_assigned',
      name: 'Task Assignment',
      description: 'Notification for new task assignments',
      icon: <FileText className="h-5 w-5" />,
      category: 'Tasks'
    },
    {
      id: 'calendar_invite',
      name: 'Calendar Invitation',
      description: 'Meeting invites with event details and links',
      icon: <Calendar className="h-5 w-5" />,
      category: 'Calendar'
    },
    {
      id: 'password_reset',
      name: 'Password Reset',
      description: 'Secure password reset with token link',
      icon: <Key className="h-5 w-5" />,
      category: 'Authentication'
    }
  ];

  const sendTestEmailMutation = useMutation({
    mutationFn: async ({ type, email }: { type: string; email: string }) => {
      const response = await fetch('/api/notifications/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, recipientEmail: email })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || 'Failed to send test email');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Test Email Sent",
        description: data.message || "Test email has been sent successfully.",
      });
      setSelectedEmailType('');
      setRecipientEmail('');
    },
    onError: (error: any) => {
      toast({
        title: "Email Send Failed",
        description: error.message || "Failed to send test email. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendTestEmail = () => {
    if (!selectedEmailType || !recipientEmail) {
      toast({
        title: "Missing Information",
        description: "Please select an email type and enter a recipient email.",
        variant: "destructive",
      });
      return;
    }

    sendTestEmailMutation.mutate({ type: selectedEmailType, email: recipientEmail });
  };

  const groupedEmailTypes = emailTypes.reduce((acc, emailType) => {
    if (!acc[emailType.category]) {
      acc[emailType.category] = [];
    }
    acc[emailType.category].push(emailType);
    return acc;
  }, {} as Record<string, typeof emailTypes>);

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Testing Suite</h2>
        <p className="text-gray-600">
          Test all email templates and notification types with real email delivery
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Test Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="emailType">Email Template Type</Label>
              <Select value={selectedEmailType} onValueChange={setSelectedEmailType}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Choose an email template to test" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(groupedEmailTypes).map(([category, types]) => (
                    <div key={category}>
                      <div className="px-2 py-1.5 text-sm font-semibold text-gray-500">
                        {category}
                      </div>
                      {types.map((emailType) => (
                        <SelectItem key={emailType.id} value={emailType.id}>
                          <div className="flex items-center gap-3">
                            {emailType.icon}
                            <div>
                              <div className="font-medium">{emailType.name}</div>
                              <div className="text-xs text-gray-500">{emailType.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="recipientEmail">Recipient Email Address</Label>
              <Input
                id="recipientEmail"
                type="email"
                placeholder="test@example.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Email will be sent to this address for testing
              </p>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <Button 
                onClick={handleSendTestEmail}
                disabled={!selectedEmailType || !recipientEmail || sendTestEmailMutation.isPending}
                className="flex items-center gap-2"
              >
                {sendTestEmailMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Test Email
                  </>
                )}
              </Button>
              
              {sendTestEmailMutation.isSuccess && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Email sent successfully!</span>
                </div>
              )}
              
              {sendTestEmailMutation.isError && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Failed to send email</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(groupedEmailTypes).map(([category, types]) => (
          <Card key={category}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{category}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {types.map((emailType) => (
                <div 
                  key={emailType.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedEmailType === emailType.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedEmailType(emailType.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 rounded-md">
                      {emailType.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900">
                        {emailType.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {emailType.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Email System Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Automated Notifications</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">@mentions</Badge>
                  <span className="text-sm text-gray-600">Real-time mention alerts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Task assignments</Badge>
                  <span className="text-sm text-gray-600">New task notifications</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Calendar invites</Badge>
                  <span className="text-sm text-gray-600">Meeting invitations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">File sharing</Badge>
                  <span className="text-sm text-gray-600">Document collaboration</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Email Templates</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Professional design</Badge>
                  <span className="text-sm text-gray-600">Kolab360 branding</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Mobile responsive</Badge>
                  <span className="text-sm text-gray-600">Optimized for all devices</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Rich content</Badge>
                  <span className="text-sm text-gray-600">HTML with fallback text</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Secure delivery</Badge>
                  <span className="text-sm text-gray-600">Resend.com integration</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailTestCenter;