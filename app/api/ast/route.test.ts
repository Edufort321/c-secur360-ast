import { describe, it, expect, vi } from 'vitest'

vi.mock('next/server', () => ({
  NextRequest: class {},
  NextResponse: { json: () => ({}) }
}))

vi.mock('next-auth/jwt', () => ({ getToken: vi.fn() }))
vi.mock('@/lib/prisma', () => ({ prisma: {} }))
vi.mock('@/lib/env', () => ({ PUBLIC_ENV: {}, SERVER_ENV: {} }))

import { sanitizeFormData } from './utils'

describe('sanitizeFormData', () => {
  it('sanitizes strings nested inside objects and arrays', () => {
    const dirty: any = {
      projectNumber: '<script>alert(1)</script>',
      hazards: [
        {
          description: '<img src=x onerror=alert(1)>',
          nested: [{ deep: '<iframe src="javascript:alert(2)"></iframe>' }]
        }
      ],
      workers: [
        { name: '<script>evil()</script>', tasks: ['<img src=x>'] }
      ]
    }

    const clean = sanitizeFormData(dirty)
    expect(clean.projectNumber).toBe('')
    expect((clean.hazards[0] as any).description).toBe('')
    expect((clean.hazards[0] as any).nested[0].deep).toBe('')
    expect((clean.workers[0] as any).name).toBe('')
    expect((clean.workers[0] as any).tasks[0]).toBe('')
  })

  it('sanitizes team discussion and isolation structures', () => {
    const dirty: any = {
      teamDiscussion: ['<script>bad()</script>'],
      isolation: {
        point: '<img src=x onerror=alert(1)>',
        circuits: [
          { name: '<script>alert(2)</script>', padlock: true, voltage: false, grounding: true }
        ]
      }
    }

    const clean = sanitizeFormData(dirty)
    expect(clean.teamDiscussion?.[0]).toBe('')
    expect(clean.isolation?.point).toBe('')
    expect(clean.isolation?.circuits?.[0].name).toBe('')
  })
})
