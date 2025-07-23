import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Hash, Lock, Plus } from 'lucide-react';

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
}

export function CreateChannelModal({ isOpen, onClose, workspaceId }: CreateChannelModalProps) {
  const [channelName, setChannelName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createChannelMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string; isPrivate: boolean }) => {
      const response = await fetch('/api/channels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          workspaceId: workspaceId,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create channel');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/channels'] });
      toast({
        title: "Success",
        description: "Channel created successfully!",
      });
      handleClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create channel. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setChannelName('');
    setDescription('');
    setIsPrivate(false);
    onClose();
  };

  const handleSubmit = () => {
    if (!channelName.trim()) {
      toast({
        title: "Error",
        description: "Channel name is required.",
        variant: "destructive",
      });
      return;
    }
    
    createChannelMutation.mutate({
      name: channelName.trim().toLowerCase().replace(/\s+/g, '-'),
      description: description.trim() || undefined,
      isPrivate,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Create a new channel</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="channelName">Channel name</Label>
            <div className="relative mt-1">
              {isPrivate ? (
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              ) : (
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              )}
              <Input
                id="channelName"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                placeholder="e.g. marketing, design, development"
                className="pl-10"
                maxLength={80}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Names must be lowercase, without spaces or periods, and shorter than 80 characters.
            </p>
          </div>
          
          <div>
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this channel about?"
              rows={3}
              maxLength={250}
            />
            <p className="text-xs text-gray-500 mt-1">
              {description.length}/250
            </p>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="font-medium text-sm">Make private</div>
              <div className="text-xs text-gray-600">
                {isPrivate 
                  ? "Only specific people can access this channel"
                  : "Anyone in the workspace can join this channel"
                }
              </div>
            </div>
            <Switch
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={createChannelMutation.isPending || !channelName.trim()}
            >
              {createChannelMutation.isPending ? "Creating..." : "Create Channel"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}