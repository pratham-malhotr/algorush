import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { StrategyDSLSchema } from '../types/strategy';

const ParserResponseSchema = z.object({
  status: z.enum(['SUCCESS', 'NEEDS_CLARIFICATION']),
  strategy: StrategyDSLSchema.optional(),
  clarificationMessage: z.string().optional().describe('The question to ask the user if the input is ambiguous or missing required fields.'),
});

export async function parseStrategyDescription(text: string) {
  const result = await generateObject({
    model: openai('gpt-4o'),
    schema: ParserResponseSchema,
    prompt: `You are an institutional quantitative trading architect for Algorush.
Your goal is to parse complex natural language strategy descriptions into a formal JSON Strategy DSL.

User input: "${text}"

INSTRUCTIONS & RULES:
1. SUPPORTED ASSETS: Map symbols accurately (e.g. "Bitcoin" -> "BTC", "Ethereum" -> "ETH", "Solana" -> "SOL", "Apple" -> "AAPL", "NVIDIA" -> "NVDA"). Default assetClass is "CRYPTO".
2. TIMEFRAMES & MULTI-TIMEFRAME:
   - Extract primary timeframe (e.g., '5m', '15m', '1h', '4h', '1d').
   - If a condition specifies a higher timeframe filter (e.g. "1h 50 EMA is rising"), set 'timeframe': '1h' on that indicator.
3. LOOKBACK OFFSETS:
   - If a condition refers to previous candles (e.g. "RSI 1 candle ago < 30"), set 'offset': 1.
4. INDICATORS (25+ supported):
   - PRICE, SMA, EMA, WMA, HMA, RSI, MACD, MACD_SIGNAL, MACD_HISTOGRAM, BOLLINGER_BANDS, BOLLINGER_UPPER, BOLLINGER_LOWER, VWAP, ATR, SUPERTREND, STOCHASTIC_K, STOCHASTIC_D, ADX, CCI, OBV, KELTNER_UPPER, KELTNER_LOWER, DONCHIAN_HIGH, DONCHIAN_LOW, ICHIMOKU_TENKAN, ICHIMOKU_KIJUN, WILLIAMS_R, VOLUME, VOLUME_SMA.
5. COMPARISONS & LOGIC:
   - Compare indicators to indicators (e.g. 50 EMA > 200 EMA) or numbers (RSI < 30).
   - Set 'logicalOperator' to "AND" or "OR".
6. POSITION SIZING & RISK:
   - Support 'quantityType': 'PERCENT_OF_ACCOUNT', 'VOLATILITY_RISK_PCT', 'KELLY_CRITERION', 'USD_VALUE'.
   - Extract stopLossPercentage, takeProfitPercentage, trailingStopPercentage, riskPerTradePct, maxDailyDrawdownPct.
7. Output status "SUCCESS" with the populated strategy object.`,
  });

  return result.object;
}


