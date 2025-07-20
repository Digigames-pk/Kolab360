import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { 
  Pin, 
  X, 
  Search, 
  Hash, 
  MessageSquare, 
  User, 
  File, 
  Calendar,
  Star,
  Filter,
  MoreHorizontal
} from 'lucide-react';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PinnedItem {
  id: string;
  type: 'message' | 'channel' | 'dm' | 'file' | 'task' | 'calendar' | 'user';
  title: string;
  description?: string;
  content?: string;
  timestamp: Date;
  author?: string;
  channelName?: string;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
}

interface PinningSystemProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PinningSystem({ isOpen, onClose }: PinningSystemProps) {
  const [pinnedItems, setPinnedItems] = useState<PinnedItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Mock pinned items for demonstration
  useEffect(() => {
    const mockPinnedItems: PinnedItem[] = [
      {
        id: '1',
        type: 'message',
        title: 'Important project update',
        content: 'The new feature rollout is scheduled for next week. Please review the documentation and prepare for deployment.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        author: 'Sarah Wilson',
        channelName: 'general',
        tags: ['project', 'urgent'],
        priority: 'high'
      },
      {
        id: '2',
        type: 'channel',
        title: '#design-system',
        description: 'Channel for design system discussions and updates',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        tags: ['design', 'reference'],
        priority: 'medium'
      },
      {
        id: '3',
        type: 'dm',
        title: 'Alex Johnson',
        description: 'Direct message conversation about quarterly planning',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
        tags: ['planning', 'quarterly'],
        priority: 'medium'
      },
      {
        id: '4',
        type: 'file',
        title: 'Q4_Budget_Report.pdf',
        description: 'Financial summary and projections for Q4',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
        author: 'Mike Chen',
        tags: ['finance', 'report'],
        priority: 'high'
      },
      {
        id: '5',
        type: 'calendar',
        title: 'Sprint Planning Meeting',
        description: 'Monthly sprint planning session with the dev team',
        timestamp: new Date(Date.now() + 1000 * 60 * 60 * 24),
        tags: ['meeting', 'sprint'],
        priority: 'high'
      }
    ];
    
    setPinnedItems(mockPinnedItems);
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'message': return <MessageSquare className="h-4 w-4" />;
      case 'channel': return <Hash className="h-4 w-4" />;
      case 'dm': return <User className="h-4 w-4" />;
      case 'file': return <File className="h-4 w-4" />;
      case 'calendar': return <Calendar className="h-4 w-4" />;
      case 'task': return <Star className="h-4 w-4" />;
      default: return <Pin className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'message': return 'text-blue-600 bg-blue-100';
      case 'channel': return 'text-green-600 bg-green-100';
      case 'dm': return 'text-purple-600 bg-purple-100';
      case 'file': return 'text-orange-600 bg-orange-100';
      case 'calendar': return 'text-red-600 bg-red-100';
      case 'task': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  const filteredItems = pinnedItems.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = filterType === 'all' || item.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const unpinItem = (id: string) => {
    setPinnedItems(prev => prev.filter(item => item.id !== id));
  };

  const typeStats = pinnedItems.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Pin className="h-5 w-5" />
            <span>Pinned Items</span>
            <Badge variant="secondary">{pinnedItems.length}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search and Filter Controls */}
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search pinned items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center space-x-2">
                  <Filter className="h-4 w-4" />
                  <span>{filterType === 'all' ? 'All Types' : filterType}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterType('all')}>
                  All Types ({pinnedItems.length})
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {Object.entries(typeStats).map(([type, count]) => (
                  <DropdownMenuItem key={type} onClick={() => setFilterType(type)}>
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(type)}
                      <span className="capitalize">{type}s ({count})</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-6 gap-2">
            {Object.entries(typeStats).map(([type, count]) => (
              <Button
                key={type}
                variant={filterType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType(filterType === type ? 'all' : type)}
                className="flex items-center space-x-1"
              >
                {getTypeIcon(type)}
                <span className="text-xs">{count}</span>
              </Button>
            ))}
          </div>

          <Separator />

          {/* Pinned Items List */}
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {filteredItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Pin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No pinned items found</p>
                  <p className="text-sm">Pin messages, channels, or files to access them quickly</p>
                </div>
              ) : (
                filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 border border-l-4 rounded-lg bg-white hover:bg-gray-50 transition-colors ${getPriorityColor(item.priority)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={`${getTypeColor(item.type)} text-xs`}>
                            {getTypeIcon(item.type)}
                            <span className="ml-1 capitalize">{item.type}</span>
                          </Badge>
                          
                          {item.priority && (
                            <Badge 
                              variant={item.priority === 'high' ? 'destructive' : item.priority === 'medium' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {item.priority}
                            </Badge>
                          )}
                          
                          <span className="text-xs text-gray-500">
                            {item.timestamp.toLocaleDateString()} {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        
                        <h3 className="font-medium text-gray-900 mb-1">{item.title}</h3>
                        
                        {item.description && (
                          <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                        )}
                        
                        {item.content && (
                          <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded border-l-2 border-gray-200 mb-2">
                            {item.content}
                          </p>
                        )}
                        
                        {item.author && (
                          <p className="text-xs text-gray-500">
                            by {item.author}
                            {item.channelName && ` in #${item.channelName}`}
                          </p>
                        )}
                        
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-1 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => unpinItem(item.id)}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>View Original</DropdownMenuItem>
                            <DropdownMenuItem>Edit Tags</DropdownMenuItem>
                            <DropdownMenuItem>Change Priority</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => unpinItem(item.id)}
                            >
                              Unpin
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}