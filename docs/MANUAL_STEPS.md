# GINIE — Manual Setup Steps (Dashboard-Only Actions)

Per Section 1.2, all development, database operations, and deployment tasks are executed CLI-first. However, certain actions can only be performed manually via third-party web dashboards. This document tracks those exact steps.

---

## 1. Supabase (Managed PostgreSQL & Storage)

1. **Create Project:**
   - Go to [Supabase Dashboard](https://supabase.com/dashboard).
   - Click **New project**, name it `ginie-prod` (or `ginie-dev`).
   - Region: Select **Mumbai (ap-south-1)**.
   - Choose a secure database password and save it in a password manager.
2. **Obtain Connection Strings:**
   - Under **Project Settings -> Database**:
     - Copy the **Connection pooling (Transaction mode, port 6543)** string -> Set as `DATABASE_URL`.
     - Copy the **Direct connection (port 5432)** string -> Set as `DIRECT_URL`.
3. **Obtain Storage API Keys:**
   - Under **Project Settings -> API**:
     - Copy `URL` -> Set as `SUPABASE_URL`.
     - Copy `service_role` (secret) key -> Set as `SUPABASE_SERVICE_ROLE_KEY` (never expose to frontend).

---

## 2. Google Cloud Platform (Places API New)

1. **Create / Select Project:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/).
   - Create a project named `ginie-crm`.
2. **Enable Places API (New):**
   - Navigate to **APIs & Services -> Library**.
   - Search for **Places API (New)** and click **Enable**.
3. **Generate API Key:**
   - Go to **APIs & Services -> Credentials**.
   - Click **Create Credentials -> API Key**.
   - Click **Edit API Key** and set application / API restrictions to **Places API (New)** only.
   - Set key as `GOOGLE_PLACES_API_KEY` in `.env`.
4. **Set Budget Alerts:**
   - Navigate to **Billing -> Budgets & alerts** and set a monthly spending alert to protect against cost overruns.

---

## 3. Cloudflare (DNS, SSL, CDN)

1. **Add Site:**
   - Add domain `ginie.space` to Cloudflare.
2. **Configure SSL/TLS:**
   - Set encryption mode to **Full (strict)**.
   - Generate an Origin Certificate under **SSL/TLS -> Origin Server** and install it on the VPS reverse proxy (Caddy / Nginx).
3. **DNS Records:**
   - A record: `@` -> VPS Public IP (Proxied / Orange Cloud enabled).
   - CNAME record: `www` -> `ginie.space` (Proxied).
   - Wildcard A or CNAME: `*.ginie.space` -> for optional tenant subdomains (Proxied).

---

## 4. Meta for Developers (WhatsApp Business Cloud API — Phase 2)

1. **Create Meta App:**
   - Go to [Meta for Developers](https://developers.facebook.com/).
   - Create an app of type **Business**.
   - Add **WhatsApp** product.
2. **Obtain Credentials:**
   - Copy Phone Number ID -> `WHATSAPP_PHONE_NUMBER_ID`.
   - Generate System User Permanent Access Token -> `WHATSAPP_ACCESS_TOKEN`.
   - Set a webhook verify token -> `WHATSAPP_VERIFY_TOKEN`.
