import { prisma } from './prisma'

let cachedTenants: string[] | null = null

export async function getValidTenants(): Promise<string[]> {
  if (cachedTenants) return cachedTenants

  if (process.env.VALID_TENANTS) {
    cachedTenants = process.env.VALID_TENANTS.split(',').map(t => t.trim()).filter(Boolean)
    return cachedTenants
  }

  try {
    const tenants = await prisma.tenant.findMany({
      where: { isActive: true },
      select: { subdomain: true },
    })
    cachedTenants = tenants.map(t => t.subdomain)
    return cachedTenants
  } catch (e) {
    cachedTenants = []
    return cachedTenants
  }
}

export function clearTenantCache() {
  cachedTenants = null
}
