-- FIX TRIGGER FOR REGISTRATION
-- This script ensures the handle_new_user function correctly handles the Enum casting and Status constraint.

-- 1. Redefine the function with explicit Enum casting
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into public.akun
  -- We extract metadata, and explicitly cast to the enum type where necessary.
  -- Error handling: If peran doesn't match, it might fail, so we ensure the input matches ENUM values.
  
  INSERT INTO public.akun (id, email, nip, nama, peran, status)
  VALUES (
    new.id, 
    new.email,
    new.raw_user_meta_data->>'nip',
    new.raw_user_meta_data->>'full_name',
    (new.raw_user_meta_data->>'peran')::public.user_peran_enum, -- Explicit Cast to ENUM
    'AKTIF' -- Ensure status is Valid
  );
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- If error occurs (e.g. invalid enum value), valid to fail the registration so user knows.
    -- But we can also log it to postgres logs.
    RAISE EXCEPTION 'Database error saving new user (Trigger Failed): %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Re-bind the trigger (Just to be safe)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Just in case: Ensure Status Constraint allows 'AKTIF'
-- (Redundant if previous script ran, but harmless to repeat just for constraint check)
DO $$
BEGIN
    ALTER TABLE public.akun DROP CONSTRAINT IF EXISTS akun_status_check;
    ALTER TABLE public.akun ADD CONSTRAINT akun_status_check 
      CHECK (status IN ('AKTIF', 'NONAKTIF', 'pending', 'approved', 'rejected'));
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;
