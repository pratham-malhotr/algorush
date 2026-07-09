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
          assets: ["BTC", "ETH"],
          timeframe: "1h",
          indicators: [{ type: "RSI", period: 14 }],
          entryConditions: [{ type: "RSI_CROSS_UNDER", value: 30 }],
          exitConditions: [{ type: "RSI_CROSS_OVER", value: 70 }],
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
