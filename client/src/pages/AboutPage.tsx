import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Target, 
  Heart, 
  Lightbulb,
  ArrowRight,
  LogIn,
  UserPlus,
  Globe,
  Rocket,
  Shield,
  Zap
} from "lucide-react";
import { useEffect } from "react";
import { Link } from "wouter";
import kolab360LogoPath from "@assets/KOLAB360 purple version Ai-_1753213895701.png";

export default function AboutPage() {
  useEffect(() => {
    document.title = "KOLAB360 - About Us | Transforming Team Collaboration";
  }, []);

  const values = [
    {
      icon: Users,
      title: "People First",
      description: "We believe great technology should bring people together, not create barriers. Every feature is designed with human connection at its core."
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "We constantly push the boundaries of what's possible in team collaboration, leveraging AI to make work more intelligent and efficient."
    },
    {
      icon: Heart,
      title: "Simplicity",
      description: "Complex problems deserve simple solutions. We strip away unnecessary complexity to focus on what truly matters for your team."
    },
    {
      icon: Shield,
      title: "Trust & Security",
      description: "Your data and privacy are sacred. We implement enterprise-grade security measures to protect what matters most to your organization."
    }
  ];

  const milestones = [
    {
      year: "2024",
      title: "The Vision",
      description: "Founded with the mission to revolutionize team collaboration through AI-powered insights and intuitive design."
    },
    {
      year: "2024",
      title: "First Release",
      description: "Launched our core platform with real-time messaging, task management, and workspace mood boards."
    },
    {
      year: "2025",
      title: "AI Integration",
      description: "Introduced advanced AI features including sentiment analysis, smart suggestions, and automated task generation."
    },
    {
      year: "2025",
      title: "Enterprise Ready",
      description: "Scaled to support enterprise organizations with advanced security, analytics, and administration tools."
    }
  ];

  const team = [
    {
      name: "Innovation Team",
      role: "Product Development",
      description: "Passionate engineers and designers building the future of work collaboration."
    },
    {
      name: "AI Research",
      role: "Artificial Intelligence",
      description: "Leading researchers developing cutting-edge AI features that understand and enhance team dynamics."
    },
    {
      name: "Customer Success",
      role: "Support & Growth",
      description: "Dedicated professionals ensuring every team achieves maximum productivity with KOLAB360."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer">
              <img src={kolab360LogoPath} alt="KOLAB360" className="h-8 w-auto" />
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-gray-600 hover:text-purple-600 transition-colors">
              Home
            </Link>
            <span className="text-purple-600 font-medium">About</span>
            <Link href="/pricing" className="text-gray-600 hover:text-purple-600 transition-colors">
              Pricing
            </Link>
          </nav>
          
          <div className="flex items-center gap-3">
            <Link href="/auth">
              <Button variant="outline" size="sm" className="border-purple-200 text-purple-600 hover:bg-purple-50">
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            </Link>
            <Link href="/auth">
              <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <UserPlus className="h-4 w-4 mr-2" />
                Sign Up Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-6 bg-purple-100 text-purple-800 border-purple-200">
            <Zap className="h-3 w-3 mr-1" />
            About KOLAB360
          </Badge>
          
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Transforming How
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600"> Teams Collaborate</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            KOLAB360 is more than just a collaboration platform. We're building the future of work where 
            AI enhances human creativity, intuitive design removes friction, and every team can achieve 
            extraordinary results together.
          </p>
          
          <div className="flex items-center justify-center gap-8 text-sm text-gray-600 mb-12">
            <div className="flex items-center gap-1">
              <Globe className="h-4 w-4 text-purple-600" />
              <span>150+ Countries</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-purple-600" />
              <span>50,000+ Teams</span>
            </div>
            <div className="flex items-center gap-1">
              <Rocket className="h-4 w-4 text-purple-600" />
              <span>3x Productivity Boost</span>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                We believe that great teams can change the world. Our mission is to remove the barriers 
                that prevent teams from reaching their full potential by creating technology that's 
                intuitive, intelligent, and inspiring.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                Every feature we build, every decision we make, is guided by one simple question: 
                "Does this help teams work better together?" The answer shapes everything we do.
              </p>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-purple-600 border-purple-200">
                  <Target className="h-3 w-3 mr-1" />
                  Goal-Driven
                </Badge>
                <Badge variant="outline" className="text-blue-600 border-blue-200">
                  <Heart className="h-3 w-3 mr-1" />
                  Human-Centered
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <Card className="text-center">
                <CardHeader>
                  <div className="h-12 w-12 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-purple-600">50k+</CardTitle>
                  <CardDescription>Active Teams</CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="text-center">
                <CardHeader>
                  <div className="h-12 w-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Globe className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-blue-600">150+</CardTitle>
                  <CardDescription>Countries</CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="text-center">
                <CardHeader>
                  <div className="h-12 w-12 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Rocket className="h-6 w-6 text-indigo-600" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-indigo-600">3x</CardTitle>
                  <CardDescription>Productivity Increase</CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="text-center">
                <CardHeader>
                  <div className="h-12 w-12 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-green-600">99.9%</CardTitle>
                  <CardDescription>Uptime</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do and every decision we make
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-white/80 backdrop-blur-sm text-center">
                <CardHeader>
                  <div className="h-16 w-16 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {value.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <section className="py-16 px-4 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Our Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From vision to reality - how we're building the future of team collaboration
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {milestones.map((milestone, index) => (
              <Card key={index} className="border-l-4 border-l-purple-500 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <Badge className="w-fit bg-purple-100 text-purple-800 mb-2">
                    {milestone.year}
                  </Badge>
                  <CardTitle className="text-lg">{milestone.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {milestone.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Passionate professionals dedicated to transforming how teams work together
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="h-20 w-20 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                    {member.name.split(' ').map(word => word[0]).join('')}
                  </div>
                  <CardTitle className="text-xl">{member.name}</CardTitle>
                  <CardDescription className="text-purple-600 font-medium">
                    {member.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    {member.description}
                  </p>
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
            Join Our Mission
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Be part of the revolution that's transforming how teams collaborate and achieve extraordinary results
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-50">
                Start Your Journey
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                View Pricing Plans
              </Button>
            </Link>
          </div>
          <p className="text-sm text-purple-200 mt-4">
            Join 50,000+ teams already transforming their productivity with KOLAB360
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src={kolab360LogoPath} alt="KOLAB360" className="h-6 w-auto" />
              </div>
              <p className="text-gray-400 text-sm">
                The future of team collaboration, powered by artificial intelligence.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/" className="hover:text-white transition-colors">Enterprise</Link></li>
                <li><Link href="/" className="hover:text-white transition-colors">Security</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><span className="text-white">About</span></li>
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