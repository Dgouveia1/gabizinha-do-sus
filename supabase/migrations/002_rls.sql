-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.boards enable row level security;
alter table public.board_members enable row level security;
alter table public.lists enable row level security;
alter table public.cards enable row level security;
alter table public.checklist_items enable row level security;
alter table public.attachments enable row level security;
alter table public.comments enable row level security;
alter table public.card_links enable row level security;
alter table public.board_invites enable row level security;

-- =====================
-- Users policies
-- =====================
create policy "users_select" on public.users
  for select using (true);

create policy "users_insert" on public.users
  for insert with check (id = auth.uid());

create policy "users_update" on public.users
  for update using (id = auth.uid());

-- =====================
-- Helper function: board membership check
-- =====================
create or replace function public.is_board_member(p_board_id uuid)
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.board_members
    where board_id = p_board_id and user_id = auth.uid()
  ) or exists (
    select 1 from public.boards
    where id = p_board_id and owner_id = auth.uid()
  );
$$;

create or replace function public.is_board_admin(p_board_id uuid)
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.boards
    where id = p_board_id and owner_id = auth.uid()
  ) or exists (
    select 1 from public.board_members
    where board_id = p_board_id and user_id = auth.uid() and role = 'admin'
  );
$$;

-- =====================
-- Boards policies
-- =====================
create policy "boards_select" on public.boards
  for select using (public.is_board_member(id));

create policy "boards_insert" on public.boards
  for insert with check (owner_id = auth.uid());

create policy "boards_update" on public.boards
  for update using (public.is_board_admin(id));

create policy "boards_delete" on public.boards
  for delete using (owner_id = auth.uid());

-- =====================
-- Board members policies
-- =====================
create policy "board_members_select" on public.board_members
  for select using (public.is_board_member(board_id));

create policy "board_members_insert" on public.board_members
  for insert with check (public.is_board_admin(board_id) or user_id = auth.uid());

create policy "board_members_update" on public.board_members
  for update using (public.is_board_admin(board_id));

create policy "board_members_delete" on public.board_members
  for delete using (public.is_board_admin(board_id) or user_id = auth.uid());

-- =====================
-- Lists policies
-- =====================
create policy "lists_all" on public.lists
  for all using (public.is_board_member(board_id));

-- =====================
-- Cards policies
-- =====================
create policy "cards_all" on public.cards
  for all using (
    exists (
      select 1 from public.lists l
      where l.id = list_id and public.is_board_member(l.board_id)
    )
  );

-- =====================
-- Checklist items policies
-- =====================
create policy "checklist_items_all" on public.checklist_items
  for all using (
    exists (
      select 1 from public.cards c
      join public.lists l on l.id = c.list_id
      where c.id = card_id and public.is_board_member(l.board_id)
    )
  );

-- =====================
-- Attachments policies
-- =====================
create policy "attachments_all" on public.attachments
  for all using (
    exists (
      select 1 from public.cards c
      join public.lists l on l.id = c.list_id
      where c.id = card_id and public.is_board_member(l.board_id)
    )
  );

-- =====================
-- Comments policies
-- =====================
create policy "comments_select" on public.comments
  for select using (
    exists (
      select 1 from public.cards c
      join public.lists l on l.id = c.list_id
      where c.id = card_id and public.is_board_member(l.board_id)
    )
  );

create policy "comments_insert" on public.comments
  for insert with check (
    user_id = auth.uid() and
    exists (
      select 1 from public.cards c
      join public.lists l on l.id = c.list_id
      where c.id = card_id and public.is_board_member(l.board_id)
    )
  );

create policy "comments_delete" on public.comments
  for delete using (user_id = auth.uid());

-- =====================
-- Card links policies
-- =====================
create policy "card_links_all" on public.card_links
  for all using (
    exists (
      select 1 from public.cards c
      join public.lists l on l.id = c.list_id
      where c.id = card_id and public.is_board_member(l.board_id)
    )
  );

-- =====================
-- Board invites policies
-- =====================
create policy "board_invites_select" on public.board_invites
  for select using (true);

create policy "board_invites_insert" on public.board_invites
  for insert with check (public.is_board_admin(board_id));

create policy "board_invites_delete" on public.board_invites
  for delete using (public.is_board_admin(board_id));
