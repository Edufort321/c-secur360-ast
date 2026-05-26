-- Migration 053: Add unit_number to vehicles
-- First column in admin vehicle form — tenant reference (ex. S26105)

ALTER TABLE vehicles
  ADD COLUMN IF NOT EXISTS unit_number TEXT NOT NULL DEFAULT '';
