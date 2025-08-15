import { z } from 'zod'

const skipValidation = Boolean(process.env.SKIP_ENV_VALIDATION)

const serverSchema = z.object({
  DATABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string(),
  NEXTAUTH_URL: z.string().url(),
  WEATHER_API_KEY: z.string(),
  BASE_URL: z.string().url().default('http://localhost:3000'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
})

export type ServerEnv = z.infer<typeof serverSchema>

const parseServerEnv = (): ServerEnv => {
  const parsed = serverSchema.safeParse(process.env)
  if (!parsed.success) {
    parsed.error.issues
      .filter((issue) => issue.message === 'Required')
      .forEach((issue) =>
        console.error(`❌ Missing environment variable: ${issue.path.join('.')}`)
      )
    console.error('❌ Invalid environment variables', parsed.error.flatten().fieldErrors)
    throw new Error('Missing or invalid environment variables')
  }
  return parsed.data
}

export const serverEnv: ServerEnv = skipValidation
  ? ({ BASE_URL: 'http://localhost:3000', ...process.env } as unknown as ServerEnv)
  : parseServerEnv()

export const {
  DATABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  NEXT_PUBLIC_SUPABASE_URL,
  NEXTAUTH_SECRET,
  NEXTAUTH_URL,
  WEATHER_API_KEY,
  BASE_URL,
  NODE_ENV,
} = serverEnv

