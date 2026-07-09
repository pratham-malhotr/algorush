"use client"
import * as React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for learning and paper trading.',
    features: ['Paper Trading', '1 Active Strategy', 'Daily EOD Data Backtesting'],
    priceId: 'mock_free'
  },
  {
    name: 'Pro',
    price: '$49/mo',
    description: 'For serious traders automating their edge.',
    features: ['Live Broker Execution', '10 Active Strategies', 'Intraday Data Backtesting', 'Priority Support'],
    priceId: 'price_mock_pro_123' // Replace with real Stripe Price ID
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For funds and institutional traders.',
    features: ['Unlimited Strategies', 'WebSocket APIs', 'Dedicated Server', 'Custom Broker Integrations'],
    priceId: 'mock_enterprise'
  }
];

export default function BillingPage() {
  const { user } = useAuthStore();
  const [loadingPlan, setLoadingPlan] = React.useState<string | null>(null);

  const handleCheckout = async (priceId: string) => {
    if (priceId.startsWith('mock_')) {
      alert("This is a custom or free plan. No checkout needed.");
      return;
    }
    setLoadingPlan(priceId);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId })
      });
      const { sessionId, mockMode } = await response.json();
      
      if (mockMode) {
        window.location.href = '/billing?success=true';
        return;
      }

      const stripe = await stripePromise;
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId });
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base text-text-primary p-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-center">Upgrade your trading</h1>
        <p className="text-text-secondary text-center mb-12">Current Plan: <span className="font-bold text-accent-blue">{user?.plan}</span></p>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div key={plan.name} className="border border-bg-border bg-bg-surface rounded-2xl p-8 flex flex-col">
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="text-3xl font-bold text-accent-blue mb-4">{plan.price}</div>
              <p className="text-text-secondary mb-8 h-12">{plan.description}</p>
              
              <ul className="flex-1 space-y-4 mb-8">
                {plan.features.map(feat => (
                  <li key={feat} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-accent-green" />
                    <span className="text-sm">{feat}</span>
                  </li>
                ))}
              </ul>

              <Button 
                variant={plan.name === 'Pro' ? 'primary' : 'secondary'} 
                className="w-full"
                onClick={() => handleCheckout(plan.priceId)}
                disabled={loadingPlan === plan.priceId}
              >
                {loadingPlan === plan.priceId ? "Redirecting..." : plan.name === 'Enterprise' ? 'Contact Us' : 'Choose Plan'}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
