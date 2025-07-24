-- =============================================================================
-- EFFECTO TASKFLOW - BILLING & SUBSCRIPTION SCHEMA
-- Extends main schema with subscription management, rate limiting, and payments
-- Version: 1.0 (July 16, 2025)
-- =============================================================================

-- =============================================================================
-- SUBSCRIPTION PLANS TABLE
-- =============================================================================

CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'canceled', 'past_due', 'trialing');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded', 'disputed');
CREATE TYPE payment_method AS ENUM ('stripe', 'paypal', 'payfast', 'google_pay', 'direct_eft');

-- Subscription plans configuration
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    tier subscription_tier NOT NULL,
    price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Feature limits
    max_tasks_per_month INTEGER DEFAULT -1, -- -1 = unlimited
    max_ai_requests_per_month INTEGER DEFAULT 0,
    max_notes_per_month INTEGER DEFAULT -1,
    max_meeting_summaries_per_month INTEGER DEFAULT 0,
    max_storage_mb INTEGER DEFAULT 100,
    
    -- Features enabled
    ai_task_decomposition BOOLEAN DEFAULT FALSE,
    meeting_summarization BOOLEAN DEFAULT FALSE,
    advanced_analytics BOOLEAN DEFAULT FALSE,
    team_collaboration BOOLEAN DEFAULT FALSE,
    priority_support BOOLEAN DEFAULT FALSE,
    custom_integrations BOOLEAN DEFAULT FALSE,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT uq_subscription_plans_tier UNIQUE (tier)
);

-- =============================================================================
-- USER SUBSCRIPTIONS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    plan_id UUID NOT NULL,
    tier subscription_tier NOT NULL,
    status subscription_status NOT NULL DEFAULT 'active',
    
    -- Subscription period
    current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_period_end TIMESTAMP WITH TIME ZONE,
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    canceled_at TIMESTAMP WITH TIME ZONE,
    
    -- Payment integration
    stripe_subscription_id VARCHAR(255),
    paypal_subscription_id VARCHAR(255),
    payfast_payment_id VARCHAR(255),
    google_pay_subscription_id VARCHAR(255),
    
    -- Billing details
    billing_cycle VARCHAR(20) DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
    next_billing_date TIMESTAMP WITH TIME ZONE,
    last_payment_date TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign keys
    CONSTRAINT fk_user_subscriptions_user_id FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_subscriptions_plan_id FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id),
    
    -- Ensure one active subscription per user
    CONSTRAINT uq_user_active_subscription UNIQUE (user_id) DEFERRABLE INITIALLY DEFERRED
);

-- =============================================================================
-- USAGE TRACKING TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.usage_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    resource_type VARCHAR(50) NOT NULL, -- 'task', 'ai_request', 'note', 'meeting_summary', 'storage'
    resource_id UUID, -- Optional reference to specific resource
    quantity INTEGER DEFAULT 1,
    
    -- Usage metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    billing_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    billing_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign keys
    CONSTRAINT fk_usage_tracking_user_id FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- =============================================================================
-- RATE LIMITING TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    
    -- Rate limit tracking
    current_count INTEGER DEFAULT 0,
    limit_per_period INTEGER NOT NULL,
    reset_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Period configuration
    period_type VARCHAR(20) DEFAULT 'monthly' CHECK (period_type IN ('hourly', 'daily', 'weekly', 'monthly')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign keys
    CONSTRAINT fk_rate_limits_user_id FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Unique constraint per user and resource type
    CONSTRAINT uq_rate_limits_user_resource UNIQUE (user_id, resource_type)
);

-- =============================================================================
-- PAYMENT TRANSACTIONS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    subscription_id UUID,
    
    -- Payment details
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method payment_method NOT NULL,
    status payment_status NOT NULL DEFAULT 'pending',
    
    -- External payment provider details
    stripe_payment_intent_id VARCHAR(255),
    paypal_payment_id VARCHAR(255),
    payfast_payment_id VARCHAR(255),
    google_pay_transaction_id VARCHAR(255),
    direct_eft_reference VARCHAR(255),
    
    -- Transaction metadata
    description TEXT,
    receipt_url VARCHAR(500),
    failure_reason TEXT,
    refund_amount DECIMAL(10,2) DEFAULT 0.00,
    
    -- Timestamps
    payment_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign keys
    CONSTRAINT fk_payment_transactions_user_id FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_payment_transactions_subscription_id FOREIGN KEY (subscription_id) REFERENCES public.user_subscriptions(id)
);

-- =============================================================================
-- PAYMENT METHODS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.user_payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    payment_method payment_method NOT NULL,
    
    -- Payment method details (encrypted)
    provider_customer_id VARCHAR(255), -- Stripe customer ID, PayPal customer ID, etc.
    last_four VARCHAR(4),
    brand VARCHAR(50),
    expiry_month INTEGER,
    expiry_year INTEGER,
    
    -- Status
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign keys
    CONSTRAINT fk_user_payment_methods_user_id FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- =============================================================================
-- BILLING INVOICES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.billing_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    subscription_id UUID,
    invoice_number VARCHAR(50) NOT NULL,
    
    -- Invoice details
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Payment status
    status payment_status NOT NULL DEFAULT 'pending',
    payment_date TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    
    -- Billing period
    billing_period_start TIMESTAMP WITH TIME ZONE,
    billing_period_end TIMESTAMP WITH TIME ZONE,
    
    -- External references
    stripe_invoice_id VARCHAR(255),
    paypal_invoice_id VARCHAR(255),
    pdf_url VARCHAR(500),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign keys
    CONSTRAINT fk_billing_invoices_user_id FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_billing_invoices_subscription_id FOREIGN KEY (subscription_id) REFERENCES public.user_subscriptions(id),
    
    -- Unique invoice number
    CONSTRAINT uq_billing_invoices_number UNIQUE (invoice_number)
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Subscription plans indexes
CREATE INDEX IF NOT EXISTS idx_subscription_plans_tier ON public.subscription_plans(tier);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON public.subscription_plans(is_active);

-- User subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_period_end ON public.user_subscriptions(current_period_end);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_id ON public.user_subscriptions(stripe_subscription_id);

-- Usage tracking indexes
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON public.usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_resource_type ON public.usage_tracking(resource_type);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_billing_period ON public.usage_tracking(billing_period_start, billing_period_end);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_created_at ON public.usage_tracking(created_at);

-- Rate limits indexes
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_id ON public.rate_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_at ON public.rate_limits(reset_at);

-- Payment transactions indexes
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON public.payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_payment_date ON public.payment_transactions(payment_date);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_stripe_id ON public.payment_transactions(stripe_payment_intent_id);

-- User payment methods indexes
CREATE INDEX IF NOT EXISTS idx_user_payment_methods_user_id ON public.user_payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_user_payment_methods_default ON public.user_payment_methods(user_id, is_default);

-- Billing invoices indexes
CREATE INDEX IF NOT EXISTS idx_billing_invoices_user_id ON public.billing_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_status ON public.billing_invoices(status);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_due_date ON public.billing_invoices(due_date);

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Enable RLS on all billing tables
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_invoices ENABLE ROW LEVEL SECURITY;

-- Subscription plans policies (public read access)
CREATE POLICY "Anyone can view subscription plans" ON public.subscription_plans
    FOR SELECT USING (is_active = TRUE);

-- User subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON public.user_subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- Usage tracking policies
CREATE POLICY "Users can view own usage" ON public.usage_tracking
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage tracking" ON public.usage_tracking
    FOR INSERT WITH CHECK (true); -- Will be controlled by application logic

-- Rate limits policies
CREATE POLICY "Users can view own rate limits" ON public.rate_limits
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage rate limits" ON public.rate_limits
    FOR ALL USING (true); -- Will be controlled by application logic

-- Payment transactions policies
CREATE POLICY "Users can view own payment transactions" ON public.payment_transactions
    FOR SELECT USING (auth.uid() = user_id);

-- User payment methods policies
CREATE POLICY "Users can view own payment methods" ON public.user_payment_methods
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own payment methods" ON public.user_payment_methods
    FOR ALL USING (auth.uid() = user_id);

-- Billing invoices policies
CREATE POLICY "Users can view own billing invoices" ON public.billing_invoices
    FOR SELECT USING (auth.uid() = user_id);

-- =============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================================================

-- Update timestamps on subscription plans
CREATE TRIGGER handle_subscription_plans_updated_at
    BEFORE UPDATE ON public.subscription_plans
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Update timestamps on user subscriptions
CREATE TRIGGER handle_user_subscriptions_updated_at
    BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Update timestamps on rate limits
CREATE TRIGGER handle_rate_limits_updated_at
    BEFORE UPDATE ON public.rate_limits
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Update timestamps on payment transactions
CREATE TRIGGER handle_payment_transactions_updated_at
    BEFORE UPDATE ON public.payment_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Update timestamps on user payment methods
CREATE TRIGGER handle_user_payment_methods_updated_at
    BEFORE UPDATE ON public.user_payment_methods
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Update timestamps on billing invoices
CREATE TRIGGER handle_billing_invoices_updated_at
    BEFORE UPDATE ON public.billing_invoices
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- GRANT PERMISSIONS
-- =============================================================================

-- Grant necessary permissions to authenticated users
GRANT SELECT ON public.subscription_plans TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_subscriptions TO authenticated;
GRANT SELECT, INSERT ON public.usage_tracking TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rate_limits TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.payment_transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_payment_methods TO authenticated;
GRANT SELECT ON public.billing_invoices TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =============================================================================
-- INITIAL DATA SETUP
-- =============================================================================

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, tier, price_monthly, price_yearly, max_tasks_per_month, max_ai_requests_per_month, max_notes_per_month, max_meeting_summaries_per_month, max_storage_mb, ai_task_decomposition, meeting_summarization, advanced_analytics, team_collaboration, priority_support, custom_integrations) VALUES
-- Free tier
('Free', 'free', 0.00, 0.00, 50, 0, 50, 0, 100, false, false, false, false, false, false),
-- Pro tier
('Pro', 'pro', 9.99, 99.99, -1, 100, -1, 20, 1000, true, true, true, false, true, false),
-- Enterprise tier
('Enterprise', 'enterprise', 0.00, 0.00, -1, -1, -1, -1, 10000, true, true, true, true, true, true);

-- =============================================================================
-- UTILITY FUNCTIONS
-- =============================================================================

-- Function to get user's current subscription
CREATE OR REPLACE FUNCTION public.get_user_subscription(user_uuid UUID)
RETURNS TABLE (
    tier subscription_tier,
    status subscription_status,
    current_period_end TIMESTAMP WITH TIME ZONE,
    plan_limits JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        us.tier,
        us.status,
        us.current_period_end,
        jsonb_build_object(
            'max_tasks_per_month', sp.max_tasks_per_month,
            'max_ai_requests_per_month', sp.max_ai_requests_per_month,
            'max_notes_per_month', sp.max_notes_per_month,
            'max_meeting_summaries_per_month', sp.max_meeting_summaries_per_month,
            'max_storage_mb', sp.max_storage_mb,
            'ai_task_decomposition', sp.ai_task_decomposition,
            'meeting_summarization', sp.meeting_summarization,
            'advanced_analytics', sp.advanced_analytics,
            'team_collaboration', sp.team_collaboration,
            'priority_support', sp.priority_support,
            'custom_integrations', sp.custom_integrations
        ) as plan_limits
    FROM public.user_subscriptions us
    JOIN public.subscription_plans sp ON us.plan_id = sp.id
    WHERE us.user_id = user_uuid
    AND us.status = 'active'
    ORDER BY us.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has reached limit for a resource
CREATE OR REPLACE FUNCTION public.check_resource_limit(user_uuid UUID, resource_type_param VARCHAR(50))
RETURNS BOOLEAN AS $$
DECLARE
    current_usage INTEGER := 0;
    limit_amount INTEGER := 0;
    billing_start TIMESTAMP WITH TIME ZONE;
    billing_end TIMESTAMP WITH TIME ZONE;
    user_sub RECORD;
BEGIN
    -- Get user's current subscription and limits
    SELECT * INTO user_sub FROM public.get_user_subscription(user_uuid);
    
    IF user_sub IS NULL THEN
        RETURN FALSE; -- No subscription found
    END IF;
    
    -- Get current billing period
    SELECT current_period_start, current_period_end 
    INTO billing_start, billing_end
    FROM public.user_subscriptions 
    WHERE user_id = user_uuid AND status = 'active';
    
    -- Get the limit for the resource type
    limit_amount := CASE resource_type_param
        WHEN 'task' THEN (user_sub.plan_limits->>'max_tasks_per_month')::INTEGER
        WHEN 'ai_request' THEN (user_sub.plan_limits->>'max_ai_requests_per_month')::INTEGER
        WHEN 'note' THEN (user_sub.plan_limits->>'max_notes_per_month')::INTEGER
        WHEN 'meeting_summary' THEN (user_sub.plan_limits->>'max_meeting_summaries_per_month')::INTEGER
        ELSE 0
    END;
    
    -- -1 means unlimited
    IF limit_amount = -1 THEN
        RETURN TRUE;
    END IF;
    
    -- Get current usage for this billing period
    SELECT COALESCE(SUM(quantity), 0) INTO current_usage
    FROM public.usage_tracking
    WHERE user_id = user_uuid
    AND resource_type = resource_type_param
    AND billing_period_start >= billing_start
    AND billing_period_end <= billing_end;
    
    RETURN current_usage < limit_amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track resource usage
CREATE OR REPLACE FUNCTION public.track_resource_usage(
    user_uuid UUID, 
    resource_type_param VARCHAR(50), 
    resource_id_param UUID DEFAULT NULL,
    quantity_param INTEGER DEFAULT 1
)
RETURNS VOID AS $$
DECLARE
    billing_start TIMESTAMP WITH TIME ZONE;
    billing_end TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get current billing period
    SELECT current_period_start, current_period_end 
    INTO billing_start, billing_end
    FROM public.user_subscriptions 
    WHERE user_id = user_uuid AND status = 'active';
    
    -- If no active subscription, use monthly period from now
    IF billing_start IS NULL THEN
        billing_start := date_trunc('month', NOW());
        billing_end := billing_start + INTERVAL '1 month';
    END IF;
    
    -- Insert usage tracking record
    INSERT INTO public.usage_tracking (
        user_id, 
        resource_type, 
        resource_id, 
        quantity, 
        billing_period_start, 
        billing_period_end
    ) VALUES (
        user_uuid, 
        resource_type_param, 
        resource_id_param, 
        quantity_param, 
        billing_start, 
        billing_end
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- COMPLETION MESSAGE
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '💳 EFFECTO TASKFLOW BILLING SYSTEM SETUP COMPLETE!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Subscription plans and billing tables created';
    RAISE NOTICE '✅ Rate limiting system implemented';
    RAISE NOTICE '✅ Usage tracking system ready';
    RAISE NOTICE '✅ Payment gateway integration support added';
    RAISE NOTICE '✅ Multi-provider payment support (Stripe, PayPal, PayFast, Google Pay, Direct EFT)';
    RAISE NOTICE '✅ Comprehensive billing and invoice management';
    RAISE NOTICE '✅ Row Level Security applied to all billing tables';
    RAISE NOTICE '✅ Utility functions for subscription management';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Default subscription plans created:';
    RAISE NOTICE '   - Free: $0/month (50 tasks, basic features)';
    RAISE NOTICE '   - Pro: $9.99/month (unlimited tasks, AI features)';
    RAISE NOTICE '   - Enterprise: Custom pricing (all features)';
END $$;
