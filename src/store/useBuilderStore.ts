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
import { BacktestResult, generateMockData, runLocalBacktest } from '@/lib/backtester/engine'
import { StrategyDSL } from '@/lib/types/strategy'

export type StrategyStatus = "Draft" | "Live" | "Paused"

export type ChatMessage = { role: 'user' | 'assistant', content: string };

interface BuilderState {
  nodes: Node[]
  edges: Edge[]
  strategyDSL: StrategyDSL | null
  strategyName: string
  strategyStatus: StrategyStatus
  exchange: string
  tradingPair: string
  allocation: number
  maxPerTrade: number
  selectedNodeId: string | null
  isBacktestDrawerOpen: boolean
  isBacktesting: boolean
  backtestResult: BacktestResult | null
  chatHistory: ChatMessage[]
  
  updateStrategy: (dsl: StrategyDSL) => void
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect
  setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void
  
  setSelectedNodeId: (id: string | null) => void
  updateNodeData: (id: string, data: any) => void
  compileGraphToDSL: () => void
  addChatMessage: (msg: ChatMessage) => void

  setStrategyName: (name: string) => void
  setStrategyStatus: (status: StrategyStatus) => void
  setExchange: (exchange: string) => void
  setTradingPair: (pair: string) => void
  setAllocation: (allocation: number) => void
  setMaxPerTrade: (max: number) => void
  
  setIsBacktestDrawerOpen: (isOpen: boolean) => void
  runBacktest: () => void
}

const initialNodes: Node[] = [
  {
    id: 'start-1',
    type: 'triggerNode',
    position: { x: 250, y: 50 },
    data: { label: 'Strategy Start' },
  },
]

export const useBuilderStore = create<BuilderState>((set, get) => ({
  nodes: initialNodes,
  edges: [],
  strategyDSL: null,
  strategyName: 'My Strategy #1',
  strategyStatus: 'Draft',
  exchange: 'Binance',
  tradingPair: 'BTC/USDT',
  allocation: 50,
  maxPerTrade: 10,
  selectedNodeId: null,
  isBacktestDrawerOpen: false,
  isBacktesting: false,
  backtestResult: null,
  chatHistory: [{ role: 'assistant', content: "Hi, I'm your AI Quant. Tell me what kind of strategy you want to build." }],

  updateStrategy: (dsl: StrategyDSL) => set({ strategyDSL: dsl }),

  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
    get().compileGraphToDSL();
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
    get().compileGraphToDSL();
  },
  onConnect: (connection: Connection) => {
    set({
      edges: addEdge({ ...connection, animated: true }, get().edges),
    });
    get().compileGraphToDSL();
  },
  setNodes: (update) => {
    set((state) => ({ nodes: typeof update === 'function' ? update(state.nodes) : update }));
    get().compileGraphToDSL();
  },
  setEdges: (update) => {
    set((state) => ({ edges: typeof update === 'function' ? update(state.edges) : update }));
    get().compileGraphToDSL();
  },

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  updateNodeData: (id, newData) => {
    set((state) => ({
      nodes: state.nodes.map((node) => 
        node.id === id ? { ...node, data: { ...node.data, ...newData } } : node
      )
    }));
    get().compileGraphToDSL();
  },
  
  addChatMessage: (msg) => set(state => ({ chatHistory: [...state.chatHistory, msg] })),

  compileGraphToDSL: () => {
    const { nodes, strategyName, tradingPair, allocation, maxPerTrade } = get();
    
    // Very basic compilation logic based on node categories and data
    const entryConditions: any[] = [];
    const exitConditions: any[] = [];
    let action: any = { type: 'BUY', quantityType: 'PERCENT_OF_ACCOUNT', quantityValue: allocation };
    let riskParams: any = {};

    nodes.forEach(node => {
      if (node.type === 'conditionNode' && node.data.dslCondition) {
        if (node.data.category === 'ENTRY CONDITIONS') {
          entryConditions.push(node.data.dslCondition);
        } else if (node.data.category === 'EXIT CONDITIONS') {
          exitConditions.push(node.data.dslCondition);
        }
      }
      if (node.type === 'executeNode' && node.data.dslAction) {
        action = { ...action, ...node.data.dslAction };
      }
      if (node.type === 'riskNode' && node.data.dslRisk) {
        riskParams = { ...riskParams, ...node.data.dslRisk };
      }
    });

    const newDsl: StrategyDSL = {
      name: strategyName,
      description: 'Manually built strategy',
      instruments: [{ symbol: tradingPair, assetClass: 'CRYPTO' }],
      entryConditions: entryConditions.length > 0 ? entryConditions : [{
        id: 'default',
        left: { type: 'PRICE' },
        comparator: 'GREATER_THAN',
        right: 0
      }], // Must have at least one valid condition for the schema
      exitConditions,
      action,
      riskParameters: riskParams
    };

    set({ strategyDSL: newDsl });
  },
  
  setStrategyName: (name) => set({ strategyName: name }),
  setStrategyStatus: (status) => set({ strategyStatus: status }),
  setExchange: (exchange) => set({ exchange }),
  setTradingPair: (pair) => set({ tradingPair: pair }),
  setAllocation: (allocation) => {
    set({ allocation });
    get().compileGraphToDSL();
  },
  setMaxPerTrade: (max) => set({ maxPerTrade: max }),
  
  setIsBacktestDrawerOpen: (isOpen) => set({ isBacktestDrawerOpen: isOpen }),
  runBacktest: () => {
    set({ isBacktesting: true })
    
    // Simulate API delay and run engine
    setTimeout(() => {
      const data = generateMockData(90)
      const result = runLocalBacktest(get().strategyDSL, data) 
      
      set({ 
        isBacktesting: false, 
        isBacktestDrawerOpen: true,
        backtestResult: result
      })
    }, 1500)
  }
}))
