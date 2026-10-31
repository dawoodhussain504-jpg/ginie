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
feat/phase-1-core-crm-discovery (merged via PR #1)

---

## CP-002 — Phase 2 WhatsApp Bridge, Communication, Quotations & Invoices, Custom Fields, Web Forms & Reports — 2026-10-31 — Status: implemented
**Summary:**
Implemented Phase 2 modules and infrastructure:
1. **WhatsApp Subsystem & Baileys Bridge Container (`apps/whatsapp-bridge` & `apps/api/src/modules/whatsapp`):**
   - Pluggable `WhatsAppProvider` interface (`sendText`, `sendMedia`, `setPresence`, `markRead`, `getStatus`) with two implementations: `CloudApiProvider` (official Meta Cloud API) and `BridgeProvider` (Baileys daemon).
   - Dedicated `apps/whatsapp-bridge` container running lightweight Express + Baileys pairing daemon with Dockerfile.
   - UI screen: "Link your WhatsApp (scan the code with your phone)" with live QR code display, status badge, warning notice, and unlink button.
   - Live chat messages history with delivery status and outgoing compose form.
2. **Human-like Delayed Auto-Reply Engine (Section 5.8.1):**
   - Implemented all 12 human-like auto-reply rules:
     - Randomized delay drawn fresh each time (8–45s log-normal with jitter).
     - Read receipt delay (2–15s).
     - Typing indicator proportional to reply length (4–7 cps, min 3s, max 25s).
     - Natural variety with random wording variant selection.
     - Human takeover detection (pauses auto-reply for 12 hours if an agent replies manually).
     - Hourly cap per contact (max 5) and skip rules.
     - Opt-out stop keyword detection (`STOP`, `UNSUBSCRIBE`, `बंद`) adding numbers to `whatsapp_optouts`.
3. **Website Public Email Crawler (`apps/worker/src/jobs/website-crawler.job.ts`):**
   - Background worker job (`website.crawl`) crawling discovered business websites (`/contact`, `/about`, `/contact-us`) for public emails.
   - Respects 6s timeout, 4-page limit, and polite User-Agent (`GinieBot/1.0`).
4. **Extra Details (Custom Fields) & Web Forms Lead Capture (`/forms` & `/forms/view/:id`):**
   - Extra details builder for Potential Customers and Sales (text, number, date, dropdown, boolean).
   - Website form builder with copyable public embed link.
   - Public responsive form viewer (`/forms/view/:id`) that automatically converts website inquiries into Potential Customers.
5. **Products, Quotations & Invoices (`/billing`):**
   - Products & services catalogue with Indian GST tax rates (18%).
   - Price quote builder calculating subtotal, GST, and total in Indian Rupees (`₹`).
   - One-click quotation to invoice conversion.
   - Invoice list with payment tracking ("Mark as Paid").
6. **Reports & Insights (`/reports`):**
   - Customer acquisition sources pie chart (Direct, Google Maps, Website Form, Referral).
   - Sales conversion funnel overview.
   - Team performance leaderboard with won sales and revenue in ₹.
7. **Infrastructure as Code:**
   - Production Docker Compose (`docker/docker-compose.prod.yml`) orchestrating `caddy`, `web`, `api`, `worker`, `whatsapp-bridge` with health checks, restart policies, and log rotation.
   - Caddyfile for automatic HTTPS on `ginie.space`.
   - `render.yaml` for Render cloud deployment.

**Files changed:**
- `packages/database/prisma/schema.prisma` (added WhatsApp, Billing, Custom Fields, Web Forms models)
- `packages/common/src/index.ts` (added Phase 2 DTOs, schemas, and provider interfaces)
- `packages/i18n/src/locales/en.json` & `hi.json` (Phase 2 plain-language strings)
- `apps/api/src/modules/whatsapp/**` (WhatsApp controllers, services, bridge & cloud providers)
- `apps/api/src/modules/billing/**` (Products, quotations, invoices)
- `apps/api/src/modules/forms/**` (Custom fields & web forms)
- `apps/api/src/modules/reports/**` (Analytics & reports)
- `apps/worker/src/jobs/website-crawler.job.ts` (Website crawler)
- `apps/whatsapp-bridge/**` (Baileys bridge daemon container)
- `apps/web/src/app/(dashboard)/whatsapp/page.tsx`
- `apps/web/src/app/(dashboard)/billing/page.tsx`
- `apps/web/src/app/(dashboard)/forms/page.tsx`
- `apps/web/src/app/forms/view/[id]/page.tsx`
- `apps/web/src/app/(dashboard)/reports/page.tsx`
- `docker/docker-compose.prod.yml`, `docker/Caddyfile`, `render.yaml`
- `docs/PROJECT_STATE.md`, `docs/CHANGELOG.md`

**Migrations:**
Prisma schema expanded and client generated.

**Related decisions/changes:**
ADR-001, ADR-002, ADR-004, ADR-005, ADR-007.

**PR / commit:**
feat/phase-2-whatsapp-communication-billing
