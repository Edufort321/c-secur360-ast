import { z } from 'zod';

const skipValidation = !!process.env.SKIP_ENV_VALIDATION;

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  NEXT_PUBLIC_APP_NAME: z.string(),
  NEXT_PUBLIC_DEFAULT_TENANT: z.string(),
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional(),
});

const serverSchema = z.object({
  DATABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  NEXTAUTH_SECRET: z.string(),
  NEXTAUTH_URL: z.string().url(),
  WEATHER_API_KEY: z.string(),
  BASE_URL: z.string().url().default('http://localhost:3000'),
  // Default to development unless explicitly set to production
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

let serverEnv: ServerEnv | null = null;
const loadServerEnv = (): ServerEnv => {
  if (serverEnv) return serverEnv;
  if (skipValidation) {
    serverEnv = {
      BASE_URL: 'http://localhost:3000',
      ...process.env,
    } as unknown as ServerEnv;
    return serverEnv;
  }
  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    parsed.error.issues
      .filter((issue) => issue.message === 'Required')
      .forEach((issue) => console.error(`❌ Missing environment variable: ${issue.path.join('.')}`));
    console.error('❌ Invalid environment variables', parsed.error.flatten().fieldErrors);
    throw new Error('Missing or invalid environment variables');
  }
  serverEnv = parsed.data;
  return serverEnv;
};

export const env: ClientEnv & ServerEnv = clientEnv as ClientEnv & ServerEnv;
for (const key of Object.keys(serverSchema.shape)) {
  Object.defineProperty(env, key, {
    enumerable: true,
    get() {
      return loadServerEnv()[key as keyof ServerEnv];
    },
  });
}

export const getServerEnv = loadServerEnv;
export type Env = ClientEnv & ServerEnv;
export default env;

