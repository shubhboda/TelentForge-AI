create extension if not exists pgcrypto;

-- Core tables
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role text not null check (role in ('admin', 'recruiter', 'manager', 'candidate')),
  auth_user_id uuid unique,
  password_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  created_by uuid references users(id) on delete set null,
  title text not null,
  description text not null,
  department text,
  location text,
  stage text not null default 'applied' check (stage in ('applied', 'screening', 'interview', 'offer', 'hired', 'rejected')),
  status text not null default 'open' check (status in ('open', 'paused', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists candidates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  source text not null default 'manual',
  current_score numeric(5,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, email)
);

create table if not exists resumes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  candidate_id uuid references candidates(id) on delete cascade,
  file_path text not null,
  file_name text not null,
  mime_type text not null,
  parsed_text text,
  parsed_json jsonb,
  created_at timestamptz not null default now()
);

create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  job_id uuid not null references jobs(id) on delete cascade,
  candidate_id uuid not null references candidates(id) on delete cascade,
  stage text not null default 'applied' check (stage in ('applied', 'screening', 'interview', 'offer', 'hired', 'rejected')),
  ai_rank numeric(5,2) not null default 0 check (ai_rank >= 0 and ai_rank <= 100),
  applied_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (job_id, candidate_id)
);

create table if not exists interviews (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  application_id uuid not null references applications(id) on delete cascade,
  scheduled_at timestamptz not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  interviewer_name text,
  meeting_link text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists interview_feedback (
  id uuid primary key default gen_random_uuid(),
  interview_id uuid not null references interviews(id) on delete cascade,
  reviewer_id uuid references users(id) on delete set null,
  score numeric(5,2) not null default 0 check (score >= 0 and score <= 100),
  feedback text not null,
  created_at timestamptz not null default now()
);

create table if not exists ai_rankings (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications(id) on delete cascade,
  model_name text not null,
  score numeric(5,2) not null check (score >= 0 and score <= 100),
  rationale jsonb,
  created_at timestamptz not null default now()
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  channel text not null check (channel in ('email', 'sms', 'in_app')),
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- Useful indexes
create index if not exists idx_users_organization_id on users (organization_id);
create index if not exists idx_users_auth_user_id on users (auth_user_id);
create index if not exists idx_jobs_organization_id on jobs (organization_id);
create index if not exists idx_candidates_organization_id on candidates (organization_id);
create index if not exists idx_applications_organization_id on applications (organization_id);
create index if not exists idx_interviews_organization_id on interviews (organization_id);
create index if not exists idx_notifications_organization_id on notifications (organization_id);
create index if not exists idx_activity_logs_organization_id on activity_logs (organization_id);

-- Auto-update timestamp helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Only create triggers once
drop trigger if exists organizations_set_updated_at on organizations;
create trigger organizations_set_updated_at
before update on organizations
for each row execute function public.set_updated_at();

drop trigger if exists users_set_updated_at on users;
drop trigger if exists jobs_set_updated_at on jobs;
drop trigger if exists candidates_set_updated_at on candidates;
drop trigger if exists applications_set_updated_at on applications;
drop trigger if exists interviews_set_updated_at on interviews;

create trigger users_set_updated_at
before update on users
for each row execute function public.set_updated_at();

create trigger jobs_set_updated_at
before update on jobs
for each row execute function public.set_updated_at();

create trigger candidates_set_updated_at
before update on candidates
for each row execute function public.set_updated_at();

create trigger applications_set_updated_at
before update on applications
for each row execute function public.set_updated_at();

create trigger interviews_set_updated_at
before update on interviews
for each row execute function public.set_updated_at();

-- Supabase Auth bridge helpers
create or replace function public.current_user_record()
returns public.users
language sql
stable
security definer
set search_path = public
as $$
  select u.*
  from public.users u
  where u.auth_user_id = auth.uid()
  limit 1
$$;

create or replace function public.current_user_org_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select u.organization_id
  from public.users u
  where u.auth_user_id = auth.uid()
  limit 1
$$;

create or replace function public.current_user_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select u.id
  from public.users u
  where u.auth_user_id = auth.uid()
  limit 1
$$;

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select u.role
  from public.users u
  where u.auth_user_id = auth.uid()
  limit 1
$$;

create or replace function public.is_org_admin_or_manager(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users u
    where u.auth_user_id = auth.uid()
      and u.organization_id = org_id
      and u.role in ('admin', 'manager')
  )
$$;

-- Enable RLS
alter table organizations enable row level security;
alter table users enable row level security;
alter table jobs enable row level security;
alter table candidates enable row level security;
alter table resumes enable row level security;
alter table applications enable row level security;
alter table interviews enable row level security;
alter table interview_feedback enable row level security;
alter table ai_rankings enable row level security;
alter table notifications enable row level security;
alter table activity_logs enable row level security;

-- Drop policies so the script is re-runnable
DROP POLICY IF EXISTS organizations_select_own_org ON organizations;
DROP POLICY IF EXISTS organizations_manage_own_org ON organizations;
DROP POLICY IF EXISTS users_select_org_members ON users;
DROP POLICY IF EXISTS users_manage_org_members ON users;
DROP POLICY IF EXISTS jobs_select_org ON jobs;
DROP POLICY IF EXISTS jobs_write_org ON jobs;
DROP POLICY IF EXISTS candidates_select_org ON candidates;
DROP POLICY IF EXISTS candidates_write_org ON candidates;
DROP POLICY IF EXISTS resumes_select_org ON resumes;
DROP POLICY IF EXISTS resumes_write_org ON resumes;
DROP POLICY IF EXISTS applications_select_org ON applications;
DROP POLICY IF EXISTS applications_write_org ON applications;
DROP POLICY IF EXISTS interviews_select_org ON interviews;
DROP POLICY IF EXISTS interviews_write_org ON interviews;
DROP POLICY IF EXISTS interview_feedback_select_org ON interview_feedback;
DROP POLICY IF EXISTS interview_feedback_write_org ON interview_feedback;
DROP POLICY IF EXISTS ai_rankings_select_org ON ai_rankings;
DROP POLICY IF EXISTS ai_rankings_write_org ON ai_rankings;
DROP POLICY IF EXISTS notifications_select_self_or_org ON notifications;
DROP POLICY IF EXISTS notifications_write_org ON notifications;
DROP POLICY IF EXISTS activity_logs_select_org ON activity_logs;
DROP POLICY IF EXISTS activity_logs_write_org ON activity_logs;
DROP POLICY IF EXISTS storage_select_resumes ON storage.objects;
DROP POLICY IF EXISTS storage_insert_resumes ON storage.objects;
DROP POLICY IF EXISTS storage_update_resumes ON storage.objects;
DROP POLICY IF EXISTS storage_delete_resumes ON storage.objects;

-- Organizations: members can read their own org; admins/managers can update it
create policy organizations_select_own_org
on organizations
for select
to authenticated
using (
  id = public.current_user_org_id()
);

create policy organizations_manage_own_org
on organizations
for update
to authenticated
using (
  public.is_org_admin_or_manager(id)
)
with check (
  public.is_org_admin_or_manager(id)
);

-- Users: members can read their org; admins/managers can manage org users
create policy users_select_org_members
on users
for select
to authenticated
using (
  organization_id = public.current_user_org_id()
);

create policy users_manage_org_members
on users
for insert
to authenticated
with check (
  organization_id = public.current_user_org_id()
  and public.is_org_admin_or_manager(organization_id)
);

create policy users_update_org_members
on users
for update
to authenticated
using (
  organization_id = public.current_user_org_id()
)
with check (
  organization_id = public.current_user_org_id()
  and public.is_org_admin_or_manager(organization_id)
);

-- Jobs and hiring pipeline tables
create policy jobs_select_org
on jobs
for select
to authenticated
using (
  organization_id = public.current_user_org_id()
);

create policy jobs_write_org
on jobs
for all
to authenticated
using (
  public.is_org_admin_or_manager(organization_id)
)
with check (
  public.is_org_admin_or_manager(organization_id)
);

create policy candidates_select_org
on candidates
for select
to authenticated
using (
  organization_id = public.current_user_org_id()
);

create policy candidates_write_org
on candidates
for all
to authenticated
using (
  organization_id = public.current_user_org_id()
)
with check (
  organization_id = public.current_user_org_id()
);

create policy resumes_select_org
on resumes
for select
to authenticated
using (
  organization_id = public.current_user_org_id()
);

create policy resumes_write_org
on resumes
for all
to authenticated
using (
  organization_id = public.current_user_org_id()
)
with check (
  organization_id = public.current_user_org_id()
);

create policy applications_select_org
on applications
for select
to authenticated
using (
  organization_id = public.current_user_org_id()
);

create policy applications_write_org
on applications
for all
to authenticated
using (
  organization_id = public.current_user_org_id()
)
with check (
  organization_id = public.current_user_org_id()
);

create policy interviews_select_org
on interviews
for select
to authenticated
using (
  organization_id = public.current_user_org_id()
);

create policy interviews_write_org
on interviews
for all
to authenticated
using (
  organization_id = public.current_user_org_id()
)
with check (
  organization_id = public.current_user_org_id()
);

create policy interview_feedback_select_org
on interview_feedback
for select
to authenticated
using (
  exists (
    select 1
    from public.interviews i
    where i.id = interview_feedback.interview_id
      and i.organization_id = public.current_user_org_id()
  )
);

create policy interview_feedback_write_org
on interview_feedback
for all
to authenticated
using (
  exists (
    select 1
    from public.interviews i
    where i.id = interview_feedback.interview_id
      and i.organization_id = public.current_user_org_id()
  )
)
with check (
  exists (
    select 1
    from public.interviews i
    where i.id = interview_feedback.interview_id
      and i.organization_id = public.current_user_org_id()
  )
);

create policy ai_rankings_select_org
on ai_rankings
for select
to authenticated
using (
  exists (
    select 1
    from public.applications a
    where a.id = ai_rankings.application_id
      and a.organization_id = public.current_user_org_id()
  )
);

create policy ai_rankings_write_org
on ai_rankings
for all
to authenticated
using (
  exists (
    select 1
    from public.applications a
    where a.id = ai_rankings.application_id
      and a.organization_id = public.current_user_org_id()
  )
)
with check (
  exists (
    select 1
    from public.applications a
    where a.id = ai_rankings.application_id
      and a.organization_id = public.current_user_org_id()
  )
);

create policy notifications_select_self_or_org
on notifications
for select
to authenticated
using (
  organization_id = public.current_user_org_id()
  and (
    user_id is null
    or user_id = public.current_user_id()
  )
);

create policy notifications_write_org
on notifications
for all
to authenticated
using (
  organization_id = public.current_user_org_id()
)
with check (
  organization_id = public.current_user_org_id()
);

create policy activity_logs_select_org
on activity_logs
for select
to authenticated
using (
  organization_id = public.current_user_org_id()
);

create policy activity_logs_write_org
on activity_logs
for insert
to authenticated
with check (
  organization_id = public.current_user_org_id()
);

-- Supabase Storage bucket for resumes
insert into storage.buckets (id, name, public)
select 'resumes', 'resumes', false
where not exists (
  select 1 from storage.buckets where id = 'resumes'
);

-- Storage policies for the resumes bucket
create policy storage_select_resumes
on storage.objects
for select
to authenticated
using (
  bucket_id = 'resumes'
  and split_part(name, '/', 1) = coalesce(public.current_user_org_id()::text, '')
);

create policy storage_insert_resumes
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'resumes'
  and split_part(name, '/', 1) = coalesce(public.current_user_org_id()::text, '')
);

create policy storage_update_resumes
on storage.objects
for update
to authenticated
using (
  bucket_id = 'resumes'
  and split_part(name, '/', 1) = coalesce(public.current_user_org_id()::text, '')
)
with check (
  bucket_id = 'resumes'
  and split_part(name, '/', 1) = coalesce(public.current_user_org_id()::text, '')
);

create policy storage_delete_resumes
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'resumes'
  and split_part(name, '/', 1) = coalesce(public.current_user_org_id()::text, '')
);
