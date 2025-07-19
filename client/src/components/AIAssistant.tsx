import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Lightbulb, 
  Search, 
  FileText, 
  MessageSquare, 
  Zap,
  Star,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Mic,
  MicOff,
  Settings,
  Clock,
  Trash2,
  Download,
  Share2,
  Bookmark
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AIMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isStarred?: boolean;
  confidence?: number;
  suggestions?: string[];
  sources?: string[];
}

interface AIFeature {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'productivity' | 'analysis' | 'automation' | 'creative';
  examples: string[];
}

interface AIAssistantProps {
  channelId?: string;
  workspaceId?: string;
}

const aiFeatures: AIFeature[] = [
  {
    id: 'summarize',
    name: 'Content Summarization',
    description: 'Summarize long conversations, documents, or meeting notes',
    icon: FileText,
    category: 'productivity',
    examples: [
      'Summarize the last 20 messages in this channel',
      'Create a summary of today\'s meeting notes',
      'Summarize this document in bullet points'
    ]
  },
  {
    id: 'sentiment',
    name: 'Sentiment Analysis',
    description: 'Analyze the mood and sentiment of conversations',
    icon: Sparkles,
    category: 'analysis',
    examples: [
      'What\'s the overall sentiment in this channel?',
      'Analyze the team mood from recent messages',
      'How are people feeling about the project?'
    ]
  },
  {
    id: 'task_generation',
    name: 'Smart Task Creation',
    description: 'Generate actionable tasks from conversations',
    icon: Zap,
    category: 'automation',
    examples: [
      'Create tasks from our discussion about the new feature',
      'Generate action items from the meeting notes',
      'Extract todos from this conversation'
    ]
  },
  {
    id: 'insights',
    name: 'Team Insights',
    description: 'Generate insights about team productivity and patterns',
    icon: Lightbulb,
    category: 'analysis',
    examples: [
      'What are our team\'s most productive hours?',
      'Analyze communication patterns this week',
      'Generate productivity insights'
    ]
  },
  {
    id: 'autocomplete',
    name: 'Smart Autocomplete',
    description: 'Intelligent text completion and suggestions',
    icon: MessageSquare,
    category: 'productivity',
    examples: [
      'Help me finish this email',
      'Complete this project description',
      'Suggest responses to this message'
    ]
  },
  {
    id: 'creative',
    name: 'Creative Writing',
    description: 'Generate creative content, brainstorm ideas',
    icon: Star,
    category: 'creative',
    examples: [
      'Brainstorm names for our new product',
      'Write a team announcement about the launch',
      'Generate creative solutions for this problem'
    ]
  }
];

export function AIAssistant({ channelId, workspaceId }: AIAssistantProps) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<string>('general');
  const [isListening, setIsListening] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'features' | 'history'>('chat');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize with welcome message
    const welcomeMessage: AIMessage = {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your AI Assistant. I can help you with summarizing conversations, analyzing sentiment, creating tasks, and much more. What would you like me to help you with today?',
      timestamp: new Date().toISOString(),
      confidence: 0.95,
      suggestions: [
        'Summarize recent messages',
        'Analyze team sentiment',
        'Create tasks from discussion',
        'Generate meeting notes'
      ]
    };
    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Simulate AI response (replace with actual OpenAI API call)
      const response = await simulateAIResponse(inputMessage, selectedFeature);
      
      const assistantMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString(),
        confidence: response.confidence,
        suggestions: response.suggestions,
        sources: response.sources
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      toast({
        title: "AI Response Generated",
        description: "Your request has been processed successfully.",
      });
    } catch (error) {
      console.error('AI Error:', error);
      toast({
        title: "AI Error",
        description: "Failed to generate response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const simulateAIResponse = async (input: string, feature: string): Promise<{
    content: string;
    confidence: number;
    suggestions: string[];
    sources?: string[];
  }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const responses = {
      summarize: {
        content: `Here's a summary of the key points from your request:\n\n• Main topic: ${input.slice(0, 50)}...\n• Key insights: The discussion focuses on important team collaboration aspects\n• Action items: 3 tasks identified for follow-up\n• Participants: 5 team members actively contributing\n\nWould you like me to create specific tasks from these discussion points?`,
        confidence: 0.92,
        suggestions: ['Create tasks from summary', 'Export summary', 'Share with team'],
        sources: ['Channel messages', 'Meeting notes']
      },
      sentiment: {
        content: `Sentiment Analysis Results:\n\n🟢 **Overall Sentiment: Positive (78%)**\n\n• Positive indicators: Enthusiasm for new projects, collaborative language\n• Neutral topics: Technical discussions, planning sessions\n• Areas for attention: Some concerns about deadlines\n\n**Team Mood**: Engaged and motivated\n**Recommendation**: Continue current momentum, address timeline concerns`,
        confidence: 0.89,
        suggestions: ['View detailed breakdown', 'Generate report', 'Set mood alerts'],
        sources: ['Recent messages', 'User interactions']
      },
      task_generation: {
        content: `I've identified several actionable tasks from your input:\n\n**Generated Tasks:**\n\n1. **Research Implementation** (High Priority)\n   - Due: Next week\n   - Assignee: Development team\n\n2. **Review Documentation** (Medium Priority)\n   - Due: End of week\n   - Assignee: Product team\n\n3. **Schedule Follow-up Meeting** (Low Priority)\n   - Due: Tomorrow\n   - Assignee: Project manager\n\nWould you like me to create these tasks in your task board?`,
        confidence: 0.94,
        suggestions: ['Create all tasks', 'Edit tasks', 'Assign to team members'],
        sources: ['Conversation context', 'Project history']
      },
      general: {
        content: `I understand you're looking for help with: "${input}"\n\nHere are some ways I can assist:\n\n• **Summarization**: I can summarize long conversations or documents\n• **Task Creation**: Extract actionable items from discussions\n• **Analysis**: Provide insights on team communication and productivity\n• **Content Generation**: Help with writing and creative tasks\n\nWhat specific aspect would you like me to focus on?`,
        confidence: 0.87,
        suggestions: ['Summarize content', 'Create tasks', 'Analyze sentiment', 'Generate insights'],
        sources: ['AI knowledge base']
      }
    };

    return responses[feature as keyof typeof responses] || responses.general;
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: "Message content has been copied.",
    });
  };

  const starMessage = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isStarred: !msg.isStarred } : msg
    ));
  };

  const MessageBubble = ({ message }: { message: AIMessage }) => (
    <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-2 max-w-[80%]`}>
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>
        <div className={`rounded-lg p-3 ${
          message.type === 'user' 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 text-gray-900'
        }`}>
          <div className="whitespace-pre-wrap">{message.content}</div>
          {message.confidence && (
            <div className="mt-2 text-xs opacity-70">
              Confidence: {Math.round(message.confidence * 100)}%
            </div>
          )}
          {message.suggestions && message.suggestions.length > 0 && (
            <div className="mt-3 space-y-1">
              <div className="text-xs font-medium opacity-70">Suggestions:</div>
              {message.suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="mr-2 mb-1 h-6 text-xs"
                  onClick={() => setInputMessage(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs opacity-70">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => copyMessage(message.content)}
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => starMessage(message.id)}
              >
                <Star className={`h-3 w-3 ${message.isStarred ? 'fill-current text-yellow-500' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const FeatureCard = ({ feature }: { feature: AIFeature }) => {
    const IconComponent = feature.icon;
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <IconComponent className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-sm">{feature.name}</CardTitle>
              <Badge variant="outline" className="text-xs">
                {feature.category}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-700">Try these examples:</p>
            {feature.examples.slice(0, 2).map((example, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs h-8"
                onClick={() => {
                  setInputMessage(example);
                  setSelectedFeature(feature.id);
                  setActiveTab('chat');
                }}
              >
                "{example}"
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">AI Assistant</h2>
              <p className="text-sm text-gray-600">Powered by OpenAI GPT-4</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={selectedFeature} onValueChange={setSelectedFeature}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select AI Feature" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Assistant</SelectItem>
                {aiFeatures.map((feature) => (
                  <SelectItem key={feature.id} value={feature.id}>
                    {feature.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <Button 
            variant={activeTab === 'chat' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setActiveTab('chat')}
            className="h-8"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat
          </Button>
          <Button 
            variant={activeTab === 'features' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setActiveTab('features')}
            className="h-8"
          >
            <Zap className="h-4 w-4 mr-2" />
            Features
          </Button>
          <Button 
            variant={activeTab === 'history' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setActiveTab('history')}
            className="h-8"
          >
            <Clock className="h-4 w-4 mr-2" />
            History
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'chat' && (
          <div className="h-full flex flex-col">
            {/* Messages */}
            <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-3">
                    <Bot className="h-4 w-4 text-gray-600" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsListening(!isListening)}
                  className={isListening ? 'bg-red-100 text-red-600' : ''}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <div className="flex-1 relative">
                  <Textarea
                    placeholder="Ask me anything... (e.g., 'Summarize today's messages' or 'Create tasks from our discussion')"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    className="resize-none"
                    rows={2}
                  />
                </div>
                <Button 
                  onClick={sendMessage} 
                  disabled={!inputMessage.trim() || isLoading}
                  className="h-12"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'features' && (
          <div className="p-6 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {aiFeatures.map((feature) => (
                <FeatureCard key={feature.id} feature={feature} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="p-6 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Conversation History</h3>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear History
                </Button>
              </div>
              <div className="space-y-2">
                {messages.filter(m => m.isStarred).map((message) => (
                  <Card key={message.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm truncate">{message.content}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(message.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Share2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}