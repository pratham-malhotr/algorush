"use client"

import * as React from "react"
import { 
  X, Key, Sparkles, ExternalLink, CheckCircle2, AlertCircle, 
  Loader2, Zap, Cpu, Flame, Check
} from "lucide-react"
import { useBuilderStore, AiModelType } from "@/store/useBuilderStore"
import { toast } from "sonner"

export function GeminiSettingsModal() {
  const { 
    isGeminiModalOpen, 
    setIsGeminiModalOpen, 
    aiModel, 
    setAiModel, 
    claudeApiKey,
    setClaudeApiKey,
    groqApiKey,
    setGroqApiKey,
    geminiApiKey, 
    setGeminiApiKey 
  } = useBuilderStore()

  // Active tab: 'claude' | 'groq' | 'gemini'
  const [activeTab, setActiveTab] = React.useState<'claude' | 'groq' | 'gemini'>('claude')

  // Claude State
  const [inputClaudeKey, setInputClaudeKey] = React.useState(claudeApiKey)
  const [showClaudeKey, setShowClaudeKey] = React.useState(false)
  const [isTestingClaude, setIsTestingClaude] = React.useState(false)
  const [claudeTestStatus, setClaudeTestStatus] = React.useState<'idle' | 'success' | 'warning' | 'error'>('idle')
  const [claudeLatency, setClaudeLatency] = React.useState<number | null>(null)
  const [claudeMessage, setClaudeMessage] = React.useState<string | null>(null)
  const [claudeError, setClaudeError] = React.useState<string | null>(null)

  // Groq State
  const [inputGroqKey, setInputGroqKey] = React.useState(groqApiKey)
  const [showGroqKey, setShowGroqKey] = React.useState(false)
  const [isTestingGroq, setIsTestingGroq] = React.useState(false)
  const [groqTestStatus, setGroqTestStatus] = React.useState<'idle' | 'success' | 'error'>('idle')
  const [groqLatency, setGroqLatency] = React.useState<number | null>(null)
  const [groqError, setGroqError] = React.useState<string | null>(null)

  // Gemini State
  const [inputGeminiKey, setInputGeminiKey] = React.useState(geminiApiKey)
  const [showGeminiKey, setShowGeminiKey] = React.useState(false)
  const [isTestingGemini, setIsTestingGemini] = React.useState(false)
  const [geminiTestStatus, setGeminiTestStatus] = React.useState<'idle' | 'success' | 'error'>('idle')
  const [geminiError, setGeminiError] = React.useState<string | null>(null)

  React.useEffect(() => {
    setInputClaudeKey(claudeApiKey)
    setInputGroqKey(groqApiKey)
    setInputGeminiKey(geminiApiKey)
    setClaudeTestStatus('idle')
    setGroqTestStatus('idle')
    setGeminiTestStatus('idle')
    setClaudeError(null)
    setGroqError(null)
    setGeminiError(null)
    if (aiModel.startsWith('claude')) {
      setActiveTab('claude')
    } else if (aiModel.startsWith('gemini')) {
      setActiveTab('gemini')
    } else {
      setActiveTab('groq')
    }
  }, [claudeApiKey, groqApiKey, geminiApiKey, isGeminiModalOpen, aiModel])

  if (!isGeminiModalOpen) return null

  const handleTestClaudeKey = async () => {
    if (!inputClaudeKey.trim()) {
      toast.error("Please enter an Anthropic Claude API key to test.")
      return
    }

    setIsTestingClaude(true)
    setClaudeTestStatus('idle')
    setClaudeError(null)
    setClaudeMessage(null)

    try {
      const res = await fetch("/api/test-claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: inputClaudeKey.trim(),
          model: aiModel.startsWith('claude') ? aiModel : 'claude-3-7-sonnet'
        })
      })
      const result = await res.json()
      setIsTestingClaude(false)

      if (result.valid) {
        if (result.limitReached) {
          setClaudeTestStatus('warning')
          setClaudeMessage(result.message || "Claude limit reached — Auto-Groq failover is ready.")
          toast.warning(result.message || "Claude limit reached! Auto-Groq failover active.")
        } else {
          setClaudeTestStatus('success')
          setClaudeLatency(result.latencyMs || 600)
          setClaudeMessage(result.message || "Connected to Anthropic Claude.")
          toast.success(`Claude API verified! Connected to ${result.modelVerified || 'Claude 3.7 Sonnet'}.`)
        }
      } else {
        setClaudeTestStatus('error')
        setClaudeError(result.error || "Failed to authenticate with Claude API.")
        toast.error(result.error || "Invalid Claude API Key.")
      }
    } catch (err: any) {
      setIsTestingClaude(false)
      setClaudeTestStatus('error')
      setClaudeError(err?.message || "Connection failed")
      toast.error("Error connecting to Anthropic API.")
    }
  }

  const handleTestGroqKey = async () => {
    if (!inputGroqKey.trim()) {
      toast.error("Please enter a Groq API key to test.")
      return
    }

    setIsTestingGroq(true)
    setGroqTestStatus('idle')
    setGroqError(null)

    try {
      const res = await fetch("/api/test-groq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: inputGroqKey.trim(),
          model: aiModel.startsWith('groq') ? aiModel : 'groq-gpt-120b'
        })
      })
      const result = await res.json()
      setIsTestingGroq(false)

      if (result.valid) {
        setGroqTestStatus('success')
        setGroqLatency(result.latencyMs || 180)
        toast.success(`Groq LPU verified! Connected to ${result.modelVerified || 'Groq GPT-OSS 120B'} in ${result.latencyMs || 180}ms.`)
      } else {
        setGroqTestStatus('error')
        setGroqError(result.error || "Failed to authenticate with Groq API.")
        toast.error("Invalid Groq API Key.")
      }
    } catch (err: any) {
      setIsTestingGroq(false)
      setGroqTestStatus('error')
      setGroqError(err?.message || "Connection failed")
      toast.error("Error connecting to Groq API.")
    }
  }

  const handleTestGeminiKey = async () => {
    if (!inputGeminiKey.trim()) {
      toast.error("Please enter a Gemini API key to test.")
      return
    }

    setIsTestingGemini(true)
    setGeminiTestStatus('idle')
    setGeminiError(null)

    try {
      const res = await fetch("/api/test-gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: inputGeminiKey.trim(),
          model: aiModel.startsWith('gemini') ? aiModel : 'gemini-2.5-flash'
        })
      })
      const result = await res.json()
      setIsTestingGemini(false)

      if (result.valid) {
        setGeminiTestStatus('success')
        toast.success(`Gemini API key verified! Connected to ${result.modelVerified || 'Gemini 2.5 Flash'}.`)
      } else {
        setGeminiTestStatus('error')
        setGeminiError(result.error || "Failed to authenticate with Gemini API.")
        toast.error("Invalid API Key or quota error.")
      }
    } catch (err: any) {
      setIsTestingGemini(false)
      setGeminiTestStatus('error')
      setGeminiError(err?.message || "Connection failed")
      toast.error("Error connecting to Gemini API.")
    }
  }

  const handleSave = () => {
    setClaudeApiKey(inputClaudeKey.trim())
    setGroqApiKey(inputGroqKey.trim())
    setGeminiApiKey(inputGeminiKey.trim())

    if (activeTab === 'claude' && !aiModel.startsWith('claude')) {
      setAiModel('claude-3-7-sonnet')
    } else if (activeTab === 'groq' && !aiModel.startsWith('groq')) {
      setAiModel('groq-gpt-120b')
    } else if (activeTab === 'gemini' && !aiModel.startsWith('gemini')) {
      setAiModel('gemini-2.5-flash')
    }

    toast.success("AI Copilot Engine Settings Saved!")
    setIsGeminiModalOpen(false)
  }

  const handleClearClaude = () => {
    setInputClaudeKey("")
    setClaudeApiKey("")
    setClaudeTestStatus('idle')
    setClaudeError(null)
    setClaudeMessage(null)
    toast.info("Claude API key cleared.")
  }

  const handleClearGroq = () => {
    setInputGroqKey("")
    setGroqApiKey("")
    setGroqTestStatus('idle')
    setGroqError(null)
    toast.info("Groq API key cleared.")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl rounded-2xl border border-bg-border bg-bg-surface p-6 shadow-2xl shadow-accent-blue/15 flex flex-col gap-4 overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Glows */}
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-accent-blue/15 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-bg-border/60 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-inner">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                AI Copilot Engine Configuration
                <span className="rounded bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-400 flex items-center gap-1">
                  <Flame className="h-3 w-3" />
                  Ultra-Fast LPUs
                </span>
              </h2>
              <p className="text-xs text-text-secondary">
                Select your high-speed neural engine and API keys for sub-second quant generation.
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

        {/* Engine Switcher Tabs */}
        <div className="flex rounded-xl bg-bg-base p-1 border border-bg-border/80 gap-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('claude')
              if (!aiModel.startsWith('claude')) {
                setAiModel('claude-3-7-sonnet')
              }
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'claude'
                ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-text-tertiary hover:text-text-primary'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
            <span>Claude (Auto-Groq)</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-extrabold">
              Failover
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('groq')
              if (!aiModel.startsWith('groq')) {
                setAiModel('groq-gpt-120b')
              }
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'groq'
                ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
                : 'text-text-tertiary hover:text-text-primary'
            }`}
          >
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span>Groq LPUs™</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-extrabold">
              &lt;500ms
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('gemini')
              if (!aiModel.startsWith('gemini')) {
                setAiModel('gemini-2.5-flash')
              }
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'gemini'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-text-tertiary hover:text-text-primary'
            }`}
          >
            <Cpu className="h-3.5 w-3.5 text-emerald-400" />
            <span>Google Gemini</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-extrabold">
              Free
            </span>
          </button>
        </div>

        {/* TAB 0: ANTHROPIC CLAUDE + AUTO-GROQ FAILOVER */}
        {activeTab === 'claude' && (
          <div className="flex flex-col gap-4">
            {/* Claude Callout Card */}
            <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-3 flex flex-col gap-1.5 text-xs">
              <div className="flex items-center justify-between font-semibold text-purple-400">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  <span>Anthropic Claude 3.7 & 3.5 Sonnet</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1">
                    <Zap className="h-3 w-3 text-emerald-400" />
                    Auto-Failover to Groq LPUs™
                  </span>
                </div>
              </div>
              <p className="text-text-secondary text-[11px] leading-relaxed">
                Elite institutional quantitative reasoning. If Claude encounters credit limits or rate limits (HTTP 429/529), AlgoRush seamlessly and instantaneously routes all prompts to Groq LPUs™ (GPT-OSS 120B) for zero-downtime execution.
              </p>
            </div>

            {/* Claude Model Picker */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-text-primary flex items-center justify-between">
                <span>Select Claude Model</span>
                <span className="text-[10px] text-purple-400 font-semibold flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Dual Engine Failover
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Claude 3.7 Sonnet */}
                <button
                  type="button"
                  onClick={() => setAiModel('claude-3-7-sonnet')}
                  className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                    aiModel === 'claude-3-7-sonnet'
                      ? 'border-purple-500 bg-purple-500/10 shadow-sm ring-1 ring-purple-500/40'
                      : 'border-bg-border bg-bg-base hover:border-bg-border/80'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-text-primary">
                      <Sparkles className="h-4 w-4 text-purple-400" />
                      <span>Claude 3.7 Sonnet</span>
                    </div>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Recommended
                    </span>
                  </div>
                  <span className="text-[10.5px] text-text-secondary mt-1">
                    Anthropic's frontier hybrid reasoning model. Deep quantitative alpha reasoning with automatic Groq fallback.
                  </span>
                </button>

                {/* Claude 3.5 Sonnet */}
                <button
                  type="button"
                  onClick={() => setAiModel('claude-3-5-sonnet')}
                  className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                    aiModel === 'claude-3-5-sonnet'
                      ? 'border-purple-500 bg-purple-500/10 shadow-sm ring-1 ring-purple-500/40'
                      : 'border-bg-border bg-bg-base hover:border-bg-border/80'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-text-primary">
                      <Cpu className="h-4 w-4 text-indigo-400" />
                      <span>Claude 3.5 Sonnet</span>
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Institutional
                    </span>
                  </div>
                  <span className="text-[10.5px] text-text-secondary mt-1">
                    Proven institutional benchmark for coding & algorithmic strategy synthesis with automatic Groq fallback.
                  </span>
                </button>
              </div>
            </div>

            {/* Claude API Key Input */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5 text-purple-400" />
                  <span>Anthropic Claude API Key</span>
                </label>
                <div className="flex items-center gap-2">
                  {inputClaudeKey && (
                    <button
                      type="button"
                      onClick={handleClearClaude}
                      className="text-[10px] text-rose-400 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowClaudeKey(!showClaudeKey)}
                    className="text-[11px] text-purple-400 hover:underline"
                  >
                    {showClaudeKey ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="relative">
                <input
                  type={showClaudeKey ? "text" : "password"}
                  value={inputClaudeKey}
                  onChange={(e) => {
                    setInputClaudeKey(e.target.value)
                    setClaudeTestStatus('idle')
                    setClaudeError(null)
                    setClaudeMessage(null)
                  }}
                  placeholder="sk-ant-api03-..."
                  className="h-10 w-full rounded-xl border border-bg-border bg-bg-base px-3.5 pr-20 text-xs text-text-primary outline-none focus:border-purple-400 font-mono transition-all"
                />
                <button
                  type="button"
                  onClick={handleTestClaudeKey}
                  disabled={isTestingClaude || !inputClaudeKey.trim()}
                  className="absolute right-1.5 top-1.5 h-7 px-2.5 rounded-lg bg-bg-elevated border border-bg-border text-[11px] font-bold text-text-primary hover:border-purple-400 hover:text-purple-400 disabled:opacity-40 transition-all flex items-center gap-1"
                >
                  {isTestingClaude ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                  <span>{isTestingClaude ? "Testing" : "Test"}</span>
                </button>
              </div>

              {/* Status Feedback */}
              {claudeTestStatus === 'success' && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mt-0.5">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span>{claudeMessage || `Claude API verified! Latency: ${claudeLatency}ms`}</span>
                </div>
              )}

              {claudeTestStatus === 'warning' && (
                <div className="flex items-start gap-2 p-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-xs text-amber-300 mt-0.5">
                  <Zap className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-amber-400">Claude Key Authenticated — Auto-Groq LPUs™ Active</span>
                    <span className="text-[11px] text-text-secondary leading-snug">{claudeMessage}</span>
                  </div>
                </div>
              )}

              {claudeTestStatus === 'error' && (
                <div className="flex items-start gap-1.5 text-xs text-rose-400 mt-0.5">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span className="leading-tight">{claudeError}</span>
                </div>
              )}

              <p className="text-[10px] text-text-tertiary">
                Loaded securely from <code className="text-purple-400 font-mono">ANTHROPIC_API_KEY</code> in <code className="text-text-primary font-mono">.env.local</code>.
              </p>
            </div>
          </div>
        )}

        {/* TAB 1: GROQ LPU ENGINE */}
        {activeTab === 'groq' && (
          <div className="flex flex-col gap-4">
            {/* Groq Callout Card */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 flex flex-col gap-1.5 text-xs">
              <div className="flex items-center justify-between font-semibold text-amber-400">
                <div className="flex items-center gap-1.5">
                  <Zap className="h-4 w-4" />
                  <span>Groq LPUs™: Blazing Fast Quantitative Inference</span>
                </div>
                <a 
                  href="https://console.groq.com/keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] underline hover:text-amber-300 font-bold"
                >
                  <span>Groq Console</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <p className="text-text-secondary text-[11px] leading-relaxed">
                Groq LPUs process user strategies, technical indicators, and multi-turn questions at over <strong>500+ tokens/second</strong>, compiling complete visual flowcharts and backtests almost instantaneously.
              </p>
            </div>

            {/* Groq Model Picker */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-text-primary flex items-center justify-between">
                <span>Select Groq Model</span>
                <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Groq Hardware Acceleration
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Groq GPT-OSS 120B (Primary / Recommended) */}
                <button
                  type="button"
                  onClick={() => setAiModel('groq-gpt-120b')}
                  className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                    aiModel === 'groq-gpt-120b'
                      ? 'border-amber-500 bg-amber-500/10 shadow-sm ring-1 ring-amber-500/40'
                      : 'border-bg-border bg-bg-base hover:border-bg-border/80'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-text-primary">
                      <Zap className="h-4 w-4 text-amber-400" />
                      <span>GPT-OSS 120B</span>
                    </div>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Recommended
                    </span>
                  </div>
                  <span className="text-[10.5px] text-text-secondary mt-1">
                    Frontier 120B reasoning model on Groq LPUs. Synthesizes institutional StrategyDSLs with alpha reasoning in ~300ms.
                  </span>
                </button>

                {/* Groq Qwen 27B Instant */}
                <button
                  type="button"
                  onClick={() => setAiModel('groq-qwen-27b')}
                  className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                    aiModel === 'groq-qwen-27b'
                      ? 'border-amber-500 bg-amber-500/10 shadow-sm ring-1 ring-amber-500/40'
                      : 'border-bg-border bg-bg-base hover:border-bg-border/80'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-text-primary">
                      <Cpu className="h-4 w-4 text-orange-400" />
                      <span>Qwen 27B Instant</span>
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">
                      &lt;100ms
                    </span>
                  </div>
                  <span className="text-[10.5px] text-text-secondary mt-1">
                    Lightning fast 27B quant model. Instantaneous parsing and conversational answers in tens of milliseconds.
                  </span>
                </button>
              </div>
            </div>

            {/* Groq API Key Input */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5 text-amber-400" />
                  <span>Groq API Key</span>
                </label>
                <div className="flex items-center gap-2">
                  {inputGroqKey && (
                    <button
                      type="button"
                      onClick={handleClearGroq}
                      className="text-[10px] text-rose-400 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowGroqKey(!showGroqKey)}
                    className="text-[11px] text-amber-400 hover:underline"
                  >
                    {showGroqKey ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="relative">
                <input
                  type={showGroqKey ? "text" : "password"}
                  value={inputGroqKey}
                  onChange={(e) => {
                    setInputGroqKey(e.target.value)
                    setGroqTestStatus('idle')
                    setGroqError(null)
                  }}
                  placeholder="gsk_..."
                  className="h-10 w-full rounded-xl border border-bg-border bg-bg-base px-3.5 pr-20 text-xs text-text-primary outline-none focus:border-amber-400 font-mono transition-all"
                />
                <button
                  type="button"
                  onClick={handleTestGroqKey}
                  disabled={isTestingGroq || !inputGroqKey.trim()}
                  className="absolute right-1.5 top-1.5 h-7 px-2.5 rounded-lg bg-bg-elevated border border-bg-border text-[11px] font-bold text-text-primary hover:border-amber-400 hover:text-amber-400 disabled:opacity-40 transition-all flex items-center gap-1"
                >
                  {isTestingGroq ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                  <span>{isTestingGroq ? "Testing" : "Test"}</span>
                </button>
              </div>

              {/* Status Feedback */}
              {groqTestStatus === 'success' && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mt-0.5">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span>Groq LPU verified and active! Latency: {groqLatency}ms</span>
                </div>
              )}

              {groqTestStatus === 'error' && (
                <div className="flex items-start gap-1.5 text-xs text-rose-400 mt-0.5">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span className="leading-tight">{groqError}</span>
                </div>
              )}

              <p className="text-[10px] text-text-tertiary">
                Saved in browser storage and securely loaded from <code className="text-amber-400 font-mono">GROQ_API_KEY</code> in <code className="text-text-primary font-mono">.env.local</code>.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: GOOGLE GEMINI ENGINE */}
        {activeTab === 'gemini' && (
          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 flex flex-col gap-1.5 text-xs">
              <div className="flex items-center justify-between font-semibold text-emerald-400">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" />
                  <span>Google AI Studio: 100% Free Tier</span>
                </div>
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] underline hover:text-emerald-300 font-bold"
                >
                  <span>Get Key</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <p className="text-text-secondary text-[11px] leading-relaxed">
                Google provides 15 RPM and 1,000,000 tokens/min with no credit card required.
              </p>
            </div>

            {/* Gemini Model Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-text-primary flex items-center justify-between">
                <span>Select Gemini Model</span>
                <span className="text-[10px] text-emerald-400 font-semibold">Gemini 2.5 Frontier</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAiModel('gemini-2.5-flash')}
                  className={`col-span-2 flex flex-col items-start p-2.5 rounded-xl border text-left transition-all ${
                    aiModel === 'gemini-2.5-flash' || aiModel === 'gemini-3.8-flash'
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-sm ring-1 ring-emerald-500/40'
                      : 'border-bg-border bg-bg-base hover:border-bg-border/80'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-text-primary">
                      <Cpu className="h-4 w-4 text-emerald-400" />
                      <span>Gemini 2.5 Flash</span>
                    </div>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      Recommended
                    </span>
                  </div>
                  <span className="text-[10.5px] text-text-secondary mt-1">
                    Google's frontier workhorse with multi-turn context and deep quantitative reasoning.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setAiModel('gemini-2.5-pro')}
                  className={`flex flex-col items-start p-2 rounded-xl border text-left transition-all ${
                    aiModel === 'gemini-2.5-pro'
                      ? 'border-accent-blue bg-accent-blue/10 shadow-sm ring-1 ring-accent-blue/40'
                      : 'border-bg-border bg-bg-base hover:border-bg-border/80'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-xs text-text-primary">Gemini 2.5 Pro</span>
                    <span className="text-[8px] font-bold px-1 py-0.2 rounded bg-blue-500/20 text-blue-300">Reasoning</span>
                  </div>
                  <span className="text-[10px] text-text-tertiary mt-0.5">Heavy institutional algorithms</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAiModel('gemini-2.0-flash')}
                  className={`flex flex-col items-start p-2 rounded-xl border text-left transition-all ${
                    aiModel === 'gemini-2.0-flash'
                      ? 'border-accent-blue bg-accent-blue/10 shadow-sm ring-1 ring-accent-blue/40'
                      : 'border-bg-border bg-bg-base hover:border-bg-border/80'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-xs text-text-primary">Gemini 2.0 Flash</span>
                    <span className="text-[8px] font-bold px-1 py-0.2 rounded bg-purple-500/20 text-purple-300">Fast</span>
                  </div>
                  <span className="text-[10px] text-text-tertiary mt-0.5">High-IQ reasoning</span>
                </button>
              </div>
            </div>

            {/* Gemini Key Input */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5 text-accent-blue" />
                  <span>Google Gemini API Key</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                  className="text-[11px] text-accent-blue hover:underline"
                >
                  {showGeminiKey ? "Hide" : "Show"}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showGeminiKey ? "text" : "password"}
                  value={inputGeminiKey}
                  onChange={(e) => {
                    setInputGeminiKey(e.target.value)
                    setGeminiTestStatus('idle')
                    setGeminiError(null)
                  }}
                  placeholder="AIzaSy..."
                  className="h-10 w-full rounded-xl border border-bg-border bg-bg-base px-3.5 pr-20 text-xs text-text-primary outline-none focus:border-accent-blue font-mono transition-all"
                />
                <button
                  type="button"
                  onClick={handleTestGeminiKey}
                  disabled={isTestingGemini || !inputGeminiKey.trim()}
                  className="absolute right-1.5 top-1.5 h-7 px-2.5 rounded-lg bg-bg-elevated border border-bg-border text-[11px] font-bold text-text-primary hover:border-accent-blue hover:text-accent-blue disabled:opacity-40 transition-all flex items-center gap-1"
                >
                  {isTestingGemini ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                  <span>{isTestingGemini ? "Testing" : "Test"}</span>
                </button>
              </div>

              {geminiTestStatus === 'success' && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mt-0.5">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span>Connected! Gemini API key verified.</span>
                </div>
              )}

              {geminiTestStatus === 'error' && (
                <div className="flex items-start gap-1.5 text-xs text-accent-red mt-0.5">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span className="leading-tight">{geminiError}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 border-t border-bg-border pt-4 mt-1">
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
            className="h-9 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold hover:brightness-110 transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5"
          >
            <Check className="h-3.5 w-3.5" />
            <span>Apply Engine Settings</span>
          </button>
        </div>
      </div>
    </div>
  )
}
