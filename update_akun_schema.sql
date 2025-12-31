-- 1. Rename column unit_kerja to peran
ALTER TABLE public.akun RENAME COLUMN unit_kerja TO peran;

-- 2. Update status 'approved' -> 'AKTIF' to match PHP logic
UPDATE public.akun SET status = 'AKTIF' WHERE status = 'approved';

-- 3. Update or Recreate Trigger Function to handle new column and logic
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.akun (id, email, nip, nama, peran, status)
  VALUES (
    new.id, 
    new.email,
    new.raw_user_meta_data->>'nip',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'peran', -- Maps to renamed column
    'AKTIF'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Ensure Trigger is active
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
