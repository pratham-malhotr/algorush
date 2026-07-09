import { NextResponse } from 'next/server';

export async function GET() {
  // Mock Prometheus-formatted metrics output
  const metrics = `
# HELP algotext_active_strategies Number of active strategies currently running
# TYPE algotext_active_strategies gauge
algotext_active_strategies 142

# HELP algotext_orders_total Total number of orders submitted
# TYPE algotext_orders_total counter
algotext_orders_total{status="filled"} 4281
algotext_orders_total{status="rejected"} 12

# HELP algotext_risk_rejections_total Total number of orders rejected by the risk engine
# TYPE algotext_risk_rejections_total counter
algotext_risk_rejections_total{reason="correlation"} 4
algotext_risk_rejections_total{reason="drawdown_limit"} 1

# HELP algotext_http_requests_total Total HTTP requests
# TYPE algotext_http_requests_total counter
algotext_http_requests_total{method="GET",route="/api/v1/strategies",status="200"} 8492
algotext_http_requests_total{method="POST",route="/api/v1/orders",status="200"} 4293
  `.trim();

  return new NextResponse(metrics, {
    headers: {
      'Content-Type': 'text/plain; version=0.0.4'
    }
  });
}
