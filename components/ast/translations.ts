export const translations = {
  fr: {
    title: "🛡️ C-Secur360",
    subtitle: "Analyse Sécuritaire de Travail",
    systemOperational: "Système opérationnel",
    astStep: "AST • Étape",
    astNumber: "NUMÉRO AST",
    online: "En ligne",
    offline: "Hors ligne",
    submit: "Soumettre",
    approve: "Approuver",
    status: {
      draft: "Brouillon",
      pending_verification: "En attente",
      approved: "Approuvé",
      auto_approved: "Auto-approuvé",
      rejected: "Rejeté"
    },
    progress: "Progression AST",
    completed: "complété",
    stepOf: "sur",
    previous: "Précédent",
    next: "Suivant",
    finished: "Terminé ✓",
    autoSave: "Sauvegarde auto",
    saving: "Modification...",
    saved: "Sauvegardé",
    active: "Actif",
    language: "Langue",
    french: "Français",
    english: "English",
    steps: {
      step1: {
        title: "Informations Projet",
        subtitle: "Identification & Verrouillage"
      },
      step2: {
        title: "Équipements",
        subtitle: "EPI et équipements sécurité"
      },
      step3: {
        title: "Dangers & Contrôles",
        subtitle: "Risques + Moyens contrôle"
      },
      step4: {
        title: "Permis & Autorisations",
        subtitle: "Conformité réglementaire"
      },
      step5: {
        title: "Validation Équipe",
        subtitle: "Signatures & Approbations"
      },
      step6: {
        title: "Finalisation",
        subtitle: "Consentement & Archive"
      }
    }
  },
  en: {
    title: "🛡️ C-Secur360",
    subtitle: "Job Safety Analysis",
    systemOperational: "System operational",
    astStep: "JSA • Step",
    astNumber: "JSA NUMBER",
    online: "Online",
    offline: "Offline",
    submit: "Submit",
    approve: "Approve",
    status: {
      draft: "Draft",
      pending_verification: "Pending",
      approved: "Approved",
      auto_approved: "Auto-approved",
      rejected: "Rejected"
    },
    progress: "JSA Progress",
    completed: "completed",
    stepOf: "of",
    previous: "Previous",
    next: "Next",
    finished: "Finished ✓",
    autoSave: "Auto save",
    saving: "Saving...",
    saved: "Saved",
    active: "Active",
    language: "Language",
    french: "Français",
    english: "English",
    steps: {
      step1: {
        title: "Project Information",
        subtitle: "Identification & Lockout"
      },
      step2: {
        title: "Equipment",
        subtitle: "PPE and safety equipment"
      },
      step3: {
        title: "Hazards & Controls",
        subtitle: "Risks + Control measures"
      },
      step4: {
        title: "Permits & Authorizations",
        subtitle: "Regulatory compliance"
      },
      step5: {
        title: "Team Validation",
        subtitle: "Signatures & Approvals"
      },
      step6: {
        title: "Finalization",
        subtitle: "Consent & Archive"
      }
    }
  }
} as const;

export type Translations = typeof translations;
