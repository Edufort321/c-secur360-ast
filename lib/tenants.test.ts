import { describe, it, expect, beforeEach } from 'vitest'
import { getValidTenants, clearTenantCache } from './tenants'

describe('getValidTenants', () => {
  beforeEach(() => {
    clearTenantCache()
  })

  it('reads tenants from environment and caches them', async () => {
    process.env.VALID_TENANTS = 'demo,c-secur360'
    const first = await getValidTenants()
    expect(first).toEqual(['demo', 'c-secur360'])

    process.env.VALID_TENANTS = 'demo,c-secur360,new'
    const second = await getValidTenants()
    expect(second).toEqual(['demo', 'c-secur360'])

    clearTenantCache()
    const third = await getValidTenants()
    expect(third).toEqual(['demo', 'c-secur360', 'new'])
  })
})
