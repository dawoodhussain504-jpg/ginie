# GINIE — Multi-Tenant CRM Web App

**Product name:** GINIE
**Domain:** https://ginie.space
**Build tool:** Antigravity
**Goal:** A single CRM that any business or company can use (multi-industry, multi-tenant SaaS), with lead discovery from Google Maps, automation, WhatsApp/email, and AI features.

---

## 1. Instructions for the AI coding agent (Antigravity)

- Build the app **phase by phase** (Section 12). Finish and test one phase before starting the next.
- Use the tech stack in Section 3 exactly. Do not substitute without asking.
- **Multi-tenancy is mandatory from day one.** Every business table has `tenant_id`, and every query is filtered by the logged-in user's tenant.
- Never expose API keys (Google, WhatsApp, SMTP) to the frontend. Keep them in `.env` and call third-party APIs only from the backend.
- Write clean, modular code, with input validation (zod/class-validator), error handling and a README with setup steps.
- Provide a `.env.example`, database migrations and seed data (one demo tenant, one admin, sample leads).
- UI: use **Ant Design (antd)** as the only main UI component library (do not mix in shadcn/MUI/Chakra). Use antd `ConfigProvider` for theming (tenant brand colour, light/dark mode via `theme.darkAlgorithm`) and for localisation (`en_US` and `hi_IN` locales). Clean, modern, responsive layout (antd `Layout`, `Grid`, `Table`, `Form`, `Modal`, `Drawer`, `Calendar`, `DatePicker`). Default language English, with Hindi supported via i18n.
- **Plain-language rule (mandatory):** everything the user sees in the app must be in simple, everyday words with no developer or technical jargon. Follow Section 15 for every label, button, message and error.

---

### 1.1 Working Agreement (MANDATORY — plan first, propose every change, keep a permanent memory)

**All work happens in the GitHub repository only.** The agent must not rely on or create project files on the user's local PC. Use a Codespace/cloud workspace or work through branches and Pull Requests. Never commit secrets (`.env` stays out of the repo; only `.env.example`).

**Project memory files (in `/docs`, committed to GitHub):**

| File | Purpose | Rule |
|---|---|---|
| `docs/IMPLEMENTATION_PLAN.md` | Approved plan: phases, milestones, tasks, folder structure, migration order, risks | Written **before any code**; revised only through an approved Change Proposal |
| `docs/PROJECT_STATE.md` | Where the project stands: done, in progress, next, blockers, how to run | Updated at the end of every task and session |
| `docs/CHANGELOG.md` | Every change ever made, with ID, date, files, migrations, status | **Append-only**; never delete or rewrite old entries |
| `docs/DECISIONS.md` | Why important choices were made (stack, schema, rules) | **Append-only**; a reversed decision is marked "superseded by CP-xxx", not erased |

**Rules the agent must follow:**

1. **Start of every session:** read `GINIE.md`, `docs/PROJECT_STATE.md`, `docs/CHANGELOG.md` and `docs/DECISIONS.md` completely, then post a 5-line summary of where the project stands. Do not start work before this.
2. **Plan first (Phase 0):** before writing any application code, produce `docs/IMPLEMENTATION_PLAN.md` containing: phase-wise milestones and tasks, repository and folder structure, database migration order, API and screen build order, test strategy, third-party accounts and keys needed from the user, risks, assumptions and open questions. **Stop and wait for the user to reply "Approved"** before coding. Repeat a short plan for each new phase.
3. **Propose before changing:** for every change that is not already in the approved plan (new feature, library or stack change, database schema change, refactor, behaviour change, bug fix touching more than a few files) post a **Change Proposal** and wait for approval. Only trivial fixes (typos, formatting) are exempt. Format:

```
Change Proposal CP-<number>: <title>
Why:            <problem or goal>
What changes:   <summary>
Files/areas:    <list>
Database:       <migrations, data impact, or "none">
Impact on existing features and earlier decisions/changes (cite CP/ADR ids):
Risks and rollback:
Effort:         <small / medium / large>
Alternatives considered:
```

4. **Check history before proposing:** compare every proposal against `CHANGELOG.md` and `DECISIONS.md`. If it conflicts with or reverses an earlier change, say so explicitly and cite the earlier ID.
5. **Real-time updates:** after approval, implement on a feature branch with small commits and open a Pull Request. **In the same PR/commit as the code**, update `CHANGELOG.md` (new entry), `PROJECT_STATE.md`, `DECISIONS.md` (if a decision was made) and, if the spec itself changed, the relevant section of `GINIE.md` (note "Updated by CP-xxx"). Never leave documentation for later.
6. **Never forget, never silently overwrite:** earlier updates are permanent. Do not remove or rewrite previous changelog or decision entries, and do not undo earlier approved work unless a new approved Change Proposal says so.
7. **End of every session:** update `PROJECT_STATE.md` with next steps and hand-over notes, and commit.

**Changelog entry format (append-only):**

```
## CP-<number> — <title> — <YYYY-MM-DD> — Status: proposed | approved | implemented | superseded by CP-<n>
Summary:
Files changed:
Migrations:
Related decisions/changes:
PR / commit:
```

---

### 1.2 CLI-First Development (MANDATORY)

All development, database changes, deployment and configuration are done from the **command line inside the cloud workspace** (Codespace), not by clicking around in web dashboards. This keeps every step repeatable, reviewable and written down in the GitHub repo. A dashboard is used only for things no command can do (for example creating an account or adding a payment method); each such step is listed in `docs/MANUAL_STEPS.md`.

**Tools**

| Service | Command-line tool | Used for |
|---|---|---|
| GitHub | `gh` | Repo, branches, Pull Requests, Actions runs, repository/Codespaces secrets (`gh secret set`) |
| Supabase | `supabase` CLI | Login and project link, migrations, database changes, storage buckets, extensions, row-level security policies |
| Cloudflare | `wrangler` and the Cloudflare API (`curl`) | Workers/Pages/R2 (wrangler); DNS records, SSL settings and security rules (API calls kept in scripts) |
| Render | `render` CLI and `render.yaml` | Creating and deploying services (API, worker, WhatsApp bridge, web) from one file in the repo |
| Docker | `docker` | Building and testing images |

Check each tool's current commands with `--help` before use; do not guess flags.

**Rules**
1. **One source of truth for the database.** Decide in Phase 0 and record in `docs/DECISIONS.md`: table structure changes go through Prisma migrations; Supabase-specific items (row-level security, extensions, storage buckets) go through SQL files in `supabase/migrations`. Never change the live database by hand.
2. **Infrastructure as code.** Everything lives in the repo: `render.yaml`, `supabase/` folder, `wrangler.toml`, `.github/workflows/`, Dockerfiles and scripts. No setting exists only in a dashboard.
3. **Scripts for repeated work:** provide npm scripts or a Makefile (`setup`, `db:migrate`, `deploy:staging`, `deploy:prod`). Scripts must be safe to run twice.
4. **Three environments:** dev, staging, production. Each has its own Supabase project and its own Render services. Commands default to **dev**. Staging and production are touched only after approval.
5. **Preview before applying:** show the difference first (for example `supabase db diff`, `prisma migrate diff`, a dry run) and wait for approval on anything that changes staging or production.
6. **Approval needed for risky commands:** database reset or drop, deleting a service, DNS record or bucket, force push, rotating keys and any production deploy. Show the exact command and what it will do, then wait for "Approved" (Section 1.1).
7. **Tokens and keys:** use the smallest permission needed (for example a Cloudflare token limited to the ginie.space zone). Keep them only in Codespaces/GitHub secrets and Render/Supabase environment settings. Never print them, commit them, or ask the user to paste them into chat or docs.
8. **Log every change made through a command** (what, which environment, which command group) in `docs/CHANGELOG.md`.
9. **Automatic pipeline:** GitHub Actions runs tests, applies migrations to staging and deploys with the CLI tools above; production deploy runs only after manual approval in GitHub.
10. **Render service notes:** the API, worker and WhatsApp bridge must be always-on (paid, non-sleeping) services; the bridge needs its session saved in the database so a restart does not need a new QR scan.

**Tokens the user will need to create (listed in the plan, never shared in chat):** GitHub login via `gh auth`, `SUPABASE_ACCESS_TOKEN`, `CLOUDFLARE_API_TOKEN`, `RENDER_API_KEY`, Google Cloud access for the Places API key.

---

## 2. Core Concept: Multi-Tenant SaaS

- One GINIE installation serves many companies (tenants) at `ginie.space`.
- Each tenant has its own users, roles, leads, pipeline, custom fields, branding (logo, colour) and settings.
- Tenant data must never be visible to another tenant.
- Optional later: tenant subdomains such as `companyname.ginie.space`.

---

## 3. Tech Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js (React) + TypeScript + **Ant Design (antd v5)** |
| UI helpers | ProTable/ProComponents (`@ant-design/pro-components`) for data tables and forms, `@ant-design/charts` or Recharts for charts, `@hello-pangea/dnd` or dnd-kit for Kanban drag & drop, FullCalendar for calendar, React Flow for workflow builder, TipTap for rich text, React Hook Form + Zod (or Ant Design Form) for validation |
| Backend | Node.js + NestJS (or Express) + TypeScript |
| Database | **Supabase (managed PostgreSQL)**, region Mumbai (ap-south-1); use JSONB for custom fields |
| ORM | Prisma (pooled connection for the app, direct connection for migrations) |
| Background jobs / Queue | **pg-boss** (queue stored in PostgreSQL). No Redis in this project. Keep the queue behind a small service layer so it can be swapped for BullMQ + Redis later if scale needs it. |
| Auth | JWT (access + refresh), password hashing with bcrypt/argon2, optional 2FA |
| File storage | Supabase Storage (private buckets, signed URLs); local disk in dev |
| Hosting | **Cloudflare** (DNS, SSL, CDN, WAF/DDoS protection, wildcard DNS for tenant subdomains) in front of a **Docker deployment on a VPS** (frontend, NestJS API and pg-boss worker as separate containers behind Nginx/Caddy). Database and storage on Supabase. |
| i18n | next-intl or i18next (English, Hindi) |

---

### 3.1 Hosting & deployment notes

- Domain `ginie.space` is managed in Cloudflare DNS with the proxy enabled; SSL mode **Full (strict)** with an origin certificate on the VPS.
- Provide a `docker-compose.prod.yml` with these services: `web` (Next.js), `api` (NestJS), `worker` (NestJS + pg-boss) and `whatsapp-bridge` (Baileys/Evolution API, Section 5.8.1), plus a reverse proxy (Nginx or Caddy). Database is external (Supabase), so no Postgres container in production.
- Add a `/health` endpoint on the API, container restart policies, and log rotation.
- CI/CD: build Docker images on push to `main` and deploy to the VPS (GitHub Actions + SSH or a registry).
- Keep the frontend deployable separately, so it can later move to Cloudflare Workers/Pages or Vercel without changing the backend.
- Wildcard DNS (`*.ginie.space`) is reserved for optional tenant subdomains (`companyname.ginie.space`).

---

### 3.2 Database setup notes (Supabase)

- Use Supabase **only as PostgreSQL + Storage**. Keep auth, business logic and background jobs in our own NestJS backend, so we are not locked in and can move to any Postgres host later.
- **Auth:** use our own JWT-based auth (Section 5.1). Do not use Supabase Auth.
- **Prisma connections:**
  - `DATABASE_URL` = Supabase **pooled** connection string (port 6543, add `?pgbouncer=true&connection_limit=1` where needed) for the running app.
  - `DIRECT_URL` = Supabase **direct** connection string (port 5432), used only for `prisma migrate`.
  - In `schema.prisma`: `datasource db { provider = "postgresql"; url = env("DATABASE_URL"); directUrl = env("DIRECT_URL") }`
- **Tenant isolation:** the backend must always filter by `tenant_id` (enforce through a Prisma middleware/extension). As a second safety layer, enable **Row Level Security** on all business tables with a policy based on `tenant_id`. Do not expose the tables through the Supabase client/REST API to the browser; the frontend talks only to our backend.
- **Extensions to enable:** `pgcrypto` (uuid), `pg_trgm` (fuzzy duplicate search on name/phone/email).
- **Secrets:** `SUPABASE_SERVICE_ROLE_KEY` is used only on the server for Storage and must never reach the frontend.
- **Storage buckets:** `tenant-logos`, `attachments`, `invoices` (all private). Store files under `{tenant_id}/...` and serve them through signed URLs.
- **Background jobs** (lead discovery, website email crawler, campaigns) run in a separate NestJS worker process using **pg-boss** (uses the Supabase **direct** connection, port 5432, because the queue needs long-lived connections), never in Supabase Edge Functions. Caching and rate limiting use server memory or database tables for now; no Redis.
- **Backups:** rely on Supabase daily backups and also schedule a weekly `pg_dump` to separate storage.

---

## 4. User Roles & Permissions (RBAC)

Default roles per tenant (editable):

| Role | Access |
|---|---|
| Owner/Admin | Everything, billing, users, settings |
| Manager | Team data, reports, assign leads, automation |
| Sales Executive | Own leads/deals/tasks, limited reports |
| Support / Viewer | Read-only or limited access |

- Permission matrix per module: View / Create / Edit / Delete / Export.
- Data visibility options: Own only / Team / All.
- Admin can create custom roles.

---

## 5. Modules & Features

### 5.1 Authentication & Onboarding
- Sign up (creates a new tenant + owner), login, logout, forgot/reset password.
- Invite team members by email with a role.
- Profile page, change password, optional 2FA.

### 5.2 Dashboard
- Cards: new leads, open deals, won/lost, revenue, tasks due today.
- Charts: lead source, sales funnel, monthly revenue, team performance.
- Date range filter.

### 5.3 Leads
- List with search, filters, sort, pagination, bulk actions (assign, tag, delete, export).
- Fields: name, company, phone, email, website, address, city, state, country, pincode, source, status, owner, tags, notes, created date.
- Lead status (customisable): New, Contacted, Qualified, Proposal, Won, Lost.
- Duplicate detection (by phone, email, Google `place_id`).
- Import from CSV/Excel with column mapping; export to CSV/Excel.
- Lead detail page with **activity timeline** (notes, calls, emails, WhatsApp, tasks, status changes).
- Convert a lead into Contact + Company + Deal.

### 5.4 Contacts & Companies
- Contacts linked to a company; multiple contacts per company.
- Custom fields, tags, notes, attachments.

### 5.5 Deals / Sales Pipeline
- Kanban board with drag & drop; customisable stages per pipeline; multiple pipelines.
- Deal fields: title, value, currency, expected close date, probability, owner, linked contact/company, products.
- Won/Lost reason capture.

### 5.6 Tasks, Follow-ups & Calendar
- Tasks linked to lead/contact/deal, with due date, priority, assignee.
- Reminders (in-app + email), overdue highlighting.
- Calendar view for tasks and meetings.

### 5.7 Lead Discovery (Google Maps) — KEY FEATURE
See Section 7 for the full specification.

### 5.8 Communication
- **Email:** SMTP/IMAP or Gmail/Outlook connection; templates with variables; send from lead page; open tracking (optional).
- **WhatsApp:** WhatsApp Business Cloud API; approved templates; inbound/outbound chat in lead timeline; opt-in tracking.
- **SMS:** pluggable provider (MSG91/Twilio).
- Click-to-call links and call log (manual entry first).
- Bulk campaigns with unsubscribe/opt-out handling.

### 5.8.1 WhatsApp Bridge & Human-like Auto-Reply

**Architecture**
- Define a `WhatsAppProvider` interface (`sendText`, `sendMedia`, `setPresence`, `markRead`, `onMessage`, `getStatus`) with two implementations: `CloudApiProvider` (official WhatsApp Business Cloud API) and `BridgeProvider` (unofficial WhatsApp Web bridge using Baileys or a self-hosted Evolution API). Each tenant chooses a provider in Settings; the rest of the app only talks to the interface.
- The bridge runs as its own long-lived Docker container `whatsapp-bridge` (separate from `api` and `worker`).
- **Per-tenant session:** Settings → "Connect WhatsApp" shows a QR code; after scanning, session credentials are saved encrypted in the database so a restart does not need a new QR. Handle reconnects, logout and session-expired states, and show the live status in the UI.
- **Inbound:** the bridge posts incoming messages to `POST /api/webhooks/whatsapp-bridge` (verify an HMAC signature/API key). Messages are stored and appear in the lead/contact timeline; unknown numbers can create a new lead.
- **Outbound:** every outgoing message goes through the pg-boss queue (`whatsapp.reply`, `whatsapp.send`), never sent directly from an API request.

**Scope rules (important)**
- The bridge is for **replies to people who messaged first** and for chats with existing customers, at low volume.
- Do **not** build bulk/cold broadcast or campaigns on the bridge. Bulk and marketing messages must go through the official Cloud API with approved templates and opt-in.
- Show a clear warning in the UI: unofficial connections can get a number restricted or banned and no setting can guarantee otherwise. Tenant admin must accept it before enabling the bridge.

**Human-like auto-reply (all values configurable per tenant, defaults in brackets)**
1. **Never instant.** Every auto-reply gets a random delay drawn fresh each time (e.g. 8–45 s, min and max configurable). Use a skewed random distribution (such as log-normal) with jitter; never a fixed interval and never the same delay twice in a row. Implement by scheduling the pg-boss job with a randomised `startAfter`.
2. **Read receipt delay:** mark the chat as read after a random 2–15 s, not at the moment the message arrives.
3. **Typing indicator:** send "composing" presence before the reply. Typing time is proportional to reply length (about 4–7 characters per second, randomised ±25%, min 3 s, max 25 s). For long replies, optionally pause and resume typing once. Send "paused" after the message.
4. **Natural variety:** an auto-reply rule can hold several wording variants (for example different greetings); pick one at random so replies are not word-for-word identical every time. Use the customer's name where known.
5. **Business hours:** outside configured hours either do not reply, or reply after opening time with a random offset.
6. **Throttling:** one send at a time per session; random gap of 3–10 s between any two outgoing messages; caps per contact per hour, and per session per hour and per day. When a cap is hit, delay or skip, never burst.
7. **Warm-up:** a newly connected number starts with a low daily cap that increases gradually over 7–14 days.
8. **Human takeover:** if an agent replies manually in a chat, pause auto-reply for that chat for N hours (default 12).
9. **Skip rules:** never auto-reply in groups, broadcast lists or status updates, and never to other automated senders.
10. **Opt-out:** keywords such as STOP, UNSUBSCRIBE, बंद add the number to an opt-out list and stop all automated messages to it.
11. **Circuit breaker:** on disconnects, auth failures or a high error rate, pause the session, alert the admin by in-app and email notification, and require manual restart. No retry loops.
12. **Audit log:** log every automated send (rule, delay used, typing time) for review.

**Auto-reply rules:** triggers by keyword/regex, first message from a new contact, outside business hours, or AI-generated reply (Section 5.13) with a human-approval toggle; fallback "handover to agent" rule.

**Tables:** `whatsapp_sessions` (tenant_id, provider, phone, status, credentials_encrypted, warmup_started_at, daily_cap), `whatsapp_messages` (tenant_id, session_id, contact_id, direction, body, media, status, scheduled_at, sent_at, delay_ms, typing_ms, rule_id), `whatsapp_auto_reply_rules` (tenant_id, name, trigger JSONB, reply_variants JSONB, delay_min_s, delay_max_s, typing_cps_min, typing_cps_max, business_hours JSONB, per_contact_hourly_cap, takeover_pause_hours, is_active), `whatsapp_optouts` (tenant_id, phone, reason, created_at).

**API:** `POST /api/whatsapp/sessions` (returns QR), `GET /api/whatsapp/sessions/:id/status`, `DELETE /api/whatsapp/sessions/:id` (logout), `GET/POST/PATCH /api/whatsapp/auto-reply-rules`, `POST /api/webhooks/whatsapp-bridge`.

### 5.9 Products & Quotations / Invoices
- Product/service catalogue with price, tax (GST) and unit.
- Create quotation → convert to invoice; PDF generation with tenant logo; send by email/WhatsApp.
- Payment status tracking (paid / partial / unpaid).

### 5.10 Workflow Automation (no-code)
- Trigger → Condition → Action builder.
- Triggers: lead created, status changed, no activity for N days, form submitted, task overdue.
- Actions: assign owner, create task, send email/WhatsApp template, change status, notify user, call webhook.

### 5.11 Custom Fields & Custom Modules
- Tenant admin can add fields (text, number, date, dropdown, multi-select, checkbox, URL) to Leads, Contacts, Companies, Deals.
- Industry templates (Real Estate, Education, Clinic, Trading, Services, Agency) preloading fields and pipeline stages.

### 5.12 Web Forms & Lead Capture
- Embeddable form builder and public form link; submissions create leads.
- Webhook / REST API endpoint for leads from website, Facebook/Google Ads, IndiaMART, etc.

### 5.13 AI Features
- Lead scoring (hot/warm/cold) from activity and fields.
- Draft email / WhatsApp message from lead context.
- Summarise notes/call transcripts and suggest next action.
- Implement through a provider-agnostic AI service layer (API key per tenant or platform-wide).

### 5.14 Reports & Analytics
- Lead source report, conversion funnel, sales by user, revenue forecast, activity report.
- Export to CSV/Excel/PDF; scheduled email reports (later).

### 5.15 Settings
- Company profile and branding, users and roles, pipelines, lead statuses, custom fields, email/WhatsApp/SMS integrations, API keys, webhooks, notification preferences, data export, billing/plan.

### 5.16 Security & Admin
- Audit log (who changed what and when), login history, rate limiting, CORS, helmet, input sanitisation.
- Daily database backup, soft delete with restore.
- Platform **Super Admin** panel (owner of ginie.space): manage tenants, plans, usage, suspend/activate.

---

## 6. Subscription & Plans (Phase 3)
- Plans: Free / Starter / Pro / Business, with limits (users, leads, lead-discovery searches per month, WhatsApp messages).
- Payment gateway: Razorpay (India) and/or Stripe.
- Usage metering per tenant; show remaining quota in the UI.

---

## 7. Lead Discovery (Google Maps) — Detailed Specification

### 7.1 User flow
1. User opens **Lead Discovery**.
2. Fills the search form: **Country → State/City → Pincode (optional) → Business category / keyword**.
3. Clicks **Search**. The backend queues the job and the UI shows progress and live results.
4. Results table shows: business name, address, phone, website, email (if found), rating, Google Maps link, and a location pin on a small map.
5. User selects rows and clicks **Add to Leads** (single or bulk), picks owner, status and tags; or **Export to Excel**.
6. Already-existing leads are marked as duplicates and skipped.

### 7.2 Google API usage (official API only)
- Use **Google Places API (New)**, **Text Search** endpoint: `POST https://places.googleapis.com/v1/places:searchText`
- Do **not** scrape Google Maps pages.
- Headers: `X-Goog-Api-Key` (from `.env`), `X-Goog-FieldMask`.
- Request field mask (only what is needed, to control cost):
  `places.id, places.displayName, places.formattedAddress, places.location, places.nationalPhoneNumber, places.internationalPhoneNumber, places.websiteUri, places.googleMapsUri, nextPageToken`
- Query text pattern: `"{category} in {pincode} {city}, {country}"`
- Use `pageSize` (max 20) and `nextPageToken` for pagination.
- A single query returns a limited number of results, so for large areas split into sub-queries (by pincode or locality) and merge results using `place_id` for de-duplication.

### 7.3 Email extraction
- Google Places API does not provide email. If `websiteUri` exists, a background job fetches the site's homepage and likely pages (`/contact`, `/about`, `/contact-us`) and extracts **publicly listed** email addresses (regex + `mailto:` links).
- Respect `robots.txt`, set a timeout, limit pages per site (max 3–5) and use a polite user-agent.
- Store the email with a `source = website` flag. Leave empty if none is found.
- Run this as a queue job (pg-boss) so it never blocks the UI.

### 7.4 Cost & quota controls
- Per-tenant monthly search quota based on plan; show usage in the UI.
- Cache identical searches for a configurable period.
- Set a Google Cloud budget alert and daily quota cap.
- Request only the required fields.

### 7.5 Compliance notes (implement in UI and docs)
- Google Places data is subject to Google's terms: store `place_id` and refresh other data periodically instead of keeping it indefinitely; display required attributions.
- Contact data is for the tenant's own lawful business outreach. Provide an **opt-out / unsubscribe** mechanism and respect India's DPDP Act and TRAI/DND rules; WhatsApp messages only with Meta-approved templates and opt-in.
- Out of scope: extracting reviewers' personal contact details (not available and not allowed).

### 7.6 Database tables for this feature
- `discovery_searches` (id, tenant_id, user_id, country, city, pincode, category, status, result_count, created_at)
- `discovery_results` (id, search_id, tenant_id, place_id, name, address, lat, lng, phone, website, email, maps_url, imported_lead_id, created_at)

---

## 8. Database Schema (main tables)

All business tables include `id (uuid)`, `tenant_id`, `created_at`, `updated_at`, `deleted_at` (soft delete), `created_by`.

- `tenants` (name, slug, logo_url, plan_id, status, settings JSONB)
- `users` (tenant_id, name, email, phone, password_hash, role_id, status, last_login_at, language)
- `roles` (tenant_id, name, permissions JSONB)
- `leads` (name, company_name, phone, email, website, address, city, state, country, pincode, lat, lng, google_place_id, source, status_id, owner_id, score, tags, custom_fields JSONB)
- `lead_statuses` (tenant_id, name, color, order)
- `contacts` (company_id, name, phone, email, designation, custom_fields JSONB)
- `companies` (name, website, industry, address, custom_fields JSONB)
- `pipelines`, `pipeline_stages`
- `deals` (title, value, currency, stage_id, pipeline_id, contact_id, company_id, owner_id, expected_close, status, lost_reason)
- `activities` (entity_type, entity_id, type [note/call/email/whatsapp/task/status], content, meta JSONB, user_id)
- `tasks` (title, description, due_at, priority, status, assignee_id, entity_type, entity_id)
- `products`, `quotations`, `quotation_items`, `invoices`, `invoice_items`, `payments`
- `message_templates` (channel, name, subject, body, variables, status)
- `whatsapp_sessions`, `whatsapp_messages`, `whatsapp_auto_reply_rules`, `whatsapp_optouts` (Section 5.8.1)
- `campaigns`, `campaign_recipients`
- `workflows` (trigger, conditions JSONB, actions JSONB, is_active), `workflow_runs`
- `custom_field_definitions` (entity, key, label, type, options, required)
- `web_forms`, `form_submissions`
- `integrations` (type, credentials_encrypted, status)
- `api_keys`, `webhooks`
- `audit_logs` (user_id, action, entity, entity_id, before JSONB, after JSONB, ip)
- `plans`, `subscriptions`, `usage_counters`
- `discovery_searches`, `discovery_results` (Section 7.6)

Add indexes on `tenant_id`, `(tenant_id, phone)`, `(tenant_id, email)`, `(tenant_id, google_place_id)`.

---

## 9. REST API Outline (all routes require auth + tenant scope unless public)

```
POST   /api/auth/register | login | refresh | forgot-password | reset-password
GET    /api/me

GET/POST            /api/leads
GET/PATCH/DELETE    /api/leads/:id
POST                /api/leads/import | /api/leads/bulk-action
GET                 /api/leads/export
GET/POST            /api/leads/:id/activities

GET/POST/PATCH      /api/contacts | /api/companies | /api/deals | /api/tasks
PATCH               /api/deals/:id/stage

POST   /api/discovery/search          -> creates job, returns searchId
GET    /api/discovery/:searchId       -> status + results (paginated)
POST   /api/discovery/:searchId/import -> add selected results to leads
GET    /api/discovery/usage

GET/POST/PATCH      /api/templates | /api/campaigns | /api/workflows
POST   /api/messages/email | /api/messages/whatsapp | /api/messages/sms
POST/GET/DELETE /api/whatsapp/sessions   (bridge QR pairing, status, logout)
GET/POST/PATCH  /api/whatsapp/auto-reply-rules
POST   /api/webhooks/whatsapp-bridge   (inbound from bridge, signature verified)
POST   /api/webhooks/whatsapp         (inbound, public with verification)
POST   /api/public/forms/:id/submit   (public)

GET/POST/PATCH      /api/quotations | /api/invoices | /api/products
GET    /api/reports/:type
GET/PATCH           /api/settings/*
GET/POST/PATCH      /api/admin/*      (super admin only)
```

---

## 10. UI Screens

1. Landing page (ginie.space) with features, pricing, Sign up / Login
2. Auth screens (login, register, forgot password, accept invite)
3. Dashboard
4. Leads list + Lead detail (timeline) + Import/Export
5. **Lead Discovery** (search form, progress, results table, map, Add to Leads)
6. Contacts, Companies
7. Deals Kanban + Deal detail
8. Tasks & Calendar
9. Inbox / Communication (email + WhatsApp)
10. Templates & Campaigns
11. Quotations & Invoices
12. Workflow builder
13. Reports
14. Settings (profile, team & roles, pipelines, custom fields, integrations, billing)
15. Super Admin panel

---

## 11. Environment Variables (`.env.example`)

```
APP_URL=https://ginie.space
NODE_ENV=production
# Supabase Postgres (pooled, used by the app)
DATABASE_URL=postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
# Supabase Postgres (direct, used only for Prisma migrations)
DIRECT_URL=postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-ap-south-1.pooler.supabase.com:5432/postgres
# Supabase Storage (server side only)
SUPABASE_URL=https://PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
# pg-boss uses DIRECT_URL (no Redis needed)
JWT_SECRET=change_me
JWT_REFRESH_SECRET=change_me
GOOGLE_PLACES_API_KEY=your_key_here
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_VERIFY_TOKEN=
AI_API_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

---

## 12. Build Phases

### Phase 0 — Planning (no application code)
- Read this whole file, then create `docs/IMPLEMENTATION_PLAN.md`, `docs/PROJECT_STATE.md`, `docs/CHANGELOG.md` and `docs/DECISIONS.md` as described in Section 1.1.
- List everything needed from the user (Supabase project, Google Cloud/Places API key, Cloudflare/domain access, VPS, WhatsApp accounts) and the open questions.
- Propose the CLI setup (Section 1.2): tools to install in the cloud workspace, token permissions needed, the three environments, and the database change approach; record the choices in `docs/DECISIONS.md`.
- Confirm where the API, worker and WhatsApp bridge will run (VPS or Render) and record it as a decision.
- **Wait for the user's "Approved" before starting Phase 1.**

### Phase 1 — MVP
- Project setup (monorepo or two folders: `frontend`, `backend`), Docker compose (local Postgres only; production uses Supabase), pg-boss worker setup, migrations, seed.
- Auth, multi-tenant, roles, invite users.
- Leads (CRUD, filters, import/export, timeline), Contacts, Companies.
- Pipeline Kanban (Deals), Tasks, Dashboard.
- **Lead Discovery** with Google Places API (search, results, add to leads, duplicate check, quota).

### Phase 2
- Email finder (website crawler), email sending and templates.
- WhatsApp Business Cloud API integration and chat timeline.
- WhatsApp Bridge (separate `whatsapp-bridge` container, QR pairing, human-like delayed auto-reply, rate limits, opt-out) behind the `WhatsAppProvider` interface (Section 5.8.1).
- Custom fields, industry templates, web forms and lead-capture API.
- Products, quotations, invoices (PDF).
- Reports.

### Phase 3
- Workflow automation builder.
- AI features (scoring, drafts, summaries).
- Campaigns, SMS, webhooks, integrations (Google Sheets, n8n/Zapier).
- Subscription billing, Super Admin panel, audit log polish.
- PWA / mobile app.

---

## 13. Acceptance Criteria (summary)

- A user from Tenant A can never read or modify Tenant B's data (covered by tests).
- Lead Discovery returns name, address, phone, website, location for a given country + city (+ pincode) + category, shows email when found on the business website, and allows import into Leads without duplicates.
- All API keys stay on the server; none appear in frontend bundles or logs.
- App is responsive on mobile and desktop and supports English and Hindi labels.
- Every phase ships with a working README and `.env.example`.
- No code is written before the user approves `docs/IMPLEMENTATION_PLAN.md`; every later change has an approved Change Proposal and a matching entry in `docs/CHANGELOG.md`, committed together with the code.
- Earlier changelog and decision entries are never lost or overwritten.
- Every screen follows the Plain-Language UI Guide (Section 15): no technical words, codes or IDs visible to normal users.
- All setup, database changes and deployments can be repeated from the command line using the scripts in the repo; no setting exists only in a web dashboard.

---

## 14. Branding

- **Name:** GINIE
- **Domain:** ginie.space
- Tagline suggestion: *"Your smart CRM genie — discover leads, close deals."*
- Use the name "GINIE" consistently in the UI, emails, page titles and PDF documents.

---

## 15. Plain-Language UI Guide (what the user sees must be simple)

**Goal:** a shop owner, office staff or salesperson with no technical knowledge should understand every screen without help. Developer words stay in the code, never on the screen.

### 15.1 Rules
1. **Simple everyday words, short sentences.** Aim for a school-level reading age. Prefer "Add" to "Create entity", "Save" to "Persist", "Try again" to "Retry request".
2. **Buttons say what will happen:** "Add customer", "Send message", "Download as Excel", "Find new customers". Avoid vague labels such as "Submit" or "Proceed".
3. **No technical words, codes or IDs on screen:** never show API, token, webhook, endpoint, JSON, payload, query, schema, migration, null/undefined, stack traces, UUIDs or error numbers (like "500" or "403").
4. **Friendly errors that say what to do:** "We could not save this. Please check your internet and try again." Never blame the user. Log the technical details privately for the developer instead.
5. **Empty screens guide the user:** show a short line and one clear button, for example "No customers yet. Add your first customer or upload them from Excel."
6. **Confirm risky actions in plain words:** "Delete this customer? Their notes and tasks will also be removed. This cannot be undone."
7. **Help where needed:** a small "?" tooltip beside any field that may confuse, one-line examples inside input boxes, and a short first-time guided tour.
8. **Hindi and English both fully supported**, with natural everyday Hindi (not literal or bookish translations). Use local formats: dates as DD/MM/YYYY, amounts with ₹ and Indian digit grouping (1,00,000), 12-hour time.
9. **Always pair icons with text.** Do not rely on an icon alone.
10. **Hide advanced things.** Settings that only a technical person needs (connection keys, auto-connect links, data export for developers) go under a separate "Advanced" section with a simple explanation of what each does.
11. **All screen text lives in language files** (`en.json`, `hi.json`) and never inside the code, so wording can be changed without touching the program.

### 15.2 Word list: say this instead of that

| Do not show | Show this instead |
|---|---|
| Tenant / Organization | Company |
| Lead | Potential customer |
| Lead Discovery | Find new customers |
| Deal | Sale in progress |
| Pipeline / Stages | Sales steps |
| Kanban board | Board view |
| Dashboard | Home |
| Contacts | People |
| Custom fields | Extra details |
| Workflow / Automation | Auto actions |
| Trigger / Condition / Action | When this happens / Only if / Then do this |
| Roles & Permissions / RBAC | Team access |
| Audit log | Activity history |
| Webhook | Auto-connect link |
| API key / Token | Connection key |
| Integration | Connect other apps |
| Import / Export | Upload from Excel / Download as Excel |
| Bulk action | Do this for many at once |
| Duplicate | Already added |
| Sync | Update |
| Quota / Limit reached | Monthly limit used up |
| Template | Ready-made message |
| Campaign | Group message |
| Opt-out / Unsubscribe | Do not contact |
| WhatsApp Bridge / Session / QR pairing | Link your WhatsApp (scan the code with your phone) |
| WhatsApp Cloud API | Official WhatsApp Business |
| Provider | Service |
| Authentication / Login failed | Sign in / Wrong email or password |
| Invalid input / Validation error | Please check this field |
| Request failed / Timeout | Something went wrong. Please try again |
| Soft delete / Restore | Moved to bin / Bring back |
| Super Admin | Owner panel |
| Subscription / Plan limit | Your plan |

### 15.3 Examples

| Bad (technical) | Good (simple) |
|---|---|
| "Webhook delivery failed (HTTP 502)" | "We could not reach your website form. Please check the link and try again." |
| "Duplicate lead detected: place_id exists" | "This business is already in your list." |
| "Quota exceeded for discovery searches" | "You have used all your searches for this month. Upgrade your plan to search more." |
| "WhatsApp session disconnected" | "Your WhatsApp is not linked right now. Tap here and scan the code again." |
| "Import failed: invalid CSV schema" | "We could not read this file. Please use our sample Excel sheet." |

### 15.4 For the AI coding agent
- Before building each screen, list its labels and messages and check them against this guide.
- Never copy a database field name, API field name or developer term into a label. Create a friendly label for it.
- Any new term must be added to the word list above through a Change Proposal (Section 1.1).
