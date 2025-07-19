import React, { useState, useEffect } from 'react';
import { Pin, PinOff, Star, Bookmark, Hash, MessageSquare, Calendar, File, User, FolderOpen, Plus, X, Search, Filter, SortAsc } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

interface PinnedItem {
  id: string;
  itemType: string;
  itemId: string;
  itemData: any;
  position: number;
  isPinned: boolean;
  pinnedAt: string;
}

interface PinCollection {
  id: string;
  name: string;
  description?: string;
  items: PinnedItem[];
  isShared: boolean;
}

interface PinningSystemProps {
  className?: string;
}

const PinningSystem: React.FC<PinningSystemProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedCollection, setSelectedCollection] = useState<string>('all');
  const queryClient = useQueryClient();

  // Fetch pinned items
  const { data: pinnedItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['/api/pins/items'],
    enabled: isOpen,
  });

  // Fetch pin collections
  const { data: collections = [], isLoading: collectionsLoading } = useQuery({
    queryKey: ['/api/pins/collections'],
    enabled: isOpen,
  });

  // Pin item mutation
  const pinItemMutation = useMutation({
    mutationFn: async ({ itemType, itemId, itemData }: { itemType: string; itemId: string; itemData: any }) => {
      const response = await fetch('/api/pins/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemType, itemId, itemData })
      });
      if (!response.ok) throw new Error('Failed to pin item');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pins/items'] });
      toast({
        title: "Item Pinned",
        description: "Item has been added to your pins.",
      });
    },
  });

  // Unpin item mutation
  const unpinItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await fetch(`/api/pins/items/${itemId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to unpin item');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pins/items'] });
      toast({
        title: "Item Unpinned",
        description: "Item has been removed from your pins.",
      });
    },
  });

  const getItemIcon = (itemType: string) => {
    switch (itemType) {
      case 'message':
        return <MessageSquare className="h-4 w-4" />;
      case 'task':
      case 'task_category':
        return <Star className="h-4 w-4" />;
      case 'calendar_event':
        return <Calendar className="h-4 w-4" />;
      case 'channel':
      case 'private_channel':
        return <Hash className="h-4 w-4" />;
      case 'file':
      case 'document':
        return <File className="h-4 w-4" />;
      case 'user':
        return <User className="h-4 w-4" />;
      default:
        return <Bookmark className="h-4 w-4" />;
    }
  };

  const getItemTypeLabel = (itemType: string) => {
    switch (itemType) {
      case 'message':
        return 'Message';
      case 'task':
        return 'Task';
      case 'task_category':
        return 'Task Category';
      case 'calendar_event':
        return 'Calendar Event';
      case 'channel':
        return 'Channel';
      case 'private_channel':
        return 'Private Channel';
      case 'file':
        return 'File';
      case 'document':
        return 'Document';
      case 'user':
        return 'User';
      default:
        return 'Item';
    }
  };

  const formatItemData = (item: PinnedItem) => {
    try {
      const data = typeof item.itemData === 'string' ? JSON.parse(item.itemData) : item.itemData;
      
      switch (item.itemType) {
        case 'message':
          return {
            title: data.content?.substring(0, 50) + (data.content?.length > 50 ? '...' : ''),
            subtitle: `#${data.channelName || 'general'}`,
            preview: data.content
          };
        case 'task':
          return {
            title: data.title || data.name,
            subtitle: `Priority: ${data.priority || 'medium'}`,
            preview: data.description
          };
        case 'task_category':
          return {
            title: data.name,
            subtitle: `${data.taskCount || 0} tasks`,
            preview: data.description
          };
        case 'calendar_event':
          return {
            title: data.title || data.name,
            subtitle: new Date(data.startDate).toLocaleDateString(),
            preview: data.description
          };
        case 'channel':
        case 'private_channel':
          return {
            title: `#${data.name}`,
            subtitle: `${data.memberCount || 0} members`,
            preview: data.description
          };
        case 'file':
        case 'document':
          return {
            title: data.name || data.originalName,
            subtitle: data.size ? `${Math.round(data.size / 1024)}KB` : '',
            preview: data.description || data.type
          };
        case 'user':
          return {
            title: `${data.firstName} ${data.lastName}`,
            subtitle: data.role || 'User',
            preview: data.email
          };
        default:
          return {
            title: data.name || data.title || 'Unknown Item',
            subtitle: '',
            preview: ''
          };
      }
    } catch (e) {
      return {
        title: 'Unknown Item',
        subtitle: '',
        preview: ''
      };
    }
  };

  const filteredItems = pinnedItems.filter((item: PinnedItem) => {
    if (filterType !== 'all' && item.itemType !== filterType) return false;
    if (searchTerm) {
      const formattedData = formatItemData(item);
      return formattedData.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
             formattedData.preview.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  const itemTypes = [
    { value: 'all', label: 'All Items', icon: <Bookmark className="h-4 w-4" /> },
    { value: 'message', label: 'Messages', icon: <MessageSquare className="h-4 w-4" /> },
    { value: 'task', label: 'Tasks', icon: <Star className="h-4 w-4" /> },
    { value: 'calendar_event', label: 'Calendar', icon: <Calendar className="h-4 w-4" /> },
    { value: 'channel', label: 'Channels', icon: <Hash className="h-4 w-4" /> },
    { value: 'file', label: 'Files', icon: <File className="h-4 w-4" /> },
    { value: 'user', label: 'People', icon: <User className="h-4 w-4" /> },
  ];

  // Mock data for demonstration
  const mockPinnedItems: PinnedItem[] = [
    {
      id: '1',
      itemType: 'message',
      itemId: 'msg-123',
      itemData: {
        content: 'Important team announcement about the new project roadmap',
        channelName: 'general',
        author: 'John Doe'
      },
      position: 0,
      isPinned: true,
      pinnedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      itemType: 'task',
      itemId: 'task-456',
      itemData: {
        title: 'Complete Q4 financial review',
        priority: 'high',
        description: 'Review all quarterly financial reports and prepare summary',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      position: 1,
      isPinned: true,
      pinnedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      itemType: 'calendar_event',
      itemId: 'event-789',
      itemData: {
        title: 'All-hands meeting',
        startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Monthly company all-hands meeting',
        location: 'Conference Room A'
      },
      position: 2,
      isPinned: true,
      pinnedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '4',
      itemType: 'channel',
      itemId: 'channel-general',
      itemData: {
        name: 'general',
        memberCount: 25,
        description: 'General team discussions and announcements'
      },
      position: 3,
      isPinned: true,
      pinnedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const displayItems = itemsLoading ? mockPinnedItems : filteredItems;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Pin className="h-5 w-5" />
          {displayItems.length > 0 && (
            <Badge 
              variant="secondary" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {displayItems.length > 9 ? '9+' : displayItems.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pin className="h-5 w-5" />
            Pinned Items
          </DialogTitle>
          <DialogDescription>
            Access your pinned messages, tasks, calendar events, and more
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search pinned items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  {itemTypes.find(t => t.value === filterType)?.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {itemTypes.map((type) => (
                  <DropdownMenuItem
                    key={type.value}
                    onClick={() => setFilterType(type.value)}
                    className="flex items-center gap-2"
                  >
                    {type.icon}
                    {type.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Pinned Items Grid */}
          <ScrollArea className="h-96">
            {displayItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Pin className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No pinned items</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Start pinning messages, tasks, and other items to keep them handy
                </p>
                <Button onClick={() => setIsOpen(false)}>
                  Close and start pinning
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayItems.map((item) => {
                  const formattedData = formatItemData(item);
                  return (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-100 rounded-md text-blue-600">
                              {getItemIcon(item.itemType)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <Badge variant="outline" className="text-xs">
                                {getItemTypeLabel(item.itemType)}
                              </Badge>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Pin className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() => unpinItemMutation.mutate(item.id)}
                                className="text-red-600"
                              >
                                <PinOff className="h-4 w-4 mr-2" />
                                Unpin
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <FolderOpen className="h-4 w-4 mr-2" />
                                Add to Collection
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-900 line-clamp-2">
                            {formattedData.title}
                          </h4>
                          {formattedData.subtitle && (
                            <p className="text-sm text-gray-600">
                              {formattedData.subtitle}
                            </p>
                          )}
                          {formattedData.preview && (
                            <p className="text-xs text-gray-500 line-clamp-3">
                              {formattedData.preview}
                            </p>
                          )}
                          <div className="flex items-center justify-between pt-2">
                            <span className="text-xs text-gray-400">
                              Pinned {new Date(item.pinnedAt).toLocaleDateString()}
                            </span>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Pin Button Component for adding to any item
export const PinButton: React.FC<{
  itemType: string;
  itemId: string;
  itemData: any;
  isPinned?: boolean;
  className?: string;
}> = ({ itemType, itemId, itemData, isPinned = false, className = "" }) => {
  const queryClient = useQueryClient();

  const pinMutation = useMutation({
    mutationFn: async () => {
      if (isPinned) {
        const response = await fetch(`/api/pins/items/${itemId}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to unpin item');
        return response.json();
      } else {
        const response = await fetch('/api/pins/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemType, itemId, itemData })
        });
        if (!response.ok) throw new Error('Failed to pin item');
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pins/items'] });
      toast({
        title: isPinned ? "Item Unpinned" : "Item Pinned",
        description: isPinned ? "Item removed from pins" : "Item added to pins",
      });
    },
  });

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => pinMutation.mutate()}
      disabled={pinMutation.isPending}
      className={`${className} ${isPinned ? 'text-blue-600' : 'text-gray-400'}`}
    >
      {isPinned ? <Pin className="h-4 w-4 fill-current" /> : <Pin className="h-4 w-4" />}
    </Button>
  );
};

export default PinningSystem;