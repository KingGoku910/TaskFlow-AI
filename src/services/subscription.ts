import { createClient } from '@/utils/supabase/server';

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'inactive' | 'canceled' | 'past_due' | 'trialing';

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: SubscriptionTier;
  price: number;
  billing_cycle: 'monthly' | 'yearly';
  api_calls_limit: number;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  current_period_start: string;
  current_period_end: string;
  canceled_at?: string;
  trial_end?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface UsageRecord {
  id: string;
  user_id: string;
  subscription_id: string;
  api_endpoint: string;
  usage_count: number;
  date: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface RateLimit {
  id: string;
  user_id: string;
  endpoint: string;
  requests_count: number;
  window_start: string;
  window_duration: number;
  created_at: string;
  updated_at: string;
}

export interface PaymentTransaction {
  id: string;
  user_id: string;
  subscription_id: string;
  stripe_payment_intent_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'canceled';
  payment_method: string;
  description?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export class SubscriptionService {
  private supabase: any;

  constructor(supabaseClient?: any) {
    this.supabase = supabaseClient;
  }

  /**
   * Get all available subscription plans
   */
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized');
    }
    const { data, error } = await this.supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('tier');

    if (error) {
      throw new Error(`Error fetching subscription plans: ${error.message}`);
    }

    return data as SubscriptionPlan[];
  }

  /**
   * Get user's current subscription
   */
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized');
    }
    const { data, error } = await this.supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No subscription found
      }
      throw new Error(`Error fetching user subscription: ${error.message}`);
    }

    return data as UserSubscription;
  }

  /**
   * Create a new subscription
   */
  async createSubscription(subscriptionData: Partial<UserSubscription>): Promise<UserSubscription> {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized');
    }
    const { data, error } = await this.supabase
      .from('user_subscriptions')
      .insert([subscriptionData])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating subscription: ${error.message}`);
    }

    return data as UserSubscription;
  }

  /**
   * Update subscription
   */
  async updateSubscription(subscriptionId: string, updates: Partial<UserSubscription>): Promise<UserSubscription> {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized');
    }
    const { data, error } = await this.supabase
      .from('user_subscriptions')
      .update(updates)
      .eq('id', subscriptionId)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating subscription: ${error.message}`);
    }

    return data as UserSubscription;
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(userId: string): Promise<void> {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized');
    }
    const { error } = await this.supabase
      .from('user_subscriptions')
      .update({ 
        status: 'canceled', 
        canceled_at: new Date().toISOString() 
      })
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Error canceling subscription: ${error.message}`);
    }
  }

  /**
   * Upgrade subscription
   */
  async upgradeSubscription(userId: string, newTier: SubscriptionTier, billingCycle: 'monthly' | 'yearly'): Promise<void> {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized');
    }
    // Get the new plan
    const { data: plan, error: planError } = await this.supabase
      .from('subscription_plans')
      .select('*')
      .eq('tier', newTier)
      .eq('billing_cycle', billingCycle)
      .single();

    if (planError) {
      throw new Error(`Error fetching plan: ${planError.message}`);
    }

    // Update user subscription
    const { error } = await this.supabase
      .from('user_subscriptions')
      .update({ 
        plan_id: plan.id,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Error upgrading subscription: ${error.message}`);
    }
  }

  /**
   * Track API usage
   */
  async trackUsage(userId: string, endpoint: string, count: number = 1): Promise<void> {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized');
    }
    const today = new Date().toISOString().split('T')[0];
    
    const { error } = await this.supabase
      .from('usage_tracking')
      .upsert({
        user_id: userId,
        api_endpoint: endpoint,
        usage_count: count,
        date: today
      }, {
        onConflict: 'user_id,api_endpoint,date'
      });

    if (error) {
      throw new Error(`Error tracking usage: ${error.message}`);
    }
  }

  /**
   * Get user's current usage
   */
  async getUserUsage(userId: string): Promise<number> {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized');
    }
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data, error } = await this.supabase
      .from('usage_tracking')
      .select('usage_count')
      .eq('user_id', userId)
      .gte('date', startOfMonth.toISOString().split('T')[0]);

    if (error) {
      throw new Error(`Error fetching usage: ${error.message}`);
    }

    return data.reduce((total: number, record: any) => total + record.usage_count, 0);
  }

  /**
   * Check if user has reached their API limit
   */
  async hasReachedLimit(userId: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription) return true; // No subscription = free tier limit

    const plan = await this.getSubscriptionPlan(subscription.plan_id);
    if (!plan) return true;

    const currentUsage = await this.getUserUsage(userId);
    return currentUsage >= plan.api_calls_limit;
  }

  /**
   * Get subscription plan by ID
   */
  async getSubscriptionPlan(planId: string): Promise<SubscriptionPlan | null> {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized');
    }
    const { data, error } = await this.supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Error fetching plan: ${error.message}`);
    }

    return data as SubscriptionPlan;
  }

  /**
   * Get remaining days in current billing cycle
   */
  async getDaysRemaining(userId: string): Promise<number> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription) return 0;

    const endDate = new Date(subscription.current_period_end);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  }

  /**
   * Check if user is in trial period
   */
  async isInTrial(userId: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription || !subscription.trial_end) return false;

    const trialEnd = new Date(subscription.trial_end);
    const today = new Date();
    
    return today < trialEnd;
  }

  /**
   * Get usage percentage for the current period
   */
  async getUsagePercentage(userId: string): Promise<number> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription) return 100; // No subscription = at limit

    const plan = await this.getSubscriptionPlan(subscription.plan_id);
    if (!plan) return 100;

    const currentUsage = await this.getUserUsage(userId);
    const limit = plan.api_calls_limit;

    if (limit === 0) return 0; // Unlimited plan

    return Math.min(100, Math.round((currentUsage / limit) * 100));
  }
}

// Helper function to create service instance
export function createSubscriptionService(supabaseClient: any) {
  return new SubscriptionService(supabaseClient);
}
