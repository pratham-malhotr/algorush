import { NextResponse } from 'next/server';
import { generateMockData, runLocalBacktest } from '@/lib/backtester/engine';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pair = searchParams.get('pair') || 'BTC/USDT';
  const venue = searchParams.get('venue') || 'Binance Futures';
  const lookback = parseInt(searchParams.get('lookback') || '90');
  const leverage = parseInt(searchParams.get('leverage') || '10');
  const capital = parseFloat(searchParams.get('capital') || '10000');

  const data = generateMockData(lookback, pair.includes("BTC") ? 64000 : 3400);
  const result = runLocalBacktest(null, data, capital, leverage, 0.05, 0.03, venue);

  return NextResponse.json({
    status: '200 OK',
    engine: 'AlgoText Quantitative Telemetry API v2.5',
    host: 'http://localhost:3000/api/quant-engine',
    params: { pair, venue, lookback, leverage, capital },
    metrics: result.metrics,
    equityCurveSample: result.equityCurve.slice(-10),
    recentTrades: result.trades.slice(-5),
    timestamp: new Date().toISOString()
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { strategy, pair = 'BTC/USDT', venue = 'Binance Futures', lookback = 90, capital = 10000, leverage = 10 } = body;

    const data = generateMockData(lookback, pair.includes("BTC") ? 64000 : 3400);
    const result = runLocalBacktest(strategy, data, capital, leverage, 0.05, 0.03, venue);

    return NextResponse.json({
      status: '200 OK',
      engine: 'AlgoText Quantitative Telemetry API v2.5',
      result,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error processing quant strategy' }, { status: 400 });
  }
}
