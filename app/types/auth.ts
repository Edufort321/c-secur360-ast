export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: 'super_admin' | 'client_admin' | 'user';
  tenant_id?: string; // null for super_admin, set for client_admin
  totp_secret?: string;
  totp_enabled: boolean;
  totp_backup_codes?: string[];
  first_login: boolean;
  last_login_at?: string;
  failed_attempts: number;
  locked_until?: string;
  created_at: string;
  updated_at: string;
  profile?: {
    first_name: string;
    last_name: string;
    phone?: string;
    company?: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
  totp_code?: string;
  remember_me?: boolean;
}

export interface LoginResponse {
  success: boolean;
  requires_totp?: boolean;
  requires_setup?: boolean;
  user?: Omit<User, 'password_hash' | 'totp_secret'>;
  token?: string;
  redirect_url?: string;
  error?: string;
  locked_until?: string;
}

export interface TOTPSetupResponse {
  success: boolean;
  secret?: string;
  qr_code_url?: string;
  backup_codes?: string[];
  error?: string;
}

export interface AuthSession {
  user: Omit<User, 'password_hash' | 'totp_secret'>;
  expires: string;
  token: string;
}

export interface AuditLogEntry {
  id: string;
  user_id?: string;
  email?: string;
  action: 'login_success' | 'login_fail' | 'totp_setup' | 'totp_verify' | 'password_reset' | 'account_locked' | 'logout' | 'session_expired';
  details: Record<string, any>;
  ip_address: string;
  user_agent: string;
  created_at: string;
}