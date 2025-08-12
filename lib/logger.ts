export const logger = {
  info: (message: string, context?: Record<string, unknown>) => {
    if (context) {
      console.info(message, context)
    } else {
      console.info(message)
    }
  },
  error: (message: string, context?: Record<string, unknown>) => {
    if (context) {
      console.error(message, context)
    } else {
      console.error(message)
    }
  }
}
