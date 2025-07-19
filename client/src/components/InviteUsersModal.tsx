import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Search, 
  UserPlus, 
  Mail, 
  Copy, 
  Check,
  X,
  Users,
  Link2
} from 'lucide-react';

interface InviteUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  channelName: string;
}

export function InviteUsersModal({ isOpen, onClose, channelName }: InviteUsersModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  // Mock users data
  const availableUsers = [
    { id: '1', name: 'Alice Johnson', email: 'alice@company.com', avatar: 'AJ', online: true },
    { id: '2', name: 'Bob Smith', email: 'bob@company.com', avatar: 'BS', online: false },
    { id: '3', name: 'Carol Davis', email: 'carol@company.com', avatar: 'CD', online: true },
    { id: '4', name: 'David Wilson', email: 'david@company.com', avatar: 'DW', online: true },
    { id: '5', name: 'Emma Brown', email: 'emma@company.com', avatar: 'EB', online: false },
  ];

  const inviteLink = `https://workspace.company.com/invite/${channelName}?code=abc123`;

  const filteredUsers = availableUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleInviteUsers = () => {
    if (selectedUsers.length > 0) {
      console.log('Inviting users:', selectedUsers.map(id => 
        availableUsers.find(u => u.id === id)?.name
      ));
      alert(`Invited ${selectedUsers.length} user(s) to #${channelName}`);
      setSelectedUsers([]);
    }
  };

  const handleEmailInvite = () => {
    if (inviteEmail.trim()) {
      console.log('Sending email invite to:', inviteEmail);
      alert(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5" />
            <span>Invite People to #{channelName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invite Link Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center">
              <Link2 className="h-4 w-4 mr-2" />
              Share Invite Link
            </h3>
            <div className="flex items-center space-x-2">
              <Input
                value={inviteLink}
                readOnly
                className="flex-1 bg-gray-50 text-gray-600"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={copyInviteLink}
                className="flex items-center space-x-1"
              >
                {copySuccess ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Email Invite Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              Invite by Email
            </h3>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Enter email address..."
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleEmailInvite}
                disabled={!inviteEmail.trim()}
                size="sm"
              >
                Send Invite
              </Button>
            </div>
          </div>

          <Separator />

          {/* Team Members Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Invite Team Members
            </h3>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search team members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Selected Users */}
            {selectedUsers.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Selected ({selectedUsers.length})</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map(userId => {
                    const user = availableUsers.find(u => u.id === userId);
                    return user ? (
                      <Badge key={userId} variant="secondary" className="flex items-center space-x-1">
                        <span>{user.name}</span>
                        <button
                          onClick={() => toggleUserSelection(userId)}
                          className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {/* User List */}
            <ScrollArea className="h-64 border rounded-lg">
              <div className="p-2 space-y-1">
                {filteredUsers.map(user => (
                  <div
                    key={user.id}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedUsers.includes(user.id)
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => toggleUserSelection(user.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-blue-600 text-white text-sm">
                            {user.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
                          user.online ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className={`h-4 w-4 rounded border-2 flex items-center justify-center ${
                      selectedUsers.includes(user.id)
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-300'
                    }`}>
                      {selectedUsers.includes(user.id) && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4">
              <p className="text-sm text-gray-500">
                {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
              </p>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleInviteUsers}
                  disabled={selectedUsers.length === 0}
                >
                  Invite {selectedUsers.length > 0 ? `${selectedUsers.length} ` : ''}User{selectedUsers.length !== 1 ? 's' : ''}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}