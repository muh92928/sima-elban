-- Add new columns to log_peralatan table
alter table public.log_peralatan
add column if not exists waktu_operasi_aktual integer default 0,
add column if not exists waktu_operasi_diterapkan integer default 0,
add column if not exists mematikan_terjadwal integer default 0,
add column if not exists periode_kegagalan integer default 0,
add column if not exists status text default 'Normal Ops' check (status in ('Normal Ops', 'Perlu Perbaikan', 'Perlu Perawatan')),
add column if not exists diupdate_kapan timestamp with time zone default now();

-- Ensure dokumentasi column exists (it might already, but good to double check)
alter table public.log_peralatan
add column if not exists dokumentasi text;

-- Update existing rows to have default values if null (optional, but good for consistency)
update public.log_peralatan 
set waktu_operasi_aktual = 0 where waktu_operasi_aktual is null;

update public.log_peralatan 
set waktu_operasi_diterapkan = 0 where waktu_operasi_diterapkan is null;

update public.log_peralatan 
set mematikan_terjadwal = 0 where mematikan_terjadwal is null;

update public.log_peralatan 
set periode_kegagalan = 0 where periode_kegagalan is null;

update public.log_peralatan 
set status = 'Normal Ops' where status is null;
