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
  label: z.string().optional(),
  description: z.string().optional(),
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

export const TakeProfitTargetSchema = z.object({
  targetPercentage: z.number(), // e.g. 2.5 for +2.5% gain
  allocationPercentage: z.number(), // e.g. 50 for 50% of position
  moveToBreakEven: z.boolean().optional(), // whether to move SL to break-even once hit
  trailingStopPct: z.number().optional(), // trailing stop for runner tier
});

export const FilterSchema = z.object({
  id: z.string().optional(),
  sessions: z.array(z.enum(['LONDON', 'NEW_YORK', 'TOKYO', 'SYDNEY', 'OVERLAP'])).optional(),
  daysOfWeek: z.array(z.number()).optional(), // 1=Mon, 5=Fri
  minVolatilityATR: z.number().optional(),
  maxVolatilityATR: z.number().optional(),
  volumeFilterMinSMA: z.number().optional(),
});

export const WebhookSchema = z.object({
  id: z.string().optional(),
  channel: z.enum(['DISCORD', 'TELEGRAM', 'CUSTOM_WEBHOOK', 'SLACK']),
  url: z.string().optional(),
  triggerEvents: z.array(z.enum(['SIGNAL_TRIGGERED', 'ORDER_FILLED', 'SL_HIT', 'TP_HIT', 'LIQUIDATION_RISK'])).optional(),
  customPayloadTemplate: z.string().optional(),
});

export const LogicGateSchema = z.object({
  id: z.string(),
  operator: z.enum(['ALL_TRUE', 'ANY_TRUE', 'WEIGHTED_SCORE']),
  threshold: z.number().optional(), // for WEIGHTED_SCORE
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
  takeProfitLadder: z.array(TakeProfitTargetSchema).optional(),
  breakEvenTriggerPct: z.number().optional(),
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
  filters: z.array(FilterSchema).optional(),
  webhooks: z.array(WebhookSchema).optional(),
  logicGates: z.array(LogicGateSchema).optional(),
});

export type StrategyDSL = z.infer<typeof StrategyDSLSchema>;
export type Condition = z.infer<typeof ConditionSchema>;
export type Action = z.infer<typeof ActionSchema>;
export type Indicator = z.infer<typeof IndicatorSchema>;
export type IndicatorType = z.infer<typeof IndicatorTypeSchema>;
export type RiskParameters = z.infer<typeof RiskParametersSchema>;
export type Timeframe = z.infer<typeof TimeframeSchema>;
export type TakeProfitTarget = z.infer<typeof TakeProfitTargetSchema>;
export type StrategyFilter = z.infer<typeof FilterSchema>;
export type StrategyWebhook = z.infer<typeof WebhookSchema>;
export type LogicGate = z.infer<typeof LogicGateSchema>;


