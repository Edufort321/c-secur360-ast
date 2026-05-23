-- Enables RLS on approval_levels (consistent with all other tables in migration 010).
-- Run this if you already executed 023 without the RLS policy.
ALTER TABLE approval_levels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS approval_levels_access ON approval_levels;
CREATE POLICY approval_levels_access ON approval_levels FOR ALL USING (true);
