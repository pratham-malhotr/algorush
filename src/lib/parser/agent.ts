import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { StrategyDSLSchema } from '../types/strategy';

const ParserResponseSchema = z.object({
  status: z.enum(['SUCCESS', 'NEEDS_CLARIFICATION']),
  strategy: StrategyDSLSchema.optional(),
  clarificationMessage: z.string().optional().describe('The question to ask the user if the input is ambiguous or missing required fields like asset symbol or risk parameters.'),
});

export async function parseStrategyDescription(text: string) {
  const result = await generateObject({
    model: openai('gpt-4o'),
    schema: ParserResponseSchema,
    prompt: `You are an expert algorithmic trading assistant for AlgoText.ai.
Your goal is to parse the user's natural language strategy description into a formal JSON Strategy DSL.

User's description: "${text}"

RULES:
1. NEVER guess or fabricate missing required information (e.g., asset symbols, specific indicators if vague, or risk parameters).
2. If the user's description is vague or missing critical details (like "Buy Apple", but missing how much to buy, or missing an exit condition/stop loss), return status "NEEDS_CLARIFICATION" and provide a helpful, targeted "clarificationMessage" asking the user for the missing details.
3. If the description is complete and clear, return status "SUCCESS" and populate the "strategy" object according to the schema.
4. Assume standard default risk parameters ONLY if the user explicitly says "use defaults", otherwise ask for them or leave them out if they are truly optional. For MVP, we need at least a stop loss or take profit to be safe. If they don't provide one, ask for it.
5. ASSET RESOLUTION: The platform supports top Crypto assets (e.g. BTC, ETH, SOL, XRP). Map any coin names to their respective tickers (e.g. "Bitcoin" -> "BTC").
6. TIME & MARKET EVENTS: If the user mentions days or time (e.g. "Monday", "Market Open", "Today"), create a Condition where 'left.type' is "DAY_OF_WEEK" or "MARKET_EVENT", 'comparator' is "EQUAL", and 'right' is the string value (e.g. "MONDAY", "OPEN"). Use 'entryConditions' for the initial entry trigger, and 'exitConditions' for when to sell/close.
7. ACTIONS & QUANTITIES: Capture explicit quantities. If they say "buy 50 BTC", the main action should be { type: "BUY", quantityType: "SHARES", quantityValue: 50 }, and instruments should have { symbol: "BTC", assetClass: "CRYPTO" }.
8. LOOPS & TIME DELAYS: If the user describes a loop or time delay (e.g. "sell in 10 seconds", "buy after 5 seconds", "loop for 20 trades"), use the indicators 'TIME_SINCE_ENTRY' (for exits, in seconds), 'TIME_SINCE_LAST_TRADE' (for entries, in seconds), and 'LOOP_COUNT'.
For example:
- "sell in 10 seconds" -> exitCondition: { left: {type: 'TIME_SINCE_ENTRY'}, comparator: 'GREATER_THAN', right: 10 }
- "buy after 5 seconds" -> entryCondition: { left: {type: 'TIME_SINCE_LAST_TRADE'}, comparator: 'GREATER_THAN', right: 5 }
- "loop for 20 trades" -> entryCondition: { left: {type: 'LOOP_COUNT'}, comparator: 'LESS_THAN', right: 20 }
Output the JSON accurately.`,
  });

  return result.object;
}
