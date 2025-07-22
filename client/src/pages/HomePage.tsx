import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Users, 
  Calendar, 
  CheckSquare, 
  Upload, 
  Zap, 
  Shield, 
  Globe,
  Star,
  ArrowRight,
  Palette,
  Bot,
  LogIn,
  UserPlus
} from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import kolab360LogoPath from "@assets/KOLAB360 purple version Ai-_1753213895701.png";

import KOLAB360_white_version_Ai from "@assets/KOLAB360 white version Ai.png";

export default function HomePage() {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    document.title = "KOLAB360 - Transform Your Team's Productivity";
  }, []);

  const features = [
    {
      icon: MessageSquare,
      title: "Real-time Messaging",
      description: "Instant communication with channels, direct messages, and threaded conversations"
    },
    {
      icon: Bot,
      title: "AI-Powered Assistant",
      description: "Smart suggestions, sentiment analysis, and automated task creation"
    },
    {
      icon: CheckSquare,
      title: "Advanced Task Management",
      description: "Kanban boards, priority tracking, and visual progress management"
    },
    {
      icon: Calendar,
      title: "Integrated Calendar",
      description: "Schedule meetings, set reminders, and manage events seamlessly"
    },
    {
      icon: Upload,
      title: "Cloud File Storage",
      description: "Secure file sharing with version control and collaboration tools"
    },
    {
      icon: Palette,
      title: "Mood Board Workspaces",
      description: "Color psychology insights to enhance team productivity and well-being"
    },
    {
      icon: Users,
      title: "Team Analytics",
      description: "Deep insights into team performance and engagement metrics"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "SOC 2 compliant with end-to-end encryption and access controls"
    }
  ];

  const stats = [
    { number: "50,000+", label: "Teams Worldwide" },
    { number: "4.8/5", label: "Customer Rating" },
    { number: "150+", label: "Countries" },
    { number: "99.9%", label: "Uptime" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={kolab360LogoPath} alt="KOLAB360" className="h-8 w-auto" />
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/about" className="text-gray-600 hover:text-purple-600 transition-colors">
              About
            </Link>
            <Link href="/pricing" className="text-gray-600 hover:text-purple-600 transition-colors">
              Pricing
            </Link>
            <Link href="/features" className="text-gray-600 hover:text-purple-600 transition-colors">
              Features
            </Link>
          </nav>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-purple-200 text-purple-600 hover:bg-purple-50"
              onClick={() => {
                console.log('Sign In button clicked - navigating to /auth');
                setLocation('/auth');
              }}
            >
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </Button>
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              onClick={() => {
                console.log('Sign Up button clicked - navigating to /auth');
                setLocation('/auth');
              }}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Sign Up Free
            </Button>
          </div>
        </div>
      </header>
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-6 bg-purple-100 text-purple-800 border-purple-200">
            <Zap className="h-3 w-3 mr-1" />
            AI-Powered Collaboration
          </Badge>
          
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Transform Your Team's
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600"> Productivity</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            The ultimate collaboration platform that combines AI intelligence with intuitive design. 
            Boost productivity by 3x with smart insights, seamless communication, and advanced project management.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              onClick={() => {
                console.log('Start Free Trial button clicked - navigating to /auth');
                setLocation('/auth');
              }}
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Link href="/landing">
              <Button size="lg" variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50">
                Learn More
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-1">{stat.number}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Features Preview */}
      <section className="py-16 px-4 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Everything Your Team Needs
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to streamline collaboration and boost productivity
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="h-12 w-12 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of teams already using KOLAB360 to boost productivity
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-50">
                Sign Up Free Today
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            </Link>
          </div>
          <p className="text-sm text-purple-200 mt-4">
            No credit card required • Free plan includes 5 team members • Upgrade anytime
          </p>
        </div>
      </section>
      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src={KOLAB360_white_version_Ai} alt="KOLAB360" className="h-6 w-auto" />
              </div>
              <p className="text-gray-400 text-sm">
                The future of team collaboration, powered by artificial intelligence.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/landing" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/landing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/landing" className="hover:text-white transition-colors">Enterprise</Link></li>
                <li><Link href="/landing" className="hover:text-white transition-colors">Security</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Help Center</li>
                <li>Documentation</li>
                <li>API</li>
                <li>Status</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 KOLAB360. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}