"use client"
import * as React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Check, Bitcoin, ShieldCheck, Receipt, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { MERCHANT_BTC_ADDRESS } from '@/lib/payments/btc';
import Link from 'next/link';

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for learning and paper trading.',
    features: ['Paper Trading Sandbox', '1 Active Strategy', 'Daily EOD Data Backtesting', 'Community Support'],
    planType: 'Free'
  },
  {
    name: 'Pro VIP',
    price: '$59/mo',
    description: 'For serious quant traders automating real capital.',
    features: ['Live Broker Execution', '10 Active Live Strategies', 'Intraday & 10min Continuous Backtests', 'Sub-Second Order Routing', 'Priority Email & Telegram Support'],
    planType: 'Pro',
    isPopular: true
  },
  {
    name: 'Enterprise',
    price: '$149/mo',
    description: 'For funds and institutional quant traders.',
    features: ['Unlimited Live Strategies', 'Co-Located Dedicated Servers (<5ms)', 'Cross-Exchange Arbitrage API', 'Custom Python Strategy Engine', 'Dedicated Quant Engineer'],
    planType: 'Enterprise'
  }
];

export default function BillingPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  const handleChoosePlan = (planName: string) => {
    if (planName === 'Free') {
      router.push('/builder');
      return;
    }
    router.push('/pricing');
  };

  return (
    <div className="min-h-screen bg-bg-base text-text-primary p-8 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-500 text-xs font-bold mb-4">
            <Bitcoin className="h-3.5 w-3.5" />
            <span>Bitcoin Native Settlement Supported</span>
          </div>
          <h1 className="text-4xl font-extrabold mb-3">Subscription & Billing</h1>
          <p className="text-text-secondary">
            Current Tier: <span className="font-bold text-accent-blue">{user?.plan || 'Free'}</span>
            {user?.isVipActive && <span className="ml-2 px-2 py-0.5 rounded-md bg-accent-green/15 text-accent-green text-xs font-bold">● VIP ACTIVE</span>}
          </p>
        </div>

        {/* Last Payment Receipt Banner */}
        {user?.lastPaymentReceipt && (
          <div className="mb-8 p-4 rounded-2xl bg-bg-surface border border-accent-green/30 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-accent-green/10 text-accent-green flex items-center justify-center">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-text-primary">Last Transaction Settled On-Chain</h4>
                <p className="text-xs text-text-secondary font-mono mt-0.5">
                  Invoice: {user.lastPaymentReceipt.invoiceId} • Paid: {user.lastPaymentReceipt.amountBTC} BTC (${user.lastPaymentReceipt.amountUSD})
                </p>
              </div>
            </div>
            <Link 
              href={`/checkout/verify?orderId=${user.lastPaymentReceipt.invoiceId}&plan=${user.lastPaymentReceipt.plan}&amountUSD=${user.lastPaymentReceipt.amountUSD}&amountBTC=${user.lastPaymentReceipt.amountBTC}&txHash=${user.lastPaymentReceipt.txHash}`}
              className="text-xs text-accent-blue hover:underline font-semibold flex items-center gap-1"
            >
              <span>View Receipt</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const isCurrent = user?.plan === plan.planType;
            return (
              <div 
                key={plan.name} 
                className={`border rounded-3xl p-8 flex flex-col relative transition-all ${
                  plan.isPopular 
                    ? 'border-accent-blue bg-bg-surface shadow-[0_0_40px_rgba(59,130,246,0.12)]' 
                    : 'border-bg-border bg-bg-surface'
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-accent-blue text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                    Recommended
                  </div>
                )}

                <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
                <div className="text-3xl font-extrabold text-text-primary mb-3">{plan.price}</div>
                <p className="text-text-secondary text-xs mb-6 h-10">{plan.description}</p>
                
                <div className="h-px bg-bg-border mb-6" />

                <ul className="flex-1 space-y-3.5 mb-8">
                  {plan.features.map(feat => (
                    <li key={feat} className="flex items-center gap-2.5 text-xs text-text-primary">
                      <Check className="h-4 w-4 text-accent-green shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  variant={plan.isPopular ? 'primary' : 'secondary'} 
                  className={`w-full font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 ${
                    plan.isPopular ? 'bg-amber-500 hover:bg-amber-600 text-black shadow-lg shadow-amber-500/20' : ''
                  }`}
                  onClick={() => handleChoosePlan(plan.name)}
                >
                  {isCurrent ? (
                    "Current Plan"
                  ) : (
                    <>
                      <Bitcoin className="h-3.5 w-3.5" />
                      <span>Pay with Bitcoin ({plan.name})</span>
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Merchant Wallet Info Footer */}
        <div className="mt-12 p-6 rounded-2xl bg-bg-surface border border-bg-border text-center">
          <span className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider block mb-1">
            Official Merchant Bitcoin Settlement Wallet
          </span>
          <code className="font-mono text-xs font-bold text-amber-500 bg-bg-base px-3 py-1.5 rounded-lg border border-bg-border inline-block select-all">
            {MERCHANT_BTC_ADDRESS}
          </code>
        </div>
      </div>
    </div>
  );
}
