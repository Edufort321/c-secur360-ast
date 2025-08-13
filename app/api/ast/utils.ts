import sanitizeHtml from 'sanitize-html'

export function sanitizeFormData<T>(data: T): T {
  const sanitizeValue = (value: unknown): unknown => {
    if (typeof value === 'string') {
      return sanitizeHtml(value)
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue)
    }
    if (value && typeof value === 'object') {
      const obj: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        obj[k] = sanitizeValue(v)
      }
      return obj
    }
    return value
  }

  const sanitized: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    sanitized[key] = sanitizeValue(value)
  }
  return sanitized as T
}
