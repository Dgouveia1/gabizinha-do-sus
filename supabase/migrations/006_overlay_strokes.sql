-- Add overlay_strokes column to notebook_pages
-- Stores freehand annotation strokes as JSON array
-- Each stroke: { color: string, size: number, points: [{x, y}] }
alter table public.notebook_pages
  add column if not exists overlay_strokes jsonb default '[]';
