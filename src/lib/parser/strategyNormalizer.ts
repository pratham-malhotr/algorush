import { StrategyDSL, Condition, IndicatorType, Timeframe } from "@/lib/types/strategy"

const SUPPORTED_INDICATORS = new Set<string>([
  'PRICE', 'OPEN', 'HIGH', 'LOW', 'SMA', 'EMA', 'WMA', 'HMA', 'RSI', 'MACD', 
  'MACD_SIGNAL', 'MACD_HISTOGRAM', 'BOLLINGER_BANDS', 'BOLLINGER_UPPER', 
  'BOLLINGER_LOWER', 'BOLLINGER_MIDDLE', 'BOLLINGER_WIDTH', 'VWAP', 'ATR', 
  'SUPERTREND', 'STOCHASTIC_K', 'STOCHASTIC_D', 'ADX', 'CCI', 'OBV', 
  'WILLIAMS_R', 'ICHIMOKU_TENKAN', 'ICHIMOKU_KIJUN', 'VOLUME', 'VOLUME_SMA', 
  'FUNDING_RATE', 'ORDERBOOK_IMBALANCE', 'TIME_SINCE_ENTRY', 'UNREALIZED_PNL_PCT'
]);

const COMPARATOR_MAP: Record<string, string> = {
  'CROSSES_ABOVE': 'CROSSES_ABOVE',
  'CROSSES_BELOW': 'CROSSES_BELOW',
  'CROSS_ABOVE': 'CROSSES_ABOVE',
  'CROSS_BELOW': 'CROSSES_BELOW',
  'ABOVE': 'GREATER_THAN',
  'BELOW': 'LESS_THAN',
  'GREATER_THAN': 'GREATER_THAN',
  'LESS_THAN': 'LESS_THAN',
  'GREATER_THAN_OR_EQUAL': 'GREATER_THAN_OR_EQUAL',
  'LESS_THAN_OR_EQUAL': 'LESS_THAN_OR_EQUAL',
  'EQUAL': 'EQUAL',
  '>': 'GREATER_THAN',
  '<': 'LESS_THAN',
  '>=': 'GREATER_THAN_OR_EQUAL',
  '<=': 'LESS_THAN_OR_EQUAL',
  '==': 'EQUAL',
  '=': 'EQUAL',
  'OVER': 'GREATER_THAN',
  'UNDER': 'LESS_THAN',
};

/**
 * Universal Strategy Normalizer & Adapter.
 * Converts ANY AI model response (Groq, Gemini, Ollama, GPT), community format,
 * or shorthand trading rules into a 100% compliant, institutional StrategyDSL.
 */
export function normalizeStrategyDSL(raw: any, fallbackName = "Institutional Quant Strategy"): StrategyDSL {
  if (!raw || typeof raw !== 'object') {
    return createDefaultStrategy(fallbackName);
  }

  // 1. Resolve Strategy Title & Description
  const name = typeof raw.name === 'string' && raw.name.trim().length > 0 
    ? raw.name.trim() 
    : typeof raw.strategyName === 'string' && raw.strategyName.trim().length > 0
    ? raw.strategyName.trim()
    : typeof raw.title === 'string' && raw.title.trim().length > 0
    ? raw.title.trim()
    : fallbackName;

  const description = typeof raw.description === 'string' && raw.description.trim().length > 0
    ? raw.description.trim()
    : "Institutional algorithmic strategy compiled by AlgoRush DAG Engine";

  // 2. Resolve Timeframe
  const timeframe = normalizeTimeframe(raw.timeframe || raw.interval || raw.timeFrame || raw.resolution || "15m");

  // 3. Resolve Instruments / Assets
  const instruments = normalizeInstruments(raw);

  // 4. Extracted Risk Accumulator (e.g. if AI misplaced SL/TP inside exitConditions)
  const extractedRisk: {
    stopLoss?: number;
    takeProfit?: number;
    trailingStop?: number;
    leverage?: number;
  } = {};

  // 5. Action (Execution Box) & Side Resolution
  const action = normalizeAction(raw, extractedRisk);

  // 6. Entry Conditions
  const entryConditions = normalizeConditionsList(raw.entryConditions || raw.rules?.entry || raw.entries || [], 'entry', action.type);

  // 7. Exit Conditions
  const exitConditions = normalizeConditionsList(raw.exitConditions || raw.rules?.exit || raw.exits || [], 'exit', action.type, extractedRisk);

  // 8. Risk Parameters (Merge extracted risk from misplaced exit conditions or top-level keys)
  const riskParameters = normalizeRiskParameters(raw, action.leverage, extractedRisk);

  return {
    id: raw.id || `strat-${Date.now()}`,
    name,
    description,
    instruments,
    timeframe,
    action,
    entryConditions,
    exitConditions,
    riskParameters,
    filters: Array.isArray(raw.filters) ? raw.filters : undefined,
    webhooks: Array.isArray(raw.webhooks) ? raw.webhooks : undefined,
    logicGates: Array.isArray(raw.logicGates) ? raw.logicGates : undefined
  };
}

/**
 * Normalizes timeframe string to valid StrategyDSL timeframe.
 */
export function normalizeTimeframe(tf: any): '1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '1d' | '1w' {
  if (typeof tf !== 'string') return '15m';
  const clean = tf.toLowerCase().replace(/\s+/g, '');
  if (clean === '1m' || clean.includes('1min')) return '1m';
  if (clean === '3m' || clean.includes('3min')) return '3m';
  if (clean === '5m' || clean.includes('5min') || clean.includes('scalp')) return '5m';
  if (clean === '15m' || clean.includes('15min')) return '15m';
  if (clean === '30m' || clean.includes('30min')) return '30m';
  if (clean === '1h' || clean.includes('1hour') || clean.includes('hourly') || clean.includes('60m')) return '1h';
  if (clean === '2h' || clean.includes('2hour')) return '2h';
  if (clean === '4h' || clean.includes('4hour') || clean.includes('240m')) return '4h';
  if (clean === '1d' || clean.includes('daily') || clean.includes('1day')) return '1d';
  if (clean === '1w' || clean.includes('weekly') || clean.includes('1week')) return '1w';
  return '15m';
}

/**
 * Normalizes instrument array from strings, objects, or symbol strings.
 */
function normalizeInstruments(raw: any): Array<{ symbol: string; assetClass: 'CRYPTO' | 'EQUITY' | 'FOREX' | 'COMMODITY'; weight?: number }> {
  const sanitizeSymbol = (sym: string): string => {
    let s = sym.trim().toUpperCase().replace(/\/+/g, '/');
    if (s.endsWith('/USDT')) return s;
    if (s.endsWith('/USD')) return s.replace(/\/USD$/, '/USDT');
    if (s.endsWith('USDT')) return s.replace(/USDT$/, '/USDT');
    if (s.endsWith('USD')) return s.replace(/USD$/, '/USDT');
    if (!s.includes('/')) return `${s}/USDT`;
    return s;
  };

  if (Array.isArray(raw.instruments) && raw.instruments.length > 0) {
    return raw.instruments.map((inst: any) => {
      if (typeof inst === 'string') {
        return { symbol: sanitizeSymbol(inst), assetClass: 'CRYPTO' };
      }
      return {
        symbol: sanitizeSymbol(inst.symbol || 'BTC/USDT'),
        assetClass: (inst.assetClass || 'CRYPTO') as any,
        weight: inst.weight ?? 1.0
      };
    });
  }

  if (Array.isArray(raw.assets) && raw.assets.length > 0) {
    return raw.assets.map((ast: any) => ({
      symbol: sanitizeSymbol(typeof ast === 'string' ? ast : ast.symbol || 'BTC/USDT'),
      assetClass: 'CRYPTO'
    }));
  }

  if (typeof raw.symbol === 'string' && raw.symbol.length > 0) {
    return [{ symbol: sanitizeSymbol(raw.symbol), assetClass: 'CRYPTO' }];
  }

  return [{ symbol: 'BTC/USDT', assetClass: 'CRYPTO' }];
}

/**
 * Normalizes trading action, order type, leverage, and sizing.
 */
function normalizeAction(raw: any, extractedRisk: any) {
  let isShort = false;

  // Check top-level action property
  if (typeof raw.action === 'string') {
    const act = raw.action.toUpperCase();
    if (act === 'SELL' || act === 'SHORT' || act.includes('SHORT')) isShort = true;
  } else if (raw.action && typeof raw.action === 'object') {
    const actType = String(raw.action.type || raw.action.side || '').toUpperCase();
    if (actType === 'SELL' || actType === 'SHORT' || actType.includes('SHORT')) isShort = true;
  }

  // Check aliases like type, side, bias
  const aliasType = String(raw.type || raw.side || raw.bias || raw.direction || '').toUpperCase();
  if (aliasType === 'SELL' || aliasType === 'SHORT' || aliasType.includes('SHORT')) isShort = true;

  const orderTypeRaw = String(raw.action?.orderType || raw.orderType || 'MARKET').toUpperCase();
  const orderType: 'MARKET' | 'LIMIT' = orderTypeRaw === 'LIMIT' ? 'LIMIT' : 'MARKET';

  const quantityTypeRaw = String(raw.action?.quantityType || raw.quantityType || 'PERCENT_OF_ACCOUNT').toUpperCase();
  let quantityType: 'PERCENT_OF_ACCOUNT' | 'FIXED_USD' | 'USD_VALUE' | 'KELLY_CRITERION' | 'VOLATILITY_RISK_PCT' = 'PERCENT_OF_ACCOUNT';
  if (quantityTypeRaw.includes('FIXED') || quantityTypeRaw.includes('USD')) quantityType = 'FIXED_USD';
  else if (quantityTypeRaw.includes('KELLY')) quantityType = 'KELLY_CRITERION';
  else if (quantityTypeRaw.includes('VOLATILITY')) quantityType = 'VOLATILITY_RISK_PCT';

  let quantityValue = Number(raw.action?.quantityValue ?? raw.quantityValue ?? raw.allocation ?? 50);
  if (isNaN(quantityValue) || quantityValue <= 0) quantityValue = 50;
  if (quantityType === 'PERCENT_OF_ACCOUNT') quantityValue = Math.min(100, Math.max(1, quantityValue));

  let leverage = Number(
    raw.action?.leverage ?? 
    raw.riskParameters?.leverage ?? 
    raw.leverage ?? 
    raw.action?.leverageMultiplier ?? 
    extractedRisk.leverage ?? 
    1
  );
  if (isNaN(leverage) || leverage < 1) leverage = 1;
  leverage = Math.min(125, Math.max(1, Math.round(leverage)));

  return {
    type: (isShort ? 'SELL' : 'BUY') as 'BUY' | 'SELL',
    orderType,
    quantityType,
    quantityValue,
    leverage
  };
}

/**
 * Normalizes conditions list, extracting misplaced risk stops, handling shorthand indicator formats.
 */
function normalizeConditionsList(
  items: any[], 
  category: 'entry' | 'exit', 
  strategySide: 'BUY' | 'SELL' | 'CLOSE_POSITION' = 'BUY',
  extractedRisk?: any
): Condition[] {
  const result: Condition[] = [];

  if (!Array.isArray(items)) return result;

  items.forEach((item, idx) => {
    if (!item) return;

    // Check if AI placed Stop-Loss or Take-Profit in exit conditions
    const itemType = String(item.type || item.indicator || item.name || '').toUpperCase();
    if (category === 'exit' && extractedRisk) {
      if (itemType === 'STOP_LOSS' || itemType === 'SL') {
        const val = Number(item.percent || item.value || item.parameters?.percent || item.parameters?.value);
        if (!isNaN(val) && val > 0) extractedRisk.stopLoss = val;
        return; // Handled as risk parameter
      }
      if (itemType === 'TAKE_PROFIT' || itemType === 'TP') {
        const val = Number(item.percent || item.value || item.parameters?.percent || item.parameters?.value);
        if (!isNaN(val) && val > 0) extractedRisk.takeProfit = val;
        return; // Handled as risk parameter
      }
      if (itemType === 'TRAILING_STOP' || itemType === 'TS') {
        const val = Number(item.percent || item.value || item.parameters?.percent || item.parameters?.value);
        if (!isNaN(val) && val > 0) extractedRisk.trailingStop = val;
        return; // Handled as risk parameter
      }
    }

    const normalizedCond = normalizeSingleCondition(item, idx, category, strategySide);
    if (normalizedCond) {
      result.push(normalizedCond);
    }
  });

  // Ensure default fallback if list is completely empty
  if (result.length === 0) {
    if (category === 'entry') {
      const isShort = strategySide === 'SELL';
      result.push({
        id: 'entry-1',
        left: { type: 'EMA', parameters: { period: 20 } },
        comparator: isShort ? 'CROSSES_BELOW' : 'CROSSES_ABOVE',
        right: { type: 'EMA', parameters: { period: 50 } },
        logicalOperator: 'AND',
        label: isShort ? '20 EMA Crosses Below 50 EMA' : '20 EMA Crosses Above 50 EMA'
      });
    }
  }

  return result;
}

/**
 * Normalizes a single condition object across all variations.
 */
function normalizeSingleCondition(item: any, idx: number, category: 'entry' | 'exit', strategySide: 'BUY' | 'SELL' | 'CLOSE_POSITION' = 'BUY'): Condition | null {
  const id = item.id || `${category}-${idx + 1}`;
  const logicalOperator: 'AND' | 'OR' = String(item.logicalOperator || 'AND').toUpperCase() === 'OR' ? 'OR' : 'AND';

  // 1. Standard Condition structure: { left: { type: ... }, comparator: ..., right: ... }
  if (item.left && item.comparator) {
    const left = normalizeIndicatorRef(item.left);
    const comparator = normalizeComparator(item.comparator);
    const right = normalizeRightOperand(item.right);
    return {
      id,
      left,
      comparator,
      right,
      logicalOperator,
      label: item.label || item.description || formatDefaultLabel(left, comparator, right)
    };
  }

  // 2. Crossover models: e.g. { type: "EMA_CROSS", fastEMA: 20, slowEMA: 50, direction: "above" }
  const rawType = String(item.type || item.indicator || item.name || '').toUpperCase();
  if (rawType.includes('CROSS') || rawType === 'GOLDEN_CROSS' || rawType === 'DEATH_CROSS') {
    const isDeath = rawType.includes('DEATH') || String(item.direction || '').toLowerCase().includes('below');
    const indType: IndicatorType = rawType.includes('SMA') ? 'SMA' : rawType.includes('WMA') ? 'WMA' : rawType.includes('HMA') ? 'HMA' : 'EMA';
    const fastPeriod = Number(item.fast || item.fastEMA || item.fastPeriod || item.period1 || (rawType.includes('50_200') ? 50 : 20)) || 20;
    const slowPeriod = Number(item.slow || item.slowEMA || item.slowPeriod || item.period2 || (rawType.includes('50_200') ? 200 : 50)) || 50;

    return {
      id,
      left: { type: indType, parameters: { period: fastPeriod } },
      comparator: isDeath ? 'CROSSES_BELOW' : 'CROSSES_ABOVE',
      right: { type: indType, parameters: { period: slowPeriod } },
      logicalOperator,
      label: `${fastPeriod} ${indType} ${isDeath ? 'Crosses Below' : 'Crosses Above'} ${slowPeriod} ${indType}`
    };
  }

  // 3. Oscillator threshold models: e.g. { type: "RSI", period: 14, operator: "<", value: 30 }
  if (rawType === 'RSI' || rawType === 'CCI' || rawType === 'WILLIAMS_R' || rawType === 'ADX' || rawType === 'ATR') {
    const period = Number(item.period || item.parameters?.period || 14) || 14;
    const compRaw = item.operator || item.comparator || (category === 'exit' ? (strategySide === 'SELL' ? '<' : '>') : (strategySide === 'SELL' ? '>' : '<'));
    const comparator = normalizeComparator(compRaw);
    let val = item.value !== undefined ? item.value : (item.threshold !== undefined ? item.threshold : (category === 'exit' ? (strategySide === 'SELL' ? 30 : 70) : (strategySide === 'SELL' ? 70 : 30)));
    val = Number(val);
    if (isNaN(val)) val = 30;

    return {
      id,
      left: { type: rawType as IndicatorType, parameters: { period } },
      comparator,
      right: val,
      logicalOperator,
      label: `${rawType}(${period}) ${comparator === 'LESS_THAN' ? '<' : '>'} ${val}`
    };
  }

  // 4. Bollinger Bands models: e.g. { type: "BOLLINGER", period: 20, multiplier: 2, condition: "price_below_lower" }
  if (rawType.includes('BOLLINGER') || rawType === 'BB') {
    const period = Number(item.period || item.parameters?.period || 20) || 20;
    const multiplier = Number(item.multiplier || item.parameters?.multiplier || 2.0) || 2.0;
    const isLower = rawType.includes('LOWER') || String(item.condition || item.target || '').toLowerCase().includes('lower') || strategySide === 'BUY';
    const targetBand: IndicatorType = isLower ? 'BOLLINGER_LOWER' : 'BOLLINGER_UPPER';
    const comparator = isLower ? 'LESS_THAN' : 'GREATER_THAN';

    return {
      id,
      left: { type: 'PRICE' },
      comparator,
      right: { type: targetBand, parameters: { period, multiplier } },
      logicalOperator,
      label: `Price ${isLower ? '< Lower' : '> Upper'} Bollinger Band (${period}, ${multiplier})`
    };
  }

  // 5. Supertrend: e.g. { type: "SUPERTREND", period: 10, multiplier: 3 }
  if (rawType === 'SUPERTREND') {
    const period = Number(item.period || item.parameters?.period || 10) || 10;
    const multiplier = Number(item.multiplier || item.parameters?.multiplier || 3.0) || 3.0;
    const isBullish = strategySide === 'BUY';

    return {
      id,
      left: { type: 'PRICE' },
      comparator: isBullish ? 'GREATER_THAN' : 'LESS_THAN',
      right: { type: 'SUPERTREND', parameters: { period, multiplier } },
      logicalOperator,
      label: `Price ${isBullish ? '> Bullish' : '< Bearish'} Supertrend (${period}, ${multiplier})`
    };
  }

  // 6. MACD Histogram: e.g. { type: "MACD_HISTOGRAM", comparator: ">", right: 0 }
  if (rawType === 'MACD_HISTOGRAM' || rawType === 'MACD_HIST') {
    const fast = Number(item.fast || item.parameters?.fast || 12) || 12;
    const slow = Number(item.slow || item.parameters?.slow || 26) || 26;
    const signal = Number(item.signal || item.parameters?.signal || 9) || 9;
    const comp = normalizeComparator(item.operator || item.comparator || (strategySide === 'SELL' ? '<' : '>'));

    return {
      id,
      left: { type: 'MACD_HISTOGRAM', parameters: { fast, slow, signal } },
      comparator: comp,
      right: 0,
      logicalOperator,
      label: `MACD Histogram ${comp === 'GREATER_THAN' ? '> 0' : '< 0'}`
    };
  }

  // 7. MACD Signal Line Crossover
  if (rawType === 'MACD' || rawType === 'MACD_CROSS') {
    const fast = Number(item.fast || item.parameters?.fast || 12) || 12;
    const slow = Number(item.slow || item.parameters?.slow || 26) || 26;
    const signal = Number(item.signal || item.parameters?.signal || 9) || 9;
    const isBull = strategySide === 'BUY';

    return {
      id,
      left: { type: 'MACD', parameters: { fast, slow, signal } },
      comparator: isBull ? 'CROSSES_ABOVE' : 'CROSSES_BELOW',
      right: { type: 'MACD_SIGNAL', parameters: { fast, slow, signal } },
      logicalOperator,
      label: `MACD Line ${isBull ? 'Crosses Above' : 'Crosses Below'} Signal Line (${fast}/${slow}/${signal})`
    };
  }

  // 8. Volume Spike
  if (rawType === 'VOLUME' || rawType === 'VOLUME_SPIKE') {
    const period = Number(item.period || item.parameters?.period || 20) || 20;
    return {
      id,
      left: { type: 'VOLUME' },
      comparator: 'GREATER_THAN',
      right: { type: 'VOLUME_SMA', parameters: { period } },
      logicalOperator,
      label: `Volume > 20-Period Volume SMA`
    };
  }

  // 9. VWAP Pullback
  if (rawType === 'VWAP') {
    const isBull = strategySide === 'BUY';
    return {
      id,
      left: { type: 'PRICE' },
      comparator: isBull ? 'LESS_THAN' : 'GREATER_THAN',
      right: { type: 'VWAP' },
      logicalOperator,
      label: `Price ${isBull ? '<' : '>'} Intraday VWAP`
    };
  }

  // Default fallback: Price action comparison or default EMA
  return {
    id,
    left: { type: 'EMA', parameters: { period: 20 } },
    comparator: strategySide === 'SELL' ? 'CROSSES_BELOW' : 'CROSSES_ABOVE',
    right: { type: 'EMA', parameters: { period: 50 } },
    logicalOperator,
    label: `20 EMA ${strategySide === 'SELL' ? 'Crosses Below' : 'Crosses Above'} 50 EMA`
  };
}

/**
 * Normalizes indicator reference object.
 */
function normalizeIndicatorRef(left: any): { type: IndicatorType; parameters?: Record<string, number>; timeframe?: Timeframe } {
  if (typeof left === 'string') {
    const upper = left.toUpperCase();
    const indType = SUPPORTED_INDICATORS.has(upper) ? (upper as IndicatorType) : 'PRICE';
    return { type: indType };
  }

  const rawType = String(left.type || left.indicator || left.name || 'PRICE').toUpperCase();
  const indType = SUPPORTED_INDICATORS.has(rawType) ? (rawType as IndicatorType) : 'PRICE';

  const params: Record<string, number> = {};
  if (left.parameters && typeof left.parameters === 'object') {
    for (const [k, v] of Object.entries(left.parameters)) {
      const num = Number(v);
      if (!isNaN(num)) params[k] = num;
    }
  } else {
    if (left.period) params.period = Number(left.period) || 14;
    if (left.fast) params.fast = Number(left.fast) || 12;
    if (left.slow) params.slow = Number(left.slow) || 26;
    if (left.signal) params.signal = Number(left.signal) || 9;
    if (left.multiplier) params.multiplier = Number(left.multiplier) || 2;
  }

  return {
    type: indType,
    parameters: Object.keys(params).length > 0 ? params : undefined,
    timeframe: left.timeframe ? normalizeTimeframe(left.timeframe) : undefined
  };
}

/**
 * Normalizes comparator strings to strict enum values.
 */
function normalizeComparator(comp: any): any {
  if (typeof comp !== 'string') return 'GREATER_THAN';
  const clean = comp.trim().toUpperCase();
  return COMPARATOR_MAP[clean] || 'GREATER_THAN';
}

/**
 * Normalizes right operand (number, indicator object, or string number).
 */
function normalizeRightOperand(right: any): any {
  if (typeof right === 'number') return right;
  if (typeof right === 'string' && !isNaN(Number(right))) return Number(right);
  if (typeof right === 'object' && right !== null) {
    return normalizeIndicatorRef(right);
  }
  return 0;
}

/**
 * Normalizes risk parameters, applying institutional guardrails.
 */
function normalizeRiskParameters(raw: any, leverage: number, extractedRisk: any) {
  let sl = Number(
    raw.riskParameters?.stopLossPercentage ?? 
    raw.stopLossPercentage ?? 
    raw.stopLoss ?? 
    raw.sl ?? 
    extractedRisk.stopLoss ?? 
    2.5
  );
  if (isNaN(sl) || sl <= 0 || sl > 50) sl = 2.5;

  let tp = Number(
    raw.riskParameters?.takeProfitPercentage ?? 
    raw.takeProfitPercentage ?? 
    raw.takeProfit ?? 
    raw.tp ?? 
    extractedRisk.takeProfit ?? 
    6.0
  );
  if (isNaN(tp) || tp <= 0 || tp > 100) tp = Number((sl * 2.4).toFixed(1));

  let trailingStop: number | undefined = Number(
    raw.riskParameters?.trailingStopPercentage ?? 
    raw.trailingStopPercentage ?? 
    raw.trailingStop ?? 
    extractedRisk.trailingStop
  );
  if (isNaN(trailingStop) || trailingStop <= 0) trailingStop = undefined;

  return {
    stopLossPercentage: Number(sl.toFixed(2)),
    takeProfitPercentage: Number(tp.toFixed(2)),
    trailingStopPercentage: trailingStop ? Number(trailingStop.toFixed(2)) : undefined,
    leverage,
    takeProfitLadder: Array.isArray(raw.riskParameters?.takeProfitLadder) ? raw.riskParameters.takeProfitLadder : undefined
  };
}

/**
 * Helper to generate readable default condition label.
 */
function formatDefaultLabel(left: any, comp: string, right: any): string {
  const leftStr = left.parameters?.period ? `${left.parameters.period} ${left.type}` : left.type;
  const compStr = comp.replace(/_/g, ' ').toLowerCase();
  let rightStr = '';
  if (typeof right === 'object' && right !== null) {
    rightStr = right.parameters?.period ? `${right.parameters.period} ${right.type}` : right.type;
  } else {
    rightStr = String(right);
  }
  return `${leftStr} ${compStr} ${rightStr}`;
}

/**
 * Normalizes suggested tweaks array from objects or strings.
 */
export function normalizeSuggestedTweaks(tweaks: any): string[] {
  if (!Array.isArray(tweaks)) return [];
  return tweaks
    .map(item => {
      if (typeof item === 'string') return item.trim();
      if (item && typeof item === 'object') {
        return item.tweak || item.description || item.suggestion || item.title || JSON.stringify(item);
      }
      return '';
    })
    .filter(t => t.length > 0)
    .slice(0, 4);
}

function createDefaultStrategy(fallbackName: string): StrategyDSL {
  return {
    id: `strat-${Date.now()}`,
    name: fallbackName,
    description: "Institutional quant strategy normalized by AlgoRush Engine",
    instruments: [{ symbol: "BTC/USDT", assetClass: "CRYPTO" }],
    timeframe: "15m",
    entryConditions: [{
      id: "entry-1",
      left: { type: "EMA", parameters: { period: 20 } },
      comparator: "CROSSES_ABOVE",
      right: { type: "EMA", parameters: { period: 50 } },
      logicalOperator: "AND",
      label: "20 EMA Crosses Above 50 EMA"
    }],
    exitConditions: [{
      id: "exit-1",
      left: { type: "RSI", parameters: { period: 14 } },
      comparator: "GREATER_THAN",
      right: 70,
      logicalOperator: "OR",
      label: "RSI(14) > 70 Overbought Exit"
    }],
    action: {
      type: "BUY",
      orderType: "MARKET",
      quantityType: "PERCENT_OF_ACCOUNT",
      quantityValue: 50,
      leverage: 5
    },
    riskParameters: {
      stopLossPercentage: 2.5,
      takeProfitPercentage: 6.0,
      leverage: 5
    }
  };
}

