import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Crown, Zap, Users, TrendingUp } from 'lucide-react';

interface SubscriptionData {
  subscription: {
    tier: 'free' | 'pro' | 'enterprise';
    status: string;
    current_period_end: string;
    plan_limits: {
      max_tasks_per_month: number;
      max_ai_requests_per_month: number;
      max_notes_per_month: number;
      max_meeting_summaries_per_month: number;
      max_storage_mb: number;
      ai_task_decomposition: boolean;
      meeting_summarization: boolean;
      advanced_analytics: boolean;
      team_collaboration: boolean;
      priority_support: boolean;
      custom_integrations: boolean;
    };
  };
  usage: {
    tasks_used: number;
    ai_requests_used: number;
    notes_used: number;
    meeting_summaries_used: number;
    storage_used_mb: number;
    reset_date: string;
  };
  daysRemaining: number;
  isInTrial: boolean;
}

interface UsageStats {
  tasks: { used: number; limit: number; percentage: number };
  ai_requests: { used: number; limit: number; percentage: number };
  notes: { used: number; limit: number; percentage: number };
  meeting_summaries: { used: number; limit: number; percentage: number };
  storage: { used: number; limit: number; percentage: number };
}

export default function SubscriptionDashboard() {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptionData();
    fetchUsageStats();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      const response = await fetch('/api/subscription');
      if (!response.ok) {
        throw new Error('Failed to fetch subscription data');
      }
      const data = await response.json();
      setSubscriptionData(data);
    } catch (err) {
      setError('Failed to load subscription data');
      console.error(err);
    }
  };

  const fetchUsageStats = async () => {
    try {
      const response = await fetch('/api/subscription/usage');
      if (!response.ok) {
        throw new Error('Failed to fetch usage stats');
      }
      const data = await response.json();
      setUsageStats(data);
    } catch (err) {
      setError('Failed to load usage statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'free':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pro':
        return <Crown className="w-5 h-5 text-purple-600" />;
      case 'enterprise':
        return <Users className="w-5 h-5 text-blue-600" />;
      default:
        return <CheckCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'free':
        return 'bg-green-100 text-green-800';
      case 'pro':
        return 'bg-purple-100 text-purple-800';
      case 'enterprise':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatUsage = (used: number, limit: number) => {
    if (limit === -1) return `${used} / Unlimited`;
    return `${used} / ${limit}`;
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-orange-600';
    return 'text-green-600';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-orange-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscriptionData || !usageStats) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-gray-600">No subscription data available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Subscription Dashboard</h2>
        <Button 
          onClick={() => window.location.href = '/dashboard/billing'}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Manage Billing
        </Button>
      </div>

      {/* Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {getTierIcon(subscriptionData.subscription.tier)}
            <span>Current Plan</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Badge className={getTierColor(subscriptionData.subscription.tier)}>
                {subscriptionData.subscription.tier.toUpperCase()}
              </Badge>
              <p className="text-sm text-gray-600 mt-2">
                {subscriptionData.isInTrial ? 'Trial' : 'Active'} until {new Date(subscriptionData.subscription.current_period_end).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">
                {subscriptionData.daysRemaining} days remaining
              </p>
            </div>
            {subscriptionData.subscription.tier === 'free' && (
              <Button 
                onClick={() => window.location.href = '/dashboard/upgrade'}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Tasks Usage */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-sm">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <span>Tasks</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">
                  {formatUsage(usageStats.tasks.used, usageStats.tasks.limit)}
                </span>
                <span className={`text-sm font-medium ${getUsageColor(usageStats.tasks.percentage)}`}>
                  {usageStats.tasks.limit === -1 ? 'Unlimited' : `${usageStats.tasks.percentage}%`}
                </span>
              </div>
              {usageStats.tasks.limit !== -1 && (
                <Progress 
                  value={usageStats.tasks.percentage} 
                  className="h-2"
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI Requests Usage */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-sm">
              <Zap className="w-4 h-4 text-purple-600" />
              <span>AI Requests</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">
                  {formatUsage(usageStats.ai_requests.used, usageStats.ai_requests.limit)}
                </span>
                <span className={`text-sm font-medium ${getUsageColor(usageStats.ai_requests.percentage)}`}>
                  {usageStats.ai_requests.limit === -1 ? 'Unlimited' : `${usageStats.ai_requests.percentage}%`}
                </span>
              </div>
              {usageStats.ai_requests.limit !== -1 && (
                <Progress 
                  value={usageStats.ai_requests.percentage} 
                  className="h-2"
                />
              )}
              {usageStats.ai_requests.limit === 0 && (
                <p className="text-xs text-gray-500">
                  Upgrade to Pro for AI features
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notes Usage */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span>Notes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">
                  {formatUsage(usageStats.notes.used, usageStats.notes.limit)}
                </span>
                <span className={`text-sm font-medium ${getUsageColor(usageStats.notes.percentage)}`}>
                  {usageStats.notes.limit === -1 ? 'Unlimited' : `${usageStats.notes.percentage}%`}
                </span>
              </div>
              {usageStats.notes.limit !== -1 && (
                <Progress 
                  value={usageStats.notes.percentage} 
                  className="h-2"
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Meeting Summaries Usage */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-sm">
              <Users className="w-4 h-4 text-orange-600" />
              <span>Meeting Summaries</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">
                  {formatUsage(usageStats.meeting_summaries.used, usageStats.meeting_summaries.limit)}
                </span>
                <span className={`text-sm font-medium ${getUsageColor(usageStats.meeting_summaries.percentage)}`}>
                  {usageStats.meeting_summaries.limit === -1 ? 'Unlimited' : `${usageStats.meeting_summaries.percentage}%`}
                </span>
              </div>
              {usageStats.meeting_summaries.limit !== -1 && (
                <Progress 
                  value={usageStats.meeting_summaries.percentage} 
                  className="h-2"
                />
              )}
              {usageStats.meeting_summaries.limit === 0 && (
                <p className="text-xs text-gray-500">
                  Upgrade to Pro for meeting summaries
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Storage Usage */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-sm">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>Storage</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">
                  {usageStats.storage.used.toFixed(1)} MB
                </span>
                <span className={`text-sm font-medium ${getUsageColor(usageStats.storage.percentage)}`}>
                  {usageStats.storage.limit === -1 ? 'Unlimited' : `${usageStats.storage.percentage}%`}
                </span>
              </div>
              {usageStats.storage.limit !== -1 && (
                <Progress 
                  value={usageStats.storage.percentage} 
                  className="h-2"
                />
              )}
              <p className="text-xs text-gray-500">
                of {usageStats.storage.limit === -1 ? 'unlimited' : `${usageStats.storage.limit} MB`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Feature Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">AI Task Decomposition</span>
                {subscriptionData.subscription.plan_limits.ai_task_decomposition ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-gray-400" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Meeting Summarization</span>
                {subscriptionData.subscription.plan_limits.meeting_summarization ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-gray-400" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Advanced Analytics</span>
                {subscriptionData.subscription.plan_limits.advanced_analytics ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-gray-400" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Priority Support</span>
                {subscriptionData.subscription.plan_limits.priority_support ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upgrade CTA */}
      {subscriptionData.subscription.tier === 'free' && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <Crown className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-purple-900 mb-2">
                Unlock More with Pro
              </h3>
              <p className="text-purple-700 mb-4">
                Get unlimited tasks, AI-powered features, and priority support
              </p>
              <Button 
                onClick={() => window.location.href = '/dashboard/upgrade'}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Upgrade to Pro - $9.99/month
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
