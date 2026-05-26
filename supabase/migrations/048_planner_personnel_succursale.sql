-- Migration 048: Add succursale column to planner_personnel
-- Links each employee to a site/department (planner_succursales.name)

ALTER TABLE planner_personnel
  ADD COLUMN IF NOT EXISTS succursale TEXT;
