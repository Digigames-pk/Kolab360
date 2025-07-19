import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Trophy, 
  Star, 
  Target, 
  Flame, 
  Crown, 
  Award, 
  Zap, 
  TrendingUp, 
  Calendar,
  MessageSquare,
  CheckSquare,
  Upload,
  Users,
  Coffee,
  Rocket,
  Heart,
  Shield,
  Diamond,
  Sparkles,
  Gift,
  Medal,
  Coins
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import confetti from 'canvas-confetti';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: "social" | "productivity" | "collaboration" | "milestone";
  rarity: "common" | "rare" | "epic" | "legendary";
  xp: number;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

interface UserStats {
  level: number;
  xp: number;
  xpToNext: number;
  totalXp: number;
  streak: number;
  longestStreak: number;
  messagesCount: number;
  tasksCompleted: number;
  filesShared: number;
  collaborations: number;
}

const achievements: Achievement[] = [
  {
    id: "first-message",
    title: "First Words",
    description: "Send your first message",
    icon: <MessageSquare className="h-5 w-5" />,
    category: "social",
    rarity: "common",
    xp: 10,
    progress: 1,
    maxProgress: 1,
    unlockedAt: new Date()
  },
  {
    id: "task-master",
    title: "Task Master",
    description: "Complete 10 tasks",
    icon: <CheckSquare className="h-5 w-5" />,
    category: "productivity",
    rarity: "rare",
    xp: 50,
    progress: 7,
    maxProgress: 10
  },
  {
    id: "team-player",
    title: "Team Player",
    description: "Collaborate with 5 different people",
    icon: <Users className="h-5 w-5" />,
    category: "collaboration",
    rarity: "epic",
    xp: 100,
    progress: 3,
    maxProgress: 5
  },
  {
    id: "early-bird",
    title: "Early Bird",
    description: "Be active before 8 AM for 7 days",
    icon: <Coffee className="h-5 w-5" />,
    category: "milestone",
    rarity: "rare",
    xp: 75,
    progress: 4,
    maxProgress: 7
  },
  {
    id: "file-sharer",
    title: "File Sharer",
    description: "Share 25 files",
    icon: <Upload className="h-5 w-5" />,
    category: "productivity",
    rarity: "common",
    xp: 25,
    progress: 15,
    maxProgress: 25
  },
  {
    id: "streak-legend",
    title: "Streak Legend",
    description: "Maintain a 30-day streak",
    icon: <Flame className="h-5 w-5" />,
    category: "milestone",
    rarity: "legendary",
    xp: 500,
    progress: 12,
    maxProgress: 30
  },
  {
    id: "social-butterfly",
    title: "Social Butterfly",
    description: "Send 100 messages",
    icon: <Heart className="h-5 w-5" />,
    category: "social",
    rarity: "rare",
    xp: 80,
    progress: 67,
    maxProgress: 100
  },
  {
    id: "mentor",
    title: "Mentor",
    description: "Help onboard 3 new team members",
    icon: <Crown className="h-5 w-5" />,
    category: "collaboration",
    rarity: "epic",
    xp: 150,
    progress: 1,
    maxProgress: 3
  }
];

const userStats: UserStats = {
  level: 8,
  xp: 2340,
  xpToNext: 660,
  totalXp: 2340,
  streak: 12,
  longestStreak: 24,
  messagesCount: 67,
  tasksCompleted: 23,
  filesShared: 15,
  collaborations: 8
};

export function GamificationSystem({ 
  isOpen, 
  onClose 
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [showAchievement, setShowAchievement] = useState<Achievement | null>(null);
  const [stats, setStats] = useState(userStats);

  const triggerAchievement = (achievement: Achievement) => {
    setShowAchievement(achievement);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    setTimeout(() => setShowAchievement(null), 3000);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common": return "text-gray-600 bg-gray-100 dark:bg-gray-800";
      case "rare": return "text-blue-600 bg-blue-100 dark:bg-blue-900";
      case "epic": return "text-purple-600 bg-purple-100 dark:bg-purple-900";
      case "legendary": return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case "common": return <Star className="h-3 w-3" />;
      case "rare": return <Diamond className="h-3 w-3" />;
      case "epic": return <Crown className="h-3 w-3" />;
      case "legendary": return <Trophy className="h-3 w-3" />;
      default: return <Star className="h-3 w-3" />;
    }
  };

  const categoryColors = {
    social: "text-pink-600 bg-pink-100 dark:bg-pink-900",
    productivity: "text-green-600 bg-green-100 dark:bg-green-900",
    collaboration: "text-blue-600 bg-blue-100 dark:bg-blue-900",
    milestone: "text-orange-600 bg-orange-100 dark:bg-orange-900"
  };

  const unlockedAchievements = achievements.filter(a => a.unlockedAt);
  const lockedAchievements = achievements.filter(a => !a.unlockedAt);

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Player Level */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Crown className="h-8 w-8 text-primary" />
              </motion.div>
              <div>
                <CardTitle className="text-2xl">Level {stats.level}</CardTitle>
                <p className="text-muted-foreground">Collaboration Expert</p>
              </div>
            </div>
            <Badge variant="outline" className="border-primary text-primary">
              {stats.xp} XP
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to Level {stats.level + 1}</span>
              <span>{stats.xp} / {stats.xp + stats.xpToNext}</span>
            </div>
            <Progress 
              value={(stats.xp / (stats.xp + stats.xpToNext)) * 100} 
              className="h-3"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Flame className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            </motion.div>
            <div className="text-2xl font-bold">{stats.streak}</div>
            <p className="text-sm text-muted-foreground">Day Streak</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <CheckSquare className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.tasksCompleted}</div>
            <p className="text-sm text-muted-foreground">Tasks Done</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <MessageSquare className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.messagesCount}</div>
            <p className="text-sm text-muted-foreground">Messages</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.collaborations}</div>
            <p className="text-sm text-muted-foreground">Collaborations</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span>Recent Achievements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {unlockedAchievements.slice(0, 3).map((achievement) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg"
              >
                <div className={`p-2 rounded-lg ${getRarityColor(achievement.rarity)}`}>
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">{achievement.title}</h4>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="mb-1">
                    +{achievement.xp} XP
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {achievement.unlockedAt?.toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const AchievementsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Achievements</h3>
          <p className="text-sm text-muted-foreground">
            {unlockedAchievements.length} of {achievements.length} unlocked
          </p>
        </div>
        <Progress 
          value={(unlockedAchievements.length / achievements.length) * 100} 
          className="w-32"
        />
      </div>

      <Tabs defaultValue="unlocked">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="unlocked">Unlocked ({unlockedAchievements.length})</TabsTrigger>
          <TabsTrigger value="locked">Locked ({lockedAchievements.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="unlocked" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {unlockedAchievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="h-full border border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-950/30">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2 rounded-lg ${getRarityColor(achievement.rarity)}`}>
                        {achievement.icon}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Badge variant="outline" className={`${getRarityColor(achievement.rarity)} border-current`}>
                          <span className="flex items-center space-x-1">
                            {getRarityIcon(achievement.rarity)}
                            <span className="capitalize">{achievement.rarity}</span>
                          </span>
                        </Badge>
                      </div>
                    </div>
                    <h4 className="font-semibold mb-1">{achievement.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className={categoryColors[achievement.category]}>
                        {achievement.category}
                      </Badge>
                      <div className="flex items-center space-x-1 text-green-600">
                        <Coins className="h-3 w-3" />
                        <span className="text-sm font-medium">+{achievement.xp} XP</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="locked" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lockedAchievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="h-full opacity-60">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 rounded-lg bg-muted">
                        {achievement.icon}
                      </div>
                      <Badge variant="outline" className="border-muted">
                        <span className="flex items-center space-x-1">
                          {getRarityIcon(achievement.rarity)}
                          <span className="capitalize">{achievement.rarity}</span>
                        </span>
                      </Badge>
                    </div>
                    <h4 className="font-semibold mb-1">{achievement.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                    
                    {achievement.progress !== undefined && achievement.maxProgress && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Progress</span>
                          <span>{achievement.progress}/{achievement.maxProgress}</span>
                        </div>
                        <Progress 
                          value={(achievement.progress / achievement.maxProgress) * 100} 
                          className="h-2"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className={categoryColors[achievement.category]}>
                        {achievement.category}
                      </Badge>
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <Coins className="h-3 w-3" />
                        <span className="text-sm">+{achievement.xp} XP</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  const LeaderboardTab = () => {
    const leaderboard = [
      { rank: 1, name: "Alice Johnson", level: 12, xp: 4250, avatar: "AJ" },
      { rank: 2, name: "Bob Smith", level: 10, xp: 3890, avatar: "BS" },
      { rank: 3, name: user?.firstName + " " + user?.lastName, level: stats.level, xp: stats.xp, avatar: user?.firstName?.[0] + user?.lastName?.[0] },
      { rank: 4, name: "Carol Davis", level: 7, xp: 2100, avatar: "CD" },
      { rank: 5, name: "David Wilson", level: 6, xp: 1850, avatar: "DW" }
    ];

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Team Leaderboard</h3>
          <p className="text-sm text-muted-foreground">See how you rank among your teammates</p>
        </div>

        <div className="space-y-3">
          {leaderboard.map((player, index) => (
            <motion.div
              key={player.rank}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`${player.name.includes(user?.firstName || '') ? 'ring-2 ring-primary bg-primary/5' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        player.rank === 1 ? 'bg-yellow-500 text-yellow-900' :
                        player.rank === 2 ? 'bg-gray-400 text-gray-900' :
                        player.rank === 3 ? 'bg-orange-500 text-orange-900' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {player.rank <= 3 ? 
                          (player.rank === 1 ? <Crown className="h-4 w-4" /> : 
                           player.rank === 2 ? <Medal className="h-4 w-4" /> :
                           <Award className="h-4 w-4" />) :
                          player.rank
                        }
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10">
                          {player.avatar}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-semibold">{player.name}</h4>
                      <p className="text-sm text-muted-foreground">Level {player.level}</p>
                    </div>

                    <div className="text-right">
                      <div className="font-bold">{player.xp.toLocaleString()} XP</div>
                      <p className="text-sm text-muted-foreground">#{player.rank}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4 text-center">
            <Rocket className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <h4 className="font-semibold mb-1">Keep Going!</h4>
            <p className="text-sm text-muted-foreground">
              You're {leaderboard[1].xp - stats.xp} XP away from 2nd place!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl h-[80vh] overflow-hidden p-0">
          <DialogHeader className="p-6 border-b border-border/50">
            <DialogTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span>Player Progress</span>
            </DialogTitle>
            <DialogDescription>
              Track your achievements, level up, and compete with your team
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="h-full">
              <div className="border-b border-border/50 px-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview" className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>Overview</span>
                  </TabsTrigger>
                  <TabsTrigger value="achievements" className="flex items-center space-x-2">
                    <Award className="h-4 w-4" />
                    <span>Achievements</span>
                  </TabsTrigger>
                  <TabsTrigger value="leaderboard" className="flex items-center space-x-2">
                    <Trophy className="h-4 w-4" />
                    <span>Leaderboard</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(80vh-12rem)]">
                <TabsContent value="overview" className="mt-0">
                  <OverviewTab />
                </TabsContent>
                <TabsContent value="achievements" className="mt-0">
                  <AchievementsTab />
                </TabsContent>
                <TabsContent value="leaderboard" className="mt-0">
                  <LeaderboardTab />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Achievement Notification */}
      <AnimatePresence>
        {showAchievement && (
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.8 }}
            className="fixed top-4 right-4 z-50"
          >
            <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1 }}
                  >
                    <Trophy className="h-8 w-8" />
                  </motion.div>
                  <div>
                    <h4 className="font-bold">Achievement Unlocked!</h4>
                    <p className="text-sm opacity-90">{showAchievement.title}</p>
                    <p className="text-xs opacity-75">+{showAchievement.xp} XP</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}