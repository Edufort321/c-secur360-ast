import { PrismaClient } from '@prisma/client'

/**
 * Ensure a single PrismaClient instance is shared across the application.
 * This avoids exhausting database connections in development and allows the
 * client to manage its own connection lifecycle.
 */
const prismaClientSingleton = () => new PrismaClient()

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma

export default prisma
