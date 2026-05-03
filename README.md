# Analyst Sharpener

**AI-powered interview prep system for data analyst candidates.** Practice SQL, Excel, Tableau, Python, and business intelligence skills with live AI grading across five industry domains.

**[Live Demo →](https://analyst-sharpener.vercel.app)** · [GitHub](https://github.com/jaket050/analyst-sharpener)

---

## What It Does

Analyst Sharpener trains the skills interviewers actually test — not just SQL syntax, but the analytical judgment that separates a $55K reporting analyst from an $85K business analyst.

The app has two layers:

**Technical Skills** — SQL, Excel, Tableau, Python practice with AI-graded answer checking. Organized by domain pack (Boeing/Aviation, Retail/Operations, Healthcare/MSPB) so your practice matches the roles you're targeting.

**Business Intelligence (Intel Module)** — Four modes that train the reasoning layer above technical skills:

| Mode | What It Trains | Content |
|------|---------------|---------|
| 📖 KPI Library | Metric fluency with decision context | 90 cards × 5 domains |
| 📊 Dashboard Drill | 60-second visual reading under pressure | 5 drills × 5 domains |
| 🧩 Problem to Metric | Translating business problems into diagnostic KPIs | 38 scenarios × 5 domains |
| 💡 Insight & Rec | Turning findings into actionable recommendations with VP pitches | 32 scenarios × 5 domains |

---

## Why This Exists

Most DA candidates can write SQL. Few can walk into an interview and answer:

> *"Our conversion rate dropped 18% last week. How would you investigate?"*

...with the diagnostic structure, KPI vocabulary, and recommendation framing that hiring managers expect at the $75-85K tier.

Analyst Sharpener drills that specific skill gap — across five domains (Retail/E-commerce, Healthcare, Finance, Operations/Supply Chain, Marketing) — through AI-graded practice that gives feedback calibrated to senior-analyst standards, not generic "good job."

---

## AI Grading Philosophy

Every mode uses live Claude API calls to grade answers against a gold-standard senior-analyst benchmark.

The grading system is designed to be **discriminating, not generous**. Specifically, it targets four failure modes that separate junior from senior analyst answers:

1. **Stopping at description instead of prescription** — naming what happened vs. saying what to do
2. **Recommendations that aren't actionable** — "improve the experience" vs. a specific intervention with timing and mechanism
3. **Missing the tradeoff** — every recommendation has a cost; junior analysts forget to name it
4. **No measurement plan** — a recommendation without success criteria is a guess

The grader returns structured scores per dimension with specific feedback on what was missed and how a senior analyst would have framed it.

---

## Tech Stack

| Layer | Tool |
|-------|------|
| Frontend | React 18 + Vite |
| Styling | Inline styles with a dark-mode design system |
| Charts | Inline SVG (no external chart library) |
| AI Grading | Anthropic Claude API (direct browser access, user-provided key) |
| Hosting | Vercel (CI/CD via GitHub) |
| Version Control | GitHub |

**Architecture decisions worth noting:**

- **Content is bundled, not API-fetched.** KPI cards, dashboard scenarios, and problem sets live in the React bundle. This makes the app load instantly without API cost. The API is reserved for what AI uniquely adds: live answer grading.
- **No backend required.** The app is fully client-side. Users provide their own Anthropic API key at runtime — it lives only in React state, never in the codebase or any server.
- **Single-file architecture.** The entire app ships as one App.jsx for simplicity and portability. A future refactor will move the API key server-side via Vercel edge functions.

---

## Domains Covered

**Retail / E-commerce** — Conversion rate, AOV, CAC, LTV, cart abandonment, inventory turnover, return rate, ROAS, email list health, checkout funnel analysis.

**Healthcare** — Readmission rates, ALOS, HEDIS compliance, revenue cycle (Days in AR, denial rates, net collection), patient satisfaction (HCAHPS), OR utilization, population health risk scores.

**Finance** — ROE, EPS, P/E, EBITDA, free cash flow, working capital, NRR, LTV:CAC, WACC, credit metrics, SaaS unit economics.

**Operations / Supply Chain** — OTD, OEE, perfect order rate, TRIR, forecast accuracy (MAPE), cash-to-cash cycle, supplier performance, labor productivity, cost per order.

**Marketing** — ROAS, attribution, email deliverability, CPL, MQL-to-SQL conversion, SEO organic traffic, brand awareness lift, influencer ROI, share of voice.

---

## Running Locally

```bash
git clone https://github.com/jaket050/analyst-sharpener.git
cd analyst-sharpener
npm install
npm run dev
```

Open `http://localhost:5173` in your browser. Enter your Anthropic API key in the activation banner to enable AI grading.

You'll need an [Anthropic API key](https://console.anthropic.com) for the AI grading features. The key stays in your browser session only — it is never stored or transmitted to any server other than Anthropic's API.

---

## What's Next

- **Mode 2 v2** — Expand Dashboard Drills from 5 to 25 (5 per domain)
- **Vercel edge function** — Move API key server-side so the app is usable without a personal key
- **Supabase persistence** — Cross-session weak queue and progress tracking
- **Mode 5** — SQL case studies: real schema + real business question + AI-graded query review

---

## About

Built as both a job search tool and a portfolio project during an active DA job search targeting Retail, Healthcare, Finance, and Operations roles at the $72-85K remote tier.

The app is self-maintained and in active development. Each new mode is shipped to production via the GitHub → Vercel CI/CD pipeline documented in the commit history.
