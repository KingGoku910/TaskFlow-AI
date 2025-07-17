'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CreditCard, Calendar, TrendingUp, Zap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

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

interface PaymentMethodData {
  id: string;
  last_four: string;
  brand: string;
  expiry_month: number;
  expiry_year: number;
  is_default: boolean;
}

function PaymentForm({ 
  tier, 
  billingCycle, 
  onSuccess, 
  onError 
}: { 
  tier: 'pro' | 'enterprise';
  billingCycle: 'monthly' | 'yearly';
  onSuccess: () => void;
  onError: (error: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      // Create subscription
      const response = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier,
          billingCycle,
        }),
      });

      const { subscriptionId, paymentIntent } = await response.json();

      if (!response.ok) {
        throw new Error('Failed to create subscription');
      }

      // For mock mode, simulate successful payment
      if (paymentIntent.client_secret.includes('mock')) {
        // Mock successful payment confirmation
        await fetch('/api/stripe/confirm-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
          }),
        });

        onSuccess();
        return;
      }

      // Real Stripe payment flow
      const result = await stripe.confirmCardPayment(paymentIntent.client_secret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      // Confirm payment on backend
      await fetch('/api/stripe/confirm-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId: paymentIntent.id,
        }),
      });

      onSuccess();
    } catch (error) {
      console.error('Payment error:', error);
      onError(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border rounded-lg">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          }}
        />
      </div>
      
      <Button 
        type="submit" 
        disabled={!stripe || processing}
        className="w-full"
      >
        {processing ? 'Processing...' : `Subscribe to ${tier} ${billingCycle}`}
      </Button>
    </form>
  );
}

function UpgradeModal({ 
  isOpen, 
  onClose, 
  tier, 
  billingCycle 
}: { 
  isOpen: boolean;
  onClose: () => void;
  tier: 'pro' | 'enterprise';
  billingCycle: 'monthly' | 'yearly';
}) {
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSuccess = () => {
    onClose();
    // Show success toast
    if (typeof window !== 'undefined' && window.location) {
      // Simple success message for now
      alert(`Successfully upgraded to ${tier} ${billingCycle} plan!`);
      window.location.reload(); // Refresh to show new subscription
    }
  };

  const handleError = (error: string) => {
    setError(error);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">
          Upgrade to {tier} - {billingCycle}
        </h3>
        
        {error && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Elements stripe={stripePromise}>
          <PaymentForm
            tier={tier}
            billingCycle={billingCycle}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        </Elements>
        
        <Button 
          variant="ghost" 
          onClick={onClose}
          className="w-full mt-4"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

export default function BillingDashboard() {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upgradeModal, setUpgradeModal] = useState<{
    isOpen: boolean;
    tier: 'pro' | 'enterprise';
    billingCycle: 'monthly' | 'yearly';
  }>({
    isOpen: false,
    tier: 'pro',
    billingCycle: 'monthly'
  });

  useEffect(() => {
    fetchSubscriptionData();
    fetchPaymentMethods();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      const response = await fetch('/api/subscription');
      if (!response.ok) throw new Error('Failed to fetch subscription');
      const data = await response.json();
      setSubscriptionData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch('/api/stripe/payment-methods');
      if (!response.ok) throw new Error('Failed to fetch payment methods');
      const data = await response.json();
      setPaymentMethods(data);
    } catch (err) {
      console.error('Error fetching payment methods:', err);
    }
  };

  const handleUpgrade = (tier: 'pro' | 'enterprise', billingCycle: 'monthly' | 'yearly') => {
    setUpgradeModal({ isOpen: true, tier, billingCycle });
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min(100, Math.round((used / limit) * 100));
  };

  const formatUsageText = (used: number, limit: number) => {
    if (limit === -1) return `${used} / Unlimited`;
    return `${used} / ${limit}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!subscriptionData) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No subscription data available</AlertDescription>
      </Alert>
    );
  }

  const { subscription, usage, daysRemaining, isInTrial } = subscriptionData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Billing & Subscription</h2>
        <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
          {subscription.tier.toUpperCase()} {subscription.status}
        </Badge>
      </div>

      {/* Mock Mode Notice */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Demo Mode:</strong> This is a demonstration of the billing system. 
          Payments are simulated and no real charges will be made.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="upgrade">Upgrade</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{subscription.tier}</div>
                <p className="text-xs text-muted-foreground">
                  {isInTrial ? 'Trial Period' : 'Active Subscription'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Days Remaining</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{daysRemaining}</div>
                <p className="text-xs text-muted-foreground">
                  Until {isInTrial ? 'trial ends' : 'next billing'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasks Used</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{usage.tasks_used}</div>
                <p className="text-xs text-muted-foreground">
                  of {subscription.plan_limits.max_tasks_per_month === -1 ? 'unlimited' : subscription.plan_limits.max_tasks_per_month}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Requests</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{usage.ai_requests_used}</div>
                <p className="text-xs text-muted-foreground">
                  of {subscription.plan_limits.max_ai_requests_per_month === -1 ? 'unlimited' : subscription.plan_limits.max_ai_requests_per_month}
                </p>
              </CardContent>
            </Card>
          </div>

          {subscription.tier === 'free' && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You're on the free plan. Upgrade to Pro for unlimited tasks and AI features.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usage This Month</CardTitle>
              <CardDescription>
                Your current usage compared to plan limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Tasks</span>
                  <span>{formatUsageText(usage.tasks_used, subscription.plan_limits.max_tasks_per_month)}</span>
                </div>
                <Progress value={getUsagePercentage(usage.tasks_used, subscription.plan_limits.max_tasks_per_month)} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>AI Requests</span>
                  <span>{formatUsageText(usage.ai_requests_used, subscription.plan_limits.max_ai_requests_per_month)}</span>
                </div>
                <Progress value={getUsagePercentage(usage.ai_requests_used, subscription.plan_limits.max_ai_requests_per_month)} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Notes</span>
                  <span>{formatUsageText(usage.notes_used, subscription.plan_limits.max_notes_per_month)}</span>
                </div>
                <Progress value={getUsagePercentage(usage.notes_used, subscription.plan_limits.max_notes_per_month)} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Meeting Summaries</span>
                  <span>{formatUsageText(usage.meeting_summaries_used, subscription.plan_limits.max_meeting_summaries_per_month)}</span>
                </div>
                <Progress value={getUsagePercentage(usage.meeting_summaries_used, subscription.plan_limits.max_meeting_summaries_per_month)} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Storage</span>
                  <span>{formatUsageText(usage.storage_used_mb, subscription.plan_limits.max_storage_mb)} MB</span>
                </div>
                <Progress value={getUsagePercentage(usage.storage_used_mb, subscription.plan_limits.max_storage_mb)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Manage your payment methods
              </CardDescription>
            </CardHeader>
            <CardContent>
              {paymentMethods.length === 0 ? (
                <p className="text-muted-foreground">No payment methods added</p>
              ) : (
                <div className="space-y-2">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5" />
                        <div>
                          <p className="font-medium">**** **** **** {method.last_four}</p>
                          <p className="text-sm text-muted-foreground">
                            {method.brand} • Expires {method.expiry_month}/{method.expiry_year}
                          </p>
                        </div>
                      </div>
                      {method.is_default && (
                        <Badge variant="secondary">Default</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upgrade" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Pro Plan</CardTitle>
                <CardDescription>
                  Perfect for professionals and small teams
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold">$9.99<span className="text-sm font-normal">/month</span></div>
                <ul className="space-y-2 text-sm">
                  <li>✓ Unlimited tasks</li>
                  <li>✓ AI task decomposition</li>
                  <li>✓ Meeting summaries</li>
                  <li>✓ Advanced analytics</li>
                  <li>✓ Priority support</li>
                </ul>
                <div className="space-y-2">
                  <Button 
                    className="w-full"
                    onClick={() => handleUpgrade('pro', 'monthly')}
                    disabled={subscription.tier === 'pro' || subscription.tier === 'enterprise'}
                  >
                    Upgrade to Pro Monthly
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => handleUpgrade('pro', 'yearly')}
                    disabled={subscription.tier === 'pro' || subscription.tier === 'enterprise'}
                  >
                    Upgrade to Pro Yearly ($99.99)
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Enterprise Plan</CardTitle>
                <CardDescription>
                  For large organizations with advanced needs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold">Custom<span className="text-sm font-normal"> pricing</span></div>
                <ul className="space-y-2 text-sm">
                  <li>✓ Everything in Pro</li>
                  <li>✓ Team collaboration</li>
                  <li>✓ Custom integrations</li>
                  <li>✓ SSO support</li>
                  <li>✓ Dedicated support</li>
                </ul>
                <Button 
                  className="w-full"
                  onClick={() => window.open('mailto:ryno@innovatex-ai.net?subject=Enterprise Plan Inquiry')}
                >
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <UpgradeModal
        isOpen={upgradeModal.isOpen}
        onClose={() => setUpgradeModal({ ...upgradeModal, isOpen: false })}
        tier={upgradeModal.tier}
        billingCycle={upgradeModal.billingCycle}
      />
    </div>
  );
}
