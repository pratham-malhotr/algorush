import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer at_live_')) {
    return NextResponse.json({ error: 'Unauthorized. Invalid API Key.' }, { status: 401 });
  }

  // Mock returning the user's active strategies
  const mockStrategies = [
    {
      id: "strat_9x8_alpha",
      name: "Bitcoin Mean Reversion",
      status: "ACTIVE",
      exposure_usd: 15000,
      daily_pnl: 342.10
    },
    {
      id: "strat_2y1_beta",
      name: "Tech Momentum",
      status: "PAUSED",
      exposure_usd: 0,
      daily_pnl: 0
    }
  ];

  return NextResponse.json({ data: mockStrategies });
}
