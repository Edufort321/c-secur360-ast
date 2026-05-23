-- Adds logo_url column to tenants table.
-- Displayed in PortalHeader when set, overriding the default C-Secur360 logo.
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS logo_url TEXT;
