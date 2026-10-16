# PLATO / Ambrosia 🏛️ — "Fuel Like a God"

> A production-grade, local-first nutrition & hydration progressive web application (PWA) inspired by ancient Greek deities and grounded in real-world public health research.

---

## 🏛️ 1. Project Overview & Research Origin

Ambrosia was conceived and engineered as the practical translation of an empirical college **Community Engagement Program (CEP)** research study: *"Analysing Eating Habits & Food Choices"* (50 respondents, Pune, India, primarily students & young adults aged 18–25).

### Empirical Survey Findings
* **80% eat fast food for taste and comfort**, regardless of nutritional awareness.
* **50% cite lack of time and exhausting schedules** as their principal barrier to healthy eating.
* **Only 38% consume breakfast daily**, leading to mid-day energy crashes and cravings.
* **Only 34% eat fruits and vegetables daily**.
* **64% are motivated and actively willing to transform their diet** if solutions respect their taste and busy lives.

---

## ⚡ 2. The Core Differentiators

### 🍇 1. The Divine Swap (Governed by Dionysus)
Traditional diet apps scold users for craving pizza, samosas, or Maggi noodles. Ambrosia rejects moralizing diet culture:
* **Taste-First Formulation**: Enter any junk food craving and receive **3 realistic, rapid swaps** (prepared in <10 minutes) that maintain the savory or sweet taste profile.
* **Macro Delta Breakdown**: Clear comparisons showing exact caloric deficits, protein boosts, and fiber gains.
* **Weekly Junk Budget**: Users configure their weekly treat allowance (e.g., 3 treats/week). If you choose to eat the original junk food, Ambrosia logs it against your budget with zero shame.

### 🍛 2. Authentic Indian Food System
* Bundled local food database featuring 125+ authentic Indian dishes (dal tadka, roti, phulka, paneer bhurji, poha, idli sambar, masala dosa, biryani, street chaat) alongside global staples.
* Natural portion sizing in culturally intuitive units: **katori, roti, pieces, bowls, and grams**.
* Offline-first NLP free-text parsing ("2 phulkas and a katori of dal").

### 🛡️ 3. Absolute Privacy & Local-First Architecture
* **Zero Mandatory Login**: All profile targets, meal logs, water intervals, and weight data live directly on the user's device in **IndexedDB (via Dexie)**.
* **Custom API Key Support**: Users can supply their own Google Gemini API key in Settings, persisted strictly in local IndexedDB and dispatched via the `x-user-key` header to server route handlers. Keys are never logged or stored on any central server.

---

## 🎨 3. Design System: Greek Gods & Dynamic Themes

Ambrosia is styled around 7 Olympian deities, each governing a specific functional domain:
* ⚡ **Zeus**: Throne room dashboard and daily Power Ring (caloric energy balance).
* 🌾 **Demeter**: AI plate scanner and seasonal harvest meal log.
* 🔱 **Poseidon**: Hydration tracking, amphora wave animations, and harmonic interval schedule.
* 🪽 **Hermes**: Rapid quick-log shortcuts and meal presets.
* 🦉 **Athena**: Strategic AI Coach, 1-Day Blueprints, and 5-minute kitchen solver.
* 🏹 **Apollo**: Oracle progress analytics, weight trends, macro donuts, and streaks.
* 🍇 **Dionysus**: Divine Swap alchemy and weekly Junk Budget.

### Dynamic Deity Themes
* `olympus` (Light): White marble textures, gold accents, and sky blue.
* `poseidon` (Dark): Deep oceanic navy with aqua luminescent glow.
* `nyx` (Dark): Near-black celestial purple with starlight silver.
* `athena` (Muted): Ash slate, olive greens, and bronze owl-gold.
* `auto` (Default Circadian): Automatically harmonizes with local solar time (06:00–17:00 Olympus, 17:00–20:00 Athena, 20:00–06:00 Nyx). An inline anti-FOUC script guarantees zero flash of unstyled theme on cold boot.

---

## 🛠️ 4. Technology Stack

* **Framework**: Next.js 16 (App Router with Turbopack), React 19 (Cache Components & Strict Mode).
* **Language**: TypeScript (strict mode enabled with zero `any` compromises).
* **Styling**: Tailwind CSS v4 with dynamic CSS variables and marble gradients.
* **Animation**: Framer Motion scroll reveals, spring transitions, and interactive cards.
* **Local-First Database**: Dexie (IndexedDB wrapper) with reactive `dexie-react-hooks`.
* **State Management**: Zustand & Dexie live queries.
* **Typography**: Google Fonts via `next/font` — **Cinzel** (headings) & **Inter** (body).
* **Charts**: Recharts (Weight trendlines with goal reference, macro distribution donut).
* **Vision & NLP**: `@google/genai` Gemini 2.5 Flash SDK executed **strictly** in Next.js server route handlers.
* **Barcode Scanner**: `@zxing/browser` camera stream with Open Food Facts API integration.
* **Audio**: Native Web Audio API harmonic celestial chime (zero external audio file dependencies).
* **PWA**: Web App Manifest, Service Worker offline caching (`/sw.js`), and dynamic icon generation (`icon-192.png`, `icon-512.png`).

---

## 🚀 5. Getting Started

### Prerequisites
* Node.js 18.18+ or 20+
* npm, pnpm, or yarn

### 1. Installation
Clone the repository and install dependencies:
```bash
cd ambrosia
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root directory:
```bash
cp .env.example .env.local
```
Add your Google Gemini API Key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```
> *Note:* The application compiles and runs seamlessly even without an API key! Manual food database search and local logging function completely offline.

### 3. Verification Suite
Verify type-safety, linting rules, and mathematical targets:
```bash
# Run Vitest unit tests (BMR, TDEE, Safety Floors, Food Search)
npm test

# Run ESLint (React 19 & Next.js 16 compiler standards)
npm run lint

# Run strict TypeScript verification
npx tsc --noEmit

# Test production build
npm run build
```

### 4. Development Server
Run the local development server:
```bash
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000) to view Ambrosia.

---

## 🚢 6. Deployment Guide

### Deploying to Vercel (Recommended)
1. Push your repository to GitHub / GitLab / Bitbucket.
2. Import the project into the [Vercel Dashboard](https://vercel.com/new).
3. Under **Environment Variables**, configure:
   * `GEMINI_API_KEY`: Your Gemini API key.
   * `GEMINI_MODEL`: `gemini-2.5-flash`
4. Click **Deploy**. Vercel will automatically run `npm run build` and provision serverless edge functions for the API routes.

### Deploying to Netlify
1. Connect your repository to [Netlify](https://app.netlify.com).
2. Set the build command to `npm run build` and publish directory to `.next`.
3. Install the Netlify Next.js runtime plugin (`@netlify/plugin-nextjs`).
4. Add `GEMINI_API_KEY` and `GEMINI_MODEL` to your site settings environment variables.

---

## 🩺 7. Medical & Nutritional Advisory

Ambrosia is designed strictly for lifestyle, educational, and motivational tracking. It does not replace medical advice, clinical diagnosis, or individualized treatment plans from a certified dietitian or physician.
* **Safety Floors Enforced**: Strict caloric minimums of 1,500 kcal (males) and 1,200 kcal (females).
* **Underage & Underweight Protection**: Minors (<18 years) and individuals with BMI < 18.5 are prohibited from selecting fat-loss protocols and receive guidance to consult a medical professional.

---

## 📜 8. License & Attribution

Designed and developed for the college **Community Engagement Program (CEP)** research initiative. Licensed under the MIT License.
