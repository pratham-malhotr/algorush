import { StrategyDSL } from '../types/strategy';

export interface OHLCV {
  date: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface BacktestMetrics {
  totalReturn: string;
  winRate: string;
  maxDrawdown: string;
  sharpeRatio: string;
  totalTrades: string;
  avgDuration: string;
  monteCarloVar95?: string; // Value at Risk (95% confidence)
  walkForwardRobustness?: string;
}

export interface EquityPoint {
  date: string;
  value: number;
}

export interface BacktestResult {
  metrics: BacktestMetrics;
  equityCurve: EquityPoint[];
}

// Generate some semi-realistic mock price data (Random Walk)
export function generateMockData(days: number, startPrice: number = 100): OHLCV[] {
  const data: OHLCV[] = [];
  let currentPrice = startPrice;
  const now = Date.now();

  for (let i = days; i >= 0; i--) {
    const timestamp = now - i * 24 * 60 * 60 * 1000;
    const date = new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    const changePercent = (Math.random() - 0.48) * 0.04; // Slight upward bias
    const close = currentPrice * (1 + changePercent);
    const high = Math.max(currentPrice, close) * (1 + Math.random() * 0.02);
    const low = Math.min(currentPrice, close) * (1 - Math.random() * 0.02);
    
    data.push({
      date,
      timestamp,
      open: currentPrice,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 1000000)
    });
    
    currentPrice = close;
  }
  return data;
}

// Very simple MVP backtester that currently fakes execution logic based on the schema
// In a real scenario, this would evaluate the condition tree (RSI, MA, etc.) per candle.
export function runLocalBacktest(strategy: StrategyDSL | null, data: OHLCV[], initialCapital: number = 10000): BacktestResult {
  let equity = initialCapital;
  let maxEquity = equity;
  let maxDrawdownPercent = 0;
  let winningTrades = 0;
  let totalTrades = 0;
  
  const equityCurve: EquityPoint[] = [{ date: data[0].date, value: equity }];
  
  // For MVP: random trading simulation that follows a roughly positive curve if a strategy exists
  let inPosition = false;
  let entryPrice = 0;

  for (let i = 1; i < data.length; i++) {
    const candle = data[i];
    
    if (!inPosition && Math.random() > 0.8) {
      // Enter
      inPosition = true;
      entryPrice = candle.close;
    } else if (inPosition && (Math.random() > 0.8 || i === data.length - 1)) {
      // Exit
      inPosition = false;
      totalTrades++;
      const returnPercent = (candle.close - entryPrice) / entryPrice;
      if (returnPercent > 0) winningTrades++;
      
      const pnl = equity * 0.1 * returnPercent; // assume 10% allocation
      equity += pnl;
    }

    if (equity > maxEquity) maxEquity = equity;
    const drawdown = (maxEquity - equity) / maxEquity;
    if (drawdown > maxDrawdownPercent) maxDrawdownPercent = drawdown;

    equityCurve.push({ date: candle.date, value: Math.round(equity) });
  }

  const totalReturnPercent = ((equity - initialCapital) / initialCapital) * 100;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  
  // Mock Sharpe (pseudo-calculation)
  const sharpe = (totalReturnPercent / 100) / (maxDrawdownPercent || 0.1) * Math.sqrt(252) / 10;

  // --- Advanced Stats (Phase 2 Mock) ---
  // Monte Carlo: Run 1000 simulated paths based on trade returns to find 95% worst case
  const mockMonteCarloVar95 = (maxDrawdownPercent * 1.5 * 100).toFixed(1); 
  // Walk Forward: Compare In-Sample to Out-of-Sample efficiency
  const mockRobustness = (Math.random() * (0.9 - 0.6) + 0.6).toFixed(2); // Score 0 to 1

  return {
    metrics: {
      totalReturn: `${totalReturnPercent >= 0 ? '+' : ''}${totalReturnPercent.toFixed(1)}%`,
      winRate: `${winRate.toFixed(1)}%`,
      maxDrawdown: `-${(maxDrawdownPercent * 100).toFixed(1)}%`,
      sharpeRatio: totalTrades > 0 ? sharpe.toFixed(2) : "0.00",
      totalTrades: totalTrades.toString(),
      avgDuration: "2d 4h", 
      monteCarloVar95: `-${mockMonteCarloVar95}%`,
      walkForwardRobustness: `${Number(mockRobustness) * 100}%`
    },
    equityCurve,
  };
}
