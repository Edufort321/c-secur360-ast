-- Migration 047: Add niveauAcces column to planner_personnel
-- Allows admin to set planner access levels per employee

ALTER TABLE planner_personnel
  ADD COLUMN IF NOT EXISTS "niveauAcces" TEXT NOT NULL DEFAULT 'consultation'
    CHECK ("niveauAcces" IN ('consultation', 'modification', 'coordination', 'administration'));
