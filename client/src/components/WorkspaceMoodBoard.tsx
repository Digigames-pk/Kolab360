import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Palette, Star, TrendingUp, Brain, Users, Lightbulb, CheckCircle } from 'lucide-react';

interface WorkspaceMoodBoard {
  id: number;
  workspaceId: string;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  moodCategory: 'energizing' | 'calming' | 'focused' | 'creative' | 'collaborative';
  psychologyInsights: {
    mood: string;
    effects: string[];
    bestFor: string[];
    productivity: {
      focus: number;
      energy: number;
      creativity: number;
      collaboration: number;
    };
    tips: string[];
  };
  colorPalette: {
    name: string;
    colors: Array<{
      name: string;
      hex: string;
      role: string;
    }>;
    description: string;
  };
  isActive: boolean;
  createdBy: number;
  teamRating: number;
  createdAt: string;
}

interface WorkspaceMoodBoardProps {
  workspaceId: string;
}

const WorkspaceMoodBoard: React.FC<WorkspaceMoodBoardProps> = ({ workspaceId }) => {
  const [selectedMoodBoard, setSelectedMoodBoard] = useState<WorkspaceMoodBoard | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newMoodBoard, setNewMoodBoard] = useState({
    name: '',
    description: '',
    moodCategory: 'calming' as const,
    primaryColor: '#4A90E2',
    secondaryColor: '#7BB3F0',
    accentColor: '#5DADE2',
    backgroundColor: '#F8FBFF',
    textColor: '#1A365D'
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: moodBoards, isLoading } = useQuery({
    queryKey: [`/api/mood-boards/${workspaceId}`],
    queryFn: async () => {
      const response = await fetch(`/api/mood-boards/${workspaceId}`);
      if (!response.ok) throw new Error('Failed to fetch mood boards');
      return response.json() as WorkspaceMoodBoard[];
    }
  });

  const activateMoodBoardMutation = useMutation({
    mutationFn: async (moodBoardId: number) => {
      const response = await fetch(`/api/mood-boards/${moodBoardId}/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId })
      });
      if (!response.ok) throw new Error('Failed to activate mood board');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/mood-boards/${workspaceId}`] });
      toast({
        title: "Mood Board Activated",
        description: "The workspace mood has been updated successfully.",
      });
    }
  });

  const voteMoodBoardMutation = useMutation({
    mutationFn: async ({ moodBoardId, rating }: { moodBoardId: number; rating: number }) => {
      const response = await fetch(`/api/mood-boards/${moodBoardId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          userId: 1, // Mock user ID
          rating,
          feedback: ''
        })
      });
      if (!response.ok) throw new Error('Failed to vote on mood board');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/mood-boards/${workspaceId}`] });
      toast({
        title: "Vote Submitted",
        description: "Thank you for rating this mood board!",
      });
    }
  });

  const getMoodIcon = (category: string) => {
    switch (category) {
      case 'energizing': return <TrendingUp className="w-5 h-5" />;
      case 'calming': return <Users className="w-5 h-5" />;
      case 'focused': return <Brain className="w-5 h-5" />;
      case 'creative': return <Lightbulb className="w-5 h-5" />;
      case 'collaborative': return <Users className="w-5 h-5" />;
      default: return <Palette className="w-5 h-5" />;
    }
  };

  const getMoodColor = (category: string) => {
    switch (category) {
      case 'energizing': return 'bg-orange-500';
      case 'calming': return 'bg-blue-500';
      case 'focused': return 'bg-green-500';
      case 'creative': return 'bg-purple-500';
      case 'collaborative': return 'bg-indigo-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Workspace Mood Board</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Palette className="w-6 h-6" />
            Workspace Mood Board
          </h2>
          <p className="text-muted-foreground">
            Customize your workspace colors based on psychology insights for enhanced team productivity
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          Create New Mood
        </Button>
      </div>

      {/* Active Mood Board Banner */}
      {moodBoards?.find(board => board.isActive) && (
        <Card className="border-2 border-primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div 
                  className="w-16 h-16 rounded-lg shadow-lg flex items-center justify-center"
                  style={{ backgroundColor: moodBoards.find(board => board.isActive)?.primaryColor }}
                >
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    Currently Active: {moodBoards.find(board => board.isActive)?.name}
                  </h3>
                  <p className="text-muted-foreground">
                    {moodBoards.find(board => board.isActive)?.description}
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Star className="w-4 h-4" />
                {moodBoards.find(board => board.isActive)?.teamRating}/5
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mood Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {moodBoards?.map((moodBoard) => (
          <Card 
            key={moodBoard.id} 
            className={`transition-all hover:shadow-lg ${moodBoard.isActive ? 'ring-2 ring-primary' : ''}`}
          >
            {/* Color Preview */}
            <div 
              className="h-24 rounded-t-lg flex items-center justify-center relative"
              style={{ 
                background: `linear-gradient(135deg, ${moodBoard.primaryColor} 0%, ${moodBoard.secondaryColor} 100%)` 
              }}
            >
              <div className="flex gap-2">
                {moodBoard.colorPalette.colors.slice(0, 5).map((color, index) => (
                  <div
                    key={index}
                    className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
              {moodBoard.isActive && (
                <Badge className="absolute top-2 right-2" variant="secondary">
                  Active
                </Badge>
              )}
            </div>

            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {getMoodIcon(moodBoard.moodCategory)}
                  {moodBoard.name}
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{moodBoard.teamRating}</span>
                </div>
              </div>
              <CardDescription>{moodBoard.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Mood Category Badge */}
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getMoodColor(moodBoard.moodCategory)}`}></div>
                <Badge variant="outline" className="text-xs">
                  {moodBoard.moodCategory.charAt(0).toUpperCase() + moodBoard.moodCategory.slice(1)}
                </Badge>
              </div>

              {/* Productivity Metrics */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Productivity Impact</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="flex justify-between">
                      <span>Focus</span>
                      <span>{moodBoard.psychologyInsights.productivity.focus}/5</span>
                    </div>
                    <Progress 
                      value={moodBoard.psychologyInsights.productivity.focus * 20} 
                      className="h-1"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between">
                      <span>Energy</span>
                      <span>{moodBoard.psychologyInsights.productivity.energy}/5</span>
                    </div>
                    <Progress 
                      value={moodBoard.psychologyInsights.productivity.energy * 20} 
                      className="h-1"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between">
                      <span>Creativity</span>
                      <span>{moodBoard.psychologyInsights.productivity.creativity}/5</span>
                    </div>
                    <Progress 
                      value={moodBoard.psychologyInsights.productivity.creativity * 20} 
                      className="h-1"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between">
                      <span>Collaboration</span>
                      <span>{moodBoard.psychologyInsights.productivity.collaboration}/5</span>
                    </div>
                    <Progress 
                      value={moodBoard.psychologyInsights.productivity.collaboration * 20} 
                      className="h-1"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                {!moodBoard.isActive && (
                  <Button 
                    size="sm" 
                    onClick={() => activateMoodBoardMutation.mutate(moodBoard.id)}
                    disabled={activateMoodBoardMutation.isPending}
                  >
                    Activate
                  </Button>
                )}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        {getMoodIcon(moodBoard.moodCategory)}
                        {moodBoard.name} - Color Psychology Insights
                      </DialogTitle>
                      <DialogDescription>{moodBoard.description}</DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="insights" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="insights">Psychology</TabsTrigger>
                        <TabsTrigger value="colors">Colors</TabsTrigger>
                        <TabsTrigger value="rating">Rate</TabsTrigger>
                      </TabsList>

                      <TabsContent value="insights" className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Psychological Effects</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            {moodBoard.psychologyInsights.effects.map((effect, index) => (
                              <li key={index}>{effect}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Best Used For</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            {moodBoard.psychologyInsights.bestFor.map((use, index) => (
                              <li key={index}>{use}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Tips for Maximum Effect</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            {moodBoard.psychologyInsights.tips.map((tip, index) => (
                              <li key={index}>{tip}</li>
                            ))}
                          </ul>
                        </div>
                      </TabsContent>

                      <TabsContent value="colors" className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-4">{moodBoard.colorPalette.name}</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            {moodBoard.colorPalette.description}
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {moodBoard.colorPalette.colors.map((color, index) => (
                              <div key={index} className="text-center">
                                <div 
                                  className="w-full h-16 rounded-lg mb-2 border shadow-sm"
                                  style={{ backgroundColor: color.hex }}
                                />
                                <p className="text-sm font-medium">{color.name}</p>
                                <p className="text-xs text-muted-foreground">{color.hex}</p>
                                <Badge variant="outline" className="text-xs mt-1">
                                  {color.role}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="rating" className="space-y-4">
                        <div className="text-center">
                          <h4 className="font-medium mb-4">Rate This Mood Board</h4>
                          <div className="flex justify-center gap-2 mb-4">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <Button
                                key={rating}
                                size="sm"
                                variant="outline"
                                onClick={() => voteMoodBoardMutation.mutate({ 
                                  moodBoardId: moodBoard.id, 
                                  rating 
                                })}
                                disabled={voteMoodBoardMutation.isPending}
                              >
                                <Star className="w-4 h-4" />
                                {rating}
                              </Button>
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Current team rating: {moodBoard.teamRating}/5
                          </p>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {moodBoards && moodBoards.length === 0 && (
        <Card className="p-12 text-center">
          <Palette className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Mood Boards Yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first mood board to enhance team productivity with color psychology
          </p>
          <Button onClick={() => setIsCreating(true)}>
            Create Your First Mood Board
          </Button>
        </Card>
      )}
    </div>
  );
};

export default WorkspaceMoodBoard;