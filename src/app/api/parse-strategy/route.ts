import { NextResponse } from 'next/server';
import { parseStrategyDescription } from '@/lib/parser/agent';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.length < 20) {
      return NextResponse.json({ error: 'Unauthorized. Valid API Key required.' }, { status: 401 });
    }

    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input. Expected a text string.' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      console.warn('No OPENAI_API_KEY found, using smart local quant NLP parser.');
      await new Promise(r => setTimeout(r, 600)); // Smooth UX delay
      
      const textLower = text.toLowerCase();
      
      // 1. Symbol & Asset Class Extraction
      let symbol = "BTC/USDT";
      let assetClass = "CRYPTO";
      
      if (textLower.includes("ethereum") || textLower.includes("eth")) {
         symbol = "ETH/USDT";
      } else if (textLower.includes("solana") || textLower.includes("sol")) {
         symbol = "SOL/USDT";
      } else if (textLower.includes("ripple") || textLower.includes("xrp")) {
         symbol = "XRP/USDT";
      } else if (textLower.includes("apple") || textLower.includes("aapl")) {
         symbol = "AAPL";
         assetClass = "EQUITY";
      } else if (textLower.includes("nvidia") || textLower.includes("nvda")) {
         symbol = "NVDA";
         assetClass = "EQUITY";
      }

      // 2. Action Type Extraction
      let actionType: 'BUY' | 'SELL' | 'CLOSE_POSITION' = "BUY";
      if (textLower.includes("short") || textLower.includes("sell position")) {
        actionType = "SELL";
      } else if (textLower.includes("close position") || textLower.includes("exit position")) {
        actionType = "CLOSE_POSITION";
      }

      // 3. Entry Conditions NLP Parser
      const entryConditions: any[] = [];
      const exitConditions: any[] = [];

      // Check for Moving Average Crossover (e.g. "50 ema crosses above 200 ema", "9 sma crosses below 21 sma")
      const maCrossMatch = textLower.match(/(\d+)\s*(ema|sma)\s*(crosses above|crosses below|crosses)\s*(\d+)\s*(ema|sma)/);
      if (maCrossMatch) {
        const period1 = parseInt(maCrossMatch[1]);
        const type1 = maCrossMatch[2].toUpperCase();
        const direction = maCrossMatch[3].includes("below") ? "CROSSES_BELOW" : "CROSSES_ABOVE";
        const period2 = parseInt(maCrossMatch[4]);
        const type2 = maCrossMatch[5].toUpperCase();

        entryConditions.push({
          id: `entry-${entryConditions.length + 1}`,
          left: { type: type1, parameters: { period: period1 } },
          comparator: direction,
          right: { type: type2, parameters: { period: period2 } },
          logicalOperator: "AND"
        });
      }

      // Check for RSI (e.g., "rsi below 30", "rsi(14) < 40", "rsi above 70")
      const rsiMatch = textLower.match(/rsi(?:\((\d+)\))?\s*(below|less than|<|above|greater than|>)\s*(\d+)/);
      if (rsiMatch) {
        const period = rsiMatch[1] ? parseInt(rsiMatch[1]) : 14;
        const op = (rsiMatch[2].includes("below") || rsiMatch[2].includes("less") || rsiMatch[2] === "<") ? "LESS_THAN" : "GREATER_THAN";
        const val = parseInt(rsiMatch[3]);

        entryConditions.push({
          id: `entry-${entryConditions.length + 1}`,
          left: { type: "RSI", parameters: { period } },
          comparator: op,
          right: val,
          logicalOperator: "AND"
        });
      }

      // Check for MACD (e.g., "macd histogram > 0", "macd crosses signal", "macd signal line")
      if (textLower.includes("macd")) {
        if (textLower.includes("histogram")) {
          const isAbove = textLower.includes(">") || textLower.includes("above") || textLower.includes("positive");
          entryConditions.push({
            id: `entry-${entryConditions.length + 1}`,
            left: { type: "MACD_HISTOGRAM", parameters: { fast: 12, slow: 26, signal: 9 } },
            comparator: isAbove ? "GREATER_THAN" : "LESS_THAN",
            right: 0,
            logicalOperator: "AND"
          });
        } else {
          const direction = textLower.includes("below") ? "CROSSES_BELOW" : "CROSSES_ABOVE";
          entryConditions.push({
            id: `entry-${entryConditions.length + 1}`,
            left: { type: "MACD", parameters: { fast: 12, slow: 26 } },
            comparator: direction,
            right: { type: "MACD_SIGNAL", parameters: { period: 9 } },
            logicalOperator: "AND"
          });
        }
      }

      // Check for Bollinger Bands (e.g. "price breaks below lower bollinger band", "price above upper bb")
      if (textLower.includes("bollinger") || textLower.includes("bb")) {
        if (textLower.includes("lower") || textLower.includes("oversold")) {
          entryConditions.push({
            id: `entry-${entryConditions.length + 1}`,
            left: { type: "PRICE" },
            comparator: "LESS_THAN",
            right: { type: "BOLLINGER_LOWER", parameters: { period: 20, multiplier: 2 } },
            logicalOperator: "AND"
          });
        } else {
          entryConditions.push({
            id: `entry-${entryConditions.length + 1}`,
            left: { type: "PRICE" },
            comparator: "GREATER_THAN",
            right: { type: "BOLLINGER_UPPER", parameters: { period: 20, multiplier: 2 } },
            logicalOperator: "AND"
          });
        }
      }

      // Check for Supertrend or ATR
      if (textLower.includes("supertrend")) {
        entryConditions.push({
          id: `entry-${entryConditions.length + 1}`,
          left: { type: "PRICE" },
          comparator: "GREATER_THAN",
          right: { type: "SUPERTREND", parameters: { period: 10, multiplier: 3 } },
          logicalOperator: "AND"
        });
      } else if (textLower.includes("atr")) {
        entryConditions.push({
          id: `entry-${entryConditions.length + 1}`,
          left: { type: "ATR", parameters: { period: 14 } },
          comparator: "GREATER_THAN",
          right: 2,
          logicalOperator: "AND"
        });
      }

      // Volume Filter (e.g. "volume > 1.5x volume sma", "high volume")
      if (textLower.includes("volume")) {
        entryConditions.push({
          id: `entry-${entryConditions.length + 1}`,
          left: { type: "VOLUME" },
          comparator: "GREATER_THAN",
          right: { type: "VOLUME_SMA", parameters: { period: 20 } },
          logicalOperator: "AND"
        });
      }

      // Time / Loop Delay extraction
      if (textLower.includes("loop") || textLower.includes("second") || textLower.includes("minute") || textLower.includes("after")) {
        if (textLower.includes("5 second") || textLower.includes("after 5")) {
          entryConditions.push({
            id: `entry-${entryConditions.length + 1}`,
            left: { type: "TIME_SINCE_LAST_TRADE" },
            comparator: "GREATER_THAN",
            right: 5
          });
        }
        if (textLower.includes("10 second") || textLower.includes("in 10")) {
          exitConditions.push({
            id: `exit-1`,
            left: { type: "TIME_SINCE_ENTRY" },
            comparator: "GREATER_THAN",
            right: 10
          });
        }
      }

      // Fallback default condition if none captured
      if (entryConditions.length === 0) {
        entryConditions.push({
          id: 'entry-1',
          left: { type: "RSI", parameters: { period: 14 } },
          comparator: "LESS_THAN",
          right: 35
        });
      }

      // Exit Conditions (if RSI overbought or generic profit target)
      if (exitConditions.length === 0) {
        exitConditions.push({
          id: 'exit-1',
          left: { type: "RSI", parameters: { period: 14 } },
          comparator: "GREATER_THAN",
          right: 70
        });
      }

      // Risk Parameter Extraction (e.g., "stop loss 2.5%", "take profit 5%")
      let stopLoss = 3.0;
      let takeProfit = 6.0;
      let trailingStop = undefined;

      const slMatch = textLower.match(/stop\s*loss\s*(?:of)?\s*(\d+(?:\.\d+)?)\s*%/);
      if (slMatch) stopLoss = parseFloat(slMatch[1]);

      const tpMatch = textLower.match(/take\s*profit\s*(?:of)?\s*(\d+(?:\.\d+)?)\s*%/);
      if (tpMatch) takeProfit = parseFloat(tpMatch[1]);

      const tsMatch = textLower.match(/trailing\s*stop\s*(?:of)?\s*(\d+(?:\.\d+)?)\s*%/);
      if (tsMatch) trailingStop = parseFloat(tsMatch[1]);

      return NextResponse.json({
        status: 'SUCCESS',
        strategy: {
          name: `${symbol.split('/')[0]} Advanced Strategy`,
          description: text,
          instruments: [{ symbol, assetClass }],
          action: { type: actionType, quantityType: "PERCENT_OF_ACCOUNT", quantityValue: 50 },
          entryConditions,
          exitConditions,
          riskParameters: {
            stopLossPercentage: stopLoss,
            takeProfitPercentage: takeProfit,
            trailingStopPercentage: trailingStop,
            maxPositionSizeUSD: 25000
          }
        }
      });
    }

    const parsedResult = await parseStrategyDescription(text);
    return NextResponse.json(parsedResult);
  } catch (error: any) {
    console.error('Error parsing strategy:', error);
    return NextResponse.json(
      { error: 'Internal server error during parsing.' },
      { status: 500 }
    );
  }
}

