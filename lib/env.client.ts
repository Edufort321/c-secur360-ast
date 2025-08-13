import { z } from 'zod';

const skipValidation = Boolean(process.env.SKIP_ENV_VALIDATION);

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  NEXT_PUBLIC_APP_NAME: z.string(),
  NEXT_PUBLIC_DEFAULT_TENANT: z.string(),
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional(),
});

export type ClientEnv = z.infer<typeof clientSchema>;

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

export const clientEnv: ClientEnv = skipValidation
  ? (clientVariables as ClientEnv)
  : parseClientEnv(clientVariables);
