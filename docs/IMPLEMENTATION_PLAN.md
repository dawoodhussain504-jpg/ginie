# GINIE — Master Implementation Plan (Phase 0 to Phase 3)

**Document Version:** 1.0.0  
**Status:** Awaiting User Approval (Phase 0)  
**Target Domain:** https://ginie.space  
**Product:** Multi-Tenant CRM SaaS with Google Maps Lead Discovery, WhatsApp Bridge & Automation  

---

## 1. Executive Summary & Core Principles

GINIE is a multi-tenant, multi-industry CRM designed for simplicity, ease of use, and automated outreach. normal users see zero developer jargon (strict compliance with the Plain-Language UI Guide). Behind the scenes, the system enforces multi-tenant data isolation at both the application and database tiers, queues all background operations via PostgreSQL (`pg-boss`), and abstracts communication through pluggable interfaces.

### Non-Negotiable Rules
1. **Multi-tenancy from Day One:** Every business table has a `tenant_id` foreign key. Every Prisma query and database operation is scoped by `tenant_id`.
2. **Plain-Language UI Rule:** Every visible label, error message, button, and notification must use simple, everyday language (e.g. "Potential customer" instead of "Lead", "Home" instead of "Dashboard", "Find new customers" instead of "Lead Discovery").
3. **No Secret Leaks:** Third-party API keys (Google Places, Meta WhatsApp, SMTP, Stripe/Razorpay) remain exclusively on the server in `.env`.
4. **CLI-First Reproducibility:** All migrations, deployment manifests, Docker containers, and configurations live as code in the repository.
5. **Phase-by-Phase Delivery:** No code is written for a phase until the previous phase is completed, tested, and documented.

---

## 2. Monorepo & Folder Structure

We use a modular TypeScript monorepo with `pnpm` workspaces (compatible with Turborepo or npm workspaces):

```
ginie/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # Run lint, typecheck, unit & isolation tests
│       ├── deploy-staging.yml      # Automated staging deploy via CLI/Docker
│       └── deploy-prod.yml         # Manual-approval production deploy
├── apps/
│   ├── web/                       # Frontend: Next.js (App Router) + Ant Design v5
│   │   ├── src/
│   │   │   ├── app/               # Routes: (auth), (dashboard), (public-forms)
│   │   │   ├── components/        # Ant Design wrapped components (plain-language)
│   │   │   ├── hooks/             # Custom React hooks (auth, tenant, permissions)
│   │   │   ├── lib/               # API client, formatting helpers (currency ₹, dates)
│   │   │   └── providers/         # Antd ConfigProvider (theming, en_US / hi_IN)
│   │   ├── public/                # Static assets, logos
│   │   └── package.json
│   ├── api/                       # Backend: NestJS REST API
│   │   ├── src/
│   │   │   ├── common/            # Tenant context middleware, guards, interceptors
│   │   │   ├── modules/
│   │   │   │   ├── auth/          # JWT auth, register, login, invites, 2FA
│   │   │   │   ├── tenants/       # Tenant management & settings
│   │   │   │   ├── leads/         # Potential customers CRUD, timeline, import/export
│   │   │   │   ├── contacts/      # People & company records
│   │   │   │   ├── deals/         # Sales steps (Pipelines & Kanban stages)
│   │   │   │   ├── tasks/         # Tasks, reminders, follow-ups
│   │   │   │   ├── discovery/     # Google Places API integration & search jobs
│   │   │   │   ├── whatsapp/      # WhatsApp Cloud API & Bridge webhook handlers
│   │   │   │   ├── communication/ # Email SMTP, templates, call logs
│   │   │   │   ├── quotations/    # Products, quotes, invoices, PDF generator
│   │   │   │   ├── workflows/     # Automation engine (trigger-condition-action)
│   │   │   │   └── admin/         # Super Admin (owner panel)
│   │   │   └── main.ts
│   │   └── package.json
│   ├── worker/                    # NestJS Background Worker (pg-boss consumers)
│   │   ├── src/
│   │   │   ├── jobs/
│   │   │   │   ├── discovery.job.ts        # Google Places search & deduplication
│   │   │   │   ├── website-crawler.job.ts  # Website public email extractor
│   │   │   │   ├── whatsapp-reply.job.ts   # Human-like delayed WhatsApp replies
│   │   │   │   └── email-campaign.job.ts   # Throttled email delivery
│   │   │   └── main.ts
│   │   └── package.json
│   └── whatsapp-bridge/           # Baileys WhatsApp Web daemon container
│       ├── src/
│       │   ├── session-store.ts   # Database-persisted session credentials
│       │   ├── bridge-server.ts   # QR pairing API & inbound webhook forwarder
│       │   └── index.ts
│       ├── Dockerfile
│       └── package.json
├── packages/
│   ├── database/                  # Prisma ORM & Supabase configs
│   │   ├── prisma/
│   │   │   ├── schema.prisma      # Centralized database schema
│   │   │   ├── seed.ts            # Seed script: Demo tenant, admin, sample data
│   │   │   └── migrations/        # Standard Prisma migrations
│   │   ├── supabase/
│   │   │   └── migrations/        # RLS policies, pgcrypto, pg_trgm, storage buckets
│   │   └── src/
│   │       ├── client.ts          # Tenant-enforced Prisma Client extension
│   │       └── index.ts
│   ├── common/                    # Shared types, Zod schemas, DTOs, constants
│   │   └── src/
│   └── i18n/                      # Plain-language dictionary files
│       ├── src/
│       │   ├── locales/
│       │   │   ├── en.json        # English plain-language dictionary
│       │   │   └── hi.json        # Hindi plain-language dictionary
│       │   └── index.ts
├── docs/                          # Project permanent memory
│   ├── GINIE.md
│   ├── IMPLEMENTATION_PLAN.md
│   ├── PROJECT_STATE.md
│   ├── CHANGELOG.md
│   ├── DECISIONS.md
│   └── MANUAL_STEPS.md
├── docker/
│   ├── Caddyfile                  # Caddy reverse proxy config (production SSL)
│   ├── nginx.conf                 # Optional Nginx alternative
│   └── docker-compose.prod.yml    # Production container orchestration
├── docker-compose.yml             # Local development services (Postgres, Mock S3)
├── render.yaml                    # Alternative Render infrastructure-as-code
├── .env.example
├── README.md
└── pnpm-workspace.yaml
```

---

## 3. Database Schema & Migration Order

Migrations will be authored in strict dependency order via Prisma (`packages/database/prisma/schema.prisma`), backed by PostgreSQL extensions and RLS policies in `packages/database/supabase/migrations/`:

### Migration Execution Sequence
1. **Migration 01 — Extensions & Platform Base:**
   - Extensions: `pgcrypto` (UUID generation), `pg_trgm` (fuzzy search on names, phones, emails).
   - `plans` (id, name, monthly_price, limits JSONB, is_active).
   - `tenants` (id, name, slug, logo_url, plan_id, status, settings JSONB, created_at, updated_at).
   - `roles` (id, tenant_id, name, permissions JSONB, is_system, created_at).
   - `users` (id, tenant_id, name, email, phone, password_hash, role_id, status, last_login_at, language, two_factor_secret).

2. **Migration 02 — Configuration & Core CRM Entities:**
   - `lead_statuses` (id, tenant_id, name, color, order_index, is_default).
   - `leads` (id, tenant_id, name, company_name, phone, email, website, address, city, state, country, pincode, lat, lng, google_place_id, source, status_id, owner_id, score, tags JSONB, custom_fields JSONB, created_by).
   - `companies` (id, tenant_id, name, website, industry, address, custom_fields JSONB, created_by).
   - `contacts` (id, tenant_id, company_id, name, phone, email, designation, custom_fields JSONB, created_by).
   - Indexes: `(tenant_id, phone)`, `(tenant_id, email)`, `(tenant_id, google_place_id)`, `(tenant_id, status_id)`.

3. **Migration 03 — Sales Pipeline & Deals:**
   - `pipelines` (id, tenant_id, name, is_default).
   - `pipeline_stages` (id, tenant_id, pipeline_id, name, probability, order_index, color).
   - `deals` (id, tenant_id, title, value, currency, stage_id, pipeline_id, contact_id, company_id, owner_id, expected_close, status, lost_reason).

4. **Migration 04 — Engagement, Tasks & Activity Timeline:**
   - `tasks` (id, tenant_id, title, description, due_at, priority, status, assignee_id, entity_type, entity_id).
   - `activities` (id, tenant_id, entity_type, entity_id, type [note/call/email/whatsapp/task/status], content, meta JSONB, user_id).

5. **Migration 05 — Lead Discovery (Google Places):**
   - `discovery_searches` (id, tenant_id, user_id, country, city, pincode, category, status, result_count, created_at).
   - `discovery_results` (id, search_id, tenant_id, place_id, name, address, lat, lng, phone, website, email, maps_url, imported_lead_id, created_at).
   - Indexes: `(tenant_id, search_id)`, `(tenant_id, place_id)`.

6. **Migration 06 — Communication & WhatsApp Subsystem:**
   - `message_templates` (id, tenant_id, channel, name, subject, body, variables JSONB, status).
   - `whatsapp_sessions` (id, tenant_id, provider, phone, status, credentials_encrypted, warmup_started_at, daily_cap).
   - `whatsapp_messages` (id, tenant_id, session_id, contact_id, direction, body, media JSONB, status, scheduled_at, sent_at, delay_ms, typing_ms, rule_id).
   - `whatsapp_auto_reply_rules` (id, tenant_id, name, trigger JSONB, reply_variants JSONB, delay_min_s, delay_max_s, typing_cps_min, typing_cps_max, business_hours JSONB, per_contact_hourly_cap, takeover_pause_hours, is_active).
   - `whatsapp_optouts` (id, tenant_id, phone, reason, created_at).

7. **Migration 07 — Products, Billing & Commercials:**
   - `products` (id, tenant_id, name, code, price, tax_rate, unit, description).
   - `quotations` & `quotation_items` (id, tenant_id, quotation_number, contact_id, deal_id, total, status, valid_until).
   - `invoices`, `invoice_items` & `payments`.
   - `subscriptions` & `usage_counters` (tenant_id, metric, counter, period_start, period_end).

8. **Migration 08 — Workflow Automation & Lead Capture:**
   - `workflows` (id, tenant_id, name, trigger_event, conditions JSONB, actions JSONB, is_active).
   - `workflow_runs` (id, tenant_id, workflow_id, entity_id, status, error, executed_at).
   - `web_forms` & `form_submissions`.
   - `custom_field_definitions` (id, tenant_id, entity_type, key, label, field_type, options JSONB, is_required).
   - `audit_logs` (id, tenant_id, user_id, action, entity, entity_id, before JSONB, after JSONB, ip, created_at).

---

## 4. Phase-by-Phase Roadmap

### Phase 0: Architecture, CLI & Planning (Current Phase)
- **Goal:** Solidify foundation, establish git repository, configure CLI credentials, write memory files, agree on all architectural decisions before writing application code.
- **Tasks:**
  1. Create project memory files (`GINIE.md`, `IMPLEMENTATION_PLAN.md`, `PROJECT_STATE.md`, `CHANGELOG.md`, `DECISIONS.md`).
  2. Setup repository configuration (`.gitignore`, `.env.example`, `README.md`).
  3. Validate CLI environment (`gh`, `docker`, `supabase`, `node`).
  4. Collect required third-party API keys and configuration items from the user.
  5. **Gate:** Stop and await user reply "Approved" before commencing Phase 1.

---

### Phase 1: MVP Core CRM & Google Maps Lead Discovery
- **Goal:** A fully working multi-tenant CRM with Lead management, pipeline Kanban, tasks, dashboard, and Google Places Lead Discovery.
- **Milestone 1.1 — Monorepo & Infrastructure Setup:**
  - Initialize monorepo packages (`apps/web`, `apps/api`, `apps/worker`, `packages/database`, `packages/common`, `packages/i18n`).
  - Configure Prisma schema with Migrations 01–05.
  - Setup pg-boss queue service connection to PostgreSQL.
  - Create seed script: 1 demo company ("Acme Traders"), 1 owner admin (`admin@ginie.space`), standard sales steps, sample potential customers.
  - Docker compose configuration for local development.
- **Milestone 1.2 — Multi-Tenant Authentication & Team Access:**
  - Endpoints: `POST /api/auth/register`, `login`, `refresh`, `invite`.
  - JWT authentication with secure HTTP-only cookies / bearer tokens and refresh token rotation.
  - Multi-tenant NestJS guard & Prisma middleware enforcing automatic `tenant_id` scoping.
  - Plain-language UI auth screens: Sign In ("Sign in to your account"), Sign Up ("Register your company"), Accept Invite.
- **Milestone 1.3 — Home (Dashboard) & Team Settings:**
  - Ant Design responsive Layout with sidebar navigation, tenant brand color, light/dark mode switch.
  - Home dashboard cards: New potential customers, Open sales, Won sales, Tasks due today.
  - Settings: Company profile, team members, team access roles.
- **Milestone 1.4 — Potential Customers (Leads) & People/Companies:**
  - ProTable for Potential Customers with search, status filters, tags, Excel upload/download.
  - Duplicate detection based on phone, email, and Google `place_id` (`pg_trgm` fuzzy matching).
  - Customer detail view with activity timeline (notes, calls, tasks, status history).
  - Convert customer into Person + Company + Sale in progress.
- **Milestone 1.5 — Sales Steps (Deals Kanban) & Tasks:**
  - Drag-and-drop Kanban board for sales steps using `@hello-pangea/dnd` or `dnd-kit`.
  - Capture win/loss reasons in plain words.
  - Task management linked to customers and deals, with reminders and calendar view.
- **Milestone 1.6 — Find New Customers (Google Maps Lead Discovery — KEY FEATURE):**
  - Search form: Country -> State/City -> Pincode -> Business category.
  - Backend integration with **Google Places API (New)** Text Search (`POST places:searchText`) using strict field masks to control costs.
  - Pagination handling (`pageSize` 20 + `nextPageToken`).
  - Search job submitted to `pg-boss` queue (`discovery.search`); UI polls/streams live progress.
  - Results table with name, address, phone, website, Google Maps link, map pin preview.
  - One-click "Add to Customers" (single/bulk) with automatic duplicate suppression.
  - Monthly quota meter visible in UI.
- **Milestone 1.7 — Verification & Testing:**
  - Cross-tenant data isolation integration tests (verify Tenant A cannot query Tenant B).
  - Plain-language audit: check all strings against `docs/IMPLEMENTATION_PLAN.md` Section 15.
  - Complete README and setup documentation.

---

### Phase 2: Communication, WhatsApp Bridge & Document Generation
- **Milestone 2.1 — Website Public Email Extractor:**
  - Background worker job (`website-crawler.job.ts`) crawls discovered business websites for public contact emails (`/contact`, `/about`).
  - Respects `robots.txt`, 5-page limit, polite User-Agent.
- **Milestone 2.2 — Official WhatsApp Business Cloud API:**
  - Meta Cloud API integration for outbound template messages.
  - Inbound webhook handler and conversation timeline.
- **Milestone 2.3 — WhatsApp Web Bridge & Human-like Delayed Auto-Reply:**
  - Deploy `apps/whatsapp-bridge` container (Baileys) with encrypted session persistence in PostgreSQL.
  - Settings screen: "Link your WhatsApp (scan the code with your phone)" with live connection status.
  - Inbound webhook to API with HMAC signature verification.
  - Human-like auto-reply algorithm:
    - Non-instant randomized delay (8–45s log-normal with jitter).
    - Read receipt delay (2–15s).
    - Typing indicator proportional to text length (4–7 cps).
    - Natural wording variants & business hours enforcement.
    - Safety throttles: 1 send at a time, gap between messages, contact hourly caps, warm-up schedule.
    - Automatic stop keywords: STOP, UNSUBSCRIBE, बंद.
    - Human takeover detection (pauses auto-reply for 12 hours).
- **Milestone 2.4 — Email & Communication Center:**
  - SMTP connection settings per tenant.
  - Ready-made message templates with dynamic tags.
- **Milestone 2.5 — Extra Details (Custom Fields) & Web Forms:**
  - Custom field builder (text, number, date, dropdown) for customers, people, and deals.
  - Industry presets (Real Estate, Clinic, Agency, Trading, Services).
  - Public embeddable web forms for lead capture.
- **Milestone 2.6 — Quotations, Invoices & PDF:**
  - Product catalogue with pricing and GST rates.
  - Quotation generation, conversion to invoice, PDF export with tenant logo.
- **Milestone 2.7 — Reports & Insights:**
  - Lead sources, sales conversion funnel, user performance.

---

### Phase 3: Automation, AI Intelligence, Subscriptions & Super Admin
- **Milestone 3.1 — Auto Actions (Workflow Builder):**
  - No-code visual workflow builder (React Flow): "When this happens" -> "Only if" -> "Then do this".
- **Milestone 3.2 — AI Intelligence:**
  - Customer scoring (hot/warm/cold).
  - AI message drafting from customer notes.
  - Call note summarization.
- **Milestone 3.3 — Subscription Plans & Payment Gateways:**
  - Razorpay (India) & Stripe integration for SaaS billing.
  - Quota enforcement per plan.
- **Milestone 3.4 — Owner Panel (Super Admin):**
  - Platform tenant overview, suspension/activation, plan allocation.
- **Milestone 3.5 — Polish, Hardening & Production VPS Deployment:**
  - Security audit, rate limiting, log rotation, automated daily backups.

---

## 5. API Build Order & Route Manifest

All endpoints under `/api` enforce JWT auth and tenant context unless explicitly marked `[Public]`.

| Route | Method | Module | Description (Plain Language) |
|---|---|---|---|
| `/api/auth/register` | POST | Auth | Register new company + owner admin `[Public]` |
| `/api/auth/login` | POST | Auth | Sign in to account `[Public]` |
| `/api/auth/refresh` | POST | Auth | Refresh sign-in token `[Public]` |
| `/api/auth/invite` | POST | Auth | Invite team member |
| `/api/me` | GET | Auth | Get current user & company profile |
| `/api/leads` | GET, POST | Leads | List & add potential customers |
| `/api/leads/:id` | GET, PATCH, DELETE | Leads | View, update, or move customer to bin |
| `/api/leads/import` | POST | Leads | Upload customers from Excel |
| `/api/leads/export` | GET | Leads | Download customers as Excel |
| `/api/leads/bulk-action` | POST | Leads | Do action for many customers at once |
| `/api/leads/:id/activities` | GET, POST | Leads | Customer timeline history & notes |
| `/api/contacts` | GET, POST, PATCH | Contacts | People directory |
| `/api/companies` | GET, POST, PATCH | Companies | Business directory |
| `/api/deals` | GET, POST, PATCH | Deals | Sales in progress & board stages |
| `/api/deals/:id/stage` | PATCH | Deals | Update sales step |
| `/api/tasks` | GET, POST, PATCH | Tasks | Tasks, follow-ups & reminders |
| `/api/discovery/search` | POST | Discovery | Start search for new customers (Google Places) |
| `/api/discovery/:searchId` | GET | Discovery | Check search progress & results |
| `/api/discovery/:searchId/import`| POST | Discovery | Add found businesses to customers |
| `/api/discovery/usage` | GET | Discovery | Check monthly search limit used |
| `/api/whatsapp/sessions` | POST, GET, DELETE | WhatsApp | Link WhatsApp (QR code), check status, unlink |
| `/api/whatsapp/auto-reply-rules`| GET, POST, PATCH | WhatsApp | Configure auto-reply rules & delays |
| `/api/webhooks/whatsapp-bridge` | POST | WhatsApp | Inbound message from bridge `[HMAC Verified]` |
| `/api/webhooks/whatsapp` | POST | WhatsApp | Meta Cloud API webhook `[Public]` |
| `/api/public/forms/:id/submit` | POST | Web Forms | Public web form submission `[Public]` |
| `/api/templates` | GET, POST, PATCH | Communication | Ready-made message templates |
| `/api/quotations` | GET, POST, PATCH | Billing | Price quotes |
| `/api/invoices` | GET, POST, PATCH | Billing | Invoices & payment status |
| `/api/reports/:type` | GET | Reports | Sales & customer reports |
| `/api/settings/*` | GET, PATCH | Settings | Company settings, team access, extra fields |
| `/api/admin/*` | GET, POST, PATCH | Super Admin | Platform owner control panel |

---

## 6. Screen & UI Component Build Order

Every screen strictly utilizes Ant Design v5 (`ConfigProvider`, `Layout`, `Table`/`ProTable`, `Form`, `Modal`, `Drawer`) styled with tenant brand color and supporting English & Hindi.

1. **Authentication Flow:**
   - Sign In screen (`/login`)
   - Company Sign Up (`/register`)
   - Forgot / Reset Password (`/forgot-password`)
   - Accept Invitation (`/invite/:token`)
2. **Main Application Shell:**
   - Responsive Layout (`/`) with collapsible sidebar, top bar with tenant logo, user avatar, language picker (English / Hindi), and theme toggle.
3. **Home Dashboard (`/`):**
   - KPI Stat Cards: New potential customers, Active sales, Revenue won, Tasks due.
   - Funnel & Source Charts (Recharts / Ant Design Charts).
4. **Potential Customers (`/customers` / `/leads`):**
   - ProTable with custom columns, search bar, status badges, bulk selection toolbar.
   - Upload from Excel modal (column mapping preview).
   - Customer Detail Drawer / Page with tabbed timeline (Notes, Calls, WhatsApp, Tasks).
5. **Find New Customers (`/find-customers` / `/discovery`):**
   - 4-step search panel: Country -> State/City -> Pincode -> Business category.
   - Live progress indicator with remaining monthly searches counter.
   - Results grid with address, phone, website, Google Maps button, and map pin preview.
   - Bulk "Add to Customers" modal with duplicate indicator.
6. **Sales Steps (`/sales` / `/deals`):**
   - Board View (Kanban) with customizable columns per sales step.
   - Drag-and-drop card movement with deal value calculation per stage.
   - Win/Loss modal capturing reasons.
7. **People & Companies (`/people`, `/companies`):**
   - Directory views with linked sales and activity records.
8. **Tasks & Calendar (`/tasks`):**
   - List and FullCalendar view for scheduled follow-ups.
9. **Communication & WhatsApp Center (`/communication`):**
   - WhatsApp Link screen with live QR code generation, reconnect status, and warning notice.
   - Auto-reply configuration panel (delays, typing speed, variants, business hours).
10. **Settings (`/settings`):**
    - Company profile, Team access (roles), Sales steps configuration, Extra details (custom fields).

---

## 7. Testing Strategy

1. **Multi-Tenant Isolation Tests (Mandatory):**
   - Automated integration tests creating Tenant A and Tenant B.
   - Assert that Tenant A authentication credentials can **never** query, mutate, or access Tenant B's customers, deals, or settings.
   - Verify both Prisma extension enforcement and PostgreSQL RLS policies.
2. **Plain-Language UI Linter / Dictionary Validator:**
   - Automated check scanning UI translation keys to ensure 100% of labels are defined in `en.json` and `hi.json`.
   - Disallow banned developer terms (Lead, Tenant, Webhook, API Key, Quota, Schema).
3. **End-to-End API Smoke Tests:**
   - Test full user journey: Register tenant -> Add customer -> Move sales step -> Run mock discovery -> Log activity.
4. **Queue & Concurrency Testing:**
   - Verify pg-boss job scheduling, delayed WhatsApp replies, and error retry backoffs.

---

## 8. Third-Party Credentials & User Requirements

The following accounts and credentials are required from the user. **Note:** Secrets are never entered into chat or committed to git; they will be placed in `.env` or set via CLI (`gh secret set` / Render environment settings).

| Item | Required For | Phase | How User Provides |
|---|---|---|---|
| **Supabase Project** | Managed PostgreSQL (Mumbai ap-south-1) + Private Storage | Phase 1 | `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| **Google Cloud Account** | Google Places API (New) Text Search | Phase 1 | `GOOGLE_PLACES_API_KEY` (restricted to Places API) |
| **Domain & Cloudflare** | DNS for `ginie.space`, SSL Full Strict, CDN | Phase 1 / Staging | Cloudflare API Token or nameserver delegation |
| **SMTP / Email Account** | Outbound transactional emails & team invitations | Phase 1 | SMTP host, port, username, password |
| **Meta Developer Account** | WhatsApp Business Cloud API | Phase 2 | Phone Number ID, Access Token, Verify Token |
| **VPS or Render Account** | Docker container hosting | Phase 1/2 | SSH access / Render API key |
| **Payment Gateway** | Razorpay or Stripe for subscription billing | Phase 3 | Key ID and Secret Key |

---

## 9. Risk Management, Assumptions & Open Questions

### Identified Risks & Mitigations
1. **Google Places API Cost Overruns:**
   - *Mitigation:* Request only minimal field masks (`places.id`, `places.displayName`, `places.formattedAddress`, `places.location`, `places.nationalPhoneNumber`, `places.websiteUri`, `places.googleMapsUri`). Enforce tenant-level monthly quotas and cache identical searches.
2. **WhatsApp Web Bridge Number Disconnection / Banning:**
   - *Mitigation:* Implement strict human-like randomization (8–45s delayed replies, read receipt pauses, character-length typing emulation, daily warm-up limits, stop keyword triggers). Display clear user warning in UI that bridge is for existing customer replies only.
3. **Cross-Tenant Data Leak:**
   - *Mitigation:* Two-tier security defense: Prisma client middleware + PostgreSQL Row Level Security (RLS).

### Assumptions
- Initial development can proceed using local development services (or dev Supabase project) and mocked Places API responses when no live API key is provided during test cycles.
- Production deployment will use Docker on a VPS with Caddy reverse proxy, with an alternative `render.yaml` provided for Render deployments.

### Open Questions for the User
1. **Repository Setup:** Would you like us to create the GitHub repository `ginie` under your account (`dawoodhussain504-jpg`) via `gh repo create` now?
2. **Hosting Preference Confirmation:** Should we prioritize Docker Compose on VPS (with Caddy) as the primary deployment target, or would you prefer direct deployment to Render via `render.yaml`?
3. **Google Places API Key:** Do you already have a Google Cloud project with Places API (New) enabled, or should we prepare local mock adapters for discovery while you set it up?

---

## 10. Approval Checkpoint

**Rule:** No application code will be written until the user reviews this plan and replies with **"Approved"**.
