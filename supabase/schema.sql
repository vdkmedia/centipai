-- CentipAI databaseschema (Supabase / Postgres)
-- Kernprincipes:
--  * Het BEDRIJF is eigenaar van brandprofiel, kanalen en credits.
--  * Agencies krijgen via een koppeling toegang tot bedrijfsaccounts;
--    alles wat zij daar doen gaat van de credits van dat bedrijf af.
--  * Elke AI-actie wordt geboekt in credit_ledger (audit + limieten).

-- ═══════════════ Accounts ═══════════════

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

create table public.agencies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references public.profiles (id),
  plan text not null default 'starter' check (plan in ('starter', 'business', 'agency_own')),
  created_at timestamptz not null default now()
);

-- Agency <-> bedrijf koppeling. Status 'pending' tot het bedrijf accepteert.
create table public.agency_company_links (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'active', 'revoked')),
  invited_by text not null check (invited_by in ('agency', 'company')),
  created_at timestamptz not null default now(),
  unique (agency_id, company_id)
);

-- ═══════════════ Brand & AI ═══════════════

create table public.brand_profiles (
  company_id uuid primary key references public.companies (id) on delete cascade,
  website text,
  industry text,
  tone smallint check (tone between 1 and 5),
  form_of_address text check (form_of_address in ('je', 'u')),
  language text not null default 'nl' check (language in ('nl', 'en', 'de', 'fr')),
  use_emoji boolean not null default true,
  updated_at timestamptz not null default now()
);

-- Trainbare AI-regels: los toevoegen en verwijderen. Gebruikersregels
-- krijgen in de prompt voorrang op de (onzichtbare) standaardregels.
create table public.ai_rules (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  rule text not null,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

-- ═══════════════ Kanalen & content ═══════════════

create table public.channel_connections (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  platform text not null check (
    platform in ('instagram', 'facebook', 'threads', 'tiktok', 'linkedin', 'google_business')
  ),
  external_account_id text,
  access_token_encrypted text,
  refresh_token_encrypted text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  unique (company_id, platform)
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  created_by uuid not null references public.profiles (id),
  -- Formaat is een expliciete keuze, los van de kanalen
  post_type text not null default 'post' check (post_type in ('post', 'story', 'reel')),
  caption text not null,
  media_paths text[] not null default '{}',
  channels text[] not null default '{}',
  status text not null default 'draft' check (
    status in ('draft', 'pending_approval', 'approved', 'scheduled', 'published', 'failed', 'rejected')
  ),
  scheduled_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.approvals (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  decided_by uuid references public.profiles (id),
  decision text check (decision in ('approved', 'rejected')),
  comment text,
  decided_at timestamptz
);

-- ═══════════════ Credits & limieten ═══════════════

-- Elke boeking: positief = tegoed (maandbundel, beloning), negatief = verbruik.
-- company_id = wiens tegoed; acted_by = wie de actie deed (kan agency-lid zijn).
create table public.credit_ledger (
  id bigint generated always as identity primary key,
  company_id uuid not null references public.companies (id) on delete cascade,
  acted_by uuid references public.profiles (id),
  kind text not null check (
    kind in ('monthly_grant', 'purchase', 'reward_scheduling', 'caption_generate', 'photo_enhance', 'chat_message')
  ),
  amount integer not null,
  post_id uuid references public.posts (id),
  created_at timestamptz not null default now()
);

create index credit_ledger_company_idx on public.credit_ledger (company_id, created_at desc);

-- Actueel saldo per bedrijf
create view public.credit_balances as
select company_id, sum(amount)::integer as balance
from public.credit_ledger
group by company_id;

-- ═══════════════ Row Level Security (kern) ═══════════════
-- Toegang tot een bedrijf = eigenaar, of lid van een agency met een
-- actieve koppeling naar dat bedrijf.

create or replace function public.has_company_access (target_company uuid)
returns boolean
language sql stable security definer
as $$
  select exists (
    select 1 from public.companies c where c.id = target_company and c.owner_id = auth.uid()
  ) or exists (
    select 1
    from public.agency_company_links l
    join public.agencies a on a.id = l.agency_id
    where l.company_id = target_company and l.status = 'active' and a.owner_id = auth.uid()
  );
$$;

-- Variant voor edge functions (service role geeft de gebruiker expliciet mee)
create or replace function public.has_company_access_for (target_company uuid, target_user uuid)
returns boolean
language sql stable security definer
as $$
  select exists (
    select 1 from public.companies c where c.id = target_company and c.owner_id = target_user
  ) or exists (
    select 1
    from public.agency_company_links l
    join public.agencies a on a.id = l.agency_id
    where l.company_id = target_company and l.status = 'active' and a.owner_id = target_user
  );
$$;

alter table public.profiles enable row level security;
alter table public.agencies enable row level security;
alter table public.companies enable row level security;
alter table public.agency_company_links enable row level security;
alter table public.brand_profiles enable row level security;
alter table public.ai_rules enable row level security;
alter table public.channel_connections enable row level security;
alter table public.posts enable row level security;
alter table public.approvals enable row level security;
alter table public.credit_ledger enable row level security;

create policy "own profile" on public.profiles for all using (id = auth.uid());
create policy "own agency" on public.agencies for all using (owner_id = auth.uid());
create policy "company owner" on public.companies for all using (owner_id = auth.uid());
create policy "company read via agency" on public.companies for select using (public.has_company_access (id));
create policy "link parties" on public.agency_company_links for all using (
  exists (select 1 from public.agencies a where a.id = agency_id and a.owner_id = auth.uid())
  or exists (select 1 from public.companies c where c.id = company_id and c.owner_id = auth.uid())
);
create policy "brand access" on public.brand_profiles for all using (public.has_company_access (company_id));
create policy "rules access" on public.ai_rules for all using (public.has_company_access (company_id));
create policy "channels access" on public.channel_connections for all using (public.has_company_access (company_id));
create policy "posts access" on public.posts for all using (public.has_company_access (company_id));
create policy "approvals via post" on public.approvals for all using (
  exists (select 1 from public.posts p where p.id = post_id and public.has_company_access (p.company_id))
);
create policy "ledger read" on public.credit_ledger for select using (public.has_company_access (company_id));
-- Schrijven in credit_ledger gebeurt uitsluitend via edge functions (service role).
