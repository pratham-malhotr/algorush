import { NextResponse } from 'next/server';
import { ALL_ASSETS } from '@/lib/constants/assets';

export const dynamic = 'force-dynamic';

export interface MarketTicker {
  symbol: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  quoteVolume: number;
  isPositive: boolean;
  marketCap?: number;
  marketCapFormatted?: string;
  volume24hFormatted?: string;
}

let cachedTickers: Record<string, MarketTicker> = {};
let lastFetchTime = 0;
const CACHE_TTL_MS = 3000; // 3 seconds cache

function formatUsd(val: number): string {
  if (val >= 1e12) return `$${(val / 1e12).toFixed(2)}T`;
  if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
  if (val >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
  return `$${val.toLocaleString()}`;
}

async function fetchLiveBinanceTickers(): Promise<Record<string, MarketTicker>> {
  const now = Date.now();
  if (now - lastFetchTime < CACHE_TTL_MS && Object.keys(cachedTickers).length > 0) {
    return cachedTickers;
  }

  const assetLookup: Record<string, typeof ALL_ASSETS[0]> = {};
  ALL_ASSETS.forEach(a => {
    assetLookup[a.symbol] = a;
    assetLookup[a.symbol.replace('/', '')] = a;
  });

  try {
    const [spotRes, futuresRes] = await Promise.allSettled([
      fetch('https://api.binance.com/api/v3/ticker/24hr', {
        headers: { 'User-Agent': 'AlgoText/1.0' },
        signal: AbortSignal.timeout(4000)
      }),
      fetch('https://fapi.binance.com/fapi/v1/ticker/24hr', {
        headers: { 'User-Agent': 'AlgoText/1.0' },
        signal: AbortSignal.timeout(4000)
      })
    ]);

    const resultMap: Record<string, MarketTicker> = {};

    if (spotRes.status === 'fulfilled' && spotRes.value.ok) {
      const spotData = await spotRes.value.json();
      if (Array.isArray(spotData)) {
        for (const item of spotData) {
          if (item.symbol && item.symbol.endsWith('USDT')) {
            const base = item.symbol.slice(0, -4);
            const pair = `${base}/USDT`;
            const matchingAsset = assetLookup[pair];
            
            if (matchingAsset) {
              const price = parseFloat(item.lastPrice);
              const change24h = parseFloat(item.priceChangePercent);
              const quoteVol = parseFloat(item.quoteVolume);
              const circSupply = matchingAsset.circulatingSupply || 0;
              const mcap = circSupply > 0 ? Math.round(circSupply * price) : (matchingAsset.marketCap || 0);

              resultMap[pair] = {
                symbol: pair,
                price: price,
                change24h: change24h,
                high24h: parseFloat(item.highPrice),
                low24h: parseFloat(item.lowPrice),
                volume24h: parseFloat(item.volume),
                quoteVolume: quoteVol,
                isPositive: change24h >= 0,
                marketCap: mcap,
                marketCapFormatted: formatUsd(mcap),
                volume24hFormatted: formatUsd(quoteVol)
              };
            }
          }
        }
      }
    }

    if (futuresRes.status === 'fulfilled' && futuresRes.value.ok) {
      const fData = await futuresRes.value.json();
      if (Array.isArray(fData)) {
        for (const item of fData) {
          if (item.symbol && item.symbol.endsWith('USDT')) {
            const base = item.symbol.slice(0, -4);
            const pair = `${base}/USDT`;
            const matchingAsset = assetLookup[pair];
            
            if (matchingAsset && !resultMap[pair]) {
              const price = parseFloat(item.lastPrice);
              const change24h = parseFloat(item.priceChangePercent);
              const quoteVol = parseFloat(item.quoteVolume);
              const circSupply = matchingAsset.circulatingSupply || 0;
              const mcap = circSupply > 0 ? Math.round(circSupply * price) : (matchingAsset.marketCap || 0);

              resultMap[pair] = {
                symbol: pair,
                price: price,
                change24h: change24h,
                high24h: parseFloat(item.highPrice),
                low24h: parseFloat(item.lowPrice),
                volume24h: parseFloat(item.volume),
                quoteVolume: quoteVol,
                isPositive: change24h >= 0,
                marketCap: mcap,
                marketCapFormatted: formatUsd(mcap),
                volume24hFormatted: formatUsd(quoteVol)
              };
            }
          }
        }
      }
    }

    // Fill in any remaining from ALL_ASSETS baseline
    ALL_ASSETS.forEach(a => {
      if (!resultMap[a.symbol]) {
        const basePrice = a.price || 100;
        resultMap[a.symbol] = {
          symbol: a.symbol,
          price: basePrice,
          change24h: a.change24h || 0,
          high24h: a.high24h || basePrice * 1.02,
          low24h: a.low24h || basePrice * 0.98,
          volume24h: a.volume24h || 1000000,
          quoteVolume: a.volume24h || 1000000,
          isPositive: (a.change24h || 0) >= 0,
          marketCap: a.marketCap,
          marketCapFormatted: a.marketCapFormatted,
          volume24hFormatted: a.volume24hFormatted
        };
      }
    });

    cachedTickers = resultMap;
    lastFetchTime = now;
  } catch (err) {
    console.error('[API/market-tickers] Fallback to asset constants:', err);
    // If external fetch fails, populate from ALL_ASSETS constants
    if (Object.keys(cachedTickers).length === 0) {
      ALL_ASSETS.forEach(a => {
        const basePrice = a.price || 100;
        cachedTickers[a.symbol] = {
          symbol: a.symbol,
          price: basePrice,
          change24h: a.change24h || 0,
          high24h: a.high24h || basePrice * 1.02,
          low24h: a.low24h || basePrice * 0.98,
          volume24h: a.volume24h || 1000000,
          quoteVolume: a.volume24h || 1000000,
          isPositive: (a.change24h || 0) >= 0,
          marketCap: a.marketCap,
          marketCapFormatted: a.marketCapFormatted,
          volume24hFormatted: a.volume24hFormatted
        };
      });
    }
  }

  return cachedTickers;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get('symbol');

  const tickers = await fetchLiveBinanceTickers();

  if (symbol) {
    const clean = symbol.replace('-', '/').toUpperCase();
    const item = tickers[clean];
    if (item) {
      return NextResponse.json({ success: true, ticker: item });
    }
    return NextResponse.json({ success: false, error: 'Symbol not found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    count: Object.keys(tickers).length,
    tickers,
    timestamp: Date.now()
  });
}
