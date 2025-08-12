export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const levelOrder: LogLevel[] = ['debug', 'info', 'warn', 'error'];
const envLevel = (process.env.LOG_LEVEL as LogLevel) || (process.env.NODE_ENV === 'production' ? 'warn' : 'debug');

function shouldLog(level: LogLevel) {
  return levelOrder.indexOf(level) >= levelOrder.indexOf(envLevel);
}

function log(level: LogLevel, ...args: unknown[]) {
  if (shouldLog(level)) {
    // eslint-disable-next-line no-console
    console[level](...args);
  }
}

export const logger = {
  debug: (...args: unknown[]) => log('debug', ...args),
  info: (...args: unknown[]) => log('info', ...args),
  warn: (...args: unknown[]) => log('warn', ...args),
  error: (...args: unknown[]) => log('error', ...args),
};
