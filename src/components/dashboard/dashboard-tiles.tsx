'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Brain, Mic, BarChart3 } from 'lucide-react';
import Link from 'next/link';

interface DashboardTilesProps {
  initialTaskStats?: TaskStats | null;
}

interface TaskStats {
  total: number;
  todo: number;
  inProgress: number;
  completed: number;
  recentTasks: number;
  completionRate: number;
}

export function DashboardTiles({ initialTaskStats }: DashboardTilesProps) {
  const taskStats = initialTaskStats || {
    total: 0,
    todo: 0,
    inProgress: 0,
    completed: 0,
    recentTasks: 0,
    completionRate: 0
  };
  
  const loading = !initialTaskStats;

  // Since we're now getting stats from server, no client-side fetching needed
  // Just use the initial stats provided

  const features = [
    {
      id: 'tasks',
      title: 'Task Management',
      href: '/dashboard/tasks',
      icon: ClipboardList,
      description: 'Organize and track your tasks with Kanban boards',
      stats: loading ? 'Loading...' : `${taskStats.total} tasks`,
      color: 'bg-blue-500',
      details: loading ? [] : [
        { label: 'Todo', value: taskStats.todo, color: 'bg-yellow-500' },
        { label: 'In Progress', value: taskStats.inProgress, color: 'bg-blue-500' },
        { label: 'Completed', value: taskStats.completed, color: 'bg-green-500' }
      ]
    },
    {
      id: 'ai-notes',
      title: 'AI Note Generator',
      href: '/dashboard/note-generator',
      icon: Brain,
      description: 'Generate structured notes on any topic using AI',
      stats: 'AI-Powered',
      color: 'bg-purple-500',
      details: [
        { label: 'Instant', value: 'Generation', color: 'bg-purple-500' },
        { label: 'Structured', value: 'Format', color: 'bg-indigo-500' }
      ]
    },
    {
      id: 'meeting-summaries',
      title: 'Meeting Summaries',
      href: '/dashboard/meeting-summaries',
      icon: Mic,
      description: 'Record and summarize meetings with AI assistance',
      stats: 'Voice-to-Text',
      color: 'bg-green-500',
      details: [
        { label: 'Voice', value: 'Recording', color: 'bg-green-500' },
        { label: 'AI', value: 'Summary', color: 'bg-teal-500' }
      ]
    },
    {
      id: 'analytics',
      title: 'Analytics',
      href: '/dashboard/analytics',
      icon: BarChart3,
      description: 'View insights and performance metrics',
      stats: loading ? 'Loading...' : `${taskStats.completionRate}% completion`,
      color: 'bg-orange-500',
      details: loading ? [] : [
        { label: 'Completion', value: `${taskStats.completionRate}%`, color: 'bg-orange-500' },
        { label: 'Recent', value: taskStats.recentTasks, color: 'bg-red-500' }
      ]
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
      {features.map((feature) => (
        <Card key={feature.id} className="dashboard-tile group hover:shadow-lg transition-all duration-200 border-2 border-gray-200 dark:!border-[var(--sidebar-accent)] dark:hover:!border-[var(--sidebar-accent-hov)] hover:border-primary/75">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${feature.color} text-white`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
              <Badge variant="secondary" className="feature-stats">
                {feature.stats}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {feature.details.map((detail, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${detail.color}`}></div>
                    <span className="font-medium">{detail.label}:</span>
                    <span className="text-muted-foreground">{detail.value}</span>
                  </div>
                ))}
              </div>
              <Link href={feature.href} className="w-full">
                <Button className="w-full bg-sidebar-accent hover:bg-sidebar-accent-hov group-hover:bg-primary/90 transition-colors">
                  Open {feature.title}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
