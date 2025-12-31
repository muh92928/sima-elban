-- BYPASS EMAIL CONFIRMATION FOR EXISTING USERS
-- Run this in Supabase SQL Editor to verify all currently pending emails.

UPDATE auth.users
SET email_confirmed_at = now()
WHERE email_confirmed_at IS NULL;

-- Note: To prevent this for future users, go to:
-- Supabase Dashboard -> Authentication -> Providers -> Email -> Disable "Confirm email"
