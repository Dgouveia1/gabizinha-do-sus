-- Enable UUID generation
create extension if not exists "pgcrypto";

-- Users (mirrors auth.users, extended with app data)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  avatar_url text,
  created_at timestamptz default now()
);

-- Boards (each board = one Kanban board, scoped to a semester)
create table if not exists public.boards (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  owner_id uuid not null references public.users(id) on delete cascade,
  semester smallint check (semester between 1 and 12),
  created_at timestamptz default now()
);

-- Board membership (many-to-many with roles)
create table if not exists public.board_members (
  board_id uuid references public.boards(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  role text not null check (role in ('admin', 'editor')) default 'editor',
  primary key (board_id, user_id)
);

-- Lists (columns inside a board)
create table if not exists public.lists (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  title text not null,
  position integer not null default 0
);

-- Cards
create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.lists(id) on delete cascade,
  title text not null,
  description text,
  due_date date,
  position integer not null default 0,
  created_at timestamptz default now()
);

-- Checklist items (sub-tasks on a card)
create table if not exists public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.cards(id) on delete cascade,
  text text not null,
  is_done boolean default false,
  position integer not null default 0
);

-- Attachments
create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.cards(id) on delete cascade,
  file_url text not null,
  file_name text not null,
  created_at timestamptz default now()
);

-- Comments
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.cards(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

-- External links on a card
create table if not exists public.card_links (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.cards(id) on delete cascade,
  url text not null,
  label text
);

-- Invite tokens (for invite-by-link flow)
create table if not exists public.board_invites (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  token text not null unique default encode(gen_random_bytes(16), 'hex'),
  role text not null check (role in ('admin', 'editor')) default 'editor',
  created_by uuid references public.users(id),
  expires_at timestamptz default (now() + interval '7 days'),
  created_at timestamptz default now()
);
