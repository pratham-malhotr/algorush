/**
 * Local Ollama Integration for AlgoRush AI Copilot.
 * Connects directly to local Ollama running on http://127.0.0.1:11434
 * giving users free, zero-latency, private neural network reasoning.
 */

export async function queryLocalOllama(prompt: string, requestedModel?: string): Promise<{ text: string; model: string } | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7500); // 7.5s timeout

    const systemPrompt = `You are an elite institutional quantitative hedge fund strategist and chief risk officer for AlgoRush.
Answer the user's trading, market, risk, indicator, mathematics, or strategy question directly, thoughtfully, and clearly.
Provide actionable insights, clear mathematical principles, and practical algorithmic rules where applicable.
Do not repeat generic introductions or fluff. Complete every sentence cleanly.`;

    const fullPrompt = `${systemPrompt}\n\nUser Question: ${prompt}\n\nQuant Answer:`;
    const targetModel = requestedModel && requestedModel.includes('qwen') ? 'qwen3-vl:8b' : 'gemma3:1b';

    const response = await fetch('http://127.0.0.1:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: targetModel,
        prompt: fullPrompt,
        options: {
          num_predict: 350,
          temperature: 0.25,
          top_p: 0.9,
          stop: ['\n\nUser Question:', '\nUser:', '<|im_end|>']
        },
        stream: false,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (data && typeof data.response === 'string' && data.response.trim()) {
      let cleaned = data.response.trim();

      // Ensure the response does not terminate mid-sentence
      const lastChar = cleaned.slice(-1);
      if (!['.', '!', '?', '"', '`', '*', ')', '\n'].includes(lastChar)) {
        const lastPunctuation = Math.max(
          cleaned.lastIndexOf('. '),
          cleaned.lastIndexOf('.\n'),
          cleaned.lastIndexOf('? '),
          cleaned.lastIndexOf('! '),
          cleaned.lastIndexOf(':')
        );
        if (lastPunctuation > 100) {
          cleaned = cleaned.substring(0, lastPunctuation + 1).trim();
        }
      }

      return {
        text: cleaned,
        model: `Ollama (${targetModel})`,
      };
    }

    return null;
  } catch (err) {
    // Graceful fallback when Ollama is offline or busy
    return null;
  }
}
