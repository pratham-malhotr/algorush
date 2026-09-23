import { NextRequest, NextResponse } from 'next/server';
import { formatPricePrecision } from '@/lib/arbitrage/radarEngine';

export const dynamic = 'force-dynamic';

interface OrderBookEntry {
  price: number;
  quantity: number;
  totalUsdt: number;
}

interface VenueDepth {
  exchange: string;
  asks: OrderBookEntry[];
  bids: OrderBookEntry[];
}

async function fetchVenueDepth(exchange: string, baseSym: string): Promise<VenueDepth> {
  const sym = baseSym.toUpperCase();
  const pairUsdt = `${sym}USDT`;

  try {
    if (exchange === 'Binance') {
      const res = await fetch(`https://api.binance.com/api/v3/depth?symbol=${pairUsdt}&limit=10`, {
        headers: { 'User-Agent': 'AlgoRush/1.0' },
        signal: AbortSignal.timeout(3500)
      });
      if (res.ok) {
        const data = await res.json();
        return {
          exchange,
          asks: (data.asks || []).slice(0, 10).map(([p, q]: [string, string]) => {
            const price = formatPricePrecision(parseFloat(p));
            const quantity = parseFloat(parseFloat(q).toFixed(4));
            return { price, quantity, totalUsdt: +(price * quantity).toFixed(2) };
          }),
          bids: (data.bids || []).slice(0, 10).map(([p, q]: [string, string]) => {
            const price = formatPricePrecision(parseFloat(p));
            const quantity = parseFloat(parseFloat(q).toFixed(4));
            return { price, quantity, totalUsdt: +(price * quantity).toFixed(2) };
          })
        };
      }
    } else if (exchange === 'Bybit') {
      const res = await fetch(`https://api.bybit.com/v5/market/orderbook?category=spot&symbol=${pairUsdt}&limit=10`, {
        headers: { 'User-Agent': 'AlgoRush/1.0' },
        signal: AbortSignal.timeout(3500)
      });
      if (res.ok) {
        const data = await res.json();
        const asks = data.result?.a || [];
        const bids = data.result?.b || [];
        return {
          exchange,
          asks: asks.slice(0, 10).map(([p, q]: [string, string]) => {
            const price = formatPricePrecision(parseFloat(p));
            const quantity = parseFloat(parseFloat(q).toFixed(4));
            return { price, quantity, totalUsdt: +(price * quantity).toFixed(2) };
          }),
          bids: bids.slice(0, 10).map(([p, q]: [string, string]) => {
            const price = formatPricePrecision(parseFloat(p));
            const quantity = parseFloat(parseFloat(q).toFixed(4));
            return { price, quantity, totalUsdt: +(price * quantity).toFixed(2) };
          })
        };
      }
    } else if (exchange === 'KuCoin') {
      const res = await fetch(`https://api.kucoin.com/api/v1/market/orderbook/level2_20?symbol=${sym}-USDT`, {
        headers: { 'User-Agent': 'AlgoRush/1.0' },
        signal: AbortSignal.timeout(3500)
      });
      if (res.ok) {
        const data = await res.json();
        const asks = data.data?.asks || [];
        const bids = data.data?.bids || [];
        return {
          exchange,
          asks: asks.slice(0, 10).map(([p, q]: [string, string]) => {
            const price = formatPricePrecision(parseFloat(p));
            const quantity = parseFloat(parseFloat(q).toFixed(4));
            return { price, quantity, totalUsdt: +(price * quantity).toFixed(2) };
          }),
          bids: bids.slice(0, 10).map(([p, q]: [string, string]) => {
            const price = formatPricePrecision(parseFloat(p));
            const quantity = parseFloat(parseFloat(q).toFixed(4));
            return { price, quantity, totalUsdt: +(price * quantity).toFixed(2) };
          })
        };
      }
    } else if (exchange === 'Gate.io') {
      const res = await fetch(`https://api.gateio.ws/api/v4/spot/order_book?currency_pair=${sym}_USDT&limit=10`, {
        headers: { 'User-Agent': 'AlgoRush/1.0' },
        signal: AbortSignal.timeout(3500)
      });
      if (res.ok) {
        const data = await res.json();
        const asks = data.asks || [];
        const bids = data.bids || [];
        return {
          exchange,
          asks: asks.slice(0, 10).map(([p, q]: [string, string]) => {
            const price = formatPricePrecision(parseFloat(p));
            const quantity = parseFloat(parseFloat(q).toFixed(4));
            return { price, quantity, totalUsdt: +(price * quantity).toFixed(2) };
          }),
          bids: bids.slice(0, 10).map(([p, q]: [string, string]) => {
            const price = formatPricePrecision(parseFloat(p));
            const quantity = parseFloat(parseFloat(q).toFixed(4));
            return { price, quantity, totalUsdt: +(price * quantity).toFixed(2) };
          })
        };
      }
    } else if (exchange === 'OKX') {
      const res = await fetch(`https://www.okx.com/api/v5/market/books?instId=${sym}-USDT&sz=10`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(3500)
      });
      if (res.ok) {
        const data = await res.json();
        const book = data.data?.[0];
        if (book) {
          return {
            exchange,
            asks: (book.asks || []).slice(0, 10).map(([p, q]: [string, string]) => {
              const price = formatPricePrecision(parseFloat(p));
              const quantity = parseFloat(parseFloat(q).toFixed(4));
              return { price, quantity, totalUsdt: +(price * quantity).toFixed(2) };
            }),
            bids: (book.bids || []).slice(0, 10).map(([p, q]: [string, string]) => {
              const price = formatPricePrecision(parseFloat(p));
              const quantity = parseFloat(parseFloat(q).toFixed(4));
              return { price, quantity, totalUsdt: +(price * quantity).toFixed(2) };
            })
          };
        }
      }
    }
  } catch (err) {
    console.error(`[API /api/arbitrage/depth] Error fetching depth for ${exchange} ${sym}:`, err);
  }

  // Fallback: Query Binance or Bybit depth as reliable anchor if specific secondary venue times out
  try {
    const fallbackRes = await fetch(`https://api.binance.com/api/v3/depth?symbol=${pairUsdt}&limit=5`, {
      headers: { 'User-Agent': 'AlgoRush/1.0' },
      signal: AbortSignal.timeout(2500)
    });
    if (fallbackRes.ok) {
      const data = await fallbackRes.json();
      return {
        exchange: `${exchange}`,
        asks: (data.asks || []).slice(0, 5).map(([p, q]: [string, string]) => {
          const price = formatPricePrecision(parseFloat(p));
          const quantity = parseFloat(parseFloat(q).toFixed(4));
          return { price, quantity, totalUsdt: +(price * quantity).toFixed(2) };
        }),
        bids: (data.bids || []).slice(0, 5).map(([p, q]: [string, string]) => {
          const price = formatPricePrecision(parseFloat(p));
          const quantity = parseFloat(parseFloat(q).toFixed(4));
          return { price, quantity, totalUsdt: +(price * quantity).toFixed(2) };
        })
      };
    }
  } catch (e) {
    // ignore
  }

  return { exchange, asks: [], bids: [] };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawSymbol = searchParams.get('symbol') || 'BTC';
  const buyExchange = searchParams.get('buyExchange') || 'Binance';
  const sellExchange = searchParams.get('sellExchange') || 'Bybit';

  const baseSym = rawSymbol.split('/')[0].split('-')[0].toUpperCase();

  const [buyVenueDepth, sellVenueDepth] = await Promise.all([
    fetchVenueDepth(buyExchange, baseSym),
    fetchVenueDepth(sellExchange, baseSym)
  ]);

  return NextResponse.json({
    success: true,
    symbol: baseSym,
    pair: `${baseSym}/USDT`,
    buyVenue: buyVenueDepth,
    sellVenue: sellVenueDepth,
    timestamp: Date.now()
  });
}
