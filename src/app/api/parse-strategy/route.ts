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
      console.warn('No OPENAI_API_KEY found, using mock fallback for MVP.');
      await new Promise(r => setTimeout(r, 1000)); // Simulate delay
      return NextResponse.json({
        status: 'SUCCESS',
        strategy: {
          name: "AAPL Swing Strategy",
          description: "Buy 50 AAPL today and sell on Monday open.",
          instruments: [{ symbol: "AAPL", assetClass: "EQUITY" }],
          action: { type: "BUY", quantityType: "SHARES", quantityValue: 50 },
          entryConditions: [
            { id: 'entry-1', left: { type: "MARKET_EVENT" }, comparator: "EQUAL", right: "TODAY" }
          ],
          exitConditions: [
            { id: 'exit-1', left: { type: "DAY_OF_WEEK" }, comparator: "EQUAL", right: "MONDAY" },
            { id: 'exit-2', left: { type: "MARKET_EVENT" }, comparator: "EQUAL", right: "OPEN" }
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
