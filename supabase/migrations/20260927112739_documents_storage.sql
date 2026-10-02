create table public.legal_documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 180),
  client_name text not null check (char_length(client_name) between 1 and 180),
  observations text,
  active boolean not null default true,
  case_id text,
  case_title text,
  file_name text not null,
  file_type text not null check (file_type in ('application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document')),
  file_size bigint not null check (file_size > 0 and file_size <= 8000000),
  file_path text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index legal_documents_owner_created_idx on public.legal_documents(owner_id, created_at desc);
create index legal_documents_owner_case_created_idx on public.legal_documents(owner_id, case_id, created_at desc);
alter table public.legal_documents enable row level security;
grant select, insert, update, delete on public.legal_documents to authenticated;

create policy "owners read legal documents" on public.legal_documents for select to authenticated using ((select auth.uid()) = owner_id);
create policy "owners insert legal documents" on public.legal_documents for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy "owners update legal documents" on public.legal_documents for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "owners delete legal documents" on public.legal_documents for delete to authenticated using ((select auth.uid()) = owner_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('legal-documents', 'legal-documents', false, 8000000, array['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict (id) do update set public=false, file_size_limit=excluded.file_size_limit, allowed_mime_types=excluded.allowed_mime_types;

create policy "owners upload legal files" on storage.objects for insert to authenticated
with check (bucket_id='legal-documents' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "owners read legal files" on storage.objects for select to authenticated
using (bucket_id='legal-documents' and owner_id=(select auth.uid())::text);
create policy "owners update legal files" on storage.objects for update to authenticated
using (bucket_id='legal-documents' and owner_id=(select auth.uid())::text)
with check (bucket_id='legal-documents' and owner_id=(select auth.uid())::text);
create policy "owners delete legal files" on storage.objects for delete to authenticated
using (bucket_id='legal-documents' and owner_id=(select auth.uid())::text);
