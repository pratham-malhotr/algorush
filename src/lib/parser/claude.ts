import { StrategyDSL } from '../types/strategy';
import { isExplicitStrategyIntent, processAndVerifyGeminiResponse } from './gemini';
import { normalizeStrategyDSL } from './strategyNormalizer';

export class ClaudeLimitReachedError extends Error {
  public statusCode: number;
  public isCreditExhausted: boolean;

  constructor(message: string, statusCode: number = 429, isCreditExhausted: boolean = false) {
    super(message);
    this.name = 'ClaudeLimitReachedError';
    this.statusCode = statusCode;
    this.isCreditExhausted = isCreditExhausted;
  }
}

export interface ClaudeParseOptions {
  text: string;
  model?: string;
  apiKey?: string;
  currentStrategy?: StrategyDSL | null;
  chatHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface ClaudeParseResponse {
  status: 'SUCCESS' | 'NEEDS_CLARIFICATION' | 'CONVERSATIONAL';
  strategy?: StrategyDSL;
  reasoning?: string;
  riskAssessment?: string;
  suggestedTweaks?: string[];
  clarificationMessage?: string;
  conversationalResponse?: string;
  verificationAudit?: any;
  modelUsed: string;
  latencyMs: number;
  failoverNotice?: string;
}

const CLAUDE_SYSTEM_PROMPT = `You are an elite institutional quantitative trading architect for AlgoRush.
You formulate, audit, and mathematically evaluate algorithmic trading strategies and market concepts.
CRITICAL RULE: NEVER mention any underlying AI model, engine, provider, or API key in your output. You are simply AlgoRush AI Quant Copilot.

You handle two strictly distinct types of user interactions:

1. CONVERSATIONAL / QUESTIONS / GREETINGS / REQUIREMENTS GATHERING:
- GREETINGS (e.g. "hi", "hello", "hey", "how are you"):
  Respond warmly, concisely, and naturally (2-3 sentences). Greet the user, offer assistance with trading questions or strategy design. DO NOT return any strategy or technical lectures.
- UNDERSPECIFIED STRATEGY REQUESTS (e.g. "can you build a strategy for me", "build me a strategy", "help me build a strategy", "can you create a strategy"):
  DO NOT generate a strategy object! The user has not specified what they want to trade. Respond warmly with status "CONVERSATIONAL" asking for their 4 key requirements:
  1. Asset & Timeframe (e.g. BTC/USDT, ETH/USDT on 15m or 1h)
  2. Strategy Archetype (Trend Following, Mean Reversion, Breakout)
  3. Indicators & Entry Triggers (20/50 EMA crossover, RSI < 30, MACD)
  4. Risk Parameters (Leverage, Stop Loss %, Take Profit %)
  Provide 2-3 specific clickable strategy prompt examples in "suggestedTweaks".
- CONCEPTUAL & TRADING INQUIRIES (e.g. "what is RSI", "explain EMA vs SMA", "how does Kelly Criterion work"):
  Provide a clear, mathematically grounded markdown explanation with formulas ($LaTeX$) and Python CCXT snippets. DO NOT build or return a strategy!
- Output JSON format:
  {
    "status": "CONVERSATIONAL",
    "conversationalResponse": "your friendly, articulate response in markdown",
    "suggestedTweaks": ["Tweak 1", "Tweak 2"]
  }

2. STRATEGY BUILDING REQUESTS & ALGORITHMIC DIRECTIVES (WITH SPECIFICATIONS):
- When the user specifies an asset, indicator, timeframe, or trading rules (e.g. "build a strategy for BTC", "make me an ETH strategy on 15m", "create a scalping bot for SOL", "can you build a strategy with 50 and 200 EMA", "buy when 20 EMA crosses 50 EMA"):
  YOU MUST RETURN A COMPLETE EXECUTABLE StrategyDSL OBJECT with status "SUCCESS"!
- Output JSON format:
  {
    "status": "SUCCESS",
    "strategy": {
      "name": "Strategy Name",
      "description": "Clear explanation",
      "instruments": [{ "symbol": "BTC/USDT", "assetClass": "CRYPTO" }],
      "timeframe": "15m",
      "action": {
        "type": "BUY",
        "orderType": "MARKET",
        "quantityType": "PERCENT_OF_ACCOUNT",
        "quantityValue": 50,
        "leverage": 1
      },
      "entryConditions": [
        {
          "id": "entry-1",
          "left": { "type": "EMA", "parameters": { "period": 20 } },
          "comparator": "CROSSES_ABOVE",
          "right": { "type": "EMA", "parameters": { "period": 50 } },
          "logicalOperator": "AND"
        }
      ],
      "exitConditions": [],
      "riskParameters": {
        "stopLossPercentage": 3.0,
        "takeProfitPercentage": 6.0,
        "maxDrawdownPercentage": 15.0
      }
    },
    "reasoning": "Quantitative thesis and mathematical edge",
    "riskAssessment": "Risk and liquidation analysis",
    "suggestedTweaks": ["Tweak 1", "Tweak 2"]
  }

CRITICAL RULES:
- ALWAYS respond in strict JSON format without markdown code fences around the JSON, or wrap purely in a json code block.
- NEVER invent fictitious indicators. Valid indicator types: EMA, SMA, RSI, MACD, MACD_SIGNAL, MACD_HISTOGRAM, BOLLINGER_UPPER, BOLLINGER_LOWER, BOLLINGER_MIDDLE, SUPERTREND, STOCHASTIC_K, STOCHASTIC_D, ADX, ATR, VWAP, VOLUME, VOLUME_SMA, PRICE.`;

export function resolveClaudeModel(modelName?: string): string {
  if (!modelName) return 'claude-3-7-sonnet-20250219';
  const m = modelName.trim().toLowerCase();
  if (m.includes('3-7') || m.includes('3.7')) return 'claude-3-7-sonnet-20250219';
  if (m.includes('3-5') || m.includes('3.5')) return 'claude-3-5-sonnet-20241022';
  if (m.includes('haiku')) return 'claude-3-5-haiku-20241022';
  return 'claude-3-7-sonnet-20250219';
}

/**
 * Parses a trading strategy or quant dialogue using Anthropic Claude API.
 * Detects rate limits (429, credit exhausted, overloaded) and throws ClaudeLimitReachedError
 * so callers can automatically failover to Groq LPUs™.
 */
export async function parseStrategyWithClaude(options: ClaudeParseOptions): Promise<ClaudeParseResponse> {
  const { text, model = 'claude-3-7-sonnet-20250219', apiKey, chatHistory, currentStrategy } = options;

  const effectiveKey = apiKey?.trim() || 
    process.env.ANTHROPIC_API_KEY?.trim() || 
    process.env.CLAUDE_API_KEY?.trim() || 
    process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY?.trim();

  if (!effectiveKey) {
    throw new ClaudeLimitReachedError('ANTHROPIC_API_KEY_MISSING: No Anthropic Claude API key provided.', 401, true);
  }

  const cleanText = text.trim();
  const isExplicitStrategy = isExplicitStrategyIntent(cleanText, chatHistory);
  const resolvedModel = resolveClaudeModel(model);
  const startTime = Date.now();

  const strategyContextPrompt = (isExplicitStrategy && currentStrategy)
    ? `\n\nCURRENT EXISTING STRATEGY (Merge new changes while preserving unmentioned existing rules):\n${JSON.stringify(currentStrategy, null, 2)}` 
    : '';

  const directive = isExplicitStrategy
    ? `\n\n[USER DIRECTIVE: STRATEGY_BUILD]:
Synthesize the requested strategy into a valid StrategyDSL object with status 'SUCCESS'.
CRITICAL MULTI-TURN INSTRUCTION: Review the entire conversation history above. Incorporate all requirements specified by the user across turns (asset, timeframe, indicators, entry/exit rules, risk parameters, leverage). DO NOT re-ask for details already provided. Include full entry/exit conditions, indicators, and risk parameters.`
    : `\n\n[USER DIRECTIVE: CONVERSATIONAL_ONLY]: The user message is conversational, a greeting, or a general question. Respond with status 'CONVERSATIONAL', provide a direct, friendly, and helpful answer in 'conversationalResponse', and DO NOT include a 'strategy' object.`;

  const userPromptWithContext = `USER INPUT:\n"${cleanText}"${strategyContextPrompt}${directive}\n\nRespond with valid JSON:`;

  // Build Anthropic messages array (must alternate user and assistant)
  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

  if (chatHistory && chatHistory.length > 0) {
    const recent = chatHistory.slice(-10);
    let lastRole: string | null = null;

    for (const msg of recent) {
      if (!msg.content || msg.content.trim().startsWith('👋 Welcome')) continue;
      const role = msg.role === 'assistant' ? 'assistant' : 'user';
      
      // Anthropic requires strictly alternating user/assistant turns
      if (role === lastRole) {
        // Append to previous turn
        messages[messages.length - 1].content += `\n\n${msg.content.slice(0, 800)}`;
      } else {
        messages.push({
          role,
          content: msg.content.slice(0, 800)
        });
        lastRole = role;
      }
    }
  }

  // Ensure last message is from user
  if (messages.length === 0 || messages[messages.length - 1].role !== 'user') {
    messages.push({ role: 'user', content: userPromptWithContext });
  } else {
    messages[messages.length - 1].content += `\n\n${userPromptWithContext}`;
  }

  // Candidate models fallback chain inside Anthropic
  const candidateModels = Array.from(new Set([
    resolvedModel,
    'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku-20241022'
  ]));

  let lastError: Error | null = null;

  for (const candidate of candidateModels) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': effectiveKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: candidate,
          max_tokens: isExplicitStrategy ? 1500 : 800,
          temperature: isExplicitStrategy ? 0.1 : 0.4,
          system: CLAUDE_SYSTEM_PROMPT,
          messages
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        let parsedErrMsg = errText;
        try {
          const errObj = JSON.parse(errText);
          parsedErrMsg = errObj?.error?.message || errText;
        } catch {}

        // Check if error is due to credit balance, rate limit (429), or overloaded (529)
        const isQuotaOrCredit = 
          response.status === 429 || 
          response.status === 529 ||
          parsedErrMsg.toLowerCase().includes('credit balance is too low') ||
          parsedErrMsg.toLowerCase().includes('rate limit') ||
          parsedErrMsg.toLowerCase().includes('quota') ||
          parsedErrMsg.toLowerCase().includes('overloaded');

        if (isQuotaOrCredit) {
          throw new ClaudeLimitReachedError(
            `Claude API Limit / Quota Reached (${response.status}): ${parsedErrMsg}`,
            response.status,
            parsedErrMsg.toLowerCase().includes('credit balance is too low')
          );
        }

        throw new Error(`Claude API error (${response.status}): ${parsedErrMsg}`);
      }

      const data = await response.json();
      const contentBlock = data?.content?.[0];
      const rawText = contentBlock?.type === 'text' ? contentBlock.text : '';

      if (!rawText) {
        throw new Error('Claude returned empty content block.');
      }

      // Extract JSON from response
      let parsedJson: any = null;
      try {
        parsedJson = JSON.parse(rawText);
      } catch {
        const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          parsedJson = JSON.parse(jsonMatch[1]);
        } else {
          const firstBrace = rawText.indexOf('{');
          const lastBrace = rawText.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            parsedJson = JSON.parse(rawText.substring(firstBrace, lastBrace + 1));
          }
        }
      }

      if (!parsedJson) {
        throw new Error('Failed to parse valid JSON from Claude output.');
      }

      const latencyMs = Date.now() - startTime;

      if (parsedJson.status === 'SUCCESS' && parsedJson.strategy) {
        const normalized = normalizeStrategyDSL(parsedJson.strategy, cleanText);
        const verifiedPreview = processAndVerifyGeminiResponse(
          {
            status: 'SUCCESS',
            strategy: normalized,
            reasoning: parsedJson.reasoning || 'Synthesized using quantitative neural modeling.',
            riskAssessment: parsedJson.riskAssessment || 'Validated by institutional risk guardrails.',
            suggestedTweaks: parsedJson.suggestedTweaks || []
          },
          cleanText,
          'AlgoRush Copilot',
          latencyMs,
          chatHistory
        );

        return {
          ...verifiedPreview,
          modelUsed: 'AlgoRush Copilot',
          latencyMs
        };
      }

      return {
        status: 'CONVERSATIONAL',
        conversationalResponse: parsedJson.conversationalResponse || parsedJson.reasoning || rawText,
        suggestedTweaks: parsedJson.suggestedTweaks || [],
        modelUsed: 'AlgoRush Copilot',
        latencyMs
      };

    } catch (err: any) {
      if (err instanceof ClaudeLimitReachedError) {
        // Immediately propagate limit reached error so failover to Groq can happen
        throw err;
      }
      lastError = err;
    }
  }

  throw lastError || new Error('All Anthropic Claude model attempts failed.');
}

/**
 * Test Anthropic Claude API Key connectivity and status
 */
export async function testClaudeApiKey(
  apiKey: string,
  model: string = 'claude-3-7-sonnet-20250219'
): Promise<{
  valid: boolean;
  limitReached?: boolean;
  modelVerified?: string;
  latencyMs?: number;
  message?: string;
  error?: string;
}> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    return { valid: false, error: 'Anthropic Claude API key is required' };
  }

  const resolved = resolveClaudeModel(model);
  const startTime = Date.now();

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': cleanKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: resolved,
        max_tokens: 20,
        messages: [{ role: 'user', content: 'Say OK' }]
      })
    });

    const latencyMs = Date.now() - startTime;

    if (res.ok) {
      return {
        valid: true,
        limitReached: false,
        modelVerified: model.includes('3-7') ? 'Claude 3.7 Sonnet' : 'Claude 3.5 Sonnet',
        latencyMs,
        message: 'Anthropic Claude API is fully operational.'
      };
    }

    const bodyText = await res.text();
    let errorMsg = bodyText;
    let errType = '';
    try {
      const errJson = JSON.parse(bodyText);
      errorMsg = errJson?.error?.message || bodyText;
      errType = errJson?.error?.type || '';
    } catch {}

    // Check if key is authenticated but has hit credit/rate limits
    const isCreditExhausted = errorMsg.toLowerCase().includes('credit balance is too low');
    const isRateLimited = res.status === 429 || errorMsg.toLowerCase().includes('rate limit');
    const isOverloaded = res.status === 529 || errorMsg.toLowerCase().includes('overloaded');

    if (isCreditExhausted || isRateLimited || isOverloaded) {
      return {
        valid: true,
        limitReached: true,
        modelVerified: model.includes('3-7') ? 'Claude 3.7 Sonnet' : 'Claude 3.5 Sonnet',
        latencyMs,
        message: isCreditExhausted
          ? 'Claude key authenticated! Credit balance reached — Auto-Groq LPUs™ will handle all requests with zero downtime.'
          : 'Claude key authenticated! Rate limit reached — Auto-Groq LPUs™ will handle failover.'
      };
    }

    if (res.status === 401 || errType === 'authentication_error') {
      return {
        valid: false,
        error: 'Invalid Anthropic API Key. Please verify your sk-ant-api03 key.'
      };
    }

    return {
      valid: false,
      error: `Claude API error (${res.status}): ${errorMsg}`
    };
  } catch (err: any) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : 'Network error testing Anthropic Claude API'
    };
  }
}
