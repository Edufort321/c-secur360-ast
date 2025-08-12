export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const levelOrder: LogLevel[] = ['debug', 'info', 'warn', 'error'];

const currentLevel = (process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel) || 'info';
const logsEnabled =
  process.env.NODE_ENV === 'development' ||
  process.env.NEXT_PUBLIC_ENABLE_LOGS === 'true';

function shouldLog(level: LogLevel) {
  if (!logsEnabled) return false;
  return levelOrder.indexOf(level) >= levelOrder.indexOf(currentLevel);
}

export const logger = {
  debug: (...args: any[]) => {
    if (shouldLog('debug')) console.debug(...args);
  },
  info: (...args: any[]) => {
    if (shouldLog('info')) console.info(...args);
  },
  warn: (...args: any[]) => {
    if (shouldLog('warn')) console.warn(...args);
  },
  error: (...args: any[]) => {
    if (shouldLog('error')) console.error(...args);
  },
};
