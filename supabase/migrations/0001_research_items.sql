-- ============================================================
-- Phase 2: Library persistence
-- Table backing the Research Library. Free-tier Supabase.
-- ============================================================

create table if not exists public.research_items (
  id          text primary key,
  title       text not null,
  symbol      text not null default '',
  type        text not null default '',
  status      text not null default 'completed',
  payload     jsonb,                       -- reserved for full report (Phase 4)
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists research_items_created_idx
  on public.research_items (created_at desc);

-- Row Level Security.
-- NOTE: this is a permissive demo policy that lets the public
-- (anon / publishable key) read & write. Fine for a single-user
-- prototype. When you add Supabase Auth, replace it with a
-- per-user policy (e.g. user_id = auth.uid()).
alter table public.research_items enable row level security;

drop policy if exists "demo public access" on public.research_items;
create policy "demo public access"
  on public.research_items
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- Seed the existing items so the Library looks identical on first run,
-- but is now persisted. Idempotent.
insert into public.research_items (id, title, symbol, type, status, created_at, updated_at) values
  ('lib-1', '腾讯云增长逻辑研究',   '00700.HK', '引导研究', 'completed', '2024-05-20 10:30+00', '2024-05-20 15:45+00'),
  ('lib-2', 'TSLA 快速风险扫描',    'TSLA',     '快速分析', 'completed', '2024-05-19 14:20+00', '2024-05-19 14:22+00'),
  ('lib-3', 'NVDA 财报预期差分析',  'NVDA',     '引导研究', 'draft',     '2024-05-18 09:15+00', '2024-05-18 11:30+00'),
  ('lib-4', '半导体产业链研究流',   'SOX',      '研究流',   'running',   '2024-05-17 16:00+00', '2024-05-18 10:00+00'),
  ('lib-5', '苹果供应链风险评估',   'AAPL',     '引导研究', 'completed', '2024-05-16 11:00+00', '2024-05-16 13:45+00'),
  ('lib-6', '新能源行业趋势研究',   'NIO',      '引导研究', 'error',     '2024-05-15 08:30+00', '2024-05-15 10:00+00')
on conflict (id) do nothing;
