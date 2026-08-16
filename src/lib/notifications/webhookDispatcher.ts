export interface WebhookConfig {
  telegramBotToken?: string;
  telegramChatId?: string;
  discordWebhookUrl?: string;
  isEnabled: boolean;
}

export interface TradeSignalPayload {
  strategyName: string;
  pair: string;
  side: 'BUY' | 'SELL';
  price: number;
  qty: number;
  leverage: number;
  venue: string;
  timestamp: string;
}

export async function dispatchTradeWebhookSignal(
  config: WebhookConfig,
  payload: TradeSignalPayload
): Promise<{ success: boolean; message: string }> {
  if (!config.isEnabled) {
    return { success: false, message: 'Webhooks disabled' };
  }

  const messageText = `🚨 **AlgoText Execution Alert** 🚨
Strategy: **${payload.strategyName}**
Pair: **${payload.pair}** | Side: **${payload.side}** (${payload.leverage}x)
Venue: **${payload.venue}** | Fill Price: **$${payload.price.toFixed(2)}**
Qty: **${payload.qty}** | Timestamp: **${new Date(payload.timestamp).toLocaleTimeString()}**`;

  const results: string[] = [];

  // Dispatch to Discord
  if (config.discordWebhookUrl && config.discordWebhookUrl.startsWith('http')) {
    try {
      await fetch(config.discordWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: messageText,
          username: 'AlgoText Trading Bot',
          avatar_url: 'https://images.unsplash.com/photo-1639762681485-074b7f4d2382?auto=format&fit=crop&q=80&w=200'
        })
      });
      results.push('Discord Dispatch Success');
    } catch (e: any) {
      console.warn('Discord webhook dispatch failed', e);
    }
  }

  // Dispatch to Telegram
  if (config.telegramBotToken && config.telegramChatId) {
    try {
      const tgUrl = `https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`;
      await fetch(tgUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: config.telegramChatId,
          text: messageText,
          parse_mode: 'Markdown'
        })
      });
      results.push('Telegram Dispatch Success');
    } catch (e: any) {
      console.warn('Telegram dispatch failed', e);
    }
  }

  return {
    success: true,
    message: results.length > 0 ? results.join(', ') : 'Webhook payload generated'
  };
}
