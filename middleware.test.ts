import { describe, it, expect, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { middleware } from './middleware'
import { clearTenantCache } from './lib/tenants'

describe('middleware tenant routing', () => {
  beforeEach(() => {
    clearTenantCache()
  })

  it('rewrites requests for existing and new tenants', async () => {
    process.env.VALID_TENANTS = 'demo'
    let req = new NextRequest('https://demo.example.com/test', {
      headers: { host: 'demo.example.com' },
    })
    let res = await middleware(req)
    expect(res.headers.get('x-middleware-rewrite')).toBe('https://demo.example.com/demo/test')

    process.env.VALID_TENANTS = 'demo,newtenant'
    clearTenantCache()
    req = new NextRequest('https://newtenant.example.com/test', {
      headers: { host: 'newtenant.example.com' },
    })
    res = await middleware(req)
    expect(res.headers.get('x-middleware-rewrite')).toBe('https://newtenant.example.com/newtenant/test')
  })
})
