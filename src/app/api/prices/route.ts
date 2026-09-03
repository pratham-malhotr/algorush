import { NextResponse } from 'next/server';
import { fetchPrices, getFallbackPrice } from '@/lib/prices/binance';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const symbolsParam = searchParams.get('symbols');
    
    if (!symbolsParam) {
      return NextResponse.json({ error: 'Missing symbols query parameter' }, { status: 400 });
    }

    const symbols = symbolsParam.split(',').map(s => s.trim()).filter(Boolean);
    
    if (symbols.length === 0 || symbols.length > 20) {
      return NextResponse.json({ error: 'Provide 1-20 symbols' }, { status: 400 });
    }

    const prices = await fetchPrices(symbols);
    
    // Fill in fallbacks for any symbols that couldn't be fetched
    const result: Record<string, number> = {};
    for (const symbol of symbols) {
      result[symbol] = prices[symbol] || getFallbackPrice(symbol);
    }

    return NextResponse.json({ 
      prices: result,
      source: Object.keys(prices).length === symbols.length ? 'binance_live' : 'partial_live',
      timestamp: Date.now()
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch prices' }, { status: 500 });
  }
}
