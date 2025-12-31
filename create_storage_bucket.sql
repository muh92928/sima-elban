    -- Enable the storage extension if not already enabled (usually enabled by default)
    -- create extension if not exists "storage" schema "extensions";

    -- 1. Create the 'files' bucket
    insert into storage.buckets (id, name, public)
    values ('files', 'files', true)
    on conflict (id) do nothing;

    -- 2. Drop existing policies to avoid conflicts
    drop policy if exists "Public Access" on storage.objects;
    drop policy if exists "Authenticated Uploads" on storage.objects;
    drop policy if exists "Authenticated Updates" on storage.objects;
    drop policy if exists "Authenticated Deletes" on storage.objects;

    -- 3. Set up security policies for the 'files' bucket

    -- Allow public read access (so images can be displayed in the app)
    create policy "Public Access"
    on storage.objects for select
    using ( bucket_id = 'files' );

    -- Allow authenticated users to upload files
    create policy "Authenticated Uploads"
    on storage.objects for insert
    with check ( bucket_id = 'files' and auth.role() = 'authenticated' );

    -- Allow authenticated users to update files
    create policy "Authenticated Updates"
    on storage.objects for update
    using ( bucket_id = 'files' and auth.role() = 'authenticated' );

    -- Allow authenticated users to delete files
    create policy "Authenticated Deletes"
    on storage.objects for delete
    using ( bucket_id = 'files' and auth.role() = 'authenticated' );
