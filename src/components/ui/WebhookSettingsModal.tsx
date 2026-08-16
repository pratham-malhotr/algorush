"use client"

import * as React from "react"
import { X, Send, Bell, CheckCircle2, ShieldCheck, Sparkles, MessageSquare, Bot } from "lucide-react"
import { dispatchTradeWebhookSignal } from "@/lib/notifications/webhookDispatcher"
import { toast } from "sonner"

interface WebhookSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WebhookSettingsModal({ isOpen, onClose }: WebhookSettingsModalProps) {
  const [discordUrl, setDiscordUrl] = React.useState("https://discord.com/api/webhooks/1234567890/demo_key")
  const [telegramToken, setTelegramToken] = React.useState("7129384912:AAH9k-demo_token_xyz")
  const [telegramChatId, setTelegramChatId] = React.useState("-10029384912")
  const [isEnabled, setIsEnabled] = React.useState(true)
  const [isTesting, setIsTesting] = React.useState(false)

  if (!isOpen) return null

  const handleTestPing = async () => {
    setIsTesting(true)
    await new Promise((r) => setTimeout(r, 600))

    try {
      const res = await dispatchTradeWebhookSignal(
        {
          discordWebhookUrl: discordUrl,
          telegramBotToken: telegramToken,
          telegramChatId: telegramChatId,
          isEnabled: true
        },
        {
          strategyName: "Binance Golden Cross Bot",
          pair: "BTC/USDT",
          side: "BUY",
          price: 64280.50,
          qty: 0.5,
          leverage: 10,
          venue: "Binance Futures",
          timestamp: new Date().toISOString()
        }
      )

      toast.success("✅ Test Signal Dispatched to Telegram & Discord Webhooks!")
    } catch (e: any) {
      toast.error("Webhook Ping Error: " + e.message)
    } finally {
      setIsTesting(false)
    }
  }

  const handleSave = () => {
    toast.success("Webhook Notification Settings Saved!")
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="flex w-full max-w-[560px] flex-col overflow-hidden rounded-2xl border border-bg-border bg-bg-surface shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-bg-border px-6 py-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-accent-blue" />
            <h3 className="font-bold text-text-primary text-base">Trade Signal Webhooks & Social Bot Alerts</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-text-tertiary hover:bg-bg-elevated hover:text-text-primary">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Toggle */}
          <div className="flex items-center justify-between rounded-xl border border-bg-border bg-bg-base p-4">
            <div>
              <span className="text-sm font-bold text-text-primary block">Enable Live Trade Signal Broadcasts</span>
              <span className="text-xs text-text-secondary">Instantly alert your Discord channels & Telegram subscribers when trades trigger.</span>
            </div>
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => setIsEnabled(e.target.checked)}
              className="h-5 w-5 accent-accent-blue rounded cursor-pointer"
            />
          </div>

          {/* Discord Webhook */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-[#5865F2]" /> Discord Webhook URL
            </label>
            <input
              type="text"
              value={discordUrl}
              onChange={(e) => setDiscordUrl(e.target.value)}
              placeholder="https://discord.com/api/webhooks/..."
              className="h-10 w-full rounded-xl border border-bg-border bg-bg-base px-3 font-mono text-xs text-text-primary outline-none focus:border-accent-blue"
            />
          </div>

          {/* Telegram Bot */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
              <Bot className="h-4 w-4 text-[#24A1DE]" /> Telegram Bot Settings
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-text-tertiary block mb-1">Bot Token</span>
                <input
                  type="text"
                  value={telegramToken}
                  onChange={(e) => setTelegramToken(e.target.value)}
                  placeholder="123456:ABC-DEF..."
                  className="h-10 w-full rounded-xl border border-bg-border bg-bg-base px-3 font-mono text-xs text-text-primary outline-none focus:border-accent-blue"
                />
              </div>

              <div>
                <span className="text-[11px] text-text-tertiary block mb-1">Chat ID / Channel ID</span>
                <input
                  type="text"
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                  placeholder="-10012345678"
                  className="h-10 w-full rounded-xl border border-bg-border bg-bg-base px-3 font-mono text-xs text-text-primary outline-none focus:border-accent-blue"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-bg-border bg-bg-base px-6 py-4">
          <button
            onClick={handleTestPing}
            disabled={isTesting}
            className="flex items-center gap-1.5 rounded-xl border border-bg-border bg-bg-surface px-4 py-2 text-xs font-bold text-accent-blue hover:bg-accent-blue/10 transition-colors disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" /> Test Dispatch Ping
          </button>

          <div className="flex items-center gap-3">
            <button onClick={onClose} className="text-xs font-semibold text-text-secondary hover:text-text-primary">
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 rounded-xl bg-accent-blue px-5 py-2 text-xs font-bold text-white hover:bg-blue-600 shadow-md transition-all"
            >
              <CheckCircle2 className="h-4 w-4" /> Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
