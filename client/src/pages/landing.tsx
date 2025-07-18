import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  MessageSquare, 
  Users, 
  Zap, 
  Heart, 
  Globe, 
  BarChart3,
  CheckSquare,
  Star,
  ArrowRight,
  Sparkles
} from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const features = [
    {
      icon: Brain,
      title: "AI Smart Assistant",
      description: "Your always-on AI companion that summarizes conversations, generates action items, and answers questions based on context.",
      gradient: "from-purple-500 to-blue-500"
    },
    {
      icon: Sparkles,
      title: "Predictive Auto-Complete",
      description: "AI-powered message completion that understands context and helps you communicate more effectively.",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: Heart,
      title: "Sentiment Analysis",
      description: "Real-time mood detection with suggestions for positive communication and conflict resolution.",
      gradient: "from-pink-500 to-rose-500"
    },
    {
      icon: Globe,
      title: "Real-time Translation",
      description: "Break language barriers with intelligent, context-aware translation powered by OpenAI.",
      gradient: "from-violet-500 to-purple-500"
    },
    {
      icon: BarChart3,
      title: "AI Insights",
      description: "Get intelligent reports on team dynamics, productivity trends, and communication patterns.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: CheckSquare,
      title: "Visual Task Management",
      description: "Kanban-style boards with AI-generated tasks from conversations and intelligent progress tracking.",
      gradient: "from-indigo-500 to-purple-500"
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "$0",
      period: "/month",
      description: "Perfect for small teams getting started",
      features: [
        "Up to 5 team members",
        "Basic AI features",
        "1GB file storage",
        "Email support"
      ],
      buttonText: "Start Free",
      buttonVariant: "outline" as const,
      popular: false
    },
    {
      name: "Professional",
      price: "$12",
      period: "/month per user",
      description: "Advanced features for growing teams",
      features: [
        "Unlimited team members",
        "Advanced AI features",
        "100GB file storage",
        "Priority support",
        "Custom integrations"
      ],
      buttonText: "Start Trial",
      buttonVariant: "default" as const,
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "/month",
      description: "Full-scale solution for large organizations",
      features: [
        "Everything in Pro",
        "Advanced security",
        "Unlimited storage",
        "24/7 dedicated support",
        "Custom AI training"
      ],
      buttonText: "Contact Sales",
      buttonVariant: "outline" as const,
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glassmorphism-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
                  <Brain className="text-white text-lg" />
                </div>
                <span className="text-xl font-bold text-white">CollabAI</span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
              <a href="#about" className="text-gray-300 hover:text-white transition-colors">About</a>
              <Button onClick={handleLogin} className="gradient-bg hover:shadow-lg transition-all">
                Get Started
              </Button>
            </div>
            <div className="md:hidden">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                <MessageSquare className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              The Future of
              <span className="gradient-text"> Team Collaboration</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Experience seamless communication powered by AI. Smart conversations, intelligent insights, and productivity like never before.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleLogin}
                size="lg"
                className="gradient-bg text-white px-8 py-3 font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all animate-glow"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="glassmorphism text-white border-white/20 hover:bg-white/10 px-8 py-3 font-semibold transition-all"
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main App Preview */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          <Card className="glassmorphism-dark border-white/10 overflow-hidden shadow-2xl">
            <CardContent className="p-0">
              <div className="flex h-[600px]">
                {/* Sidebar Preview */}
                <div className="w-64 bg-gray-900/90 backdrop-blur-sm border-r border-gray-700/50 flex flex-col">
                  <div className="p-4 border-b border-gray-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">DT</span>
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-sm">Design Team</h3>
                          <p className="text-gray-400 text-xs">You</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    <div className="sidebar-item p-3 rounded-lg bg-primary/20 text-primary">
                      <div className="flex items-center space-x-3">
                        <MessageSquare className="h-4 w-4" />
                        <span className="font-medium">Home</span>
                      </div>
                    </div>
                    <div className="sidebar-item p-3 rounded-lg text-gray-300 hover:text-white cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <Users className="h-4 w-4" />
                        <span className="font-medium">DMs</span>
                      </div>
                    </div>
                    <div className="sidebar-item p-3 rounded-lg text-gray-300 hover:text-white cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <Brain className="h-4 w-4" />
                        <span className="font-medium">AI Assistant</span>
                        <Badge variant="secondary" className="bg-accent text-white text-xs">NEW</Badge>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <h4 className="text-gray-400 text-sm font-semibold uppercase tracking-wide mb-2">Channels</h4>
                      <div className="space-y-1">
                        <div className="sidebar-item p-2 rounded-lg text-gray-300 hover:text-white cursor-pointer">
                          <div className="flex items-center space-x-3">
                            <span className="text-gray-400">#</span>
                            <span>general</span>
                            <Badge variant="destructive" className="text-xs">3</Badge>
                          </div>
                        </div>
                        <div className="sidebar-item p-2 rounded-lg text-gray-300 hover:text-white cursor-pointer">
                          <div className="flex items-center space-x-3">
                            <span className="text-gray-400">#</span>
                            <span>development</span>
                          </div>
                        </div>
                        <div className="sidebar-item p-2 rounded-lg text-gray-300 hover:text-white cursor-pointer">
                          <div className="flex items-center space-x-3">
                            <span className="text-gray-400">#</span>
                            <span>design</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chat Area Preview */}
                <div className="flex-1 flex flex-col">
                  <div className="p-4 border-b border-gray-700/50 bg-gray-800/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">#</span>
                          <h2 className="text-white font-semibold text-lg">general</h2>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-400 text-sm">
                          <Users className="h-4 w-4" />
                          <span>12 members</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">SJ</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-white font-semibold">Sarah Johnson</span>
                          <span className="text-gray-400 text-sm">Today at 2:30 PM</span>
                        </div>
                        <div className="chat-bubble bg-gray-700/50 text-gray-100 border-gray-600/50">
                          Hey team! 👋 I just pushed the new AI features to the staging environment. The sentiment analysis is working beautifully!
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 gradient-bg rounded-full flex items-center justify-center">
                        <Brain className="text-white h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-white font-semibold">AI Assistant</span>
                          <Badge className="bg-accent text-white text-xs">BOT</Badge>
                          <span className="text-gray-400 text-sm">Today at 2:32 PM</span>
                        </div>
                        <div className="chat-bubble bg-gradient-to-r from-primary/20 to-secondary/20 text-gray-100 border-primary/30">
                          🎉 Great work Sarah! I've analyzed the recent messages and detected overwhelmingly positive sentiment (92% positive). The team seems excited about the new features!
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">MC</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="typing-indicator"></div>
                        <div className="typing-indicator"></div>
                        <div className="typing-indicator"></div>
                        <span className="text-gray-400 text-sm ml-2">Mike is typing...</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-t border-gray-700/50 bg-gray-800/50 backdrop-blur-sm">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          placeholder="Type a message... (AI auto-complete enabled)"
                          className="w-full bg-gray-700/50 text-white placeholder-gray-400 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                          disabled
                        />
                      </div>
                      <Button size="sm" className="gradient-bg">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Right Panel Preview */}
                <div className="w-80 bg-gray-900/90 backdrop-blur-sm border-l border-gray-700/50 p-4">
                  <div className="space-y-6">
                    <Card className="glassmorphism border-white/10">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <BarChart3 className="text-primary h-4 w-4" />
                          <h3 className="text-white font-semibold">AI Insights</h3>
                        </div>
                        <div className="space-y-3">
                          <div className="bg-gray-800/50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-300">Team Sentiment</span>
                              <span className="text-sm text-accent font-semibold">92% Positive</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div className="bg-gradient-to-r from-accent to-green-400 h-2 rounded-full" style={{ width: "92%" }}></div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="glassmorphism border-white/10">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <Zap className="text-primary h-4 w-4" />
                          <h3 className="text-white font-semibold">Quick Actions</h3>
                        </div>
                        <div className="space-y-2">
                          <Button className="w-full gradient-bg justify-start" variant="outline">
                            <Brain className="h-4 w-4 mr-2" />
                            Ask AI Assistant
                          </Button>
                          <Button className="w-full bg-gray-700/50 justify-start" variant="outline">
                            <CheckSquare className="h-4 w-4 mr-2" />
                            Create Task
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Powered by <span className="gradient-text">Advanced AI</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience the next generation of team collaboration with intelligent features that adapt to your workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="glassmorphism border-white/10 hover:scale-105 transition-transform duration-300">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-lg flex items-center justify-center mb-4`}>
                      <IconComponent className="text-white h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-300">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Simple, <span className="gradient-text">Transparent Pricing</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Choose the perfect plan for your team. Start free and scale as you grow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`glassmorphism border-white/10 text-center relative ${plan.popular ? 'border-primary/50' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="gradient-bg text-white px-4 py-2">Most Popular</Badge>
                  </div>
                )}
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold text-white mb-4">
                    {plan.price}<span className="text-xl text-gray-300">{plan.period}</span>
                  </div>
                  <p className="text-gray-300 mb-6">{plan.description}</p>
                  <ul className="text-gray-300 mb-8 space-y-2">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center justify-center space-x-2">
                        <Star className="h-4 w-4 text-accent" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${plan.popular ? 'gradient-bg hover:shadow-lg' : 'bg-gray-700/50 hover:bg-gray-700/70'} transition-all`}
                    variant={plan.buttonVariant}
                    onClick={handleLogin}
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-700/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
                  <Brain className="text-white text-lg" />
                </div>
                <span className="text-xl font-bold text-white">CollabAI</span>
              </div>
              <p className="text-gray-400 mb-4">
                The future of team collaboration, powered by artificial intelligence.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#about" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Status</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700/50 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CollabAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
