export interface AnalyticsEntry {
  id: string;
  user_id: string;
  data: {
    type: string;
    value: number;
    metadata?: Record<string, any>;
  };
  created_at: string;
  updated_at?: string;
}

export interface AnalyticsApiResponse {
  data: AnalyticsEntry | AnalyticsEntry[];
  error?: string;
}

export interface AnalyticsSummary {
  totalEntries: number;
  types: string[];
  dateRange: {
    start: string;
    end: string;
  } | null;
}

export interface CreateAnalyticsRequest {
  data: {
    type: string;
    value: number;
    metadata?: Record<string, any>;
  };
}

export interface UpdateAnalyticsRequest {
  data: {
    type: string;
    value: number;
    metadata?: Record<string, any>;
  };
}

// Enhanced Analytics Types
export interface TaskAnalytics {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completionRate: number;
  averageCompletionTime: number; // in hours
  tasksByPriority: {
    high: number;
    medium: number;
    low: number;
  };
  tasksByDate: Array<{
    date: string;
    created: number;
    completed: number;
  }>;
}

export interface ProductivityMetrics {
  dailyProductivity: Array<{
    date: string;
    score: number;
    tasksCompleted: number;
    focusTime: number; // in minutes
  }>;
  weeklyTrends: {
    thisWeek: number;
    lastWeek: number;
    change: number;
  };
  monthlyGoals: {
    target: number;
    achieved: number;
    percentage: number;
  };
}

export interface AnalyticsData {
  taskAnalytics: TaskAnalytics;
  productivityMetrics: ProductivityMetrics;
  summary: AnalyticsSummary;
}