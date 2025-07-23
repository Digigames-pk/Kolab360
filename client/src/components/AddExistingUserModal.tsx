import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, UserPlus, Building2, Mail, User, Shield } from 'lucide-react';

interface AllUser {
  email: string;
  firstName: string;
  lastName: string;
  organizations: Array<{
    id: number;
    name: string;
    role: string;
    status: string;
  }>;
}

interface AddExistingUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: number;
  organizationName: string;
  onUserAdded: () => void;
}

export function AddExistingUserModal({
  isOpen,
  onClose,
  organizationId,
  organizationName,
  onUserAdded
}: AddExistingUserModalProps) {
  const [allUsers, setAllUsers] = useState<AllUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AllUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('member');
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const { toast } = useToast();

  // Fetch all users when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAllUsers();
    }
  }, [isOpen]);

  // Filter users based on search term and exclude those already in current organization
  useEffect(() => {
    let filtered = allUsers.filter(user => {
      // Exclude users already in current organization
      const alreadyInOrg = user.organizations.some(org => org.id === organizationId);
      if (alreadyInOrg) return false;

      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          user.email.toLowerCase().includes(searchLower) ||
          user.firstName.toLowerCase().includes(searchLower) ||
          user.lastName.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });

    setFilteredUsers(filtered);
  }, [allUsers, searchTerm, organizationId]);

  const fetchAllUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/all-users', {
        credentials: 'include'
      });
      if (response.ok) {
        const users = await response.json();
        setAllUsers(users);
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addUserToOrganization = async (userEmail: string) => {
    setIsAddingUser(true);
    try {
      const response = await fetch(`/api/organizations/${organizationId}/add-existing-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: userEmail,
          role: selectedRole
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Success",
          description: `User ${userEmail} added to ${organizationName}`,
        });
        onUserAdded();
        onClose();
        setSearchTerm('');
        setSelectedRole('member');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add user');
      }
    } catch (error: any) {
      console.error('Error adding user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add user to organization",
        variant: "destructive"
      });
    } finally {
      setIsAddingUser(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add Existing User to {organizationName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Search and Role Selection */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users List */}
          <div className="flex-1 overflow-y-auto border rounded-lg">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">
                Loading users...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {searchTerm ? 'No users found matching your search' : 'No eligible users found'}
              </div>
            ) : (
              <div className="divide-y">
                {filteredUsers.map((user) => (
                  <div key={user.email} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{user.firstName} {user.lastName}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {user.organizations.map((org) => (
                          <Badge key={org.id} variant="secondary" className="text-xs">
                            <Building2 className="h-3 w-3 mr-1" />
                            {org.name} ({org.role})
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      onClick={() => addUserToOrganization(user.email)}
                      disabled={isAddingUser}
                      size="sm"
                      className="ml-4"
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Add as {selectedRole}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}