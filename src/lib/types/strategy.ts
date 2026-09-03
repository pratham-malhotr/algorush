import { z } from 'zod';

export const AssetClassSchema = z.enum(['CRYPTO', 'EQUITY', 'FOREX', 'COMMODITY']);

export const InstrumentSchema = z.object({
  symbol: z.string(),
  assetClass: AssetClassSchema,
  weight: z.number().optional(), // Portfolio weight e.g. 0.5 for 50% allocation
});

export const TimeframeSchema = z.enum(['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '1d', '1w']);

export const PriceSourceSchema = z.enum(['close', 'open', 'high', 'low', 'hl2', 'hlc3', 'ohlc4']);

export const IndicatorTypeSchema = z.enum([
  'PRICE',
  'SMA',
  'EMA',
  'WMA',
  'HMA',
  'RSI',
  'MACD',
  'MACD_SIGNAL',
  'MACD_HISTOGRAM',
  'BOLLINGER_BANDS',
  'BOLLINGER_UPPER',
  'BOLLINGER_LOWER',
  'BOLLINGER_MIDDLE',
  'VWAP',
  'ATR',
  'SUPERTREND',
  'STOCHASTIC_K',
  'STOCHASTIC_D',
  'ADX',
  'CCI',
  'OBV',
  'KELTNER_UPPER',
  'KELTNER_LOWER',
  'DONCHIAN_HIGH',
  'DONCHIAN_LOW',
  'ICHIMOKU_TENKAN',
  'ICHIMOKU_KIJUN',
  'WILLIAMS_R',
  'VOLUME',
  'VOLUME_SMA',
  'CHANGE_PCT',
  'TIME',
  'DAY_OF_WEEK',
  'MARKET_EVENT',
  'TIME_SINCE_ENTRY',
  'TIME_SINCE_LAST_TRADE',
  'LOOP_COUNT',
  'FUNDING_RATE',
  'ORDERBOOK_IMBALANCE',
]);

export const IndicatorSchema = z.object({
  type: IndicatorTypeSchema,
  timeframe: TimeframeSchema.optional(), // Multi-timeframe analysis e.g. '1h'
  source: PriceSourceSchema.optional(), // e.g. 'close', 'hlc3'
  offset: z.number().optional(), // Lookback shift e.g. 1 for previous candle
  parameters: z.record(z.string(), z.number()).optional(), // e.g., { period: 14, multiplier: 3 }
});

export const ComparatorSchema = z.enum([
  'GREATER_THAN',
  'LESS_THAN',
  'EQUAL',
  'GREATER_THAN_OR_EQUAL',
  'LESS_THAN_OR_EQUAL',
  'CROSSES_ABOVE',
  'CROSSES_BELOW',
]);

export const ConditionSchema = z.object({
  id: z.string(),
  left: IndicatorSchema,
  comparator: ComparatorSchema,
  right: z.union([IndicatorSchema, z.number(), z.string()]),
  logicalOperator: z.enum(['AND', 'OR']).optional(),
});

export const ActionTypeSchema = z.enum(['BUY', 'SELL', 'CLOSE_POSITION', 'REBALANCE']);

export const OrderTypeSchema = z.enum(['MARKET', 'LIMIT', 'STOP', 'STOP_LIMIT', 'TRAILING_STOP', 'TWAP', 'GRID_LIMIT']);

export const QuantityTypeSchema = z.enum([
  'SHARES',
  'PERCENT_OF_ACCOUNT',
  'USD_VALUE',
  'FIXED_USD',
  'VOLATILITY_RISK_PCT',
  'KELLY_CRITERION',
]);

export const ActionSchema = z.object({
  type: ActionTypeSchema,
  orderType: OrderTypeSchema.optional(),
  quantityType: QuantityTypeSchema.optional(),
  quantityValue: z.number().optional(),
  leverage: z.number().optional(),
  limitPriceOffsetPct: z.number().optional(),
});

export const RiskParametersSchema = z.object({
  stopLossPercentage: z.number().optional(),
  takeProfitPercentage: z.number().optional(),
  trailingStopPercentage: z.number().optional(),
  riskPerTradePct: z.number().optional(), // e.g. 1% of account risked per trade
  maxPositionSizeUSD: z.number().optional(),
  maxDailyDrawdownPct: z.number().optional(),
  maxPortfolioLossPct: z.number().optional(),
  maxConsecutiveLosses: z.number().optional(),
  kellyFraction: z.number().optional(), // e.g. 0.5 for Half-Kelly
  leverage: z.number().optional(),
});

export const StrategyDSLSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string(),
  instruments: z.array(InstrumentSchema),
  timeframe: TimeframeSchema.optional(), // Default strategy chart timeframe
  entryConditions: z.array(ConditionSchema),
  exitConditions: z.array(ConditionSchema).optional(),
  action: ActionSchema,
  riskParameters: RiskParametersSchema,
});

export type StrategyDSL = z.infer<typeof StrategyDSLSchema>;
export type Condition = z.infer<typeof ConditionSchema>;
export type Action = z.infer<typeof ActionSchema>;
export type Indicator = z.infer<typeof IndicatorSchema>;
export type IndicatorType = z.infer<typeof IndicatorTypeSchema>;
export type RiskParameters = z.infer<typeof RiskParametersSchema>;
export type Timeframe = z.infer<typeof TimeframeSchema>;


