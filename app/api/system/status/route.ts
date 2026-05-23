import { NextResponse } from "next/server";

const mustHave = [
  "NEXT_PUBLIC_APP_URL","NEXT_PUBLIC_SUPABASE_URL","NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY","STRIPE_SECRET_KEY","STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_MONTHLY","STRIPE_PRICE_ANNUAL","STRIPE_PRICE_ADDON_SITE_ANNUAL",
  "STRIPE_PRICE_ADDON_SITE_MONTHLY","STRIPE_ACCOUNT_COUNTRY","TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN","TWILIO_MESSAGING_SERVICE_SID","TWILIO_PHONE_NUMBER",
  "OWNER_MOBILE","PUBLIC_CONTACT_NUMBER"
];

export async function GET() {
  try {
    const env = Object.fromEntries(mustHave.map(k => [k, !!process.env[k]]));
    
    // Comptage des variables présentes/absentes
    const present = Object.values(env).filter(Boolean).length;
    const missing = mustHave.length - present;
    
    // Status global
    const status = missing === 0 ? 'healthy' : missing <= 3 ? 'warning' : 'critical';
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      status,
      summary: {
        total: mustHave.length,
        present,
        missing
      },
      env,
      appUrl: process.env.NEXT_PUBLIC_APP_URL || null,
      deployment: {
        platform: 'Vercel',
        region: process.env.VERCEL_REGION || 'unknown',
        git: {
          sha: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || 'unknown',
          branch: process.env.VERCEL_GIT_COMMIT_REF || 'unknown'
        }
      }
    });
  } catch (error) {
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      status: 'error',
      error: 'Failed to check system status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}