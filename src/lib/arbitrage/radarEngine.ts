export interface OrderBookLevel {
  price: number;
  quantity: number;
  totalUsdt: number;
}

export interface OrderBookLadder {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
}

export interface SpatialArbitrageOpportunity {
  id: string;
  pair: string;
  buyExchange: string;
  buyPrice: number;
  sellExchange: string;
  sellPrice: number;
  grossSpreadPct: number;
  buyFeeUsdt: number;
  sellFeeUsdt: number;
  slippageCostUsdt: number;
  netProfitUsdt: number;
  netReturnPct: number;
  maxTradeVolumeUsdt: number;
  executionTimeMs: number;
  status: 'HOT' | 'LIVE' | 'EXECUTABLE';
  // L2 Enterprise Extensions
  venueType: 'CEX_TO_CEX' | 'CEX_TO_DEX' | 'DEX_TO_DEX';
  gasFeeUsdt?: number;
  mevRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  buyOrderBook: OrderBookLadder;
  sellOrderBook: OrderBookLadder;
}

export interface BasisArbitrageOpportunity {
  id: string;
  symbol: string;
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
}

export interface TriangularArbitrageOpportunity {
  id: string;
  exchange: string;
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
}

export function scanArbitrageOpportunities(): {
  spatial: SpatialArbitrageOpportunity[];
  basis: BasisArbitrageOpportunity[];
  triangular: TriangularArbitrageOpportunity[];
  scannedExchangesCount: number;
  scannedOrderBooksCount: number;
  totalLiquidityScannedUsdt: number;
} {
  const spatial: SpatialArbitrageOpportunity[] = [
    {
      id: "arb-spatial-1",
      pair: "BTC/USDT",
      buyExchange: "Binance Futures",
      buyPrice: 64180.50,
      sellExchange: "LBank Pro",
      sellPrice: 64390.00,
      grossSpreadPct: 0.326,
      buyFeeUsdt: 5.13,
      sellFeeUsdt: 5.15,
      slippageCostUsdt: 3.20,
      netProfitUsdt: 195.52,
      netReturnPct: 0.195,
      maxTradeVolumeUsdt: 100000,
      executionTimeMs: 12,
      status: "HOT",
      venueType: "CEX_TO_CEX",
      gasFeeUsdt: 0,
      mevRisk: "LOW",
      buyOrderBook: {
        asks: [
          { price: 64180.50, quantity: 1.5, totalUsdt: 96270.75 },
          { price: 64182.00, quantity: 2.8, totalUsdt: 179709.60 },
          { price: 64185.00, quantity: 5.0, totalUsdt: 320925.00 },
          { price: 64190.00, quantity: 10.0, totalUsdt: 641900.00 },
          { price: 64200.00, quantity: 25.0, totalUsdt: 1605000.00 }
        ],
        bids: [
          { price: 64179.00, quantity: 1.2, totalUsdt: 77014.80 },
          { price: 64175.00, quantity: 3.5, totalUsdt: 224612.50 },
          { price: 64170.00, quantity: 8.0, totalUsdt: 513360.00 },
          { price: 64160.00, quantity: 15.0, totalUsdt: 962400.00 },
          { price: 64150.00, quantity: 30.0, totalUsdt: 1924500.00 }
        ]
      },
      sellOrderBook: {
        bids: [
          { price: 64390.00, quantity: 2.1, totalUsdt: 135219.00 },
          { price: 64388.00, quantity: 4.2, totalUsdt: 270429.60 },
          { price: 64385.00, quantity: 7.5, totalUsdt: 482887.50 },
          { price: 64380.00, quantity: 12.0, totalUsdt: 772560.00 },
          { price: 64370.00, quantity: 20.0, totalUsdt: 1287400.00 }
        ],
        asks: [
          { price: 64392.00, quantity: 1.8, totalUsdt: 115905.60 },
          { price: 64395.00, quantity: 3.6, totalUsdt: 231822.00 },
          { price: 64400.00, quantity: 8.5, totalUsdt: 547400.00 },
          { price: 64410.00, quantity: 14.0, totalUsdt: 901740.00 },
          { price: 64420.00, quantity: 22.0, totalUsdt: 1417240.00 }
        ]
      }
    },
    {
      id: "arb-spatial-2",
      pair: "SOL/USDT",
      buyExchange: "OKX Unified",
      buyPrice: 142.20,
      sellExchange: "Bybit Perpetual",
      sellPrice: 142.95,
      grossSpreadPct: 0.527,
      buyFeeUsdt: 12.50,
      sellFeeUsdt: 12.56,
      slippageCostUsdt: 8.40,
      netProfitUsdt: 216.54,
      netReturnPct: 0.433,
      maxTradeVolumeUsdt: 50000,
      executionTimeMs: 15,
      status: "EXECUTABLE",
      venueType: "CEX_TO_CEX",
      gasFeeUsdt: 0,
      mevRisk: "LOW",
      buyOrderBook: {
        asks: [
          { price: 142.20, quantity: 350, totalUsdt: 49770 },
          { price: 142.25, quantity: 800, totalUsdt: 113800 },
          { price: 142.30, quantity: 1500, totalUsdt: 213450 },
          { price: 142.40, quantity: 3000, totalUsdt: 427200 },
          { price: 142.50, quantity: 5000, totalUsdt: 712500 }
        ],
        bids: [
          { price: 142.15, quantity: 300, totalUsdt: 42645 },
          { price: 142.10, quantity: 750, totalUsdt: 106575 },
          { price: 142.00, quantity: 1200, totalUsdt: 170400 },
          { price: 141.90, quantity: 2800, totalUsdt: 397320 },
          { price: 141.80, quantity: 4500, totalUsdt: 638100 }
        ]
      },
      sellOrderBook: {
        bids: [
          { price: 142.95, quantity: 420, totalUsdt: 60039 },
          { price: 142.90, quantity: 950, totalUsdt: 135755 },
          { price: 142.80, quantity: 1800, totalUsdt: 257040 },
          { price: 142.70, quantity: 3200, totalUsdt: 456640 },
          { price: 142.60, quantity: 6000, totalUsdt: 855600 }
        ],
        asks: [
          { price: 143.00, quantity: 400, totalUsdt: 57200 },
          { price: 143.05, quantity: 850, totalUsdt: 121592 },
          { price: 143.10, quantity: 1600, totalUsdt: 228960 },
          { price: 143.20, quantity: 3500, totalUsdt: 501200 },
          { price: 143.30, quantity: 5500, totalUsdt: 788150 }
        ]
      }
    },
    {
      id: "arb-spatial-3",
      pair: "ETH/USDT",
      buyExchange: "Hyperliquid DEX",
      buyPrice: 3415.80,
      sellExchange: "Gate.io Spot",
      sellPrice: 3431.20,
      grossSpreadPct: 0.450,
      buyFeeUsdt: 8.54,
      sellFeeUsdt: 8.57,
      slippageCostUsdt: 5.10,
      netProfitUsdt: 131.79,
      netReturnPct: 0.263,
      maxTradeVolumeUsdt: 50000,
      executionTimeMs: 9,
      status: "HOT",
      venueType: "CEX_TO_DEX",
      gasFeeUsdt: 1.85,
      mevRisk: "MEDIUM",
      buyOrderBook: {
        asks: [
          { price: 3415.80, quantity: 15, totalUsdt: 51237 },
          { price: 3416.50, quantity: 35, totalUsdt: 119577.50 },
          { price: 3417.00, quantity: 80, totalUsdt: 273360 },
          { price: 3418.00, quantity: 150, totalUsdt: 512700 },
          { price: 3420.00, quantity: 300, totalUsdt: 1026000 }
        ],
        bids: [
          { price: 3415.00, quantity: 12, totalUsdt: 40980 },
          { price: 3414.00, quantity: 30, totalUsdt: 102420 },
          { price: 3413.00, quantity: 70, totalUsdt: 238910 },
          { price: 3412.00, quantity: 140, totalUsdt: 477680 },
          { price: 3410.00, quantity: 280, totalUsdt: 954800 }
        ]
      },
      sellOrderBook: {
        bids: [
          { price: 3431.20, quantity: 18, totalUsdt: 61761.60 },
          { price: 3430.50, quantity: 40, totalUsdt: 137220 },
          { price: 3430.00, quantity: 85, totalUsdt: 291550 },
          { price: 3428.00, quantity: 160, totalUsdt: 548480 },
          { price: 3425.00, quantity: 320, totalUsdt: 1096000 }
        ],
        asks: [
          { price: 3432.00, quantity: 16, totalUsdt: 54912 },
          { price: 3433.00, quantity: 38, totalUsdt: 130454 },
          { price: 3434.00, quantity: 90, totalUsdt: 309060 },
          { price: 3435.00, quantity: 170, totalUsdt: 583950 },
          { price: 3440.00, quantity: 350, totalUsdt: 1204000 }
        ]
      }
    }
  ];

  const basis: BasisArbitrageOpportunity[] = [
    {
      id: "basis-1",
      symbol: "BTC/USDT",
      spotVenue: "Binance Spot",
      spotPrice: 64150.00,
      futuresVenue: "Binance Perpetual",
      futuresPrice: 64280.00,
      fundingRate8h: 0.078, // 0.078% per 8h
      annualizedApyPct: 85.41,
      basisSpreadPct: 0.202,
      estAnnualReturnUsdt: 42705.00,
      nextFundingIn: "1h 42m",
      recommendedCapitalUsdt: 50000,
      riskLevel: "LOW"
    },
    {
      id: "basis-2",
      symbol: "SOL/USDT",
      spotVenue: "OKX Spot",
      spotPrice: 142.10,
      futuresVenue: "Bybit Futures",
      futuresPrice: 143.15,
      fundingRate8h: 0.115, // 0.115% per 8h
      annualizedApyPct: 125.92,
      basisSpreadPct: 0.738,
      estAnnualReturnUsdt: 31480.00,
      nextFundingIn: "3h 15m",
      recommendedCapitalUsdt: 25000,
      riskLevel: "LOW"
    },
    {
      id: "basis-3",
      symbol: "ETH/USDT",
      spotVenue: "Coinbase Pro",
      spotPrice: 3412.50,
      futuresVenue: "Hyperliquid DEX",
      futuresPrice: 3426.80,
      fundingRate8h: 0.065,
      annualizedApyPct: 71.17,
      basisSpreadPct: 0.419,
      estAnnualReturnUsdt: 35585.00,
      nextFundingIn: "5h 28m",
      recommendedCapitalUsdt: 50000,
      riskLevel: "LOW"
    }
  ];

  const triangular: TriangularArbitrageOpportunity[] = [
    {
      id: "arb-tri-1",
      exchange: "Binance Spot",
      loopPath: "USDT → BTC → ETH → USDT",
      startCapitalUsdt: 50000,
      endCapitalUsdt: 50142.80,
      netProfitUsdt: 142.80,
      netReturnPct: 0.285,
      legs: [
        { from: "USDT", to: "BTC", rate: 0.00001558 },
        { from: "BTC", to: "ETH", rate: 18.82 },
        { from: "ETH", to: "USDT", rate: 3422.50 }
      ],
      timestamp: "Just now"
    },
    {
      id: "arb-tri-2",
      exchange: "OKX Unified",
      loopPath: "USDT → SOL → ETH → USDT",
      startCapitalUsdt: 25000,
      endCapitalUsdt: 25091.25,
      netProfitUsdt: 91.25,
      netReturnPct: 0.365,
      legs: [
        { from: "USDT", to: "SOL", rate: 0.007032 },
        { from: "SOL", to: "ETH", rate: 0.0416 },
        { from: "ETH", to: "USDT", rate: 3422.50 }
      ],
      timestamp: "3 secs ago"
    }
  ];

  return {
    spatial,
    basis,
    triangular,
    scannedExchangesCount: 62,
    scannedOrderBooksCount: 1420,
    totalLiquidityScannedUsdt: 428500000
  };
}

export function calculateVwapSlippage(
  arb: SpatialArbitrageOpportunity,
  capitalSizeUsdt: number
): {
  effectiveBuyPrice: number;
  effectiveSellPrice: number;
  realizedSlippagePct: number;
  netPnLUsdt: number;
  netReturnPct: number;
  canAbsorbVolume: boolean;
} {
  // Simulate orderbook ladder depth absorption
  let buySlippage = (capitalSizeUsdt / 100000) * 0.05; // 0.05% per $100k
  let sellSlippage = (capitalSizeUsdt / 100000) * 0.06;

  const effectiveBuyPrice = +(arb.buyPrice * (1 + buySlippage / 100)).toFixed(2);
  const effectiveSellPrice = +(arb.sellPrice * (1 - sellSlippage / 100)).toFixed(2);

  const grossReturnUsdt = (effectiveSellPrice - effectiveBuyPrice) * (capitalSizeUsdt / effectiveBuyPrice);
  const totalFees = (capitalSizeUsdt * 0.0005 * 2) + (arb.gasFeeUsdt || 0); // 0.05% taker fee x2
  const netPnLUsdt = +(grossReturnUsdt - totalFees).toFixed(2);
  const netReturnPct = +((netPnLUsdt / capitalSizeUsdt) * 100).toFixed(2);
  const realizedSlippagePct = +(buySlippage + sellSlippage).toFixed(3);

  return {
    effectiveBuyPrice,
    effectiveSellPrice,
    realizedSlippagePct,
    netPnLUsdt,
    netReturnPct,
    canAbsorbVolume: capitalSizeUsdt <= arb.maxTradeVolumeUsdt
  };
}
