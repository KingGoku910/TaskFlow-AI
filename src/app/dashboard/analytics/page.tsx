'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown,
  Target,
  Clock,
  CheckCircle2,
  AlertCircle,
  Activity,
  Calendar,
  Award,
  Zap
} from 'lucide-react';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { WelcomeScreen } from '@/components/dashboard/welcome-screen';
import { useToast } from '@/hooks/use-toast';
import type { TaskAnalytics, ProductivityMetrics } from '@/types/analytics';
import { getTaskAnalytics, getProductivityMetrics, trackAnalyticsEvent } from './actions';

type ExtendedTaskAnalytics = TaskAnalytics & { isFirstTime: boolean };
type ExtendedProductivityMetrics = ProductivityMetrics & { isFirstTime: boolean };

export default function AnalyticsPage() {
  const [taskAnalytics, setTaskAnalytics] = useState<ExtendedTaskAnalytics | null>(null);
  const [productivityMetrics, setProductivityMetrics] = useState<ExtendedProductivityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const { toast } = useToast();

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const [taskData, productivityData] = await Promise.all([
        getTaskAnalytics(),
        getProductivityMetrics()
      ]);

      setTaskAnalytics(taskData);
      setProductivityMetrics(productivityData);

      // Show welcome screen for first-time users
      if (taskData.isFirstTime && productivityData.isFirstTime) {
        setShowWelcome(true);
      }

      // Track analytics view event
      await trackAnalyticsEvent('analytics_viewed', 1, {
        timestamp: new Date().toISOString(),
        isFirstTime: taskData.isFirstTime
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = () => {
    setShowWelcome(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getProductivityTrend = () => {
    if (!productivityMetrics) return null;
    const { change } = productivityMetrics.weeklyTrends;
    return {
      isPositive: change > 0,
      value: Math.abs(change),
      icon: change > 0 ? TrendingUp : TrendingDown,
      color: change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-muted-foreground'
    };
  };

  const getCompletionRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    if (rate > 0) return 'text-blue-600';
    return 'text-muted-foreground';
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 h-full overflow-y-auto w-full">
        <Card className="shadow-lg w-full">
          <CardHeader>
            <DashboardPageHeader
              title="Productivity Analytics"
              description="Loading analytics data..."
              icon={<BarChart3 />}
            />
          </CardHeader>
          <CardContent className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show welcome screen for first-time users
  if (showWelcome && taskAnalytics?.isFirstTime && productivityMetrics?.isFirstTime) {
    return (
      <div className="space-y-8 h-full overflow-y-auto w-full">
        <Card className="shadow-lg w-full">
          <CardHeader>
            <DashboardPageHeader
              title="Productivity Analytics"
              description="Welcome to your analytics dashboard! Complete the tutorial to start seeing your productivity insights."
              icon={<BarChart3 />}
            />
          </CardHeader>
          <CardContent>
            <WelcomeScreen onGetStarted={handleGetStarted} />
          </CardContent>
        </Card>
      </div>
    );
  }

  const trend = getProductivityTrend();

  return (
    <div className="space-y-8 h-full overflow-y-auto w-full">
      <Card className="shadow-lg w-full">
        <CardHeader>
          <DashboardPageHeader
            title="Productivity Analytics"
            description={
              taskAnalytics?.isFirstTime 
                ? "Start completing tasks to see your productivity insights grow!"
                : "Gain insights into your task completion, project progress, and work patterns."
            }
            icon={<BarChart3 />}
          />
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="flex items-center text-lg font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-4 rounded-md border border-red-300 dark:border-red-700">
              <AlertCircle className="mr-3 h-8 w-8" />
              <p>Error: {error}</p>
            </div>
          )}

          <div className="flex gap-4">
            <Button onClick={fetchAnalytics} disabled={loading}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            {taskAnalytics?.isFirstTime && (
              <Button onClick={() => setShowWelcome(true)} variant="outline">
                View Welcome Guide
              </Button>
            )}
          </div>

          {/* First-time user encouragement banner */}
          {taskAnalytics?.isFirstTime && (
            <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-blue-800 dark:text-blue-200">
                      Ready to start your productivity journey?
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-300">
                      Complete tasks to see your analytics come to life. Your tutorial is waiting in the Tasks section!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Overview Cards */}
          {taskAnalytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                      <p className="text-2xl font-bold">{taskAnalytics.totalTasks}</p>
                      {taskAnalytics.totalTasks === 0 && (
                        <p className="text-xs text-muted-foreground">Create your first task!</p>
                      )}
                    </div>
                    <Activity className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Completed</p>
                      <p className="text-2xl font-bold text-green-600">{taskAnalytics.completedTasks}</p>
                      {taskAnalytics.completedTasks === 0 && (
                        <p className="text-xs text-muted-foreground">Complete tasks to see progress</p>
                      )}
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                      <p className={`text-2xl font-bold ${getCompletionRateColor(taskAnalytics.completionRate)}`}>
                        {taskAnalytics.completionRate.toFixed(1)}%
                      </p>
                      {taskAnalytics.completionRate === 0 && (
                        <p className="text-xs text-muted-foreground">Rate will show after completions</p>
                      )}
                    </div>
                    <Target className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Avg. Completion</p>
                      <p className="text-2xl font-bold">
                        {taskAnalytics.averageCompletionTime === 0 ? '—' : `${taskAnalytics.averageCompletionTime}h`}
                      </p>
                      {taskAnalytics.averageCompletionTime === 0 && (
                        <p className="text-xs text-muted-foreground">Time tracking starts soon</p>
                      )}
                    </div>
                    <Clock className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Productivity Trends */}
          {productivityMetrics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Weekly Productivity Trend
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">This Week</p>
                      <p className="text-2xl font-bold">
                        {productivityMetrics.weeklyTrends.thisWeek === 0 ? '—' : `${productivityMetrics.weeklyTrends.thisWeek}%`}
                      </p>
                      {productivityMetrics.weeklyTrends.thisWeek === 0 && (
                        <p className="text-xs text-muted-foreground">Complete tasks to see trends</p>
                      )}
                    </div>
                    {trend && productivityMetrics.weeklyTrends.change !== 0 && (
                      <div className={`flex items-center gap-1 ${trend.color}`}>
                        <trend.icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{trend.value.toFixed(1)}%</span>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Last Week</p>
                      <p className="font-medium">
                        {productivityMetrics.weeklyTrends.lastWeek === 0 ? '—' : `${productivityMetrics.weeklyTrends.lastWeek}%`}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Change</p>
                      <p className={`font-medium ${trend?.color || 'text-muted-foreground'}`}>
                        {productivityMetrics.weeklyTrends.change === 0 ? '—' : (
                          <>
                            {productivityMetrics.weeklyTrends.change > 0 ? '+' : ''}
                            {productivityMetrics.weeklyTrends.change.toFixed(1)}%
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Monthly Goals
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{productivityMetrics.monthlyGoals.achieved}/{productivityMetrics.monthlyGoals.target}</span>
                    </div>
                    <Progress value={productivityMetrics.monthlyGoals.percentage} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {productivityMetrics.monthlyGoals.percentage === 0 
                        ? "Start completing tasks to track monthly progress"
                        : `${productivityMetrics.monthlyGoals.percentage}% of monthly goal completed`
                      }
                    </p>
                  </div>
                  <div className="pt-2">
                    <Badge variant={
                      productivityMetrics.monthlyGoals.percentage >= 50 
                        ? "default" 
                        : productivityMetrics.monthlyGoals.percentage > 0 
                        ? "secondary" 
                        : "outline"
                    }>
                      {productivityMetrics.monthlyGoals.percentage >= 50 
                        ? "On Track" 
                        : productivityMetrics.monthlyGoals.percentage > 0 
                        ? "Getting Started" 
                        : "Ready to Begin"
                      }
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Task Breakdown */}
          {taskAnalytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Task Status Distribution</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  {taskAnalytics.totalTasks === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No tasks yet</p>
                      <p className="text-sm text-muted-foreground">Create your first task to see the distribution</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="text-sm">Completed</span>
                        </div>
                        <span className="font-medium">{taskAnalytics.completedTasks}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <span className="text-sm">In Progress</span>
                        </div>
                        <span className="font-medium">{taskAnalytics.inProgressTasks}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                          <span className="text-sm">Pending</span>
                        </div>
                        <span className="font-medium">{taskAnalytics.pendingTasks}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Priority Distribution</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  {taskAnalytics.totalTasks === 0 ? (
                    <div className="text-center py-8">
                      <Target className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No priority data</p>
                      <p className="text-sm text-muted-foreground">Set task priorities to see the breakdown</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <span className="text-sm">High Priority</span>
                        </div>
                        <span className="font-medium">{taskAnalytics.tasksByPriority.high}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <span className="text-sm">Medium Priority</span>
                        </div>
                        <span className="font-medium">{taskAnalytics.tasksByPriority.medium}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="text-sm">Low Priority</span>
                        </div>
                        <span className="font-medium">{taskAnalytics.tasksByPriority.low}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Daily Activity Chart */}
          {taskAnalytics && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Daily Activity (Last 7 Days)
                </h3>
              </CardHeader>
              <CardContent>
                {taskAnalytics.totalTasks === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No activity data yet</p>
                    <p className="text-sm text-muted-foreground">Create and complete tasks to see daily activity</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-7 gap-2 text-xs text-center text-muted-foreground">
                      {taskAnalytics.tasksByDate.map((day) => (
                        <div key={day.date}>
                          {formatDate(day.date)}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {taskAnalytics.tasksByDate.map((day) => (
                        <div key={day.date} className="space-y-1">
                          <div className="bg-blue-100 dark:bg-blue-900 rounded p-2 text-center">
                            <div className="text-xs text-muted-foreground">Created</div>
                            <div className="font-medium">{day.created}</div>
                          </div>
                          <div className="bg-green-100 dark:bg-green-900 rounded p-2 text-center">
                            <div className="text-xs text-muted-foreground">Done</div>
                            <div className="font-medium">{day.completed}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Productivity Score Timeline */}
          {productivityMetrics && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Productivity Score Timeline
                </h3>
              </CardHeader>
              <CardContent>
                {productivityMetrics.isFirstTime ? (
                  <div className="text-center py-8">
                    <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No productivity data yet</p>
                    <p className="text-sm text-muted-foreground">Complete tasks and focus sessions to see your productivity score</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-7 gap-2 text-xs text-center text-muted-foreground">
                      {productivityMetrics.dailyProductivity.map((day) => (
                        <div key={day.date}>
                          {formatDate(day.date)}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {productivityMetrics.dailyProductivity.map((day) => (
                        <div key={day.date} className="text-center">
                          <div className="bg-primary/10 rounded-lg p-3 space-y-2">
                            <div className="text-lg font-bold">{day.score || '—'}</div>
                            <div className="text-xs text-muted-foreground space-y-1">
                              <div>{day.tasksCompleted} tasks</div>
                              <div>{day.focusTime}m focus</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
