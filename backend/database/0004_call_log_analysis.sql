-- ============================================
-- Migration 0004: JSONB analysis/evaluation storage
-- Adds structured payload capture for ElevenLabs analysis
-- and internal evaluation parsing.
-- ============================================

ALTER TABLE call_logs
  ADD COLUMN IF NOT EXISTS analysis        JSONB,
  ADD COLUMN IF NOT EXISTS evaluation      JSONB,
  ADD COLUMN IF NOT EXISTS metadata        JSONB,
  ADD COLUMN IF NOT EXISTS webhook_payload JSONB;

CREATE INDEX IF NOT EXISTS idx_call_logs_analysis_gin
  ON call_logs USING GIN (analysis);

CREATE INDEX IF NOT EXISTS idx_call_logs_evaluation_gin
  ON call_logs USING GIN (evaluation);
