"use client"
import * as React from 'react';
import Link from 'next/link';
import { Terminal, Key, ShieldCheck, Copy, Code, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function DevelopersPage() {
  const [apiKey, setApiKey] = React.useState<string | null>(null);

  const generateKey = () => {
    // Mock API Key generation
    setApiKey(`at_live_${Math.random().toString(36).substr(2, 24)}`);
    toast.success("New production API Key generated!");
  };

  const copyToClipboard = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      toast.success('API Key copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col">
      <header className="h-16 border-b border-bg-border bg-bg-surface flex items-center px-8 shrink-0 justify-between">
        <div className="font-bold text-xl flex items-center gap-2">
          <Terminal className="h-5 w-5 text-accent-blue" />
          AlgoText Developers
        </div>
        <Link href="/dashboard" className="text-sm font-medium hover:text-accent-blue transition-colors">Return to Dashboard</Link>
      </header>

      <main className="flex-1 p-8 max-w-5xl mx-auto w-full flex flex-col gap-8">
        
        <div className="bg-bg-surface border border-bg-border rounded-2xl p-10 flex flex-col items-start">
          <Badge className="mb-4 bg-accent-blue/10 text-accent-blue">Enterprise Tier</Badge>
          <h1 className="text-4xl font-bold mb-4">REST API Access</h1>
          <p className="text-text-secondary text-lg max-w-2xl mb-8">
            Bypass the UI and interact directly with the AlgoText execution and risk engines. Designed for institutional scale and ultra-low latency.
          </p>

          <div className="w-full bg-bg-surface border border-bg-border p-6 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Key className="h-6 w-6 text-text-tertiary" />
              <div>
                <div className="text-sm font-semibold">Production API Key</div>
                <div className="font-mono text-sm text-text-tertiary mt-1">
                  {apiKey ? '••••••••••••••••••••••••' + apiKey.slice(-4) : 'No active keys'}
                </div>
              </div>
            </div>
            
            {apiKey ? (
              <Button variant="ghost" onClick={copyToClipboard}><Copy className="h-4 w-4 mr-2" /> Copy Secret Key</Button>
            ) : (
              <Button variant="primary" onClick={generateKey}><ShieldCheck className="h-4 w-4 mr-2" /> Generate Key</Button>
            )}
          </div>
          {apiKey && <p className="text-xs text-accent-red mt-2">Make sure to copy your API key now. You won't be able to see it again!</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-bg-surface border border-bg-border rounded-2xl p-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Code className="h-5 w-5 text-accent-blue" /> Submit Order</h3>
            <p className="text-sm text-text-secondary mb-6">POST <code className="bg-bg-surface px-2 py-1 rounded text-accent-green">/api/v1/orders</code></p>
            <pre className="bg-bg-surface p-4 rounded-xl text-xs font-mono text-text-tertiary overflow-x-auto">
{`{
  "symbol": "BTC",
  "assetClass": "CRYPTO",
  "side": "buy",
  "type": "market",
  "time_in_force": "day"
}`}
            </pre>
            <Button variant="ghost" className="mt-4 w-full justify-between group">
              View Documentation <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="bg-bg-surface border border-bg-border rounded-2xl p-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Code className="h-5 w-5 text-accent-blue" /> List Strategies</h3>
            <p className="text-sm text-text-secondary mb-6">GET <code className="bg-bg-surface px-2 py-1 rounded text-accent-blue">/api/v1/strategies</code></p>
            <pre className="bg-bg-surface p-4 rounded-xl text-xs font-mono text-text-tertiary overflow-x-auto">
{`{
  "data": [
    {
      "id": "strat_9x8",
      "status": "ACTIVE",
      "exposure_usd": 15000,
      "daily_pnl": 342.10
    }
  ]
}`}
            </pre>
            <Button variant="ghost" className="mt-4 w-full justify-between group">
              View Documentation <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

      </main>
    </div>
  );
}

// Temporary Badge component inline to avoid missing imports if it wasn't exported cleanly
function Badge({ children, className, variant = 'primary' }: any) {
  return (
    <span className={`px-2 py-1 rounded text-xs font-bold ${className}`}>
      {children}
    </span>
  );
}
