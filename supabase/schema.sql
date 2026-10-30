-- ============================================================================
-- MELOS — ESPECIFICAÇÃO TÉCNICA E ARQUITETURA
-- Script DDL PostgreSQL (Supabase) — Tabela `scores`, Full-Text Search e RLS
-- ============================================================================

create extension if not exists "pgcrypto";

create table if not exists public.scores (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  composer text not null,
  arranger text,
  instrumentation text,
  musical_key text,
  difficulty text check (difficulty in ('Iniciante', 'Intermediário', 'Avançado', 'Virtuoso')),
  genre text,
  tags text[] default '{}',
  drive_file_id text not null,
  original_filename text not null,
  view_url text not null,
  download_url text,
  is_categorized boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Índice GIN para busca textual rápida (Full-Text Search) e busca em tags
create index if not exists idx_scores_tags on public.scores using gin (tags);
create index if not exists idx_scores_is_categorized on public.scores (is_categorized);
create index if not exists idx_scores_search on public.scores using gin (
  to_tsvector('portuguese', coalesce(title, '') || ' ' || coalesce(composer, '') || ' ' || coalesce(arranger, '') || ' ' || coalesce(genre, ''))
);

-- Trigger para atualizar `updated_at` automaticamente
create or replace function public.set_scores_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_scores_updated_at on public.scores;
create trigger trg_scores_updated_at
before update on public.scores
for each row execute function public.set_scores_updated_at();

-- Habilitar Row Level Security (RLS)
alter table public.scores enable row level security;

-- Política para leitura e escrita da biblioteca privada
create policy "Acesso completo para biblioteca Melos"
on public.scores
for all
using (true)
with check (true);
