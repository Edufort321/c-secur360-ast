import { z } from 'zod';

// Define the schema for required environment variables
export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  NEXTAUTH_SECRET: z.string(),
  NEXTAUTH_URL: z.string().url(),
  NEXT_PUBLIC_APP_NAME: z.string(),
  NEXT_PUBLIC_DEFAULT_TENANT: z.string(),
  WEATHER_API_KEY: z.string(),
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional(),
  BASE_URL: z.string().url().default('http://localhost:3000'),
  // Default to development unless explicitly set to production
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

// Parse and validate the environment variables on startup
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ Invalid environment variables', parsed.error.flatten().fieldErrors);
  throw new Error('Missing or invalid environment variables');
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
export default env;
