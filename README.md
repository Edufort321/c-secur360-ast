This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Environment Variables

All variables listed in `.env.example` must be provided in your environment. For local development, copy the file to `.env.local` and supply the appropriate values:

```
cp .env.example .env.local
```

If any required variable is missing at startup, the application logs a detailed error and stops.

### Vercel Environment Setup

When deploying on [Vercel](https://vercel.com), define the following variables in your project settings:

- `DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_DEFAULT_TENANT`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- `WEATHER_API_KEY`
- `BASE_URL`

Add each variable under **Settings → Environment Variables** and assign it to **Development**, **Preview**, and **Production**. Using the same variable names across all environments ensures the application behaves consistently, whether running locally or after deployment.

## Running Tests

To execute the unit test suite, run:

```bash
npm test
```

## AST API

Tenant specific endpoints are available under `api/[tenant]/ast` and require an
authenticated user belonging to the tenant. Main routes include:

- `GET /api/[tenant]/ast` – list AST forms for the tenant
- `POST /api/[tenant]/ast` – create a new AST form
- `GET /api/[tenant]/ast/[id]` – fetch a specific AST form
- `POST /api/[tenant]/ast/save` – upsert an AST form draft

All requests validate that the current user has access to the tenant before
returning data.


## Prisma Client

This project uses Prisma for database access. The Prisma Client instance is
cached on `globalThis` during development to prevent multiple instances from
being created on hot reloads. The client connects lazily when a query is run,
so you don't need to manually call `$connect` or handle disconnections. This
pattern is the recommended approach when using Prisma with Next.js.


## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
