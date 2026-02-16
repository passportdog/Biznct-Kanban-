-- Fix won deals missing closed_at
-- Run this to set closed_at for existing won deals

UPDATE crm_deals 
SET closed_at = updated_at
WHERE stage = 'won' AND closed_at IS NULL;

-- Verify
SELECT title, stage, closed_at, updated_at 
FROM crm_deals 
WHERE stage = 'won';
