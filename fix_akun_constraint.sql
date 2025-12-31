-- 1. Fix the Constraint First
-- Drop the old constraint that blocks 'AKTIF'
ALTER TABLE public.akun DROP CONSTRAINT IF EXISTS akun_status_check;

-- Add new constraint that allows 'AKTIF' and legacy values
ALTER TABLE public.akun ADD CONSTRAINT akun_status_check 
  CHECK (status IN ('AKTIF', 'NONAKTIF', 'pending', 'approved', 'rejected'));

-- 2. Retry Logic (Safe to run even if partially applied)

-- Rename column if it hasn't been renamed yet
-- Note: Postgres doesn't have "IF NOT EXISTS" for RENAME COLUMN directly simplistically.
-- But if the previous run failed on UPDATE, the RENAME might have succeeded.
-- We can check data layout or just try to update based on current state.
-- BUT, to be safe for the user, I'll assume they might need to rename manually if this fails, 
-- OR I can trust that if 'unit_kerja' exists, rename it. 
-- Since I cannot run conditional logic easily in simple SQL editor without DO block:
DO $$
BEGIN
  IF EXISTS(SELECT *
    FROM information_schema.columns
    WHERE table_name='akun' AND column_name='unit_kerja')
  THEN
      ALTER TABLE public.akun RENAME COLUMN unit_kerja TO peran;
  END IF;
END $$;

-- 3. Update status now that constraint allows it
UPDATE public.akun SET status = 'AKTIF' WHERE status = 'approved';

-- 4. Re-apply Trigger Function
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.akun (id, email, nip, nama, peran, status)
  VALUES (
    new.id, 
    new.email,
    new.raw_user_meta_data->>'nip',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'peran',
    'AKTIF'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Ensure Trigger is active
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
