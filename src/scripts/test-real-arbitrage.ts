import { ALL_ASSETS } from '../lib/constants/assets';

async function testLiveArbitrage() {
  console.log("Starting Live Multi-Exchange Arbitrage Fetch...");
  const t0 = Date.now();

  const [
    binanceBookRes,
    binance24hRes,
    binanceFuturesRes,
    okxSpotRes,
    bybitSpotRes,
    bybitLinearRes,
    gateSpotRes,
    coinbaseRes,
    krakenRes
  ] = await Promise.allSettled([
    fetch('https://api.binance.com/api/v3/ticker/bookTicker', {
      headers: { 'User-Agent': 'AlgoRush/1.0' },
      signal: AbortSignal.timeout(4000)
    }).then(r => r.json()),
    fetch('https://api.binance.com/api/v3/ticker/24hr', {
      headers: { 'User-Agent': 'AlgoRush/1.0' },
      signal: AbortSignal.timeout(4000)
    }).then(r => r.json()),
    fetch('https://fapi.binance.com/fapi/v1/premiumIndex', {
      headers: { 'User-Agent': 'AlgoRush/1.0' },
      signal: AbortSignal.timeout(4000)
    }).then(r => r.json()),
    fetch('https://www.okx.com/api/v5/market/tickers?instType=SPOT', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(4000)
    }).then(r => r.json()),
    fetch('https://api.bybit.com/v5/market/tickers?category=spot', {
      headers: { 'User-Agent': 'AlgoRush/1.0' },
      signal: AbortSignal.timeout(4000)
    }).then(r => r.json()),
    fetch('https://api.bybit.com/v5/market/tickers?category=linear', {
      headers: { 'User-Agent': 'AlgoRush/1.0' },
      signal: AbortSignal.timeout(4000)
    }).then(r => r.json()),
    fetch('https://api.gateio.ws/api/v4/spot/tickers', {
      headers: { 'User-Agent': 'AlgoRush/1.0' },
      signal: AbortSignal.timeout(4000)
    }).then(r => r.json()),
    fetch('https://api.coinbase.com/v2/exchange-rates?currency=USD', {
      headers: { 'User-Agent': 'AlgoRush/1.0' },
      signal: AbortSignal.timeout(4000)
    }).then(r => r.json()),
    fetch('https://api.kraken.com/0/public/Ticker?pair=XBTUSDT,ETHUSDT,SOLUSDT,XRPUSDT,ADAUSDT,DOGEUSDT,AVAXUSDT,DOTUSDT,LINKUSDT,LTCUSDT', {
      headers: { 'User-Agent': 'AlgoRush/1.0' },
      signal: AbortSignal.timeout(4000)
    }).then(r => r.json()).catch(() => null)
  ]);

  console.log(`Fetches completed in ${Date.now() - t0}ms`);
  console.log(`Binance Book: ${binanceBookRes.status}`);
  console.log(`Binance 24h: ${binance24hRes.status}`);
  console.log(`Binance Futures: ${binanceFuturesRes.status}`);
  console.log(`OKX: ${okxSpotRes.status}`);
  console.log(`Bybit Spot: ${bybitSpotRes.status}`);
  console.log(`Bybit Linear: ${bybitLinearRes.status}`);
  console.log(`Gate.io: ${gateSpotRes.status}`);
  console.log(`Coinbase: ${coinbaseRes.status}`);
  console.log(`Kraken: ${krakenRes.status}`);

  // 1. Process Binance Spot
  const binanceQuotes: Record<string, { bid: number; ask: number; bidQty: number; askQty: number; last: number; quoteVol: number }> = {};
  if (binanceBookRes.status === 'fulfilled' && Array.isArray(binanceBookRes.value)) {
    binanceBookRes.value.forEach((t: any) => {
      if (t.symbol) {
        binanceQuotes[t.symbol] = {
          bid: parseFloat(t.bidPrice) || 0,
          ask: parseFloat(t.askPrice) || 0,
          bidQty: parseFloat(t.bidQty) || 0,
          askQty: parseFloat(t.askQty) || 0,
          last: (parseFloat(t.bidPrice) + parseFloat(t.askPrice)) / 2 || 0,
          quoteVol: 0
        };
      }
    });
  }

  if (binance24hRes.status === 'fulfilled' && Array.isArray(binance24hRes.value)) {
    binance24hRes.value.forEach((t: any) => {
      if (t.symbol && binanceQuotes[t.symbol]) {
        binanceQuotes[t.symbol].last = parseFloat(t.lastPrice) || binanceQuotes[t.symbol].last;
        binanceQuotes[t.symbol].quoteVol = parseFloat(t.quoteVolume) || 0;
      }
    });
  }

  // 2. OKX
  const okxQuotes: Record<string, { bid: number; ask: number; bidQty: number; askQty: number; last: number; quoteVol: number }> = {};
  if (okxSpotRes.status === 'fulfilled' && okxSpotRes.value?.data && Array.isArray(okxSpotRes.value.data)) {
    okxSpotRes.value.data.forEach((t: any) => {
      if (t.instId && t.instId.endsWith('-USDT')) {
        const sym = t.instId.replace('-', '');
        const bid = parseFloat(t.bidPx) || 0;
        const ask = parseFloat(t.askPx) || 0;
        okxQuotes[sym] = {
          bid,
          ask,
          bidQty: parseFloat(t.bidSz) || 0,
          askQty: parseFloat(t.askSz) || 0,
          last: parseFloat(t.last) || (bid + ask) / 2,
          quoteVol: parseFloat(t.volCcy24h) || 0
        };
      }
    });
  }

  // 3. Bybit Spot
  const bybitQuotes: Record<string, { bid: number; ask: number; bidQty: number; askQty: number; last: number; quoteVol: number }> = {};
  if (bybitSpotRes.status === 'fulfilled' && bybitSpotRes.value?.result?.list) {
    bybitSpotRes.value.result.list.forEach((t: any) => {
      if (t.symbol && t.symbol.endsWith('USDT')) {
        const bid = parseFloat(t.bid1Price) || 0;
        const ask = parseFloat(t.ask1Price) || 0;
        bybitQuotes[t.symbol] = {
          bid,
          ask,
          bidQty: parseFloat(t.bid1Size) || 0,
          askQty: parseFloat(t.ask1Size) || 0,
          last: parseFloat(t.lastPrice) || (bid + ask) / 2,
          quoteVol: parseFloat(t.volume24h) || 0
        };
      }
    });
  }

  // 4. Gate.io
  const gateQuotes: Record<string, { bid: number; ask: number; bidQty: number; askQty: number; last: number; quoteVol: number }> = {};
  if (gateSpotRes.status === 'fulfilled' && Array.isArray(gateSpotRes.value)) {
    gateSpotRes.value.forEach((t: any) => {
      if (t.currency_pair && t.currency_pair.endsWith('_USDT')) {
        const sym = t.currency_pair.replace('_', '');
        const bid = parseFloat(t.highest_bid) || 0;
        const ask = parseFloat(t.lowest_ask) || 0;
        gateQuotes[sym] = {
          bid,
          ask,
          bidQty: parseFloat(t.base_volume) || 0,
          askQty: parseFloat(t.base_volume) || 0,
          last: parseFloat(t.last) || (bid + ask) / 2,
          quoteVol: parseFloat(t.quote_volume) || 0
        };
      }
    });
  }

  // 5. Kraken
  const krakenQuotes: Record<string, { bid: number; ask: number; bidQty: number; askQty: number; last: number; quoteVol: number }> = {};
  if (krakenRes.status === 'fulfilled' && krakenRes.value?.result) {
    const res = krakenRes.value.result;
    const mapping: Record<string, string> = {
      'XBTUSDT': 'BTCUSDT',
      'ETHUSDT': 'ETHUSDT',
      'SOLUSDT': 'SOLUSDT',
      'XRPUSDT': 'XRPUSDT',
      'ADAUSDT': 'ADAUSDT',
      'XDGUSDT': 'DOGEUSDT',
      'AVAXUSDT': 'AVAXUSDT',
      'DOTUSDT': 'DOTUSDT',
      'LINKUSDT': 'LINKUSDT',
      'LTCUSDT': 'LTCUSDT'
    };
    Object.keys(res).forEach((pairKey) => {
      const normalized = mapping[pairKey] || pairKey;
      const data = res[pairKey];
      if (data && data.a && data.b) {
        const ask = parseFloat(data.a[0]) || 0;
        const bid = parseFloat(data.b[0]) || 0;
        const last = parseFloat(data.c?.[0]) || (ask + bid) / 2;
        const vol = parseFloat(data.v?.[1]) || 0;
        krakenQuotes[normalized] = {
          bid,
          ask,
          bidQty: parseFloat(data.b[2]) || 1,
          askQty: parseFloat(data.a[2]) || 1,
          last,
          quoteVol: vol * last
        };
      }
    });
  }

  // 6. Coinbase Rates
  const coinbaseRates: Record<string, number> = {};
  if (coinbaseRes.status === 'fulfilled' && coinbaseRes.value?.data?.rates) {
    const rates = coinbaseRes.value.data.rates;
    Object.keys(rates).forEach((k) => {
      const r = parseFloat(rates[k]);
      if (r > 0) {
        coinbaseRates[k.toUpperCase()] = 1 / r;
      }
    });
  }

  console.log(`Binance Symbols: ${Object.keys(binanceQuotes).length}`);
  console.log(`OKX Symbols: ${Object.keys(okxQuotes).length}`);
  console.log(`Bybit Symbols: ${Object.keys(bybitQuotes).length}`);
  console.log(`Gate.io Symbols: ${Object.keys(gateQuotes).length}`);
  console.log(`Kraken Symbols: ${Object.keys(krakenQuotes).length}`);
  console.log(`Coinbase Symbols: ${Object.keys(coinbaseRates).length}`);

  // Test real cross-exchange spreads across ALL_ASSETS
  let totalOpportunities = 0;
  let profitableCount = 0;
  let compressedCount = 0;
  const sampleDislocations: any[] = [];

  ALL_ASSETS.forEach((asset) => {
    const baseSym = asset.symbol.split('/')[0].toUpperCase();
    const rawSym = `${baseSym}USDT`;

    const candidates: { exchange: string; bid: number; ask: number; last: number; bidQty: number; askQty: number; quoteVol: number }[] = [];

    if (binanceQuotes[rawSym]?.bid > 0 && binanceQuotes[rawSym]?.ask > 0) {
      candidates.push({ exchange: 'Binance', ...binanceQuotes[rawSym] });
    }
    if (okxQuotes[rawSym]?.bid > 0 && okxQuotes[rawSym]?.ask > 0) {
      candidates.push({ exchange: 'OKX', ...okxQuotes[rawSym] });
    }
    if (bybitQuotes[rawSym]?.bid > 0 && bybitQuotes[rawSym]?.ask > 0) {
      candidates.push({ exchange: 'Bybit', ...bybitQuotes[rawSym] });
    }
    if (gateQuotes[rawSym]?.bid > 0 && gateQuotes[rawSym]?.ask > 0) {
      candidates.push({ exchange: 'Gate.io', ...gateQuotes[rawSym] });
    }
    if (krakenQuotes[rawSym]?.bid > 0 && krakenQuotes[rawSym]?.ask > 0) {
      candidates.push({ exchange: 'Kraken', ...krakenQuotes[rawSym] });
    }
    if (coinbaseRates[baseSym] && coinbaseRates[baseSym] > 0) {
      const mid = coinbaseRates[baseSym];
      candidates.push({
        exchange: 'Coinbase',
        bid: +(mid * 0.9995).toFixed(mid < 1 ? 5 : 2),
        ask: +(mid * 1.0005).toFixed(mid < 1 ? 5 : 2),
        last: mid,
        bidQty: 2,
        askQty: 2,
        quoteVol: 250000
      });
    }

    if (candidates.length < 2) return;

    // Calculate median last price
    const sortedPrices = [...candidates].map(c => c.last).sort((a, b) => a - b);
    const midIdx = Math.floor(sortedPrices.length / 2);
    const medianPrice = sortedPrices.length % 2 !== 0 ? sortedPrices[midIdx] : (sortedPrices[midIdx - 1] + sortedPrices[midIdx]) / 2;

    // Filter genuine quotes within 5% of live median (rejects decimal scale mismatches like SHIB/1000SHIB)
    const validQuotes = candidates.filter(c => {
      if (c.bid <= 0 || c.ask <= 0 || c.bid > c.ask * 1.05) return false;
      const diff = Math.abs(c.last - medianPrice) / medianPrice;
      return diff <= 0.05;
    });

    if (validQuotes.length < 2) return;

    // Real best buy (lowest ask) and real best sell (highest bid)
    let bestBuy = validQuotes[0];
    let bestSell = validQuotes[1];

    validQuotes.forEach(q => {
      if (q.ask < bestBuy.ask) bestBuy = q;
      if (q.bid > bestSell.bid) bestSell = q;
    });

    // If best buy and best sell are same venue, pick second best
    if (bestBuy.exchange === bestSell.exchange) {
      const otherBuys = validQuotes.filter(q => q.exchange !== bestSell.exchange);
      const otherSells = validQuotes.filter(q => q.exchange !== bestBuy.exchange);
      if (otherBuys.length > 0 && otherSells.length > 0) {
        let altBuy = otherBuys[0];
        otherBuys.forEach(q => { if (q.ask < altBuy.ask) altBuy = q; });
        let altSell = otherSells[0];
        otherSells.forEach(q => { if (q.bid > altSell.bid) altSell = q; });

        const spreadWithAltBuy = ((bestSell.bid - altBuy.ask) / altBuy.ask) * 100;
        const spreadWithAltSell = ((altSell.bid - bestBuy.ask) / bestBuy.ask) * 100;

        if (spreadWithAltBuy > spreadWithAltSell) {
          bestBuy = altBuy;
        } else {
          bestSell = altSell;
        }
      } else {
        return;
      }
    }

    const grossSpreadPct = +(((bestSell.bid - bestBuy.ask) / bestBuy.ask) * 100).toFixed(3);
    // Sanity filter: real spot cross-venue spreads are typically between -1% and +4.5%.
    // Spreads > 5% are artifact unit differences (e.g. 1000SHIB or currency rate rounding).
    if (grossSpreadPct > 5.0 || grossSpreadPct < -2.0) return;
    const netSpreadPct = +(grossSpreadPct - 0.07).toFixed(3); // ~0.07% total fees

    totalOpportunities++;
    if (netSpreadPct > 0) {
      profitableCount++;
      if (sampleDislocations.length < 10) {
        sampleDislocations.push({
          pair: asset.symbol,
          buyVenue: `${bestBuy.exchange} @ $${bestBuy.ask}`,
          sellVenue: `${bestSell.exchange} @ $${bestSell.bid}`,
          grossSpread: `${grossSpreadPct}%`,
          netSpread: `${netSpreadPct}%`,
          venuesCount: validQuotes.length
        });
      }
    } else {
      compressedCount++;
    }
  });

  console.log(`\n--- Real Spatial Arbitrage Results ---`);
  console.log(`Total Scanned Multi-Exchange Pairs: ${totalOpportunities}`);
  console.log(`Net Profitable Pairs (>0.07% fees): ${profitableCount}`);
  console.log(`Compressed/Break-even Pairs: ${compressedCount}`);
  console.log(`\nSample Real Arbitrage Dislocations:`);
  console.table(sampleDislocations);

  // Dynamic Live Triangular Arbitrage on Binance
  console.log(`\n--- Real Dynamic Triangular Arbitrage on Binance ---`);
  const startCapital = 50000;
  const feeRate = 0.00035; // VIP fee per leg

  const loops = [
    { base: 'BTC', intermediate: 'ETH', intermediatePair: 'ETHBTC', reverse: false },
    { base: 'BTC', intermediate: 'SOL', intermediatePair: 'SOLBTC', reverse: false },
    { base: 'BTC', intermediate: 'BNB', intermediatePair: 'BNBBTC', reverse: false },
    { base: 'BTC', intermediate: 'XRP', intermediatePair: 'XRPBTC', reverse: false },
    { base: 'BTC', intermediate: 'ADA', intermediatePair: 'ADABTC', reverse: false },
    { base: 'BTC', intermediate: 'DOGE', intermediatePair: 'DOGEBTC', reverse: false },
  ];

  const triResults: any[] = [];
  loops.forEach((loop) => {
    const pair1 = `${loop.base}USDT`;
    const pair2 = loop.intermediatePair;
    const pair3 = `${loop.intermediate}USDT`;

    const q1 = binanceQuotes[pair1];
    const q2 = binanceQuotes[pair2];
    const q3 = binanceQuotes[pair3];

    if (!q1 || !q2 || !q3) return;

    // Path A: USDT -> Base (BTC) -> Intermediate (ETH) -> USDT
    // Step 1: Buy Base with USDT at ask
    const baseAmt = (startCapital / q1.ask) * (1 - feeRate);
    // Step 2: Buy Intermediate with Base at ask (e.g. buy ETH with BTC at ETHBTC ask)
    const interAmt = (baseAmt / q2.ask) * (1 - feeRate);
    // Step 3: Sell Intermediate for USDT at bid
    const finalUsdtA = (interAmt * q3.bid) * (1 - feeRate);
    const netReturnPctA = +(((finalUsdtA - startCapital) / startCapital) * 100).toFixed(3);
    const netProfitA = +(finalUsdtA - startCapital).toFixed(2);

    // Path B: USDT -> Intermediate (ETH) -> Base (BTC) -> USDT
    // Step 1: Buy Intermediate with USDT at ask
    const interAmtB = (startCapital / q3.ask) * (1 - feeRate);
    // Step 2: Sell Intermediate for Base at bid (sell ETH for BTC at ETHBTC bid)
    const baseAmtB = (interAmtB * q2.bid) * (1 - feeRate);
    // Step 3: Sell Base for USDT at bid
    const finalUsdtB = (baseAmtB * q1.bid) * (1 - feeRate);
    const netReturnPctB = +(((finalUsdtB - startCapital) / startCapital) * 100).toFixed(3);
    const netProfitB = +(finalUsdtB - startCapital).toFixed(2);

    const bestPath = netReturnPctA >= netReturnPctB ? 'FORWARD' : 'REVERSE';
    const chosenNetReturn = bestPath === 'FORWARD' ? netReturnPctA : netReturnPctB;
    const chosenProfit = bestPath === 'FORWARD' ? netProfitA : netProfitB;
    const pathDesc = bestPath === 'FORWARD'
      ? `USDT → ${loop.base} → ${loop.intermediate} → USDT`
      : `USDT → ${loop.intermediate} → ${loop.base} → USDT`;

    triResults.push({
      path: pathDesc,
      direction: bestPath,
      startCapital: `$${startCapital}`,
      endCapital: `$${(startCapital + chosenProfit).toFixed(2)}`,
      netProfit: `${chosenProfit > 0 ? '+' : ''}$${chosenProfit}`,
      netReturnPct: `${chosenNetReturn}%`,
      rates: `${q1.ask.toFixed(2)} / ${q2.ask.toFixed(6)} / ${q3.bid.toFixed(2)}`
    });
  });

  console.table(triResults);
}

testLiveArbitrage().catch(console.error);
