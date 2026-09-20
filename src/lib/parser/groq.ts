import { StrategyDSL } from '../types/strategy';
import { 
  isExplicitStrategyIntent, 
  processAndVerifyGeminiResponse
} from './gemini';
import { normalizeStrategyDSL } from './strategyNormalizer';

export interface GroqChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface GroqParseOptions {
  text: string;
  model?: string;
  apiKey?: string;
  currentStrategy?: StrategyDSL | null;
  chatHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface GroqParseResponse {
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
}

const GROQ_SYSTEM_QUANT_PROMPT = `You are an institutional quantitative trading copilot for AlgoRush, powered by Groq LPUs™.
You formulate, audit, and mathematically evaluate high-frequency, algorithmic, and quantitative trading systems.

You handle two strictly distinct types of user interactions:

1. CONVERSATIONAL / QUESTIONS / GREETINGS (NORMAL MESSAGES):
- GREETINGS (e.g. "hi", "hello", "hey", "how are you"):
  Respond warmly, concisely, and naturally (2-3 sentences). Greet the user, offer assistance with trading questions or strategy design. DO NOT return any strategy or technical lectures.
- CONCEPTUAL & TRADING INQUIRIES (e.g. "what is RSI", "explain EMA vs SMA", "how does Kelly Criterion work"):
  Provide a clear, mathematically grounded markdown explanation with formulas ($LaTeX$) and Python CCXT snippets. DO NOT build or return a strategy!
- Output JSON format:
  {
    "status": "CONVERSATIONAL",
    "conversationalResponse": "your friendly, articulate response in markdown",
    "suggestedTweaks": []
  }

2. STRATEGY BUILDING REQUESTS & ALGORITHMIC DIRECTIVES:
- When the user asks to build, create, generate, code, design, or assemble a strategy/bot/algorithm (e.g. "build a strategy for BTC", "make me an ETH strategy", "create a scalping bot", "can you build a strategy with 50 and 200 EMA"), OR gives explicit trading rules ("buy when...", "long ETH when..."):
  YOU MUST RETURN A COMPLETE EXECUTABLE StrategyDSL OBJECT with status "SUCCESS"!
  DO NOT ask for clarification or refuse to build! If the user did not specify exact indicators or timeframes (e.g. "build a strategy for BTC"), intelligently synthesize a premier institutional quantitative strategy for that asset (e.g. 20/50 EMA trend crossover with RSI momentum confirmation, 15m or 1h timeframe, SL 2.5%, TP 6%, 5x leverage) with full entryConditions, action, exitConditions, and riskParameters!
  Output JSON format:
  {
    "status": "SUCCESS",
    "strategy": {
      "name": "Concise Institutional Title",
      "instruments": [{"symbol": "BTC/USDT", "assetClass": "CRYPTO"}],
      "timeframe": "15m",
      "action": {
        "type": "BUY",
        "orderType": "MARKET",
        "quantityType": "PERCENT_OF_ACCOUNT",
        "quantityValue": 50,
        "leverage": 10
      },
      "entryConditions": [
        {
          "label": "20 EMA Crosses Above 50 EMA",
          "left": {"type": "EMA", "parameters": {"period": 20}},
          "comparator": "CROSSES_ABOVE",
          "right": {"type": "EMA", "parameters": {"period": 50}},
          "logicalOperator": "AND"
        },
        {
          "label": "RSI(14) < 35 (Oversold)",
          "left": {"type": "RSI", "parameters": {"period": 14}},
          "comparator": "LESS_THAN",
          "right": 35,
          "logicalOperator": "AND"
        }
      ],
      "exitConditions": [
        {
          "label": "RSI(14) > 70 (Overbought Exit)",
          "left": {"type": "RSI", "parameters": {"period": 14}},
          "comparator": "GREATER_THAN",
          "right": 70,
          "logicalOperator": "OR"
        }
      ],
      "riskParameters": {
        "stopLossPercentage": 2.5,
        "takeProfitPercentage": 6.0,
        "trailingStopPercentage": 1.5,
        "leverage": 10
      }
    },
    "reasoning": "### Mathematical Edge & Confluence Thesis\\n\\n1. **Confluence Edge**: [Explain how the primary trend filter and secondary oscillator combine to filter false breakouts and establish positive expected value E[R] > 0]\\n2. **Regime Sensitivity**: [Explain performance across trending vs choppy volatility regimes]\\n3. **Execution Microstructure**: [Order type and fee impact on expected payoff]",
    "riskAssessment": "### Institutional Liquidation & Risk Audit\\n\\n1. **Liquidation Barrier**: With [X]x leverage, distance to liquidation is approximately ~[Y]% vs [Z]% Stop-Loss, providing a [W]x safety buffer.\\n2. **Drawdown & Volatility Shock**: [Tail risk during liquidation cascade or flash crash]\\n3. **Position Sizing & Kelly Fraction**: [Recommended capital allocation per trade based on win-rate and payoff ratio]",
    "suggestedTweaks": [
      "Add dynamic ATR(14) volatility-adjusted trailing stop to lock in alpha during parabolic expansions",
      "Incorporate Volume expansion threshold (> 1.5x 20 SMA) to prevent entering during low-liquidity traps",
      "Add higher-timeframe 200 EMA macro filter to eliminate counter-trend entries"
    ]
  }

CRITICAL:
- Supported indicator types for 'left' or 'right': EMA, SMA, WMA, HMA, RSI, MACD, MACD_SIGNAL, MACD_HISTOGRAM, BOLLINGER_BANDS, BOLLINGER_UPPER, BOLLINGER_LOWER, BOLLINGER_MIDDLE, VWAP, ATR, SUPERTREND, ADX, STOCHASTIC_K, STOCHASTIC_D, CCI, OBV, WILLIAMS_R, ICHIMOKU_TENKAN, ICHIMOKU_KIJUN, VOLUME, VOLUME_SMA, FUNDING_RATE, PRICE.
- Always provide rigorous institutional mathematical reasoning ($LaTeX$ equations, E[R] positive expectancy formula, Kelly criterion position sizing).
- NEVER return a 'strategy' object or status 'SUCCESS' for greetings or normal educational questions like 'what is RSI?'!`;

/**
 * Resolves model name aliases to active Groq frontier model identifiers.
 * Connects directly to real ultra-fast Groq LPU models:
 * - openai/gpt-oss-120b (120B reasoning model)
 * - qwen/qwen3.8-27b (high-speed frontier reasoning model)
 */
export function resolveGroqModel(modelName?: string): string {
  if (!modelName) return 'openai/gpt-oss-120b';
  const m = modelName.trim().toLowerCase();
  if (m === 'groq-gpt-120b' || m.includes('120b') || m.includes('gpt-oss-120b')) {
    return 'openai/gpt-oss-120b';
  }
  if (m === 'groq-qwen-27b' || m.includes('qwen') || m.includes('27b')) {
    return 'qwen/qwen3.8-27b';
  }
  if (m.includes('20b')) {
    return 'openai/gpt-oss-20b';
  }
  if (m.includes('compound')) {
    return 'groq/compound-mini';
  }
  return 'openai/gpt-oss-120b';
}

/**
 * Executes strategy parsing and quant conversational reasoning using Groq LPUs.
 */
export async function parseStrategyWithGroq(options: GroqParseOptions): Promise<GroqParseResponse> {
  const { text, model = 'groq/compound-mini', apiKey, chatHistory, currentStrategy } = options;

  const effectiveKey = apiKey?.trim() || process.env.GROQ_API_KEY?.trim();
  if (!effectiveKey) {
    throw new Error('GROQ_API_KEY_MISSING: No Groq API key provided in environment or request.');
  }

  const cleanText = text.trim();
  const isExplicitStrategy = isExplicitStrategyIntent(cleanText);

  const resolvedModel = resolveGroqModel(model);
  const startTime = Date.now();

  const strategyContextPrompt = (isExplicitStrategy && currentStrategy)
    ? `\n\nCURRENT EXISTING STRATEGY (Merge new changes while preserving unmentioned existing rules):\n${JSON.stringify(currentStrategy, null, 2)}` 
    : '';

  const directive = isExplicitStrategy
    ? `\n\n[USER DIRECTIVE: STRATEGY_BUILD]: Synthesize the requested strategy into a valid StrategyDSL object with status 'SUCCESS'. Include full entry/exit conditions, indicators, and risk parameters.`
    : `\n\n[USER DIRECTIVE: CONVERSATIONAL_ONLY]: The user message is conversational, a greeting, or a general question. Respond with status 'CONVERSATIONAL', provide a direct, friendly, and helpful answer in 'conversationalResponse', and DO NOT include a 'strategy' object.`;

  const userPromptWithContext = `USER INPUT:\n"${cleanText}"${strategyContextPrompt}${directive}\n\nRespond with valid JSON:`;

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: GROQ_SYSTEM_QUANT_PROMPT }
  ];

  // Append recent chat history (compact: last 3 messages to conserve TPM quota)
  if (chatHistory && chatHistory.length > 0) {
    const recent = chatHistory.slice(-3);
    for (const msg of recent) {
      if (!msg.content || msg.content.trim().startsWith('👋 Welcome')) continue;
      messages.push({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content.slice(0, 500) // Truncate long messages to prevent 429 rate limit
      });
    }
  }

  messages.push({ role: 'user', content: userPromptWithContext });

  // Prioritize real Groq models with multi-model fallback chain:
  const candidateModels = Array.from(new Set([
    resolvedModel,
    'openai/gpt-oss-120b',
    'qwen/qwen3.8-27b',
    'groq/compound-mini'
  ]));

  let lastError: Error | null = null;

  for (const candidate of candidateModels) {
    let attempts = 0;
    const maxAttempts = 2; // Allow 1 retry if rate limit wait is brief

    while (attempts < maxAttempts) {
      attempts++;
      try {
        const requestBody: any = {
          model: candidate,
          response_format: { type: 'json_object' },
          messages,
          temperature: isExplicitStrategy ? 0.1 : 0.4,
          max_completion_tokens: candidate.includes('qwen') ? 600 : isExplicitStrategy ? 850 : 500
        };

        if (candidate.includes('120b') || candidate.includes('gpt-oss')) {
          requestBody.reasoning_effort = 'low';
        }

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${effectiveKey}`
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          const errText = await response.text();
          let parsedErrMsg = errText;
          try {
            const errObj = JSON.parse(errText);
            parsedErrMsg = errObj?.error?.message || errText;
          } catch {}

          // Handle 429 rate limit backoff if brief wait requested
          if (response.status === 429 && attempts < maxAttempts) {
            let waitSeconds = 2.0;
            const msMatch = parsedErrMsg.match(/try again in ([\d\.]+)ms/i);
            const secMatch = parsedErrMsg.match(/try again in ([\d\.]+)s/i);
            if (msMatch) {
              waitSeconds = parseFloat(msMatch[1]) / 1000;
            } else if (secMatch) {
              waitSeconds = parseFloat(secMatch[1]);
            }

            if (waitSeconds <= 12.0) {
              const waitMs = Math.ceil(waitSeconds * 1000) + 300;
              await new Promise(res => setTimeout(res, waitMs));
              continue; // Retry once
            }
          }

          throw new Error(`Groq API error (${response.status}): ${parsedErrMsg}`);
        }

        const data = await response.json();
        const choice = data?.choices?.[0];
        const content = choice?.message?.content;
        const modelReasoning = choice?.message?.reasoning;

      if (!content) {
        throw new Error('Groq returned empty response content.');
      }

      let parsed: any;
      try {
        parsed = JSON.parse(content);
      } catch (jsonErr) {
        const match = content.match(/\{[\s\S]*\}/);
        if (match) {
          parsed = JSON.parse(match[0]);
        } else {
          throw jsonErr;
        }
      }

      // Attach model's deep chain-of-thought / reasoning tokens if present
      if (modelReasoning && typeof modelReasoning === 'string' && modelReasoning.trim().length > 0) {
        if (!parsed.reasoning) {
          parsed.reasoning = `### Institutional Model Reasoning\n\n${modelReasoning.trim()}`;
        } else if (!parsed.reasoning.includes(modelReasoning.slice(0, 40))) {
          parsed.reasoning = `${parsed.reasoning}\n\n### Model Chain-of-Thought\n${modelReasoning.trim()}`;
        }
      }

      // INTENT ENFORCEMENT & UNIVERSAL STRATEGY NORMALIZATION:
      if (isExplicitStrategy && parsed?.strategy) {
        parsed.status = 'SUCCESS';
        parsed.strategy = normalizeStrategyDSL(parsed.strategy, `Groq Quant Strategy`);
        if (!parsed.strategy.id) {
          parsed.strategy.id = `groq-strat-${Date.now()}`;
        }
      } else if (!isExplicitStrategy || parsed.status === 'CONVERSATIONAL') {
        parsed.status = 'CONVERSATIONAL';
        delete parsed.strategy;
        delete parsed.riskAssessment;
        delete parsed.reasoning;
        parsed.suggestedTweaks = [];
        if (!parsed.conversationalResponse) {
          parsed.conversationalResponse = typeof parsed.content === 'string' ? parsed.content : "Here is the quantitative analysis you requested.";
        }
      } else if (parsed?.strategy) {
        parsed.status = 'SUCCESS';
        parsed.strategy = normalizeStrategyDSL(parsed.strategy, `Groq Quant Strategy`);
        if (!parsed.strategy.id) {
          parsed.strategy.id = `groq-strat-${Date.now()}`;
        }
      }

      const latencyMs = Date.now() - startTime;
      const modelDisplayName = candidate === 'openai/gpt-oss-120b' 
        ? 'Groq GPT-OSS 120B' 
        : candidate === 'qwen/qwen3.8-27b' 
          ? 'Groq Qwen 27B' 
          : candidate === 'openai/gpt-oss-20b'
            ? 'Groq GPT-OSS 20B'
            : candidate.includes('compound')
              ? 'Groq Compound Mini'
              : 'Groq Ultra-Fast AI';

      // Run verification & quality audit
      const verified = processAndVerifyGeminiResponse(
        parsed,
        cleanText,
        modelDisplayName,
        latencyMs
      );

      return {
        ...verified,
        modelUsed: modelDisplayName,
        latencyMs
      };
    } catch (err: any) {
      lastError = err;
      console.warn(`Groq candidate model ${candidate} failed, trying next candidate:`, err?.message || err);
      break; // Move to next candidate model
    }
  }
}

  throw lastError || new Error('Groq API call failed across all candidate models.');
}

/**
 * Fast ping test for Groq API key authentication and latency measurement.
 */
export async function testGroqApiKey(
  apiKey: string, 
  model: string = 'openai/gpt-oss-120b'
): Promise<{ valid: boolean; modelVerified?: string; latencyMs?: number; error?: string }> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    return { valid: false, error: 'API key is required' };
  }

  const resolved = resolveGroqModel(model);
  const candidates = [resolved, 'openai/gpt-oss-120b', 'qwen/qwen3.8-27b'];
  const uniqueCandidates = Array.from(new Set(candidates));

  const startTime = Date.now();
  let lastError = '';

  for (const m of uniqueCandidates) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cleanKey}`
        },
        body: JSON.stringify({
          model: m,
          messages: [{ role: 'user', content: 'Respond with valid JSON: {"status":"OK"}' }],
          response_format: { type: 'json_object' },
          max_completion_tokens: 32
        })
      });

      const latencyMs = Date.now() - startTime;

      if (res.ok) {
        return { 
          valid: true, 
          modelVerified: m === 'openai/gpt-oss-120b' ? 'Groq GPT-OSS 120B' : 'Groq Qwen 27B',
          latencyMs 
        };
      }

      const body = await res.text();
      let msg = body;
      try {
        const json = JSON.parse(body);
        msg = json?.error?.message || body;
      } catch {}

      lastError = msg;
      if (res.status === 401 || res.status === 403) {
        return { valid: false, error: msg };
      }
    } catch (err: any) {
      lastError = err instanceof Error ? err.message : 'Connection failed';
    }
  }

  return { valid: false, error: lastError || 'Failed to authenticate with Groq API' };
}
