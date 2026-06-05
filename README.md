# TalentForge AI

TalentForge AI is a split frontend/backend monorepo for an AI-powered recruiting platform built with React, Vite, TypeScript, Node.js, Express, and Supabase.

## Stack
- Frontend: React, Vite, TypeScript, Tailwind CSS, Framer Motion, React Router DOM, TanStack Query
- Backend: Node.js, Express, TypeScript, JWT auth, RBAC, REST APIs
- Data: Supabase PostgreSQL, Supabase Auth, Supabase Storage, Supabase RLS, Supabase Realtime

## Project layout
- `frontend/` - Vite UI application
- `backend/` - Express API server
- `shared/` - shared types and schemas
- `docs/` - architecture and database SQL

## Setup
1. Fill in the `.env` file in the project root with your secrets.
2. Install dependencies with `npm install` from the repo root.
3. Start both apps with `npm run dev`.

## Notes
- The current scaffold includes the app shell, route structure, and schema definitions.
- Run `docs/database.sql` in the Supabase SQL editor, then optionally run `docs/seed.sql` to load a demo org, admin user, job, candidate, and application.
- The database now uses org-aware RLS, Supabase Storage bucket policies for resumes, and `auth_user_id` mapping for Supabase Auth users.
