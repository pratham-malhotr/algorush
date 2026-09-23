import { NextResponse } from 'next/server';
import { testClaudeApiKey } from '@/lib/parser/claude';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { apiKey, model = 'claude-3-7-sonnet' } = body;

    const effectiveKey = 
      apiKey?.trim() || 
      process.env.ANTHROPIC_API_KEY?.trim() || 
      process.env.CLAUDE_API_KEY?.trim() ||
      process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY?.trim();

    if (!effectiveKey) {
      return NextResponse.json(
        { valid: false, error: 'Anthropic Claude API key is required' },
        { status: 400 }
      );
    }

    const result = await testClaudeApiKey(effectiveKey, model);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { valid: false, error: error?.message || 'Server error verifying Claude API key' },
      { status: 500 }
    );
  }
}
