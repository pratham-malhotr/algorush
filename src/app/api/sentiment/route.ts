import { NextResponse } from 'next/server';

export interface NewsItem {
  id: string;
  headline: string;
  source: string;
  category: 'MACRO' | 'CRYPTO' | 'EQUITIES' | 'REGULATORY';
  timestamp: string;
  sentimentScore: number; // -1.0 (extremely bearish) to +1.0 (extremely bullish)
  confidence: number; // 0% to 100%
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  relatedSymbols: string[];
  summary: string;
}

const MOCK_NEWS_ITEMS: NewsItem[] = [
  {
    id: "news-1",
    headline: "Federal Reserve Signals Rate Cuts as Inflation Drops Below 2.1% Target",
    source: "Bloomberg Terminals",
    category: "MACRO",
    timestamp: "2 mins ago",
    sentimentScore: 0.85,
    confidence: 94,
    impact: "HIGH",
    relatedSymbols: ["BTC/USDT", "ETH/USDT", "AAPL", "NVDA"],
    summary: "FOMC dot plot projection shows 75bps rate cuts planned over coming quarters. Risk assets rally sharply."
  },
  {
    id: "news-2",
    headline: "Institutional Bitcoin ETF Inflows Exceed $1.2B in Single Day Record",
    source: "Coindesk Research",
    category: "CRYPTO",
    timestamp: "8 mins ago",
    sentimentScore: 0.92,
    confidence: 98,
    impact: "HIGH",
    relatedSymbols: ["BTC/USDT"],
    summary: "Record institutional net inflows led by BlackRock IBIT and Fidelity FBTC propel Bitcoin market depth."
  },
  {
    id: "news-3",
    headline: "SEC Formally Approves First Solana Spot ETFs for US Public Trading",
    source: "Reuters Financial",
    category: "REGULATORY",
    timestamp: "14 mins ago",
    sentimentScore: 0.88,
    confidence: 91,
    impact: "HIGH",
    relatedSymbols: ["SOL/USDT"],
    summary: "Regulatory approval paves the way for direct institutional staking and spot trading of Solana."
  },
  {
    id: "news-4",
    headline: "European Central Bank Maintains Strict Capital Liquidity Buffer Requirements",
    source: "Financial Times",
    category: "MACRO",
    timestamp: "28 mins ago",
    sentimentScore: -0.15,
    confidence: 82,
    impact: "MEDIUM",
    relatedSymbols: ["EUR/USD"],
    summary: "ECB maintains current interest rate corridor while monitoring eurozone manufacturing PMI outputs."
  },
  {
    id: "news-5",
    headline: "NVIDIA Quarterly AI Data Center Revenue Exceeds Analyst Estimates by 34%",
    source: "Wall Street Journal",
    category: "EQUITIES",
    timestamp: "45 mins ago",
    sentimentScore: 0.94,
    confidence: 99,
    impact: "HIGH",
    relatedSymbols: ["NVDA", "AAPL"],
    summary: "Enterprise AI hardware demand pushes quarterly GPU revenue to all-time highs."
  }
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get('symbol');

  let items = MOCK_NEWS_ITEMS;
  if (symbol) {
    items = items.filter(n => n.relatedSymbols.some(s => s.toLowerCase().includes(symbol.toLowerCase())));
  }

  // Calculate composite market sentiment index (-100 to +100)
  const compositeScore = items.reduce((acc, curr) => acc + curr.sentimentScore, 0) / (items.length || 1);
  const normalizedIndex = Math.round(compositeScore * 100);

  return NextResponse.json({
    status: 'SUCCESS',
    marketSentimentIndex: normalizedIndex, // e.g. +78 (Extreme Bullish)
    sentimentLabel: normalizedIndex > 50 ? 'EXTREME_BULLISH' : normalizedIndex > 15 ? 'BULLISH' : normalizedIndex < -50 ? 'EXTREME_BEARISH' : normalizedIndex < -15 ? 'BEARISH' : 'NEUTRAL',
    totalArticles: items.length,
    articles: items,
    timestamp: new Date().toISOString()
  });
}
