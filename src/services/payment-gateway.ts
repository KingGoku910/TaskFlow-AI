import { createClient } from '@/utils/supabase/server';
import Stripe from 'stripe';

export type PaymentMethod = 'stripe' | 'paypal' | 'payfast' | 'google_pay' | 'direct_eft';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'disputed';

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  client_secret?: string;
  payment_method: PaymentMethod;
  metadata?: Record<string, any>;
}

export interface PaymentResult {
  success: boolean;
  payment_intent_id?: string;
  error?: string;
  redirect_url?: string;
}

export interface PaymentMethodDetails {
  id: string;
  payment_method: PaymentMethod;
  last_four?: string;
  brand?: string;
  expiry_month?: number;
  expiry_year?: number;
  is_default: boolean;
}

export class PaymentGatewayService {
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
    paymentMethod: PaymentMethod,
    subscriptionId?: string,
    metadata?: Record<string, any>
  ): Promise<PaymentIntent> {
    try {
      switch (paymentMethod) {
        case 'stripe':
          return await this.createStripePaymentIntent(userId, amount, currency, subscriptionId, metadata);
        case 'paypal':
          return await this.createPayPalPaymentIntent(userId, amount, currency, subscriptionId, metadata);
        case 'payfast':
          return await this.createPayFastPaymentIntent(userId, amount, currency, subscriptionId, metadata);
        case 'google_pay':
          return await this.createGooglePayPaymentIntent(userId, amount, currency, subscriptionId, metadata);
        case 'direct_eft':
          return await this.createDirectEFTPaymentIntent(userId, amount, currency, subscriptionId, metadata);
        default:
          throw new Error(`Unsupported payment method: ${paymentMethod}`);
      }
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  /**
   * Create Stripe payment intent
   */
  private async createStripePaymentIntent(
    userId: string,
    amount: number,
    currency: string,
    subscriptionId?: string,
    metadata?: Record<string, any>
  ): Promise<PaymentIntent> {
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
      'stripe',
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
      payment_method: 'stripe',
      metadata
    };
  }

  /**
   * Create PayPal payment intent
   */
  private async createPayPalPaymentIntent(
    userId: string,
    amount: number,
    currency: string,
    subscriptionId?: string,
    metadata?: Record<string, any>
  ): Promise<PaymentIntent> {
    // PayPal SDK integration would go here
    const paypalOrderId = `paypal_${Date.now()}`;
    
    // Save payment transaction to database
    await this.savePaymentTransaction(
      userId,
      amount,
      currency,
      'paypal',
      'pending',
      subscriptionId,
      undefined,
      paypalOrderId
    );

    return {
      id: paypalOrderId,
      amount,
      currency,
      status: 'pending',
      payment_method: 'paypal',
      metadata
    };
  }

  /**
   * Create PayFast payment intent
   */
  private async createPayFastPaymentIntent(
    userId: string,
    amount: number,
    currency: string,
    subscriptionId?: string,
    metadata?: Record<string, any>
  ): Promise<PaymentIntent> {
    // PayFast integration would go here
    const payfastPaymentId = `payfast_${Date.now()}`;
    
    // Save payment transaction to database
    await this.savePaymentTransaction(
      userId,
      amount,
      currency,
      'payfast',
      'pending',
      subscriptionId,
      undefined,
      undefined,
      payfastPaymentId
    );

    return {
      id: payfastPaymentId,
      amount,
      currency,
      status: 'pending',
      payment_method: 'payfast',
      metadata
    };
  }

  /**
   * Create Google Pay payment intent
   */
  private async createGooglePayPaymentIntent(
    userId: string,
    amount: number,
    currency: string,
    subscriptionId?: string,
    metadata?: Record<string, any>
  ): Promise<PaymentIntent> {
    // Google Pay integration would go here
    const googlePayTransactionId = `googlepay_${Date.now()}`;
    
    // Save payment transaction to database
    await this.savePaymentTransaction(
      userId,
      amount,
      currency,
      'google_pay',
      'pending',
      subscriptionId,
      undefined,
      undefined,
      undefined,
      googlePayTransactionId
    );

    return {
      id: googlePayTransactionId,
      amount,
      currency,
      status: 'pending',
      payment_method: 'google_pay',
      metadata
    };
  }

  /**
   * Create Direct EFT payment intent
   */
  private async createDirectEFTPaymentIntent(
    userId: string,
    amount: number,
    currency: string,
    subscriptionId?: string,
    metadata?: Record<string, any>
  ): Promise<PaymentIntent> {
    // Direct EFT integration would go here
    const eftReference = `eft_${Date.now()}`;
    
    // Save payment transaction to database
    await this.savePaymentTransaction(
      userId,
      amount,
      currency,
      'direct_eft',
      'pending',
      subscriptionId,
      undefined,
      undefined,
      undefined,
      undefined,
      eftReference
    );

    return {
      id: eftReference,
      amount,
      currency,
      status: 'pending',
      payment_method: 'direct_eft',
      metadata
    };
  }

  /**
   * Save payment transaction to database
   */
  private async savePaymentTransaction(
    userId: string,
    amount: number,
    currency: string,
    paymentMethod: PaymentMethod,
    status: PaymentStatus,
    subscriptionId?: string,
    stripePaymentIntentId?: string,
    paypalPaymentId?: string,
    payfastPaymentId?: string,
    googlePayTransactionId?: string,
    directEftReference?: string
  ): Promise<void> {
    const { error } = await this.supabase
      .from('payment_transactions')
      .insert({
        user_id: userId,
        subscription_id: subscriptionId,
        amount,
        currency,
        payment_method: paymentMethod,
        status,
        stripe_payment_intent_id: stripePaymentIntentId,
        paypal_payment_id: paypalPaymentId,
        payfast_payment_id: payfastPaymentId,
        google_pay_transaction_id: googlePayTransactionId,
        direct_eft_reference: directEftReference,
        description: `Subscription payment - ${paymentMethod}`,
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
  async confirmPayment(
    paymentIntentId: string,
    paymentMethod: PaymentMethod
  ): Promise<PaymentResult> {
    try {
      let success = false;
      let error: string | undefined;

      switch (paymentMethod) {
        case 'stripe':
          const result = await this.confirmStripePayment(paymentIntentId);
          success = result.success;
          error = result.error;
          break;
        case 'paypal':
          success = await this.confirmPayPalPayment(paymentIntentId);
          break;
        case 'payfast':
          success = await this.confirmPayFastPayment(paymentIntentId);
          break;
        case 'google_pay':
          success = await this.confirmGooglePayPayment(paymentIntentId);
          break;
        case 'direct_eft':
          success = await this.confirmDirectEFTPayment(paymentIntentId);
          break;
      }

      if (success) {
        // Update payment transaction status
        await this.updatePaymentStatus(paymentIntentId, 'completed');
        
        // Update subscription status if applicable
        await this.activateSubscriptionAfterPayment(paymentIntentId);
      } else {
        await this.updatePaymentStatus(paymentIntentId, 'failed');
      }

      return {
        success,
        payment_intent_id: paymentIntentId,
        error
      };
    } catch (error) {
      console.error('Error confirming payment:', error);
      return {
        success: false,
        error: 'Failed to confirm payment'
      };
    }
  }

  /**
   * Confirm Stripe payment
   */
  private async confirmStripePayment(paymentIntentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        return { success: true };
      } else {
        return { success: false, error: `Payment failed: ${paymentIntent.status}` };
      }
    } catch (error) {
      return { success: false, error: 'Failed to confirm Stripe payment' };
    }
  }

  /**
   * Confirm PayPal payment
   */
  private async confirmPayPalPayment(paymentId: string): Promise<boolean> {
    // PayPal payment confirmation logic would go here
    return true;
  }

  /**
   * Confirm PayFast payment
   */
  private async confirmPayFastPayment(paymentId: string): Promise<boolean> {
    // PayFast payment confirmation logic would go here
    return true;
  }

  /**
   * Confirm Google Pay payment
   */
  private async confirmGooglePayPayment(transactionId: string): Promise<boolean> {
    // Google Pay payment confirmation logic would go here
    return true;
  }

  /**
   * Confirm Direct EFT payment
   */
  private async confirmDirectEFTPayment(reference: string): Promise<boolean> {
    // Direct EFT payment confirmation logic would go here
    return true;
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
      .or(`stripe_payment_intent_id.eq.${paymentIntentId},paypal_payment_id.eq.${paymentIntentId},payfast_payment_id.eq.${paymentIntentId},google_pay_transaction_id.eq.${paymentIntentId},direct_eft_reference.eq.${paymentIntentId}`);

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
      .or(`stripe_payment_intent_id.eq.${paymentIntentId},paypal_payment_id.eq.${paymentIntentId},payfast_payment_id.eq.${paymentIntentId},google_pay_transaction_id.eq.${paymentIntentId},direct_eft_reference.eq.${paymentIntentId}`)
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
   * Get user's payment methods
   */
  async getUserPaymentMethods(userId: string): Promise<PaymentMethodDetails[]> {
    const { data, error } = await this.supabase
      .from('user_payment_methods')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payment methods:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Add payment method for user
   */
  async addPaymentMethod(
    userId: string,
    paymentMethod: PaymentMethod,
    providerCustomerId: string,
    lastFour?: string,
    brand?: string,
    expiryMonth?: number,
    expiryYear?: number,
    isDefault: boolean = false
  ): Promise<void> {
    // If this is set as default, unset other default methods
    if (isDefault) {
      await this.supabase
        .from('user_payment_methods')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    const { error } = await this.supabase
      .from('user_payment_methods')
      .insert({
        user_id: userId,
        payment_method: paymentMethod,
        provider_customer_id: providerCustomerId,
        last_four: lastFour,
        brand,
        expiry_month: expiryMonth,
        expiry_year: expiryYear,
        is_default: isDefault,
        is_active: true
      });

    if (error) {
      console.error('Error adding payment method:', error);
      throw new Error('Failed to add payment method');
    }
  }

  /**
   * Remove payment method
   */
  async removePaymentMethod(userId: string, paymentMethodId: string): Promise<void> {
    const { error } = await this.supabase
      .from('user_payment_methods')
      .update({ is_active: false })
      .eq('id', paymentMethodId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error removing payment method:', error);
      throw new Error('Failed to remove payment method');
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
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching payment history:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Create subscription with payment
   */
  async createSubscription(
    userId: string,
    tier: 'pro' | 'enterprise',
    billingCycle: 'monthly' | 'yearly',
    paymentMethod: PaymentMethod
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
      paymentMethod,
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
   * Process webhook from payment provider
   */
  async processWebhook(
    provider: PaymentMethod,
    payload: any,
    signature?: string
  ): Promise<void> {
    try {
      switch (provider) {
        case 'stripe':
          await this.processStripeWebhook(payload, signature);
          break;
        case 'paypal':
          await this.processPayPalWebhook(payload);
          break;
        case 'payfast':
          await this.processPayFastWebhook(payload);
          break;
        // Add other providers as needed
      }
    } catch (error) {
      console.error('Error processing webhook:', error);
      throw new Error('Failed to process webhook');
    }
  }

  /**
   * Process Stripe webhook
   */
  private async processStripeWebhook(payload: any, signature?: string): Promise<void> {
    if (!signature) {
      throw new Error('Stripe webhook signature required');
    }

    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handleStripePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await this.handleStripePaymentFailure(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await this.handleStripeSubscriptionPaymentSuccess(event.data.object);
        break;
      case 'invoice.payment_failed':
        await this.handleStripeSubscriptionPaymentFailure(event.data.object);
        break;
    }
  }

  /**
   * Process PayPal webhook
   */
  private async processPayPalWebhook(payload: any): Promise<void> {
    // PayPal webhook processing logic would go here
  }

  /**
   * Process PayFast webhook
   */
  private async processPayFastWebhook(payload: any): Promise<void> {
    // PayFast webhook processing logic would go here
  }

  /**
   * Handle Stripe payment success
   */
  private async handleStripePaymentSuccess(paymentIntent: any): Promise<void> {
    await this.updatePaymentStatus(paymentIntent.id, 'completed');
    await this.activateSubscriptionAfterPayment(paymentIntent.id);
  }

  /**
   * Handle Stripe payment failure
   */
  private async handleStripePaymentFailure(paymentIntent: any): Promise<void> {
    await this.updatePaymentStatus(paymentIntent.id, 'failed');
  }

  /**
   * Handle Stripe subscription payment success
   */
  private async handleStripeSubscriptionPaymentSuccess(invoice: any): Promise<void> {
    // Update subscription status and extend period
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
   * Handle Stripe subscription payment failure
   */
  private async handleStripeSubscriptionPaymentFailure(invoice: any): Promise<void> {
    // Update subscription status to past_due
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
}

export function createPaymentGatewayService() {
  return new PaymentGatewayService();
}
