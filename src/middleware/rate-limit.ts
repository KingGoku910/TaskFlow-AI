import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createSubscriptionService } from '@/services/subscription';

export interface RateLimitConfig {
  resourceType: string;
  action: string;
  feature?: string;
}

export class RateLimitMiddleware {
  // No constructor needed - we'll create supabase client per request

  /**
   * Middleware to check rate limits before allowing actions
   */
  async checkRateLimit(
    request: NextRequest,
    config: RateLimitConfig
  ): Promise<NextResponse | null> {
    try {
      // Get user ID from request (assuming auth middleware has run)
      const userId = request.headers.get('x-user-id');
      
      if (!userId) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      // Create supabase client and subscription service per request
      const supabase = await createClient();
      const subscriptionService = createSubscriptionService(supabase);

      // Check if user has access to the feature
      if (config.feature) {
        const canUseFeature = await subscriptionService.canUseFeature(userId, config.feature);
        if (!canUseFeature) {
          return NextResponse.json(
            {
              error: 'Feature not available in your plan',
              code: 'FEATURE_NOT_AVAILABLE',
              upgrade_required: true
            },
            { status: 403 }
          );
        }
      }

      // Check resource limits
      const canUseResource = await subscriptionService.checkResourceLimit(userId, config.resourceType);
      if (!canUseResource) {
        const usage = await subscriptionService.getUserUsage(userId);
        const subscription = await subscriptionService.getUserSubscription(userId);
        
        return NextResponse.json(
          {
            error: 'Resource limit exceeded',
            code: 'RATE_LIMIT_EXCEEDED',
            usage: usage,
            limits: subscription?.plan_limits,
            upgrade_required: true
          },
          { status: 429 }
        );
      }

      return null; // Continue with request
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return NextResponse.json(
        { error: 'Rate limit check failed' },
        { status: 500 }
      );
    }
  }

  /**
   * Track usage after successful action
   */
  async trackUsage(
    userId: string,
    resourceType: string,
    resourceId?: string,
    quantity: number = 1
  ): Promise<void> {
    try {
      const supabase = await createClient();
      const subscriptionService = createSubscriptionService(supabase);
      await subscriptionService.trackUsage(userId, resourceType, resourceId, quantity);
    } catch (error) {
      console.error('Failed to track usage:', error);
      // Don't throw error to avoid breaking the main flow
    }
  }

  /**
   * Check if user can upload files (storage limit)
   */
  async checkStorageLimit(userId: string, fileSizeBytes: number): Promise<boolean> {
    try {
      const supabase = await createClient();
      const subscriptionService = createSubscriptionService(supabase);
      
      const usage = await subscriptionService.getUserUsage(userId);
      const subscription = await subscriptionService.getUserSubscription(userId);
      
      if (!subscription) {
        return false;
      }

      const limits = subscription.plan_limits;
      const maxStorageMB = limits.max_storage_mb;
      
      // -1 means unlimited
      if (maxStorageMB === -1) {
        return true;
      }

      const fileSizeMB = fileSizeBytes / (1024 * 1024);
      const totalUsedMB = usage.storage_used_mb + fileSizeMB;
      
      return totalUsedMB <= maxStorageMB;
    } catch (error) {
      console.error('Storage limit check failed:', error);
      return false;
    }
  }

  /**
   * Get rate limit status for user
   */
  async getRateLimitStatus(userId: string): Promise<{
    tasks: { used: number; limit: number; percentage: number };
    ai_requests: { used: number; limit: number; percentage: number };
    notes: { used: number; limit: number; percentage: number };
    meeting_summaries: { used: number; limit: number; percentage: number };
    storage: { used: number; limit: number; percentage: number };
  }> {
    try {
      const supabase = await createClient();
      const subscriptionService = createSubscriptionService(supabase);
      
      const [usage, subscription] = await Promise.all([
        subscriptionService.getUserUsage(userId),
        subscriptionService.getUserSubscription(userId)
      ]);

      if (!subscription) {
        return {
          tasks: { used: 0, limit: 0, percentage: 0 },
          ai_requests: { used: 0, limit: 0, percentage: 0 },
          notes: { used: 0, limit: 0, percentage: 0 },
          meeting_summaries: { used: 0, limit: 0, percentage: 0 },
          storage: { used: 0, limit: 0, percentage: 0 }
        };
      }

      const limits = subscription.plan_limits;

      return {
        tasks: {
          used: usage.tasks_used,
          limit: limits.max_tasks_per_month,
          percentage: await subscriptionService.getUsagePercentage(userId, 'task')
        },
        ai_requests: {
          used: usage.ai_requests_used,
          limit: limits.max_ai_requests_per_month,
          percentage: await subscriptionService.getUsagePercentage(userId, 'ai_request')
        },
        notes: {
          used: usage.notes_used,
          limit: limits.max_notes_per_month,
          percentage: await subscriptionService.getUsagePercentage(userId, 'note')
        },
        meeting_summaries: {
          used: usage.meeting_summaries_used,
          limit: limits.max_meeting_summaries_per_month,
          percentage: await subscriptionService.getUsagePercentage(userId, 'meeting_summary')
        },
        storage: {
          used: usage.storage_used_mb,
          limit: limits.max_storage_mb,
          percentage: await subscriptionService.getUsagePercentage(userId, 'storage')
        }
      };
    } catch (error) {
      console.error('Failed to get rate limit status:', error);
      throw error;
    }
  }
}

/**
 * Higher-order function to create rate limit middleware
 */
export function withRateLimit(config: RateLimitConfig) {
  return async (request: NextRequest) => {
    const rateLimitMiddleware = new RateLimitMiddleware();
    return await rateLimitMiddleware.checkRateLimit(request, config);
  };
}

/**
 * Rate limit configurations for different resources
 */
export const RateLimitConfigs = {
  CREATE_TASK: {
    resourceType: 'task',
    action: 'create'
  },
  AI_TASK_DECOMPOSITION: {
    resourceType: 'ai_request',
    action: 'decompose',
    feature: 'ai_task_decomposition'
  },
  CREATE_NOTE: {
    resourceType: 'note',
    action: 'create'
  },
  AI_NOTE_GENERATION: {
    resourceType: 'ai_request',
    action: 'generate_note',
    feature: 'ai_task_decomposition'
  },
  MEETING_SUMMARY: {
    resourceType: 'meeting_summary',
    action: 'create',
    feature: 'meeting_summarization'
  },
  UPLOAD_FILE: {
    resourceType: 'storage',
    action: 'upload'
  },
  ADVANCED_ANALYTICS: {
    resourceType: 'analytics',
    action: 'view',
    feature: 'advanced_analytics'
  }
};

export const rateLimitMiddleware = new RateLimitMiddleware();
