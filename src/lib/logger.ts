/**
 * Structured logger.
 *
 * In production, each log call emits a single JSON line to stdout so it can
 * be ingested by any log-aggregation system (CloudWatch, Datadog, Loki, etc.).
 * In development, it pretty-prints to the console for readability.
 *
 * Drop-in Sentry integration: set SENTRY_DSN and import Sentry at the top of
 * this file, then call `Sentry.captureException(meta.error)` inside `error()`.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMeta {
  userId?: string;
  requestId?: string;
  action?: string;
  resource?: string;
  durationMs?: number;
  statusCode?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

const isDev = process.env.NODE_ENV !== 'production';

function write(level: LogLevel, message: string, meta: LogMeta = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  };

  if (isDev) {
    const prefix = `[${entry.timestamp}] ${level.toUpperCase()}`;
    const extras = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    if (level === 'error') {
      console.error(`${prefix} ${message}${extras}`);
    } else if (level === 'warn') {
      console.warn(`${prefix} ${message}${extras}`);
    } else {
      console.log(`${prefix} ${message}${extras}`);
    }
  } else {
    // Single JSON line — safe for structured log ingestion
    process.stdout.write(JSON.stringify(entry) + '\n');
  }
}

export const logger = {
  debug: (message: string, meta?: LogMeta) => write('debug', message, meta),
  info: (message: string, meta?: LogMeta) => write('info', message, meta),
  warn: (message: string, meta?: LogMeta) => write('warn', message, meta),
  error: (message: string, meta?: LogMeta) => write('error', message, meta),
};
