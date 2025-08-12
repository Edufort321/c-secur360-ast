export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVELS: LogLevel[] = ['debug', 'info', 'warn', 'error'];

const env = process.env.NODE_ENV;
const envLevel = process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel | undefined;
const defaultLevel: LogLevel = env === 'production' ? 'warn' : 'debug';
const activeLevel: LogLevel = envLevel ?? defaultLevel;

function shouldLog(level: LogLevel) {
  return LEVELS.indexOf(level) >= LEVELS.indexOf(activeLevel);
}

export const logger = {
  debug: (...args: unknown[]) => {
    if (shouldLog('debug')) console.debug(...args);
  },
  info: (...args: unknown[]) => {
    if (shouldLog('info')) console.log(...args);
  },
  warn: (...args: unknown[]) => {
    if (shouldLog('warn')) console.warn(...args);
  },
  error: (...args: unknown[]) => {
    if (shouldLog('error')) console.error(...args);
  },
};
