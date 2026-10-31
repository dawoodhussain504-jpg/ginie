# GINIE Architecture Decision Records (ADR) & Decisions Log

This document records the architectural, technical, and operational decisions made for GINIE.
**Rule:** This file is **append-only**. Old decisions are never erased or rewritten. If a decision is changed or superseded, it must be marked as "Superseded by CP-xxx / ADR-yyy" with the rationale.

---

## ADR-001: Monorepo Structure with pnpm / Turborepo
- **Date:** 2026-10-31
- **Status:** Proposed (Phase 0)
- **Context:** GINIE requires a Next.js (antd v5) frontend, a NestJS REST API, a dedicated NestJS pg-boss background worker, a WhatsApp bridge container (Baileys), and shared Prisma database models, types, and validation schemas.
- **Decision:** Use a clean, modular monorepo structure:
  - `apps/web`: Next.js 14/15 App Router with Ant Design v5, `@ant-design/pro-components`, i18n.
  - `apps/api`: NestJS API application handling auth, multi-tenant controllers, and services.
  - `apps/worker`: NestJS worker service consuming `pg-boss` queues (Lead discovery, website email crawler, WhatsApp jobs).
  - `apps/whatsapp-bridge`: Dedicated Node.js service using Baileys daemon, communicating with the API via HMAC-signed webhook.
  - `packages/database`: Prisma schema, migrations, seed scripts, and client extension for tenant isolation.
  - `packages/common`: Shared TypeScript interfaces, DTOs, Zod schemas, plain-language constants.
- **Consequences:** Code sharing between API, worker, and frontend is seamless. Single `pnpm install` and synchronized TypeScript definitions prevent drift.

---

## ADR-002: Single Source of Truth for Database Schema & Supabase RLS
- **Date:** 2026-10-31
- **Status:** Proposed (Phase 0)
- **Context:** Section 1.2 requires deciding the database change approach. We use Supabase (managed PostgreSQL) purely as PostgreSQL + Storage.
- **Decision:**
  1. Table structures, relationships, columns, and foreign keys are strictly managed via **Prisma Migrations** (`prisma migrate dev` / `prisma migrate deploy`). Direct connection (`DIRECT_URL`, port 5432) is used for running migrations.
  2. Supabase-specific configurations, such as PostgreSQL extensions (`pgcrypto`, `pg_trgm`), Storage bucket creation (`tenant-logos`, `attachments`, `invoices`), and Row Level Security (RLS) policies are maintained as version-controlled SQL files in `supabase/migrations/`.
  3. No database changes may be performed manually via web dashboards.
- **Consequences:** Reproducible, version-controlled migrations across dev, staging, and production environments.

---

## ADR-003: Strict Multi-Tenant Isolation Strategy (Two-Tier Defense)
- **Date:** 2026-10-31
- **Status:** Proposed (Phase 0)
- **Context:** GINIE is a multi-tenant SaaS platform where every business entity belongs to a `tenant_id`. Data leaks between tenants are unacceptable.
- **Decision:** Implement two complementary layers of tenant isolation:
  - **Layer 1 (Application Layer - Primary):** NestJS execution context extracts `tenant_id` from the verified JWT / session. A custom Prisma Client extension automatically appends `where: { tenant_id }` to all find/update/delete operations and automatically populates `data: { tenant_id }` on create operations.
  - **Layer 2 (Database Layer - Secondary):** Row-Level Security (RLS) is enabled on all business tables in PostgreSQL. When queries run in tenant context, the tenant identifier is set via PostgreSQL session variables (`SET LOCAL app.current_tenant_id = '...'`).
- **Consequences:** Even if an engineer writes a query omitting `tenant_id`, the Prisma extension and database RLS prevent cross-tenant data exposure.

---

## ADR-004: Deployment Target & Hosting Architecture
- **Date:** 2026-10-31
- **Status:** Proposed (Phase 0)
- **Context:** Section 3, 3.1, and 1.2 outline two deployment possibilities: Docker deployment on a VPS behind Nginx/Caddy and Render services via `render.yaml`.
- **Decision:**
  1. **Primary Production Architecture:** Docker Compose on VPS (`docker-compose.prod.yml`) behind Caddy/Nginx reverse proxy, fronted by Cloudflare (DNS proxy, SSL Full (Strict), WAF, CDN). Services: `web`, `api`, `worker`, `whatsapp-bridge`, `caddy`.
  2. **Alternative Cloud Support:** Maintain `render.yaml` defining always-on services (`api`, `worker`, `whatsapp-bridge`, `web`) so the application can also be deployed to Render when preferred.
  3. The database remains managed externally on Supabase (Mumbai ap-south-1).
- **Consequences:** High cost-efficiency on VPS, zero vendor lock-in, easy migration between Docker host and Render.

---

## ADR-005: Background Jobs & Queues with pg-boss (No Redis)
- **Date:** 2026-10-31
- **Status:** Proposed (Phase 0)
- **Context:** Background jobs (Lead discovery, website crawler for email extraction, WhatsApp scheduled auto-replies) need reliable asynchronous processing. Section 3 specifies: no Redis, use `pg-boss`.
- **Decision:** Use `pg-boss` running on the Supabase PostgreSQL direct connection (port 5432).
  - Wrap queue operations behind a generic `QueueService` interface (`publish`, `subscribe`, `scheduleWithDelay`) so that if high scale eventually requires BullMQ + Redis, application code remains unchanged.
  - Run queue workers in a separate dedicated process/container (`apps/worker`).
- **Consequences:** Eliminates the operational overhead and cost of managing a Redis instance during initial phases while guaranteeing transactional consistency in Postgres.

---

## ADR-006: CLI-First Tooling and Environment Strategy
- **Date:** 2026-10-31
- **Status:** Proposed (Phase 0)
- **Context:** Section 1.2 requires CLI-first development, repeatable automation, and three distinct environments.
- **Decision:**
  - Environments: `dev` (default), `staging`, `production`.
  - Tools: GitHub CLI (`gh`), Supabase CLI (`supabase`), Cloudflare CLI (`wrangler`), Docker (`docker`), Render CLI (`render`).
  - All secret keys are configured through environment variables or GitHub Actions Secrets; never printed, never committed.
  - Risky actions require preview (`diff`) and explicit user approval before execution.

---

## ADR-007: Plain-Language UI and i18n Architecture
- **Date:** 2026-10-31
- **Status:** Proposed (Phase 0)
- **Context:** Section 15 mandates that everything visible to the user must be in simple, everyday words with no developer or technical jargon, supporting both English and Hindi (`en_US`, `hi_IN`).
- **Decision:**
  - All user-facing strings are strictly extracted into translation files (`packages/i18n/src/locales/en.json` and `hi.json`).
  - No hardcoded English or developer terms in UI components.
  - Lint/CI rule or unit check to verify no banned terms (e.g. "Lead", "Tenant", "Webhook", "API key", "Quota") appear in user-facing translation keys without using the approved plain-language vocabulary.
