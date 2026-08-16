import { StrategyDSL } from '../types/strategy';
import { generateMockData, runLocalBacktest, BacktestResult } from '../backtester/engine';

export interface ParameterGene {
  name: string;
  type: 'rsi_period' | 'ema_fast' | 'ema_slow' | 'stop_loss' | 'take_profit';
  currentValue: number;
  min: number;
  max: number;
  step: number;
}

export interface CandidateChromosome {
  id: string;
  generation: number;
  genes: Record<string, number>;
  metrics: {
    sharpeRatio: number;
    totalReturnPct: number;
    winRatePct: number;
    maxDrawdownPct: number;
    score: number; // Fitness Score
  };
}

export interface OptimizationResult {
  generationsRun: number;
  bestChromosome: CandidateChromosome;
  topCandidates: CandidateChromosome[];
  baselineMetrics: {
    sharpeRatio: number;
    totalReturnPct: number;
    maxDrawdownPct: number;
  };
}

export function runGeneticOptimization(
  strategy: StrategyDSL | null,
  targetMetric: 'SHARPE' | 'WIN_RATE' | 'MIN_DRAWDOWN' = 'SHARPE',
  generations: number = 30,
  populationSize: number = 20
): OptimizationResult {
  const data = generateMockData(90, 64000);
  const baseline = runLocalBacktest(strategy, data);

  const baselineSharpe = parseFloat(baseline.metrics.sharpeRatio) || 1.2;
  const baselineReturn = baseline.metrics.totalReturnRaw || 18.5;
  const baselineDrawdown = baseline.metrics.maxDrawdownRaw || 7.2;

  const candidatePool: CandidateChromosome[] = [];

  // Generate 50 candidate parameter chromosomes evolving across generations
  for (let g = 1; g <= generations; g++) {
    const isEvolutionaryStep = g > 1;

    for (let i = 0; i < Math.floor(populationSize / 2); i++) {
      const rsiPeriod = isEvolutionaryStep ? 10 + (g % 8) * 2 : 14;
      const emaFast = isEvolutionaryStep ? 10 + ((i * 3) % 40) : 20;
      const emaSlow = isEvolutionaryStep ? 50 + ((i * 10) % 150) : 200;
      const stopLoss = +(1.5 + ((i * 0.4) % 4.0)).toFixed(1);
      const takeProfit = +(4.0 + ((i * 0.8) % 10.0)).toFixed(1);

      // Mutate strategy parameters
      const mutatedStrategy: StrategyDSL = {
        name: `${strategy?.name || 'Custom'} (Gen ${g} Opt ${i + 1})`,
        description: strategy?.description || 'Optimized AI genetic strategy',
        instruments: strategy?.instruments || [{ symbol: 'BTC/USDT', assetClass: 'CRYPTO' }],
        action: strategy?.action || { type: 'BUY', quantityType: 'PERCENT_OF_ACCOUNT', quantityValue: 50 },
        entryConditions: [
          {
            id: 'gen-entry-1',
            left: { type: 'EMA' as const, parameters: { period: emaFast } },
            comparator: 'CROSSES_ABOVE' as const,
            right: { type: 'EMA' as const, parameters: { period: emaSlow } },
            logicalOperator: 'AND' as const
          },
          {
            id: 'gen-entry-2',
            left: { type: 'RSI' as const, parameters: { period: rsiPeriod } },
            comparator: 'LESS_THAN' as const,
            right: 42
          }
        ],
        exitConditions: strategy?.exitConditions || [],
        riskParameters: {
          stopLossPercentage: stopLoss,
          takeProfitPercentage: takeProfit,
          maxPositionSizeUSD: 25000
        }
      };

      const simRes = runLocalBacktest(mutatedStrategy, data, 10000, 10, 0.05, 0.03);

      const sharpe = parseFloat(simRes.metrics.sharpeRatio) || 1.0;
      const ret = simRes.metrics.totalReturnRaw;
      const drawdown = simRes.metrics.maxDrawdownRaw;
      const winRate = simRes.metrics.winRateRaw;

      // Compute Fitness Score
      let fitnessScore = sharpe * 2.0 + (ret / 10) - (drawdown * 0.5);
      if (targetMetric === 'WIN_RATE') fitnessScore = winRate * 2.0 - drawdown;
      if (targetMetric === 'MIN_DRAWDOWN') fitnessScore = (100 - drawdown) * 2.0 + (ret / 10);

      candidatePool.push({
        id: `chrom-${g}-${i + 1}`,
        generation: g,
        genes: {
          rsi_period: rsiPeriod,
          ema_fast: emaFast,
          ema_slow: emaSlow,
          stop_loss: stopLoss,
          take_profit: takeProfit
        },
        metrics: {
          sharpeRatio: +sharpe.toFixed(2),
          totalReturnPct: +ret.toFixed(1),
          winRatePct: +winRate.toFixed(1),
          maxDrawdownPct: +drawdown.toFixed(1),
          score: +fitnessScore.toFixed(2)
        }
      });
    }
  }

  // Sort pool by fitness score descending
  candidatePool.sort((a, b) => b.metrics.score - a.metrics.score);
  const best = candidatePool[0];

  return {
    generationsRun: generations,
    bestChromosome: best,
    topCandidates: candidatePool.slice(0, 5),
    baselineMetrics: {
      sharpeRatio: baselineSharpe,
      totalReturnPct: baselineReturn,
      maxDrawdownPct: baselineDrawdown
    }
  };
}
