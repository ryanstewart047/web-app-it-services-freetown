-- Migration: add customerComments JSON column to Repair table
-- Created for: IT Services Freetown — persist customer comments on repair records

ALTER TABLE "Repair" ADD COLUMN IF NOT EXISTS "customerComments" JSONB;
