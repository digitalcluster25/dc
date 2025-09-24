'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Rocket, 
  Zap, 
  Shield, 
  Globe, 
  Code, 
  Database,
  Server,
  FileText,
  ShoppingCart,
  CheckCircle,
  ArrowRight,
  Github,
  Twitter
} from 'lucide-react';

export default function LandingPage() {
  const templates = [
    {
      name: 'WordPress CMS',
      description: 'Complete content management system',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Odoo ERP',
      description: 'Business management suite',
      icon: ShoppingCart, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      name: 'Next.js App',
      description: 'React production framework',
      icon: Code,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      name: 'Node.js API',
      description: 'Backend REST API server',
      icon: Server,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      name: 'PostgreSQL',
      description: 'Powerful database system',
      icon: Database,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      name: 'Custom Apps',
      description: 'Your own applications',
      icon: Rocket,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ];

  const features = [
    {
      icon: Zap,
      title: 'Deploy in Minutes',
      description: 'Choose a template and deploy instantly to Railway infrastructure'
    },
    {
      icon: Shield,
      title: 'Crypto Payments Only',
      description: 'Pay with USDC or ETH - no credit cards, no KYC required'
    },
    {
      icon: Globe,
      title: 'Production Ready',
      description: 'SSL certificates, monitoring, and backups included'
    },
    {
      icon: Code,
      title: 'Any Technology',
      description: 'WordPress, Odoo, Next.js, APIs, databases - we support it all'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Railway SaaS</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#templates" className="text-gray-600 hover:text-gray-900 transition-colors">
                Templates
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                Pricing
              </a>
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                Features
              </a>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-6" variant="secondary">
            🚀 Now Live - Pay with Crypto
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Deploy Any App
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              for $12/month
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            WordPress, Odoo, Next.js, APIs, databases - choose any template and deploy to production instantly. 
            Pay with USDC or ETH. No credit cards, no complex pricing.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button size="lg" className="text-lg px-8 py-6" asChild>
              <Link href="/register">
                Start Deploying <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
              <Link href="#templates">Browse Templates</Link>
            </Button>
          </div>

          {/* Pricing Highlight */}
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-6 py-3 shadow-lg border">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="font-semibold">Simple pricing: $12 USDC per service per month</span>
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section id="templates" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Popular Templates
            </h2>
            <p className="text-xl text-gray-600">
              Production-ready applications you can deploy in minutes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template, index) => {
              const Icon = template.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${template.bgColor} flex items-center justify-center mb-4`}>
                      <Icon className={`w-6 h-6 ${template.color}`} />
                    </div>
                    <CardTitle className="text-xl">{template.name}</CardTitle>
                    <CardDescription className="text-gray-600">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900">$12</span>
                      <span className="text-gray-500">/month</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" asChild>
              <Link href="/register">Deploy Your First App</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Railway SaaS?
            </h2>
            <p className="text-xl text-gray-600">
              Built for developers who want simplicity and power
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            No hidden fees, no complex tiers. Just $12 per service per month.
          </p>

          <Card className="max-w-md mx-auto border-2 border-blue-200">
            <CardHeader className="text-center pb-2">
              <Badge className="w-fit mx-auto mb-4" variant="default">
                Simple & Fair
              </Badge>
              <CardTitle className="text-3xl">$12 USDC</CardTitle>
              <CardDescription className="text-lg">per service per month</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-4 text-left mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Any template from our catalog</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>SSL certificates included</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Automatic backups</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>24/7 monitoring</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Email support</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Pay with crypto (USDC/ETH)</span>
                </li>
              </ul>

              <Button className="w-full text-lg py-6" asChild>
                <Link href="/register">
                  Start Your First Service
                </Link>
              </Button>

              <p className="text-sm text-gray-500 mt-4">
                Need 5 services? Pay $60/month. Need 10? Pay $120/month.
                <br />
                Scale linearly with your needs.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Deploy?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join developers who choose simplicity over complexity
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
              <Link href="/register">
                Create Account <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 text-white border-white hover:bg-white hover:text-blue-600" asChild>
              <Link href="#templates">View Templates</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Railway SaaS</span>
              </div>
              <p className="text-gray-400">
                Deploy production apps with crypto payments. Simple, fast, reliable.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#templates" className="hover:text-white transition-colors">Templates</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Github className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Railway SaaS. Pay with crypto, deploy with confidence.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}