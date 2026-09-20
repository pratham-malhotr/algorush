import { create } from 'zustand'
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow'
import { BacktestResult, generateMockData, runLocalBacktest, getRealisticAssetPrice } from '@/lib/backtester/engine'
import { StrategyDSL } from '@/lib/types/strategy'
import { toast } from 'sonner'
import { isExplicitStrategyIntent } from '@/lib/parser/gemini'
import { normalizeStrategyDSL } from '@/lib/parser/strategyNormalizer'

export type StrategyStatus = "Draft" | "Live" | "Paused"

export type AiModelType = 
  | 'groq-gpt-120b' 
  | 'groq-qwen-27b' 
  | 'gemini-2.5-flash' 
  | 'gemini-2.5-pro' 
  | 'gemini-3.8-flash' 
  | 'gemini-2.0-flash' 
  | 'gemini-1.5-pro' 
  | 'gemini-1.5-flash-8b' 
  | 'gemini-1.5-flash' 
  | 'local';

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  metadata?: {
    modelUsed?: string;
    isAi?: boolean;
    reasoning?: string;
    riskAssessment?: string;
    suggestedTweaks?: string[];
    strategy?: StrategyDSL;
    latencyMs?: number;
    needsApiKey?: boolean;
    fallbackReason?: string;
    verificationAudit?: {
      verified: boolean;
      score: number;
      checksPassed: string[];
      correctionsApplied: string[];
      directionalAlignment?: 'LONG_ALIGNED' | 'SHORT_ALIGNED' | 'NEUTRAL';
      riskRewardRatio?: string;
      liquidationRisk?: 'VERY_LOW' | 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
      estimatedLiquidationDistancePct?: number;
    };
    backtestResult?: BacktestResult;
  };
};

export interface GraphValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
}

export interface BuildupReport {
  strategy: StrategyDSL;
  prompt: string;
  modelUsed: string;
  isAi: boolean;
  reasoning?: string;
  riskAssessment?: string;
  suggestedTweaks?: string[];
  verificationAudit?: {
    verified: boolean;
    score: number;
    checksPassed: string[];
    correctionsApplied: string[];
    directionalAlignment?: 'LONG_ALIGNED' | 'SHORT_ALIGNED' | 'NEUTRAL';
    riskRewardRatio?: string;
    liquidationRisk?: 'VERY_LOW' | 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
    estimatedLiquidationDistancePct?: number;
  };
  backtestResult?: BacktestResult;
  timestamp: number;
}

interface BuilderState {
  nodes: Node[]
  edges: Edge[]
  strategyDSL: StrategyDSL | null
  strategyName: string
  strategyStatus: StrategyStatus
  exchange: string
  tradingPair: string
  timeframe: string
  allocation: number
  maxPerTrade: number
  selectedNodeId: string | null
  isBacktestDrawerOpen: boolean
  isBacktesting: boolean
  backtestResult: BacktestResult | null
  chatHistory: ChatMessage[]
  isAnimatingBuild: boolean
  
  // Natural Language Strategy Studio & Buildup Hub
  isPromptStudioOpen: boolean
  setIsPromptStudioOpen: (isOpen: boolean) => void
  promptStudioTab: 'freeform' | 'builder' | 'presets'
  setPromptStudioTab: (tab: 'freeform' | 'builder' | 'presets') => void
  promptDraft: string
  setPromptDraft: (draft: string) => void
  isBuildupHubOpen: boolean
  setIsBuildupHubOpen: (isOpen: boolean) => void
  buildupPipelineStage: number // 0: idle, 1: tokenizing, 2: risk audit, 3: DAG graph, 4: code synthesis, 5: backtest, 6: done
  setBuildupPipelineStage: (stage: number) => void
  lastBuildupReport: BuildupReport | null
  setLastBuildupReport: (report: BuildupReport | null) => void
  executeFullEndToEndBuild: (textToParse: string) => Promise<boolean>

  // AI Copilot Model & API Key
  aiModel: AiModelType
  setAiModel: (model: AiModelType) => void
  groqApiKey: string
  setGroqApiKey: (key: string) => void
  geminiApiKey: string
  setGeminiApiKey: (key: string) => void
  isGeminiModalOpen: boolean
  setIsGeminiModalOpen: (isOpen: boolean) => void

  // Undo/Redo stack
  history: { nodes: Node[]; edges: Edge[] }[]
  historyIndex: number
  undo: () => void
  redo: () => void

  workspaceMode: 'canvas' | 'scratchpad' | 'code'
  setWorkspaceMode: (mode: 'canvas' | 'scratchpad' | 'code') => void
  isOptimizerModalOpen: boolean
  setIsOptimizerModalOpen: (isOpen: boolean) => void
  isDeployModalOpen: boolean
  setIsDeployModalOpen: (isOpen: boolean) => void
  isHundredStrategiesModalOpen: boolean
  setIsHundredStrategiesModalOpen: (isOpen: boolean) => void
  loadStrategyIntoCanvas: (strategy: any) => void
  autoLayoutNodes: () => void

  updateStrategy: (dsl: StrategyDSL) => void
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect
  setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void
  
  setSelectedNodeId: (id: string | null) => void
  updateNodeData: (id: string, data: any) => void
  compileGraphToDSL: () => void
  validateGraph: () => GraphValidationResult
  loadPresetTemplate: (templateId: string) => void
  clearCanvas: () => void
  addChatMessage: (msg: ChatMessage) => void
  clearChatHistory: () => void
  setIsAnimatingBuild: (isAnimating: boolean) => void

  setStrategyName: (name: string) => void
  setStrategyStatus: (status: StrategyStatus) => void
  setExchange: (exchange: string) => void
  setTradingPair: (pair: string) => void
  setTimeframe: (tf: string) => void
  setAllocation: (allocation: number) => void
  setMaxPerTrade: (max: number) => void
  
  setIsBacktestDrawerOpen: (isOpen: boolean) => void
  setBacktestResult: (result: BacktestResult | null) => void
  runBacktest: () => void
}

const initialNodes: Node[] = [
  {
    id: 'start-1',
    type: 'triggerNode',
    position: { x: 250, y: 50 },
    data: { label: 'Strategy Start' },
  },
  {
    id: 'entry-1',
    type: 'conditionNode',
    position: { x: 250, y: 170 },
    data: { 
      category: 'ENTRY CONDITIONS', 
      label: '50/200 Golden Cross', 
      dslCondition: { left: { type: 'EMA', parameters: { period: 50 } }, comparator: 'CROSSES_ABOVE', right: { type: 'EMA', parameters: { period: 200 } }, logicalOperator: 'AND' } 
    },
  },
  {
    id: 'exec-1',
    type: 'executeNode',
    position: { x: 250, y: 290 },
    data: { 
      label: 'Buy 50% Position', 
      dslAction: { type: 'BUY', orderType: 'MARKET', quantityType: 'PERCENT_OF_ACCOUNT', quantityValue: 50 } 
    },
  },
  {
    id: 'risk-1',
    type: 'riskNode',
    position: { x: 250, y: 410 },
    data: { 
      label: 'Risk & SL/TP Bracket', 
      dslRisk: { stopLossPercentage: 3, takeProfitPercentage: 6, riskPerTradePct: 1.5 } 
    },
  }
]

const initialEdges: Edge[] = [
  { id: 'e-start-entry', source: 'start-1', target: 'entry-1', animated: true },
  { id: 'e-entry-exec', source: 'entry-1', target: 'exec-1', animated: true },
  { id: 'e-exec-risk', source: 'exec-1', target: 'risk-1', animated: true },
]

export const useBuilderStore = create<BuilderState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  strategyDSL: {
    name: 'Binance Golden Cross Bot',
    description: 'Quant strategy compiled by AlgoText Engine',
    instruments: [{ symbol: 'BTC/USDT', assetClass: 'CRYPTO' }],
    timeframe: '1h',
    entryConditions: [{
      id: 'entry-1',
      left: { type: 'EMA', parameters: { period: 50 } },
      comparator: 'CROSSES_ABOVE',
      right: { type: 'EMA', parameters: { period: 200 } },
      logicalOperator: 'AND'
    }],
    exitConditions: [],
    action: { type: 'BUY', orderType: 'MARKET', quantityType: 'PERCENT_OF_ACCOUNT', quantityValue: 50 },
    riskParameters: { stopLossPercentage: 3, takeProfitPercentage: 6, riskPerTradePct: 1.5 }
  },
  strategyName: 'Binance Golden Cross Bot',
  strategyStatus: 'Draft',
  exchange: 'Binance',
  tradingPair: 'BTC/USDT',
  timeframe: '1h',
  allocation: 50,
  maxPerTrade: 10,
  selectedNodeId: null,
  isBacktestDrawerOpen: false,
  isBacktesting: false,
  backtestResult: null,
  chatHistory: [{ 
    role: 'assistant', 
    content: "👋 **Welcome to AlgoRush AI Quant Copilot.**\n\nI am your quantitative architect powered by **Groq LPUs™ (Ultra-Fast Inference)** & advanced neural reasoning. You can ask me any question about trading concepts, indicator mathematics, market conditions, or risk frameworks—or describe a trading strategy in natural language, and I will compile it into an executable visual flowchart algorithm with live backtesting in under 500ms.",
    metadata: {
      isAi: true,
      modelUsed: 'Groq GPT-OSS 120B',
      reasoning: 'Calibrated for institutional algorithmic compilation, multi-factor risk audits, and zero-latency strategy formulation.'
    }
  }],
  isAnimatingBuild: false,
  
  // AI Copilot Model & API Key
  aiModel: (typeof window !== 'undefined' ? (localStorage.getItem('algorush_ai_model') as AiModelType) : null) || 'groq-gpt-120b',
  setAiModel: (model) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('algorush_ai_model', model)
    }
    set({ aiModel: model })
  },
  groqApiKey: (typeof window !== 'undefined' ? localStorage.getItem('algorush_groq_api_key') : null) || process.env.NEXT_PUBLIC_GROQ_API_KEY || '',
  setGroqApiKey: (key) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('algorush_groq_api_key', key)
    }
    set({ groqApiKey: key })
  },
  geminiApiKey: (typeof window !== 'undefined' ? localStorage.getItem('algorush_gemini_api_key') : null) || '',
  setGeminiApiKey: (key) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('algorush_gemini_api_key', key)
    }
    set({ geminiApiKey: key })
  },
  isGeminiModalOpen: false,
  setIsGeminiModalOpen: (isOpen) => set({ isGeminiModalOpen: isOpen }),

  // Natural Language Strategy Studio & Buildup Hub State
  isPromptStudioOpen: false,
  setIsPromptStudioOpen: (isOpen) => set({ isPromptStudioOpen: isOpen }),
  promptStudioTab: 'freeform',
  setPromptStudioTab: (tab) => set({ promptStudioTab: tab }),
  promptDraft: '',
  setPromptDraft: (draft) => set({ promptDraft: draft }),
  isBuildupHubOpen: false,
  setIsBuildupHubOpen: (isOpen) => set({ isBuildupHubOpen: isOpen }),
  buildupPipelineStage: 0,
  setBuildupPipelineStage: (stage) => set({ buildupPipelineStage: stage }),
  lastBuildupReport: null,
  setLastBuildupReport: (report) => set({ lastBuildupReport: report }),

  workspaceMode: 'canvas',
  setWorkspaceMode: (mode) => set({ workspaceMode: mode }),
  isOptimizerModalOpen: false,
  setIsOptimizerModalOpen: (isOpen) => set({ isOptimizerModalOpen: isOpen }),
  isDeployModalOpen: false,
  setIsDeployModalOpen: (isOpen) => set({ isDeployModalOpen: isOpen }),
  isHundredStrategiesModalOpen: false,
  setIsHundredStrategiesModalOpen: (isOpen) => set({ isHundredStrategiesModalOpen: isOpen }),
  
  history: [{ nodes: initialNodes, edges: initialEdges }],
  historyIndex: 0,

  undo: () => {
    const { history, historyIndex } = get()
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1]
      set({ nodes: prev.nodes, edges: prev.edges, historyIndex: historyIndex - 1 })
      get().compileGraphToDSL()
      toast.info("Undo action")
    }
  },

  redo: () => {
    const { history, historyIndex } = get()
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1]
      set({ nodes: next.nodes, edges: next.edges, historyIndex: historyIndex + 1 })
      get().compileGraphToDSL()
      toast.info("Redo action")
    }
  },

  updateStrategy: (dsl: StrategyDSL) => set({ strategyDSL: dsl }),

  onNodesChange: (changes: NodeChange[]) => {
    const newNodes = applyNodeChanges(changes, get().nodes)
    set({ nodes: newNodes })
    get().compileGraphToDSL()
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    const newEdges = applyEdgeChanges(changes, get().edges)
    set({ edges: newEdges })
    get().compileGraphToDSL()
  },

  onConnect: (connection: Connection) => {
    if (connection.source === connection.target) {
      toast.error("Cannot connect a node to itself")
      return
    }
    const targetNode = get().nodes.find(n => n.id === connection.target)
    if (targetNode?.type === 'triggerNode') {
      toast.error("Cannot connect into a Start node")
      return
    }
    
    const newEdges = addEdge({ ...connection, animated: true }, get().edges)
    set((state) => ({
      edges: newEdges,
      history: [...state.history.slice(0, state.historyIndex + 1), { nodes: state.nodes, edges: newEdges }],
      historyIndex: state.historyIndex + 1,
    }))
    get().compileGraphToDSL()
  },

  setNodes: (update) => {
    set((state) => {
      const newNodes = typeof update === 'function' ? update(state.nodes) : update
      return {
        nodes: newNodes,
        history: [...state.history.slice(0, state.historyIndex + 1), { nodes: newNodes, edges: state.edges }],
        historyIndex: state.historyIndex + 1,
      }
    })
    get().compileGraphToDSL()
  },

  setEdges: (update) => {
    set((state) => {
      const newEdges = typeof update === 'function' ? update(state.edges) : update
      return {
        edges: newEdges,
        history: [...state.history.slice(0, state.historyIndex + 1), { nodes: state.nodes, edges: newEdges }],
        historyIndex: state.historyIndex + 1,
      }
    })
    get().compileGraphToDSL()
  },

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  updateNodeData: (id, newData) => {
    set((state) => ({
      nodes: state.nodes.map((node) => 
        node.id === id ? { ...node, data: { ...node.data, ...newData } } : node
      )
    }))
    get().compileGraphToDSL()
  },
  
  addChatMessage: (msg) => set(state => ({ chatHistory: [...state.chatHistory, msg] })),
  clearChatHistory: () => set({
    chatHistory: [{ 
      role: 'assistant', 
      content: "👋 **Welcome to AlgoRush AI Quant Copilot.**\n\nI am your quantitative architect powered by **Groq LPUs™ (Ultra-Fast Inference)** & advanced neural reasoning. You can ask me any question about trading concepts, indicator mathematics, market conditions, or risk frameworks—or describe a trading strategy in natural language, and I will compile it into an executable visual flowchart algorithm with live backtesting in under 500ms.",
      metadata: {
        isAi: true,
        modelUsed: 'Groq GPT-OSS 120B',
        reasoning: 'Calibrated for institutional algorithmic compilation, multi-factor risk audits, and zero-latency strategy formulation.'
      }
    }]
  }),

  validateGraph: (): GraphValidationResult => {
    const { nodes, edges } = get()
    const warnings: string[] = []
    const errors: string[] = []

    const triggerNode = nodes.find(n => n.type === 'triggerNode')
    if (!triggerNode) {
      errors.push("Missing Strategy Start trigger node.")
    }

    const conditionNodes = nodes.filter(n => n.type === 'conditionNode')
    if (conditionNodes.length === 0) {
      warnings.push("No entry/exit condition blocks connected. Strategy will use default triggers.")
    }

    const executeNodes = nodes.filter(n => n.type === 'executeNode')
    if (executeNodes.length === 0) {
      errors.push("Missing Execution node (BUY / SELL action required).")
    }

    // Check for unconnected nodes
    nodes.forEach(n => {
      if (n.type !== 'triggerNode') {
        const isConnected = edges.some(e => e.source === n.id || e.target === n.id)
        if (!isConnected) {
          warnings.push(`Node '${n.data.label || n.id}' is unconnected.`)
        }
      }
    })

    const riskNodes = nodes.filter(n => n.type === 'riskNode' || n.type === 'takeProfitLadderNode')
    if (riskNodes.length === 0) {
      warnings.push("No explicit Risk Management or Take Profit Ladder node found.")
    }

    return {
      isValid: errors.length === 0,
      warnings,
      errors,
    }
  },

  setIsAnimatingBuild: (isAnimating) => set({ isAnimatingBuild: isAnimating }),

  compileGraphToDSL: () => {
    // Skip compilation during animated node builds to prevent incomplete DSL
    if (get().isAnimatingBuild) return;
    
    const { nodes, edges, strategyName, tradingPair, timeframe, allocation } = get()
    
    const entryConditions: any[] = []
    const exitConditions: any[] = []
    const filters: any[] = []
    const logicGates: any[] = []
    const webhooks: any[] = []
    let action: any = { type: 'BUY', quantityType: 'PERCENT_OF_ACCOUNT', quantityValue: allocation }
    let riskParams: any = { stopLossPercentage: 3, takeProfitPercentage: 6, riskPerTradePct: 1 }

    // Traverse graph from trigger nodes or process all connected nodes
    const reachableNodeIds = new Set<string>()
    const queue = nodes.filter(n => n.type === 'triggerNode').map(n => n.id)
    
    while (queue.length > 0) {
      const currentId = queue.shift()!
      if (!reachableNodeIds.has(currentId)) {
        reachableNodeIds.add(currentId)
        const outgoing = edges.filter(e => e.source === currentId).map(e => e.target)
        queue.push(...outgoing)
      }
    }

    const targetNodes = reachableNodeIds.size > 0 ? nodes.filter(n => reachableNodeIds.has(n.id)) : nodes

    targetNodes.forEach(node => {
      if (node.type === 'conditionNode' && node.data.dslCondition) {
        const condition = { ...node.data.dslCondition, id: node.id }
        if (node.data.category === 'EXIT CONDITIONS') {
          exitConditions.push(condition)
        } else {
          entryConditions.push(condition)
        }
      }
      if (node.type === 'logicGateNode' && node.data.dslGate) {
        logicGates.push({ id: node.id, ...node.data.dslGate })
      }
      if (node.type === 'filterNode' && node.data.dslFilter) {
        filters.push({ id: node.id, ...node.data.dslFilter })
      }
      if (node.type === 'takeProfitLadderNode' && node.data.dslLadder) {
        riskParams.takeProfitLadder = node.data.dslLadder
        if (Array.isArray(node.data.dslLadder) && node.data.dslLadder.length > 0) {
          riskParams.takeProfitPercentage = node.data.dslLadder[0].targetPercentage || riskParams.takeProfitPercentage
        }
      }
      if (node.type === 'webhookNode' && node.data.dslWebhook) {
        webhooks.push({ id: node.id, ...node.data.dslWebhook })
      }
      if (node.type === 'executeNode' && node.data.dslAction) {
        if (node.data.dslAction.type !== 'CLOSE_POSITION') {
           action = { ...node.data.dslAction }
           if (!action.quantityValue) {
              action.quantityValue = allocation
           }
        } else {
           action = { type: 'CLOSE_POSITION' }
        }
      }
      if (node.type === 'riskNode' && node.data.dslRisk) {
        riskParams = { ...riskParams, ...node.data.dslRisk }
      }
    })

    const newDsl: StrategyDSL = {
      name: strategyName,
      description: 'Institutional quant strategy compiled by AlgoRush DAG Engine',
      instruments: [{ symbol: tradingPair, assetClass: tradingPair.includes('/') ? 'CRYPTO' : 'EQUITY' }],
      timeframe: timeframe as any,
      entryConditions: entryConditions.length > 0 ? entryConditions : (nodes.some(n => n.type === 'conditionNode') ? [] : [{
        id: 'default-entry',
        left: { type: 'EMA', parameters: { period: 50 } },
        comparator: 'CROSSES_ABOVE',
        right: { type: 'EMA', parameters: { period: 200 } },
        logicalOperator: 'AND'
      }]),
      exitConditions: exitConditions,
      action,
      riskParameters: riskParams,
      filters: filters.length > 0 ? filters : undefined,
      webhooks: webhooks.length > 0 ? webhooks : undefined,
      logicGates: logicGates.length > 0 ? logicGates : undefined,
    }

    set({ strategyDSL: newDsl })
  },

  loadPresetTemplate: (templateId: string) => {
    let presetNodes: Node[] = []
    let presetEdges: Edge[] = []
    let name = "Custom Strategy"
    let pair = "BTC/USDT"
    let tf = "15m"

    if (templateId === "triple_ema") {
      name = "Institutional 3-Tier Multi-Timeframe Confluence"
      pair = "BTC/USDT"
      tf = "15m"
      presetNodes = [
        { id: 'start', type: 'triggerNode', position: { x: 300, y: 30 }, data: { label: 'Real-Time Tick Stream' } },
        { id: 'trend-4h', type: 'conditionNode', position: { x: 0, y: 170 }, data: { category: 'ENTRY CONDITIONS', label: '4h Trend Filter (50 > 200 EMA)', dslCondition: { left: { type: 'EMA', timeframe: '4h', parameters: { period: 50 } }, comparator: 'GREATER_THAN', right: { type: 'EMA', timeframe: '4h', parameters: { period: 200 } }, logicalOperator: 'AND' } } },
        { id: 'vwap-1h', type: 'conditionNode', position: { x: 300, y: 170 }, data: { category: 'ENTRY CONDITIONS', label: '1h Price > VWAP Confluence', dslCondition: { left: { type: 'PRICE', timeframe: '1h' }, comparator: 'GREATER_THAN', right: { type: 'VWAP', timeframe: '1h' }, logicalOperator: 'AND' } } },
        { id: 'pullback-15m', type: 'conditionNode', position: { x: 600, y: 170 }, data: { category: 'ENTRY CONDITIONS', label: '15m RSI Pullback (< 38)', dslCondition: { left: { type: 'RSI', timeframe: '15m', parameters: { period: 14 } }, comparator: 'LESS_THAN', right: 38, logicalOperator: 'AND' } } },
        { id: 'gate-confluence', type: 'logicGateNode', position: { x: 300, y: 310 }, data: { label: 'Confluence AND Gate (All 3 Valid)', dslGate: { operator: 'ALL_TRUE', threshold: 3 } } },
        { id: 'filter-session', type: 'filterNode', position: { x: 300, y: 450 }, data: { label: 'London & NY Sessions Only', dslFilter: { sessions: ['LONDON', 'NEW_YORK'], daysOfWeek: [1, 2, 3, 4, 5], minVolatilityATR: 1.2 } } },
        { id: 'exec-buy', type: 'executeNode', position: { x: 300, y: 590 }, data: { label: 'Limit Long (35% Alloc, 5x Lev)', dslAction: { type: 'BUY', orderType: 'LIMIT', quantityType: 'PERCENT_OF_ACCOUNT', quantityValue: 35, leverage: 5 } } },
        { id: 'ladder-tp', type: 'takeProfitLadderNode', position: { x: 300, y: 730 }, data: { label: '3-Tier Staged Profit Taking', dslLadder: [{ targetPercentage: 2.5, allocationPercentage: 50, moveToBreakEven: true }, { targetPercentage: 5.0, allocationPercentage: 30 }, { targetPercentage: 8.5, allocationPercentage: 20, trailingStopPct: 1.8 }] } },
        { id: 'risk-guard', type: 'riskNode', position: { x: 300, y: 870 }, data: { label: 'Dynamic ATR Guard (SL 2.2% / MaxDD 5%)', dslRisk: { stopLossPercentage: 2.2, takeProfitPercentage: 8.5, trailingStopPercentage: 1.8, maxDailyDrawdownPct: 5.0, leverage: 5 } } },
        { id: 'webhook-alert', type: 'webhookNode', position: { x: 300, y: 1010 }, data: { label: 'Discord Execution Dispatcher', dslWebhook: { channel: 'DISCORD', triggerEvents: ['ORDER_FILLED', 'SL_HIT', 'TP_HIT'] } } },
      ]
      presetEdges = [
        { id: 'e1', source: 'start', target: 'trend-4h', animated: true },
        { id: 'e2', source: 'start', target: 'vwap-1h', animated: true },
        { id: 'e3', source: 'start', target: 'pullback-15m', animated: true },
        { id: 'e4', source: 'trend-4h', target: 'gate-confluence', animated: true },
        { id: 'e5', source: 'vwap-1h', target: 'gate-confluence', animated: true },
        { id: 'e6', source: 'pullback-15m', target: 'gate-confluence', animated: true },
        { id: 'e7', source: 'gate-confluence', target: 'filter-session', animated: true },
        { id: 'e8', source: 'filter-session', target: 'exec-buy', animated: true },
        { id: 'e9', source: 'exec-buy', target: 'ladder-tp', animated: true },
        { id: 'e10', source: 'ladder-tp', target: 'risk-guard', animated: true },
        { id: 'e11', source: 'risk-guard', target: 'webhook-alert', animated: true },
      ]
    } else if (templateId === "bollinger_squeeze") {
      name = "Bollinger Squeeze Mean Reversion with Staged TP"
      pair = "ETH/USDT"
      tf = "15m"
      presetNodes = [
        { id: 'start', type: 'triggerNode', position: { x: 300, y: 40 }, data: { label: '15m Candle Stream' } },
        { id: 'entry-bb', type: 'conditionNode', position: { x: 120, y: 170 }, data: { category: 'ENTRY CONDITIONS', label: 'Price Pierces Lower BB', dslCondition: { left: { type: 'PRICE', timeframe: '15m' }, comparator: 'LESS_THAN', right: { type: 'BOLLINGER_LOWER', timeframe: '15m', parameters: { period: 20, multiplier: 2.0 } }, logicalOperator: 'AND' } } },
        { id: 'entry-rsi', type: 'conditionNode', position: { x: 480, y: 170 }, data: { category: 'ENTRY CONDITIONS', label: 'RSI < 30 Confirmation', dslCondition: { left: { type: 'RSI', timeframe: '15m', parameters: { period: 14 } }, comparator: 'LESS_THAN', right: 30, logicalOperator: 'AND' } } },
        { id: 'gate-bb', type: 'logicGateNode', position: { x: 300, y: 310 }, data: { label: 'Confluence AND Gate', dslGate: { operator: 'ALL_TRUE', threshold: 2 } } },
        { id: 'exec-long', type: 'executeNode', position: { x: 300, y: 450 }, data: { label: 'Limit Buy (40% Alloc, 3x Lev)', dslAction: { type: 'BUY', orderType: 'LIMIT', quantityType: 'PERCENT_OF_ACCOUNT', quantityValue: 40, leverage: 3 } } },
        { id: 'ladder-tp', type: 'takeProfitLadderNode', position: { x: 300, y: 590 }, data: { label: 'Staged Scaling (TP1 + BE, TP2, TP3)', dslLadder: [{ targetPercentage: 2.0, allocationPercentage: 50, moveToBreakEven: true }, { targetPercentage: 4.5, allocationPercentage: 30 }, { targetPercentage: 7.0, allocationPercentage: 20, trailingStopPct: 1.5 }] } },
        { id: 'risk-guard', type: 'riskNode', position: { x: 300, y: 730 }, data: { label: 'ATR Risk Stop (SL 2.0% / Trail 1.5%)', dslRisk: { stopLossPercentage: 2.0, takeProfitPercentage: 7.0, trailingStopPercentage: 1.5, leverage: 3 } } },
        { id: 'webhook-alert', type: 'webhookNode', position: { x: 300, y: 870 }, data: { label: 'Discord Fill & Target Alert', dslWebhook: { channel: 'DISCORD', triggerEvents: ['ORDER_FILLED', 'TP_HIT'] } } },
      ]
      presetEdges = [
        { id: 'e1', source: 'start', target: 'entry-bb', animated: true },
        { id: 'e2', source: 'start', target: 'entry-rsi', animated: true },
        { id: 'e3', source: 'entry-bb', target: 'gate-bb', animated: true },
        { id: 'e4', source: 'entry-rsi', target: 'gate-bb', animated: true },
        { id: 'e5', source: 'gate-bb', target: 'exec-long', animated: true },
        { id: 'e6', source: 'exec-long', target: 'ladder-tp', animated: true },
        { id: 'e7', source: 'ladder-tp', target: 'risk-guard', animated: true },
        { id: 'e8', source: 'risk-guard', target: 'webhook-alert', animated: true },
      ]
    } else if (templateId === "basis_arbitrage") {
      name = "Delta-Neutral Spot-Futures Basis Funding Arbitrage"
      pair = "SOL/USDT"
      tf = "1h"
      presetNodes = [
        { id: 'start', type: 'triggerNode', position: { x: 300, y: 40 }, data: { label: 'Hourly Funding Check' } },
        { id: 'entry-funding', type: 'conditionNode', position: { x: 120, y: 170 }, data: { category: 'ENTRY CONDITIONS', label: 'Perp Funding Rate > 0.035%', dslCondition: { left: { type: 'FUNDING_RATE' }, comparator: 'GREATER_THAN', right: 0.00035, logicalOperator: 'AND' } } },
        { id: 'entry-spread', type: 'conditionNode', position: { x: 480, y: 170 }, data: { category: 'ENTRY CONDITIONS', label: 'Basis Spread > 0.40%', dslCondition: { left: { type: 'PRICE' }, comparator: 'GREATER_THAN', right: 0.004, logicalOperator: 'AND' } } },
        { id: 'gate-arb', type: 'logicGateNode', position: { x: 300, y: 310 }, data: { label: 'Arbitrage Confluence Gate', dslGate: { operator: 'ALL_TRUE' } } },
        { id: 'exec-arb', type: 'executeNode', position: { x: 300, y: 450 }, data: { label: 'Delta-Neutral Cash & Carry (50%)', dslAction: { type: 'BUY', orderType: 'MARKET', quantityType: 'PERCENT_OF_ACCOUNT', quantityValue: 50 } } },
        { id: 'risk-arb', type: 'riskNode', position: { x: 300, y: 590 }, data: { label: 'Delta Drift Circuit Breaker (0.01)', dslRisk: { stopLossPercentage: 1.0, takeProfitPercentage: 10.0 } } },
        { id: 'webhook-arb', type: 'webhookNode', position: { x: 300, y: 730 }, data: { label: 'Telegram Arb Dispatcher', dslWebhook: { channel: 'TELEGRAM', triggerEvents: ['ORDER_FILLED', 'SL_HIT'] } } },
      ]
      presetEdges = [
        { id: 'e1', source: 'start', target: 'entry-funding', animated: true },
        { id: 'e2', source: 'start', target: 'entry-spread', animated: true },
        { id: 'e3', source: 'entry-funding', target: 'gate-arb', animated: true },
        { id: 'e4', source: 'entry-spread', target: 'gate-arb', animated: true },
        { id: 'e5', source: 'gate-arb', target: 'exec-arb', animated: true },
        { id: 'e6', source: 'exec-arb', target: 'risk-arb', animated: true },
        { id: 'e7', source: 'risk-arb', target: 'webhook-arb', animated: true },
      ]
    } else if (templateId === "volatility_grid" || templateId === "futures_grid") {
      name = "Dynamic Volatility Grid & DCA Engine"
      pair = "SOL/USDT"
      tf = "15m"
      presetNodes = [
        { id: 'start', type: 'triggerNode', position: { x: 300, y: 40 }, data: { label: 'Tick Stream Scanner' } },
        { id: 'filter-vol', type: 'filterNode', position: { x: 300, y: 170 }, data: { label: 'Volatility Regime (ATR > 1.5%)', dslFilter: { minVolatilityATR: 1.5, daysOfWeek: [1, 2, 3, 4, 5] } } },
        { id: 'bb-break', type: 'conditionNode', position: { x: 300, y: 310 }, data: { category: 'ENTRY CONDITIONS', label: 'Lower BB Breakout Trigger', dslCondition: { left: { type: 'PRICE' }, comparator: 'LESS_THAN', right: { type: 'BOLLINGER_LOWER', parameters: { period: 20, multiplier: 2.0 } }, logicalOperator: 'AND' } } },
        { id: 'exec-grid', type: 'executeNode', position: { x: 300, y: 450 }, data: { label: 'Grid Step Limit Order (25%)', dslAction: { type: 'BUY', orderType: 'GRID_LIMIT', quantityType: 'PERCENT_OF_ACCOUNT', quantityValue: 25 } } },
        { id: 'ladder-grid', type: 'takeProfitLadderNode', position: { x: 300, y: 590 }, data: { label: 'Dynamic Grid Ladder Exits', dslLadder: [{ targetPercentage: 1.5, allocationPercentage: 35 }, { targetPercentage: 3.0, allocationPercentage: 35 }, { targetPercentage: 5.0, allocationPercentage: 30 }] } },
        { id: 'risk-grid', type: 'riskNode', position: { x: 300, y: 730 }, data: { label: 'Max Drawdown Guard (5%)', dslRisk: { stopLossPercentage: 4.0, takeProfitPercentage: 5.0, maxDailyDrawdownPct: 5.0 } } },
      ]
      presetEdges = [
        { id: 'e1', source: 'start', target: 'filter-vol', animated: true },
        { id: 'e2', source: 'filter-vol', target: 'bb-break', animated: true },
        { id: 'e3', source: 'bb-break', target: 'exec-grid', animated: true },
        { id: 'e4', source: 'exec-grid', target: 'ladder-grid', animated: true },
        { id: 'e5', source: 'ladder-grid', target: 'risk-grid', animated: true },
      ]
    } else if (templateId === "pairs_trading") {
      name = "Statistical Pairs Cointegration Alpha (BTC/ETH)"
      pair = "ETH/USDT"
      tf = "15m"
      presetNodes = [
        { id: 'start', type: 'triggerNode', position: { x: 300, y: 40 }, data: { label: '15m Spread Monitor' } },
        { id: 'zscore-cond', type: 'conditionNode', position: { x: 120, y: 170 }, data: { category: 'ENTRY CONDITIONS', label: 'Z-Score Spread < -2.10', dslCondition: { left: { type: 'PRICE' }, comparator: 'LESS_THAN', right: 0.052, logicalOperator: 'AND' } } },
        { id: 'filter-vol', type: 'filterNode', position: { x: 480, y: 170 }, data: { label: 'Volume Liquidity Gate', dslFilter: { minVolatilityATR: 1.0, daysOfWeek: [1, 2, 3, 4, 5] } } },
        { id: 'gate-pair', type: 'logicGateNode', position: { x: 300, y: 310 }, data: { label: 'Pair Entry Confluence', dslGate: { operator: 'ALL_TRUE' } } },
        { id: 'exec-pair', type: 'executeNode', position: { x: 300, y: 450 }, data: { label: 'Long Spread (Hedge Ratio 1.42)', dslAction: { type: 'BUY', orderType: 'LIMIT', quantityType: 'PERCENT_OF_ACCOUNT', quantityValue: 30 } } },
        { id: 'risk-pair', type: 'riskNode', position: { x: 300, y: 590 }, data: { label: 'Cointegration Break Guard (2.5%)', dslRisk: { stopLossPercentage: 2.5, takeProfitPercentage: 5.0 } } },
      ]
      presetEdges = [
        { id: 'e1', source: 'start', target: 'zscore-cond', animated: true },
        { id: 'e2', source: 'start', target: 'filter-vol', animated: true },
        { id: 'e3', source: 'zscore-cond', target: 'gate-pair', animated: true },
        { id: 'e4', source: 'filter-vol', target: 'gate-pair', animated: true },
        { id: 'e5', source: 'gate-pair', target: 'exec-pair', animated: true },
        { id: 'e6', source: 'exec-pair', target: 'risk-pair', animated: true },
      ]
    } else if (templateId === "order_flow") {
      name = "High-Frequency Order Flow Imbalance Scalper"
      pair = "BTC/USDT"
      tf = "1m"
      presetNodes = [
        { id: 'start', type: 'triggerNode', position: { x: 300, y: 40 }, data: { label: 'Tick Stream Scanner' } },
        { id: 'imbalance', type: 'conditionNode', position: { x: 120, y: 170 }, data: { category: 'ENTRY CONDITIONS', label: 'Orderbook Imbalance > 1.8', dslCondition: { left: { type: 'ORDERBOOK_IMBALANCE' }, comparator: 'GREATER_THAN', right: 1.8, logicalOperator: 'AND' } } },
        { id: 'vwap-fast', type: 'conditionNode', position: { x: 480, y: 170 }, data: { category: 'ENTRY CONDITIONS', label: '1m Price > VWAP', dslCondition: { left: { type: 'PRICE', timeframe: '1m' }, comparator: 'GREATER_THAN', right: { type: 'VWAP', timeframe: '1m' }, logicalOperator: 'AND' } } },
        { id: 'gate-flow', type: 'logicGateNode', position: { x: 300, y: 310 }, data: { label: 'HFT Confluence Gate', dslGate: { operator: 'ALL_TRUE' } } },
        { id: 'exec-snap', type: 'executeNode', position: { x: 300, y: 450 }, data: { label: 'Fast Taker Long (20%, 10x Lev)', dslAction: { type: 'BUY', orderType: 'MARKET', quantityType: 'PERCENT_OF_ACCOUNT', quantityValue: 20, leverage: 10 } } },
        { id: 'ladder-scalp', type: 'takeProfitLadderNode', position: { x: 300, y: 590 }, data: { label: 'Micro-Scalp TP Ladder', dslLadder: [{ targetPercentage: 1.0, allocationPercentage: 60, moveToBreakEven: true }, { targetPercentage: 2.0, allocationPercentage: 40, trailingStopPct: 0.8 }] } },
        { id: 'risk-micro', type: 'riskNode', position: { x: 300, y: 730 }, data: { label: 'Ultra-Tight SL (0.8% / 10x Lev)', dslRisk: { stopLossPercentage: 0.8, takeProfitPercentage: 2.0, leverage: 10 } } },
        { id: 'webhook-flow', type: 'webhookNode', position: { x: 300, y: 870 }, data: { label: 'Telegram HFT Alert Dispatcher', dslWebhook: { channel: 'TELEGRAM', triggerEvents: ['ORDER_FILLED', 'SL_HIT'] } } },
      ]
      presetEdges = [
        { id: 'e1', source: 'start', target: 'imbalance', animated: true },
        { id: 'e2', source: 'start', target: 'vwap-fast', animated: true },
        { id: 'e3', source: 'imbalance', target: 'gate-flow', animated: true },
        { id: 'e4', source: 'vwap-fast', target: 'gate-flow', animated: true },
        { id: 'e5', source: 'gate-flow', target: 'exec-snap', animated: true },
        { id: 'e6', source: 'exec-snap', target: 'ladder-scalp', animated: true },
        { id: 'e7', source: 'ladder-scalp', target: 'risk-micro', animated: true },
        { id: 'e8', source: 'risk-micro', target: 'webhook-flow', animated: true },
      ]
    } else if (templateId === "golden_cross") {
      name = "Binance Futures Golden Cross (50/200 EMA)"
      pair = "BTC/USDT"
      tf = "1h"
      presetNodes = [
        { id: 'start', type: 'triggerNode', position: { x: 250, y: 40 }, data: { label: 'Strategy Start' } },
        { id: 'entry-ema', type: 'conditionNode', position: { x: 250, y: 160 }, data: { category: 'ENTRY CONDITIONS', label: 'EMA Golden Cross', dslCondition: { left: { type: 'EMA', timeframe: '1h', parameters: { period: 50 } }, comparator: 'CROSSES_ABOVE', right: { type: 'EMA', timeframe: '1h', parameters: { period: 200 } }, logicalOperator: 'AND' } } },
        { id: 'exec-buy', type: 'executeNode', position: { x: 250, y: 280 }, data: { label: 'Buy Long (50% Account)', dslAction: { type: 'BUY', orderType: 'MARKET', quantityType: 'PERCENT_OF_ACCOUNT', quantityValue: 50 } } },
        { id: 'exit-rsi', type: 'conditionNode', position: { x: 250, y: 400 }, data: { category: 'EXIT CONDITIONS', label: 'Exit RSI Overbought (>75)', dslCondition: { left: { type: 'RSI', parameters: { period: 14 } }, comparator: 'GREATER_THAN', right: 75, logicalOperator: 'OR' } } },
        { id: 'risk-guard', type: 'riskNode', position: { x: 250, y: 520 }, data: { label: 'Risk Guard (3% SL / 6% TP)', dslRisk: { stopLossPercentage: 3.0, takeProfitPercentage: 6.0, trailingStopPercentage: 1.5 } } },
      ]
      presetEdges = [
        { id: 'e1', source: 'start', target: 'entry-ema', animated: true },
        { id: 'e2', source: 'entry-ema', target: 'exec-buy', animated: true },
        { id: 'e3', source: 'exec-buy', target: 'exit-rsi', animated: true },
        { id: 'e4', source: 'exit-rsi', target: 'risk-guard', animated: true },
      ]
    } else if (templateId === "rsi_oversold") {
      name = "ETH Volatility RSI Reversion Scalper"
      pair = "ETH/USDT"
      tf = "5m"
      presetNodes = [
        { id: 'start', type: 'triggerNode', position: { x: 250, y: 40 }, data: { label: 'Strategy Start' } },
        { id: 'entry-rsi', type: 'conditionNode', position: { x: 250, y: 160 }, data: { category: 'ENTRY CONDITIONS', label: 'RSI Oversold (<28)', dslCondition: { left: { type: 'RSI', timeframe: '5m', parameters: { period: 14 } }, comparator: 'LESS_THAN', right: 28, logicalOperator: 'AND' } } },
        { id: 'exec-buy', type: 'executeNode', position: { x: 250, y: 280 }, data: { label: 'Buy (Half-Kelly Sizing)', dslAction: { type: 'BUY', orderType: 'MARKET', quantityType: 'KELLY_CRITERION', quantityValue: 0.5 } } },
        { id: 'risk-tight', type: 'riskNode', position: { x: 250, y: 400 }, data: { label: 'Tight SL (1.5%) / TP (4.0%)', dslRisk: { stopLossPercentage: 1.5, takeProfitPercentage: 4.0 } } },
      ]
      presetEdges = [
        { id: 'e1', source: 'start', target: 'entry-rsi', animated: true },
        { id: 'e2', source: 'entry-rsi', target: 'exec-buy', animated: true },
        { id: 'e3', source: 'exec-buy', target: 'risk-tight', animated: true },
      ]
    }

    set({
      strategyName: name,
      tradingPair: pair,
      timeframe: tf,
      nodes: presetNodes,
      edges: presetEdges,
      history: [{ nodes: presetNodes, edges: presetEdges }],
      historyIndex: 0,
      backtestResult: null,
    })
    get().compileGraphToDSL()
    const data = generateMockData(90)
    const freshResult = runLocalBacktest(get().strategyDSL, data)
    set({ backtestResult: freshResult })
    toast.success(`Loaded institutional preset: ${name}`)
  },

  loadStrategyIntoCanvas: (strategyInput: any) => {
    const strat = normalizeStrategyDSL(strategyInput)
    const name = strat.name || 'Quant Strategy'
    const pair = strat.instruments?.[0]?.symbol || 'BTC/USDT'
    const tf = strat.timeframe || '15m'
    const alloc = strat.action?.quantityValue || 50

    const fmtLabel = (cond: any): string => {
      if (cond.label && typeof cond.label === 'string' && cond.label.length > 3) return cond.label
      if (cond.description && typeof cond.description === 'string' && cond.description.length > 3) return cond.description
      const leftName = cond.left?.parameters?.name || cond.left?.name || cond.left?.type || 'PRICE'
      const period = cond.left?.parameters?.period || cond.left?.period
      const leftLabel = period ? `${period} ${leftName}` : leftName
      const compMap: Record<string, string> = { 
        GREATER_THAN: '>', 
        LESS_THAN: '<', 
        EQUAL: '==', 
        CROSSES_ABOVE: 'Crosses Above', 
        CROSSES_BELOW: 'Crosses Below', 
        GREATER_THAN_OR_EQUAL: '>=', 
        LESS_THAN_OR_EQUAL: '<=' 
      }
      const comp = compMap[cond.comparator] || cond.comparator || '=='
      let rightLabel = ''
      if (typeof cond.right === 'object' && cond.right !== null) {
        const rp = cond.right.parameters?.period || cond.right?.period
        const rn = cond.right.parameters?.name || cond.right?.name || cond.right?.type || ''
        const val = cond.right.parameters?.value !== undefined ? cond.right.parameters.value : cond.right.value
        if (val !== undefined) rightLabel = String(val)
        else if (rp && rn) rightLabel = `${rp} ${rn}`
        else rightLabel = rn || String(cond.right)
      } else {
        rightLabel = String(cond.right ?? '')
      }
      return `${leftLabel} ${comp} ${rightLabel}`
    }

    const newNodes: Node[] = []
    const newEdges: Edge[] = []
    let yPos = 40
    let sideToggle = -1

    // 1. Trigger / Start Node
    newNodes.push({
      id: 'start-1',
      type: 'triggerNode',
      position: { x: 250, y: yPos },
      data: { label: `${pair} ${tf} Data Stream` }
    })
    yPos += 130

    // 2. Regime Filters if any
    let lastSource = 'start-1'
    if (strat.filters && Array.isArray(strat.filters) && strat.filters.length > 0) {
      strat.filters.forEach((filter: any, idx: number) => {
        const filterId = `filter-${idx + 1}`
        newNodes.push({
          id: filterId,
          type: 'filterNode',
          position: { x: 250, y: yPos },
          data: { label: filter.name || 'Regime Filter', dslFilter: filter }
        })
        newEdges.push({ id: `e-${filterId}`, source: lastSource, target: filterId, animated: true })
        lastSource = filterId
        yPos += 130
      })
    }

    // 3. Entry Conditions
    if (strat.entryConditions && Array.isArray(strat.entryConditions) && strat.entryConditions.length > 0) {
      strat.entryConditions.forEach((cond: any, idx: number) => {
        const nodeId = `entry-${idx + 1}`
        newNodes.push({
          id: nodeId,
          type: 'conditionNode',
          position: { x: 250 + (sideToggle * 120), y: yPos },
          data: { category: 'ENTRY CONDITIONS', label: fmtLabel(cond), dslCondition: cond }
        })
        sideToggle *= -1
        newEdges.push({ id: `e-${nodeId}`, source: lastSource, target: nodeId, animated: true })
        lastSource = nodeId
        yPos += 130
      })
    }

    // 4. Execution Node (BUY/SHORT X% (Yx Lev))
    const exec1Id = 'exec-1'
    const isShort = strat.action?.type === 'SELL'
    const orderType = strat.action?.orderType && strat.action.orderType !== 'MARKET' ? ` ${strat.action.orderType}` : ''
    const qtyStr = strat.action?.quantityType === 'FIXED_USD' || strat.action?.quantityType === 'USD_VALUE'
      ? `$${strat.action.quantityValue || 1000}`
      : strat.action?.quantityType === 'KELLY_CRITERION'
      ? `Kelly (${strat.action.quantityValue || 0.5})`
      : `${strat.action?.quantityValue || alloc}%`
    const levStr = strat.action?.leverage && strat.action.leverage > 1
      ? ` (${strat.action.leverage}x Lev)`
      : strat.riskParameters?.leverage && strat.riskParameters.leverage > 1
      ? ` (${strat.riskParameters.leverage}x Lev)`
      : ''
    const execLabel = `${isShort ? 'SHORT' : 'BUY'}${orderType} ${qtyStr}${levStr}`

    newNodes.push({
      id: exec1Id,
      type: 'executeNode',
      position: { x: 250, y: yPos },
      data: {
        label: execLabel,
        dslAction: {
          ...strat.action,
          leverage: strat.action?.leverage || strat.riskParameters?.leverage || 1
        }
      }
    })
    newEdges.push({ id: `e-${exec1Id}`, source: lastSource, target: exec1Id, animated: true })
    lastSource = exec1Id
    yPos += 130

    // 5. Exit Conditions if any
    if (strat.exitConditions && Array.isArray(strat.exitConditions) && strat.exitConditions.length > 0) {
      strat.exitConditions.forEach((cond: any, idx: number) => {
        const nodeId = `exit-${idx + 1}`
        newNodes.push({
          id: nodeId,
          type: 'conditionNode',
          position: { x: 250 + (sideToggle * 120), y: yPos },
          data: { category: 'EXIT CONDITIONS', label: fmtLabel(cond), dslCondition: cond }
        })
        sideToggle *= -1
        newEdges.push({ id: `e-${nodeId}`, source: lastSource, target: nodeId, animated: true })
        lastSource = nodeId
        yPos += 130
      })
    }

    // 6. Risk Parameters Node
    if (strat.riskParameters && (strat.riskParameters.stopLossPercentage || strat.riskParameters.takeProfitPercentage)) {
      const riskId = 'risk-1'
      newNodes.push({
        id: riskId,
        type: 'riskNode',
        position: { x: 250, y: yPos },
        data: {
          label: `Risk Guard (SL ${strat.riskParameters.stopLossPercentage || 2.5}% / TP ${strat.riskParameters.takeProfitPercentage || 5}%)`,
          dslRisk: strat.riskParameters
        }
      })
      newEdges.push({ id: `e-${riskId}`, source: lastSource, target: riskId, animated: true })
    }

    set({
      strategyName: name,
      tradingPair: pair,
      timeframe: tf,
      allocation: alloc,
      nodes: newNodes,
      edges: newEdges,
      strategyDSL: strat,
      history: [{ nodes: newNodes, edges: newEdges }],
      historyIndex: 0,
      backtestResult: null,
      workspaceMode: 'canvas',
    })

    const data = generateMockData(90)
    const freshResult = runLocalBacktest(strat, data)
    set({ backtestResult: freshResult })
    toast.success(`Loaded strategy '${name}' into Builder Canvas`)
  },

  autoLayoutNodes: () => {
    const { nodes } = get()
    const triggers = nodes.filter(n => n.type === 'triggerNode')
    const filters = nodes.filter(n => n.type === 'filterNode')
    const entries = nodes.filter(n => n.type === 'conditionNode' && n.data?.category !== 'EXIT CONDITIONS')
    const logicGates = nodes.filter(n => n.type === 'logicGateNode')
    const execs = nodes.filter(n => n.type === 'executeNode')
    const ladders = nodes.filter(n => n.type === 'takeProfitLadderNode')
    const exits = nodes.filter(n => n.type === 'conditionNode' && n.data?.category === 'EXIT CONDITIONS')
    const risks = nodes.filter(n => n.type === 'riskNode')
    const webhooks = nodes.filter(n => n.type === 'webhookNode')
    const others = nodes.filter(n => !['triggerNode', 'filterNode', 'conditionNode', 'logicGateNode', 'executeNode', 'takeProfitLadderNode', 'riskNode', 'webhookNode'].includes(n.type || ''))

    const layers = [triggers, filters, entries, logicGates, execs, ladders, exits, risks, webhooks, others].filter(l => l.length > 0)

    const layoutedNodes = nodes.map(node => {
      const layerIdx = layers.findIndex(layer => layer.some(n => n.id === node.id))
      const layer = layers[layerIdx] || [node]
      const nodeIdx = layer.findIndex(n => n.id === node.id)
      const totalInLayer = layer.length
      const spacingX = 300
      const startX = 320 - ((totalInLayer - 1) * spacingX) / 2
      const x = Math.round(startX + nodeIdx * spacingX)
      const y = Math.round(50 + layerIdx * 140)

      return {
        ...node,
        position: { x, y }
      }
    })

    set({ nodes: layoutedNodes })
    toast.success("✨ Nodes aligned hierarchically in DAG layout!")
  },

  clearCanvas: () => {
    const cleanNodes: Node[] = [
      { id: 'start-1', type: 'triggerNode', position: { x: 250, y: 50 }, data: { label: 'Strategy Start' } },
    ]
    set({
      nodes: cleanNodes,
      edges: [],
      history: [{ nodes: cleanNodes, edges: [] }],
      historyIndex: 0,
      selectedNodeId: null,
      backtestResult: null,
    })
    get().compileGraphToDSL()
    toast.info("Canvas cleared")
  },
  
  setStrategyName: (name) => set({ strategyName: name }),
  setStrategyStatus: (status) => set({ strategyStatus: status }),
  setExchange: (exchange) => set({ exchange }),
  setTradingPair: (pair) => set({ tradingPair: pair }),
  setTimeframe: (tf) => set({ timeframe: tf }),
  setAllocation: (allocation) => {
    set({ allocation })
    get().compileGraphToDSL()
  },
  setMaxPerTrade: (max) => set({ maxPerTrade: max }),
  
  setIsBacktestDrawerOpen: (isOpen) => set({ isBacktestDrawerOpen: isOpen }),
  setBacktestResult: (result) => set({ backtestResult: result }),
  runBacktest: () => {
    set({ isBacktesting: true })
    setTimeout(() => {
      const activeStrat = get().strategyDSL
      const symbol = activeStrat?.instruments?.[0]?.symbol || get().tradingPair || "BTC/USDT"
      const tf = activeStrat?.timeframe || get().timeframe || "15m"
      const { price, volatility } = getRealisticAssetPrice(symbol)
      const data = generateMockData(90, price, tf, volatility)
      const lev = activeStrat?.action?.leverage || activeStrat?.riskParameters?.leverage || 5
      const result = runLocalBacktest(activeStrat, data, 10000, lev, 0.05, 0.03) 
      set({ 
        isBacktesting: false, 
        isBacktestDrawerOpen: true,
        backtestResult: result
      })
      toast.success("Quant backtest engine completed!")
    }, 1500)
  },

  executeFullEndToEndBuild: async (textToParse: string) => {
    if (!textToParse.trim()) return false
    const { 
      aiModel, 
      groqApiKey,
      geminiApiKey, 
      strategyDSL, 
      chatHistory,
      addChatMessage, 
      setStrategyName, 
      setTradingPair, 
      setTimeframe, 
      setAllocation, 
      setNodes, 
      setEdges, 
      updateStrategy, 
      setBacktestResult, 
      setIsAnimatingBuild 
    } = get()

    const isStrategy = isExplicitStrategyIntent(textToParse)
    addChatMessage({ role: 'user', content: textToParse })
    if (isStrategy) {
      set({ buildupPipelineStage: 1 }) // 1: Tokenizing & Semantic Extraction
    }

    try {
      const response = await fetch("/api/parse-strategy", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": "Bearer at_admin_master_secret",
          ...(groqApiKey ? { "x-groq-api-key": groqApiKey } : {}),
          ...(geminiApiKey ? { "x-gemini-api-key": geminiApiKey } : {})
        },
        body: JSON.stringify({ 
          text: textToParse,
          model: aiModel,
          apiKey: groqApiKey || geminiApiKey,
          groqApiKey: groqApiKey,
          currentStrategy: strategyDSL,
          chatHistory: chatHistory.map(m => ({ role: m.role, content: m.content })).slice(-10)
        }),
      })

      const data = await response.json()

      if (data.status === "CONVERSATIONAL" || !data.strategy) {
        set({ buildupPipelineStage: 0 })
        addChatMessage({ 
          role: 'assistant', 
          content: data.conversationalResponse || data.clarificationMessage || (typeof data.content === 'string' ? data.content : "👋 Hello! How can I assist you with your quantitative trading strategy or market questions today?"),
          metadata: {
            isAi: data.isAi,
            modelUsed: data.modelUsed,
            reasoning: data.reasoning,
            suggestedTweaks: data.suggestedTweaks,
            latencyMs: data.latencyMs,
          }
        })
        return false
      } else if (data.status === "NEEDS_CLARIFICATION") {
        set({ buildupPipelineStage: 0 })
        addChatMessage({ 
          role: 'assistant', 
          content: data.clarificationMessage || "Could you provide more details about entry triggers or leverage?",
          metadata: {
            isAi: data.isAi,
            modelUsed: data.modelUsed,
            suggestedTweaks: data.suggestedTweaks,
            latencyMs: data.latencyMs,
          }
        })
        return false
      } else if (data.status === "SUCCESS") {
        set({ buildupPipelineStage: 2 }) // 2: Risk Audit & Quantitative Sanity
        await new Promise(r => setTimeout(r, 200))

        const strat = data.strategy
        if (strat.name) setStrategyName(strat.name)
        if (strat.instruments?.[0]?.symbol) setTradingPair(strat.instruments[0].symbol)
        if (strat.timeframe) setTimeframe(strat.timeframe)
        if (strat.action?.quantityValue) setAllocation(strat.action.quantityValue)

        const fmtLabel = (cond: any): string => {
          if (cond.label && typeof cond.label === 'string' && cond.label.length > 3) {
            return cond.label
          }
          if (cond.description && typeof cond.description === 'string' && cond.description.length > 3) {
            return cond.description
          }
          const leftName = cond.left?.parameters?.name || cond.left?.name || cond.left?.type || 'PRICE'
          const period = cond.left?.parameters?.period || cond.left?.period
          const leftLabel = period ? `${period} ${leftName}` : leftName
          const compMap: Record<string, string> = { 
            GREATER_THAN: '>', 
            LESS_THAN: '<', 
            EQUAL: '==', 
            CROSSES_ABOVE: 'Crosses Above', 
            CROSSES_BELOW: 'Crosses Below', 
            GREATER_THAN_OR_EQUAL: '>=', 
            LESS_THAN_OR_EQUAL: '<=' 
          }
          const comp = compMap[cond.comparator] || cond.comparator
          let rightLabel = ''
          if (typeof cond.right === 'object' && cond.right !== null) {
            const rp = cond.right.parameters?.period || cond.right?.period
            const rn = cond.right.parameters?.name || cond.right?.name || cond.right?.type || ''
            const val = cond.right.parameters?.value !== undefined ? cond.right.parameters.value : cond.right.value
            if (val !== undefined) {
              rightLabel = String(val)
            } else if (rp && rn) {
              rightLabel = `${rp} ${rn}`
            } else {
              rightLabel = rn || String(cond.right)
            }
          } else {
            rightLabel = String(cond.right ?? '')
          }
          return `${leftLabel} ${comp} ${rightLabel}`
        }

        const newNodes: Node[] = []
        const newEdges: Edge[] = []
        let yPos = 40
        let sideToggle = -1

        // 1. Start Node
        newNodes.push({ id: 'start-1', type: 'triggerNode', position: { x: 250, y: yPos }, data: { label: 'Strategy Start' } })
        yPos += 130

        // 2. Entry Conditions
        if (strat.entryConditions?.length) {
          strat.entryConditions.forEach((cond: any, idx: number) => {
            const nodeId = `entry-${idx + 1}`
            newNodes.push({ 
              id: nodeId, 
              type: 'conditionNode', 
              position: { x: 250 + (sideToggle * 120), y: yPos }, 
              data: { category: 'ENTRY CONDITIONS', label: fmtLabel(cond), dslCondition: cond } 
            })
            sideToggle *= -1
            newEdges.push({ id: `e-${nodeId}`, source: idx === 0 ? 'start-1' : `entry-${idx}`, target: nodeId, animated: true })
            yPos += 130
          })
        }

        // 3. Execution Node (Execution Box)
        const exec1Id = 'exec-1'
        const isShort = strat.action?.type === 'SELL'
        const orderType = strat.action?.orderType && strat.action.orderType !== 'MARKET' ? ` ${strat.action.orderType}` : ''
        const qtyStr = strat.action?.quantityType === 'FIXED_USD' || strat.action?.quantityType === 'USD_VALUE'
          ? `$${strat.action.quantityValue || 1000}`
          : strat.action?.quantityType === 'KELLY_CRITERION'
          ? `Kelly (${strat.action.quantityValue || 0.5})`
          : `${strat.action?.quantityValue || 50}%`
        const levStr = strat.action?.leverage && strat.action.leverage > 1 
          ? ` (${strat.action.leverage}x Lev)` 
          : strat.riskParameters?.leverage && strat.riskParameters.leverage > 1
          ? ` (${strat.riskParameters.leverage}x Lev)`
          : ''
        const execLabel = `${isShort ? 'SHORT' : 'BUY'}${orderType} ${qtyStr}${levStr}`

        newNodes.push({ 
          id: exec1Id, 
          type: 'executeNode', 
          position: { x: 250, y: yPos }, 
          data: { 
            label: execLabel, 
            dslAction: {
              ...strat.action,
              leverage: strat.action?.leverage || strat.riskParameters?.leverage || 1
            } 
          } 
        })
        const lastEntryNode = strat.entryConditions?.length ? `entry-${strat.entryConditions.length}` : 'start-1'
        newEdges.push({ id: `e-${exec1Id}`, source: lastEntryNode, target: exec1Id, animated: true })
        yPos += 130

        // 4. Exit Conditions
        if (strat.exitConditions?.length) {
          strat.exitConditions.forEach((cond: any, idx: number) => {
            const nodeId = `exit-${idx + 1}`
            newNodes.push({ 
              id: nodeId, 
              type: 'conditionNode', 
              position: { x: 250 + (sideToggle * 120), y: yPos }, 
              data: { category: 'EXIT CONDITIONS', label: fmtLabel(cond), dslCondition: cond } 
            })
            sideToggle *= -1
            newEdges.push({ id: `e-${nodeId}`, source: idx === 0 ? exec1Id : `exit-${idx}`, target: nodeId, animated: true })
            yPos += 130
          })
        }

        // 5. Risk Node
        let lastNode = strat.exitConditions?.length ? `exit-${strat.exitConditions.length}` : exec1Id
        if (strat.riskParameters && (strat.riskParameters.stopLossPercentage || strat.riskParameters.takeProfitPercentage)) {
          const riskId = 'risk-1'
          newNodes.push({ 
            id: riskId, 
            type: 'riskNode', 
            position: { x: 250, y: yPos }, 
            data: { 
              label: `Risk Bracket (SL ${strat.riskParameters.stopLossPercentage || 3}% / TP ${strat.riskParameters.takeProfitPercentage || 6}%)`, 
              dslRisk: strat.riskParameters 
            } 
          })
          newEdges.push({ id: `e-${riskId}`, source: lastNode, target: riskId, animated: true })
        }

        set({ buildupPipelineStage: 3 }) // 3: Graph Topology Generation
        setIsAnimatingBuild(true)
        setNodes([])
        setEdges([])

        for (let i = 0; i < newNodes.length; i++) {
          await new Promise(r => setTimeout(r, 110))
          setNodes((prev) => {
            if (prev.find(n => n.id === newNodes[i].id)) return prev
            return [...prev, newNodes[i]]
          })
          if (i > 0 && newEdges[i - 1]) {
            setEdges((prev) => {
              if (prev.find(e => e.id === newEdges[i - 1].id)) return prev
              return [...prev, newEdges[i - 1]]
            })
          }
        }
        setEdges(newEdges)
        setIsAnimatingBuild(false)
        updateStrategy(strat)
        get().compileGraphToDSL()

        set({ buildupPipelineStage: 4 }) // 4: Multi-Target Code Synthesis
        await new Promise(r => setTimeout(r, 180))

        set({ buildupPipelineStage: 5 }) // 5: 90-Day Deep Backtest Simulation
        const symbol = strat.instruments?.[0]?.symbol || "BTC/USDT"
        const tf = strat.timeframe || "15m"
        const { price, volatility } = getRealisticAssetPrice(symbol)
        const freshData = generateMockData(90, price, tf, volatility)
        const lev = strat.action?.leverage || strat.riskParameters?.leverage || 5
        const freshResult = runLocalBacktest(strat, freshData, 10000, lev, 0.05, 0.03)
        setBacktestResult(freshResult)

        set({ buildupPipelineStage: 6 }) // 6: Completed!

        const report: BuildupReport = {
          strategy: strat,
          prompt: textToParse,
          modelUsed: data.modelUsed || aiModel,
          isAi: data.isAi,
          reasoning: data.reasoning,
          riskAssessment: data.riskAssessment,
          suggestedTweaks: data.suggestedTweaks,
          verificationAudit: data.verificationAudit,
          backtestResult: freshResult,
          timestamp: Date.now()
        }

        set({
          lastBuildupReport: report,
          isBuildupHubOpen: true,
          buildupPipelineStage: 0
        })

        const isShortSide = strat.action?.type === 'SELL'
        const entryCount = strat.entryConditions?.length || 0
        const exitCount = strat.exitConditions?.length || 0
        const sl = strat.riskParameters?.stopLossPercentage
        const tp = strat.riskParameters?.takeProfitPercentage
        const trail = strat.riskParameters?.trailingStopPercentage
        const stratLev = strat.action?.leverage || strat.riskParameters?.leverage || 1

        const summaryText = `### 🎯 **${strat.name}**\n\n${strat.description || 'Institutional quantitative algorithm synthesized with risk-calibrated execution rules.'}\n\n• **Market Execution**: **${isShortSide ? '🔻 Short / Sell' : '🟢 Long / Buy'}** on **${strat.instruments?.[0]?.symbol || 'BTC/USDT'}** (${stratLev}x Leverage)\n• **Chart Timeframe**: **${strat.timeframe || '15m'}** | **Order Type**: **${strat.action?.orderType || 'MARKET'}**\n• **Risk Bounds**: Stop Loss **${sl}%** | Take Profit **${tp}%**${trail ? ` | Trailing Stop **${trail}%**` : ''}\n• **Logic Rules**: **${entryCount} Entry Trigger${entryCount > 1 ? 's' : ''}** & **${exitCount} Exit Target${exitCount > 1 ? 's' : ''}** applied to canvas.`

        addChatMessage({ 
          role: 'assistant', 
          content: summaryText,
          metadata: {
            modelUsed: data.modelUsed,
            isAi: data.isAi,
            reasoning: data.reasoning,
            riskAssessment: data.riskAssessment,
            suggestedTweaks: data.suggestedTweaks,
            strategy: strat,
            latencyMs: data.latencyMs,
            verificationAudit: data.verificationAudit,
            backtestResult: freshResult,
          }
        })

        toast.success(`⚡ Compiled Strategy: ${strat.name}`)
        return true
      }
    } catch (err: any) {
      set({ buildupPipelineStage: 0 })
      addChatMessage({
        role: 'assistant',
        content: `Encountered an issue compiling strategy: ${err?.message || "Unknown error"}. Check Gemini settings or try rephrasing.`
      })
      toast.error("Compilation error: " + (err?.message || "Unknown error"))
      return false
    }
    return false
  }
}))
