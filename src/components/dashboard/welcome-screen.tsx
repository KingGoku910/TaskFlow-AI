'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  CheckCircle, 
  ArrowRight, 
  BookOpen, 
  Target,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import Link from 'next/link';

interface WelcomeScreenProps {
  onGetStarted?: () => void;
}

export function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  const features = [
    {
      icon: Target,
      title: 'Task Management',
      description: 'Organize your work with powerful Kanban boards',
      path: '/dashboard/tasks'
    },
    {
      icon: Zap,
      title: 'AI-Powered Tools',
      description: 'Generate notes, decompose tasks, and boost productivity',
      path: '/dashboard/note-generator'
    },
    {
      icon: TrendingUp,
      title: 'Analytics & Insights',
      description: 'Track your progress and optimize your workflow',
      path: '/dashboard/analytics'
    },
    {
      icon: Users,
      title: 'Meeting Summaries',
      description: 'Record and summarize meetings with AI assistance',
      path: '/dashboard/meeting-summaries'
    }
  ];

  const tutorialSteps = [
    'Welcome & Dashboard Overview',
    'Create Your First Task',
    'Explore Task Details & Checklists',
    'Try AI Task Decomposition',
    'Generate AI Notes',
    'Complete Your Journey'
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Hero Welcome Section */}
      <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
            Welcome to Effecto TaskFlow! 
            <Badge variant="secondary" className="text-xs">
              🎉 NEW USER
            </Badge>
          </CardTitle>
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
            Your productivity journey starts here. We'll guide you through our powerful features 
            to help you organize tasks, boost efficiency, and achieve your goals.
          </p>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/dashboard/tasks">
              <Button size="lg" className="w-full sm:w-auto">
                <BookOpen className="mr-2 h-5 w-5" />
                Start Tutorial
              </Button>
            </Link>
            <Button variant="outline" size="lg" onClick={onGetStarted} className="w-full sm:w-auto">
              <TrendingUp className="mr-2 h-5 w-5" />
              View Analytics Anyway
            </Button>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm font-medium mb-2 flex items-center justify-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              6-Step Interactive Tutorial
            </p>
            <p className="text-xs text-muted-foreground">
              Learn all features in just 10 minutes. Your tutorial tasks are already created!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tutorial Steps Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            What You'll Learn
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tutorialSteps.map((step, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <span className="text-sm font-medium">{step}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Key Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <Link key={index} href={feature.path}>
                <div className="group p-4 rounded-lg border hover:border-primary/50 transition-all cursor-pointer hover:shadow-md">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {feature.description}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Getting Started Tips */}
      <Card className="border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-900/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
            <Target className="h-5 w-5" />
            Quick Start Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Your tutorial tasks are ready in the <strong>Tasks</strong> section</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Access <strong>Settings</strong> to restart the tutorial anytime</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Try the <strong>AI Note Generator</strong> for quick documentation</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Use <strong>Task Decomposition</strong> to break down complex work</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
