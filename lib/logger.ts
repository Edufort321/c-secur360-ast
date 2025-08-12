type LogFn = (...args: unknown[]) => void

export const logger: { info: LogFn; warn: LogFn; error: LogFn } = {
  info: (...args) => console.log(...args),
  warn: (...args) => console.warn(...args),
  error: (...args) => console.error(...args),
}
