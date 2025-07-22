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
  Bot
} from "lucide-react";
import { useEffect } from "react";

export default function LandingPage() {
  useEffect(() => {
    // Set SEO meta tags
    document.title = "TeamSync AI - Advanced Collaboration Platform with AI-Powered Productivity | Enterprise Team Communication";
    
    // Meta description
    const metaDescription = document.querySelector('meta[name="description"]') || document.createElement('meta');
    metaDescription.setAttribute('name', 'description');
    metaDescription.setAttribute('content', 'Transform your team productivity with TeamSync AI - the ultimate collaboration platform featuring AI-powered insights, advanced task management, real-time communication, and enterprise-grade security. Start your free trial today.');
    document.head.appendChild(metaDescription);

    // Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]') || document.createElement('meta');
    ogTitle.setAttribute('property', 'og:title');
    ogTitle.setAttribute('content', 'TeamSync AI - AI-Powered Team Collaboration Platform');
    document.head.appendChild(ogTitle);

    const ogDescription = document.querySelector('meta[property="og:description"]') || document.createElement('meta');
    ogDescription.setAttribute('property', 'og:description');
    ogDescription.setAttribute('content', 'Boost team productivity by 3x with AI-powered collaboration tools, advanced task management, and intelligent workspace insights. Trusted by 50,000+ teams worldwide.');
    document.head.appendChild(ogDescription);

    const ogImage = document.querySelector('meta[property="og:image"]') || document.createElement('meta');
    ogImage.setAttribute('property', 'og:image');
    ogImage.setAttribute('content', '/teamsync-og-image.svg');
    document.head.appendChild(ogImage);

    const ogUrl = document.querySelector('meta[property="og:url"]') || document.createElement('meta');
    ogUrl.setAttribute('property', 'og:url');
    ogUrl.setAttribute('content', 'https://teamsync-ai.com');
    document.head.appendChild(ogUrl);

    // Twitter Card tags
    const twitterCard = document.querySelector('meta[name="twitter:card"]') || document.createElement('meta');
    twitterCard.setAttribute('name', 'twitter:card');
    twitterCard.setAttribute('content', 'summary_large_image');
    document.head.appendChild(twitterCard);

    // Keywords meta tag
    const keywords = document.querySelector('meta[name="keywords"]') || document.createElement('meta');
    keywords.setAttribute('name', 'keywords');
    keywords.setAttribute('content', 'team collaboration, project management, AI productivity, enterprise communication, task management, real-time messaging, workspace analytics, team productivity, business collaboration software');
    document.head.appendChild(keywords);

    // Structured data for SEO
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "TeamSync AI",
      "description": "Advanced collaboration platform with AI-powered productivity insights",
      "url": "https://teamsync-ai.com",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "2547"
      },
      "featureList": [
        "AI-Powered Analytics",
        "Real-time Messaging",
        "Advanced Task Management",
        "Calendar Integration",
        "File Sharing",
        "Mood Board Workspaces",
        "Enterprise Security"
      ]
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      // Cleanup on unmount
      document.title = "TeamSync AI";
    };
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
      description: "Smart suggestions, sentiment analysis, and automated task creation with GPT-4"
    },
    {
      icon: CheckSquare,
      title: "Advanced Task Management",
      description: "Kanban boards, priority tracking, and deadline management with visual progress"
    },
    {
      icon: Calendar,
      title: "Integrated Calendar",
      description: "Schedule meetings, set reminders, and manage events across all your workspaces"
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
      description: "Deep insights into team performance, engagement, and productivity metrics"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "SOC 2 compliant with end-to-end encryption and advanced access controls"
    }
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      features: ["Up to 5 team members", "10GB storage", "Basic messaging", "Task management"],
      popular: false
    },
    {
      name: "Pro",
      price: "$12",
      period: "per user/month",
      features: ["Unlimited team members", "100GB storage", "AI assistant", "Advanced analytics", "Priority support"],
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact sales",
      features: ["Unlimited everything", "Advanced security", "Custom integrations", "Dedicated support", "SLA guarantee"],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-6 bg-blue-100 text-blue-800 border-blue-200">
            <Zap className="h-3 w-3 mr-1" />
            AI-Powered Collaboration
          </Badge>
          
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Transform Your Team's
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Productivity</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            The ultimate collaboration platform that combines AI intelligence with intuitive design. 
            Boost productivity by 3x with smart insights, seamless communication, and advanced project management.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline">
              Watch Demo
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>4.8/5 rating</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>50,000+ teams</span>
            </div>
            <div className="flex items-center gap-1">
              <Globe className="h-4 w-4" />
              <span>150+ countries</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
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
              <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="h-12 w-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-blue-600" />
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

      {/* Pricing Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the perfect plan for your team's needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-blue-500 shadow-lg scale-105' : 'border-gray-200'}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2">
                        <CheckSquare className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                    {plan.name === "Enterprise" ? "Contact Sales" : "Get Started"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Team?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of teams already using TeamSync AI to boost productivity
          </p>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50">
            Start Your Free Trial Today
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">TeamSync AI</h3>
              <p className="text-gray-400 text-sm">
                The future of team collaboration, powered by artificial intelligence.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Features</li>
                <li>Pricing</li>
                <li>Enterprise</li>
                <li>Security</li>
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
            <p>&copy; 2025 TeamSync AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}