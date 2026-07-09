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
  isBacktestDrawerOpen: boolean
  isBacktesting: boolean
  backtestResult: BacktestResult | null
  
  updateStrategy: (dsl: StrategyDSL) => void
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect
  setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void
  
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
  isBacktestDrawerOpen: false,
  isBacktesting: false,
  backtestResult: null,

  updateStrategy: (dsl: StrategyDSL) => set({ strategyDSL: dsl }),

  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection: Connection) => {
    set({
      edges: addEdge({ ...connection, animated: true }, get().edges),
    });
  },
  setNodes: (update) => set((state) => ({ nodes: typeof update === 'function' ? update(state.nodes) : update })),
  setEdges: (update) => set((state) => ({ edges: typeof update === 'function' ? update(state.edges) : update })),
  
  setStrategyName: (name) => set({ strategyName: name }),
  setStrategyStatus: (status) => set({ strategyStatus: status }),
  setExchange: (exchange) => set({ exchange }),
  setTradingPair: (pair) => set({ tradingPair: pair }),
  setAllocation: (allocation) => set({ allocation }),
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
