import { z } from 'zod';

const skipValidation = Boolean(process.env.SKIP_ENV_VALIDATION);

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
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

export type ClientEnv = z.infer<typeof clientSchema>;
export type ServerEnv = z.infer<typeof serverSchema>;

const clientVariables = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_DEFAULT_TENANT: process.env.NEXT_PUBLIC_DEFAULT_TENANT,
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
};

const parseClientEnv = (vars: typeof clientVariables): ClientEnv => {
  const parsed = clientSchema.safeParse(vars);
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

/**
 * @deprecated Use named exports like {@link NEXT_PUBLIC_SUPABASE_URL} instead.
 */
export const PUBLIC_ENV: ClientEnv = skipValidation
  ? (clientVariables as ClientEnv)
  : parseClientEnv(clientVariables);

export const {
  NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_DEFAULT_TENANT,
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
} = PUBLIC_ENV;

/**
 * @deprecated Use named exports like {@link NODE_ENV} instead.
 */
export const SERVER_ENV: ServerEnv = skipValidation
  ? ({ BASE_URL: 'http://localhost:3000', ...process.env } as unknown as ServerEnv)
  : parseServerEnv();

export const {
  DATABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  NEXTAUTH_SECRET,
  NEXTAUTH_URL,
  WEATHER_API_KEY,
  BASE_URL,
  NODE_ENV,
} = SERVER_ENV;

