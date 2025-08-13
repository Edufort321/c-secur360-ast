import { z } from 'zod';

const skipValidation = !!process.env.SKIP_ENV_VALIDATION;

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  NEXT_PUBLIC_APP_NAME: z.string(),
  NEXT_PUBLIC_DEFAULT_TENANT: z.string(),
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

const serverSchema = z.object({
  DATABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  NEXTAUTH_SECRET: z.string(),
  NEXTAUTH_URL: z.string().url(),
  WEATHER_API_KEY: z.string(),
  BASE_URL: z.string().url().default('http://localhost:3000'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

export type ClientEnv = z.infer<typeof clientSchema>;
export type ServerEnv = z.infer<typeof serverSchema>;

const parseClientEnv = (): ClientEnv => {
  const parsed = clientSchema.safeParse(process.env);
  if (!parsed.success) {
    parsed.error.issues
      .filter((issue) => issue.message === 'Required')
      .forEach((issue) => console.error(`❌ Missing environment variable: ${issue.path.join('.')}`));
    console.error('❌ Invalid environment variables', parsed.error.flatten().fieldErrors);
    throw new Error('Missing or invalid environment variables');
  }
  return parsed.data;
};

const clientEnv: ClientEnv = skipValidation
  ? (process.env as unknown as ClientEnv)
  : parseClientEnv();

const serverEnv: ServerEnv = skipValidation
  ? ({ BASE_URL: 'http://localhost:3000', ...process.env } as unknown as ServerEnv)
  : (() => {
      const parsed = serverSchema.safeParse(process.env);
      if (!parsed.success) {
        parsed.error.issues
          .filter((issue) => issue.message === 'Required')
          .forEach((issue) => console.error(`❌ Missing environment variable: ${issue.path.join('.')}`));
        console.error('❌ Invalid environment variables', parsed.error.flatten().fieldErrors);
        throw new Error('Missing or invalid environment variables');
      }
      return parsed.data;
    })();

export const PUBLIC_ENV = clientEnv;
export const SERVER_ENV = serverEnv;

export type Env = ClientEnv & ServerEnv;
export const env: Env = { ...PUBLIC_ENV, ...SERVER_ENV };
export default env;

