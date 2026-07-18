import { z } from 'zod';

export const AssetClassSchema = z.enum(['EQUITY', 'CRYPTO', 'FOREX', 'OPTIONS', 'FUTURES']);

export const InstrumentSchema = z.object({
  symbol: z.string(),
  assetClass: AssetClassSchema,
});

export const IndicatorTypeSchema = z.enum(['PRICE', 'SMA', 'EMA', 'RSI', 'MACD', 'BOLLINGER_BANDS', 'VWAP', 'TIME', 'DAY_OF_WEEK', 'MARKET_EVENT', 'TIME_SINCE_ENTRY', 'TIME_SINCE_LAST_TRADE', 'LOOP_COUNT']);

export const IndicatorSchema = z.object({
  type: IndicatorTypeSchema,
  parameters: z.record(z.string(), z.number()).optional(), // e.g., { period: 14 }
});

export const ComparatorSchema = z.enum(['GREATER_THAN', 'LESS_THAN', 'EQUAL', 'CROSSES_ABOVE', 'CROSSES_BELOW']);

export const ConditionSchema = z.object({
  id: z.string(),
  left: IndicatorSchema,
  comparator: ComparatorSchema,
  right: z.union([IndicatorSchema, z.number(), z.string()]), // string added for "MONDAY", "MARKET_OPEN"
});

export const ActionTypeSchema = z.enum(['BUY', 'SELL', 'CLOSE_POSITION']);

export const ActionSchema = z.object({
  type: ActionTypeSchema,
  quantityType: z.enum(['SHARES', 'PERCENT_OF_ACCOUNT', 'USD_VALUE']).optional(),
  quantityValue: z.number().optional(),
});

export const RiskParametersSchema = z.object({
  stopLossPercentage: z.number().optional(),
  takeProfitPercentage: z.number().optional(),
  trailingStopPercentage: z.number().optional(),
  maxPositionSizeUSD: z.number().optional(),
});

export const StrategyDSLSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string(),
  instruments: z.array(InstrumentSchema),
  entryConditions: z.array(ConditionSchema), // Implicit AND between conditions for now
  exitConditions: z.array(ConditionSchema).optional(),
  action: ActionSchema,
  riskParameters: RiskParametersSchema,
});

export type StrategyDSL = z.infer<typeof StrategyDSLSchema>;
export type Condition = z.infer<typeof ConditionSchema>;
export type Action = z.infer<typeof ActionSchema>;
export type Indicator = z.infer<typeof IndicatorSchema>;
export type RiskParameters = z.infer<typeof RiskParametersSchema>;
