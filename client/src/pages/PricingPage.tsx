import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  X, 
  Star,
  ArrowRight,
  LogIn,
  UserPlus,
  Zap
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import kolab360LogoPath from "@assets/KOLAB360 purple version Ai-_1753213895701.png";

interface PricingPlan {
  id: number;
  name: string;
  displayName: string;
  description: string;
  price: number;
  billingPeriod: string;
  maxUsers: number;
  maxStorage: number;
  maxWorkspaces: number;
  maxChannelsPerWorkspace: number;
  maxFileSize: number;
  maxApiCallsPerMonth: number;
  messageHistoryDays: number;
  maxVideoCallDuration: number;
  features: {
    messaging?: boolean;
    channels?: boolean;
    workspaces?: boolean;
    tasks?: boolean;
    integrations?: boolean;
    analytics?: boolean;
    security?: boolean;
    ai?: boolean;
    support?: boolean;
  };
  isActive: boolean;
  isCustom: boolean;
  sortOrder: number;
}

export default function PricingPage() {
  useEffect(() => {
    document.title = "KOLAB360 - Pricing Plans | Choose Your Perfect Plan";
  }, []);

  const { data: pricingPlans = [], isLoading } = useQuery<PricingPlan[]>({
    queryKey: ['/api/pricing-plans'],
    select: (data) => data.filter(plan => plan.isActive).sort((a, b) => a.sortOrder - b.sortOrder)
  });

  const formatPrice = (price: number) => {
    if (price === 0) return "Free";
    return `$${price}`;
  };

  const formatStorage = (storage: number) => {
    if (storage < 1000) return `${storage}GB`;
    return `${storage / 1000}TB`;
  };

  const formatUsers = (users: number) => {
    if (users === -1) return "Unlimited";
    return users.toString();
  };

  const getFeatureList = (plan: PricingPlan) => {
    const features = [];
    
    if (plan.maxUsers > 0) {
      features.push(`Up to ${formatUsers(plan.maxUsers)} team members`);
    } else if (plan.maxUsers === -1) {
      features.push("Unlimited team members");
    }
    
    features.push(`${formatStorage(plan.maxStorage)} storage`);
    
    if (plan.features.messaging) features.push("Real-time messaging");
    if (plan.features.channels) features.push("Unlimited channels");
    if (plan.features.tasks) features.push("Advanced task management");
    if (plan.features.ai) features.push("AI-powered assistant");
    if (plan.features.analytics) features.push("Team analytics");
    if (plan.features.integrations) features.push("Third-party integrations");
    if (plan.features.security) features.push("Enterprise security");
    if (plan.features.support) features.push("Priority support");
    
    if (plan.messageHistoryDays > 0) {
      features.push(`${plan.messageHistoryDays} days message history`);
    }
    
    if (plan.maxFileSize > 0) {
      features.push(`${plan.maxFileSize}MB max file size`);
    }
    
    return features;
  };

  const getMostPopularPlan = () => {
    return pricingPlans.find(plan => plan.name.toLowerCase() === 'pro') || pricingPlans[1];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pricing plans...</p>
        </div>
      </div>
    );
  }

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
            <Link href="/about" className="text-gray-600 hover:text-purple-600 transition-colors">
              About
            </Link>
            <span className="text-purple-600 font-medium">Pricing</span>
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
            Transparent Pricing
          </Badge>
          
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Choose Your Perfect
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600"> Plan</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Scale your team collaboration with flexible pricing that grows with your business. 
            Start free and upgrade when you need more power.
          </p>
          
          <div className="flex items-center justify-center gap-8 text-sm text-gray-600 mb-12">
            <div className="flex items-center gap-1">
              <Check className="h-4 w-4 text-green-500" />
              <span>No setup fees</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="h-4 w-4 text-green-500" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="h-4 w-4 text-green-500" />
              <span>14-day money back</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {pricingPlans.map((plan) => {
              const isPopular = plan.id === getMostPopularPlan()?.id;
              return (
                <Card key={plan.id} className={`relative ${isPopular ? 'border-purple-500 shadow-lg scale-105' : 'border-gray-200'} transition-all duration-300 hover:shadow-lg`}>
                  {isPopular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl font-bold">{plan.displayName}</CardTitle>
                    <CardDescription className="text-gray-600 mb-4">
                      {plan.description}
                    </CardDescription>
                    
                    <div className="flex items-baseline justify-center gap-1 mb-4">
                      <span className="text-4xl font-bold text-gray-900">
                        {formatPrice(plan.price)}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-gray-600">/{plan.billingPeriod}</span>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <ul className="space-y-3 mb-6">
                      {getFeatureList(plan).map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Link href="/auth">
                      <Button 
                        className={`w-full ${isPopular 
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' 
                          : ''
                        }`} 
                        variant={isPopular ? "default" : "outline"}
                      >
                        {plan.price === 0 ? "Get Started Free" : "Start Free Trial"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-white/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about our pricing
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I change plans anytime?</h3>
                <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
                <p className="text-gray-600">We accept all major credit cards, PayPal, and bank transfers for annual plans.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Is there a free trial?</h3>
                <p className="text-gray-600">Yes! All paid plans come with a 14-day free trial. No credit card required.</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">What happens if I exceed my limits?</h3>
                <p className="text-gray-600">We'll notify you when you're approaching limits and help you upgrade seamlessly.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Do you offer discounts for non-profits?</h3>
                <p className="text-gray-600">Yes, we offer special pricing for qualified non-profit organizations and educational institutions.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I get a refund?</h3>
                <p className="text-gray-600">We offer a 14-day money-back guarantee for all paid plans, no questions asked.</p>
              </div>
            </div>
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
                Start Your Free Trial
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
            No credit card required • 14-day free trial • Cancel anytime
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
                <li><span className="text-white">Pricing</span></li>
                <li><Link href="/" className="hover:text-white transition-colors">Enterprise</Link></li>
                <li><Link href="/" className="hover:text-white transition-colors">Security</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
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