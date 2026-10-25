-- NLUYXL Production PostgreSQL Schema (Supabase RLS Enabled)
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

create table if not exists workspaces (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text unique not null,
    plan text default 'free' check (plan in ('free', 'starter', 'pro', 'enterprise')),
    credit_balance bigint default 20000,
    created_at timestamptz default now()
);

create table if not exists profiles (
    id uuid primary key default gen_random_uuid(),
    workspace_id uuid references workspaces(id) on delete cascade,
    email text not null,
    full_name text,
    avatar_url text,
    role text default 'member' check (role in ('owner', 'admin', 'member', 'read_only')),
    created_at timestamptz default now()
);

create table if not exists home_folders (
    id uuid primary key default gen_random_uuid(),
    workspace_id uuid not null references workspaces(id) on delete cascade,
    profile_id uuid not null references profiles(id) on delete cascade,
    name text not null,
    created_at timestamptz default now()
);

create table if not exists unit_layout (
    id uuid primary key default gen_random_uuid(),
    workspace_id uuid not null references workspaces(id) on delete cascade,
    profile_id uuid not null references profiles(id) on delete cascade,
    unit_id text not null,
    surface text default 'home',
    folder_id uuid references home_folders(id) on delete set null,
    docked boolean default false,
    dock_opt_out boolean default false,
    position jsonb not null default '{"x": 0, "y": 0, "w": 2, "h": 2}'::jsonb,
    opened_at timestamptz default now(),
    opens integer default 1,
    constraint unique_unit_per_user unique (workspace_id, profile_id, unit_id)
);

create table if not exists connections (
    id uuid primary key default gen_random_uuid(),
    workspace_id uuid not null references workspaces(id) on delete cascade,
    provider text not null check (provider in ('google', 'slack', 'quickbooks', 'linear', 'hubspot', 'github', 'stripe')),
    account_identifier text not null,
    encrypted_access_token text not null,
    encrypted_refresh_token text,
    kms_encrypted_key text not null default 'local_kms',
    iv text not null default 'iv_token',
    token_expires_at timestamptz,
    scopes text[] not null default '{}',
    status text default 'connected' check (status in ('connected', 'expired', 'revoked')),
    created_at timestamptz default now(),
    constraint unique_provider_per_ws unique (workspace_id, provider, account_identifier)
);

create table if not exists jobs (
    id uuid primary key default gen_random_uuid(),
    workspace_id uuid not null references workspaces(id) on delete cascade,
    created_by uuid references profiles(id),
    title text not null,
    instruction text not null,
    trigger_type text not null default 'cron' check (trigger_type in ('cron', 'event', 'webhook', 'manual')),
    cron_expression text,
    requires_approval boolean default true,
    status text default 'active' check (status in ('active', 'paused', 'failed')),
    last_run_at timestamptz,
    next_run_at timestamptz,
    created_at timestamptz default now()
);

create table if not exists job_runs (
    id uuid primary key default gen_random_uuid(),
    job_id uuid not null references jobs(id) on delete cascade,
    workspace_id uuid not null references workspaces(id) on delete cascade,
    status text default 'running' check (status in ('pending_approval', 'running', 'completed', 'failed', 'cancelled')),
    tool_calls jsonb default '[]'::jsonb,
    execution_log text,
    pending_action_payload jsonb,
    started_at timestamptz default now(),
    finished_at timestamptz
);

create table if not exists calendar_events (
    id text primary key,
    workspace_id uuid not null references workspaces(id) on delete cascade,
    owner_id uuid not null references profiles(id) on delete cascade,
    title text not null,
    starts_at timestamptz not null,
    ends_at timestamptz not null,
    location text,
    conference_url text,
    all_day boolean default false,
    response text default 'accepted',
    synced_at timestamptz default now()
);

create table if not exists security_audit_logs (
    id uuid primary key default gen_random_uuid(),
    workspace_id uuid not null references workspaces(id) on delete cascade,
    actor_id uuid references profiles(id),
    action_type text not null,
    target_resource text not null,
    risk_level text check (risk_level in ('low', 'medium', 'high', 'critical')),
    details jsonb not null default '{}'::jsonb,
    ip_address text,
    timestamp timestamptz default now()
);

alter table workspaces enable row level security;
alter table profiles enable row level security;
alter table home_folders enable row level security;
alter table unit_layout enable row level security;
alter table connections enable row level security;
alter table jobs enable row level security;
alter table job_runs enable row level security;
alter table calendar_events enable row level security;
alter table security_audit_logs enable row level security;
