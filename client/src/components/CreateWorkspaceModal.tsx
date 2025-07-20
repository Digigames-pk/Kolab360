import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, Globe, Lock, Check } from 'lucide-react';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateWorkspace?: (workspace: any) => void;
}

export function CreateWorkspaceModal({ isOpen, onClose, onCreateWorkspace }: CreateWorkspaceModalProps) {
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceDescription, setWorkspaceDescription] = useState('');
  const [workspaceType, setWorkspaceType] = useState<'public' | 'private'>('public');
  const [creating, setCreating] = useState(false);

  const handleCreateWorkspace = async () => {
    if (!workspaceName.trim()) {
      alert('Please enter a workspace name');
      return;
    }

    setCreating(true);
    
    // Simulate API call
    setTimeout(() => {
      const newWorkspace = {
        id: Date.now(),
        name: workspaceName,
        description: workspaceDescription,
        type: workspaceType,
        createdAt: new Date().toISOString(),
        memberCount: 1
      };

      if (onCreateWorkspace) {
        onCreateWorkspace(newWorkspace);
      }

      // Reset form
      setWorkspaceName('');
      setWorkspaceDescription('');
      setWorkspaceType('public');
      setCreating(false);
      onClose();
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-purple-600" />
            <span>Create New Workspace</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Workspace Name */}
          <div className="space-y-2">
            <Label htmlFor="workspace-name">Workspace Name *</Label>
            <Input
              id="workspace-name"
              placeholder="e.g., Acme Corp, Design Team, Marketing Hub"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="text-lg"
            />
            <p className="text-sm text-gray-500">
              Choose a name that represents your team or organization
            </p>
          </div>

          {/* Workspace Description */}
          <div className="space-y-2">
            <Label htmlFor="workspace-description">Description</Label>
            <Textarea
              id="workspace-description"
              placeholder="Describe what this workspace is for..."
              value={workspaceDescription}
              onChange={(e) => setWorkspaceDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Workspace Type */}
          <div className="space-y-3">
            <Label>Workspace Type</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Card 
                className={`cursor-pointer transition-all ${
                  workspaceType === 'public' 
                    ? 'ring-2 ring-purple-500 bg-purple-50' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setWorkspaceType('public')}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {workspaceType === 'public' ? (
                        <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-green-600" />
                        <h3 className="font-medium">Public Workspace</h3>
                        <Badge variant="outline" className="text-xs">Recommended</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Anyone in your organization can discover and join this workspace
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all ${
                  workspaceType === 'private' 
                    ? 'ring-2 ring-purple-500 bg-purple-50' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setWorkspaceType('private')}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {workspaceType === 'private' ? (
                        <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Lock className="h-4 w-4 text-orange-600" />
                        <h3 className="font-medium">Private Workspace</h3>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Only invited members can access this workspace
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Preview */}
          {workspaceName && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-sm text-gray-700 mb-2">Preview</h4>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                  {workspaceName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-medium">{workspaceName}</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    {workspaceType === 'public' ? (
                      <Globe className="h-3 w-3" />
                    ) : (
                      <Lock className="h-3 w-3" />
                    )}
                    <span>{workspaceType === 'public' ? 'Public' : 'Private'} workspace</span>
                    <span>•</span>
                    <Users className="h-3 w-3" />
                    <span>1 member</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={creating}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateWorkspace} 
            disabled={!workspaceName.trim() || creating}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {creating ? 'Creating...' : 'Create Workspace'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}