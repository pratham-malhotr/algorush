/**
 * Real-time crypto price service using Binance Public REST API.
 * No API key required — uses public market data endpoints.
 * 
 * Docs: https://binance-docs.github.io/apidocs/spot/en/#symbol-price-ticker
 */

// In-memory cache to avoid hammering the API
let priceCache: Record<string, number> = {};
let lastFetchTime = 0;
const CACHE_TTL_MS = 2000; // 2 second cache

/**
 * Convert our internal symbol format (e.g. "BTC/USDT") 
 * to Binance API format (e.g. "BTCUSDT")
 */
function toBinanceSymbol(symbol: string): string {
  return symbol.replace('/', '').toUpperCase();
}

/**
 * Fetch real-time price for a single symbol from Binance.
 */
export async function fetchPrice(symbol: string): Promise<number | null> {
  try {
    const binanceSymbol = toBinanceSymbol(symbol);
    const res = await fetch(
      `https://api.binance.com/api/v3/ticker/price?symbol=${binanceSymbol}`,
      { next: { revalidate: 0 }, signal: AbortSignal.timeout(3000) }
    );
    
    if (!res.ok) return null;
    
    const data = await res.json();
    const price = parseFloat(data.price);
    
    if (!isNaN(price) && price > 0) {
      priceCache[symbol] = price;
      return price;
    }
    return null;
  } catch {
    // Return cached price if available
    return priceCache[symbol] || null;
  }
}

/**
 * Fetch real-time prices for multiple symbols in a single API call.
 * Uses the bulk ticker endpoint and filters to requested symbols.
 */
export async function fetchPrices(symbols: string[]): Promise<Record<string, number>> {
  const now = Date.now();
  
  // Return cache if still fresh
  if (now - lastFetchTime < CACHE_TTL_MS) {
    const cached: Record<string, number> = {};
    let allCached = true;
    for (const s of symbols) {
      if (priceCache[s]) {
        cached[s] = priceCache[s];
      } else {
        allCached = false;
      }
    }
    if (allCached) return cached;
  }

  try {
    // Build query for specific symbols to reduce payload
    const binanceSymbols = symbols.map(toBinanceSymbol);
    const queryParam = JSON.stringify(binanceSymbols);
    
    const res = await fetch(
      `https://api.binance.com/api/v3/ticker/price?symbols=${encodeURIComponent(queryParam)}`,
      { next: { revalidate: 0 }, signal: AbortSignal.timeout(4000) }
    );
    
    if (!res.ok) {
      // Fallback: try fetching individually
      return await fetchPricesIndividually(symbols);
    }
    
    const data: Array<{ symbol: string; price: string }> = await res.json();
    const result: Record<string, number> = {};
    
    for (const ticker of data) {
      const price = parseFloat(ticker.price);
      if (!isNaN(price) && price > 0) {
        // Find the original symbol format
        const originalSymbol = symbols.find(
          s => toBinanceSymbol(s) === ticker.symbol
        );
        if (originalSymbol) {
          result[originalSymbol] = price;
          priceCache[originalSymbol] = price;
        }
      }
    }
    
    lastFetchTime = Date.now();
    return result;
  } catch {
    // On network failure, return last known prices
    return fetchPricesIndividually(symbols);
  }
}

/**
 * Fallback: fetch prices one by one (used when bulk endpoint fails)
 */
async function fetchPricesIndividually(symbols: string[]): Promise<Record<string, number>> {
  const result: Record<string, number> = {};
  
  await Promise.allSettled(
    symbols.map(async (symbol) => {
      const price = await fetchPrice(symbol);
      if (price !== null) {
        result[symbol] = price;
      } else if (priceCache[symbol]) {
        result[symbol] = priceCache[symbol];
      }
    })
  );
  
  return result;
}

/**
 * Get the last known cached price for a symbol.
 * Returns null if no price has ever been fetched.
 */
export function getCachedPrice(symbol: string): number | null {
  return priceCache[symbol] || null;
}

/**
 * Get static fallback prices for when Binance API is completely unreachable.
 * These are approximate prices and should only be used as a last resort.
 */
export function getFallbackPrice(symbol: string): number {
  const fallbacks: Record<string, number> = {
    'BTC/USDT': 67500,
    'ETH/USDT': 3500,
    'SOL/USDT': 145,
    'XRP/USDT': 0.58,
    'BNB/USDT': 590,
    'ADA/USDT': 0.45,
    'DOGE/USDT': 0.12,
    'DOT/USDT': 6.8,
    'AVAX/USDT': 28,
    'LINK/USDT': 14,
    'MATIC/USDT': 0.65,
    'UNI/USDT': 7.5,
    'ATOM/USDT': 9.2,
    'LTC/USDT': 72,
    'FIL/USDT': 4.8,
    'ARB/USDT': 0.85,
    'OP/USDT': 1.9,
    'APT/USDT': 7.2,
    'SUI/USDT': 1.1,
    'NEAR/USDT': 5.2,
    'TRX/USDT': 0.16,
    'PEPE/USDT': 0.000012,
    'SHIB/USDT': 0.000018,
  };
  
  return fallbacks[symbol] || priceCache[symbol] || 100;
}
