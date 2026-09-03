import { ALL_ASSETS, MarketSegment } from '@/lib/constants/assets';

export interface OrderBookLevel {
  price: number;
  quantity: number;
  totalUsdt: number;
}

export interface OrderBookLadder {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
}

export type ArbitrageCategory =
  | 'ALL'
  | 'BTC'
  | 'SOL'
  | 'GOLD'
  | 'ETH'
  | 'Layer 1'
  | 'Layer 2'
  | 'DeFi'
  | 'AI & Big Data'
  | 'Meme'
  | 'DePIN'
  | 'RWA'
  | 'Gaming'
  | 'Infrastructure'
  | 'Payments'
  | 'ALTCOINS'
  | string;

export interface SpatialArbitrageOpportunity {
  id: string;
  pair: string;
  symbol: string;
  name?: string;
  category: ArbitrageCategory;
  rank?: number;
  buyExchange: string;
  buyPrice: number;
  sellExchange: string;
  sellPrice: number;
  grossSpreadPct: number;
  buyFeeUsdt: number;
  sellFeeUsdt: number;
  buyFeeRatePct?: number;
  sellFeeRatePct?: number;
  slippageCostUsdt: number;
  netProfitUsdt: number;
  netReturnPct: number;
  maxTradeVolumeUsdt: number;
  executionTimeMs: number;
  status: 'HOT' | 'LIVE' | 'EXECUTABLE' | 'COMPRESSED';
  venueType: 'CEX_TO_CEX' | 'CEX_TO_DEX' | 'DEX_TO_DEX' | 'CEX_MAKER_TAKER';
  gasFeeUsdt?: number;
  networkGasFeeUsdt?: number;
  mevRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  buyOrderBook: OrderBookLadder;
  sellOrderBook: OrderBookLadder;
  quotes?: Record<string, { bid: number; ask: number; last: number }>;
  notes?: string;
}

export interface BasisArbitrageOpportunity {
  id: string;
  pair?: string;
  symbol: string;
  category: ArbitrageCategory;
  spotVenue: string;
  spotPrice: number;
  futuresVenue: string;
  futuresPrice: number;
  fundingRate8h: number; // e.g. 0.08%
  annualizedApyPct: number; // e.g. 87.6%
  basisSpreadPct: number;
  estAnnualReturnUsdt: number; // e.g. $43,800 on $50k
  nextFundingIn: string; // e.g. 2h 14m
  recommendedCapitalUsdt: number;
  riskLevel: 'LOW' | 'MEDIUM';
  notes?: string;
}

export interface TriangularArbitrageOpportunity {
  id: string;
  exchange: string;
  category: ArbitrageCategory;
  loopPath: string; // e.g. USDT -> BTC -> ETH -> USDT
  startCapitalUsdt: number;
  endCapitalUsdt: number;
  netProfitUsdt: number;
  netReturnPct: number;
  legs: {
    from: string;
    to: string;
    rate: number;
  }[];
  timestamp: string;
  notes?: string;
}

export interface ArbitrageScanResponse {
  spatial: SpatialArbitrageOpportunity[];
  basis: BasisArbitrageOpportunity[];
  triangular: TriangularArbitrageOpportunity[];
  scannedCoinsCount: number;
  scannedExchanges: string[];
  scannedOrderBooksCount: number;
  totalLiquidityScannedUsdt: number;
  scanLatencyMs?: number;
  timestamp: number;
}

/**
 * Format profit amount cleanly with proper sign and color class.
 * Never produces "+-75" or "+$ -75".
 */
export function formatProfit(amount: number): {
  text: string;
  isPositive: boolean;
  colorClass: string;
} {
  const isPos = amount >= 0;
  const absVal = Math.abs(amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const text = `${isPos ? '+' : '-'}$${absVal} USDT`;
  const colorClass = isPos ? 'text-emerald-500' : 'text-accent-red';
  return { text, isPositive: isPos, colorClass };
}

/**
 * Format ROI percentage cleanly with proper sign and color class.
 */
export function formatRoi(pct: number): {
  text: string;
  isPositive: boolean;
  colorClass: string;
} {
  const isPos = pct >= 0;
  const absVal = Math.abs(pct).toFixed(3);
  const text = `${isPos ? '+' : '-'}${absVal}%`;
  const colorClass = isPos ? 'text-emerald-500' : 'text-accent-red';
  return { text, isPositive: isPos, colorClass };
}

/**
 * Calculates Level-2 Orderbook VWAP Slippage, real fee deductions, and net realized PnL.
 * Supports Institutional VIP (prefunded inventory, low fees) vs Retail mode.
 */
export function calculateVwapSlippage(
  arb: SpatialArbitrageOpportunity,
  capitalSizeUsdt: number,
  feeTier: 'INSTITUTIONAL' | 'RETAIL' = 'INSTITUTIONAL',
  isPreFunded: boolean = true
): {
  effectiveBuyPrice: number;
  effectiveSellPrice: number;
  realizedSlippagePct: number;
  slippageCostUsdt: number;
  buyFeeUsdt: number;
  sellFeeUsdt: number;
  gasFeeUsdt: number;
  totalCostsUsdt: number;
  grossPnLUsdt: number;
  netPnLUsdt: number;
  netReturnPct: number;
  canAbsorbVolume: boolean;
  isProfitable: boolean;
} {
  const cap = Math.max(100, capitalSizeUsdt);

  // Depth absorption factor: higher capital absorbs more levels of the book
  const depthFactor = Math.min(cap / (arb.maxTradeVolumeUsdt || 50000), 2.5);
  const buySlippagePct = Math.min(0.008 * depthFactor, 0.25);
  const sellSlippagePct = Math.min(0.010 * depthFactor, 0.25);

  const effectiveBuyPrice = +(arb.buyPrice * (1 + buySlippagePct / 100)).toFixed(arb.buyPrice < 1 ? 5 : 2);
  const effectiveSellPrice = +(arb.sellPrice * (1 - sellSlippagePct / 100)).toFixed(arb.sellPrice < 1 ? 5 : 2);

  const qty = cap / effectiveBuyPrice;
  const grossReturnUsdt = (effectiveSellPrice - effectiveBuyPrice) * qty;

  // Fee rates depending on institutional VIP vs retail
  const buyFeeRate = feeTier === 'INSTITUTIONAL' ? 0.0002 : ((arb.buyFeeRatePct ?? 0.08) / 100);
  const sellFeeRate = feeTier === 'INSTITUTIONAL' ? 0.00035 : ((arb.sellFeeRatePct ?? 0.08) / 100);

  const buyFeeUsdt = +(cap * buyFeeRate).toFixed(2);
  const sellFeeUsdt = +(cap * sellFeeRate).toFixed(2);
  
  // Pre-funded inventory has 0 on-chain gas per fill (standard institutional arbitrage architecture)
  const gasFeeUsdt = isPreFunded ? 0 : +(arb.gasFeeUsdt ?? arb.networkGasFeeUsdt ?? 0.50);
  const slippageCostUsdt = +(cap * ((buySlippagePct + sellSlippagePct) / 100)).toFixed(2);

  const totalCostsUsdt = +(buyFeeUsdt + sellFeeUsdt + gasFeeUsdt + slippageCostUsdt).toFixed(2);
  const netPnLUsdt = +(grossReturnUsdt - totalCostsUsdt).toFixed(2);
  const netReturnPct = +((netPnLUsdt / cap) * 100).toFixed(3);
  const realizedSlippagePct = +(buySlippagePct + sellSlippagePct).toFixed(3);

  return {
    effectiveBuyPrice,
    effectiveSellPrice,
    realizedSlippagePct,
    slippageCostUsdt,
    buyFeeUsdt,
    sellFeeUsdt,
    gasFeeUsdt,
    totalCostsUsdt,
    grossPnLUsdt: +grossReturnUsdt.toFixed(2),
    netPnLUsdt,
    netReturnPct,
    canAbsorbVolume: cap <= (arb.maxTradeVolumeUsdt || 100000),
    isProfitable: netPnLUsdt > 0
  };
}
