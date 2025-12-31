-- 1. Create the Enum Type
DO $$ BEGIN
    CREATE TYPE user_peran_enum AS ENUM (
        'KEPALA_BANDARA',
        'KASI_TOKPD',
        'KASI_JASA',
        'KASUBAG_TU',
        'KANIT_ELBAN',
        'TEKNISI_ELBAN',
        'UNIT_BANGLAN',
        'UNIT_HUMAS',
        'UNIT_LISTRIK',
        'UNIT_ADMIN',
        'UNIT_A2B',
        'UNIT_PK',
        'UNIT_AVSEC',
        'UNIT_INFORMASI',
        'UNIT_TATA_TERMINAL'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Handle invalid data before casting
-- Example: 'Elektronika Bandara' is not in the list. Map it or set to NULL.
-- I'll map 'Elektronika Bandara' to 'TEKNISI_ELBAN' for safety if it exists, or just NULL.
UPDATE public.akun 
SET peran = 'TEKNISI_ELBAN' 
WHERE peran = 'Elektronika Bandara';

UPDATE public.akun 
SET peran = 'UNIT_ADMIN' 
WHERE peran = 'Admin Kantor';

-- Set any other invalid values to NULL (or a default) to avoid crash
UPDATE public.akun
SET peran = NULL
WHERE peran NOT IN (
    'KEPALA_BANDARA', 'KASI_TOKPD', 'KASI_JASA', 'KASUBAG_TU', 
    'KANIT_ELBAN', 'TEKNISI_ELBAN', 'UNIT_BANGLAN', 'UNIT_HUMAS', 
    'UNIT_LISTRIK', 'UNIT_ADMIN', 'UNIT_A2B', 'UNIT_PK', 
    'UNIT_AVSEC', 'UNIT_INFORMASI', 'UNIT_TATA_TERMINAL'
);

-- 3. Alter Table to use Enum
ALTER TABLE public.akun 
ALTER COLUMN peran TYPE user_peran_enum 
USING peran::user_peran_enum;

-- 4. Update Trigger Function to ensure inserted values match enum (Database will enforce it automatically, but good to know)
-- (No change needed in function logic, but if provided data is invalid, it will fail at INSERT level, which is expected).
