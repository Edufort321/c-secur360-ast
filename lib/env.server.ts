import 'server-only';
import { z } from 'zod';

const skipValidation = Boolean(process.env.SKIP_ENV_VALIDATION);

const serverSchema = z.object({
  DATABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  NEXTAUTH_SECRET: z.string(),
  NEXTAUTH_URL: z.string().url(),
  WEATHER_API_KEY: z.string(),
  BASE_URL: z.string().url().default('http://localhost:3000'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

export type ServerEnv = z.infer<typeof serverSchema>;

const parseServerEnv = (): ServerEnv => {
  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    parsed.error.issues
      .filter((issue) => issue.message === 'Required')
      .forEach((issue) =>
        console.error(`❌ Missing environment variable: ${issue.path.join('.')}`),
      );
    console.error('❌ Invalid environment variables', parsed.error.flatten().fieldErrors);
    throw new Error('Missing or invalid environment variables');
  }
  return parsed.data;
};

export const serverEnv: ServerEnv = skipValidation
  ? ({
      DATABASE_URL: process.env.DATABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL!,
      WEATHER_API_KEY: process.env.WEATHER_API_KEY!,
      BASE_URL: process.env.BASE_URL ?? 'http://localhost:3000',
      NODE_ENV: (process.env.NODE_ENV as ServerEnv['NODE_ENV']) ?? 'development',
    } as ServerEnv)
  : parseServerEnv();
