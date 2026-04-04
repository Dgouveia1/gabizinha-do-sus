-- =============================================
-- Caderno Inteligente (Smart Notebook)
-- =============================================

-- Enable pg_trgm for fuzzy search
create extension if not exists "pg_trgm";

-- =============================================
-- Notebooks (one per user, auto-created)
-- =============================================
create table if not exists public.notebooks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null default 'Meu Caderno',
  created_at timestamptz default now(),
  unique(user_id)
);

-- =============================================
-- Subjects (Materias) grouped by semester
-- =============================================
create table if not exists public.notebook_subjects (
  id uuid primary key default gen_random_uuid(),
  notebook_id uuid not null references public.notebooks(id) on delete cascade,
  title text not null,
  emoji text default '📘',
  semester smallint check (semester between 1 and 12),
  color text default 'mint',
  position integer not null default 0,
  created_at timestamptz default now()
);

-- =============================================
-- Chapters (Capitulos/Temas within a subject)
-- =============================================
create table if not exists public.notebook_chapters (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.notebook_subjects(id) on delete cascade,
  title text not null,
  position integer not null default 0,
  created_at timestamptz default now()
);

-- =============================================
-- Pages (individual content pages)
-- =============================================
create table if not exists public.notebook_pages (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.notebook_chapters(id) on delete cascade,
  title text not null default 'Sem titulo',
  content jsonb default '{}',
  plain_text text default '',
  search_vector tsvector,
  is_favorite boolean default false,
  position integer not null default 0,
  last_edited_at timestamptz default now(),
  created_at timestamptz default now()
);

-- =============================================
-- Notebook attachments (files in pages)
-- =============================================
create table if not exists public.notebook_attachments (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.notebook_pages(id) on delete cascade,
  file_url text not null,
  file_name text not null,
  file_size integer,
  mime_type text,
  created_at timestamptz default now()
);

-- =============================================
-- Drawings (tldraw data linked to pages)
-- =============================================
create table if not exists public.notebook_drawings (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.notebook_pages(id) on delete cascade,
  title text default 'Desenho',
  tldraw_data jsonb not null default '{}',
  thumbnail_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- Indexes
-- =============================================
create index idx_notebook_pages_search on public.notebook_pages using gin(search_vector);
create index idx_notebook_pages_title_trgm on public.notebook_pages using gin(title gin_trgm_ops);
create index idx_notebook_subjects_position on public.notebook_subjects(notebook_id, position);
create index idx_notebook_chapters_position on public.notebook_chapters(subject_id, position);
create index idx_notebook_pages_position on public.notebook_pages(chapter_id, position);
create index idx_notebook_attachments_page on public.notebook_attachments(page_id);
create index idx_notebook_drawings_page on public.notebook_drawings(page_id);

-- =============================================
-- FTS trigger: auto-update search_vector
-- =============================================
create or replace function public.update_page_search_vector()
returns trigger language plpgsql as $$
begin
  new.search_vector := to_tsvector('portuguese', coalesce(new.title, '') || ' ' || coalesce(new.plain_text, ''));
  new.last_edited_at := now();
  return new;
end;
$$;

create trigger trg_page_search_vector
  before insert or update of title, plain_text on public.notebook_pages
  for each row execute procedure public.update_page_search_vector();

-- =============================================
-- RLS helper function
-- =============================================
create or replace function public.is_notebook_owner(p_notebook_id uuid)
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.notebooks
    where id = p_notebook_id and user_id = auth.uid()
  );
$$;

-- =============================================
-- Enable RLS
-- =============================================
alter table public.notebooks enable row level security;
alter table public.notebook_subjects enable row level security;
alter table public.notebook_chapters enable row level security;
alter table public.notebook_pages enable row level security;
alter table public.notebook_attachments enable row level security;
alter table public.notebook_drawings enable row level security;

-- =============================================
-- RLS Policies
-- =============================================

-- Notebooks: owner only
create policy "notebooks_all" on public.notebooks
  for all using (user_id = auth.uid());

-- Subjects: via notebook ownership
create policy "subjects_all" on public.notebook_subjects
  for all using (public.is_notebook_owner(notebook_id));

-- Chapters: via subject -> notebook
create policy "chapters_all" on public.notebook_chapters
  for all using (
    exists (
      select 1 from public.notebook_subjects s
      where s.id = subject_id and public.is_notebook_owner(s.notebook_id)
    )
  );

-- Pages: via chapter -> subject -> notebook
create policy "pages_all" on public.notebook_pages
  for all using (
    exists (
      select 1 from public.notebook_chapters c
      join public.notebook_subjects s on s.id = c.subject_id
      where c.id = chapter_id and public.is_notebook_owner(s.notebook_id)
    )
  );

-- Attachments: via page chain
create policy "notebook_attachments_all" on public.notebook_attachments
  for all using (
    exists (
      select 1 from public.notebook_pages p
      join public.notebook_chapters c on c.id = p.chapter_id
      join public.notebook_subjects s on s.id = c.subject_id
      where p.id = page_id and public.is_notebook_owner(s.notebook_id)
    )
  );

-- Drawings: via page chain
create policy "notebook_drawings_all" on public.notebook_drawings
  for all using (
    exists (
      select 1 from public.notebook_pages p
      join public.notebook_chapters c on c.id = p.chapter_id
      join public.notebook_subjects s on s.id = c.subject_id
      where p.id = page_id and public.is_notebook_owner(s.notebook_id)
    )
  );

-- =============================================
-- Storage bucket for notebook attachments
-- =============================================
insert into storage.buckets (id, name, public)
values ('notebook-attachments', 'notebook-attachments', false)
on conflict (id) do nothing;

create policy "notebook_att_read" on storage.objects
  for select using (
    bucket_id = 'notebook-attachments' and auth.role() = 'authenticated'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "notebook_att_insert" on storage.objects
  for insert with check (
    bucket_id = 'notebook-attachments' and auth.role() = 'authenticated'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "notebook_att_delete" on storage.objects
  for delete using (
    bucket_id = 'notebook-attachments' and auth.role() = 'authenticated'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- =============================================
-- Search RPC function
-- =============================================
create or replace function public.search_notebook_pages(search_term text)
returns table (
  page_id uuid,
  page_title text,
  chapter_id uuid,
  chapter_title text,
  subject_id uuid,
  subject_title text,
  subject_emoji text,
  snippet text,
  rank real
) language sql security definer as $$
  select
    p.id as page_id,
    p.title as page_title,
    c.id as chapter_id,
    c.title as chapter_title,
    s.id as subject_id,
    s.title as subject_title,
    s.emoji as subject_emoji,
    ts_headline('portuguese', coalesce(p.plain_text, ''), plainto_tsquery('portuguese', search_term),
      'StartSel=<mark>, StopSel=</mark>, MaxWords=35, MinWords=15, MaxFragments=2'
    ) as snippet,
    ts_rank(p.search_vector, plainto_tsquery('portuguese', search_term)) as rank
  from public.notebook_pages p
  join public.notebook_chapters c on c.id = p.chapter_id
  join public.notebook_subjects s on s.id = c.subject_id
  join public.notebooks n on n.id = s.notebook_id
  where n.user_id = auth.uid()
    and p.search_vector @@ plainto_tsquery('portuguese', search_term)
  order by rank desc
  limit 50;
$$;
