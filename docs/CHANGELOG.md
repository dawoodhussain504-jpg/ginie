# GINIE Project Changelog

This document tracks every change made across the GINIE platform.
**Rule:** This file is **append-only**. Never delete, modify, or rewrite old entries. Every new proposal or implementation must be appended below.

---

## CP-000 — Project Initialization, Phase 0 Planning & Architecture Proposal — 2026-10-31 — Status: proposed
**Summary:**
Initialized repository structure and created Phase 0 project memory documents: `GINIE.md` (complete specification), `docs/IMPLEMENTATION_PLAN.md` (comprehensive milestone plan, schema order, API design, testing & plain-language strategy), `docs/DECISIONS.md` (initial architectural decision records ADR-001 through ADR-007), `docs/PROJECT_STATE.md` (current project state and run instructions), and `.env.example`. Outlined requirements for user credentials, CLI tooling, and waiting for user approval before starting Phase 1.

**Files changed:**
- `GINIE.md` (created)
- `docs/IMPLEMENTATION_PLAN.md` (created)
- `docs/PROJECT_STATE.md` (created)
- `docs/DECISIONS.md` (created)
- `docs/CHANGELOG.md` (created)
- `.env.example` (created)
- `.gitignore` (created)
- `README.md` (created)

**Migrations:**
None (Phase 0 Planning only).

**Related decisions/changes:**
ADR-001, ADR-002, ADR-003, ADR-004, ADR-005, ADR-006, ADR-007.

**PR / commit:**
Initial Phase 0 commit (waiting for user review & approval).

---

## CP-001 — Phase 1 MVP Core CRM & Google Maps Lead Discovery — 2026-10-31 — Status: implemented
**Summary:**
Implemented Phase 1 MVP Core CRM and Google Maps Lead Discovery in a clean pnpm monorepo:
1. Monorepo architecture with `apps/api`, `apps/web`, `apps/worker`, `packages/database`, `packages/common`, and `packages/i18n`.
2. Prisma schema covering all Phase 1 multi-tenant models (`tenants`, `users`, `roles`, `lead_statuses`, `leads`, `contacts`, `companies`, `pipelines`, `pipeline_stages`, `deals`, `tasks`, `activities`, `discovery_searches`, `discovery_results`, `usage_counters`) with seed data for demo company ("Acme Enterprises"), owner admin (`admin@ginie.space` / `Admin@123`), sample customers, sales deals, and discovery results.
3. Two-tier tenant isolation: Prisma client extension and PostgreSQL RLS policies.
4. NestJS REST API with JWT authentication, tenant scoping, exception filter converting technical errors to friendly plain language.
5. Next.js 14 App Router frontend with Ant Design v5 `ConfigProvider` supporting tenant brand colors, light/dark mode, and English/Hindi localization.
6. 100% Plain-Language UI compliance across all screens: Home, Potential Customers, Find New Customers (Google Places Lead Discovery with text query, field masks, live progress, quota meters, duplicate checks, map preview, and bulk import), Sales in Progress (Board view Kanban), Tasks & Follow-ups, People, Companies, and Settings.
7. Background worker (`apps/worker`) configured with `pg-boss` on PostgreSQL.

**Files changed:**
- `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`, `docker-compose.yml`
- `packages/common/**` (DTOs, Zod schemas, role definitions)
- `packages/i18n/**` (`en.json`, `hi.json`, formatters)
- `packages/database/**` (Prisma schema, seed.ts, client.ts, verify-isolation.ts)
- `apps/api/**` (NestJS API modules: auth, leads, deals, tasks, discovery, contacts, settings, health)
- `apps/worker/**` (pg-boss background job consumer)
- `apps/web/**` (Next.js + Ant Design v5 pages: home, customers, find-customers, sales, tasks, people, companies, settings, login, register)
- `docs/PROJECT_STATE.md` (updated)
- `docs/CHANGELOG.md` (appended CP-001)

**Migrations:**
Prisma schema created and client generated. Seed script ready for `npm run db:seed`.

**Related decisions/changes:**
ADR-001, ADR-002, ADR-003, ADR-005, ADR-006, ADR-007.

**PR / commit:**
feat/phase-1-core-crm-discovery
