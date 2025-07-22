import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Calendar, 
  CheckSquare2, 
  File, 
  Brain, 
  Users, 
  Shield, 
  Zap,
  Globe,
  Smartphone,
  BarChart3,
  Search,
  Bell,
  Video,
  Upload,
  Lock,
  Clock,
  Star,
  ArrowRight,
  Palette
} from "lucide-react";

export default function FeaturesPage() {
  const coreFeatures = [
    {
      icon: MessageSquare,
      title: "Advanced Messaging",
      description: "Real-time messaging with threading, reactions, file sharing, and AI-powered smart replies",
      features: ["Real-time chat", "Message threading", "File attachments", "Emoji reactions", "Message search", "AI suggestions"]
    },
    {
      icon: Calendar,
      title: "Smart Calendar",
      description: "Integrated calendar system with meeting scheduling, reminders, and team availability",
      features: ["Team calendars", "Meeting scheduling", "Automated reminders", "Availability tracking", "Event templates", "Calendar sync"]
    },
    {
      icon: CheckSquare2,
      title: "Task Management",
      description: "Kanban-style task boards with drag-and-drop, priority management, and progress tracking",
      features: ["Kanban boards", "Task priorities", "Progress tracking", "Team assignments", "Due date alerts", "Custom workflows"]
    },
    {
      icon: File,
      title: "File Management",
      description: "Cloud-based file storage with version control, sharing permissions, and advanced search",
      features: ["Cloud storage", "Version history", "Permission controls", "File preview", "Advanced search", "Bulk operations"]
    },
    {
      icon: Brain,
      title: "AI Assistant",
      description: "OpenAI-powered intelligent assistant for productivity, content generation, and insights",
      features: ["Smart suggestions", "Content generation", "Meeting summaries", "Sentiment analysis", "Auto-completion", "Data insights"]
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Multi-workspace environments with role-based permissions and team management",
      features: ["Multiple workspaces", "Role management", "Team channels", "Guest access", "Activity feeds", "Mention system"]
    }
  ];

  const advancedFeatures = [
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Advanced security features including SSO, 2FA, and compliance controls",
      badge: "Enterprise"
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      description: "Comprehensive analytics dashboard with team productivity metrics",
      badge: "Pro"
    },
    {
      icon: Globe,
      title: "API Integration",
      description: "Extensive API access for custom integrations and workflow automation",
      badge: "Business"
    },
    {
      icon: Video,
      title: "Video Conferencing",
      description: "Built-in video calls, screen sharing, and meeting recordings",
      badge: "Pro"
    },
    {
      icon: Palette,
      title: "Workspace Mood Board",
      description: "Color psychology-based mood boards to enhance team well-being and productivity",
      badge: "Pro"
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Intelligent notification system with priority filtering and quiet hours",
      badge: "Starter"
    }
  ];

  const integrations = [
    { name: "Slack", description: "Import data from Slack workspaces" },
    { name: "Microsoft Teams", description: "Sync with Teams calendars and files" },
    { name: "Google Workspace", description: "Connect Gmail, Drive, and Calendar" },
    { name: "Zoom", description: "Schedule and join Zoom meetings" },
    { name: "Dropbox", description: "Sync files with Dropbox storage" },
    { name: "Trello", description: "Import boards and tasks from Trello" },
    { name: "GitHub", description: "Link repositories and track commits" },
    { name: "Jira", description: "Sync issues and project tracking" }
  ];

  const mobileFeatures = [
    "Native mobile apps for iOS and Android",
    "Offline message sync",
    "Push notifications",
    "Touch-optimized task management",
    "Mobile file upload and preview",
    "Voice message support"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      {/* Navigation */}
      <nav className="border-b border-purple-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">K360</span>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">KOLAB360</span>
              </div>
            </Link>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-600 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400 transition-colors">Home</Link>
              <Link href="/features" className="text-purple-600 dark:text-purple-400 font-medium">Features</Link>
              <Link href="/pricing" className="text-gray-600 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400 transition-colors">Pricing</Link>
              <Link href="/about" className="text-gray-600 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400 transition-colors">About</Link>
              <Link href="/auth">
                <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/20">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-6 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
            ✨ Comprehensive Feature Set
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Everything You Need for
            <span className="block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Team Success
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            KOLAB360 combines messaging, task management, calendar integration, file sharing, and AI assistance 
            into one powerful platform designed to enhance team productivity and collaboration.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/20">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Core Features
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Six powerful modules that work seamlessly together to create the ultimate collaboration experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreFeatures.map((feature, index) => (
              <Card key={index} className="border-purple-100 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-gray-900 dark:text-white">{feature.title}</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.features.map((item, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <Star className="h-3 w-3 text-purple-500 mr-2 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Advanced Capabilities
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Enterprise-grade features designed for teams that demand the best in security, analytics, and automation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {advancedFeatures.map((feature, index) => (
              <Card key={index} className="border-purple-100 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                      {feature.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-gray-900 dark:text-white">{feature.title}</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Seamless Integrations
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Connect with your existing tools and workflows. KOLAB360 integrates with popular platforms you already use.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {integrations.map((integration, index) => (
              <Card key={index} className="text-center p-6 border-purple-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <Globe className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{integration.name}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-300">{integration.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-6 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                📱 Mobile First
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Work From Anywhere
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Native mobile apps ensure you stay connected and productive whether you're in the office, 
                at home, or on the go. Full feature parity across all devices.
              </p>
              <ul className="space-y-3">
                {mobileFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-700 dark:text-gray-300">
                    <Smartphone className="h-5 w-5 text-purple-500 mr-3 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl p-8 text-white">
                <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-white/20 rounded-full"></div>
                      <div className="w-16 h-2 bg-white/20 rounded"></div>
                    </div>
                    <Clock className="h-5 w-5 text-white/70" />
                  </div>
                  <div className="space-y-3">
                    <div className="w-full h-3 bg-white/20 rounded"></div>
                    <div className="w-3/4 h-3 bg-white/20 rounded"></div>
                    <div className="w-1/2 h-3 bg-white/20 rounded"></div>
                  </div>
                  <div className="mt-6 flex space-x-2">
                    <div className="w-8 h-8 bg-white/20 rounded"></div>
                    <div className="w-8 h-8 bg-white/20 rounded"></div>
                    <div className="w-8 h-8 bg-white/20 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Team's Productivity?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Join thousands of teams who have already discovered the power of unified collaboration. 
            Start your free trial today and experience the difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-50">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                View Pricing Plans
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">K360</span>
                </div>
                <span className="text-xl font-bold">KOLAB360</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Transforming team collaboration through intelligent, adaptive workspace management and comprehensive communication tools.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 KOLAB360. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}