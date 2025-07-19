import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowRight, 
  ArrowLeft, 
  MessageSquare, 
  Users, 
  Settings, 
  CheckCircle2,
  Star,
  Rocket,
  Heart,
  Zap,
  Target,
  Gift,
  Trophy,
  Sparkles,
  Play,
  Camera,
  Mic,
  FileText,
  Calendar,
  Bell,
  Shield
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  content: React.ReactNode;
  actionLabel?: string;
  isCompleted?: boolean;
}

export function InteractiveOnboarding({ 
  isOpen, 
  onClose, 
  onComplete 
}: {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [showConfetti, setShowConfetti] = useState(false);

  const steps: OnboardingStep[] = [
    {
      id: "welcome",
      title: "Welcome to Kolab360!",
      description: "Let's get you started with your new collaboration workspace",
      icon: Rocket,
      color: "bg-gradient-to-r from-blue-500 to-purple-600",
      content: (
        <div className="text-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="mx-auto w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
          >
            <Rocket className="h-16 w-16 text-white" />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-4">Ready to collaborate?</h2>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Kolab360 brings your team together with powerful tools for communication, 
              project management, and seamless collaboration.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex justify-center space-x-8 pt-4"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-2">
                <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-sm font-medium">Real-time Chat</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-2">
                <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-sm font-medium">Task Management</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-2">
                <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-sm font-medium">AI Assistance</p>
            </div>
          </motion.div>
        </div>
      ),
      actionLabel: "Get Started"
    },
    {
      id: "workspace",
      title: "Understanding Workspaces",
      description: "Organize your teams and projects with dedicated workspaces",
      icon: Users,
      color: "bg-gradient-to-r from-green-500 to-emerald-600",
      content: (
        <div className="space-y-6">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <div className="mx-auto w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4">
              <Users className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Workspaces organize everything</h3>
            <p className="text-muted-foreground">
              Think of workspaces as separate areas for different teams or projects.
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <Card className="p-4 border-2 border-dashed border-green-300 bg-green-50 dark:bg-green-950">
              <CardContent className="p-0">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">M</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Marketing Team</h4>
                    <p className="text-sm text-muted-foreground">Campaign planning & execution</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-4">
              <CardContent className="p-0">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">D</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Development</h4>
                    <p className="text-sm text-muted-foreground">Product development & tech</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4"
          >
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100">Pro Tip</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  You can switch between workspaces using the sidebar. Each workspace has its own channels, members, and settings.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      ),
      actionLabel: "Got it!"
    },
    {
      id: "channels",
      title: "Channels & Communication",
      description: "Discover how to communicate effectively with your team",
      icon: MessageSquare,
      color: "bg-gradient-to-r from-purple-500 to-pink-600",
      content: (
        <div className="space-y-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <div className="mx-auto w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Channels keep conversations organized</h3>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">#</span>
              </div>
              <div>
                <h4 className="font-medium">#general</h4>
                <p className="text-sm text-muted-foreground">Company-wide announcements and discussions</p>
              </div>
              <Badge className="ml-auto">Public</Badge>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="font-medium">leadership-team</h4>
                <p className="text-sm text-muted-foreground">Private discussions for leadership</p>
              </div>
              <Badge variant="secondary" className="ml-auto">Private</Badge>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-2 gap-4 pt-4"
          >
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <Camera className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Video Calls</p>
              <p className="text-xs text-muted-foreground">Click the video icon</p>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <Mic className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Voice Calls</p>
              <p className="text-xs text-muted-foreground">Quick voice chats</p>
            </div>
          </motion.div>
        </div>
      ),
      actionLabel: "Show me more"
    },
    {
      id: "features",
      title: "Amazing Features",
      description: "Discover the powerful tools that make collaboration effortless",
      icon: Star,
      color: "bg-gradient-to-r from-orange-500 to-red-600",
      content: (
        <div className="space-y-6">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <div className="mx-auto w-24 h-24 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mb-4">
              <Star className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Everything you need to succeed</h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-4"
          >
            {[
              { icon: Target, label: "Task Boards", color: "text-blue-600" },
              { icon: Calendar, label: "Smart Calendar", color: "text-green-600" },
              { icon: FileText, label: "Documents", color: "text-purple-600" },
              { icon: Zap, label: "AI Assistant", color: "text-yellow-600" },
              { icon: Bell, label: "Smart Notifications", color: "text-red-600" },
              { icon: Trophy, label: "Achievements", color: "text-orange-600" }
            ].map((feature, index) => (
              <motion.div
                key={feature.label}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1, type: "spring" }}
                className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border"
              >
                <feature.icon className={`h-8 w-8 ${feature.color} mx-auto mb-2`} />
                <p className="text-sm font-medium">{feature.label}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 rounded-lg p-4"
          >
            <div className="flex items-center space-x-3">
              <Heart className="h-6 w-6 text-red-500" />
              <div>
                <h4 className="font-medium">Built for teams like yours</h4>
                <p className="text-sm text-muted-foreground">
                  Every feature is designed to make your team more productive and connected.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      ),
      actionLabel: "Awesome!"
    },
    {
      id: "complete",
      title: "You're All Set!",
      description: "Welcome to your new productive workspace",
      icon: Trophy,
      color: "bg-gradient-to-r from-yellow-500 to-orange-600",
      content: (
        <div className="text-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="mx-auto w-32 h-32 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center relative"
          >
            <Trophy className="h-16 w-16 text-white" />
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8 }}
              className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
            >
              <CheckCircle2 className="h-5 w-5 text-white" />
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-4">Congratulations! 🎉</h2>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              You've completed the onboarding! You're now ready to collaborate 
              with your team and achieve amazing things together.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-center space-x-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-2 mx-auto">
                  <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-sm font-medium">Start chatting</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-2 mx-auto">
                  <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-sm font-medium">Create tasks</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-2 mx-auto">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-sm font-medium">Invite team</p>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-950 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Gift className="h-6 w-6 text-yellow-600" />
                <div>
                  <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
                    Achievement Unlocked!
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    "Welcome Aboard" - You've completed your first onboarding! 
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      ),
      actionLabel: "Start Collaborating"
    }
  ];

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const nextStep = () => {
    setCompletedSteps(prev => new Set([...prev, currentStepData.id]));
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowConfetti(true);
      setTimeout(() => {
        onComplete();
      }, 2000);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  useEffect(() => {
    if (showConfetti && typeof window !== 'undefined') {
      // Dynamic import of confetti to avoid SSR issues
      import('canvas-confetti').then((confetti) => {
        confetti.default({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      });
    }
  }, [showConfetti]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[85vh] p-0 overflow-hidden">
        <div className="flex h-full">
          {/* Progress Sidebar */}
          <div className="w-80 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-2">Getting Started</h2>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </div>

              <div className="space-y-3">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = completedSteps.has(step.id);
                  const isCurrent = index === currentStep;
                  
                  return (
                    <motion.div
                      key={step.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all ${
                        isCurrent 
                          ? 'bg-white dark:bg-gray-800 shadow-md border' 
                          : isCompleted
                            ? 'bg-green-50 dark:bg-green-950'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => goToStep(index)}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isCompleted 
                          ? 'bg-green-500 text-white' 
                          : isCurrent 
                            ? step.color + ' text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <Icon className="h-5 w-5" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-medium text-sm ${
                          isCurrent ? 'text-gray-900 dark:text-white' : 
                          isCompleted ? 'text-green-700 dark:text-green-300' : 
                          'text-gray-600 dark:text-gray-400'
                        }`}>
                          {step.title}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                          {step.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 p-8 overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  {currentStepData.content}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </Button>

                <div className="flex items-center space-x-2">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentStep 
                          ? 'bg-blue-500 w-6' 
                          : index < currentStep 
                            ? 'bg-green-500' 
                            : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>

                <Button
                  onClick={nextStep}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <span>{currentStepData.actionLabel || "Next"}</span>
                  {currentStep === steps.length - 1 ? (
                    <Play className="h-4 w-4" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}