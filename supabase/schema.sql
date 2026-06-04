-- Sladká fazuľka — Supabase schema
-- Run this ONCE in your Supabase project: Dashboard → SQL Editor → New query → paste → Run.
--
-- Design: document-style storage. Each row keeps the full app object in `data`
-- (jsonb), exactly matching the TypeScript types, plus a few promoted columns
-- used only for filtering and Row Level Security. This avoids any field-mapping
-- and keeps the frontend types as the single source of truth.

-- ============================================================
-- TABLES
-- ============================================================

create table if not exists public.products (
  id          text primary key,
  slug        text,
  available   boolean not null default true,
  featured    boolean not null default false,
  data        jsonb   not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.gallery_images (
  id          text primary key,
  hidden      boolean not null default false,
  featured    boolean not null default false,
  data        jsonb   not null,
  created_at  timestamptz not null default now()
);

create table if not exists public.candy_bar_packages (
  id          text primary key,
  hidden      boolean not null default false,
  data        jsonb   not null,
  updated_at  timestamptz not null default now()
);

create table if not exists public.orders (
  id          text primary key,
  status      text    not null default 'new',
  data        jsonb   not null,
  created_at  timestamptz not null default now()
);

-- Custom-cake builder configuration (sizes, bases, creams, fillings, dietary
-- options + their prices). A single row with id = 'default'.
create table if not exists public.cake_config (
  id          text primary key,
  data        jsonb   not null,
  updated_at  timestamptz not null default now()
);

-- Display order for catalog items (seeded from the catalog array index;
-- new admin items are appended). Added separately so re-running is safe.
alter table public.products           add column if not exists position int;
alter table public.gallery_images     add column if not exists position int;
alter table public.candy_bar_packages add column if not exists position int;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
-- Anonymous visitors: may READ only visible catalog items, and may CREATE orders.
-- Authenticated admin (logged in via Supabase Auth): full read/write.
-- Orders are NEVER publicly readable (they contain customer name/email/phone).

alter table public.products            enable row level security;
alter table public.gallery_images      enable row level security;
alter table public.candy_bar_packages  enable row level security;
alter table public.orders              enable row level security;
alter table public.cake_config         enable row level security;

-- Public read (visible items only). Applies to anon + authenticated.
drop policy if exists "products public read" on public.products;
create policy "products public read" on public.products
  for select using (available = true);

drop policy if exists "gallery public read" on public.gallery_images;
create policy "gallery public read" on public.gallery_images
  for select using (hidden = false);

drop policy if exists "packages public read" on public.candy_bar_packages;
create policy "packages public read" on public.candy_bar_packages
  for select using (hidden = false);

-- Cake builder config is public-readable (the builder needs it for everyone).
drop policy if exists "cake_config public read" on public.cake_config;
create policy "cake_config public read" on public.cake_config
  for select using (true);

-- Admin: full access (read incl. hidden/unavailable, plus insert/update/delete).
drop policy if exists "products admin all" on public.products;
create policy "products admin all" on public.products
  for all to authenticated using (true) with check (true);

drop policy if exists "gallery admin all" on public.gallery_images;
create policy "gallery admin all" on public.gallery_images
  for all to authenticated using (true) with check (true);

drop policy if exists "packages admin all" on public.candy_bar_packages;
create policy "packages admin all" on public.candy_bar_packages
  for all to authenticated using (true) with check (true);

drop policy if exists "cake_config admin all" on public.cake_config;
create policy "cake_config admin all" on public.cake_config
  for all to authenticated using (true) with check (true);

-- Orders: anyone may place one; only admin may read/update. No public read.
drop policy if exists "orders anon insert" on public.orders;
create policy "orders anon insert" on public.orders
  for insert to anon, authenticated with check (true);

drop policy if exists "orders admin manage" on public.orders;
create policy "orders admin manage" on public.orders
  for all to authenticated using (true) with check (true);

-- ============================================================
-- GRANTS
-- ============================================================
-- RLS decides WHICH ROWS a role may touch; GRANTs decide WHICH OPERATIONS the
-- role may attempt at all. Both are required.

grant usage on schema public to anon, authenticated;

-- Read catalog (rows further limited by RLS to visible items for anon).
grant select on public.products, public.gallery_images, public.candy_bar_packages, public.cake_config
  to anon, authenticated;

-- Admin manages the catalog.
grant insert, update, delete on public.products, public.gallery_images, public.candy_bar_packages, public.cake_config
  to authenticated;

-- Anyone may place an order (insert only, no read); admin manages them.
grant insert on public.orders to anon, authenticated;
grant select, update, delete on public.orders to authenticated;

-- ============================================================
-- STORAGE (product / gallery / inspiration images)
-- ============================================================

insert into storage.buckets (id, name, public)
  values ('images', 'images', true)
  on conflict (id) do nothing;

drop policy if exists "images public read" on storage.objects;
create policy "images public read" on storage.objects
  for select using (bucket_id = 'images');

drop policy if exists "images admin write" on storage.objects;
create policy "images admin write" on storage.objects
  for all to authenticated
  using (bucket_id = 'images')
  with check (bucket_id = 'images');
