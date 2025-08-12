import { describe, it, expect, vi } from 'vitest'

vi.mock('next/server', () => ({
  NextResponse: { json: (data: unknown, init?: unknown) => ({ data, init }) },
}))

describe('GET', () => {
  it('returns tenants after initialization', async () => {
    vi.resetModules()
    const count = vi.fn().mockResolvedValueOnce(0).mockResolvedValueOnce(3)
    const upsert = vi.fn().mockResolvedValue({ companyName: 'X' })

    vi.doMock('@/lib/prisma', () => ({
      prisma: {
        tenant: { count, upsert },
      },
    }))

    const { GET } = await import('./route')
    const res = await GET()

    expect(count).toHaveBeenCalledTimes(2)
    expect(upsert).toHaveBeenCalledTimes(3)
    expect(res.data.success).toBe(true)
  })

  it('handles errors gracefully', async () => {
    vi.resetModules()
    const count = vi.fn().mockRejectedValue(new Error('fail'))

    vi.doMock('@/lib/prisma', () => ({
      prisma: {
        tenant: { count, upsert: vi.fn() },
      },
    }))

    const { GET } = await import('./route')
    const res = await GET()

    expect(res.data.success).toBe(false)
  })
})
