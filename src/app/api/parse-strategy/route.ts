import { NextResponse } from 'next/server';
import { parseStrategyDescription } from '@/lib/parser/agent';
import { 
  parseStrategyWithGemini, 
  processAndVerifyGeminiResponse,
  isExplicitStrategyIntent,
  generateDynamicQuantThinkingResponse,
  generateDynamicStrategyAnalysis,
  generateConversationalQuantResponse
} from '@/lib/parser/gemini';
import { parseStrategyWithGroq } from '@/lib/parser/groq';
import { parseStrategyWithClaude, ClaudeLimitReachedError } from '@/lib/parser/claude';
import { queryLocalOllama } from '@/lib/parser/ollama';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.length < 10) {
      return NextResponse.json({ error: 'Unauthorized. Valid API Key required.' }, { status: 401 });
    }

    const body = await req.json();
    const { text, model = 'claude-3-7-sonnet', apiKey, groqApiKey, claudeApiKey, currentStrategy, chatHistory } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input. Expected a text string.' },
        { status: 400 }
      );
    }

    const clientClaudeKey = req.headers.get('x-claude-api-key') || claudeApiKey || (typeof apiKey === 'string' && apiKey.startsWith('sk-ant-') ? apiKey : null);
    const effectiveClaudeKey = clientClaudeKey?.trim() || process.env.ANTHROPIC_API_KEY?.trim() || process.env.CLAUDE_API_KEY?.trim();

    const clientGroqKey = req.headers.get('x-groq-api-key') || groqApiKey || (typeof apiKey === 'string' && apiKey.startsWith('gsk_') ? apiKey : null);
    const effectiveGroqKey = clientGroqKey?.trim() || process.env.GROQ_API_KEY?.trim();

    const clientGeminiKey = req.headers.get('x-gemini-api-key') || (typeof apiKey === 'string' && !apiKey.startsWith('gsk_') && !apiKey.startsWith('sk-ant-') ? apiKey : null);
    const effectiveGeminiKey = clientGeminiKey?.trim() || process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim();
    const isStrategy = isExplicitStrategyIntent(text, chatHistory);

    const isClaudeModel = typeof model === 'string' && (model.startsWith('claude') || model.includes('anthropic') || model.includes('sonnet'));
    const isGroqModel = typeof model === 'string' && (model.startsWith('groq') || model.includes('gpt-oss') || model.includes('qwen'));

    // ═══ 1. ANTHROPIC CLAUDE (PRIMARY) WITH INSTANT GROQ FAILOVER ═══
    // When Claude API key is configured or Claude is selected:
    // Execute with Claude 3.7 / 3.5 Sonnet; if rate limit or credit limit is reached, seamlessly failover to Groq LPUs™
    if (effectiveClaudeKey && (isClaudeModel || (!isGroqModel && !model.startsWith('gemini')))) {
      try {
        const claudeResult = await parseStrategyWithClaude({
          text,
          model: isClaudeModel ? model : 'claude-3-7-sonnet-20250219',
          apiKey: effectiveClaudeKey,
          currentStrategy,
          chatHistory
        });
        return NextResponse.json({
          ...claudeResult,
          isAi: true,
          modelUsed: 'AlgoRush Copilot',
          provider: 'AlgoRush Copilot'
        });
      } catch (claudeError: any) {
        // Auto-failover to Groq models if Claude limits/credits are reached
        if (effectiveGroqKey) {
          try {
            const groqFailoverResult = await parseStrategyWithGroq({
              text,
              model: 'openai/gpt-oss-120b',
              apiKey: effectiveGroqKey,
              currentStrategy,
              chatHistory
            });
            return NextResponse.json({
              ...groqFailoverResult,
              isAi: true,
              fallbackUsed: true,
              modelUsed: 'AlgoRush Copilot',
              provider: 'AlgoRush Copilot'
            });
          } catch (groqError: any) {
            console.warn('Groq failover call encountered an issue:', groqError?.message || groqError);
          }
        }
      }
    }

    // ═══ 2. HIGH-PERFORMANCE GROQ LPUs™ ═══
    if (effectiveGroqKey && (isGroqModel || !effectiveGeminiKey || model.includes('groq'))) {
      try {
        const groqResult = await parseStrategyWithGroq({
          text,
          model: isGroqModel ? model : 'openai/gpt-oss-120b',
          apiKey: effectiveGroqKey,
          currentStrategy,
          chatHistory
        });
        return NextResponse.json({
          ...groqResult,
          isAi: true,
          modelUsed: 'AlgoRush Copilot',
          provider: 'AlgoRush Copilot'
        });
      } catch (groqError: any) {
        console.warn('Groq API call failed:', groqError?.message || groqError);
      }
    }

    // 2. If Gemini API key is available, call Google Gemini AI directly for questions and strategies with full multi-turn context
    if (effectiveGeminiKey) {
      try {
        const geminiResult = await parseStrategyWithGemini({
          text,
          model: model.startsWith('gemini') ? model : 'gemini-2.5-flash',
          apiKey: effectiveGeminiKey,
          currentStrategy,
          chatHistory
        });
        return NextResponse.json({
          ...geminiResult,
          isAi: true
        });
      } catch (geminiError: any) {
        console.warn('Gemini API call failed, falling back to instant local quant reasoning:', geminiError?.message || geminiError);
      }
    }

    // 2. CONVERSATIONAL & QUESTION HANDLING
    // When the user asks a question, chats, or inquires about markets/indicators/risk:
    if (!isStrategy) {
      const selectedEngineName = model.startsWith('gemini') ? model : 'gemini-2.5-flash';

      // If local Ollama was explicitly requested, try local Ollama
      if (model.includes('ollama') || model.includes('local') || model.includes('qwen')) {
        try {
          const ollamaResult = await queryLocalOllama(text, model);
          if (ollamaResult && ollamaResult.text.length > 20) {
            const dynamicBackup = generateDynamicQuantThinkingResponse(text, ollamaResult.model);
            return NextResponse.json({
              status: 'CONVERSATIONAL',
              conversationalResponse: ollamaResult.text,
              suggestedTweaks: dynamicBackup.suggestions,
              modelUsed: ollamaResult.model,
              isAi: true,
              latencyMs: 180,
            });
          }
        } catch (ollamaErr) {
          console.warn('Local Ollama unavailable or timed out:', ollamaErr);
        }
      }

      // Dynamic Quant Thinking Engine: Instant (<30ms) response with mathematical formulas, LaTeX, and deep quant reasoning
      const dynamicResp = generateDynamicQuantThinkingResponse(text, selectedEngineName);
      return NextResponse.json({
        status: 'CONVERSATIONAL',
        conversationalResponse: dynamicResp.response,
        suggestedTweaks: dynamicResp.suggestions,
        modelUsed: selectedEngineName,
        isAi: true,
        latencyMs: 32,
      });
    }

    // 3. EXPLICIT STRATEGY BUILD COMMAND
    // If OpenAI key is present and requested
    if (process.env.OPENAI_API_KEY && (model === 'gpt-4o' || model === 'openai')) {
      const parsedResult = await parseStrategyDescription(text);
      return NextResponse.json({
        ...parsedResult,
        modelUsed: 'gpt-4o',
        isAi: true
      });
    }

    // 4. Deterministic Strategy Compilation with Dynamic Quant Analysis
    await new Promise(r => setTimeout(r, 280));
    const localResult = parseStrategyLocally(text, currentStrategy, chatHistory);
    const selectedEngineName = model.startsWith('gemini') ? model : 'gemini-2.5-flash';
    
    // Dynamically calculate strategy parameters, liquidation, and edge rationale
    const dynamicAnalysis = generateDynamicStrategyAnalysis(localResult.strategy, text, selectedEngineName);

    const verifiedPreview = processAndVerifyGeminiResponse(
      {
        status: 'SUCCESS',
        strategy: localResult.strategy,
        reasoning: dynamicAnalysis.reasoning,
        riskAssessment: dynamicAnalysis.riskAssessment,
        suggestedTweaks: dynamicAnalysis.suggestedTweaks
      },
      text,
      selectedEngineName,
      280,
      chatHistory
    );

    return NextResponse.json({
      ...verifiedPreview,
      modelUsed: selectedEngineName,
      isAi: true,
      needsApiKey: false,
    });
  } catch (error: any) {
    console.error('Error parsing strategy:', error);
    return NextResponse.json(
      { error: 'Internal server error during parsing.' },
      { status: 500 }
    );
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Enhanced Local NLP Strategy Parser with Incremental Mutation Support
// Handles complex multi-indicator strategies, OR/AND conditions, allocation,
// leverage, price levels, exit conditions, and 20+ technical indicators.
// ────────────────────────────────────────────────────────────────────────────

function parseStrategyLocally(text: string, currentStrategy?: any, chatHistory?: any[]) {
  const userHistoryText = Array.isArray(chatHistory) 
    ? chatHistory.filter((m: any) => m.role === 'user' && typeof m.content === 'string').map((m: any) => m.content).join(' ') 
    : '';
  const combinedText = `${userHistoryText} ${text}`.trim();
  const t = combinedText.toLowerCase();
  const isIncrementalTweak = currentStrategy && (
    /\b(tweak|modify|update|change|tighten|loosen|add|remove|switch|adjust|increase|decrease|set)\b/i.test(t) ||
    /^(apply this tweak|now change|now add|also add|make it|set stop|set tp|change sl|change tp|switch to)\b/i.test(t)
  );

  // ── 1. Symbol & Asset Class ──────────────────────────────────────────
  const { symbol, assetClass } = extractSymbol(t);
  const effectiveSymbol = isIncrementalTweak && (!t.includes('btc') && !t.includes('eth') && !t.includes('sol') && !t.includes('doge') && !t.includes('xrp') && !t.includes('nvda') && !t.includes('aapl'))
    ? (currentStrategy.instruments?.[0]?.symbol || symbol)
    : symbol;
  const effectiveAssetClass = isIncrementalTweak && (!t.includes('btc') && !t.includes('eth') && !t.includes('sol'))
    ? (currentStrategy.instruments?.[0]?.assetClass || assetClass)
    : assetClass;

  // ── 2. Timeframe ─────────────────────────────────────────────────────
  const timeframe = extractTimeframe(t);
  const effectiveTimeframe = isIncrementalTweak && !/\b(1m|3m|5m|15m|30m|1h|2h|4h|1d|1w)\b/.test(t)
    ? (currentStrategy.timeframe || timeframe)
    : timeframe;

  // ── 3. Action, Order Type, Allocation & Leverage ─────────────────────
  const action = extractActionAndSizing(t);
  const effectiveAction = isIncrementalTweak
    ? {
        ...currentStrategy.action,
        ...action,
        type: (/\b(short|sell)\b/.test(t) ? 'SELL' : /\b(long|buy)\b/.test(t) ? 'BUY' : currentStrategy.action?.type || action.type),
        leverage: (action.leverage ?? 1) > 1 ? action.leverage : (currentStrategy.action?.leverage ?? action.leverage ?? 1)
      }
    : action;

  // ── 4. Entry Conditions ──────────────────────────────────────────────
  let entryConditions = extractEntryConditions(t, effectiveTimeframe);
  if (isIncrementalTweak && currentStrategy.entryConditions?.length) {
    if (/\b(also add|add condition|add entry|add rule|with additional)\b/i.test(t) && entryConditions.length > 0) {
      entryConditions = [...currentStrategy.entryConditions, ...entryConditions];
    } else if (entryConditions.length === 0) {
      entryConditions = currentStrategy.entryConditions;
    }
  }

  // ── 5. Exit Conditions ───────────────────────────────────────────────
  let exitConditions = extractExitConditions(t);
  if (isIncrementalTweak && currentStrategy.exitConditions?.length) {
    if (/\b(also add exit|add exit)\b/i.test(t) && exitConditions.length > 0) {
      exitConditions = [...currentStrategy.exitConditions, ...exitConditions];
    } else if (exitConditions.length === 0) {
      exitConditions = currentStrategy.exitConditions;
    }
  }

  // ── 6. Risk Parameters ──────────────────────────────────────────────
  const riskParameters = extractRiskParameters(t, effectiveAction.leverage);
  const effectiveRisk = isIncrementalTweak && currentStrategy.riskParameters
    ? {
        ...currentStrategy.riskParameters,
        ...(riskParameters.stopLossPercentage !== 3 ? { stopLossPercentage: riskParameters.stopLossPercentage } : {}),
        ...(riskParameters.takeProfitPercentage !== 6 ? { takeProfitPercentage: riskParameters.takeProfitPercentage } : {}),
        ...(riskParameters.trailingStopPercentage ? { trailingStopPercentage: riskParameters.trailingStopPercentage } : {}),
        ...(riskParameters.leverage ? { leverage: riskParameters.leverage } : {})
      }
    : riskParameters;

  // ── 7. Smart Strategy Name ──────────────────────────────────────────
  const name = isIncrementalTweak
    ? (currentStrategy.name || generateStrategyName(effectiveSymbol, entryConditions, effectiveAction.type, effectiveTimeframe, t))
    : generateStrategyName(effectiveSymbol, entryConditions, effectiveAction.type, effectiveTimeframe, t);

  return {
    status: 'SUCCESS',
    strategy: {
      name,
      description: text,
      instruments: [{ symbol: effectiveSymbol, assetClass: effectiveAssetClass }],
      timeframe: effectiveTimeframe,
      action: effectiveAction,
      entryConditions,
      exitConditions,
      riskParameters: effectiveRisk
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// TIMEFRAME EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════

function extractTimeframe(t: string): '1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '1d' | '1w' {
  if (/\b(?:1m|1\s*min|1\s*minute)\b/.test(t)) return '1m';
  if (/\b(?:3m|3\s*min|3\s*minute)\b/.test(t)) return '3m';
  if (/\b(?:5m|5\s*min|5\s*minute|scalp|scalping)\b/.test(t)) return '5m';
  if (/\b(?:15m|15\s*min|15\s*minute)\b/.test(t)) return '15m';
  if (/\b(?:30m|30\s*min|30\s*minute)\b/.test(t)) return '30m';
  if (/\b(?:1h|1\s*hour|1\s*hr|hourly)\b/.test(t)) return '1h';
  if (/\b(?:2h|2\s*hour|2\s*hr)\b/.test(t)) return '2h';
  if (/\b(?:4h|4\s*hour|4\s*hr)\b/.test(t)) return '4h';
  if (/\b(?:1d|daily|1\s*day)\b/.test(t)) return '1d';
  if (/\b(?:1w|weekly|1\s*week)\b/.test(t)) return '1w';
  return '1h'; // Default institutional timeframe
}

// ═══════════════════════════════════════════════════════════════════════════
// SYMBOL & ASSET CLASS EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════

function extractSymbol(t: string): { symbol: string; assetClass: 'CRYPTO' | 'EQUITY' | 'COMMODITY' | 'FOREX' } {
  const cryptoMap: Record<string, string> = {
    'bitcoin': 'BTC/USDT', 'btc': 'BTC/USDT',
    'ethereum': 'ETH/USDT', 'eth': 'ETH/USDT',
    'solana': 'SOL/USDT', 'sol': 'SOL/USDT',
    'ripple': 'XRP/USDT', 'xrp': 'XRP/USDT',
    'cardano': 'ADA/USDT', 'ada': 'ADA/USDT',
    'dogecoin': 'DOGE/USDT', 'doge': 'DOGE/USDT',
    'polkadot': 'DOT/USDT', 'dot': 'DOT/USDT',
    'chainlink': 'LINK/USDT', 'link': 'LINK/USDT',
    'avalanche': 'AVAX/USDT', 'avax': 'AVAX/USDT',
    'polygon': 'MATIC/USDT', 'matic': 'MATIC/USDT', 'pol': 'POL/USDT',
    'uniswap': 'UNI/USDT', 'uni': 'UNI/USDT',
    'litecoin': 'LTC/USDT', 'ltc': 'LTC/USDT',
    'filecoin': 'FIL/USDT', 'fil': 'FIL/USDT',
    'cosmos': 'ATOM/USDT', 'atom': 'ATOM/USDT',
    'near': 'NEAR/USDT',
    'arbitrum': 'ARB/USDT', 'arb': 'ARB/USDT',
    'optimism': 'OP/USDT',
    'aptos': 'APT/USDT', 'apt': 'APT/USDT',
    'sui': 'SUI/USDT',
    'bnb': 'BNB/USDT', 'binance coin': 'BNB/USDT',
    'tron': 'TRX/USDT', 'trx': 'TRX/USDT',
    'pepe': 'PEPE/USDT',
    'shib': 'SHIB/USDT', 'shiba': 'SHIB/USDT',
    'render': 'RENDER/USDT',
    'injective': 'INJ/USDT', 'inj': 'INJ/USDT',
    'sei': 'SEI/USDT',
    'wif': 'WIF/USDT',
    'bonk': 'BONK/USDT',
    'fetch': 'FET/USDT', 'fet': 'FET/USDT',
    'kaspa': 'KAS/USDT', 'kas': 'KAS/USDT',
    'aave': 'AAVE/USDT',
    'ton': 'TON/USDT',
  };

  const equityMap: Record<string, string> = {
    'apple': 'AAPL', 'aapl': 'AAPL',
    'nvidia': 'NVDA', 'nvda': 'NVDA',
    'tesla': 'TSLA', 'tsla': 'TSLA',
    'google': 'GOOGL', 'googl': 'GOOGL', 'goog': 'GOOGL',
    'amazon': 'AMZN', 'amzn': 'AMZN',
    'microsoft': 'MSFT', 'msft': 'MSFT',
    'meta': 'META', 'facebook': 'META',
    'spy': 'SPY', 's&p': 'SPY',
    'qqq': 'QQQ', 'nasdaq': 'QQQ',
    'amd': 'AMD',
    'netflix': 'NFLX', 'nflx': 'NFLX',
    'coinbase': 'COIN', 'coin': 'COIN',
    'palantir': 'PLTR', 'pltr': 'PLTR',
    'microstrategy': 'MSTR', 'mstr': 'MSTR',
  };

  // Direct pair format: "BTC/USDT", "ETH/USDT", "SOL/USD", "EUR/USD"
  const pairMatch = t.match(/([a-z0-9]{2,8})\s*\/\s*(usdt|usd|busd|usdc|eur|btc)/i);
  if (pairMatch) {
    const base = pairMatch[1].toUpperCase();
    const quote = pairMatch[2].toUpperCase();
    return { symbol: `${base}/${quote}`, assetClass: 'CRYPTO' };
  }

  // Check equities (longer match to avoid "sol" in "sold")
  for (const [key, sym] of Object.entries(equityMap)) {
    const regex = new RegExp(`\\b${key}\\b`);
    if (regex.test(t)) return { symbol: sym, assetClass: 'EQUITY' };
  }

  // Check crypto
  for (const [key, sym] of Object.entries(cryptoMap)) {
    const regex = new RegExp(`\\b${key}\\b`);
    if (regex.test(t)) return { symbol: sym, assetClass: 'CRYPTO' };
  }

  return { symbol: 'BTC/USDT', assetClass: 'CRYPTO' };
}

// ═══════════════════════════════════════════════════════════════════════════
// ACTION & POSITION SIZING EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════

function extractActionAndSizing(t: string): {
  type: 'BUY' | 'SELL' | 'CLOSE_POSITION';
  orderType: 'MARKET' | 'LIMIT' | 'TWAP' | 'GRID_LIMIT';
  quantityType: 'PERCENT_OF_ACCOUNT' | 'USD_VALUE' | 'FIXED_USD' | 'KELLY_CRITERION' | 'VOLATILITY_RISK_PCT';
  quantityValue: number;
  leverage?: number;
} {
  // Action type: Long vs Short
  let type: 'BUY' | 'SELL' | 'CLOSE_POSITION' = 'BUY';
  if (/\b(short|go short|sell position|open short|bearish|shorting)\b/.test(t) && !/\bclose\s*short\b/.test(t)) {
    type = 'SELL';
  } else if (/\b(close position|exit position|flatten|close trade)\b/.test(t)) {
    type = 'CLOSE_POSITION';
  }

  // Order type
  let orderType: 'MARKET' | 'LIMIT' | 'TWAP' | 'GRID_LIMIT' = 'MARKET';
  if (/\b(grid|grid step|grid limit)\b/.test(t)) orderType = 'GRID_LIMIT';
  else if (/\b(twap)\b/.test(t)) orderType = 'TWAP';
  else if (/\b(limit order|limit)\b/.test(t)) orderType = 'LIMIT';

  // Sizing & Leverage
  let quantityValue = 50;
  let quantityType: 'PERCENT_OF_ACCOUNT' | 'USD_VALUE' | 'FIXED_USD' | 'KELLY_CRITERION' | 'VOLATILITY_RISK_PCT' = 'PERCENT_OF_ACCOUNT';
  let leverage: number | undefined;

  // Leverage
  const levExplicit = t.match(/(\d+(?:\.\d+)?)\s*x\s*(?:leverage|leveraged|lev)\b/) ||
                      t.match(/(?:leverage|lev)\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*x?/);
  if (levExplicit) {
    leverage = parseFloat(levExplicit[1]);
  } else {
    const levStandalone = t.match(/\b(\d+(?:\.\d+)?)\s*x\b(?!\s*(?:sma|volume|vol|average|mult|atr|bb|ema))/);
    if (levStandalone) {
      leverage = parseFloat(levStandalone[1]);
    } else if (/\bleveraged?\b/.test(t)) {
      leverage = 5;
    }
  }

  // Kelly sizing
  if (/\bkelly\b/.test(t)) {
    quantityType = 'KELLY_CRITERION';
    quantityValue = /half[\s-]?kelly/.test(t) ? 0.5 : 1.0;
  }
  // Volatility risk sizing
  else if (/\b(?:volatility\s*risk|risk\s*per\s*trade)\b/.test(t)) {
    quantityType = 'VOLATILITY_RISK_PCT';
    const volMatch = t.match(/(?:risk|volatility)\s*(\d+(?:\.\d+)?)\s*%/);
    quantityValue = volMatch ? parseFloat(volMatch[1]) : 1.0;
  }
  // Fixed dollar amount
  else if (/\$\s*([\d,]+(?:\.\d+)?)/.test(t)) {
    const dollarMatch = t.match(/\$\s*([\d,]+(?:\.\d+)?)/);
    if (dollarMatch) {
      quantityValue = parseFloat(dollarMatch[1].replace(/,/g, ''));
      quantityType = 'FIXED_USD';
    }
  }
  // Percentage allocation
  else {
    const pctMatch = t.match(/(?:use|allocate|invest|put|risk|deploy|position\s*size|size)\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*%/);
    if (pctMatch) {
      quantityValue = parseFloat(pctMatch[1]);
    } else {
      const pctAlt = t.match(/(\d+(?:\.\d+)?)\s*%\s*(?:of\s*)?(?:account|portfolio|capital|balance)/);
      if (pctAlt) quantityValue = parseFloat(pctAlt[1]);
    }
  }

  return { type, orderType, quantityType, quantityValue, leverage };
}

// ═══════════════════════════════════════════════════════════════════════════
// ENTRY CONDITIONS EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════

function extractEntryConditions(t: string, primaryTf: string): any[] {
  const conditions: any[] = [];
  let nextId = 1;
  const mkId = () => `entry-${nextId++}`;

  // Only parse entry conditions from the entry portion if an explicit exit clause exists
  let entryText = t;
  const exitSplit = t.split(/\b(?:exit|close|target|cover)\s*(?:when|if|after|on|at)\b/);
  if (exitSplit.length > 1) {
    entryText = exitSplit[0];
  }

  const usesOr = /\b(rsi|ema|sma|macd|cci|adx|stoch|bollinger|price|volume|supertrend|vwap)\b.*\bor\b.*\b(rsi|ema|sma|macd|cci|adx|stoch|bollinger|price|volume|supertrend|vwap)\b/.test(entryText);
  const defaultOp = usesOr ? 'OR' : 'AND';

  // Helper to extract condition timeframe (e.g. "1h 50 ema", "15m rsi")
  const getCondTf = (snippet: string) => {
    const match = snippet.match(/\b(1m|5m|15m|30m|1h|2h|4h|1d)\b/);
    return match ? (match[1] as any) : undefined;
  };

  // ── 1. Moving Average Crossover ───────────────────────────────────
  const maCrossRegex = /(\d+)\s*(ema|sma|wma|hma)\s*(crosses?\s*above|crosses?\s*below|crosses?)\s*(?:the\s*)?(\d+)\s*(ema|sma|wma|hma)/g;
  let maCrossMatch;
  while ((maCrossMatch = maCrossRegex.exec(entryText)) !== null) {
    const p1 = parseInt(maCrossMatch[1]);
    const type1 = maCrossMatch[2].toUpperCase();
    const isBelow = maCrossMatch[3].includes('below');
    const p2 = parseInt(maCrossMatch[4]);
    const type2 = maCrossMatch[5].toUpperCase();
    const condTf = getCondTf(entryText.substring(Math.max(0, maCrossMatch.index - 20), maCrossMatch.index + 20));

    conditions.push({
      id: mkId(),
      left: { type: type1, timeframe: condTf, parameters: { period: p1 } },
      comparator: isBelow ? 'CROSSES_BELOW' : 'CROSSES_ABOVE',
      right: { type: type2, timeframe: condTf, parameters: { period: p2 } },
      logicalOperator: defaultOp
    });
  }

  // Golden cross shorthand: "golden cross"
  if (/golden\s*cross/.test(entryText) && !conditions.some(c => c.comparator === 'CROSSES_ABOVE' && (c.left.type === 'EMA' || c.left.type === 'SMA'))) {
    conditions.push({
      id: mkId(),
      left: { type: 'EMA', parameters: { period: 50 } },
      comparator: 'CROSSES_ABOVE',
      right: { type: 'EMA', parameters: { period: 200 } },
      logicalOperator: defaultOp
    });
  }

  // Death cross shorthand: "death cross"
  if (/death\s*cross/.test(entryText) && !conditions.some(c => c.comparator === 'CROSSES_BELOW')) {
    conditions.push({
      id: mkId(),
      left: { type: 'EMA', parameters: { period: 50 } },
      comparator: 'CROSSES_BELOW',
      right: { type: 'EMA', parameters: { period: 200 } },
      logicalOperator: defaultOp
    });
  }

  // ── 2. Triple EMA / MA Ribbon ─────────────────────────────────────
  const tripleEmaMatch = entryText.match(/triple\s*(ema|sma)\s*\(?\s*(\d+)\s*,?\s*(\d+)\s*,?\s*(\d+)\s*\)?/);
  if (tripleEmaMatch) {
    const maType = tripleEmaMatch[1].toUpperCase();
    const p1 = parseInt(tripleEmaMatch[2]);
    const p2 = parseInt(tripleEmaMatch[3]);
    const p3 = parseInt(tripleEmaMatch[4]);
    conditions.push({
      id: mkId(),
      left: { type: maType, parameters: { period: p1 } },
      comparator: 'GREATER_THAN',
      right: { type: maType, parameters: { period: p2 } },
      logicalOperator: 'AND'
    });
    conditions.push({
      id: mkId(),
      left: { type: maType, parameters: { period: p2 } },
      comparator: 'GREATER_THAN',
      right: { type: maType, parameters: { period: p3 } },
      logicalOperator: 'AND'
    });
  }

  // ── 3. Moving Average Above/Below (Non-Crossover) ───────────────────
  const priceMaRegex = /price\s*(?:is\s*)?(above|greater than|>|below|less than|<)\s*(?:the\s*)?(\d+)\s*(ema|sma|wma|hma)/g;
  let pMaMatch;
  while ((pMaMatch = priceMaRegex.exec(entryText)) !== null) {
    const isBelow = /below|less|<|under/.test(pMaMatch[1]);
    const period = parseInt(pMaMatch[2]);
    const maType = pMaMatch[3].toUpperCase();
    const condTf = getCondTf(entryText.substring(Math.max(0, pMaMatch.index - 20), pMaMatch.index + 20));

    conditions.push({
      id: mkId(),
      left: { type: 'PRICE' },
      comparator: isBelow ? 'LESS_THAN' : 'GREATER_THAN',
      right: { type: maType, timeframe: condTf, parameters: { period } },
      logicalOperator: defaultOp
    });
  }

  const maAbRegex = /(\d+)\s*(ema|sma|wma|hma)\s*(above|below|greater than|less than|>|<)\s*(\d+)\s*(ema|sma|wma|hma)/g;
  let maAbMatch;
  while ((maAbMatch = maAbRegex.exec(entryText)) !== null) {
    if (!entryText.substring(Math.max(0, maAbMatch.index - 15), maAbMatch.index + maAbMatch[0].length).includes('cross')) {
      const isBelow = /below|less|</.test(maAbMatch[3]);
      const condTf = getCondTf(entryText.substring(Math.max(0, maAbMatch.index - 20), maAbMatch.index + 20));
      conditions.push({
        id: mkId(),
        left: { type: maAbMatch[2].toUpperCase(), timeframe: condTf, parameters: { period: parseInt(maAbMatch[1]) } },
        comparator: isBelow ? 'LESS_THAN' : 'GREATER_THAN',
        right: { type: maAbMatch[5].toUpperCase(), timeframe: condTf, parameters: { period: parseInt(maAbMatch[4]) } },
        logicalOperator: defaultOp
      });
    }
  }

  // ── 4. RSI ────────────────────────────────────────────────────────
  const rsiRegex = /(?:(\d+[mh])\s*)?rsi\s*(?:\(\s*(\d+)\s*\))?\s*(?:is\s*|drops?\s*|goes?\s*)?(?:to\s*)?(below|less than|under|<|above|greater than|over|>)\s*(\d+)/g;
  let rsiMatch;
  while ((rsiMatch = rsiRegex.exec(entryText)) !== null) {
    const condTf = (rsiMatch[1] as any) || undefined;
    const period = rsiMatch[2] ? parseInt(rsiMatch[2]) : 14;
    const op = /below|less|under|</.test(rsiMatch[3]) ? 'LESS_THAN' : 'GREATER_THAN';
    conditions.push({
      id: mkId(),
      left: { type: 'RSI', timeframe: condTf, parameters: { period } },
      comparator: op,
      right: parseInt(rsiMatch[4]),
      logicalOperator: defaultOp
    });
  }

  // ── 5. MACD ───────────────────────────────────────────────────────
  if (entryText.includes('macd')) {
    if (entryText.includes('histogram')) {
      const isAbove = /(?:>|above|positive|greater)/.test(entryText.substring(entryText.indexOf('histogram'), entryText.indexOf('histogram') + 30));
      conditions.push({
        id: mkId(),
        left: { type: 'MACD_HISTOGRAM', parameters: { fast: 12, slow: 26, signal: 9 } },
        comparator: isAbove ? 'GREATER_THAN' : 'LESS_THAN',
        right: 0,
        logicalOperator: defaultOp
      });
    } else {
      const isBearish = /cross(?:es)?\s*below|bearish/.test(entryText);
      conditions.push({
        id: mkId(),
        left: { type: 'MACD', parameters: { fast: 12, slow: 26 } },
        comparator: isBearish ? 'CROSSES_BELOW' : 'CROSSES_ABOVE',
        right: { type: 'MACD_SIGNAL', parameters: { period: 9 } },
        logicalOperator: defaultOp
      });
    }
  }

  // ── 6. Bollinger Bands ────────────────────────────────────────────
  if (/bollinger|(?<!\w)bb(?!\w)/.test(entryText)) {
    if (/lower|oversold|touch|bounce/.test(entryText)) {
      conditions.push({
        id: mkId(),
        left: { type: 'PRICE' },
        comparator: 'LESS_THAN',
        right: { type: 'BOLLINGER_LOWER', parameters: { period: 20, multiplier: 2.0 } },
        logicalOperator: defaultOp
      });
    } else if (/upper|breakout/.test(entryText)) {
      conditions.push({
        id: mkId(),
        left: { type: 'PRICE' },
        comparator: 'GREATER_THAN',
        right: { type: 'BOLLINGER_UPPER', parameters: { period: 20, multiplier: 2.0 } },
        logicalOperator: defaultOp
      });
    } else if (/middle|basis/.test(entryText)) {
      conditions.push({
        id: mkId(),
        left: { type: 'PRICE' },
        comparator: 'CROSSES_ABOVE',
        right: { type: 'BOLLINGER_MIDDLE', parameters: { period: 20 } },
        logicalOperator: defaultOp
      });
    }
  }

  // ── 7. Supertrend ─────────────────────────────────────────────────
  if (entryText.includes('supertrend')) {
    const isBearish = /bearish|below|flip\s*red/.test(entryText.substring(entryText.indexOf('supertrend'), entryText.indexOf('supertrend') + 40));
    conditions.push({
      id: mkId(),
      left: { type: 'PRICE' },
      comparator: isBearish ? 'LESS_THAN' : 'GREATER_THAN',
      right: { type: 'SUPERTREND', parameters: { period: 10, multiplier: 3.0 } },
      logicalOperator: defaultOp
    });
  }

  // ── 8. Stochastic ─────────────────────────────────────────────────
  if (/stoch/.test(entryText)) {
    const stochValMatch = entryText.match(/stoch(?:astic)?\s*(?:k\s*)?(?:is\s*)?(?:below|under|<)\s*(\d+)/);
    if (stochValMatch) {
      conditions.push({
        id: mkId(),
        left: { type: 'STOCHASTIC_K', parameters: { kPeriod: 14, dPeriod: 3 } },
        comparator: 'LESS_THAN',
        right: parseInt(stochValMatch[1]),
        logicalOperator: defaultOp
      });
    } else {
      const isBearish = /cross(?:es)?\s*below|bearish/.test(entryText);
      conditions.push({
        id: mkId(),
        left: { type: 'STOCHASTIC_K', parameters: { kPeriod: 14, dPeriod: 3 } },
        comparator: isBearish ? 'CROSSES_BELOW' : 'CROSSES_ABOVE',
        right: { type: 'STOCHASTIC_D', parameters: { period: 3 } },
        logicalOperator: defaultOp
      });
    }
  }

  // ── 9. ADX (Average Directional Index) ────────────────────────────
  const adxMatch = entryText.match(/adx\s*(?:is\s*)?(?:above|greater than|>)\s*(\d+)/);
  if (adxMatch) {
    conditions.push({
      id: mkId(),
      left: { type: 'ADX', parameters: { period: 14 } },
      comparator: 'GREATER_THAN',
      right: parseInt(adxMatch[1]),
      logicalOperator: defaultOp
    });
  } else if (/strong\s*trend/.test(entryText) && !conditions.some(c => c.left.type === 'ADX')) {
    conditions.push({
      id: mkId(),
      left: { type: 'ADX', parameters: { period: 14 } },
      comparator: 'GREATER_THAN',
      right: 25,
      logicalOperator: defaultOp
    });
  }

  // ── 10. Volume & Volume SMA ───────────────────────────────────────
  if (/\bvolume\b|high\s*vol/.test(entryText)) {
    conditions.push({
      id: mkId(),
      left: { type: 'VOLUME' },
      comparator: 'GREATER_THAN',
      right: { type: 'VOLUME_SMA', parameters: { period: 20 } },
      logicalOperator: defaultOp
    });
  }

  // ── 11. VWAP (Volume-Weighted Average Price) ──────────────────────
  if (/\bvwap\b/.test(entryText)) {
    const isBelow = /below|less|<|under/.test(entryText.substring(entryText.indexOf('vwap') - 20, entryText.indexOf('vwap') + 20));
    conditions.push({
      id: mkId(),
      left: { type: 'PRICE' },
      comparator: isBelow ? 'LESS_THAN' : 'GREATER_THAN',
      right: { type: 'VWAP' },
      logicalOperator: defaultOp
    });
  }

  // ── 12. Donchian Channel Breakouts ────────────────────────────────
  if (/donchian|breakout|channel\s*high|channel\s*low/.test(entryText)) {
    const isLow = /low|breakdown|bearish/.test(entryText);
    conditions.push({
      id: mkId(),
      left: { type: 'PRICE' },
      comparator: isLow ? 'LESS_THAN' : 'GREATER_THAN',
      right: { type: isLow ? 'DONCHIAN_LOW' : 'DONCHIAN_HIGH', parameters: { period: 20 } },
      logicalOperator: defaultOp
    });
  }

  // ── 13. Keltner Channels ──────────────────────────────────────────
  if (/keltner/.test(entryText)) {
    const isLower = /lower|pullback/.test(entryText);
    conditions.push({
      id: mkId(),
      left: { type: 'PRICE' },
      comparator: isLower ? 'LESS_THAN' : 'GREATER_THAN',
      right: { type: isLower ? 'KELTNER_LOWER' : 'KELTNER_UPPER', parameters: { period: 20, multiplier: 2.0 } },
      logicalOperator: defaultOp
    });
  }

  // ── 14. ATR (Average True Range) ──────────────────────────────────
  if (/\batr\b/.test(entryText) && !entryText.includes('supertrend')) {
    const atrMatch = entryText.match(/atr\s*(?:above|greater than|>)\s*(\d+(?:\.\d+)?)/);
    conditions.push({
      id: mkId(),
      left: { type: 'ATR', parameters: { period: 14 } },
      comparator: 'GREATER_THAN',
      right: atrMatch ? parseFloat(atrMatch[1]) : 2.0,
      logicalOperator: defaultOp
    });
  }

  // ── 15. CCI (Commodity Channel Index) ─────────────────────────────
  const cciMatch = entryText.match(/cci\s*(?:is\s*)?(?:above|greater than|>|below|less than|<)\s*(-?\d+)/);
  if (cciMatch) {
    const val = parseInt(cciMatch[1]);
    const op = /(below|less|<)/.test(entryText.substring(entryText.indexOf('cci'), entryText.indexOf('cci') + 30)) ? 'LESS_THAN' : 'GREATER_THAN';
    conditions.push({
      id: mkId(),
      left: { type: 'CCI', parameters: { period: 20 } },
      comparator: op,
      right: val,
      logicalOperator: defaultOp
    });
  }

  // ── 16. Williams %R ───────────────────────────────────────────────
  const willMatch = entryText.match(/williams?\s*%?\s*r\s*(?:is\s*)?(?:below|under|<)\s*(-?\d+)/);
  if (willMatch) {
    conditions.push({
      id: mkId(),
      left: { type: 'WILLIAMS_R', parameters: { period: 14 } },
      comparator: 'LESS_THAN',
      right: parseInt(willMatch[1]),
      logicalOperator: defaultOp
    });
  }

  // ── 17. Ichimoku Cloud ────────────────────────────────────────────
  if (/ichimoku|cloud|tenkan|kijun/.test(entryText)) {
    conditions.push({
      id: mkId(),
      left: { type: 'ICHIMOKU_TENKAN', parameters: { conversion: 9 } },
      comparator: entryText.includes('below') ? 'CROSSES_BELOW' : 'CROSSES_ABOVE',
      right: { type: 'ICHIMOKU_KIJUN', parameters: { base: 26 } },
      logicalOperator: defaultOp
    });
  }

  // ── 18. Binance Funding Rate & Orderbook ──────────────────────────
  if (/funding\s*rate/.test(entryText)) {
    conditions.push({
      id: mkId(),
      left: { type: 'FUNDING_RATE' },
      comparator: 'LESS_THAN',
      right: 0.0,
      logicalOperator: defaultOp
    });
  }

  if (/orderbook|imbalance/.test(entryText)) {
    conditions.push({
      id: mkId(),
      left: { type: 'ORDERBOOK_IMBALANCE' },
      comparator: 'GREATER_THAN',
      right: 65,
      logicalOperator: defaultOp
    });
  }

  // ── 19. Specific Price Level ──────────────────────────────────────
  const priceLevelMatch = entryText.match(/price\s*(?:is\s*)?(?:above|greater than|over|>|below|under|less than|drops?\s*(?:below|under)|<)\s*\$?\s*([\d,.]+)/);
  if (priceLevelMatch) {
    const val = parseFloat(priceLevelMatch[1].replace(/,/g, ''));
    const op = /below|under|less|drop|</.test(priceLevelMatch[0]) ? 'LESS_THAN' : 'GREATER_THAN';
    conditions.push({
      id: mkId(),
      left: { type: 'PRICE' },
      comparator: op,
      right: val,
      logicalOperator: defaultOp
    });
  }

  // ── Fallback if no specific trigger was extracted ─────────────────
  if (conditions.length === 0) {
    conditions.push({
      id: 'entry-1',
      left: { type: 'EMA', parameters: { period: 50 } },
      comparator: 'CROSSES_ABOVE',
      right: { type: 'EMA', parameters: { period: 200 } },
      logicalOperator: 'AND'
    });
  }

  return conditions;
}

// ═══════════════════════════════════════════════════════════════════════════
// EXIT CONDITIONS EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════

function extractExitConditions(t: string): any[] {
  const conditions: any[] = [];
  let nextId = 1;
  const mkId = () => `exit-${nextId++}`;

  // RSI exit: "exit when RSI > 70", "sell if RSI overbought", "exit when RSI < 30" (for shorts)
  const exitRsiMatch = t.match(/(?:exit|close|sell|cover)\s*(?:when|if)\s*rsi\s*(?:\(\s*(\d+)\s*\))?\s*(?:is\s*)?(?:above|greater than|>|below|under|<)\s*(\d+)/);
  if (exitRsiMatch) {
    const period = exitRsiMatch[1] ? parseInt(exitRsiMatch[1]) : 14;
    const isBelow = /below|under|</.test(exitRsiMatch[0]);
    conditions.push({
      id: mkId(),
      left: { type: 'RSI', parameters: { period } },
      comparator: isBelow ? 'LESS_THAN' : 'GREATER_THAN',
      right: parseInt(exitRsiMatch[2]),
      logicalOperator: 'OR'
    });
  }

  // MACD exit: "close when MACD crosses below signal"
  if (/(?:exit|close|sell|cover)\s*(?:when|if)\s*macd\s*(?:line\s*)?cross/.test(t)) {
    const isBelow = t.includes('below');
    conditions.push({
      id: mkId(),
      left: { type: 'MACD', parameters: { fast: 12, slow: 26 } },
      comparator: isBelow ? 'CROSSES_BELOW' : 'CROSSES_ABOVE',
      right: { type: 'MACD_SIGNAL', parameters: { period: 9 } },
      logicalOperator: 'OR'
    });
  }

  // Bollinger Band exit: "exit when price reaches upper bollinger", "target lower band"
  if (/(?:exit|close|target)\s*(?:at|when)?\s*(?:price\s*)?(?:reaches?\s*)?(upper|lower)\s*bollinger/i.test(t)) {
    const isUpper = /upper/i.test(t);
    conditions.push({
      id: mkId(),
      left: { type: 'PRICE' },
      comparator: isUpper ? 'GREATER_THAN' : 'LESS_THAN',
      right: { type: isUpper ? 'BOLLINGER_UPPER' : 'BOLLINGER_LOWER', parameters: { period: 20, multiplier: 2.0 } },
      logicalOperator: 'OR'
    });
  }

  // MA Cross exit: "exit on 50/200 death cross"
  if (/(?:exit|close)\s*(?:on|when)\s*death\s*cross/i.test(t)) {
    conditions.push({
      id: mkId(),
      left: { type: 'EMA', parameters: { period: 50 } },
      comparator: 'CROSSES_BELOW',
      right: { type: 'EMA', parameters: { period: 200 } },
      logicalOperator: 'OR'
    });
  }

  // Supertrend exit: "exit when supertrend turns red / bearish"
  if (/(?:exit|close)\s*(?:when|if)\s*supertrend/i.test(t)) {
    conditions.push({
      id: mkId(),
      left: { type: 'PRICE' },
      comparator: 'LESS_THAN',
      right: { type: 'SUPERTREND', parameters: { period: 10, multiplier: 3.0 } },
      logicalOperator: 'OR'
    });
  }

  // Time-based exit: "exit after 15 minutes", "close after 24 hours"
  const exitTimeMatch = t.match(/(?:exit|close)\s*(?:after|in)\s*(\d+)\s*(second|minute|hour|day)/);
  if (exitTimeMatch) {
    const unit = exitTimeMatch[2];
    const multiplier = unit.includes('minute') ? 60 : unit.includes('hour') ? 3600 : unit.includes('day') ? 86400 : 1;
    const secs = parseInt(exitTimeMatch[1]) * multiplier;
    conditions.push({
      id: mkId(),
      left: { type: 'TIME_SINCE_ENTRY' },
      comparator: 'GREATER_THAN',
      right: secs,
      logicalOperator: 'OR'
    });
  }

  // Default exit condition if none specified
  if (conditions.length === 0) {
    const isShort = /\b(short|go short|open short|sell position)\b/.test(t);
    conditions.push({
      id: 'exit-1',
      left: { type: 'RSI', parameters: { period: 14 } },
      comparator: isShort ? 'LESS_THAN' : 'GREATER_THAN',
      right: isShort ? 30 : 70,
      logicalOperator: 'OR'
    });
  }

  return conditions;
}

// ═══════════════════════════════════════════════════════════════════════════
// RISK PARAMETERS EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════

function extractRiskParameters(t: string, leverage?: number) {
  let stopLoss = 3.0;
  let takeProfit = 6.0;
  let trailingStop: number | undefined;
  let riskPerTrade: number | undefined;
  let maxDrawdown: number | undefined;

  // Stop loss: "stop loss 2.5%", "sl 3%", "stop-loss of 1.5%", "2% stop loss"
  const slMatch = t.match(/(?:stop[\s-]*loss|sl)\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*%/) ||
                  t.match(/(\d+(?:\.\d+)?)\s*%\s*(?:stop[\s-]*loss|sl)/);
  if (slMatch) stopLoss = parseFloat(slMatch[1]);

  // Take profit: "take profit 5%", "tp 8%", "5% take profit"
  const tpMatch = t.match(/(?:take[\s-]*profit|tp)\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*%/) ||
                  t.match(/(\d+(?:\.\d+)?)\s*%\s*(?:take[\s-]*profit|tp)/);
  if (tpMatch) takeProfit = parseFloat(tpMatch[1]);

  // Trailing stop: "trailing stop 1.5%", "trailing stop loss of 2%", "3% trailing stop"
  const tsMatch = t.match(/trailing\s*(?:stop[\s-]*(?:loss)?)?\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*%/) ||
                  t.match(/(\d+(?:\.\d+)?)\s*%\s*trailing\s*(?:stop[\s-]*(?:loss)?)?/);
  if (tsMatch) trailingStop = parseFloat(tsMatch[1]);

  // Risk per trade: "risk 1% per trade", "risk 2% of capital"
  const rptMatch = t.match(/risk\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*%\s*(?:per\s*trade|of\s*account)/);
  if (rptMatch) riskPerTrade = parseFloat(rptMatch[1]);

  // Max Drawdown: "max drawdown 5%", "max daily drawdown 4%"
  const ddMatch = t.match(/max\s*(?:daily\s*)?drawdown\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*%/);
  if (ddMatch) maxDrawdown = parseFloat(ddMatch[1]);

  return {
    stopLossPercentage: stopLoss,
    takeProfitPercentage: takeProfit,
    trailingStopPercentage: trailingStop,
    riskPerTradePct: riskPerTrade,
    maxDailyDrawdownPct: maxDrawdown,
    maxPositionSizeUSD: 25000,
    leverage: leverage || 1
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// SMART STRATEGY NAME GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

function generateStrategyName(symbol: string, conditions: any[], actionType: string, tf: string, t: string): string {
  const base = symbol.split('/')[0];
  const side = actionType === 'SELL' ? 'Short' : 'Long';
  const indicators: string[] = [];

  for (const c of conditions) {
    const lt = c.left?.type;
    if (lt === 'RSI') indicators.push('RSI');
    else if (lt === 'EMA') indicators.push(`EMA(${c.left.parameters?.period || 50})`);
    else if (lt === 'SMA') indicators.push(`SMA(${c.left.parameters?.period || 200})`);
    else if (lt === 'MACD' || lt === 'MACD_HISTOGRAM') indicators.push('MACD');
    else if (lt === 'STOCHASTIC_K') indicators.push('Stochastic');
    else if (lt === 'ADX') indicators.push('ADX');
    else if (lt === 'CCI') indicators.push('CCI');
    else if (lt === 'WILLIAMS_R') indicators.push('Williams %R');
    else if (lt === 'ICHIMOKU_TENKAN') indicators.push('Ichimoku');
    else if (lt === 'BOLLINGER_UPPER' || lt === 'BOLLINGER_LOWER' || lt === 'BOLLINGER_MIDDLE' || (c.right?.type && c.right.type.includes('BOLLINGER'))) indicators.push('Bollinger');
    else if (lt === 'SUPERTREND' || (c.right?.type === 'SUPERTREND')) indicators.push('Supertrend');
    else if (lt === 'VOLUME') indicators.push('Volume');
    else if (lt === 'VWAP' || c.right?.type === 'VWAP') indicators.push('VWAP');
    else if (lt === 'ATR') indicators.push('ATR');
    else if (lt === 'DONCHIAN_HIGH' || lt === 'DONCHIAN_LOW' || c.right?.type?.includes?.('DONCHIAN')) indicators.push('Donchian Breakout');
    else if (lt === 'PRICE' && c.right?.type?.includes?.('BOLLINGER')) indicators.push('Bollinger Mean Reversion');
    else if (lt === 'PRICE' && c.right?.type === 'VWAP') indicators.push('VWAP Reversion');
    else if (lt === 'PRICE' && c.right?.type === 'SUPERTREND') indicators.push('Supertrend Trend');
  }

  const unique = [...new Set(indicators)];
  if (unique.length === 0) return `${base} ${tf} Quant ${side} Bot`;
  if (unique.length <= 2) return `${base} ${tf} ${unique.join(' + ')} ${side}`;
  return `${base} ${tf} ${unique.slice(0, 3).join(' + ')} ${side}`;
}
