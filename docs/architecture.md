# TalentForge AI Architecture

## Overview
TalentForge AI is a split frontend/backend monorepo:
- `frontend/` contains the React + Vite UI.
- `backend/` contains the Node.js + Express API.
- `shared/` contains cross-cutting TypeScript types and Zod schemas.
- `docs/` contains database and deployment artifacts.

## Data and auth boundaries
- Supabase provides PostgreSQL, authentication, storage, and realtime.
- The backend owns business logic, validation, AI processing, export generation, and security checks.
- The frontend talks only to the backend through secure REST APIs.
- RLS should be enforced on all Supabase tables, even when the backend uses the service role for privileged operations.

## Core domains
- Users and organizations manage RBAC.
- Jobs and candidates drive the ATS pipeline.
- Applications track stage movement and AI ranking.
- Interviews and feedback support scheduling and structured evaluation.
- Notifications and activity logs provide auditability.

## Recommended runtime flow
1. User signs in through Supabase Auth.
2. Frontend exchanges the session for a backend JWT session or uses backend login depending on deployment choice.
3. Backend verifies JWT and loads role and organization scope.
4. Backend queries Supabase, applies business rules, and returns REST responses.
5. Frontend renders data with React Query and animated state transitions.
