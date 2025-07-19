import React, { useState } from 'react';
import { Send, Mail, Users, X, Copy, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface ChannelInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  channelName: string;
  workspaceName: string;
  inviteCode: string;
}

export function ChannelInviteModal({ 
  isOpen, 
  onClose, 
  channelName, 
  workspaceName, 
  inviteCode 
}: ChannelInviteModalProps) {
  const [emails, setEmails] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const addEmail = () => {
    const email = currentEmail.trim();
    if (email && isValidEmail(email) && !emails.includes(email)) {
      setEmails([...emails, email]);
      setCurrentEmail('');
    } else if (!isValidEmail(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
    } else if (emails.includes(email)) {
      toast({
        title: "Email already added",
        description: "This email is already in the list",
        variant: "destructive",
      });
    }
  };

  const removeEmail = (emailToRemove: string) => {
    setEmails(emails.filter(email => email !== emailToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addEmail();
    }
  };

  const sendInvitations = async () => {
    if (emails.length === 0) {
      toast({
        title: "No emails to send",
        description: "Please add at least one email address",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    
    try {
      const promises = emails.map(email => 
        fetch('/api/email/send-invite', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            workspaceName,
            inviteCode,
            personalMessage,
          }),
        })
      );

      await Promise.all(promises);
      
      toast({
        title: "Invitations sent!",
        description: `Successfully sent ${emails.length} invitation${emails.length > 1 ? 's' : ''}`,
      });
      
      // Reset form
      setEmails([]);
      setCurrentEmail('');
      setPersonalMessage('');
      onClose();
    } catch (error) {
      console.error('Error sending invitations:', error);
      toast({
        title: "Failed to send invitations",
        description: "Some invitations may not have been sent. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const copyInviteLink = async () => {
    const inviteLink = `${window.location.origin}/join/${inviteCode}`;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast({
        title: "Invite link copied!",
        description: "Share this link with your team members",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-500" />
            <span>Invite to #{channelName}</span>
          </DialogTitle>
          <DialogDescription>
            Invite team members to join the {channelName} channel in {workspaceName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Addresses</Label>
            <div className="flex space-x-2">
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={currentEmail}
                onChange={(e) => setCurrentEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={addEmail} size="sm" variant="outline">
                Add
              </Button>
            </div>
            
            {/* Email Tags */}
            {emails.length > 0 && (
              <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-md max-h-32 overflow-y-auto">
                {emails.map((email) => (
                  <Badge key={email} variant="secondary" className="flex items-center space-x-1">
                    <span>{email}</span>
                    <button onClick={() => removeEmail(email)} className="ml-1 hover:text-red-500">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Personal Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Personal Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a personal message to your invitation..."
              value={personalMessage}
              onChange={(e) => setPersonalMessage(e.target.value)}
              rows={3}
            />
          </div>

          {/* Invite Link */}
          <div className="space-y-2">
            <Label>Or share invite link</Label>
            <div className="flex space-x-2">
              <Input
                value={`${window.location.origin}/join/${inviteCode}`}
                readOnly
                className="flex-1 bg-gray-50"
              />
              <Button onClick={copyInviteLink} size="sm" variant="outline">
                {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="flex space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={sendInvitations} 
            disabled={sending || emails.length === 0}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {sending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Send {emails.length > 0 ? `${emails.length} ` : ''}Invitation{emails.length > 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}