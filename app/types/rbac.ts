// ===================================================================
// TYPES RBAC - Rôles, Permissions, Sécurité
// ===================================================================

// ===================================================================
// RÔLES
// ===================================================================

export interface Role {
  id: string;
  key: string;
  name: string;
  description?: string;
  is_system: boolean;
  color: string;
  created_at: string;
  updated_at: string;
}

// Rôles système prédéfinis
export type SystemRoleKey = 
  | 'owner'
  | 'client_admin'
  | 'site_manager'
  | 'planner'
  | 'safety_officer'
  | 'project_manager'
  | 'accounting'
  | 'fleet_manager'
  | 'worker'
  | 'guest';

// ===================================================================
// PERMISSIONS
// ===================================================================

export interface Permission {
  id: string;
  key: string;
  module: string;
  action: string;
  name: string;
  description?: string;
  is_dangerous: boolean;
  created_at: string;
}

export type PermissionModule = 
  | 'planning'
  | 'projects'
  | 'timesheets'
  | 'expenses'
  | 'ast'
  | 'permits'
  | 'fleet'
  | 'billing'
  | 'reports'
  | 'users'
  | 'settings';

export type PermissionAction = 
  | 'view'
  | 'create'
  | 'edit'
  | 'delete'
  | 'approve'
  | 'export'
  | 'assign'
  | 'close'
  | 'sign'
  | 'reserve'
  | 'manage'
  | 'maintenance'
  | 'send'
  | 'refund'
  | 'deactivate'
  | 'reset_mfa';

// ===================================================================
// PORTÉES (SCOPES)
// ===================================================================

export type ScopeType = 'global' | 'client' | 'site' | 'project';

export interface Scope {
  type: ScopeType;
  id?: string;
  name?: string;
}

// ===================================================================
// RÔLES UTILISATEUR
// ===================================================================

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  role?: Role; // Populated via join
  
  // Portée
  scope_type: ScopeType;
  scope_id?: string;
  scope_name?: string;
  
  // Métadonnées
  assigned_by?: string;
  assigned_at: string;
  expires_at?: string;
  is_active: boolean;
  notes?: string;
  
  created_at: string;
  updated_at: string;
}

// ===================================================================
// SURCHARGES DE PERMISSIONS
// ===================================================================

export interface UserPermissionOverride {
  id: string;
  user_id: string;
  permission_id: string;
  permission?: Permission; // Populated via join
  
  decision: 'allow' | 'deny';
  
  // Portée
  scope_type: ScopeType;
  scope_id?: string;
  scope_name?: string;
  
  // Métadonnées
  reason?: string;
  assigned_by?: string;
  expires_at?: string;
  is_active: boolean;
  
  created_at: string;
  updated_at: string;
}

// ===================================================================
// SÉCURITÉ UTILISATEUR
// ===================================================================

export interface UserSecuritySettings {
  id: string;
  user_id: string;
  
  // Restrictions d'accès
  ip_whitelist: string[];
  device_restrictions: boolean;
  max_sessions: number;
  session_timeout: number; // heures
  
  // Restrictions temporelles
  working_hours_only: boolean;
  allowed_days: string[];
  allowed_hours_start: string; // HH:mm
  allowed_hours_end: string; // HH:mm
  timezone: string;
  
  // Restrictions fonctionnelles
  can_delete_records: boolean;
  can_export_data: boolean;
  can_modify_own_timesheet: boolean;
  require_approval_for: string[];
  
  created_at: string;
  updated_at: string;
}

// ===================================================================
// INVITATIONS
// ===================================================================

export interface UserInvitation {
  id: string;
  email: string;
  phone?: string;
  token: string;
  
  // Rôle prévu
  intended_role_id: string;
  intended_role?: Role; // Populated via join
  intended_scope_type: ScopeType;
  intended_scope_id?: string;
  intended_scope_name?: string;
  
  // Status
  status: 'pending' | 'sent' | 'clicked' | 'completed' | 'expired' | 'cancelled';
  
  // Envoi
  sent_via: string[]; // ['email', 'sms']
  sent_at?: string;
  clicked_at?: string;
  completed_at?: string;
  
  // Métadonnées
  invited_by?: string;
  message?: string;
  expires_at: string;
  
  created_at: string;
  updated_at: string;
}

// ===================================================================
// AUDIT
// ===================================================================

export interface AuditAccessGrant {
  id: string;
  
  // Acteur
  actor_id?: string;
  actor_email?: string;
  actor_role?: string;
  
  // Cible
  target_user_id: string;
  target_email?: string;
  
  // Action
  action: string;
  change_type: 'role' | 'permission' | 'security' | 'activation';
  change_details: Record<string, any>;
  
  // Contexte
  reason?: string;
  ip_address?: string;
  user_agent?: string;
  request_id?: string;
  
  // Métadonnées
  severity: 'info' | 'warning' | 'critical';
  requires_review: boolean;
  reviewed_by?: string;
  reviewed_at?: string;
  
  created_at: string;
}

// ===================================================================
// FORMULAIRES & REQUESTS
// ===================================================================

export interface CreateEmployeeRequest {
  // Informations de base
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  company?: string;
  
  // Rôle et permissions
  role_id: string;
  custom_permissions?: {
    permission_id: string;
    decision: 'allow' | 'deny';
    scope_type: ScopeType;
    scope_id?: string;
  }[];
  
  // Portée
  scope_type: ScopeType;
  scope_id?: string;
  scope_ids?: string[]; // Pour multi-assignment
  
  // Sécurité
  mfa_required: boolean;
  qr_enrollment_required: boolean;
  mobile_only: boolean;
  can_export: boolean;
  
  // Restrictions
  security_settings?: Partial<UserSecuritySettings>;
  
  // Onboarding
  send_invitation: boolean;
  send_via: ('email' | 'sms')[];
  custom_message?: string;
  
  // Métadonnées
  notes?: string;
  expires_at?: string;
}

export interface UpdateUserPermissionsRequest {
  user_id: string;
  
  // Rôles
  roles: {
    role_id: string;
    scope_type: ScopeType;
    scope_id?: string;
    expires_at?: string;
    action: 'add' | 'remove' | 'update';
  }[];
  
  // Overrides
  permission_overrides: {
    permission_id: string;
    decision: 'allow' | 'deny';
    scope_type: ScopeType;
    scope_id?: string;
    expires_at?: string;
    action: 'add' | 'remove' | 'update';
  }[];
  
  // Raison du changement
  reason: string;
}

// ===================================================================
// RÉPONSES API
// ===================================================================

export interface UserPermissionSummary {
  user_id: string;
  roles: UserRole[];
  overrides: UserPermissionOverride[];
  effective_permissions: {
    permission_key: string;
    granted_via: 'role' | 'override';
    scope_type: ScopeType;
    scope_id?: string;
    expires_at?: string;
  }[];
  security_settings?: UserSecuritySettings;
}

export interface PermissionCheckResult {
  allowed: boolean;
  reason: string;
  granted_via?: 'role' | 'override';
  role_name?: string;
  expires_at?: string;
}

// ===================================================================
// COMPOSANTS UI
// ===================================================================

export interface RoleTemplate {
  role: Role;
  permissions: {
    permission: Permission;
    scope_default: string;
  }[];
  description: string;
  typical_scopes: ScopeType[];
}

export interface PermissionGroup {
  module: string;
  module_name: string;
  permissions: Permission[];
  dangerous_count: number;
}

// ===================================================================
// HELPERS & UTILITIES
// ===================================================================

export interface ScopeOption {
  type: ScopeType;
  id: string;
  name: string;
  subtitle?: string;
  disabled?: boolean;
}

export interface PermissionMatrix {
  [module: string]: {
    [action: string]: {
      own?: boolean;
      team?: boolean;
      site?: boolean;
      client?: boolean;
      global?: boolean;
    };
  };
}

// ===================================================================
// CONSTANTES
// ===================================================================

export const SYSTEM_ROLES: Record<SystemRoleKey, string> = {
  owner: 'Owner / Org Admin',
  client_admin: 'Client Admin',
  site_manager: 'Gestionnaire de site',
  planner: 'Planificateur / Dispatcher',
  safety_officer: 'Responsable SST / AST',
  project_manager: 'Gestionnaire de projet',
  accounting: 'Facturation & Comptabilité',
  fleet_manager: 'Gestionnaire de flotte',
  worker: 'Travailleur / Technicien',
  guest: 'Invité / Externe'
};

export const PERMISSION_MODULES: Record<PermissionModule, string> = {
  planning: 'Planification',
  projects: 'Projets',
  timesheets: 'Feuilles de temps',
  expenses: 'Dépenses',
  ast: 'AST',
  permits: 'Permis',
  fleet: 'Flotte',
  billing: 'Facturation',
  reports: 'Rapports',
  users: 'Utilisateurs',
  settings: 'Paramètres'
};

export const SCOPE_LABELS: Record<ScopeType, string> = {
  global: 'Global (organisation)',
  client: 'Client',
  site: 'Site',
  project: 'Projet'
};

// ===================================================================
// TYPE GUARDS
// ===================================================================

export function isSystemRole(key: string): key is SystemRoleKey {
  return key in SYSTEM_ROLES;
}

export function isValidScopeType(type: string): type is ScopeType {
  return ['global', 'client', 'site', 'project'].includes(type);
}

export function isValidPermissionAction(action: string): action is PermissionAction {
  return ['view', 'create', 'edit', 'delete', 'approve', 'export', 'assign', 'close', 'sign', 'reserve', 'manage', 'maintenance', 'send', 'refund', 'deactivate', 'reset_mfa'].includes(action);
}