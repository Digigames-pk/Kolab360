import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  User, 
  FileText, 
  MessageSquare, 
  Hash, 
  Clock,
  Download,
  Star,
  X,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface SearchResult {
  id: string;
  type: 'message' | 'file' | 'task' | 'document';
  title: string;
  content: string;
  author: string;
  channel: string;
  timestamp: string;
  relevance: number;
  metadata?: Record<string, any>;
}

const MOCK_RESULTS: SearchResult[] = [
  {
    id: '1',
    type: 'message',
    title: 'Project kickoff meeting notes',
    content: 'We discussed the new project timeline and resource allocation. The development team will start with the authentication system...',
    author: 'Sarah Chen',
    channel: 'general',
    timestamp: '2024-01-15T10:30:00Z',
    relevance: 95
  },
  {
    id: '2',
    type: 'file',
    title: 'design-mockups-v2.pdf',
    content: 'PDF document containing updated UI mockups for the dashboard redesign project.',
    author: 'Alex Rodriguez',
    channel: 'design',
    timestamp: '2024-01-14T15:45:00Z',
    relevance: 88
  },
  {
    id: '3',
    type: 'task',
    title: 'Implement user authentication',
    content: 'Create secure login and registration system with JWT tokens and password reset functionality.',
    author: 'Emma Davis',
    channel: 'development',
    timestamp: '2024-01-13T09:15:00Z',
    relevance: 92
  },
  {
    id: '4',
    type: 'document',
    title: 'API Documentation v3.1',
    content: 'Complete documentation for the REST API endpoints including authentication, user management, and data operations.',
    author: 'Michael Kim',
    channel: 'docs',
    timestamp: '2024-01-12T14:20:00Z',
    relevance: 85
  }
];

const SEARCH_MODIFIERS = [
  { key: 'from:', description: 'Messages from a specific person', example: 'from:sarah' },
  { key: 'in:', description: 'Messages in a specific channel', example: 'in:general' },
  { key: 'has:', description: 'Messages with attachments or links', example: 'has:files' },
  { key: 'before:', description: 'Messages before a date', example: 'before:2024-01-15' },
  { key: 'after:', description: 'Messages after a date', example: 'after:2024-01-10' },
  { key: 'is:', description: 'Filter by type', example: 'is:pinned' }
];

export function EnhancedSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    channel: 'all',
    author: 'all',
    dateRange: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showModifiers, setShowModifiers] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'project timeline',
    'authentication system',
    'design mockups'
  ]);

  useEffect(() => {
    if (searchQuery.length > 2) {
      setIsLoading(true);
      // Simulate search delay
      const timer = setTimeout(() => {
        const filteredResults = MOCK_RESULTS.filter(result => {
          const matchesQuery = result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              result.content.toLowerCase().includes(searchQuery.toLowerCase());
          
          const matchesType = filters.type === 'all' || result.type === filters.type;
          const matchesChannel = filters.channel === 'all' || result.channel === filters.channel;
          const matchesAuthor = filters.author === 'all' || result.author === filters.author;
          
          return matchesQuery && matchesType && matchesChannel && matchesAuthor;
        });
        
        setResults(filteredResults);
        setIsLoading(false);
      }, 300);
      
      return () => clearTimeout(timer);
    } else {
      setResults([]);
    }
  }, [searchQuery, filters]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query && !recentSearches.includes(query)) {
      setRecentSearches(prev => [query, ...prev.slice(0, 4)]);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setResults([]);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-4 w-4" />;
      case 'file':
        return <FileText className="h-4 w-4" />;
      case 'task':
        return <Hash className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'message':
        return 'bg-blue-100 text-blue-600';
      case 'file':
        return 'bg-green-100 text-green-600';
      case 'task':
        return 'bg-orange-100 text-orange-600';
      case 'document':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Search</h1>
            <p className="text-gray-500">Find messages, files, tasks, and documents across your workspace</p>
          </div>
        </div>

        {/* Search Input */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search everything... (try using from:, in:, has:)"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowModifiers(!showModifiers)}
            >
              Search Tips
            </Button>
          </div>

          {/* Search Modifiers Help */}
          <Collapsible open={showModifiers} onOpenChange={setShowModifiers}>
            <CollapsibleContent>
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-3">Search Modifiers</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {SEARCH_MODIFIERS.map((modifier) => (
                      <div key={modifier.key} className="text-sm">
                        <code className="bg-gray-100 px-1 rounded">{modifier.key}</code>
                        <span className="ml-2 text-gray-600">{modifier.description}</span>
                        <div className="text-xs text-gray-500 mt-1">
                          Example: <code className="bg-gray-50 px-1">{modifier.example}</code>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>

          {/* Filters */}
          <Collapsible open={showFilters} onOpenChange={setShowFilters}>
            <CollapsibleContent>
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm font-medium">Type</label>
                      <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="message">Messages</SelectItem>
                          <SelectItem value="file">Files</SelectItem>
                          <SelectItem value="task">Tasks</SelectItem>
                          <SelectItem value="document">Documents</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Channel</label>
                      <Select value={filters.channel} onValueChange={(value) => setFilters(prev => ({ ...prev, channel: value }))}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Channels</SelectItem>
                          <SelectItem value="general">general</SelectItem>
                          <SelectItem value="design">design</SelectItem>
                          <SelectItem value="development">development</SelectItem>
                          <SelectItem value="docs">docs</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Author</label>
                      <Select value={filters.author} onValueChange={(value) => setFilters(prev => ({ ...prev, author: value }))}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All People</SelectItem>
                          <SelectItem value="Sarah Chen">Sarah Chen</SelectItem>
                          <SelectItem value="Alex Rodriguez">Alex Rodriguez</SelectItem>
                          <SelectItem value="Emma Davis">Emma Davis</SelectItem>
                          <SelectItem value="Michael Kim">Michael Kim</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Date Range</label>
                      <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any Time</SelectItem>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="week">This Week</SelectItem>
                          <SelectItem value="month">This Month</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

      {/* Search Results */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6">
            {!searchQuery && (
              <div className="space-y-6">
                {/* Recent Searches */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Recent Searches</h3>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSearch(search)}
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        {search}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Star className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">Saved Items</h4>
                            <p className="text-sm text-gray-500">View your starred content</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <FileText className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">Recent Files</h4>
                            <p className="text-sm text-gray-500">Browse uploaded files</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {searchQuery && (
              <div className="space-y-4">
                {isLoading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                )}

                {!isLoading && results.length > 0 && (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        {results.length} result{results.length !== 1 ? 's' : ''} for "{searchQuery}"
                      </p>
                    </div>

                    <div className="space-y-3">
                      {results.map((result) => (
                        <Card key={result.id} className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Badge className={`text-xs ${getTypeColor(result.type)}`}>
                                    {getTypeIcon(result.type)}
                                    <span className="ml-1 capitalize">{result.type}</span>
                                  </Badge>
                                  <span className="text-xs text-gray-500">#{result.channel}</span>
                                  <span className="text-xs text-gray-500">{formatTimestamp(result.timestamp)}</span>
                                </div>
                                
                                <h3 className="font-medium text-gray-900 mb-1 truncate">{result.title}</h3>
                                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{result.content}</p>
                                
                                <div className="flex items-center space-x-2">
                                  <Avatar className="h-5 w-5">
                                    <AvatarFallback className="text-xs">
                                      {result.author.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs text-gray-500">{result.author}</span>
                                </div>
                              </div>
                              
                              <div className="ml-4 flex items-center space-x-2">
                                <Badge variant="outline" className="text-xs">
                                  {result.relevance}% match
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                )}

                {!isLoading && searchQuery.length > 2 && results.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <Search className="h-12 w-12 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No results found</h3>
                    <p className="text-sm mb-4">Try adjusting your search terms or filters</p>
                    <Button variant="outline" onClick={clearSearch}>
                      Clear Search
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}