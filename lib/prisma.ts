import { PrismaClient } from '@prisma/client'
import env from '@/lib/env'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Ensure a single client manages its own connection lifecycle
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

export default prisma
