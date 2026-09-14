import { NextResponse } from 'next/server';
import { testGeminiApiKey } from '@/lib/parser/gemini';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { apiKey, model = 'gemini-2.5-flash' } = body;

    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
      return NextResponse.json(
        { valid: false, error: 'API key is required' },
        { status: 400 }
      );
    }

    const result = await testGeminiApiKey(apiKey.trim(), model);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { valid: false, error: error?.message || 'Server error verifying Gemini API key' },
      { status: 500 }
    );
  }
}
