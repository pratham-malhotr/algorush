"use client"

import * as React from "react"
import { X, Key, Sparkles, ExternalLink, CheckCircle2, AlertCircle, Loader2, ShieldCheck, Zap, Bot, Cpu } from "lucide-react"
import { useBuilderStore, AiModelType } from "@/store/useBuilderStore"
import { toast } from "sonner"
import { testGeminiApiKey } from "@/lib/parser/gemini"

export function GeminiSettingsModal() {
  const { 
    isGeminiModalOpen, 
    setIsGeminiModalOpen, 
    aiModel, 
    setAiModel, 
    geminiApiKey, 
    setGeminiApiKey 
  } = useBuilderStore()

  const [inputKey, setInputKey] = React.useState(geminiApiKey)
  const [showKey, setShowKey] = React.useState(false)
  const [isTesting, setIsTesting] = React.useState(false)
  const [testStatus, setTestStatus] = React.useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  React.useEffect(() => {
    setInputKey(geminiApiKey)
    setTestStatus('idle')
    setErrorMessage(null)
  }, [geminiApiKey, isGeminiModalOpen])

  if (!isGeminiModalOpen) return null

  const handleTestKey = async () => {
    if (!inputKey.trim()) {
      toast.error("Please enter a Gemini API key to test.")
      return
    }

    setIsTesting(true)
    setTestStatus('idle')
    setErrorMessage(null)

    try {
      const res = await fetch("/api/test-gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: inputKey.trim(),
          model: aiModel.startsWith('gemini') ? aiModel : 'gemini-2.5-flash'
        })
      })
      const result = await res.json()
      setIsTesting(false)

      if (result.valid) {
        setTestStatus('success')
        toast.success(`Gemini API key verified! Connected to ${result.modelVerified || 'Gemini 2.5 Flash'}.`)
      } else {
        setTestStatus('error')
        setErrorMessage(result.error || "Failed to authenticate with Gemini API.")
        toast.error("Invalid API Key or quota error.")
      }
    } catch (err: any) {
      setIsTesting(false)
      setTestStatus('error')
      setErrorMessage(err?.message || "Connection failed")
      toast.error("Error connecting to Gemini API.")
    }
  }

  const handleSave = () => {
    setGeminiApiKey(inputKey.trim())
    toast.success("AI Settings Saved!")
    setIsGeminiModalOpen(false)
  }

  const handleClear = () => {
    setInputKey("")
    setGeminiApiKey("")
    setTestStatus('idle')
    setErrorMessage(null)
    toast.info("Gemini API key cleared. Reverting to local quant parser.")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg rounded-2xl border border-bg-border bg-bg-surface p-6 shadow-2xl shadow-accent-blue/10 flex flex-col gap-5 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-accent-blue/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent-blue/30 bg-accent-blue/10 text-accent-blue shadow-inner">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                Gemini AI Engine Settings
                <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  100% Free Tier
                </span>
              </h2>
              <p className="text-xs text-text-secondary">
                Configure your Gemini API key & model for institutional strategy generation.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsGeminiModalOpen(false)}
            className="rounded-lg p-1.5 text-text-tertiary hover:bg-bg-elevated hover:text-text-primary transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Free Tier Notice Card */}
        <div className="rounded-xl border border-accent-blue/20 bg-accent-blue/5 p-3.5 flex flex-col gap-2 text-xs">
          <div className="flex items-center justify-between font-semibold text-accent-blue">
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-accent-blue" />
              <span>Free API Access via Google AI Studio</span>
            </div>
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] underline hover:text-blue-300 font-bold"
            >
              <span>Get Free Key</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <p className="text-text-secondary text-[11.5px] leading-relaxed">
            Google provides a free tier with <strong>15 requests per minute</strong> and <strong>1,000,000 tokens/min</strong> with <em>no credit card required</em>. Get your key in 10 seconds to unlock deep quantitative reasoning.
          </p>
        </div>

        {/* Model Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-text-primary flex items-center justify-between">
            <span>Select AI Model</span>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Google Gemini Frontier Engine
            </span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {/* Gemini 2.5 Flash (Featured Frontier Fast) */}
            <button
              type="button"
              onClick={() => setAiModel('gemini-2.5-flash')}
              className={`col-span-2 flex flex-col items-start p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                aiModel === 'gemini-2.5-flash' || aiModel === 'gemini-3.8-flash'
                  ? 'border-emerald-500 bg-emerald-500/10 shadow-sm ring-1 ring-emerald-500/40'
                  : 'border-bg-border bg-bg-base hover:border-bg-border/80'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-1.5 font-bold text-xs text-text-primary">
                  <Cpu className="h-4 w-4 text-emerald-400" />
                  <span>Gemini 2.5 Flash</span>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 ml-1">
                    Frontier Fast
                  </span>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-accent-blue/20 text-accent-blue border border-accent-blue/30">
                  Recommended
                </span>
              </div>
              <span className="text-[10.5px] text-text-secondary mt-1">
                Google's premier frontier model: Ultra-fast quantitative reasoning, multi-turn conversational asking & responses, and free Google AI Studio tier.
              </span>
            </button>

            <button
              type="button"
              onClick={() => setAiModel('gemini-2.5-pro')}
              className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all ${
                aiModel === 'gemini-2.5-pro'
                  ? 'border-accent-blue bg-accent-blue/10 shadow-sm ring-1 ring-accent-blue/40'
                  : 'border-bg-border bg-bg-base hover:border-bg-border/80'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-1.5 font-bold text-xs text-text-primary">
                  <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                  <span>Gemini 2.5 Pro</span>
                </div>
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Reasoning
                </span>
              </div>
              <span className="text-[10px] text-text-tertiary mt-1">Deep institutional quant modeling & complex algorithms</span>
            </button>

            <button
              type="button"
              onClick={() => setAiModel('gemini-2.0-flash')}
              className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all ${
                aiModel === 'gemini-2.0-flash'
                  ? 'border-accent-blue bg-accent-blue/10 shadow-sm ring-1 ring-accent-blue/40'
                  : 'border-bg-border bg-bg-base hover:border-bg-border/80'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-1.5 font-bold text-xs text-text-primary">
                  <Cpu className="h-3.5 w-3.5 text-purple-400" />
                  <span>Gemini 2.0 Flash</span>
                </div>
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Big Model
                </span>
              </div>
              <span className="text-[10px] text-text-tertiary mt-1">High-IQ reasoning, deep quant logic, free tier</span>
            </button>

            <button
              type="button"
              onClick={() => setAiModel('gemini-1.5-pro')}
              className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all ${
                aiModel === 'gemini-1.5-pro'
                  ? 'border-accent-blue bg-accent-blue/10 shadow-sm ring-1 ring-accent-blue/40'
                  : 'border-bg-border bg-bg-base hover:border-bg-border/80'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-1.5 font-bold text-xs text-text-primary">
                  <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                  <span>Gemini 1.5 Pro</span>
                </div>
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Big Model
                </span>
              </div>
              <span className="text-[10px] text-text-tertiary mt-1">Complex multi-condition strategies, free tier</span>
            </button>

            <button
              type="button"
              onClick={() => setAiModel('gemini-1.5-flash-8b')}
              className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all ${
                aiModel === 'gemini-1.5-flash-8b'
                  ? 'border-accent-blue bg-accent-blue/10 shadow-sm ring-1 ring-accent-blue/40'
                  : 'border-bg-border bg-bg-base hover:border-bg-border/80'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-1.5 font-bold text-xs text-text-primary">
                  <Zap className="h-3.5 w-3.5 text-accent-blue" />
                  <span>Gemini Flash 8B</span>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-accent-blue/20 text-accent-blue">
                  Fast
                </span>
              </div>
              <span className="text-[10px] text-text-tertiary mt-1">Ultra-low latency execution, free tier</span>
            </button>

            <button
              type="button"
              onClick={() => setAiModel('gemini-1.5-flash')}
              className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all ${
                aiModel === 'gemini-1.5-flash'
                  ? 'border-accent-blue bg-accent-blue/10 shadow-sm ring-1 ring-accent-blue/40'
                  : 'border-bg-border bg-bg-base hover:border-bg-border/80'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-1.5 font-bold text-xs text-text-primary">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Gemini 1.5 Flash</span>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                  Balanced
                </span>
              </div>
              <span className="text-[10px] text-text-tertiary mt-1">High-throughput workhorse, free tier</span>
            </button>
          </div>
        </div>

        {/* API Key Input */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-text-primary flex items-center gap-1.5">
              <Key className="h-3.5 w-3.5 text-accent-blue" />
              <span>Google Gemini API Key</span>
            </label>
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="text-[11px] text-accent-blue hover:underline"
            >
              {showKey ? "Hide" : "Show"}
            </button>
          </div>

          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={inputKey}
              onChange={(e) => {
                setInputKey(e.target.value)
                setTestStatus('idle')
                setErrorMessage(null)
              }}
              placeholder="AIzaSy..."
              className="h-10 w-full rounded-xl border border-bg-border bg-bg-base px-3.5 pr-20 text-xs text-text-primary outline-none focus:border-accent-blue transition-all"
            />
            <button
              type="button"
              onClick={handleTestKey}
              disabled={isTesting || !inputKey.trim()}
              className="absolute right-1.5 top-1.5 h-7 px-2.5 rounded-lg bg-bg-elevated border border-bg-border text-[11px] font-bold text-text-primary hover:border-accent-blue hover:text-accent-blue disabled:opacity-40 transition-all flex items-center gap-1"
            >
              {isTesting ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
              <span>{isTesting ? "Testing" : "Test"}</span>
            </button>
          </div>

          {/* Test Status feedback */}
          {testStatus === 'success' && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mt-1">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>Connected! Gemini API key verified.</span>
            </div>
          )}

          {testStatus === 'error' && (
            <div className="flex items-start gap-1.5 text-xs text-accent-red mt-1">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span className="leading-tight">{errorMessage}</span>
            </div>
          )}

          <p className="text-[10px] text-text-tertiary">
            Keys entered here are stored locally in your browser and used only for strategy parsing. You can also configure <code className="text-accent-blue font-mono">GEMINI_API_KEY</code> in <code className="text-text-primary font-mono">.env.local</code>.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-bg-border pt-4">
          {geminiApiKey ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-accent-red hover:underline font-semibold"
            >
              Remove Key
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsGeminiModalOpen(false)}
              className="h-9 px-4 rounded-xl border border-bg-border bg-bg-base text-xs font-semibold text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="h-9 px-4 rounded-xl bg-accent-blue text-white text-xs font-bold hover:bg-blue-600 transition-colors shadow-sm"
            >
              Save & Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
