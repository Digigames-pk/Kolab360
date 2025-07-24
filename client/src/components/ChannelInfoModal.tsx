import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Info, 
  Users, 
  Settings, 
  Hash, 
  Lock, 
  Calendar,
  MessageSquare,
  Pin,
  Archive,
  Trash2,
  Edit3,
  Save,
  X
} from 'lucide-react';

interface ChannelInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  channelName: string;
}

export function ChannelInfoModal({ isOpen, onClose, channelName }: ChannelInfoModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [channelInfo, setChannelInfo] = useState({
    name: channelName,
    description: 'Company-wide announcements and general discussion',
    purpose: 'This channel is for team-wide communication and important updates.',
    privacy: 'public',
    retention: '30days'
  });

  // Mock channel data
  const channelStats = {
    totalMessages: 1247,
    totalMembers: 42,
    createdDate: '2024-01-15',
    pinnedMessages: 3,
    files: 156,
    lastActivity: '2 minutes ago'
  };

  const channelMembers = [
    { id: '1', name: 'John Doe', email: 'john@company.com', avatar: 'JD', role: 'Admin', online: true },
    { id: '2', name: 'Alice Johnson', email: 'alice@company.com', avatar: 'AJ', role: 'Member', online: true },
    { id: '3', name: 'Bob Smith', email: 'bob@company.com', avatar: 'BS', role: 'Member', online: false },
    { id: '4', name: 'Carol Davis', email: 'carol@company.com', avatar: 'CD', role: 'Member', online: true },
    { id: '5', name: 'David Wilson', email: 'david@company.com', avatar: 'DW', role: 'Member', online: false },
  ];

  const handleSave = () => {
    setIsEditing(false);
    console.log('Saving channel info:', channelInfo);
    alert('Channel information updated successfully');
  };

  const handleArchive = () => {
    if (confirm(`Are you sure you want to archive #${channelName}? This will hide the channel from the sidebar.`)) {
      console.log('Archiving channel:', channelName);
      alert(`Channel #${channelName} has been archived`);
      onClose();
    }
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to DELETE #${channelName}? This action cannot be undone and will permanently remove all messages and files.`)) {
      try {
        console.log('Deleting channel:', channelId);
        const response = await fetch(`/api/channels/${channelId}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        
        if (response.ok) {
          alert(`Channel #${channelName} has been deleted successfully`);
          // Refresh the channels list
          window.location.reload();
        } else {
          alert('Failed to delete channel. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting channel:', error);
        alert('Failed to delete channel. Please try again.');
      }
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {channelInfo.privacy === 'private' ? (
                <Lock className="h-5 w-5 text-gray-500" />
              ) : (
                <Hash className="h-5 w-5 text-gray-500" />
              )}
              <span>#{channelInfo.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Channel
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="about" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-6">
            {/* Channel Statistics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{channelStats.totalMessages.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Messages</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{channelStats.totalMembers}</p>
                <p className="text-sm text-gray-600">Members</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <Pin className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{channelStats.pinnedMessages}</p>
                <p className="text-sm text-gray-600">Pinned</p>
              </div>
            </div>

            <Separator />

            {/* Channel Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Channel Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="channelName">Channel Name</Label>
                  <Input
                    id="channelName"
                    value={channelInfo.name}
                    onChange={(e) => setChannelInfo({...channelInfo, name: e.target.value})}
                    disabled={!isEditing}
                    className="mt-1"
                    placeholder="Enter channel name"
                  />
                </div>
                <div>
                  <Label htmlFor="privacy">Privacy</Label>
                  <Select 
                    value={channelInfo.privacy} 
                    onValueChange={(value) => setChannelInfo({...channelInfo, privacy: value})}
                    disabled={!isEditing}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">🌐 Public - Anyone can join</SelectItem>
                      <SelectItem value="private">🔒 Private - Invite only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={channelInfo.description}
                  onChange={(e) => setChannelInfo({...channelInfo, description: e.target.value})}
                  disabled={!isEditing}
                  className="mt-1"
                  placeholder="Brief channel description"
                />
              </div>

              <div>
                <Label htmlFor="purpose">Purpose</Label>
                <Textarea
                  id="purpose"
                  value={channelInfo.purpose}
                  onChange={(e) => setChannelInfo({...channelInfo, purpose: e.target.value})}
                  disabled={!isEditing}
                  className="mt-1 min-h-20"
                  placeholder="What is this channel for?"
                />
              </div>
            </div>

            <Separator />

            {/* Channel Details */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Created</p>
                  <p className="font-medium">{new Date(channelStats.createdDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Last Activity</p>
                  <p className="font-medium">{channelStats.lastActivity}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total Files</p>
                  <p className="font-medium">{channelStats.files} files shared</p>
                </div>
                <div>
                  <p className="text-gray-600">Channel ID</p>
                  <p className="font-medium text-xs font-mono">ch_{channelName}_001</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Channel Members ({channelMembers.length})</h3>
              <Button size="sm">
                <Users className="h-4 w-4 mr-2" />
                Invite Members
              </Button>
            </div>

            <ScrollArea className="h-96">
              <div className="space-y-3">
                {channelMembers.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-blue-600 text-white">
                            {member.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
                          member.online ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={member.role === 'Admin' ? 'default' : 'secondary'}>
                        {member.role}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <h3 className="text-lg font-semibold">Channel Settings</h3>
            
            <div className="space-y-4">
              <div>
                <Label>Message Retention</Label>
                <Select 
                  value={channelInfo.retention} 
                  onValueChange={(value) => setChannelInfo({...channelInfo, retention: value})}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">7 days</SelectItem>
                    <SelectItem value="30days">30 days</SelectItem>
                    <SelectItem value="90days">90 days</SelectItem>
                    <SelectItem value="1year">1 year</SelectItem>
                    <SelectItem value="forever">Forever</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium text-red-600">Danger Zone</h4>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-orange-600 border-orange-300 hover:bg-orange-50"
                    onClick={handleArchive}
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Archive Channel
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-600 border-red-300 hover:bg-red-50"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Channel
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <h3 className="text-lg font-semibold">Channel Integrations</h3>
            <div className="text-center py-8">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No integrations configured for this channel</p>
              <Button className="mt-4">
                Add Integration
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}