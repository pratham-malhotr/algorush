import * as React from "react"
import { useBuilderStore } from "@/store/useBuilderStore"

export function NodePropertiesPanel() {
  const { nodes, selectedNodeId, updateNodeData, setSelectedNodeId } = useBuilderStore()

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  if (!selectedNode) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center text-text-tertiary">
        <p className="text-[13px]">Select a node on the canvas to configure its properties.</p>
      </div>
    );
  }

  const handleUpdate = (updates: any) => {
    updateNodeData(selectedNode.id, updates);
  }

  return (
    <div className="flex h-full w-full flex-col p-5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[16px] font-bold text-text-primary">Node Properties</h3>
        <button 
          onClick={() => setSelectedNodeId(null)}
          className="text-[12px] text-accent-blue hover:underline"
        >
          Close
        </button>
      </div>

      {selectedNode.type === 'conditionNode' && (
        <ConditionProperties data={selectedNode.data} onChange={handleUpdate} />
      )}
      {selectedNode.type === 'executeNode' && (
        <ExecuteProperties data={selectedNode.data} onChange={handleUpdate} />
      )}
      {selectedNode.type === 'riskNode' && (
        <RiskProperties data={selectedNode.data} onChange={handleUpdate} />
      )}
      {selectedNode.type === 'triggerNode' && (
        <div className="text-[13px] text-text-secondary">
          Trigger nodes run continuously on new market data.
        </div>
      )}
    </div>
  )
}

function ConditionProperties({ data, onChange }: { data: any, onChange: (data: any) => void }) {
  const dsl = data.dslCondition || { left: { type: 'PRICE' }, comparator: 'GREATER_THAN', right: 0 };
  const isRightIndicator = typeof dsl.right === 'object' && dsl.right !== null && 'type' in dsl.right;

  const updateDSL = (updater: (prev: any) => any) => {
    const updated = updater(JSON.parse(JSON.stringify(dsl)));
    onChange({ dslCondition: updated });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Left Indicator Timeframe & Shift */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] text-text-secondary font-bold">Timeframe</label>
          <select 
            value={dsl.left?.timeframe || '5m'}
            onChange={(e) => updateDSL(prev => ({ ...prev, left: { ...prev.left, timeframe: e.target.value } }))}
            className="h-8 w-full rounded border border-bg-border bg-bg-base px-2 text-[12px] text-text-primary outline-none"
          >
            <option value="1m">1 min</option>
            <option value="5m">5 min</option>
            <option value="15m">15 min</option>
            <option value="1h">1 hour</option>
            <option value="4h">4 hours</option>
            <option value="1d">1 day</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] text-text-secondary font-bold">Lookback Shift</label>
          <select 
            value={dsl.left?.offset || 0}
            onChange={(e) => updateDSL(prev => ({ ...prev, left: { ...prev.left, offset: Number(e.target.value) } }))}
            className="h-8 w-full rounded border border-bg-border bg-bg-base px-2 text-[12px] text-text-primary outline-none"
          >
            <option value={0}>Current [0]</option>
            <option value={1}>1 Bar Ago [-1]</option>
            <option value={2}>2 Bars Ago [-2]</option>
            <option value={3}>3 Bars Ago [-3]</option>
          </select>
        </div>
      </div>

      {/* Left Indicator Type */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] text-text-secondary font-bold">Left Indicator</label>
        <select 
          value={dsl.left?.type || 'PRICE'}
          onChange={(e) => updateDSL(prev => ({ ...prev, left: { ...prev.left, type: e.target.value } }))}
          className="h-9 w-full rounded border border-bg-border bg-bg-base px-2 text-[13px] text-text-primary outline-none"
        >
          <option value="PRICE">Price</option>
          <option value="SMA">SMA (Simple Moving Avg)</option>
          <option value="EMA">EMA (Exponential Moving Avg)</option>
          <option value="WMA">WMA (Weighted Moving Avg)</option>
          <option value="HMA">HMA (Hull Moving Avg)</option>
          <option value="RSI">RSI (Relative Strength Index)</option>
          <option value="MACD">MACD Line</option>
          <option value="MACD_SIGNAL">MACD Signal Line</option>
          <option value="MACD_HISTOGRAM">MACD Histogram</option>
          <option value="BOLLINGER_UPPER">Bollinger Upper Band</option>
          <option value="BOLLINGER_LOWER">Bollinger Lower Band</option>
          <option value="VWAP">VWAP</option>
          <option value="ATR">ATR (Average True Range)</option>
          <option value="SUPERTREND">Supertrend</option>
          <option value="STOCHASTIC_K">Stochastic %K</option>
          <option value="STOCHASTIC_D">Stochastic %D</option>
          <option value="ADX">ADX Trend Strength</option>
          <option value="CCI">CCI (Commodity Channel Index)</option>
          <option value="OBV">OBV (On-Balance Volume)</option>
          <option value="WILLIAMS_R">Williams %R</option>
          <option value="VOLUME">Volume</option>
          <option value="VOLUME_SMA">Volume SMA</option>
          <option value="TIME_SINCE_ENTRY">Time Since Entry (sec)</option>
        </select>
      </div>

      {['RSI', 'SMA', 'EMA', 'WMA', 'HMA', 'MACD', 'BOLLINGER_UPPER', 'BOLLINGER_LOWER', 'ATR', 'SUPERTREND', 'VOLUME_SMA', 'ADX', 'CCI', 'WILLIAMS_R'].includes(dsl.left?.type) && (
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] text-text-secondary font-bold">Left Period</label>
          <input 
            type="number" 
            value={dsl.left?.parameters?.period || 14}
            onChange={(e) => updateDSL(prev => ({
              ...prev,
              left: { ...prev.left, parameters: { ...prev.left?.parameters, period: Number(e.target.value) } }
            }))}
            className="h-9 w-full rounded border border-bg-border bg-bg-base px-2 text-[13px] text-text-primary outline-none focus:border-accent-blue"
          />
        </div>
      )}

      {/* Comparator */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] text-text-secondary font-bold">Comparator</label>
        <select 
          value={dsl.comparator}
          onChange={(e) => updateDSL(prev => ({ ...prev, comparator: e.target.value }))}
          className="h-9 w-full rounded border border-bg-border bg-bg-base px-2 text-[13px] text-text-primary outline-none"
        >
          <option value="GREATER_THAN">Greater Than {'>'}</option>
          <option value="LESS_THAN">Less Than {'<'}</option>
          <option value="EQUAL">Equal To {'=='}</option>
          <option value="CROSSES_ABOVE">Crosses Above</option>
          <option value="CROSSES_BELOW">Crosses Below</option>
        </select>
      </div>

      {/* Right Target Type Toggle */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] text-text-secondary font-bold">Right Target</label>
        <div className="flex rounded bg-bg-elevated p-1 border border-bg-border">
          <button 
            type="button"
            onClick={() => updateDSL(prev => ({ ...prev, right: 0 }))}
            className={`flex-1 text-[12px] font-semibold py-1 rounded transition-colors ${!isRightIndicator ? 'bg-accent-blue text-white' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Value / Number
          </button>
          <button 
            type="button"
            onClick={() => updateDSL(prev => ({ ...prev, right: { type: 'EMA', parameters: { period: 200 } } }))}
            className={`flex-1 text-[12px] font-semibold py-1 rounded transition-colors ${isRightIndicator ? 'bg-accent-blue text-white' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Secondary Indicator
          </button>
        </div>
      </div>

      {/* Right Target Field */}
      {!isRightIndicator ? (
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] text-text-secondary font-bold">Threshold Value</label>
          <input 
            type={typeof dsl.right === 'string' ? "text" : "number"} 
            value={dsl.right !== undefined ? dsl.right : 0}
            onChange={(e) => updateDSL(prev => ({ ...prev, right: typeof prev.right === 'string' ? e.target.value : Number(e.target.value) }))}
            className="h-9 w-full rounded border border-bg-border bg-bg-base px-2 text-[13px] text-text-primary outline-none focus:border-accent-blue"
          />
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] text-text-secondary font-bold">Right Indicator</label>
            <select 
              value={dsl.right?.type || 'EMA'}
              onChange={(e) => updateDSL(prev => ({ ...prev, right: { ...prev.right, type: e.target.value } }))}
              className="h-9 w-full rounded border border-bg-border bg-bg-base px-2 text-[13px] text-text-primary outline-none"
            >
              <option value="EMA">EMA (Exponential Moving Avg)</option>
              <option value="SMA">SMA (Simple Moving Avg)</option>
              <option value="PRICE">Price</option>
              <option value="RSI">RSI</option>
              <option value="MACD_SIGNAL">MACD Signal Line</option>
              <option value="BOLLINGER_UPPER">Bollinger Upper Band</option>
              <option value="BOLLINGER_LOWER">Bollinger Lower Band</option>
              <option value="SUPERTREND">Supertrend</option>
              <option value="VOLUME_SMA">Volume SMA</option>
            </select>
          </div>

          {['EMA', 'SMA', 'RSI', 'BOLLINGER_UPPER', 'BOLLINGER_LOWER', 'VOLUME_SMA'].includes(dsl.right?.type) && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] text-text-secondary font-bold">Right Period</label>
              <input 
                type="number" 
                value={dsl.right?.parameters?.period || 200}
                onChange={(e) => updateDSL(prev => ({
                  ...prev,
                  right: { ...prev.right, parameters: { ...prev.right?.parameters, period: Number(e.target.value) } }
                }))}
                className="h-9 w-full rounded border border-bg-border bg-bg-base px-2 text-[13px] text-text-primary outline-none focus:border-accent-blue"
              />
            </div>
          )}
        </>
      )}

      {/* Logical Operator */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] text-text-secondary font-bold">Logical Gate (Next Block)</label>
        <select 
          value={dsl.logicalOperator || 'AND'}
          onChange={(e) => updateDSL(prev => ({ ...prev, logicalOperator: e.target.value }))}
          className="h-9 w-full rounded border border-bg-border bg-bg-base px-2 text-[13px] text-text-primary outline-none"
        >
          <option value="AND">AND (Both conditions required)</option>
          <option value="OR">OR (Either condition triggers)</option>
        </select>
      </div>
    </div>
  );
}

function ExecuteProperties({ data, onChange }: { data: any, onChange: (data: any) => void }) {
  const dsl = data.dslAction || { type: 'BUY', orderType: 'MARKET', quantityType: 'PERCENT_OF_ACCOUNT', quantityValue: 50 };
  
  const updateDSL = (field: string, value: any) => {
    onChange({ dslAction: { ...dsl, [field]: value } });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] text-text-secondary font-bold">Action Type</label>
        <select 
          value={dsl.type}
          onChange={(e) => updateDSL('type', e.target.value)}
          className="h-9 w-full rounded border border-bg-border bg-bg-base px-2 text-[13px] text-text-primary outline-none"
        >
          <option value="BUY">BUY (Long)</option>
          <option value="SELL">SELL (Short)</option>
          <option value="CLOSE_POSITION">CLOSE POSITION</option>
        </select>
      </div>

      {dsl.type !== 'CLOSE_POSITION' && (
        <>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] text-text-secondary font-bold">Order Execution Type</label>
            <select 
              value={dsl.orderType || 'MARKET'}
              onChange={(e) => updateDSL('orderType', e.target.value)}
              className="h-9 w-full rounded border border-bg-border bg-bg-base px-2 text-[13px] text-text-primary outline-none"
            >
              <option value="MARKET">Market Order</option>
              <option value="LIMIT">Limit Order</option>
              <option value="STOP">Stop Order</option>
              <option value="TRAILING_STOP">Trailing Stop Order</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] text-text-secondary font-bold">Position Sizing Model</label>
            <select 
              value={dsl.quantityType || 'PERCENT_OF_ACCOUNT'}
              onChange={(e) => updateDSL('quantityType', e.target.value)}
              className="h-9 w-full rounded border border-bg-border bg-bg-base px-2 text-[13px] text-text-primary outline-none"
            >
              <option value="PERCENT_OF_ACCOUNT">Fixed Account % Allocation</option>
              <option value="VOLATILITY_RISK_PCT">Volatility Risk % per Trade</option>
              <option value="KELLY_CRITERION">Kelly Criterion Optimal Sizing</option>
              <option value="USD_VALUE">Fixed USD Amount ($)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] text-text-secondary font-bold">Size Value ({dsl.quantityType === 'USD_VALUE' ? '$' : '%'})</label>
            <input 
              type="number" 
              value={dsl.quantityValue || 50}
              onChange={(e) => updateDSL('quantityValue', Number(e.target.value))}
              className="h-9 w-full rounded border border-bg-border bg-bg-base px-2 text-[13px] text-text-primary outline-none focus:border-accent-blue"
            />
          </div>
        </>
      )}
    </div>
  );
}

function RiskProperties({ data, onChange }: { data: any, onChange: (data: any) => void }) {
  const dsl = data.dslRisk || { stopLossPercentage: 3, takeProfitPercentage: 6, riskPerTradePct: 1 };
  
  const updateDSL = (field: string, value: any) => {
    onChange({ dslRisk: { ...dsl, [field]: value } });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] text-text-secondary font-bold">Stop Loss (%)</label>
        <input 
          type="number" 
          step="0.1"
          value={dsl.stopLossPercentage || ''}
          onChange={(e) => updateDSL('stopLossPercentage', Number(e.target.value))}
          placeholder="e.g. 2.5"
          className="h-9 w-full rounded border border-bg-border bg-bg-base px-2 text-[13px] text-text-primary outline-none focus:border-accent-blue"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] text-text-secondary font-bold">Take Profit (%)</label>
        <input 
          type="number" 
          step="0.1"
          value={dsl.takeProfitPercentage || ''}
          onChange={(e) => updateDSL('takeProfitPercentage', Number(e.target.value))}
          placeholder="e.g. 6.0"
          className="h-9 w-full rounded border border-bg-border bg-bg-base px-2 text-[13px] text-text-primary outline-none focus:border-accent-blue"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] text-text-secondary font-bold">Trailing Stop Loss (%)</label>
        <input 
          type="number" 
          step="0.1"
          value={dsl.trailingStopPercentage || ''}
          onChange={(e) => updateDSL('trailingStopPercentage', Number(e.target.value))}
          placeholder="e.g. 1.5"
          className="h-9 w-full rounded border border-bg-border bg-bg-base px-2 text-[13px] text-text-primary outline-none focus:border-accent-blue"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] text-text-secondary font-bold">Risk Per Trade (% Account)</label>
        <input 
          type="number" 
          step="0.1"
          value={dsl.riskPerTradePct || ''}
          onChange={(e) => updateDSL('riskPerTradePct', Number(e.target.value))}
          placeholder="e.g. 1.0"
          className="h-9 w-full rounded border border-bg-border bg-bg-base px-2 text-[13px] text-text-primary outline-none focus:border-accent-blue"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] text-text-secondary font-bold">Max Daily Drawdown Limit (%)</label>
        <input 
          type="number" 
          step="0.5"
          value={dsl.maxDailyDrawdownPct || ''}
          onChange={(e) => updateDSL('maxDailyDrawdownPct', Number(e.target.value))}
          placeholder="e.g. 5.0"
          className="h-9 w-full rounded border border-bg-border bg-bg-base px-2 text-[13px] text-text-primary outline-none focus:border-accent-blue"
        />
      </div>
    </div>
  );
}

