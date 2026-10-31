# GINIE — Multi-Tenant CRM SaaS

> **Your smart CRM genie — discover leads, close deals.**  
> Target domain: [https://ginie.space](https://ginie.space)

---

## Overview

GINIE is a multi-tenant, multi-industry CRM Web Application built with:
- **Frontend:** Next.js (TypeScript) + Ant Design (antd v5) + ProComponents
- **Backend:** Node.js + NestJS (TypeScript)
- **Database:** Supabase (Managed PostgreSQL in Mumbai `ap-south-1`) + Prisma ORM
- **Queue / Background Jobs:** `pg-boss` (PostgreSQL-backed queue, no Redis dependency)
- **Lead Discovery:** Google Places API (New) Text Search
- **WhatsApp Outreach:** Pluggable WhatsApp interface (Official Cloud API + Baileys bridge container with human-like delayed auto-reply)
- **Deployment:** Docker on VPS behind Caddy/Nginx reverse proxy, protected by Cloudflare

---

## Plain-Language Philosophy

Everything visible to the user in GINIE uses simple, everyday language without technical jargon.
- **Potential customers** instead of *Leads*
- **Find new customers** instead of *Lead Discovery*
- **Sales steps / Board view** instead of *Pipeline / Kanban*
- **Company** instead of *Tenant / Organization*
- **Extra details** instead of *Custom fields*
- Fully localized in **English** and **Hindi**.

---

## Documentation & Permanent Memory

All architectural choices, implementation plans, and ongoing logs are strictly committed to the repository:
- `GINIE.md`: Master specification
- `docs/IMPLEMENTATION_PLAN.md`: Approved phase-wise milestones, database order, API outline, and test strategy
- `docs/PROJECT_STATE.md`: Current execution status, next steps, and blockers
- `docs/DECISIONS.md`: Append-only Architectural Decision Records (ADRs)
- `docs/CHANGELOG.md`: Append-only history of every change proposal and commit
- `docs/MANUAL_STEPS.md`: Checklist of actions requiring web dashboards

---

## Quick Start (Local Development)

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment variables
cp .env.example .env
# Edit .env with your Supabase database URL and Google Places API key

# 3. Run Prisma migrations and seed database
npm run db:migrate
npm run db:seed

# 4. Start all development services
npm run dev
```
