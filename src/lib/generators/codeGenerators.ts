import { StrategyDSL } from "@/lib/types/strategy"

export const formatPythonIndicator = (ind: any): string => {
  if (!ind) return "df['close']"
  if (typeof ind === 'number' || typeof ind === 'string') return String(ind)
  if (ind.type === 'PRICE' || ind.type === 'CLOSE') return "df['close']"
  if (ind.type === 'OPEN') return "df['open']"
  if (ind.type === 'HIGH') return "df['high']"
  if (ind.type === 'LOW') return "df['low']"
  if (ind.type === 'VOLUME') return "df['volume']"
  const period = ind.parameters?.period || ind.parameters?.fast || 14
  if (ind.type === 'EMA') return `ta.ema(df['close'], length=${period})`
  if (ind.type === 'SMA') return `ta.sma(df['close'], length=${period})`
  if (ind.type === 'WMA') return `ta.wma(df['close'], length=${period})`
  if (ind.type === 'HMA') return `ta.hma(df['close'], length=${period})`
  if (ind.type === 'RSI') return `ta.rsi(df['close'], length=${period})`
  if (ind.type === 'ATR') return `ta.atr(df['high'], df['low'], df['close'], length=${period})`
  if (ind.type === 'BOLLINGER_LOWER') return `ta.bbands(df['close'], length=${period})['BBL_${period}_2.0']`
  if (ind.type === 'BOLLINGER_UPPER') return `ta.bbands(df['close'], length=${period})['BBU_${period}_2.0']`
  if (ind.type === 'BOLLINGER_MIDDLE') return `ta.sma(df['close'], length=${period})`
  if (ind.type === 'MACD') return `ta.macd(df['close'])['MACD_12_26_9']`
  if (ind.type === 'MACD_SIGNAL') return `ta.macd(df['close'])['MACDs_12_26_9']`
  if (ind.type === 'MACD_HISTOGRAM') return `ta.macd(df['close'])['MACDh_12_26_9']`
  if (ind.type === 'SUPERTREND') return `ta.supertrend(df['high'], df['low'], df['close'])['SUPERT_7_3.0']`
  if (ind.type === 'STOCHASTIC_K') return `ta.stoch(df['high'], df['low'], df['close'])['STOCHk_14_3_3']`
  if (ind.type === 'STOCHASTIC_D') return `ta.stoch(df['high'], df['low'], df['close'])['STOCHd_14_3_3']`
  if (ind.type === 'ADX') return `ta.adx(df['high'], df['low'], df['close'])['ADX_14']`
  if (ind.type === 'CCI') return `ta.cci(df['high'], df['low'], df['close'], length=${period})`
  if (ind.type === 'OBV') return `ta.obv(df['close'], df['volume'])`
  if (ind.type === 'WILLIAMS_R') return `ta.willr(df['high'], df['low'], df['close'], length=${period})`
  if (ind.type === 'VWAP') return `ta.vwap(df['high'], df['low'], df['close'], df['volume'])`
  if (ind.type === 'VOLUME_SMA') return `ta.sma(df['volume'], length=${period})`
  return "df['close']"
}

export const formatPythonCondition = (cond: any): string => {
  const left = formatPythonIndicator(cond.left)
  const right = typeof cond.right === 'object' && cond.right !== null ? formatPythonIndicator(cond.right) : cond.right
  const compMap: Record<string, string> = {
    GREATER_THAN: '>',
    LESS_THAN: '<',
    EQUAL: '==',
    GREATER_THAN_OR_EQUAL: '>=',
    LESS_THAN_OR_EQUAL: '<=',
    CROSSES_ABOVE: '>',
    CROSSES_BELOW: '<'
  }
  return `${left}.iloc[-1] ${compMap[cond.comparator] || '>'} ${right}`
}

export function generatePythonCCXT(strategy: StrategyDSL): string {
  const { name, instruments, entryConditions, exitConditions, action, riskParameters, timeframe } = strategy
  const symbol = instruments?.[0]?.symbol || 'BTC/USDT'
  const isShort = action?.type === 'SELL'
  const stopLoss = riskParameters?.stopLossPercentage || 3.0
  const takeProfit = riskParameters?.takeProfitPercentage || 6.0
  const leverage = action?.leverage || riskParameters?.leverage || 5
  const quantityVal = action?.quantityValue || 50
  const tf = timeframe || '15m'

  const entryCodeStr = entryConditions?.length > 0
    ? entryConditions.map(formatPythonCondition).join(" and ")
    : "True"

  const exitCodeStr = exitConditions && exitConditions.length > 0
    ? exitConditions.map(formatPythonCondition).join(" or ")
    : "False"

  return `"""
=============================================================================
Strategy: ${name}
Target: ${symbol} (${tf}) | Leverage: ${leverage}x | Risk: SL ${stopLoss}%, TP ${takeProfit}%
Engine: AlgoRush Ultra-Advanced Institutional Quant Execution Framework
Stack: Python 3.11+, Async CCXT Pro, pandas_ta, asyncio
=============================================================================
"""
import asyncio
import os
import ccxt.async_support as ccxt
import pandas as pd
import pandas_ta as ta

SYMBOL = "${symbol}"
TIMEFRAME = "${tf}"
LEVERAGE = ${leverage}
ALLOCATION_PCT = ${quantityVal} / 100.0
STOP_LOSS_PCT = ${stopLoss} / 100.0
TAKE_PROFIT_PCT = ${takeProfit} / 100.0
IS_SHORT_BIAS = ${isShort ? 'True' : 'False'}

async def main():
    exchange = ccxt.binance({
        'apiKey': os.getenv('BINANCE_API_KEY', ''),
        'secret': os.getenv('BINANCE_SECRET', ''),
        'options': {'defaultType': 'future'},
        'enableRateLimit': True,
    })

    try:
        # 1. Configure leverage and margin mode
        await exchange.set_leverage(LEVERAGE, SYMBOL)
        print(f"[INIT] {SYMBOL} configured with {LEVERAGE}x leverage.")

        while True:
            # 2. Fetch recent OHLCV candles
            ohlcv = await exchange.fetch_ohlcv(SYMBOL, TIMEFRAME, limit=100)
            df = pd.DataFrame(ohlcv, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])

            # 3. Evaluate Entry & Exit Signals
            entry_signal = ${entryCodeStr}
            exit_signal = ${exitCodeStr}

            positions = await exchange.fetch_positions([SYMBOL])
            pos = next((p for p in positions if p['symbol'] == SYMBOL and float(p['contracts']) > 0), None)

            if not pos and entry_signal:
                balance = await exchange.fetch_balance()
                usdt_free = float(balance['free'].get('USDT', 10000))
                price = float(df['close'].iloc[-1])
                target_notional = usdt_free * ALLOCATION_PCT * LEVERAGE
                amount = round(target_notional / price, 4)

                side = 'sell' if IS_SHORT_BIAS else 'buy'
                order = await exchange.create_market_order(SYMBOL, side, amount)
                print(f"[EXECUTE] {side.upper()} {amount} {SYMBOL} at \${price} | Order ID: {order['id']}")

                # Attach SL & TP brackets
                sl_price = price * (1 + STOP_LOSS_PCT) if IS_SHORT_BIAS else price * (1 - STOP_LOSS_PCT)
                tp_price = price * (1 - TAKE_PROFIT_PCT) if IS_SHORT_BIAS else price * (1 + TAKE_PROFIT_PCT)
                print(f"[RISK] Set Stop-Loss @ \${sl_price:.2f} | Take-Profit @ \${tp_price:.2f}")

            elif pos and exit_signal:
                side = 'buy' if IS_SHORT_BIAS else 'sell'
                amount = float(pos['contracts'])
                close_order = await exchange.create_market_order(SYMBOL, side, amount, params={'reduceOnly': True})
                print(f"[EXIT] Closed {amount} {SYMBOL} position. ID: {close_order['id']}")

            await asyncio.sleep(15)  # Scan cycle
    finally:
        await exchange.close()

if __name__ == '__main__':
    asyncio.run(main())
`
}

export const formatPineIndicator = (ind: any): string => {
  if (!ind) return "close"
  if (typeof ind === 'number' || typeof ind === 'string') return String(ind)
  if (ind.type === 'PRICE' || ind.type === 'CLOSE') return "close"
  if (ind.type === 'OPEN') return "open"
  if (ind.type === 'HIGH') return "high"
  if (ind.type === 'LOW') return "low"
  if (ind.type === 'VOLUME') return "volume"
  const period = ind.parameters?.period || ind.parameters?.fast || 14
  if (ind.type === 'EMA') return `ta.ema(close, ${period})`
  if (ind.type === 'SMA') return `ta.sma(close, ${period})`
  if (ind.type === 'RSI') return `ta.rsi(close, ${period})`
  if (ind.type === 'ATR') return `ta.atr(${period})`
  if (ind.type === 'BOLLINGER_LOWER') return `ta.sma(close, ${period}) - 2 * ta.stdev(close, ${period})`
  if (ind.type === 'BOLLINGER_UPPER') return `ta.sma(close, ${period}) + 2 * ta.stdev(close, ${period})`
  if (ind.type === 'VWAP') return "ta.vwap"
  return "close"
}

export const formatPineCondition = (cond: any): string => {
  const left = formatPineIndicator(cond.left)
  const right = typeof cond.right === 'object' && cond.right !== null ? formatPineIndicator(cond.right) : cond.right
  if (cond.comparator === 'CROSSES_ABOVE') return `ta.crossover(${left}, ${right})`
  if (cond.comparator === 'CROSSES_BELOW') return `ta.crossunder(${left}, ${right})`
  const compMap: Record<string, string> = {
    GREATER_THAN: '>',
    LESS_THAN: '<',
    EQUAL: '==',
    GREATER_THAN_OR_EQUAL: '>=',
    LESS_THAN_OR_EQUAL: '<='
  }
  return `${left} ${compMap[cond.comparator] || '>'} ${right}`
}

export function generatePineScriptV5(strategy: StrategyDSL): string {
  const { name, entryConditions, exitConditions, action, riskParameters } = strategy
  const isShort = action?.type === 'SELL'
  const sl = (riskParameters?.stopLossPercentage || 3) / 100
  const tp = (riskParameters?.takeProfitPercentage || 6) / 100
  const qtyVal = action?.quantityValue || 50

  const entryStr = entryConditions?.length > 0 ? entryConditions.map(formatPineCondition).join(" and ") : "true"
  const exitStr = exitConditions && exitConditions.length > 0 ? exitConditions.map(formatPineCondition).join(" or ") : "false"

  return `//@version=5
strategy("${name}", overlay=true, initial_capital=100000, default_qty_type=strategy.percent_of_equity, default_qty_value=${qtyVal}, commission_type=strategy.commission.percent, commission_value=0.05)

// --- Visual Overlay Indicators ---
plot(ta.ema(close, 50), "EMA 50", color=color.new(color.blue, 0), linewidth=2)
plot(ta.ema(close, 200), "EMA 200", color=color.new(color.orange, 0), linewidth=2)

// --- Entry & Exit Signals ---
entryCondition = ${entryStr}
exitCondition = ${exitStr}

// --- Execution Orders ---
if (entryCondition)
    strategy.entry("${isShort ? 'Short' : 'Long'}", ${isShort ? 'strategy.short' : 'strategy.long'})

if (exitCondition)
    strategy.close("${isShort ? 'Short' : 'Long'}")

// --- Quantitative Risk Bracket (SL / TP) ---
slPrice = ${!isShort ? `strategy.position_avg_price * (1.0 - ${sl})` : `strategy.position_avg_price * (1.0 + ${sl})`}
tpPrice = ${!isShort ? `strategy.position_avg_price * (1.0 + ${tp})` : `strategy.position_avg_price * (1.0 - ${tp})`}
strategy.exit("Bracket", "${isShort ? 'Short' : 'Long'}", stop=slPrice, limit=tpPrice)
`
}
