import { PrismaClient } from '@prisma/client'
import { NODE_ENV } from '@/lib/env'

// Cache Prisma Client instance on `globalThis` to avoid re-instantiation
// during development hot reloads. Prisma connects lazily on first use.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
