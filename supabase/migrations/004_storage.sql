-- Storage buckets (run these in the Supabase SQL editor or via CLI)
-- Note: bucket creation via SQL requires the storage schema to be available

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', false)
on conflict (id) do nothing;

-- Storage policies for avatars (public bucket)
create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "avatars_authenticated_insert" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and auth.role() = 'authenticated'
  );

create policy "avatars_owner_update" on storage.objects
  for update using (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for attachments (private bucket)
create policy "attachments_authenticated_read" on storage.objects
  for select using (
    bucket_id = 'attachments' and auth.role() = 'authenticated'
  );

create policy "attachments_authenticated_insert" on storage.objects
  for insert with check (
    bucket_id = 'attachments' and auth.role() = 'authenticated'
  );

create policy "attachments_authenticated_delete" on storage.objects
  for delete using (
    bucket_id = 'attachments' and auth.role() = 'authenticated'
  );
