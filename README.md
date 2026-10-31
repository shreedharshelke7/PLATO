# PLATO / Ambrosia 🏛️ — "Fuel Like a God"

> A production-ready, local-first nutrition & hydration progressive web application (PWA) upgraded with an **Obsidian & Aurum luxury palette**, a **cinematic philosopher scroll experience**, **local-first Supabase cloud synchronization**, and **tiered Gemini 2.5 Flash AI vision**. Grounded in empirical college Community Engagement Program (CEP) research from Pune, India.

---

## 🏛️ 1. High-Level Architecture

Ambrosia is architected as an **offline-first, cloud-synchronized** progressive web application. Dexie (IndexedDB) acts as the single source of truth for all client-side UI rendering, while background synchronization transparently mirrors modifications to Supabase PostgreSQL when an account is connected.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER (Next.js 16)                       │
│                                                                        │
│   Obsidian & Aurum Design System (WCAG AA Certified)                   │
│   Cinematic Academy of Ambrosia (Lenis + Framer Motion + Web Speech)   │
│   Reactive UI Hooks (Zustand + Dexie React Hooks)                      │
└─────────────────────────────────┬──────────────────────────────────────┘
                                  │ Direct Sub-millisecond Reads & Writes
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   LOCAL STORAGE LAYER (IndexedDB / Dexie v3)           │
│                                                                        │
│   • Database per user: `ambrosia-guest` or `ambrosia-${userId}`        │
│   • Version 3 Schema: Multiple health goals (`goals` table) with sync  │
│   • Automatic Legacy v1/v2 profile targets migration to active goal    │
│   • Strictly local secrets: userApiKey is never sent to cloud          │
└─────────────────────────────────┬──────────────────────────────────────┘
                                  │ Debounced (1.5s) / Online / Tab-focus
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 BIDIRECTIONAL SYNC ENGINE (Local-First)                │
│                                                                        │
│   • Push: Local changes since lastSyncAt -> Supabase `user_data`       │
│   • Pull: Remote changes since lastSyncAt -> Dexie tables              │
│   • Conflict Resolution: Deterministic Last-Write-Wins (LWW)           │
│   • Status Indicators: Synced, Syncing, Offline, Error Retry           │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │ RLS Policy (auth.uid() = user_id)│
                   ▼                                 ▼
┌──────────────────────────────────────┐ ┌───────────────────────────────┐
│       SUPABASE POSTGRESQL CLOUD      │ │   GEMINI 2.5 FLASH AI PIPELINE│
│                                      │ │                               │
│  • Row-Level Security (RLS)          │ │ • Vision Food Plate Scanner   │
│  • `user_data` JSONB table           │ │ • Dionysus Divine Swap Engine │
│  • Touch trigger for `updated_at`    │ │ • Athena Strategic AI Coach   │
│  • Google OAuth + Magic Link Auth    │ │ • Tiered Abuse Limit Engine   │
└──────────────────────────────────────┘ └───────────────────────────────┘
```

---

## 🔑 2. Environment Variables Reference

Ambrosia gracefully degrades when API keys or credentials are not provided. The entire food database, manual logging, water amphora, and theme systems operate 100% offline without any keys.

| Variable | Type | Required? | Example Value | Description |
|---|---|---|---|---|
| `GROQ_API_KEY` | String | Optional | `gsk_...` | Free ultra-fast Groq LPU API key for Llama 3.2 11B Vision meal scanning and Llama 3.3 70B Athena coaching. |
| `GEMINI_API_KEY` | String | Optional | `AIzaSyD...` | Optional Google Gemini Flash API key for vision and text fallbacks. |
| `GEMINI_MODEL` | String | Optional | `gemini-1.5-flash` | The Gemini model identifier. Defaults to `gemini-1.5-flash`. |
| `NEXT_PUBLIC_SUPABASE_URL` | String | Optional | `https://xyz.supabase.co` | Your Supabase project URL. If omitted, app runs in standalone guest mode. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | String | Optional | `eyJhbGciOi...` | Supabase public anonymous API key for browser client authentication & sync. |

> **Security Mandate**: Never prefix `GROQ_API_KEY` or `GEMINI_API_KEY` with `NEXT_PUBLIC_`. Keys are strictly invoked inside server route handlers (`/api/scan`, `/api/swap`, `/api/coach`, `/api/plan`, `/api/parse-meal`). Users may also supply their own key in **Settings**, stored strictly in local IndexedDB.

---

## ⚡ 3. Core Features & Research Origin

Ambrosia originated from an empirical **Community Engagement Program (CEP)** study (*"Analysing Eating Habits & Food Choices"*, 50 respondents in Pune, India, ages 18–25):
* **80% eat fast food for taste**
* **50% cite lack of time** as their primary obstacle
* **Only 38% eat breakfast daily**
* **Only 34% eat fruits & vegetables daily**
* **64% are actively willing to transform their diet**

### Key Capabilities
1. **Multiple Health Goals ("My Goals")**: Create, fine-tune, switch between, or archive multiple concurrent health goals (Fat Loss, Muscle Gain, Maintenance, Endurance, Longevity, General Wellness) directly inside the app. No forced onboarding wizard upon signup or login. Zero-goal state runs immediately on standard adult defaults (2,000 kcal, 60g protein, 25g fiber, 2,500ml water) with an interactive top-bar goal switcher.
2. **Divine Swap (Dionysus)**: Alchemical fast-food replacer that generates 3 high-protein, high-fiber alternatives under 10 minutes matching the taste profile of cravings (samosas, pizza, Maggi, street food).
3. **Weekly Junk Budget**: Guilt-free treat budgeting without shaming.
4. **Indian Food Intelligence**: 125+ regional Indian foods with portion sizing in katoris, rotis, and pieces.
5. **Cinematic Landing Page ("The Academy of Ambrosia")**: 10 scroll-pinned scenes featuring 6 original Greek philosopher line-art SVGs (Plato, Aristotle, Socrates, Epicurus, Pythagoras, Heraclitus) with spoken Delphic maxims via the Web Speech API and gold dust particles.
6. **Obsidian & Aurum Luxury System**: Dark luxury basalt with Aurum gold (`#D4AF37`), Ivory text, and five dynamic themes (`obsidian`, `marble`, `aegean`, `amethyst`, `auto`), with verified WCAG AA contrast.
7. **Tiered AI Abuse Protection**:
   * Guests: 5 scans/day per IP with friendly HTTP 429 sign-in prompt.
   * Signed-in accounts: High burst allowances.
   * Personal API keys (`x-user-key`): Unlimited usage bypassing server quotas.

---

## 🛠️ 4. Local Development Setup

### 1. Clone & Install
```bash
git clone <repository-url>
cd ambrosia
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your credentials:
```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Verification Suite
Run the rigorous verification suite before starting development:
```bash
# 1. Run all unit tests (Contrast ratios, redirect safety, LWW sync, nutrition targets)
npm test

# 2. Run ESLint (Strict Next.js & React 19 standards)
npm run lint

# 3. Type check
npx tsc --noEmit

# 4. Production build test
npm run build
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ 5. Supabase Setup Guide

### 1. Create a Supabase Project
1. Log in to [supabase.com](https://supabase.com) and create a new project.
2. Note your **Project URL** and **anon public API Key** under **Settings → API**.

### 2. Execute Database Schema & RLS Policies
Navigate to the **SQL Editor** in your Supabase dashboard and execute the contents of `supabase/schema.sql`:

```sql
-- Ambrosia PLATO V2 Cloud Sync Schema for Supabase
create table if not exists public.user_data (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  table_name text not null,
  record_id text not null,
  payload jsonb not null,
  client_updated_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted boolean not null default false,
  unique (user_id, table_name, record_id)
);

alter table public.user_data enable row level security;

create policy "select own" on public.user_data for select using ((select auth.uid()) = user_id);
create policy "insert own" on public.user_data for insert with check ((select auth.uid()) = user_id);
create policy "update own" on public.user_data for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "delete own" on public.user_data for delete using ((select auth.uid()) = user_id);

create index if not exists user_data_sync_idx on public.user_data (user_id, updated_at);
create index if not exists user_data_lookup_idx on public.user_data (user_id, table_name, record_id);

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists user_data_touch on public.user_data;
create trigger user_data_touch before insert or update on public.user_data
for each row execute function public.touch_updated_at();
```

### 3. Configure Google OAuth (Optional)
1. Go to the [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services → Credentials**.
2. Create an **OAuth 2.0 Client ID** (Web application).
3. Under **Authorized redirect URIs**, add your Supabase Auth callback URI:
   `https://<your-project-ref>.supabase.co/auth/v1/callback`
4. Copy the **Client ID** and **Client Secret**.
5. In Supabase Dashboard, go to **Authentication → Providers → Google**, enable the provider, paste your Client ID and Client Secret, and save.
6. Under **Authentication → URL Configuration**, add your application site URL (e.g. `http://localhost:3000` for local or `https://your-domain.vercel.app` for production).

---

## 🚢 6. Production Deployment Guide

### Deploying to Vercel (Recommended)
1. Push your code to GitHub, GitLab, or Bitbucket.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. In **Settings → Environment Variables**, add:
   * `GEMINI_API_KEY`: Your Gemini API key.
   * `GEMINI_MODEL`: `gemini-1.5-flash`
   * `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL.
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key.
4. Click **Deploy**. Vercel will build and deploy the app with automatic edge caching and PWA service workers.

### Deploying to Netlify
1. Connect your repository to [Netlify](https://app.netlify.com).
2. Set **Build command** to `npm run build` and **Publish directory** to `.next`.
3. Add the `@netlify/plugin-nextjs` plugin if prompted.
4. Configure the environment variables (`GEMINI_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).

---

## 🩺 7. Medical & Nutritional Advisory

Ambrosia provides lifestyle, motivational, and educational tracking grounded in Mifflin-St Jeor metabolic equations. It is not clinical diagnostic software.
* **Safety Caloric Floors**: Enforces minimum daily thresholds of 1,500 kcal for biological males and 1,200 kcal for biological females.
* **Adolescent & Underweight Guards**: Minors (<18 years) and users with BMI < 18.5 are barred from aggressive weight-loss protocols and advised to consult clinical health practitioners.

---

## 📜 8. License

MIT License. Developed for the Community Engagement Program (CEP) research initiative.
