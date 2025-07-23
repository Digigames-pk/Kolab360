import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Search, User, Users } from 'lucide-react';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface StartDMModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartDM: (user: User) => void;
}

export function StartDMModal({ isOpen, onClose, onStartDM }: StartDMModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch users when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  // Filter users based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter(user =>
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/users/search');
      if (response.ok) {
        const userData = await response.json();
        setUsers(userData);
        setFilteredUsers(userData);
      } else {
        toast({
          title: "Error",
          description: "Failed to load users",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setUsers([]);
    setFilteredUsers([]);
    onClose();
  };

  const handleSelectUser = (user: User) => {
    onStartDM(user);
    handleClose();
  };

  const getUserInitials = (user: User) => {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Start a direct message</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="search">Find a person</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="pl-10"
              />
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">People</span>
              <Badge variant="secondary" className="text-xs">
                {filteredUsers.length} found
              </Badge>
            </div>
            
            <ScrollArea className="h-60 border rounded-lg">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredUsers.length > 0 ? (
                <div className="space-y-1 p-2">
                  {filteredUsers.map((user) => (
                    <Button
                      key={user.id}
                      variant="ghost"
                      className="w-full justify-start h-auto p-3 hover:bg-gray-50"
                      onClick={() => handleSelectUser(user)}
                    >
                      <div className="flex items-center space-x-3 w-full">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-blue-600 text-white text-sm">
                            {getUserInitials(user)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-left">
                          <div className="font-medium text-sm">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {user.email}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-gray-500">Online</span>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <Users className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    {searchQuery ? 'No users found' : 'No users available'}
                  </p>
                  {searchQuery && (
                    <p className="text-xs text-gray-500 mt-1">
                      Try a different search term
                    </p>
                  )}
                </div>
              )}
            </ScrollArea>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}