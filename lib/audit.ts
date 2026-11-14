/**
 * Système d'audit pour C-Secur360
 * 
 * Permet de tracer toutes les actions importantes du système
 * pour debugging, sécurité et conformité.
 */

interface AuditDetails {
  [key: string]: any;
}

interface AuditEntry {
  actor: string;
  area: string;
  action: string;
  details: AuditDetails;
}

/**
 * Logger une action dans le système d'audit
 * 
 * @param area - Zone du système (stripe, twilio, vercel, supabase, dns)
 * @param action - Action effectuée (update_env, webhook_event, send_sms, etc.)
 * @param details - Détails de l'action (sans données sensibles)
 * @param actor - Qui effectue l'action (défaut: "system")
 */
export async function audit(
  area: string, 
  action: string, 
  details: AuditDetails, 
  actor: string = "system"
): Promise<void> {
  try {
    // Import dynamique pour éviter les problèmes de SSR
    const { createClient } = await import("@supabase/supabase-js");
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn("⚠️ Audit skipped: Supabase not configured");
      return;
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const auditEntry: AuditEntry = {
      actor,
      area,
      action,
      details: sanitizeDetails(details)
    };

    const { error } = await supabase
      .from("system_audit_logs")
      .insert([auditEntry]);

    if (error) {
      console.error("Audit log failed:", error);
    } else {
      console.log(`Audit logged: ${area}.${action} by ${actor}`);
    }
  } catch (error) {
    console.error("Audit error:", error);
  }
}

/**
 * Sanitiser les détails pour enlever les données sensibles
 */
function sanitizeDetails(details: AuditDetails): AuditDetails {
  const sanitized = { ...details };
  
  // Liste des clés sensibles à masquer
  const sensitiveKeys = [
    'password', 'token', 'secret', 'key', 'auth', 'api_key',
    'stripe_key', 'twilio_token', 'webhook_secret', 'private_key',
    'database_url', 'connection_string'
  ];

  function sanitizeObject(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    
    if (typeof obj === 'string') {
      // Masquer les clés qui ressemblent à des secrets
      if (obj.match(/^(sk_|pk_|whsec_|AC[a-f0-9]{32}|[A-Za-z0-9+/]{40,}={0,2})/) || obj.length > 50) {
        return `${obj.substring(0, 8)}...${obj.substring(obj.length - 4)}`;
      }
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (typeof obj === 'object') {
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase();
        
        if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
          result[key] = '[REDACTED]';
        } else {
          result[key] = sanitizeObject(value);
        }
      }
      return result;
    }
    
    return obj;
  }

  return sanitizeObject(sanitized);
}

/**
 * Récupérer les logs d'audit récents
 */
export async function getAuditLogs(
  area?: string, 
  limit: number = 100
): Promise<AuditEntry[]> {
  try {
    const { createClient } = await import("@supabase/supabase-js");
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return [];
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let query = supabase
      .from("system_audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (area) {
      query = query.eq("area", area);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Failed to fetch audit logs:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Audit logs fetch error:", error);
    return [];
  }
}

/**
 * Helpers pour des types d'audit fréquents
 */
export const auditHelpers = {
  /**
   * Logger un webhook Stripe
   */
  async stripeWebhook(eventType: string, details: AuditDetails) {
    await audit("stripe", "webhook_event", { eventType, ...details });
  },

  /**
   * Logger un envoi SMS
   */
  async sms(action: "send" | "receive" | "status", details: AuditDetails) {
    await audit("twilio", `sms_${action}`, details);
  },

  /**
   * Logger un appel Voice
   */
  async voice(action: "inbound" | "outbound" | "forward", details: AuditDetails) {
    await audit("twilio", `voice_${action}`, details);
  },

  /**
   * Logger une action admin
   */
  async admin(action: string, details: AuditDetails, adminEmail: string) {
    await audit("admin", action, details, `admin:${adminEmail}`);
  },

  /**
   * Logger un déploiement
   */
  async deploy(details: AuditDetails) {
    await audit("vercel", "deploy", details);
  },

  /**
   * Logger une modification de configuration
   */
  async config(action: string, details: AuditDetails) {
    await audit("system", `config_${action}`, details);
  }
};

export default audit;