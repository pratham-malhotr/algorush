import { NextResponse } from 'next/server';
import { engageKillSwitch, disengageKillSwitch } from '@/lib/risk/engine';

export async function POST(req: Request) {
  try {
    const { action } = await req.json();

    if (action === 'engage') {
      engageKillSwitch();
      return NextResponse.json({ status: 'ENGAGED' });
    } else if (action === 'disengage') {
      disengageKillSwitch();
      return NextResponse.json({ status: 'DISENGAGED' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
