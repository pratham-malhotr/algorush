// Standardized JSON Logger for SOC2 / Audit Compliance
// In production, this output is scraped by Promtail or FluentBit and sent to Loki/Datadog.

type LogLevel = 'info' | 'warn' | 'error' | 'audit';

interface LogPayload {
  event: string;
  userId?: string;
  strategyId?: string;
  [key: string]: any;
}

export const getLogger = (context: string) => {
  const log = (level: LogLevel, payload: LogPayload) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      context,
      traceId: `tr_${Math.random().toString(36).substr(2, 9)}`,
      ...payload
    };

    const logString = JSON.stringify(logEntry);

    switch (level) {
      case 'info':
      case 'audit':
        console.log(logString);
        break;
      case 'warn':
        console.warn(logString);
        break;
      case 'error':
        console.error(logString);
        break;
    }
  };

  return {
    info: (payload: LogPayload) => log('info', payload),
    warn: (payload: LogPayload) => log('warn', payload),
    error: (payload: LogPayload) => log('error', payload),
    audit: (payload: LogPayload) => log('audit', payload), // Specific for SOC2 irreversible actions
  };
};
