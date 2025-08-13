import { describe, it, expect, vi } from 'vitest'

vi.mock('next/server', () => ({
  NextResponse: { json: (data: unknown, init?: any) => ({ data, init }) }
}))

vi.mock('next-auth/jwt', () => ({
  getToken: vi.fn()
}))

vi.mock('@/lib/prisma', () => ({
  prisma: { tenant: {}, user: {}, aSTForm: {} }
}))

vi.mock('@/lib/env', () => ({
  SERVER_ENV: { NEXTAUTH_SECRET: 'test' },
  PUBLIC_ENV: {},
  NEXT_PUBLIC_SUPABASE_URL: '',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: '',
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: '',
}))

describe('GET /api/[tenant]/ast', () => {
  it('returns 401 when unauthenticated', async () => {
    const { getToken } = await import('next-auth/jwt')
    ;(getToken as any).mockResolvedValue(null)

    const { GET } = await import('./route')
    const res = await GET({} as any, { params: { tenant: 'demo' } })

    expect(res.init.status).toBe(401)
  })
})
