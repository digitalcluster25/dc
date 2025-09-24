import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Rocket, 
  Zap, 
  Shield, 
  DollarSign,
  Globe,
  Server,
  Code,
  Database,
  CheckCircle2,
  Star,
  Users,
  Clock,
  Wallet
} from 'lucide-react';

export default function HomePage() {
  const templates = [
    {
      name: 'WordPress CMS',
      description: 'Complete blog & website solution',
      icon: Globe,
      popular: true,
    },
    {
      name: 'Odoo ERP',
      description: 'Business management suite',
      icon: Database,
      popular: true,
    },
    {
      name: 'Next.js App',
      description: 'Modern React application',
      icon: Code,
      popular: false,
    },
    {
      name: 'Node.js API',
      description: 'RESTful backend service',
      icon: Server,
      popular: false,
    },
  ];

  const features = [
    {
      title: 'Simple Pricing',
      description: '$12 USDC per service. No hidden fees, no complex tiers.',
      icon: DollarSign,
    },
    {
      title: 'Crypto Payments Only',
      description: 'Pay with USDC or ETH. Connect your MetaMask wallet.',
      icon: Wallet,
    },
    {
      title: 'Deploy in Minutes',
      description: 'Choose template, pay, get your service running instantly.',
      icon: Rocket,
    },
    {
      title: 'Railway Powered',
      description: 'Built on Railway infrastructure for reliability.',
      icon: Zap,
    },
    {
      title: 'SSL & Security',
      description: 'HTTPS, backups, and monitoring included.',
      icon: Shield,
    },
    {
      title: '24/7 Uptime',
      description: 'Your services run smoothly around the clock.',
      icon: Clock,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Rocket className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Railway SaaS</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="#templates" className="text-sm font-medium hover:text-primary transition-colors">
              Templates
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">
              Pricing
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/register">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-24 lg:py-32">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <Badge variant="secondary" className="px-4 py-2">
              🚀 Powered by Railway Infrastructure
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Deploy Any Service
              <span className="block text-primary">For Just $12</span>
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              Choose from WordPress, Odoo, Next.js, APIs and more. 
              Pay with crypto. Deploy instantly. No complex pricing tiers.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" asChild className="text-lg px-8 py-6">
              <Link href="/register">
                Start Building
                <Rocket className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6">
              <Link href="#templates">
                Browse Templates
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>500+ Services Deployed</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span>99.9% Uptime</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span>Deploy in 2 Minutes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Hero */}
      <section id="pricing" className="container py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-muted-foreground mb-8">
            No hidden fees. No complex tiers. Just $12 per service.
          </p>
          
          <Card className="max-w-md mx-auto border-primary shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Universal Plan</CardTitle>
              <CardDescription>Perfect for any service</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div>
                <span className="text-4xl font-bold">$12</span>
                <span className="text-xl text-muted-foreground"> USDC/month</span>
              </div>
              
              <ul className="space-y-3 text-left">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Any template from our catalog</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>SSL certificate included</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Automatic backups</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>24/7 monitoring</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Technical support</span>
                </li>
              </ul>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Want 3 services? $36/month<br/>
                  Want 10 services? $120/month
                </p>
              </div>

              <Button className="w-full" asChild>
                <Link href="/register">
                  <Wallet className="mr-2 h-4 w-4" />
                  Connect Wallet & Start
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Templates Showcase */}
      <section id="templates" className="container py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Popular Templates</h2>
          <p className="text-xl text-muted-foreground">
            Each template is $12/month. Choose what you need.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {templates.map((template) => {
            const Icon = template.icon;
            return (
              <Card key={template.name} className="relative hover:shadow-lg transition-shadow">
                {template.popular && (
                  <Badge className="absolute -top-2 left-4 z-10">
                    Popular
                  </Badge>
                )}
                <CardHeader className="text-center pb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-2xl font-bold text-primary mb-4">$12</div>
                  <Button variant="outline" className="w-full">
                    Deploy Now
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" asChild>
            <Link href="/register">
              See All Templates
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Why Choose Railway SaaS?</h2>
          <p className="text-xl text-muted-foreground">
            Built for developers who want simplicity and reliability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title}>
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-16">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="text-center py-16 px-8">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Deploy Your Service?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join hundreds of developers using Railway SaaS
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/register">
                  Get Started Now
                  <Rocket className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">
                  I Have Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <Rocket className="w-3 h-3 text-primary-foreground" />
              </div>
              <span className="font-semibold">Railway SaaS</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">  
                Privacy
              </Link>
              <Link href="/support" className="hover:text-foreground transition-colors">
                Support
              </Link>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Railway SaaS. Built with ❤️ for developers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}