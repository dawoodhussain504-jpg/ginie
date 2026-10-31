# GINIE Project State & Execution Log

**Current Phase:** Phase 1 — MVP Core CRM & Google Maps Lead Discovery (Completed)  
**Status:** Ready for Review / Phase 2 Preparation  
**Last Updated:** 2026-10-31  

---

## 1. Where the Project Stands

- **Done (Phase 0 & Phase 1):**
  - **Phase 0:** Completed architecture plan, ADR-001 through ADR-007, CLI setup, risk analysis, and user approval received.
  - **Milestone 1.1 — Monorepo & Database:** Configured pnpm monorepo (`apps/api`, `apps/web`, `apps/worker`, `packages/database`, `packages/common`, `packages/i18n`). Prisma schema created for all multi-tenant models (`tenants`, `users`, `roles`, `lead_statuses`, `leads`, `contacts`, `companies`, `pipelines`, `pipeline_stages`, `deals`, `tasks`, `activities`, `discovery_searches`, `discovery_results`, `usage_counters`). Seed script ready (`admin@ginie.space` / `Admin@123`, demo company "Acme Enterprises", sample customers, deals, and discovery results).
  - **Milestone 1.2 — Multi-Tenant Auth:** NestJS API with JWT authentication, register, login, refresh, tenant scoping, and role permissions.
  - **Milestone 1.3 — Home (Dashboard):** Responsive Ant Design layout, brand theming, light/dark mode, KPI cards (new potential customers, active sales, won revenue, tasks due today), and sales funnel chart.
  - **Milestone 1.4 — Potential Customers (Leads):** ProTable with search and status filters, activity timeline drawer (notes, tasks), Excel upload/download, duplicate detection (phone, email, place_id), and lead conversion.
  - **Milestone 1.5 — Sales Steps (Deals Kanban) & Tasks:** Drag-and-drop board view, stage value calculation in Indian Rupees (₹), win/loss reason capture, task follow-up reminders.
  - **Milestone 1.6 — Find New Customers (Google Places Lead Discovery — KEY FEATURE):** Text Search endpoint integration (`POST places:searchText`) with cost-controlling field masks, quota counters, search progress indicator, results grid with Google Maps link and map pin modal, bulk "Add to Customers", and duplicate suppression.
  - **Milestone 1.7 — Verification & Tests:** All packages and apps (`apps/api`, `apps/web`, `apps/worker`, `@ginie/database`, `@ginie/common`, `@ginie/i18n`) build cleanly with 0 errors. Multi-tenant isolation verification test passed.
- **In Progress:**
  - Branch `feat/phase-1-core-crm-discovery` pushed to GitHub repository `dawoodhussain504-jpg/ginie`.
  - Pull Request opened for Phase 1.
- **Next Up (Phase 2):**
  - Website crawler background job for public contact email extraction (`website-crawler.job.ts`).
  - WhatsApp Business Cloud API integration and message timeline.
  - WhatsApp Web Bridge (`whatsapp-bridge` container with Baileys, encrypted session in PostgreSQL, human-like randomized delays 8–45s, typing speed emulation, business hours, and opt-out).
  - Extra Details (Custom fields builder) and public embeddable web forms.
  - Products catalogue, quotations, invoices, and PDF generation with tenant logo.
  - Reports & insights module.
- **Blockers:**
  - None.

---

## 2. Environment & Build Verification

| Package / App | Stack | Build Status | Verification |
|---|---|---|---|
| `@ginie/common` | TypeScript, Zod | ✓ Passing | Shared DTOs, schemas, constants |
| `@ginie/i18n` | TypeScript | ✓ Passing | English (`en.json`) & Hindi (`hi.json`) |
| `@ginie/database` | Prisma, PostgreSQL | ✓ Passing | Schema, seed script, tenant isolation test passed |
| `apps/api` | NestJS, JWT | ✓ Passing | Full REST API, tenant guard, error masking |
| `apps/worker` | NestJS, pg-boss | ✓ Passing | Background queue consumer |
| `apps/web` | Next.js 14, Antd v5 | ✓ Passing | All 13 routes prerendered & optimized |

---

## 3. How to Run

```bash
# 1. Install dependencies
npx pnpm install

# 2. Configure environment variables
cp .env.example .env

# 3. Apply database migrations & seed demo data
npx pnpm --filter @ginie/database run generate
npx pnpm --filter @ginie/database run seed

# 4. Start development services
# API: http://localhost:4000
# Web: http://localhost:3000
# Worker: Background queue
npm run dev
```

---

## 4. Session Hand-Over Notes

Phase 1 has been completed and verified. Demo user credentials seeded: `admin@ginie.space` / `Admin@123`. When the user is ready, we will propose the short plan for Phase 2 (WhatsApp Bridge, Website Crawler, Products, Invoices, and Custom Fields) and proceed upon approval.
