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
      console.warn('No OPENAI_API_KEY found, using naive local fallback.');
      await new Promise(r => setTimeout(r, 1000)); // Simulate delay
      
      const textLower = text.toLowerCase();
      
      // Naive symbol extraction
      let symbol = "BTC";
      let assetClass = "CRYPTO";
      
      if (textLower.includes("bitcoin") || textLower.includes("btc")) {
         symbol = "BTC/USDT";
         assetClass = "CRYPTO";
      } else if (textLower.includes("ethereum") || textLower.includes("eth")) {
         symbol = "ETH/USDT";
         assetClass = "CRYPTO";
      } else if (textLower.includes("sol") || textLower.includes("solana")) {
         symbol = "SOL";
         assetClass = "CRYPTO";
      }

      // Naive action extraction
      let actionType = "BUY";
      
      const buyIndex = textLower.indexOf("buy");
      const sellIndex = textLower.indexOf("sell");
      const shortIndex = textLower.indexOf("short");
      
      const hasShort = shortIndex !== -1;
      const hasBuy = buyIndex !== -1;
      const hasSell = sellIndex !== -1;
      
      if (hasShort) {
         // Explicitly shorting
         actionType = "SELL";
      } else if (hasSell && !hasBuy) {
         // Only mentions sell, so probably a short
         actionType = "SELL";
      } else if (hasSell && hasBuy) {
         // Mentions both, see which comes first
         if (sellIndex < buyIndex) {
            actionType = "SELL";
         }
      }
      let entryConditions: any[] = [
        { id: 'entry-1', left: { type: "MARKET_EVENT" }, comparator: "EQUAL", right: "TODAY" }
      ];
      let exitConditions: any[] = [
        { id: 'exit-1', left: { type: "MARKET_EVENT" }, comparator: "EQUAL", right: "OPEN" }
      ];

      if (textLower.includes("loop") || textLower.includes("second") || textLower.includes("minute")) {
        entryConditions = [];
        exitConditions = [];
        let eIdx = 1;
        let xIdx = 1;

        if (textLower.includes("buy it after 5 second") || textLower.includes("buy after 5 second")) {
          entryConditions.push({ id: `entry-${eIdx++}`, left: { type: "TIME_SINCE_LAST_TRADE" }, comparator: "GREATER_THAN", right: 5 });
        } else {
           entryConditions.push({ id: `entry-${eIdx++}`, left: { type: "MARKET_EVENT" }, comparator: "EQUAL", right: "NOW" });
        }

        if (textLower.includes("loop for 20")) {
          entryConditions.push({ id: `entry-${eIdx++}`, left: { type: "LOOP_COUNT" }, comparator: "LESS_THAN", right: 20 });
        }

        if (textLower.includes("sell in 10 second") || textLower.includes("sell it in 10 second")) {
          exitConditions.push({ id: `exit-${xIdx++}`, left: { type: "TIME_SINCE_ENTRY" }, comparator: "GREATER_THAN", right: 10 });
        } else {
          exitConditions.push({ id: `exit-${xIdx++}`, left: { type: "PRICE" }, comparator: "GREATER_THAN", right: 0 }); // generic
        }
      }

      return NextResponse.json({
        status: 'SUCCESS',
        strategy: {
          name: `${symbol} Strategy`,
          description: text,
          instruments: [{ symbol, assetClass }],
          action: { type: actionType, quantityType: "SHARES", quantityValue: 1 },
          entryConditions,
          exitConditions,
          riskParameters: { stopLossPercentage: 5, maxPositionSizeUsd: 10000 }
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
