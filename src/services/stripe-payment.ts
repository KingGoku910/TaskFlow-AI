import { createClient } from '@/utils/supabase/server';
import Stripe from 'stripe';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'disputed';

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  client_secret: string;
  metadata?: Record<string, any>;
}

export interface PaymentResult {
  success: boolean;
  payment_intent_id?: string;
  error?: string;
}

export interface PaymentMethodDetails {
  id: string;
  last_four: string;
  brand: string;
  expiry_month: number;
  expiry_year: number;
  is_default: boolean;
}

export class StripePaymentService {
  private supabase;
  private stripe: Stripe;

  constructor() {
    this.supabase = createClient();
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-06-20'
    });
  }

  /**
   * Create a payment intent for subscription
   */
  async createPaymentIntent(
    userId: string,
    amount: number,
    currency: string = 'USD',
    subscriptionId?: string,
    metadata?: Record<string, any>
  ): Promise<PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        metadata: {
          userId,
          subscriptionId: subscriptionId || '',
          ...metadata
        }
      });

      // Save payment transaction to database
      await this.savePaymentTransaction(
        userId,
        amount,
        currency,
        'pending',
        subscriptionId,
        paymentIntent.id
      );

      return {
        id: paymentIntent.id,
        amount,
        currency,
        status: 'pending',
        client_secret: paymentIntent.client_secret!,
        metadata
      };
    } catch (error) {
      console.error('Error creating Stripe payment intent:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  /**
   * Create a Stripe customer
   */
  async createCustomer(userId: string, email: string, name?: string): Promise<string> {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata: {
          userId
        }
      });

      // Save customer ID to user record
      await this.supabase
        .from('users')
        .update({ 
          profile_data: { 
            stripe_customer_id: customer.id 
          } 
        })
        .eq('id', userId);

      return customer.id;
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      throw new Error('Failed to create customer');
    }
  }

  /**
   * Get or create Stripe customer
   */
  async getOrCreateCustomer(userId: string): Promise<string> {
    try {
      // Check if customer already exists
      const { data: user } = await this.supabase
        .from('users')
        .select('email, profile_data')
        .eq('id', userId)
        .single();

      if (user?.profile_data?.stripe_customer_id) {
        return user.profile_data.stripe_customer_id;
      }

      // Create new customer
      return await this.createCustomer(userId, user?.email || '');
    } catch (error) {
      console.error('Error getting or creating customer:', error);
      throw new Error('Failed to get or create customer');
    }
  }

  /**
   * Save payment transaction to database
   */
  private async savePaymentTransaction(
    userId: string,
    amount: number,
    currency: string,
    status: PaymentStatus,
    subscriptionId?: string,
    stripePaymentIntentId?: string
  ): Promise<void> {
    const { error } = await this.supabase
      .from('payment_transactions')
      .insert({
        user_id: userId,
        subscription_id: subscriptionId,
        amount,
        currency,
        payment_method: 'stripe',
        status,
        stripe_payment_intent_id: stripePaymentIntentId,
        description: `Subscription payment - Stripe`,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error saving payment transaction:', error);
      throw new Error('Failed to save payment transaction');
    }
  }

  /**
   * Confirm payment and update subscription
   */
  async confirmPayment(paymentIntentId: string): Promise<PaymentResult> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        // Update payment transaction status
        await this.updatePaymentStatus(paymentIntentId, 'completed');
        
        // Update subscription status if applicable
        await this.activateSubscriptionAfterPayment(paymentIntentId);
        
        return { success: true, payment_intent_id: paymentIntentId };
      } else {
        await this.updatePaymentStatus(paymentIntentId, 'failed');
        return { success: false, error: `Payment failed: ${paymentIntent.status}` };
      }
    } catch (error) {
      console.error('Error confirming Stripe payment:', error);
      await this.updatePaymentStatus(paymentIntentId, 'failed');
      return { success: false, error: 'Failed to confirm payment' };
    }
  }

  /**
   * Update payment status in database
   */
  private async updatePaymentStatus(paymentIntentId: string, status: PaymentStatus): Promise<void> {
    const { error } = await this.supabase
      .from('payment_transactions')
      .update({
        status,
        payment_date: status === 'completed' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_payment_intent_id', paymentIntentId);

    if (error) {
      console.error('Error updating payment status:', error);
    }
  }

  /**
   * Activate subscription after successful payment
   */
  private async activateSubscriptionAfterPayment(paymentIntentId: string): Promise<void> {
    // Get payment transaction details
    const { data: payment } = await this.supabase
      .from('payment_transactions')
      .select('subscription_id, user_id')
      .eq('stripe_payment_intent_id', paymentIntentId)
      .single();

    if (payment?.subscription_id) {
      // Activate subscription
      await this.supabase
        .from('user_subscriptions')
        .update({
          status: 'active',
          last_payment_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.subscription_id);
    }
  }

  /**
   * Create subscription with payment
   */
  async createSubscription(
    userId: string,
    tier: 'pro' | 'enterprise',
    billingCycle: 'monthly' | 'yearly'
  ): Promise<{ subscriptionId: string; paymentIntent: PaymentIntent }> {
    // Get subscription plan
    const { data: plan } = await this.supabase
      .from('subscription_plans')
      .select('*')
      .eq('tier', tier)
      .single();

    if (!plan) {
      throw new Error('Subscription plan not found');
    }

    // Calculate amount based on billing cycle
    const amount = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;

    // Create subscription record
    const { data: subscription, error: subscriptionError } = await this.supabase
      .from('user_subscriptions')
      .insert({
        user_id: userId,
        plan_id: plan.id,
        tier,
        status: 'inactive', // Will be activated after payment
        billing_cycle: billingCycle,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single();

    if (subscriptionError) {
      console.error('Error creating subscription:', subscriptionError);
      throw new Error('Failed to create subscription');
    }

    // Create payment intent
    const paymentIntent = await this.createPaymentIntent(
      userId,
      amount,
      plan.currency,
      subscription.id,
      {
        tier,
        billingCycle,
        planName: plan.name
      }
    );

    return {
      subscriptionId: subscription.id,
      paymentIntent
    };
  }

  /**
   * Get user's payment methods from Stripe
   */
  async getUserPaymentMethods(userId: string): Promise<PaymentMethodDetails[]> {
    try {
      const customerId = await this.getOrCreateCustomer(userId);
      
      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      return paymentMethods.data.map(pm => ({
        id: pm.id,
        last_four: pm.card?.last4 || '',
        brand: pm.card?.brand || '',
        expiry_month: pm.card?.exp_month || 0,
        expiry_year: pm.card?.exp_year || 0,
        is_default: false // You can implement default logic as needed
      }));
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return [];
    }
  }

  /**
   * Create a setup intent for adding payment methods
   */
  async createSetupIntent(userId: string): Promise<{ client_secret: string; customer_id: string }> {
    try {
      const customerId = await this.getOrCreateCustomer(userId);
      
      const setupIntent = await this.stripe.setupIntents.create({
        customer: customerId,
        metadata: {
          userId
        }
      });

      return {
        client_secret: setupIntent.client_secret!,
        customer_id: customerId
      };
    } catch (error) {
      console.error('Error creating setup intent:', error);
      throw new Error('Failed to create setup intent');
    }
  }

  /**
   * Get payment history for user
   */
  async getPaymentHistory(userId: string, limit: number = 10): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('payment_transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('payment_method', 'stripe')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching payment history:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Process Stripe webhook
   */
  async processWebhook(payload: string, signature: string): Promise<void> {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );

      console.log('Processing Stripe webhook:', event.type);

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailure(event.data.object);
          break;
        case 'invoice.payment_succeeded':
          await this.handleSubscriptionPaymentSuccess(event.data.object);
          break;
        case 'invoice.payment_failed':
          await this.handleSubscriptionPaymentFailure(event.data.object);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionCancellation(event.data.object);
          break;
        default:
          console.log('Unhandled Stripe webhook event:', event.type);
      }
    } catch (error) {
      console.error('Error processing Stripe webhook:', error);
      throw new Error('Failed to process webhook');
    }
  }

  /**
   * Handle successful payment
   */
  private async handlePaymentSuccess(paymentIntent: any): Promise<void> {
    console.log('Payment succeeded:', paymentIntent.id);
    await this.updatePaymentStatus(paymentIntent.id, 'completed');
    await this.activateSubscriptionAfterPayment(paymentIntent.id);
  }

  /**
   * Handle failed payment
   */
  private async handlePaymentFailure(paymentIntent: any): Promise<void> {
    console.log('Payment failed:', paymentIntent.id);
    await this.updatePaymentStatus(paymentIntent.id, 'failed');
  }

  /**
   * Handle successful subscription payment
   */
  private async handleSubscriptionPaymentSuccess(invoice: any): Promise<void> {
    console.log('Subscription payment succeeded:', invoice.subscription);
    
    if (invoice.subscription) {
      await this.supabase
        .from('user_subscriptions')
        .update({
          status: 'active',
          last_payment_date: new Date().toISOString(),
          next_billing_date: new Date(invoice.period_end * 1000).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', invoice.subscription);
    }
  }

  /**
   * Handle failed subscription payment
   */
  private async handleSubscriptionPaymentFailure(invoice: any): Promise<void> {
    console.log('Subscription payment failed:', invoice.subscription);
    
    if (invoice.subscription) {
      await this.supabase
        .from('user_subscriptions')
        .update({
          status: 'past_due',
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', invoice.subscription);
    }
  }

  /**
   * Handle subscription cancellation
   */
  private async handleSubscriptionCancellation(subscription: any): Promise<void> {
    console.log('Subscription cancelled:', subscription.id);
    
    await this.supabase
      .from('user_subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription.id);
  }
}

export function createStripePaymentService() {
  return new StripePaymentService();
}
