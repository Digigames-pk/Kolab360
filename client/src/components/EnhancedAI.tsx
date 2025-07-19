import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  Send, 
  Bot, 
  User, 
  Lightbulb, 
  Code, 
  FileText, 
  MessageSquare, 
  Trash2,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Sparkles,
  Brain,
  ChevronDown,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface AIMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  context?: string;
  suggestions?: string[];
  rating?: 'positive' | 'negative';
}

interface AIFeature {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  enabled: boolean;
  category: 'productivity' | 'analysis' | 'generation';
}

const AI_FEATURES: AIFeature[] = [
  {
    id: 'smart-suggestions',
    name: 'Smart Suggestions',
    description: 'Get contextual suggestions while typing',
    icon: Lightbulb,
    enabled: true,
    category: 'productivity'
  },
  {
    id: 'code-review',
    name: 'Code Review',
    description: 'AI-powered code analysis and recommendations',
    icon: Code,
    enabled: true,
    category: 'analysis'
  },
  {
    id: 'meeting-summaries',
    name: 'Meeting Summaries',
    description: 'Automatically generate meeting summaries',
    icon: FileText,
    enabled: false,
    category: 'generation'
  },
  {
    id: 'sentiment-analysis',
    name: 'Sentiment Analysis',
    description: 'Analyze team mood and communication patterns',
    icon: Brain,
    enabled: true,
    category: 'analysis'
  }
];

const QUICK_PROMPTS = [
  'Summarize our recent project progress',
  'Help me write a project update',
  'Review this code for improvements',
  'Generate a task breakdown for this feature',
  'Analyze our team productivity trends',
  'Create a meeting agenda for tomorrow'
];

export function EnhancedAI() {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your AI assistant. I can help you with project management, code review, documentation, and much more. What would you like to work on today?',
      timestamp: new Date().toISOString(),
      suggestions: [
        'Review my latest code changes',
        'Help me plan this week\'s tasks',
        'Generate a project report'
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [features, setFeatures] = useState<AIFeature[]>(AI_FEATURES);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI processing
    setTimeout(() => {
      const aiResponse = generateAIResponse(content);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string): AIMessage => {
    const responses = {
      code: {
        content: "I've analyzed your code request. Here are my recommendations:\n\n1. **Code Structure**: Consider breaking down large functions into smaller, more manageable pieces\n2. **Error Handling**: Add proper try-catch blocks for API calls\n3. **Performance**: Use React.memo for components that don't need frequent re-renders\n4. **Testing**: Add unit tests for critical business logic\n\nWould you like me to elaborate on any of these points?",
        suggestions: ['Show me specific examples', 'Help with testing strategy', 'Review performance optimizations']
      },
      tasks: {
        content: "I can help you organize your tasks effectively. Based on your current workload, here's what I recommend:\n\n**High Priority:**\n• Complete the authentication system\n• Fix critical bugs in the user dashboard\n\n**Medium Priority:**\n• Update documentation\n• Implement new search features\n\n**Low Priority:**\n• UI polish and animations\n\nWould you like me to create detailed task breakdowns?",
        suggestions: ['Break down authentication tasks', 'Prioritize bug fixes', 'Plan documentation updates']
      },
      default: {
        content: "I understand you're asking about \"" + userInput + "\". I can help you with various aspects of your project:\n\n• **Project Management**: Task planning, timeline estimation, resource allocation\n• **Code Review**: Best practices, optimization, bug detection\n• **Documentation**: API docs, user guides, technical specifications\n• **Analysis**: Performance insights, team productivity, code quality\n\nWhat specific area would you like to focus on?",
        suggestions: ['Help with project planning', 'Review my code', 'Generate documentation']
      }
    };

    const responseType = userInput.toLowerCase().includes('code') ? 'code' :
                        userInput.toLowerCase().includes('task') ? 'tasks' : 'default';

    return {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      content: responses[responseType].content,
      timestamp: new Date().toISOString(),
      suggestions: responses[responseType].suggestions
    };
  };

  const rateMessage = (messageId: string, rating: 'positive' | 'negative') => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, rating } : msg
    ));
  };

  const clearConversation = () => {
    setMessages([{
      id: '1',
      type: 'ai',
      content: 'Conversation cleared! How can I help you today?',
      timestamp: new Date().toISOString(),
      suggestions: QUICK_PROMPTS.slice(0, 3)
    }]);
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const toggleFeature = (featureId: string) => {
    setFeatures(prev => prev.map(feature => 
      feature.id === featureId ? { ...feature, enabled: !feature.enabled } : feature
    ));
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Zap className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
              <p className="text-gray-500">Your intelligent workspace companion</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => setShowSettings(true)}>
              <Settings className="h-4 w-4 mr-2" />
              AI Settings
            </Button>
            <Button variant="outline" onClick={clearConversation}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>

        {/* AI Features Status */}
        <div className="mt-4">
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-medium">Active Features:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {features.filter(f => f.enabled).map(feature => {
              const IconComponent = feature.icon;
              return (
                <Badge key={feature.id} variant="secondary" className="flex items-center space-x-1">
                  <IconComponent className="h-3 w-3" />
                  <span>{feature.name}</span>
                </Badge>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="border-b p-4">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-sm font-medium text-gray-700">Quick Prompts:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_PROMPTS.slice(0, 4).map((prompt, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => sendMessage(prompt)}
              className="text-xs"
            >
              {prompt}
            </Button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-3xl ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                  <div className="flex items-start space-x-3">
                    {message.type === 'ai' && (
                      <Avatar className="h-8 w-8 bg-purple-500">
                        <AvatarFallback>
                          <Bot className="h-4 w-4 text-white" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className="flex-1">
                      <div className={`rounded-lg p-4 ${
                        message.type === 'user' 
                          ? 'bg-blue-500 text-white ml-auto max-w-md' 
                          : 'bg-gray-50 text-gray-900'
                      }`}>
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {message.content}
                        </div>
                        
                        {message.suggestions && message.type === 'ai' && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-600 mb-2">Suggested follow-ups:</p>
                            <div className="space-y-1">
                              {message.suggestions.map((suggestion, index) => (
                                <Button
                                  key={index}
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => sendMessage(suggestion)}
                                  className="text-xs justify-start h-auto p-1 text-gray-700 hover:text-gray-900"
                                >
                                  • {suggestion}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                        
                        {message.type === 'ai' && (
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyMessage(message.content)}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => rateMessage(message.id, 'positive')}
                              className={`h-6 w-6 p-0 ${message.rating === 'positive' ? 'text-green-600' : ''}`}
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => rateMessage(message.id, 'negative')}
                              className={`h-6 w-6 p-0 ${message.rating === 'negative' ? 'text-red-600' : ''}`}
                            >
                              <ThumbsDown className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {message.type === 'user' && (
                      <Avatar className="h-8 w-8 bg-blue-500">
                        <AvatarFallback>
                          <User className="h-4 w-4 text-white" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8 bg-purple-500">
                    <AvatarFallback>
                      <Bot className="h-4 w-4 text-white" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex space-x-3">
          <Textarea
            placeholder="Ask me anything about your project, code, tasks, or workflow..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(inputMessage);
              }
            }}
            className="min-h-[50px] max-h-32 resize-none"
          />
          <Button 
            onClick={() => sendMessage(inputMessage)}
            disabled={!inputMessage.trim() || isTyping}
            className="px-6"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>

      {/* AI Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>AI Assistant Settings</DialogTitle>
            <DialogDescription>
              Configure AI features and behavior to match your workflow preferences.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-4">AI Features</h3>
              <div className="space-y-4">
                {['productivity', 'analysis', 'generation'].map(category => (
                  <div key={category}>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 capitalize">{category}</h4>
                    <div className="space-y-2">
                      {features.filter(f => f.category === category).map(feature => {
                        const IconComponent = feature.icon;
                        return (
                          <div key={feature.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <IconComponent className="h-4 w-4 text-gray-600" />
                              <div>
                                <p className="font-medium">{feature.name}</p>
                                <p className="text-sm text-gray-500">{feature.description}</p>
                              </div>
                            </div>
                            <Switch
                              checked={feature.enabled}
                              onCheckedChange={() => toggleFeature(feature.id)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowSettings(false)}>
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}