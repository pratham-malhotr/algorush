import { NextResponse } from 'next/server';
import { parseStrategyDescription } from '@/lib/parser/agent';

export async function POST(req: Request) {
  try {
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
      let symbol = "AAPL";
      let assetClass = "EQUITY";
      
      if (textLower.includes("bitcoin") || textLower.includes("btc")) {
         symbol = "BTC/USDT";
         assetClass = "CRYPTO";
      } else if (textLower.includes("ethereum") || textLower.includes("eth")) {
         symbol = "ETH/USDT";
         assetClass = "CRYPTO";
      } else if (textLower.includes("tsla") || textLower.includes("tesla")) {
         symbol = "TSLA";
         assetClass = "EQUITY";
      } else if (textLower.includes("msft") || textLower.includes("microsoft")) {
         symbol = "MSFT";
         assetClass = "EQUITY";
      }

      // Naive action extraction
      let actionType = "BUY";
      if (textLower.includes("sell") || textLower.includes("short")) {
         actionType = "SELL";
      }

      return NextResponse.json({
        status: 'SUCCESS',
        strategy: {
          name: `${symbol} Strategy`,
          description: text,
          instruments: [{ symbol, assetClass }],
          action: { type: actionType, quantityType: "SHARES", quantityValue: 1 },
          entryConditions: [
            { id: 'entry-1', left: { type: "MARKET_EVENT" }, comparator: "EQUAL", right: "TODAY" }
          ],
          exitConditions: [
            { id: 'exit-1', left: { type: "MARKET_EVENT" }, comparator: "EQUAL", right: "OPEN" }
          ],
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
