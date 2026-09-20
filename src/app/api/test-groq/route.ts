import { NextResponse } from 'next/server';
import { testGroqApiKey } from '@/lib/parser/groq';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { apiKey, model = 'openai/gpt-oss-120b' } = body;

    const effectiveKey = apiKey?.trim() || process.env.GROQ_API_KEY?.trim();

    if (!effectiveKey) {
      return NextResponse.json(
        { valid: false, error: 'Groq API key is required' },
        { status: 400 }
      );
    }

    const result = await testGroqApiKey(effectiveKey, model);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { valid: false, error: error?.message || 'Server error verifying Groq API key' },
      { status: 500 }
    );
  }
}
