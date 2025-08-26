// =================== CONFIGURATION SAAS ===================

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    annually: number;
  };
  features: {
    maxUsers: number;
    maxAST: number;
    maxStorage: number; // GB
    smsNotifications: number; // per month
    emailNotifications: number; // per month
    cloudIntegration: boolean;
    advancedReports: boolean;
    apiAccess: boolean;
    phoneSupport: boolean;
    customBranding: boolean;
    sso: boolean;
    audit: boolean;
    compliance: string[]; // provinces
  };
  stripeProductId?: string;
  popular?: boolean;
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  professional: {
    id: 'professional',
    name: 'C-SECUR360 Complet',
    description: 'Solution complète pour toutes les entreprises - Plan unique tout inclus',
    price: {
      monthly: 250,
      annually: 3000  // Économie de 1000$ par année (2 mois gratuits)
    },
    features: {
      maxUsers: -1, // illimité
      maxAST: -1, // illimité
      maxStorage: -1, // illimité
      smsNotifications: -1, // illimité
      emailNotifications: -1, // illimité
      cloudIntegration: true,
      advancedReports: true,
      apiAccess: true,
      phoneSupport: true,
      customBranding: true,
      sso: true,
      audit: true,
      compliance: ['QC', 'ON', 'AB', 'BC', 'SK', 'MB', 'NS', 'NB', 'PE', 'NL', 'YT', 'NT', 'NU']
    },
    stripeProductId: 'prod_csecur360_plan',
    popular: true
  },

  custom: {
    id: 'custom',
    name: 'Solution Entreprise',
    description: 'Pour les grandes organisations avec besoins spécifiques et intégrations ERP',
    price: {
      monthly: 0, // Prix sur demande
      annually: 0
    },
    features: {
      maxUsers: -1,
      maxAST: -1,
      maxStorage: -1,
      smsNotifications: -1,
      emailNotifications: -1,
      cloudIntegration: true,
      advancedReports: true,
      apiAccess: true,
      phoneSupport: true,
      customBranding: true,
      sso: true,
      audit: true,
      compliance: ['ALL']
    }
  }
};

export interface Site {
  id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  isMainSite: boolean;
  users: number;
  astCount: number;
  storageUsed: number;
  status: 'active' | 'inactive' | 'suspended';
  addedDate: Date;
  monthlyAddOn: number; // Coût supplémentaire mensuel
  annualAddOn: number;  // Coût supplémentaire annuel
}

export interface TenantConfig {
  id: string;
  subdomain: string;
  organizationName: string;
  plan: string;
  status: 'active' | 'suspended' | 'cancelled' | 'trial';
  sites: Site[]; // Multi-sites support
  mainSiteId: string;
  customDomain?: string;
  branding?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
    favicon?: string;
  };
  integrations?: {
    googleDrive?: boolean;
    sharePoint?: boolean;
    oneDrive?: boolean;
    slack?: boolean;
  };
  compliance?: {
    provinces: string[];
    standards: string[];
    auditEnabled: boolean;
  };
  billing?: {
    totalMonthlyCost: number;
    totalAnnualCost: number;
    basePlanCost: number;
    additionalSitesCost: number;
    lastCalculated: Date;
  };
}

export const SAAS_CONFIG = {
  // Pricing
  currency: 'CAD',
  
  // Trial
  trialDays: 14,
  trialPlan: 'professional',
  
  // Billing
  billingCycles: ['monthly', 'annually'] as const,
  paymentMethods: ['stripe', 'paypal'] as const,
  
  // Features par défaut
  defaultFeatures: {
    maxUsers: 3,
    maxAST: 10,
    maxStorage: 1,
    smsNotifications: 50,
    emailNotifications: 200
  },
  
  // Tarification multi-sites
  multiSitePricing: {
    professional: {
      additionalSiteMonthly: 50,   // +50$/mois par site additionnel (600$/an)
      additionalSiteAnnually: 600   // +600$/an par site additionnel
    },
    custom: {
      additionalSiteMonthly: 0,    // Prix négocié individuellement
      additionalSiteAnnually: 0
    }
  },
  
  // Limites système
  systemLimits: {
    maxSubdomainLength: 20,
    maxOrganizationNameLength: 100,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    maxUsersPerOrg: 1000,
    maxASTPerOrg: 10000
  },

  // Onboarding
  onboarding: {
    steps: [
      'organization_setup',
      'user_invitation',
      'integration_config',
      'compliance_setup',
      'first_ast_creation'
    ],
    requiredSteps: [
      'organization_setup',
      'compliance_setup'
    ]
  },

  // Support
  support: {
    chatEnabled: true,
    knowledgeBaseUrl: 'https://help.c-secur360.com',
    videoTutorialsUrl: 'https://learn.c-secur360.com',
    communityUrl: 'https://community.c-secur360.com'
  },

  // Marketing
  referralProgram: {
    enabled: true,
    referrerBonus: 50, // CAD
    refereeDiscount: 25 // %
  },

  // Legal
  legal: {
    termsUrl: 'https://c-secur360.com/terms',
    privacyUrl: 'https://c-secur360.com/privacy',
    dataProcessingUrl: 'https://c-secur360.com/data-processing',
    complianceUrl: 'https://c-secur360.com/compliance'
  }
};

// Fonction pour obtenir les limites d'un plan
export const getPlanLimits = (planId: string) => {
  const plan = SUBSCRIPTION_PLANS[planId];
  if (!plan) return SAAS_CONFIG.defaultFeatures;
  
  return {
    maxUsers: plan.features.maxUsers === -1 ? Infinity : plan.features.maxUsers,
    maxAST: plan.features.maxAST === -1 ? Infinity : plan.features.maxAST,
    maxStorage: plan.features.maxStorage === -1 ? Infinity : plan.features.maxStorage,
    smsNotifications: plan.features.smsNotifications === -1 ? Infinity : plan.features.smsNotifications,
    emailNotifications: plan.features.emailNotifications === -1 ? Infinity : plan.features.emailNotifications
  };
};

// Fonction pour vérifier si une fonctionnalité est disponible
export const hasFeature = (planId: string, feature: keyof SubscriptionPlan['features']): boolean => {
  const plan = SUBSCRIPTION_PLANS[planId];
  if (!plan) return false;
  
  return Boolean(plan.features[feature]);
};

// Fonction pour calculer le prix multi-sites
export const calculateMultiSitePrice = (
  planId: string, 
  cycle: 'monthly' | 'annually', 
  additionalSites: number = 0,
  users?: number
): {
  basePlanCost: number;
  additionalSitesCost: number;
  totalCost: number;
  breakdown: {
    basePlan: string;
    additionalSites: string;
    perSiteCost: number;
  };
} => {
  const plan = SUBSCRIPTION_PLANS[planId];
  const multiSitePricing = SAAS_CONFIG.multiSitePricing[planId as keyof typeof SAAS_CONFIG.multiSitePricing];
  
  if (!plan || plan.price.monthly === 0) {
    return {
      basePlanCost: 0,
      additionalSitesCost: 0,
      totalCost: 0,
      breakdown: {
        basePlan: 'Prix sur demande',
        additionalSites: 'Prix sur demande',
        perSiteCost: 0
      }
    };
  }
  
  let basePlanCost = cycle === 'monthly' ? plan.price.monthly : plan.price.annually;
  
  // Coût utilisateurs supplémentaires
  if (users && users > plan.features.maxUsers && plan.features.maxUsers !== -1) {
    const extraUsers = users - plan.features.maxUsers;
    const pricePerExtraUser = cycle === 'monthly' ? 5 : 50;
    basePlanCost += extraUsers * pricePerExtraUser;
  }
  
  // Coût sites additionnels
  const perSiteCost = cycle === 'monthly' 
    ? multiSitePricing.additionalSiteMonthly 
    : multiSitePricing.additionalSiteAnnually;
    
  const additionalSitesCost = additionalSites * perSiteCost;
  const totalCost = basePlanCost + additionalSitesCost;
  
  return {
    basePlanCost,
    additionalSitesCost,
    totalCost,
    breakdown: {
      basePlan: `${basePlanCost.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}`,
      additionalSites: additionalSites > 0 
        ? `${additionalSites} × ${perSiteCost.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })} = ${additionalSitesCost.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}`
        : 'Aucun',
      perSiteCost
    }
  };
};

// Fonction pour calculer le prix avec rabais annuel (backward compatibility)
export const calculatePrice = (planId: string, cycle: 'monthly' | 'annually', users?: number): number => {
  return calculateMultiSitePrice(planId, cycle, 0, users).totalCost;
};

// Configuration pour les webhooks Stripe
export const STRIPE_WEBHOOK_EVENTS = [
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
  'customer.created',
  'customer.updated'
] as const;

export type StripeWebhookEvent = typeof STRIPE_WEBHOOK_EVENTS[number];