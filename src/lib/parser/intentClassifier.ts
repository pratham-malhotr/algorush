/**
 * Institutional Intent Classifier for AlgoRush Quantitative Builder.
 * 
 * Accurately discriminates between:
 * 1. CONVERSATIONAL: Greetings, platform navigation, educational Q&A,
 *    theoretical strategy discussions ("what is a momentum strategy?",
 *    "how does a grid bot work?"), risk math, market advice, and pleasantries.
 * 2. STRATEGY_BUILD: Direct imperative build directives ("build a strategy for BTC"),
 *    rule-based trade entries ("buy BTC when 20 EMA crosses 50 EMA"), backtest
 *    simulation commands, and active strategy mutations ("change leverage to 10x").
 */

export type UserIntentType = 'CONVERSATIONAL' | 'STRATEGY_BUILD';

export interface IntentClassificationResult {
  intent: UserIntentType;
  confidence: number;
  reason: string;
  category?: string;
}

/**
 * Normalizes input text for resilient token and intent matching.
 */
function normalizeText(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[?!.,;:]+$/, '') // strip trailing punctuation
    .replace(/\s+/g, ' ');
}

/**
 * Evaluates whether a strategy build prompt contains concrete requirements
 * (such as target asset, timeframe, indicator, condition trigger, risk parameters, or named archetype).
 * 
 * If a user prompt says "can you build a strategy for me" or "make me a bot"
 * without ANY of these concrete requirements, it is considered an underspecified
 * request that must elicit user requirements rather than generating a random strategy.
 */
/**
 * Evaluates whether a strategy build prompt contains concrete requirements
 * (such as target asset, timeframe, indicator, condition trigger, risk parameters, or named archetype).
 * 
 * If a user prompt says "can you build a strategy for me" or "make me a bot"
 * without ANY of these concrete requirements, it is considered an underspecified
 * request that must elicit user requirements rather than generating a random strategy.
 */
export function hasStrategyRequirements(text: string): boolean {
  if (!text || typeof text !== 'string') return false;

  // 1. Asset or pair (e.g. BTC, ETH, SOL, XRP, DOGE, AVAX, /USDT, Bitcoin, Solana, Crypto)
  const hasAsset = /\b(btc|eth|sol|bnb|xrp|ada|doge|avax|link|matic|dot|near|sui|apt|pepe|shib|bitcoin|ethereum|solana|crypto|[a-z0-9]{2,10}\/(usdt|usd|usdc|busd))\b/i.test(text);

  // 2. Specific technical indicator or chart element
  const hasIndicator = /\b(ema|sma|wma|hma|rsi|macd|bollinger|bands?|atr|supertrend|vwap|stochastic|adx|cci|obv|donchian|keltner|ichimoku|volume|candle|crossover|crosses)\b/i.test(text);

  // 3. Timeframe specification (e.g. 15m, 1h, 15 minutes, hourly, daily)
  const hasTimeframe = /\b(1m|3m|5m|15m|30m|1h|2h|4h|1d|1w|daily|hourly|minute|minutes|mins?|hours?|days?|seconds?|secs?)\b/i.test(text);

  // 4. Action / trigger / relational condition (e.g. "when ... crosses", "buy when ...")
  const hasCondition = /\b(when|if|crosses\s*(above|below)|crossover|<|>|<=|>=|reaches|breaks|drops|rises)\b/i.test(text);

  // 5. Risk management / leverage / allocation parameters (e.g. 10x leverage, stop is 5 percent, target is 12 percent, 10% portfolio)
  const hasRiskParams = /\b(\d+x\s*leverage|\d+x\b|leverage|stop\s*(loss|is)?|\bsl\b|take\s*(profit|is)?|target\s*is|\btp\b|trailing\s*stop|\d+\s*(%|percent)\s*(stop|profit|loss|target|allocation|portfolio)?|allocation|portfolio)\b/i.test(text);

  // 6. Specific strategy archetype or setup name (e.g. trend following, mean reversion, grid bot, arbitrage)
  const hasArchetype = /\b(scalp|scalping|momentum|mean\s*reversion|trend\s*following|breakout|arbitrage|cash\s*and\s*carry|basis\s*trading|grid\s*(bot|trading)|pairs\s*trading|triangular)\b/i.test(text);

  return hasAsset || hasIndicator || hasTimeframe || hasCondition || hasRiskParams || hasArchetype;
}

/**
 * Detects anaphoric build expressions that explicitly refer back to
 * a strategy or trading rules discussed earlier in the conversation.
 * (e.g. "build this strategy", "build this", "create this", "build it",
 *       "make this", "deploy this", "go ahead and build it", "proceed")
 */
export function isAnaphoricBuildRequest(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  const norm = normalizeText(text);

  // Exclude speculative inquiries like "is it possible for you to create this strategy" or "can you build a strategy"
  const isQuestionOrInquiry = /^(is\s*it|it\s*is|would\s*it\s*be|is\s*there\s*a\s*way)\s+possible\b/i.test(norm) ||
    /^(can\s*you|could\s*you|would\s*you)\s+(build|create|make)\b/i.test(norm);
  if (isQuestionOrInquiry) return false;

  const anaphoricRegex = /^(yes\s*,?\s*)?(build|create|generate|make|deploy|compile|synthesize|assemble)\s+(this|it|that|the|this\s*one)\b/i;
  const anaphoricStrategyRegex = /\b(build|create|make|generate|deploy|synthesize)\s+(this|that)\s+(strategy|strat|bot|algo|system)\b/i;
  const proceedRegex = /^(yes\s*,?\s*)?(build\s+it|create\s+it|make\s+it|go\s+ahead(\s+and\s+build\s+it)?|proceed(\s+with\s+(this|the\s+strategy))?|lets\s+do\s+it|let's\s+do\s+it|do\s+it)\b/i;
  
  return anaphoricRegex.test(norm) || anaphoricStrategyRegex.test(norm) || proceedRegex.test(norm);
}

/**
 * Classifies whether a user prompt is a normal conversation/inquiry
 * or an explicit strategy building directive.
 */
/**
 * Classifies whether a user prompt is a normal conversation/inquiry
 * or an explicit strategy building directive.
 * 
 * Supports multi-turn conversation history awareness:
 * If the user is answering a requirements-gathering prompt (e.g. providing asset, timeframe,
 * or leverage across multiple turns) or issuing an anaphoric command like "build this strategy",
 * it accurately attributes intent to STRATEGY_BUILD.
 */
export function classifyUserIntent(
  rawText: string,
  chatHistory?: Array<{ role: string; content: string }>
): IntentClassificationResult {
  if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
    return {
      intent: 'CONVERSATIONAL',
      confidence: 1.0,
      reason: 'Empty prompt defaults to conversational',
      category: 'GREETING'
    };
  }

  const text = normalizeText(rawText);

  // ──────────────────────────────────────────────────────────────────────────
  // STAGE 1: Pure Greetings, Social Pleasantries & Courtesy
  // ──────────────────────────────────────────────────────────────────────────
  const pureGreetingRegex = /^(hi|hello|hey|hola|sup|yo|howdy|good\s*(morning|afternoon|evening|day)|greetings)\b/i;
  const courtesyRegex = /^(thanks|thank you|thank you so much|thanks a lot|appreciate it|cool|awesome|great|nice|ok|okay|got it|understood|i see|well done|good job|bye|goodbye|see ya)\b/i;

  // If text is purely greeting or courtesy with no imperative strategy build verbs:
  if (pureGreetingRegex.test(text) || courtesyRegex.test(text)) {
    // Check if it's a compound greeting like "Hi, build a strategy for BTC"
    const hasExplicitBuildCommand = /\b(build|create|generate|make|design|backtest)\s+(me\s+)?(a\s+)?(strategy|strat|bot|algo)/i.test(text) ||
      /\b(buy|sell|long|short)\s+[a-z0-9/]+\s+when\b/i.test(text);

    if (!hasExplicitBuildCommand) {
      return {
        intent: 'CONVERSATIONAL',
        confidence: 0.99,
        reason: 'Social greeting or courtesy message',
        category: 'GREETING'
      };
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // STAGE 2: Platform Identity, App Navigation & Meta Help
  // ──────────────────────────────────────────────────────────────────────────
  const platformMetaRegex = /^(who are you|what are you|what is this platform|what is algorush|what can you do|how does this work|how does this app work|how to use this|how do i use (this|the) builder|help me|guide me|tell me about yourself|who created (you|algorush)|is this (platform )?free|what exchanges (are|do you) support|how does paper trading work|how to connect (my )?api key)\b/i;
  
  if (platformMetaRegex.test(text)) {
    return {
      intent: 'CONVERSATIONAL',
      confidence: 0.98,
      reason: 'Platform identity or navigation inquiry',
      category: 'PLATFORM_HELP'
    };
  }

  // Handle Preset 1 specifically: "Hi! How does AlgoRush AI Copilot help me develop quant trading strategies?"
  if (/how does algorush/i.test(text) || /help me develop quant trading/i.test(text) || /what can algorush do/i.test(text)) {
    return {
      intent: 'CONVERSATIONAL',
      confidence: 0.99,
      reason: 'Platform capabilities inquiry',
      category: 'PLATFORM_HELP'
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // STAGE 2.1: Anaphoric Build Requests (Cross-Turn Strategy Directives)
  // (e.g. "build this strategy", "build this", "create this", "build it",
  //       "make this", "go ahead and build it", "proceed", "yes build it")
  // ──────────────────────────────────────────────────────────────────────────
  if (isAnaphoricBuildRequest(text)) {
    return {
      intent: 'STRATEGY_BUILD',
      confidence: 0.98,
      reason: 'Anaphoric build directive referencing strategy discussed in conversation',
      category: 'STRATEGY_GENERATION'
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // STAGE 2.2: Multi-Turn Parameter Refinement / Response to Requirements Inquiries
  // (When the assistant just asked for missing parameters, and user provides them)
  // ──────────────────────────────────────────────────────────────────────────
  if (chatHistory && chatHistory.length > 0) {
    const recentAssistant = [...chatHistory].reverse().find(m => m.role === 'assistant' && !m.content?.startsWith('👋 Welcome'));
    const isRequirementsInquiry = recentAssistant && (
      /(four key details|key details|requirements|which asset|what timeframe|leverage|stop[- ]loss|take[- ]profit|craft a complete strategy|tailor it perfectly|to finish building your|i just need|i'll need a couple more details)/i.test(recentAssistant.content)
    );

    if (isRequirementsInquiry) {
      // Check if user is answering with parameters or concluding parameter specification
      const isAnsweringRequirements = hasStrategyRequirements(text) ||
        /\b(no other|not any other|none|no sl|no tp|default|use defaults|that'?s all|nothing else|10x|15m|1h|btc|eth|sol)\b/i.test(text);

      if (isAnsweringRequirements) {
        return {
          intent: 'STRATEGY_BUILD',
          confidence: 0.96,
          reason: 'User provided parameters answering strategy requirements inquiry',
          category: 'MULTI_TURN_REQUIREMENTS'
        };
      }
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // STAGE 2.5: Open-Ended / Underspecified Strategy Requests (Requirements Gathering)
  // (e.g. "can you build a strategy for me", "build me a strategy", "can you create a strategy",
  //       "help me build a strategy", "can you make a strategy for me", "build a strategy")
  // ──────────────────────────────────────────────────────────────────────────
  const buildVerbsCheck = /\b(build|create|generate|make|design|develop|code|formulate|assemble|construct|give\s*me|synthesize|deploy|setup|set\s*up)\b/i;
  const strategyNounsCheck = /\b(strategy|strategies|strat|strats|bot|bots|algo|algos|algorithm|algorithms|trading\s*system)\b/i;

  if (buildVerbsCheck.test(text) && strategyNounsCheck.test(text)) {
    // If the request completely lacks concrete technical requirements,
    // intercept it as CONVERSATIONAL to systematically elicit requirements from the user!
    if (!hasStrategyRequirements(text) && !isAnaphoricBuildRequest(text)) {
      return {
        intent: 'CONVERSATIONAL',
        confidence: 0.98,
        reason: 'Open-ended strategy build request lacking specifications: gather requirements first',
        category: 'REQUIREMENTS_GATHERING'
      };
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // STAGE 3: Clear Explanatory Questions & Theoretical Inquiries
  // (e.g. "what is RSI?", "explain EMA vs SMA", "what is a momentum strategy?",
  //       "how does a grid bot work?", "why do trades fail?")
  // ──────────────────────────────────────────────────────────────────────────
  
  // A) Questions starting with inquiry phrases asking for explanations, definitions, or mechanisms
  const isQuestionStarter = /^(what\s*(is|are|does|causes|happens|mean)|whats|what's|explain|can\s*you\s*explain|could\s*you\s*explain|please\s*explain|describe|tell\s*me\s*about|teach\s*me\s*about|how\s*(does|do|did|would|can)|why\s*(does|do|is|are|did)|is\s*it\s*(good|safe|better|profitable)|should\s*i|would\s*you\s*recommend|do\s*you\s*recommend|which\s*(is\s*better|timeframe|indicator)|difference\s*between|when\s*(should|does|do|is|are|can|will))\b/i.test(text);

  // BUT distinguish: "can you build / create / make a strategy..." from "can you explain / tell me..."
  const isQuestionFormOfBuild = /^(can\s*you|could\s*you|please)\s+(build|create|generate|make|code|design|set\s*up|deploy)\s+(me\s+)?(a\s+)?(strategy|strat|bot|algo|system|arbitrage)/i.test(text);

  if (isQuestionStarter && !isQuestionFormOfBuild) {
    // Check if the user is asking an educational or theoretical question about strategies/bots:
    // e.g. "what is a momentum strategy?", "how does a grid bot work?", "explain mean reversion strategy"
    const isStrategyTheoryQuestion = /\b(what is|explain|describe|tell me about|how does|why does|difference between)\b.*\b(strategy|strategies|bot|bots|algo|algos|algorithm|algorithms|system|arbitrage)\b/i.test(text);
    
    // Check if it's an educational question about indicators:
    // e.g. "explain EMA vs SMA in crypto trading", "what is RSI?", "how does MACD work?"
    const isIndicatorQuestion = /\b(ema|sma|wma|hma|rsi|macd|bollinger|atr|supertrend|vwap|stochastic|adx|cci|obv|donchian|keltner|ichimoku|volume|funding\s*rate|slippage|kelly\s*criterion|drawdown|sharpe)\b/i.test(text);

    // Check if it's general market advice:
    // e.g. "what timeframe is best for scalping?", "should I use 10x leverage?", "when should I exit a trade?"
    const isMarketAdviceQuestion = /\b(best timeframe|which timeframe|should i use|is leverage|how do i manage risk|why do trades fail|why do traders lose|when should|when does a bear market)\b/i.test(text);

    if (isStrategyTheoryQuestion || isIndicatorQuestion || isMarketAdviceQuestion || text.endsWith('?') || /^(what|why|how|explain|describe|tell me|when\s*(should|does|do|can|will))\b/i.test(text)) {
      // Confirm there is no imperative command to buy/sell/execute right now
      const hasImmediateTradingTrigger = /\b(buy|sell|long|short)\s+(btc|eth|sol|[a-z0-9/]+)\s+when\b/i.test(text);
      if (!hasImmediateTradingTrigger) {
        return {
          intent: 'CONVERSATIONAL',
          confidence: 0.96,
          reason: 'Educational or conceptual trading inquiry',
          category: 'EXPLANATION'
        };
      }
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // STAGE 4: Explicit Strategy Modifications / Canvas Tweaks
  // (Commands directed at modifying the current strategy on canvas)
  // ──────────────────────────────────────────────────────────────────────────
  const isExplicitTweak = /^(change|set|update|modify|switch|increase|decrease|tighten|loosen|add|remove|apply)\b.*\b(leverage|\d+x|stop\s*loss|sl\b|take\s*profit|tp\b|trailing\s*stop|timeframe|pair|symbol|filter|ema|rsi|volume|allocation|tweak)\b/i.test(text) ||
    /\b(apply this tweak|tighten stop|loosen stop|change stop|set stop|set tp|change timeframe|add trailing stop|set leverage to|change leverage to|switch pair to|switch to|add 200 ema|add rsi filter|add volume filter)\b/i.test(text);

  if (isExplicitTweak && !isQuestionStarter) {
    return {
      intent: 'STRATEGY_BUILD',
      confidence: 0.95,
      reason: 'Explicit strategy parameter mutation or tweak',
      category: 'STRATEGY_TWEAK'
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // STAGE 5: Explicit Strategy Generation & Compilation Directives
  // (Commands instructing the AI to synthesize a new trading algorithm)
  // ──────────────────────────────────────────────────────────────────────────
  
  // A) Imperative Build Verb + Strategy Noun:
  // e.g. "build a strategy for BTC", "create a momentum bot", "make me an ETH scalping strategy",
  //      "generate a 15m trend strategy with EMA and RSI", "design a trading bot for Bitcoin",
  //      "deploy delta-neutral cash and carry basis arbitrage between Binance spot and quarterly futures on BTC/USDT"
  const buildVerbs = /\b(build|create|generate|make|design|develop|code|formulate|assemble|construct|give\s*me|synthesize|deploy|setup|set\s*up)\b/i;
  const strategyNouns = /\b(strategy|strategies|strat|strats|bot|bots|algo|algos|algorithm|algorithms|trading\s*system|scalper|arbitrage|cash\s*and\s*carry|basis\s*trading)\b/i;

  if (buildVerbs.test(text) && strategyNouns.test(text)) {
    // Exclude purely meta/educational questions like "how do I build a strategy on this website?" or "explain how to build a bot"
    const isMetaExplanationOfBuilding = /^(how\s*(to|do\s*i|can\s*i)|explain\s*how|teach\s*me\s*how)\s+(to\s+)?(build|create|make|design)\b/i.test(text);
    if (!isMetaExplanationOfBuilding) {
      return {
        intent: 'STRATEGY_BUILD',
        confidence: 0.97,
        reason: 'Imperative strategy creation request',
        category: 'STRATEGY_GENERATION'
      };
    }
  }

  // B) Asset or trading style specific strategy phrasing:
  // e.g. "strategy for BTC", "BTC scalping strategy", "momentum strategy for SOL"
  const assetStrategyPattern = /\b(btc|eth|sol|crypto|bitcoin|ethereum|solana)\s+(scalping|momentum|trend|mean\s*reversion|breakout|arbitrage|grid)\s+(strategy|strat|bot|algo)\b/i;
  const strategyForAssetPattern = /\b(strategy|strat|bot|algo)\s+(for|on)\s+(btc|eth|sol|crypto|bitcoin|ethereum|solana|[a-z0-9/]+)\b/i;

  if ((assetStrategyPattern.test(text) || strategyForAssetPattern.test(text)) && !isQuestionStarter) {
    return {
      intent: 'STRATEGY_BUILD',
      confidence: 0.94,
      reason: 'Strategy requested for asset/style',
      category: 'STRATEGY_GENERATION'
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // STAGE 6: Actionable Trading Execution Directives (Action + Trigger Rule)
  // (e.g. "Buy BTC when 20 EMA crosses above 50 EMA", "Long SOL when RSI < 30")
  // ──────────────────────────────────────────────────────────────────────────
  const hasTradeAction = /\b(buy|sell|long|short|go\s*long|go\s*short|enter\s*long|enter\s*short|open\s*long|open\s*short)\b/i.test(text);
  const hasConditionTrigger = /\b(when|if|crosses\s*(above|below)|crosses|drops\s*below|rises\s*above|breaks\s*above|breaks\s*below|<|>|<=|>=|reaches)\b/i.test(text);
  const hasTechnicalElement = /\b(ema|sma|wma|hma|rsi|macd|bollinger|supertrend|vwap|stochastic|adx|cci|atr|volume|support|resistance|band|bands|candle|candles)\b/i.test(text) || /\d+x\b/i.test(text);

  // If starts with "when [condition] buy/sell..."
  const isWhenTriggerRule = /^when\b.*\b(buy|sell|long|short|enter|exit)\b/i.test(text);
  // If starts with "buy/sell/long/short ... when [condition]"
  const isActionWhenRule = hasTradeAction && hasConditionTrigger && hasTechnicalElement;

  if ((isWhenTriggerRule || isActionWhenRule) && !isQuestionStarter) {
    return {
      intent: 'STRATEGY_BUILD',
      confidence: 0.98,
      reason: 'Imperative rule-based trading trigger directive',
      category: 'STRATEGY_RULE'
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // STAGE 7: Explicit Backtest / Simulation Directives
  // (e.g. "backtest BTC when 20 EMA crosses 50 EMA", "simulate ETH on 15m")
  // ──────────────────────────────────────────────────────────────────────────
  const isBacktestCommand = /^(backtest|simulate|run\s*backtest)\b/i.test(text) &&
    /\b(btc|eth|sol|crypto|when|with|on|using|strategy|ema|rsi)\b/i.test(text);

  if (isBacktestCommand) {
    return {
      intent: 'STRATEGY_BUILD',
      confidence: 0.95,
      reason: 'Explicit backtest simulation request',
      category: 'STRATEGY_BACKTEST'
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // STAGE 8: Multi-Turn Conversation Thread Check & Fallback Safety Guard
  // ──────────────────────────────────────────────────────────────────────────
  if (chatHistory && chatHistory.length > 0) {
    const userMessages = chatHistory.filter(m => m.role === 'user').map(m => m.content);
    const combinedUserContext = `${userMessages.join(' ')} ${rawText}`;
    
    // If the conversation thread as a whole has rich strategy requirements,
    // and the user message indicates confirmation, continuation, or answering parameters:
    const isAffirmativeOrConfirm = /^(ok|okay|yes|yep|sure|fine|confirmed|go|ready|proceed|build|do\s*it|apply|done|none|no|not\s*any)\b/i.test(text);
    if (hasStrategyRequirements(combinedUserContext) && (isAffirmativeOrConfirm || hasStrategyRequirements(text))) {
      return {
        intent: 'STRATEGY_BUILD',
        confidence: 0.92,
        reason: 'Conversation thread contains complete strategy parameters with active confirmation',
        category: 'MULTI_TURN_REQUIREMENTS'
      };
    }
  }

  // If a prompt is ambiguous or does not explicitly ask to build or execute a strategy,
  // we SAFELY default to CONVERSATIONAL to prevent destructive canvas overwrites!
  return {
    intent: 'CONVERSATIONAL',
    confidence: 0.85,
    reason: 'Defaulted to conversational inquiry to protect canvas strategy',
    category: 'GENERAL_CHAT'
  };
}

/**
 * Convenience boolean check matching existing interface:
 * returns true ONLY if the intent is an explicit strategy building command.
 * Supports multi-turn conversation history.
 */
export function isExplicitStrategyIntent(
  text: string,
  chatHistory?: Array<{ role: string; content: string }>
): boolean {
  return classifyUserIntent(text, chatHistory).intent === 'STRATEGY_BUILD';
}
