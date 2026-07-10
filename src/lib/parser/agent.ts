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
5. ASSET RESOLUTION: The platform supports over 350+ global assets including Crypto (e.g. BTC, ETH), Top 250 US Stocks (e.g. AAPL, MSFT, TSLA), and Top 100 Indian Stocks (e.g. RELIANCE, TCS, HDFCBANK). If the user provides a company name (like "Reliance" or "Apple"), map it to the exact correct ticker symbol in the JSON output.

Output the JSON accurately.`,
  });

  return result.object;
}
