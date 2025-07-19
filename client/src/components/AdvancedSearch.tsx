import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Hash, 
  File, 
  MessageSquare, 
  Clock,
  ChevronDown,
  X,
  Settings,
  Bookmark,
  Star
} from "lucide-react";

interface SearchResult {
  id: string;
  type: "message" | "file" | "user" | "channel";
  title: string;
  content: string;
  channel?: string;
  author?: string;
  timestamp: string;
  relevance: number;
  preview?: string;
  fileType?: string;
  fileSize?: number;
}

interface SearchFilters {
  dateRange: "all" | "today" | "week" | "month" | "custom";
  type: "all" | "messages" | "files" | "people" | "channels";
  channel: string;
  author: string;
  hasFiles: boolean;
  starred: boolean;
}

export function AdvancedSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const [filters, setFilters] = useState<SearchFilters>({
    dateRange: "all",
    type: "all", 
    channel: "",
    author: "",
    hasFiles: false,
    starred: false
  });

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  // Mock data for demonstration - in real app this would come from API
  const mockResults: SearchResult[] = [
    {
      id: "1",
      type: "message",
      title: "Sprint planning discussion",
      content: "We need to finalize the sprint goals for the upcoming iteration. Can everyone review the backlog items?",
      channel: "general",
      author: "Sarah Wilson",
      timestamp: "2024-01-24T10:30:00Z",
      relevance: 95
    },
    {
      id: "2",
      type: "file",
      title: "project-proposal.pdf",
      content: "Project proposal document with timeline and resource requirements",
      channel: "general",
      author: "Alex Johnson",
      timestamp: "2024-01-24T09:15:00Z",
      relevance: 88,
      fileType: "pdf",
      fileSize: 2450000
    },
    {
      id: "3",
      type: "message", 
      title: "API endpoint discussion",
      content: "The new authentication endpoints are ready for testing. Documentation has been updated accordingly.",
      channel: "dev-team",
      author: "Mike Chen",
      timestamp: "2024-01-23T16:45:00Z",
      relevance: 82
    },
    {
      id: "4",
      type: "user",
      title: "John Doe",
      content: "Senior Frontend Developer - Available for React consulting and code reviews",
      timestamp: "2024-01-20T14:20:00Z",
      relevance: 75
    },
    {
      id: "5",
      type: "channel",
      title: "#design-reviews",
      content: "Channel for design feedback and UI/UX discussions. 24 members, 156 messages",
      timestamp: "2024-01-15T11:00:00Z",
      relevance: 70
    }
  ];

  const [recentSearches] = useState([
    "sprint planning",
    "API documentation", 
    "design mockups",
    "team meeting notes",
    "project timeline"
  ]);

  const [savedSearches] = useState([
    { query: "from:sarah has:files", name: "Sarah's shared files" },
    { query: "in:dev-team urgent", name: "Urgent dev issues" },
    { query: "type:pdf after:week", name: "Recent documents" }
  ]);

  const getResultIcon = (type: string) => {
    switch (type) {
      case "message": return <MessageSquare className="h-4 w-4" />;
      case "file": return <File className="h-4 w-4" />;
      case "user": return <User className="h-4 w-4" />;
      case "channel": return <Hash className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "message": return "bg-blue-500";
      case "file": return "bg-green-500";
      case "user": return "bg-purple-500";
      case "channel": return "bg-orange-500";
      default: return "bg-gray-500";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "";
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday"; 
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  // Perform search function
  const performSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setHasSearched(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Filter mock results based on search query and filters
    let filteredResults = mockResults.filter(result => {
      const matchesQuery = 
        result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.channel?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = filters.type === "all" || 
        (filters.type === "messages" && result.type === "message") ||
        (filters.type === "files" && result.type === "file") ||
        (filters.type === "people" && result.type === "user") ||
        (filters.type === "channels" && result.type === "channel");
      
      const matchesChannel = !filters.channel || 
        result.channel?.toLowerCase().includes(filters.channel.toLowerCase());
      
      const matchesAuthor = !filters.author || 
        result.author?.toLowerCase().includes(filters.author.toLowerCase());
      
      return matchesQuery && matchesType && matchesChannel && matchesAuthor;
    });
    
    // Sort by relevance
    filteredResults.sort((a, b) => b.relevance - a.relevance);
    
    setSearchResults(filteredResults);
    setIsSearching(false);
  };

  // Handle search on Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
    setFilters({
      dateRange: "all",
      type: "all",
      channel: "",
      author: "",
      hasFiles: false,
      starred: false
    });
  };

  const filteredResults = searchResults.filter(result => {
    if (activeTab !== "all" && result.type !== activeTab) return false;
    if (filters.type !== "all" && result.type !== filters.type) return false;
    if (filters.channel && result.channel !== filters.channel) return false;
    if (filters.author && result.author !== filters.author) return false;
    return true;
  });

  const groupedResults = filteredResults.reduce((acc, result) => {
    if (!acc[result.type]) acc[result.type] = [];
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  const searchModifiers = [
    { modifier: "from:user", description: "Search messages from specific user" },
    { modifier: "in:channel", description: "Search within specific channel" },
    { modifier: "has:files", description: "Messages with file attachments" },
    { modifier: "before:date", description: "Before specific date" },
    { modifier: "after:date", description: "After specific date" },
    { modifier: "starred:", description: "Starred messages only" },
    { modifier: '"exact phrase"', description: "Search exact phrase" }
  ];

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Search Header */}
      <div className="p-6 bg-white/90 backdrop-blur-md border-b shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search messages, files, people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 pr-20 h-12 text-lg border-2 focus:border-blue-500"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-12 top-1/2 transform -translate-y-1/2"
                  onClick={clearSearch}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <Button 
              onClick={performSearch}
              disabled={!searchQuery.trim() || isSearching}
              className="h-12 px-6 bg-blue-600 hover:bg-blue-700"
            >
              {isSearching ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Search"
              )}
            </Button>
          </div>
            
          <Dialog open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-12 px-6">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Advanced Search Filters</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Date Range</label>
                      <Select value={filters.dateRange} onValueChange={(value: any) => setFilters({...filters, dateRange: value})}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All time</SelectItem>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="week">Past week</SelectItem>
                          <SelectItem value="month">Past month</SelectItem>
                          <SelectItem value="custom">Custom range</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Content Type</label>
                      <Select value={filters.type} onValueChange={(value: any) => setFilters({...filters, type: value})}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All types</SelectItem>
                          <SelectItem value="messages">Messages</SelectItem>
                          <SelectItem value="files">Files</SelectItem>
                          <SelectItem value="people">People</SelectItem>
                          <SelectItem value="channels">Channels</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Channel</label>
                      <Input
                        placeholder="e.g. general, dev-team"
                        value={filters.channel}
                        onChange={(e) => setFilters({...filters, channel: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Author</label>
                      <Input
                        placeholder="e.g. john.doe"
                        value={filters.author}
                        onChange={(e) => setFilters({...filters, author: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium">Search Modifiers</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {searchModifiers.map((mod, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <code className="bg-gray-200 px-2 py-1 rounded text-sm font-mono">
                            {mod.modifier}
                          </code>
                          <span className="text-sm text-muted-foreground">{mod.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          {/* Quick Filters */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Quick filters:</span>
            <Button variant="outline" size="sm" onClick={() => setSearchQuery(searchQuery + " has:files")}>
              <File className="h-3 w-3 mr-1" />
              Has Files
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSearchQuery(searchQuery + " starred:")}>
              <Star className="h-3 w-3 mr-1" />
              Starred
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSearchQuery(searchQuery + " after:week")}>
              <Calendar className="h-3 w-3 mr-1" />
              This Week
            </Button>
          </div>

          {/* Recent & Saved Searches */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Recent:</span>
              {recentSearches.slice(0, 3).map((search, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="cursor-pointer hover:bg-blue-100"
                  onClick={() => setSearchQuery(search)}
                >
                  {search}
                </Badge>
              ))}
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Saved:</span>
              {savedSearches.slice(0, 2).map((search, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-blue-50"
                  onClick={() => setSearchQuery(search.query)}
                >
                  <Bookmark className="h-3 w-3 mr-1" />
                  {search.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 p-6 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList className="grid w-96 grid-cols-5">
              <TabsTrigger value="all">All ({filteredResults.length})</TabsTrigger>
              <TabsTrigger value="message">Messages ({groupedResults.message?.length || 0})</TabsTrigger>
              <TabsTrigger value="file">Files ({groupedResults.file?.length || 0})</TabsTrigger>
              <TabsTrigger value="user">People ({groupedResults.user?.length || 0})</TabsTrigger>
              <TabsTrigger value="channel">Channels ({groupedResults.channel?.length || 0})</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {filteredResults.length} results
              </span>
              <Select defaultValue="relevance">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="author">Author</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="h-full overflow-y-auto">
            <TabsContent value={activeTab} className="mt-0">
              <div className="space-y-4">
                {filteredResults.map((result) => (
                  <Card key={result.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer bg-white/90 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${getTypeColor(result.type)} text-white`}>
                              {getResultIcon(result.type)}
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{result.title}</h3>
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                {result.channel && (
                                  <>
                                    <Hash className="h-3 w-3" />
                                    <span>{result.channel}</span>
                                  </>
                                )}
                                {result.author && (
                                  <>
                                    <User className="h-3 w-3" />
                                    <span>{result.author}</span>
                                  </>
                                )}
                                <Clock className="h-3 w-3" />
                                <span>{formatDate(result.timestamp)}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">
                              {result.relevance}% match
                            </Badge>
                            {result.fileSize && (
                              <Badge variant="secondary">
                                {formatFileSize(result.fileSize)}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Content */}
                        <p className="text-gray-700 leading-relaxed">
                          {result.content}
                        </p>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              Open
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Star className="h-3 w-3 mr-1" />
                              Star
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Bookmark className="h-3 w-3 mr-1" />
                              Save
                            </Button>
                          </div>
                          
                          {result.type === "message" && result.channel && (
                            <Button variant="ghost" size="sm">
                              Jump to message
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredResults.length === 0 && (
                  <div className="text-center py-12">
                    <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No results found</h3>
                    <p className="text-gray-500">Try adjusting your search terms or filters</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}