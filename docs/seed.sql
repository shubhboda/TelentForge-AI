insert into organizations (id, name, slug)
values ('11111111-1111-1111-1111-111111111111', 'TalentForge Demo Org', 'talentforge-demo')
on conflict (slug) do nothing;

insert into users (id, organization_id, email, full_name, role, auth_user_id, password_hash)
values (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'admin@talentforge.local',
  'TalentForge Admin',
  'admin',
  null,
  crypt('Admin@12345', gen_salt('bf'))
)
on conflict (email) do update
set full_name = excluded.full_name,
    role = excluded.role,
    organization_id = excluded.organization_id,
    password_hash = excluded.password_hash,
    updated_at = now();

insert into jobs (id, organization_id, created_by, title, description, department, location, stage, status)
values (
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'Senior Frontend Engineer',
  'Build the TalentForge recruiting dashboard and workflow surfaces.',
  'Engineering',
  'Remote',
  'screening',
  'open'
)
on conflict do nothing;

insert into candidates (id, organization_id, full_name, email, phone, source, current_score)
values (
  '44444444-4444-4444-4444-444444444444',
  '11111111-1111-1111-1111-111111111111',
  'Demo Candidate',
  'candidate@talentforge.local',
  '+91-9999999999',
  'manual',
  87.5
)
on conflict (organization_id, email) do update
set full_name = excluded.full_name,
    phone = excluded.phone,
    source = excluded.source,
    current_score = excluded.current_score,
    updated_at = now();

insert into applications (id, organization_id, job_id, candidate_id, stage, ai_rank)
values (
  '55555555-5555-5555-5555-555555555555',
  '11111111-1111-1111-1111-111111111111',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  'screening',
  91.25
)
on conflict (job_id, candidate_id) do update
set stage = excluded.stage,
    ai_rank = excluded.ai_rank,
    updated_at = now();
