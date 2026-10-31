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
feat/phase-2-whatsapp-communication-billing (merged via PR #2)

---

## CP-003 — Phase 3 Workflow Automation, AI Features, Subscription Billing, Super Admin & Audit Logs — 2026-10-31 — Status: implemented
**Summary:**
Implemented all Phase 3 milestones and complete production capabilities:
1. **Auto Actions (Workflow Automation Engine):**
   - No-code visual trigger-condition-action workflow builder (`apps/api/src/modules/automations` & `/automations`).
   - Trigger events: `customer.created`, `deal.stage_changed`, `task.overdue`, `form.submitted`.
   - Condition evaluation: `equals`, `not_equals`, `contains`, `greater_than`, `less_than`.
   - Automated actions: `send_whatsapp`, `create_task`, `assign_owner`, and `webhook`.
   - Execution run logs tracking status (`success` / `failed`) with dry-run simulator.
2. **AI Intelligence (Provider-Agnostic Layer):**
   - Provider-agnostic abstraction (`AiProvider` interface) supporting fallback heuristic analysis engine, OpenAI, and Gemini (`apps/api/src/modules/ai`).
   - Customer scoring: calculates 0-100 score, categorizes as Hot / Warm / Cold, and explains plain-language reasoning.
   - Smart reply generator: context-aware WhatsApp/Email drafting across 4 tones (Friendly, Professional, Urgent, Persuasive) with one-click copy and WhatsApp launch.
   - Call note summarizer: extracts key discussion points, sentiment (Positive, Neutral, Concerning), and recommends next steps.
3. **SaaS Subscription Billing & Usage Limits:**
   - Multi-tier SaaS plans: Free Starter, Pro Growth (₹2,999/mo), Enterprise (₹4,999/mo).
   - Usage meters tracking customers, Google Maps discovery searches, and team member seats (`/subscriptions`).
   - Razorpay (India) & Stripe (International) payment checkout integration.
4. **Owner Control Panel (Platform Super Admin):**
   - Platform owner dashboard (`/admin`) protected by `AdminGuard` (`isSuperAdmin: true`).
   - Platform metrics: Total registered companies, active team members, total searches, and gross revenue.
   - Company account actions: instant account pause / activation and subscription plan allocation.
5. **Activity History & Audit Logs:**
   - Dedicated `audit_logs` tracking sensitive entity modifications (customers, sales, invoices, settings).
   - Activity history timeline (`/audit-logs`) with before/after state diff inspection drawer.
6. **Plain-Language UI Rule & Localization:**
   - 100% compliant English (`en.json`) and Hindi (`hi.json`) translations for all new Phase 3 features.
7. **Monorepo Build & Isolation Verification:**
   - All 7 workspace packages and all 21 Next.js App Router pages compile and build cleanly with 0 errors.
   - Multi-tenant isolation verified with automated test suite.

**Files changed:**
- `packages/database/prisma/schema.prisma` (added `Workflow`, `WorkflowRun`, `AuditLog`, `Subscription`, `PaymentRecord` models, added `isSuperAdmin` to `User`, added AI fields to `Lead`)
- `packages/database/prisma/seed.ts` (added Enterprise plan and marked owner user as `isSuperAdmin: true`)
- `packages/common/src/index.ts` (added Phase 3 DTOs, schemas, and types)
- `packages/i18n/src/locales/en.json` & `hi.json` (added Phase 3 plain-language strings and nav keys)
- `apps/api/src/app.module.ts`, `apps/api/src/common/zod-validation.pipe.ts`
- `apps/api/src/modules/automations/**` (Automations module, controller, service)
- `apps/api/src/modules/ai/**` (AI module, controller, service, fallback provider)
- `apps/api/src/modules/subscriptions/**` (Subscriptions module, controller, service)
- `apps/api/src/modules/admin/**` (Admin module, controller, service, guard)
- `apps/api/src/modules/audit/**` (Audit module, controller, service)
- `apps/web/src/app/(dashboard)/layout.tsx` (added navigation links and icons)
- `apps/web/src/app/(dashboard)/automations/page.tsx` (Auto Actions builder)
- `apps/web/src/app/(dashboard)/subscriptions/page.tsx` (Plans & Billing)
- `apps/web/src/app/(dashboard)/audit-logs/page.tsx` (Activity History)
- `apps/web/src/app/(dashboard)/admin/page.tsx` (Owner Control Panel)
- `apps/web/src/app/(dashboard)/customers/page.tsx` (Integrated AI scoring, drafting, and summarization)
- `docs/PROJECT_STATE.md`, `docs/DECISIONS.md`, `docs/CHANGELOG.md`

**Migrations:**
Prisma client generated and seed script updated.

**Related decisions/changes:**
ADR-001, ADR-002, ADR-003, ADR-004, ADR-005, ADR-007, ADR-008, ADR-009.

**PR / commit:**
feat/phase-3-automation-ai-billing


---

## CP-004 — Single-Admin Private Mode & Unlimited Sovereign Access — 2026-10-31 — Status: implemented
**Summary:**
Converted the platform from public multi-tenant SaaS into a dedicated Single-Owner Private Cockpit:
1. **Public Registration Disabled:**
   - Disabled `/api/auth/register` with `ForbiddenException`.
   - Updated `/register` page to a locked information screen directing users back to Admin login.
   - Removed register CTA from `/login` and restyled login screen for Master Administrator Cockpit.
2. **Unlimited Sovereign Access:**
   - Removed search quota ceiling in `apps/api/src/modules/discovery/discovery.service.ts` so Google Places Lead Discovery searches are unlimited.
   - Updated `/find-customers` UI to display active Master Admin Unlimited status instead of quota limit bar.
3. **Subscriptions Replaced with Sovereign License Overview:**
   - Transformed `/subscriptions` from a SaaS paywall into a Sovereign License overview displaying lifetime ₹0 fee and unlocked limits.
4. **Owner Panel Permanent Access:**
   - Updated `apps/web/src/app/(dashboard)/layout.tsx` so Master Admin Panel (`/admin`) is permanently available in the sidebar navigation.

**Files changed:**
- `apps/api/src/modules/auth/auth.controller.ts`
- `apps/api/src/modules/auth/auth.service.ts`
- `apps/api/src/modules/discovery/discovery.service.ts`
- `apps/api/src/modules/subscriptions/subscriptions.service.ts`
- `apps/web/src/app/(auth)/login/page.tsx`
- `apps/web/src/app/(auth)/register/page.tsx`
- `apps/web/src/app/(dashboard)/find-customers/page.tsx`
- `apps/web/src/app/(dashboard)/layout.tsx`
- `apps/web/src/app/(dashboard)/subscriptions/page.tsx`
- `docs/PROJECT_STATE.md`, `docs/CHANGELOG.md`

**Migrations:**
None.

**Related decisions/changes:**
ADR-001, ADR-002, CP-001, CP-003.

**PR / commit:**
main

---

## CP-005 — Dynamic UPI QR Invoicing, Direct WhatsApp Pitch Outreach, and Google Gemini AI Integration — 2026-10-31 — Status: implemented
**Summary:**
Implemented key owner-focused workflow upgrades to maximize high-conversion sales and instant payments for the sole admin:
1. **Dynamic UPI QR Code & WhatsApp Invoice Dispatch:**
   - Added `apps/web/src/lib/upi.ts` to build valid standard UPI payment URIs (`upi://pay?pa=...&pn=...&am=...&cu=INR&tn=...`) and generate scannable QR code images.
   - Enhanced `apps/web/src/app/(dashboard)/billing/page.tsx` with a dedicated "UPI QR & WhatsApp" modal on every invoice. Admin can configure & persist their receiving UPI ID (`VPA`) in real-time, view live QR codes with exact invoice amount & description, copy UPI payment deep links, and send pre-formatted invoices via 1-click WhatsApp link (`https://wa.me/...`).
2. **Direct WhatsApp Pitch Outreach Engine:**
   - Enhanced `apps/web/src/app/(dashboard)/customers/page.tsx` with a direct WhatsApp pitch launcher. Includes pre-crafted high-converting message templates (Introductory Greeting, Special Discount Offer, Gentle Follow-up) and 1-click WhatsApp Web launch.
   - Enhanced `apps/web/src/app/(dashboard)/find-customers/page.tsx` with an immediate "Pitch on WhatsApp" action button directly in the Google Maps search results table, eliminating friction before manual import.
3. **Google Gemini AI Copilot Integration:**
   - Implemented `GeminiAiProvider` (`apps/api/src/modules/ai/providers/gemini-ai.provider.ts`) connecting to Google Gemini 1.5 Flash API via REST (`generateContent`).
   - Upgraded `apps/api/src/modules/ai/ai.service.ts` to automatically prioritize Gemini for customer scoring (0-100), personalized smart replies across 4 tones, and call summary analysis when `GEMINI_API_KEY` or `AI_API_KEY` is configured, while retaining zero-config fallback heuristic engine when offline.

**Files changed:**
- `apps/api/src/modules/ai/ai.module.ts`
- `apps/api/src/modules/ai/ai.service.ts`
- `apps/api/src/modules/ai/providers/gemini-ai.provider.ts`
- `apps/web/src/app/(dashboard)/billing/page.tsx`
- `apps/web/src/app/(dashboard)/customers/page.tsx`
- `apps/web/src/app/(dashboard)/find-customers/page.tsx`
- `apps/web/src/lib/upi.ts`
- `docs/PROJECT_STATE.md`, `docs/CHANGELOG.md`

**Migrations:**
None.

**Related decisions/changes:**
ADR-008, CP-001, CP-002, CP-003, CP-004.

**PR / commit:**
main

